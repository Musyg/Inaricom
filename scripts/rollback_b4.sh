#!/bin/bash
# ROLLBACK B.4 — restaure le 347 pre-refactor
# Usage : bash rollback_b4.sh <TIMESTAMP>
# Exemple : bash rollback_b4.sh 20260419-204500
set -e

TS=${1:-}
if [ -z "$TS" ]; then
    echo "USAGE: bash rollback_b4.sh <TIMESTAMP>"
    echo "Liste des backups disponibles :"
    ls /tmp/347-backup-b4-*.css 2>/dev/null | head
    exit 1
fi

cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

BACKUP_DB=/tmp/347-backup-b4-db-$TS.css
BACKUP_STATIC=/tmp/347-backup-b4-static-$TS.css

if [ ! -f "$BACKUP_DB" ]; then
    echo "ERREUR: backup $BACKUP_DB introuvable"
    exit 1
fi

echo "=== Rollback depuis $TS ==="

echo ""
echo "=== 1. Restore DB ==="
wp eval "
\$content = file_get_contents('$BACKUP_DB');
\$r = wp_update_post(['ID' => 347, 'post_content' => \$content], true);
if (is_wp_error(\$r)) exit(1);
echo 'OK DB restored (' . strlen(\$content) . ' octets)' . PHP_EOL;
" --url=$URL

echo ""
echo "=== 2. Restore fichier statique ==="
cp $BACKUP_STATIC wp-content/uploads/custom-css-js/347.css
echo "   OK fichier statique restore"

echo ""
echo "=== 3. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -2

echo ""
echo "=== Rollback B.4 TERMINE ==="
