#!/bin/bash
# ============================================================================
# cleanup-stale-bundles.sh
# ----------------------------------------------------------------------------
# Garde-corps : retire les bundles React stale (anciens hashes) qui
# s'accumulent dans wp-content/plugins/inaricom-core/assets/react/ a chaque
# deploy. La pipeline rsync ne supprime PAS les fichiers obsoletes (par
# design, pour eviter de casser un user en plein chargement). Resultat : 240+
# anciens chunks accumules apres ~30 deploys.
#
# Strategie : extraire la liste des fichiers REFERENCES par .vite/manifest.json
# (et ses transitives via "imports"+"css"+"assets"), puis archiver tout ce qui
# n'est pas reference dans un .stale-{TS}.tar.gz puis supprimer. Le tar permet
# un rollback rapide si un fichier critique a ete oublie.
#
# Idempotent : si rien a faire, exit 0 sans toucher.
#
# Usage :
#   bash scripts/cleanup-stale-bundles.sh [--dry-run] [--env staging|prod]
#
# Defaut : --env prod
# ============================================================================

set -euo pipefail

SSH_HOST="inaricom"
ENV="prod"
DRY_RUN=""
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run) DRY_RUN="1"; shift ;;
        --env)
            ENV="$2"
            shift 2
            ;;
        --env=*) ENV="${1#*=}"; shift ;;
        --help|-h) head -25 "$0"; exit 0 ;;
        *) echo "ECHEC: argument inconnu: $1"; exit 1 ;;
    esac
done

case "$ENV" in
    prod)    BASE="/home/toriispo/inaricom.com/web/wp-content/plugins/inaricom-core/assets/react" ;;
    staging) BASE="/home/toriispo/inaricom.com/web-staging/wp-content/plugins/inaricom-core/assets/react" ;;
    *) echo "ECHEC: --env doit etre 'prod' ou 'staging'"; exit 1 ;;
esac

echo "================================================================"
echo "  CLEANUP STALE BUNDLES (env=$ENV)"
echo "  Target: $SSH_HOST:$BASE"
[[ -n "$DRY_RUN" ]] && echo "  Mode: DRY RUN"
echo "================================================================"

# === 1. Verifie que le manifest existe ===
echo ""
echo "=== 1. Lecture manifest ==="
MANIFEST_EXISTS=$(ssh "$SSH_HOST" "[ -f $BASE/.vite/manifest.json ] && echo OK || echo MISSING")
if [[ "$MANIFEST_EXISTS" != "OK" ]]; then
    echo "ECHEC: $BASE/.vite/manifest.json introuvable. Lance d'abord un deploy."
    exit 1
fi
echo "   Manifest : OK"

# === 2. Extrait la liste des fichiers references (manifest + transitives) ===
echo ""
echo "=== 2. Extraction fichiers references ==="

# On utilise un PHP one-liner cote serveur pour parser le JSON (jq pas garanti
# present partout). Recursif : pour chaque entry on prend le file, les imports
# transitifs, les css, et les assets.
KEPT_FILES=$(ssh "$SSH_HOST" "/usr/local/bin/php85 -r '
\$manifest = json_decode(file_get_contents(\"$BASE/.vite/manifest.json\"), true);
\$kept = [];
function collect(&\$kept, \$manifest, \$key, \$visited = []) {
  if (in_array(\$key, \$visited)) return;
  \$visited[] = \$key;
  if (!isset(\$manifest[\$key])) return;
  \$entry = \$manifest[\$key];
  if (!empty(\$entry[\"file\"])) \$kept[] = \$entry[\"file\"];
  foreach ((array)(\$entry[\"css\"] ?? []) as \$c) \$kept[] = \$c;
  foreach ((array)(\$entry[\"assets\"] ?? []) as \$a) \$kept[] = \$a;
  foreach ((array)(\$entry[\"imports\"] ?? []) as \$i) collect(\$kept, \$manifest, \$i, \$visited);
  foreach ((array)(\$entry[\"dynamicImports\"] ?? []) as \$i) collect(\$kept, \$manifest, \$i, \$visited);
}
foreach (\$manifest as \$key => \$entry) {
  if (!empty(\$entry[\"isEntry\"]) || !empty(\$entry[\"isDynamicEntry\"])) {
    collect(\$kept, \$manifest, \$key);
  }
}
\$kept = array_unique(\$kept);
sort(\$kept);
foreach (\$kept as \$f) echo \$f . PHP_EOL;
'" 2>&1 | grep -vE 'virtualhost|^Info:')

KEPT_COUNT=$(echo "$KEPT_FILES" | grep -v '^$' | wc -l)
echo "   Fichiers references par manifest (transitive) : $KEPT_COUNT"

# Ajoute les fichiers indispensables non manifestes : foxPathsWorker (Vite worker
# import est inline, pas dans manifest standard mais le bundle homepage le ref).
# On parse le bundle homepage pour trouver les workers references.
# On parse uniquement les bundles ENTRY references par le manifest, pas tous
# les bundles homepage-*.js (la plupart sont stale). Pour ce faire, on
# collecte les fichiers JS du KEPT_FILES qui matchent js/{name}-{hash}.js
WORKER_REFS=$(ssh "$SSH_HOST" "
KEPT_BUNDLES=\$(/usr/local/bin/php85 -r '
\$manifest = json_decode(file_get_contents(\"$BASE/.vite/manifest.json\"), true);
foreach (\$manifest as \$entry) {
  if (!empty(\$entry[\"isEntry\"]) && !empty(\$entry[\"file\"])) echo \$entry[\"file\"] . PHP_EOL;
}' 2>&1 | grep -vE 'virtualhost|^Info:')
for f in \$KEPT_BUNDLES; do
  full=$BASE/\$f
  [ -f \"\$full\" ] || continue
  grep -oE 'assets/[A-Za-z0-9_-]+\\.js' \"\$full\" 2>/dev/null
done | sort -u" 2>&1 | grep -vE 'virtualhost|^Info:')
WORKER_REF_COUNT=$(echo "$WORKER_REFS" | grep -v '^$' | wc -l)
echo "   Workers references par bundles (regex) : $WORKER_REF_COUNT"

# Combine
ALL_KEPT=$(echo -e "$KEPT_FILES\n$WORKER_REFS" | grep -v '^$' | sort -u)

# Toujours garder manifest + favicons + le dossier data/
ALL_KEPT="$ALL_KEPT
.vite/manifest.json
favicon.svg
icons.svg"

# === 3. Liste des fichiers presents physiquement ===
echo ""
echo "=== 3. Liste fichiers physiques (js + assets + css) ==="
PRESENT_FILES=$(ssh "$SSH_HOST" "cd $BASE && find js assets css -type f \\( -name '*.js' -o -name '*.css' \\) 2>/dev/null | sort" 2>&1 | grep -vE 'virtualhost|^Info:')
PRESENT_COUNT=$(echo "$PRESENT_FILES" | wc -l)
echo "   Total fichiers js/css/assets sur disque : $PRESENT_COUNT"

# === 4. Diff : ce qui n'est pas dans ALL_KEPT = stale ===
echo ""
echo "=== 4. Calcul des fichiers stale ==="
STALE_FILES=$(comm -23 <(echo "$PRESENT_FILES") <(echo "$ALL_KEPT" | grep -v '^$' | sort -u))
STALE_COUNT=$(echo "$STALE_FILES" | grep -v '^$' | wc -l)

if [[ "$STALE_COUNT" -eq 0 ]]; then
    echo "   Rien a nettoyer. Exit."
    exit 0
fi

echo "   Stale a archiver : $STALE_COUNT fichiers"
echo ""
echo "   Apercu (10 premiers) :"
echo "$STALE_FILES" | head -10 | sed 's/^/     /'

# === 5. Archive + suppression (sauf si dry-run) ===
if [[ -n "$DRY_RUN" ]]; then
    echo ""
    echo "[DRY RUN] Aucune suppression. Pour executer pour de vrai :"
    echo "  bash scripts/cleanup-stale-bundles.sh --env $ENV"
    exit 0
fi

echo ""
echo "=== 5. Archive + suppression ==="
ARCHIVE="$BASE/.stale-bundles-${TIMESTAMP}.tar.gz"

# Build une liste de chemins relatifs pour tar
STALE_LIST_FILE="/tmp/stale-list-${TIMESTAMP}.txt"
echo "$STALE_FILES" | grep -v '^$' > "/tmp/stale-list-local-${TIMESTAMP}.txt"
scp "/tmp/stale-list-local-${TIMESTAMP}.txt" "$SSH_HOST:$STALE_LIST_FILE"

ssh "$SSH_HOST" "cd $BASE && tar -czf $ARCHIVE -T $STALE_LIST_FILE && wc -l $STALE_LIST_FILE"
ARCHIVE_SIZE=$(ssh "$SSH_HOST" "du -h $ARCHIVE | cut -f1")
echo "   Archive : $ARCHIVE ($ARCHIVE_SIZE)"

ssh "$SSH_HOST" "cd $BASE && xargs rm -f < $STALE_LIST_FILE && rm $STALE_LIST_FILE"
rm -f "/tmp/stale-list-local-${TIMESTAMP}.txt"
echo "   Stale supprimes."

# === 6. Verification finale ===
echo ""
echo "=== 6. Verification ==="
NEW_COUNT=$(ssh "$SSH_HOST" "cd $BASE && find js assets css -type f \\( -name '*.js' -o -name '*.css' \\) 2>/dev/null | wc -l")
NEW_SIZE=$(ssh "$SSH_HOST" "du -sh $BASE/js $BASE/assets $BASE/css 2>&1 | grep -v 'virtualhost'")
echo "   Avant : $PRESENT_COUNT fichiers"
echo "   Apres : $NEW_COUNT fichiers"
echo "   Sizes :"
echo "$NEW_SIZE" | sed 's/^/     /'
echo ""
echo "================================================================"
echo "  CLEANUP TERMINE."
echo "  Rollback : ssh $SSH_HOST \"cd $BASE && tar -xzf $ARCHIVE\""
echo "================================================================"
