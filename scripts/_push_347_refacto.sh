#!/bin/bash
# Push CSS refactore en DB staging pour post 347
# Utilise wp eval + file_get_contents pour eviter pbs d'echappement

set -e

cd ~/inaricom.com/web-staging

CSS_FILE=/tmp/347-refactored.css
if [ ! -f "$CSS_FILE" ]; then
    echo "ERREUR: $CSS_FILE introuvable"
    exit 1
fi

echo "=== Backup DB avant modif ==="
BACKUP_FILE="/tmp/347-backup-before-refacto-$(date +%Y%m%d-%H%M%S).txt"
wp post get 347 --field=post_content --url=https://staging.inaricom.com > "$BACKUP_FILE" 2>&1
BACKUP_SIZE=$(wc -c < "$BACKUP_FILE")
echo "   Backup: $BACKUP_FILE ($BACKUP_SIZE octets)"

echo ""
echo "=== Update post 347 via wp eval ==="
wp eval "
\$file = '/tmp/347-refactored.css';
\$content = file_get_contents(\$file);
if (\$content === false) {
    echo 'ERREUR: lecture fichier echouee' . PHP_EOL;
    exit(1);
}
\$result = wp_update_post([
    'ID' => 347,
    'post_content' => \$content,
], true);
if (is_wp_error(\$result)) {
    echo 'ERREUR wp_update_post: ' . \$result->get_error_message() . PHP_EOL;
    exit(1);
}
echo 'OK: post 347 update, ' . strlen(\$content) . ' octets' . PHP_EOL;
" --url=https://staging.inaricom.com

echo ""
echo "=== Verification DB ==="
NEW_SIZE=$(wp post get 347 --field=post_content --url=https://staging.inaricom.com | wc -c)
echo "   Nouvelle taille DB: $NEW_SIZE octets"

echo ""
echo "=== Flush cache + rewrite ==="
wp cache flush --url=https://staging.inaricom.com 2>&1 | tail -3
wp rewrite flush --hard --url=https://staging.inaricom.com 2>&1 | tail -3

echo ""
echo "================================================================"
echo "Push CSS refactore en DB staging : TERMINE"
echo "Backup disponible : $BACKUP_FILE"
echo "================================================================"
