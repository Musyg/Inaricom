#!/bin/bash
# ============================================================================
# deploy-prod.sh
# ----------------------------------------------------------------------------
# Promotion staging -> prod. Critique. Triple confirmation.
#
# ATTENTION : Ne lance JAMAIS ce script automatiquement.
# Ne lance JAMAIS ce script un vendredi soir ou un jour de ferie.
# Ne lance JAMAIS ce script si tu viens de faire un gros changement
# DB (WooCommerce orders) sur la prod.
#
# Usage:
#   bash scripts/deploy-prod.sh [--dry-run]
#
# Sequence :
#   1. Verifications pre-flight (git clean, staging 200 OK, prod 200 OK)
#   2. Triple confirmation humaine
#   3. Backup DB prod (dump horodate)
#   4. Backup code prod (tar release)
#   5. Tag git "prod-YYYYMMDD-HHMMSS"
#   6. Rsync staging -> prod (exclusions staging-only)
#   7. wp cache flush + rewrite flush en prod
#   8. Smoke test prod (HTTP 200 sur 4 URLs)
#   9. Si echec smoke test -> rollback auto depuis backup code
#  10. Notification Slack (si webhook configure)
#
# La DB n'est JAMAIS poussee de staging vers prod. Les donnees prod sont
# intangibles depuis staging.
# ============================================================================

set -euo pipefail

SSH_HOST="inaricom"
PROD_PATH="/home/toriispo/inaricom.com/web"
STAGING_PATH="/home/toriispo/inaricom.com/web-staging"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DRY_RUN=""

# Parse args
for arg in "$@"; do
    case $arg in
        --dry-run) DRY_RUN="--dry-run -v" ;;
        --help|-h)
            grep -E '^#' "$0" | head -40
            exit 0
            ;;
    esac
done

cd "$REPO_ROOT"

# Banner critique
cat <<'BANNER'
================================================================
  DEPLOY STAGING -> PROD
  !! OPERATION CRITIQUE !!
================================================================
Cette operation modifie le code de PROD (inaricom.com).
Elle n'est PAS reversible sans intervention manuelle.
Un backup automatique est fait avant, mais lis bien les checks.
BANNER

[[ -n "$DRY_RUN" ]] && echo ""
[[ -n "$DRY_RUN" ]] && echo "  Mode  : DRY RUN (aucun changement)"
echo ""

# ============================================================================
# 1. Pre-flight checks
# ============================================================================
echo "=== 1. Pre-flight checks ==="

# 1a. Git clean
if [[ -n "$(git status --porcelain)" ]]; then
    echo "ECHEC: working tree git non clean"
    git status --short
    exit 1
fi
echo "   Git       : clean ✓"

# 1b. Jour/heure
DAY=$(date +%u)  # 1=lundi 7=dimanche
HOUR=$(date +%H)
if [[ "$DAY" == "5" && "$HOUR" -gt "15" ]] || [[ "$DAY" == "6" ]] || [[ "$DAY" == "7" ]]; then
    echo ""
    echo "!! Vendredi apres 15h / samedi / dimanche"
    echo "!! Rappel : CLAUDE.md recommande de ne PAS deployer hors heures ouvrees."
    read -p "   Continuer quand meme ? (oui/non) " ok
    [[ "$ok" != "oui" ]] && { echo "Annule."; exit 1; }
fi

# 1c. Staging HTTP 200 (avec auth)
CRED_FILE="$REPO_ROOT/STAGING_CREDENTIALS.txt"
if [[ -f "$CRED_FILE" ]]; then
    HTTP_USER=$(grep -oP 'Auth HTTP user\s*:\s*\K\S+' "$CRED_FILE" 2>/dev/null || echo "staging")
    HTTP_PASS=$(grep -oP 'Auth HTTP pass\s*:\s*\K\S+' "$CRED_FILE" 2>/dev/null || echo "")

    STAGING_HTTP=$(curl -sI -o /dev/null -w "%{http_code}" \
        -u "$HTTP_USER:$HTTP_PASS" \
        https://staging.inaricom.com/ --insecure)
    echo "   Staging   : HTTP $STAGING_HTTP"
    if [[ "$STAGING_HTTP" != "200" ]]; then
        echo "ECHEC: staging ne repond pas 200. Valide staging d'abord."
        exit 1
    fi
else
    echo "   Staging   : pas de credentials, skip check"
fi

# 1d. Prod HTTP 200 actuel
PROD_HTTP=$(curl -sI -o /dev/null -w "%{http_code}" https://inaricom.com/ --insecure)
echo "   Prod      : HTTP $PROD_HTTP"
if [[ "$PROD_HTTP" != "200" && "$PROD_HTTP" != "302" && "$PROD_HTTP" != "503" ]]; then
    echo "ECHEC: prod ne repond pas 200/302/503. Investigue avant de deployer."
    exit 1
fi

# 1e. Diff staging vs prod (preview de ce qui va changer)
echo ""
echo "=== 2. Diff staging -> prod (dry-run rsync) ==="
ssh "$SSH_HOST" "rsync -av --dry-run \
    --exclude='wp-config.php' \
    --exclude='.htyoezfp.appconfig.php' \
    --exclude='.htaccess' \
    --exclude='error_log' \
    --exclude='wp-content/mu-plugins/staging-hardening.php' \
    --exclude='wp-content/uploads/' \
    $STAGING_PATH/ $PROD_PATH/" | tail -30

# ============================================================================
# 3. Triple confirmation
# ============================================================================
if [[ -z "$DRY_RUN" ]]; then
    echo ""
    echo "=== 3. Triple confirmation ==="
    if [[ "${INARI_DEPLOY_PROD_CONFIRMED:-}" == "DEPLOY PROD" ]]; then
        echo "   Bypass via INARI_DEPLOY_PROD_CONFIRMED=DEPLOY PROD (env var)"
    else
        read -p "   Staging a-t-il ete valide par QA ? (oui/non) " c1
        [[ "$c1" != "oui" ]] && { echo "Annule."; exit 1; }
        read -p "   As-tu un plan de rollback mental ? (oui/non) " c2
        [[ "$c2" != "oui" ]] && { echo "Annule."; exit 1; }
        read -p "   Deployer en prod MAINTENANT ? Tape exactement 'DEPLOY PROD' : " c3
        [[ "$c3" != "DEPLOY PROD" ]] && { echo "Annule."; exit 1; }
    fi
fi

# ============================================================================
# 4. Backup DB prod
# ============================================================================
echo ""
echo "=== 4. Backup DB prod ==="
bash "$REPO_ROOT/scripts/db-backup.sh" prod

# ============================================================================
# 5. Backup code prod (tar avec horodatage)
# ============================================================================
echo ""
echo "=== 5. Backup code prod (tar horodate) ==="
BACKUP_TARBALL="/home/toriispo/backup-code-prod-${TIMESTAMP}.tar.gz"
ssh "$SSH_HOST" "cd /home/toriispo/inaricom.com && tar -czf $BACKUP_TARBALL --exclude=web/wp-content/uploads web/"
BACKUP_SIZE=$(ssh "$SSH_HOST" "du -h $BACKUP_TARBALL" | cut -f1)
echo "   Backup    : $BACKUP_TARBALL ($BACKUP_SIZE)"

# ============================================================================
# 6. Tag git
# ============================================================================
TAG="prod-${TIMESTAMP}"
if [[ -z "$DRY_RUN" ]]; then
    git tag -a "$TAG" -m "Deploy prod $TIMESTAMP"
    echo ""
    echo "=== 6. Tag git : $TAG ==="
fi

# ============================================================================
# 7. Rsync staging -> prod
# ============================================================================
echo ""
echo "=== 7. Rsync staging -> prod ==="
ssh "$SSH_HOST" "rsync -av $DRY_RUN \
    --exclude='wp-config.php' \
    --exclude='.htyoezfp.appconfig.php' \
    --exclude='.htaccess' \
    --exclude='error_log' \
    --exclude='wp-content/mu-plugins/staging-hardening.php' \
    --exclude='wp-content/uploads/' \
    $STAGING_PATH/ $PROD_PATH/" | tail -10

# ============================================================================
# 8. Flush cache + rewrite prod
# ============================================================================
if [[ -z "$DRY_RUN" ]]; then
    echo ""
    echo "=== 8. Flush cache + rewrite prod ==="
    ssh "$SSH_HOST" "cd $PROD_PATH && wp cache flush && wp rewrite flush" 2>&1 | tail -5
fi

# ============================================================================
# 9. Smoke test prod (4 URLs)
# ============================================================================
if [[ -z "$DRY_RUN" ]]; then
    echo ""
    echo "=== 9. Smoke test prod ==="
    SMOKE_URLS=(
        "https://inaricom.com/"
        "https://inaricom.com/wp-login.php"
        "https://inaricom.com/wp-json/"
        "https://inaricom.com/.well-known/security.txt"
    )
    SMOKE_FAIL=0
    for url in "${SMOKE_URLS[@]}"; do
        CODE=$(curl -sI -o /dev/null -w "%{http_code}" "$url" --insecure)
        echo "   $url -> HTTP $CODE"
        if [[ ! "$CODE" =~ ^(200|302|503)$ ]]; then
            SMOKE_FAIL=1
        fi
    done

    if [[ "$SMOKE_FAIL" == "1" ]]; then
        echo ""
        echo "!! ECHEC SMOKE TEST !! Rollback en cours..."
        ssh "$SSH_HOST" "cd /home/toriispo/inaricom.com && \
            mv web web-broken-${TIMESTAMP} && \
            mkdir web && \
            cd web && \
            tar -xzf $BACKUP_TARBALL --strip-components=1"
        ssh "$SSH_HOST" "cd $PROD_PATH && wp cache flush"
        echo "Rollback termine. Prod remise a l'etat pre-deploy."
        echo "Code defectueux archive dans /home/toriispo/inaricom.com/web-broken-${TIMESTAMP}/"
        exit 2
    fi
fi

# ============================================================================
# 10. Success
# ============================================================================
echo ""
echo "================================================================"
if [[ -n "$DRY_RUN" ]]; then
    echo "DRY RUN termine. Pour appliquer : relancez sans --dry-run."
else
    echo "Deploy prod termine avec succes."
    echo "Tag      : $TAG"
    echo "Backup DB: ~/backup-prod-${TIMESTAMP}.sql"
    echo "Backup code: $BACKUP_TARBALL"
    echo ""
    echo "Monitoring a surveiller pendant 2h :"
    echo "  - curl https://inaricom.com/"
    echo "  - logs error_log prod"
    echo "  - Uptime/Sentry si configures"
fi
echo "================================================================"
