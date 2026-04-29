#!/bin/bash
# ============================================================================
# deploy-prod-post.sh
# ----------------------------------------------------------------------------
# Operations post-deploy a executer APRES `bash scripts/deploy-prod.sh`.
#
# Ce que deploy-prod.sh fait deja (rsync staging -> prod) :
#   - Code (kadence-child, plugins inaricom-core, mu-plugins/inaricom-rest-lightweight.php)
#   - Theme + plugins WP
#
# Ce que deploy-prod.sh ne fait PAS (geree ici) :
#   1. Sync des 5 logos repaintes (uploads/ exclu du rsync par design)
#   2. Patch DB snippet 347 (bouton bleu : texte noir -> blanc)
#   3. Creation page /a-propos/ avec [inari_island name="about"]
#   4. Update page /contact/ avec [inari_island name="contact"]
#   5. Restructure menu : Intelligence Artificielle (parent) + Boutique (child)
#                       + Articles (parent) + 7 categories (children)
#   6. Flush cache WP + reset OPcache
#   7. Smoke test des 3 nouvelles URLs (/a-propos/, /contact/, /accueil-ia/)
#
# IMPORTANT : ce script attend que deploy-prod.sh soit deja passe avec succes.
#             Il fait des operations DB sur la prod : commits idempotents
#             autant que possible (skip si deja fait).
#
# Usage:
#   bash scripts/deploy-prod-post.sh [--dry-run]
# ============================================================================

set -euo pipefail

SSH_HOST="inaricom"
PROD_PATH="/home/toriispo/inaricom.com/web"
STAGING_PATH="/home/toriispo/inaricom.com/web-staging"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DRY_RUN=""
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

for arg in "$@"; do
    case $arg in
        --dry-run) DRY_RUN="1" ;;
        --help|-h) grep -E '^#' "$0" | head -40; exit 0 ;;
    esac
done

echo "================================================================"
echo "  POST-DEPLOY PROD : logos + DB ops + menu"
echo "  Target: $SSH_HOST:$PROD_PATH"
[[ -n "$DRY_RUN" ]] && echo "  Mode: DRY RUN"
echo "================================================================"

# ============================================================================
# Prerequis : verifier que le code est deja deploye
# ============================================================================
echo ""
echo "=== 0. Pre-flight ==="
WPFORMS_VERIFY=$(ssh "$SSH_HOST" "[ -f $PROD_PATH/wp-content/plugins/inaricom-core/src/Contact/ContactEndpoint.php ] && echo OK || echo MISSING")
if [[ "$WPFORMS_VERIFY" != "OK" ]]; then
    echo "ECHEC: ContactEndpoint.php absent en prod. Lance d'abord deploy-prod.sh."
    exit 1
fi
echo "   ContactEndpoint.php : OK"

MU_VERIFY=$(ssh "$SSH_HOST" "[ -f $PROD_PATH/wp-content/mu-plugins/inaricom-rest-lightweight.php ] && echo OK || echo MISSING")
if [[ "$MU_VERIFY" != "OK" ]]; then
    echo "ECHEC: mu-plugin absent en prod. Verifie le rsync du deploy."
    exit 1
fi
echo "   mu-plugin REST lightweight : OK"

# ============================================================================
# 1. Sync des 5 logos repaintes (cyan -> royal blue)
# ============================================================================
echo ""
echo "=== 1. Sync 5 logos bleus repaintes ==="
LOGOS=(
    "Design-sans-titre-13.png"
    "Design-sans-titre-13-100x100.png"
    "Design-sans-titre-13-150x126.png"
    "Design-sans-titre-13-300x109.png"
    "Design-sans-titre-13-300x126.png"
)
for f in "${LOGOS[@]}"; do
    if [[ -n "$DRY_RUN" ]]; then
        echo "   [DRY] would copy $f"
    else
        # Backup le fichier prod actuel
        ssh "$SSH_HOST" "cp $PROD_PATH/wp-content/uploads/2026/01/$f $PROD_PATH/wp-content/uploads/2026/01/$f.cyan-backup-$TIMESTAMP 2>/dev/null || true"
        # Copy depuis staging
        ssh "$SSH_HOST" "cp $STAGING_PATH/wp-content/uploads/2026/01/$f $PROD_PATH/wp-content/uploads/2026/01/$f"
        echo "   $f : OK"
    fi
done

# ============================================================================
# 2. Patches DB snippets 347 + 684 (cyan -> royal blue)
# ============================================================================
echo ""
echo "=== 2a. Patch snippet 347 (bouton bleu texte blanc) ==="
PATCH_347="$REPO_ROOT/scripts/wp-db-patches/patch_347_bleu_buttons.php"
if [[ ! -f "$PATCH_347" ]]; then
    echo "ECHEC: patch script absent localement: $PATCH_347"
    exit 1
fi

if [[ -n "$DRY_RUN" ]]; then
    echo "   [DRY] would scp + wp eval-file patch_347_bleu_buttons.php"
else
    scp "$PATCH_347" "$SSH_HOST:/tmp/patch_347_bleu_buttons.php"
    ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp eval-file /tmp/patch_347_bleu_buttons.php" 2>&1 | tail -8
fi

echo ""
echo "=== 2b. Desactivation snippets dead-code 684 + 740 ==="
# Snippet 684 (Pages Legales CSS) : devenu dead code apres migration des
# 7 pages footer en island legal (chaque page rend son propre styling).
# Snippet 740 (WPForms style) : devenu dead code apres bypass WPForms sur
# /contact/ (zero usage de [wpforms ...] dans le site verifie).
# On desactive les deux pour eviter le flicker (CSS legacy applique avant
# que React monte et override).

if [[ -n "$DRY_RUN" ]]; then
    echo "   [DRY] would deactivate snippets 684 + 740"
else
    ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp eval '
foreach ([684, 740] as \$pid) {
  \$post = get_post(\$pid);
  if (!\$post) { echo \"\$pid : NOT FOUND\\n\"; continue; }
  update_post_meta(\$pid, \"_active\", \"no\");
  wp_update_post([\"ID\" => \$pid, \"post_status\" => \"draft\"]);
  \$file = WP_CONTENT_DIR . \"/uploads/custom-css-js/\" . \$pid . \".css\";
  if (file_exists(\$file)) {
    rename(\$file, \$file . \".disabled-\" . date(\"Ymd-His\"));
    echo \"\$pid.css renamed -> .disabled\\n\";
  }
  echo \"Snippet \$pid : status=\" . get_post_status(\$pid) . \" _active=\" . get_post_meta(\$pid, \"_active\", true) . \"\\n\";
}
' 2>&1 | tail -10"
fi

# ============================================================================
# 3. Page /a-propos/ : create si absente, update sinon
# ============================================================================
echo ""
echo "=== 3. Page /a-propos/ ==="
ABOUT_ID=$(ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp post list --post_type=page --post_status=publish --name=a-propos --field=ID --format=ids 2>/dev/null" | tr -d '[:space:]' | head -c 10)

if [[ -n "$DRY_RUN" ]]; then
    echo "   [DRY] would create or update /a-propos/"
elif [[ -z "$ABOUT_ID" ]]; then
    NEW_ID=$(ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp post create --post_type=page --post_status=publish --post_title='A propos' --post_name='a-propos' --post_content='[inari_island name=\"about\"]' --porcelain")
    echo "   Cree page /a-propos/ ID=$NEW_ID"
    ABOUT_ID=$NEW_ID
else
    ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp post update $ABOUT_ID --post_content='[inari_island name=\"about\"]' 2>&1 | tail -1"
    echo "   Update page /a-propos/ ID=$ABOUT_ID"
fi

# ============================================================================
# 4. Page /contact/ : update content (retirer WPForms shortcode si present)
# ============================================================================
echo ""
echo "=== 4. Page /contact/ ==="
CONTACT_ID=$(ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp post list --post_type=page --post_status=publish --name=contact --field=ID --format=ids 2>/dev/null" | tr -d '[:space:]' | head -c 10)
if [[ -z "$CONTACT_ID" ]]; then
    echo "ATTENTION: page /contact/ introuvable. Skip."
elif [[ -n "$DRY_RUN" ]]; then
    echo "   [DRY] would update /contact/ (ID=$CONTACT_ID)"
else
    ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp post update $CONTACT_ID --post_content='[inari_island name=\"contact\"]' 2>&1 | tail -1"
    echo "   Update page /contact/ ID=$CONTACT_ID"
fi

# ============================================================================
# 4b. Pages legales : sauvegarde contenu original + replace par island
# ============================================================================
echo ""
echo "=== 4b. Pages legales (7 pages -> island legal) ==="
LEGAL_SLUGS=(mentions-legales privacy-policy refund-policy terms-of-service-2 acceptable-use-policy cookie-policy help-faq)
if [[ -n "$DRY_RUN" ]]; then
    for slug in "${LEGAL_SLUGS[@]}"; do
        echo "   [DRY] would migrate /$slug/ to legal island"
    done
else
    # Idempotent : sauvegarde le contenu original dans _legal_original_content
    # uniquement si pas deja fait, puis remplace post_content par le shortcode.
    ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp eval '
\$slugs = [\"mentions-legales\", \"privacy-policy\", \"refund-policy\", \"terms-of-service-2\", \"acceptable-use-policy\", \"cookie-policy\", \"help-faq\"];
foreach (\$slugs as \$slug) {
  \$page = get_page_by_path(\$slug);
  if (!\$page) { echo \"\$slug : NOT FOUND\\n\"; continue; }
  // Si le contenu actuel est deja le shortcode island, skip
  if (trim(\$page->post_content) === \"[inari_island name=\\\"legal\\\"]\") {
    echo \"\$slug : deja migre, skip\\n\";
    continue;
  }
  // Sauvegarde du contenu original dans meta (idempotent : ne ecrase pas)
  if (!get_post_meta(\$page->ID, \"_legal_original_content\", true)) {
    update_post_meta(\$page->ID, \"_legal_original_content\", \$page->post_content);
  }
  wp_update_post([\"ID\" => \$page->ID, \"post_content\" => \"[inari_island name=\\\"legal\\\"]\"]);
  echo \"\$slug (ID=\" . \$page->ID . \") -> island legal\\n\";
}
' 2>&1 | tail -10"
fi

# ============================================================================
# 5. Menu : Intelligence Artificielle parent + Boutique child + Articles + categories
# ============================================================================
echo ""
echo "=== 5. Menu restructure (idempotent) ==="

# Menu Principal ID (par convention sur staging = 21, mais a re-resoudre sur prod)
MENU_ID=$(ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp menu list --fields=term_id,name --format=csv 2>/dev/null | grep -iE 'principal|primary' | head -1 | cut -d, -f1")
if [[ -z "$MENU_ID" ]]; then
    echo "ATTENTION: menu Principal introuvable. Skip menu restructure."
elif [[ -n "$DRY_RUN" ]]; then
    echo "   [DRY] would restructure menu ID=$MENU_ID"
else
    echo "   Menu ID prod : $MENU_ID"

    # 5a. Verifier si "Intelligence Artificielle" existe deja dans le menu
    IA_ITEM=$(ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp eval '
\$items = wp_get_nav_menu_items($MENU_ID);
foreach (\$items as \$it) {
  if (\$it->title === \"Intelligence Artificielle\") { echo \$it->ID; exit; }
}
' 2>/dev/null" | tr -d '[:space:]' | head -c 10)

    if [[ -z "$IA_ITEM" ]]; then
        # Resoudre l'ID de la page accueil-ia en prod
        IA_PAGE_ID=$(ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp post list --post_type=page --post_status=publish --name=accueil-ia --field=ID --format=ids 2>/dev/null" | tr -d '[:space:]' | head -c 10)
        if [[ -z "$IA_PAGE_ID" ]]; then
            echo "   ATTENTION: page /accueil-ia/ introuvable en prod. Skip menu IA."
        else
            IA_ITEM=$(ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp menu item add-post $MENU_ID $IA_PAGE_ID --title='Intelligence Artificielle' --description='Services + boutique IA' --porcelain 2>&1 | tail -1")
            echo "   Cree menu item IA : $IA_ITEM"
        fi
    else
        echo "   Menu item IA existe deja : $IA_ITEM"
    fi

    # 5b. Reparenter Boutique (objet=page slug=shop) sous IA
    if [[ -n "$IA_ITEM" ]]; then
        ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp eval '
\$items = wp_get_nav_menu_items($MENU_ID);
foreach (\$items as \$it) {
  if (\$it->title === \"Boutique\" && intval(\$it->menu_item_parent) !== $IA_ITEM) {
    update_post_meta(\$it->ID, \"_menu_item_menu_item_parent\", \"$IA_ITEM\");
    echo \"Boutique reparented to IA\\n\";
    break;
  }
}
' 2>&1 | tail -1"
    fi

    # 5c. Ajouter les categories comme enfants de Articles (idempotent)
    ARTICLES_ITEM=$(ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp eval '
\$items = wp_get_nav_menu_items($MENU_ID);
foreach (\$items as \$it) {
  if (\$it->title === \"Articles\") { echo \$it->ID; exit; }
}
' 2>/dev/null" | tr -d '[:space:]' | head -c 10)

    if [[ -n "$ARTICLES_ITEM" ]]; then
        # Liste des slugs de categories qu'on veut comme enfants
        CATS=("ia-locale" "materiel-ia" "raspberry-pi-ia" "tutoriels" "llms-modeles" "ia-business" "cloud-hybride")
        for slug in "${CATS[@]}"; do
            EXISTS=$(ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp eval '
\$items = wp_get_nav_menu_items($MENU_ID);
foreach (\$items as \$it) {
  if (\$it->object === \"category\" && intval(\$it->menu_item_parent) === $ARTICLES_ITEM) {
    \$term = get_term(\$it->object_id);
    if (\$term && \$term->slug === \"$slug\") { echo \"yes\"; exit; }
  }
}
echo \"no\";
' 2>/dev/null" | tr -d '[:space:]' | head -c 5)
            if [[ "$EXISTS" == "yes" ]]; then
                echo "   cat $slug : deja dans menu"
            else
                CAT_ID=$(ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp term get category $slug --by=slug --field=term_id 2>/dev/null" | tr -d '[:space:]' | head -c 10)
                if [[ -n "$CAT_ID" ]]; then
                    ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp menu item add-term $MENU_ID category $CAT_ID --parent-id=$ARTICLES_ITEM --porcelain 2>&1 | tail -1"
                    echo "   cat $slug : ajoute (term_id=$CAT_ID)"
                else
                    echo "   cat $slug : term introuvable, skip"
                fi
            fi
        done
    else
        echo "   ATTENTION: menu item Articles introuvable. Skip categories."
    fi
fi

# ============================================================================
# 6. Flush cache + reset OPcache
# ============================================================================
echo ""
echo "=== 6. Cache flush ==="
if [[ -n "$DRY_RUN" ]]; then
    echo "   [DRY] would flush WP cache + OPcache"
else
    ssh "$SSH_HOST" "cd $PROD_PATH && /usr/local/bin/wp cache flush 2>&1 | tail -1"
    # Reset OPcache via tmp file
    ssh "$SSH_HOST" "echo '<?php opcache_reset();' > $PROD_PATH/_op.php"
    curl -s "https://inaricom.com/_op.php" >/dev/null
    ssh "$SSH_HOST" "rm $PROD_PATH/_op.php"
    echo "   OPcache reset : OK"
fi

# ============================================================================
# 7. Smoke test prod
# ============================================================================
echo ""
echo "=== 7. Smoke test prod ==="
URLS=(
    "https://inaricom.com/"
    "https://inaricom.com/a-propos/"
    "https://inaricom.com/contact/"
    "https://inaricom.com/accueil-ia/"
    "https://inaricom.com/accueil-cybersecurite/"
    "https://inaricom.com/articles/"
)
SMOKE_FAIL=0
for url in "${URLS[@]}"; do
    HTTP=$(curl -sI -o /dev/null -w "%{http_code}" "$url" --insecure)
    if [[ "$HTTP" == "200" ]]; then
        echo "   $url : HTTP 200 OK"
    else
        echo "   $url : HTTP $HTTP ECHEC"
        SMOKE_FAIL=1
    fi
done

# Verifier que le data-theme bleu est bien rendu sur /a-propos/
THEME_CHECK=$(curl -s "https://inaricom.com/a-propos/" --insecure | grep -oE "dataset\.theme='[a-z]+'" | head -1)
if [[ "$THEME_CHECK" == "dataset.theme='bleu'" ]]; then
    echo "   /a-propos/ data-theme : bleu OK"
else
    echo "   /a-propos/ data-theme : $THEME_CHECK (attendu bleu)"
    SMOKE_FAIL=1
fi

# ============================================================================
echo ""
if [[ "$SMOKE_FAIL" == "0" ]]; then
    echo "================================================================"
    echo "  Post-deploy prod TERMINE avec succes."
    echo "================================================================"
else
    echo "================================================================"
    echo "  Post-deploy prod TERMINE avec ECHECS smoke test."
    echo "  Investigue puis re-run."
    echo "================================================================"
    exit 1
fi
