#!/bin/bash
# Rollback immediate de la page 985
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== Rollback page 985 depuis backup ==="
# Le premier backup propre avant le clean v1
BACKUP=$(ls -t /tmp/page-985-backup-*.html | tail -1)
FIRST_BACKUP="/tmp/page-985-backup-20260421-115142.html"
if [ ! -f "$FIRST_BACKUP" ]; then
    FIRST_BACKUP=$(ls -t /tmp/page-985-backup-*.html | head -1)
fi
echo "Rollback depuis : $FIRST_BACKUP"
ls -la "$FIRST_BACKUP"

wp eval "
\$content = file_get_contents('$FIRST_BACKUP');
kses_remove_filters();
\$r = wp_update_post([
    'ID' => 985,
    'post_content' => \$content,
    'post_content_filtered' => \$content,
], true);
if (is_wp_error(\$r)) { echo 'ERREUR: ' . \$r->get_error_message(); exit(1); }
echo 'OK: rollback 985 (' . strlen(\$content) . ' octets)' . PHP_EOL;
kses_init_filters();
" --url=$URL

wp cache flush --url=$URL 2>&1 | tail -1

echo ""
echo "=== Taille actuelle page 985 ==="
wp post get 985 --field=post_content --url=$URL | wc -c
