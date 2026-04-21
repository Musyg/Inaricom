#!/bin/bash
# Nettoyer page 985 v2 : supprimer TOUS les blocs stats dupliques
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com
AUTH='staging:InaStg-Kx7m9vR2@pL'

TS=$(date +%Y%m%d-%H%M%S)

echo "=== 1. Backup page 985 ==="
wp post get 985 --field=post_content --url=$URL > /tmp/page-985-backup-$TS.html
cp /tmp/page-985-backup-$TS.html /tmp/page-985-in.html
echo "   Backup : /tmp/page-985-backup-$TS.html"

echo ""
echo "=== 2. Python nettoyage v2 ==="
python3 /tmp/_clean_985_v2.py

echo ""
echo "=== 3. Update post 985 ==="
wp eval "
\$content = file_get_contents('/tmp/page-985-out.html');
kses_remove_filters();
\$r = wp_update_post([
    'ID' => 985,
    'post_content' => \$content,
    'post_content_filtered' => \$content,
], true);
if (is_wp_error(\$r)) { echo 'ERREUR: ' . \$r->get_error_message(); exit(1); }
echo 'OK: post 985 update (' . strlen(\$content) . ' octets)' . PHP_EOL;
kses_init_filters();
" --url=$URL

echo ""
echo "=== 4. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -1

echo ""
echo "=== 5. Verif HTML rendered ==="
HTML=$(curl -s -u "$AUTH" "$URL/")
echo "   occurrences .inari-hero-stats : $(echo "$HTML" | grep -c 'inari-hero-stats')"
echo "   display: inline-flex sur stats : $(echo "$HTML" | grep -c '\.inari-hero-stats\s*{\s*display:\s*inline-flex')"
echo "   display: grid sur stats : $(echo "$HTML" | grep -c '\.inari-hero-stats\s*{\s*display:\s*grid')"
echo "   STATS - CENTREES SUR LA PAGE : $(echo "$HTML" | grep -c 'STATS.*CENTR')"
echo ""
echo "--- Toutes les regles .inari-hero-stats { ... } restantes ---"
echo "$HTML" | grep -oE '\.inari-hero-stats\s*\{[^}]{0,150}\}' | head -10

echo ""
echo "Backup : /tmp/page-985-backup-$TS.html"
