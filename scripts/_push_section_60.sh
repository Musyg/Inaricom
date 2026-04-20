#!/bin/bash
# Push 347 avec section 60 (remap .i-* -> .inari-*)
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== 1. Backup DB state actuel ==="
TS=$(date +%Y%m%d-%H%M%S)
wp post get 347 --field=post_content --url=$URL > /tmp/347-backup-before-iremap-$TS.css
SIZE=$(wc -c < /tmp/347-backup-before-iremap-$TS.css)
echo "   Backup: /tmp/347-backup-before-iremap-$TS.css ($SIZE octets)"

echo ""
echo "=== 2. Update DB 347 ==="
wp eval "
\$content = file_get_contents('/tmp/347-REFACTORED-B4-PLUS-IREMAP.css');
if (\$content === false) { echo 'ERREUR lecture'; exit(1); }
\$r = wp_update_post(['ID' => 347, 'post_content' => \$content], true);
if (is_wp_error(\$r)) { echo 'ERREUR: ' . \$r->get_error_message(); exit(1); }
echo 'OK: post 347 update (' . strlen(\$content) . ' octets)' . PHP_EOL;
" --url=$URL

echo ""
echo "=== 3. Resync fichier statique AVEC WRAPPER (critique) ==="
FILE=wp-content/uploads/custom-css-js/347.css
TMP=/tmp/347-with-wrapper-iremap.css

echo '<!-- start Simple Custom CSS and JS -->' > $TMP
echo '<style type="text/css">' >> $TMP
wp post get 347 --field=post_content --url=$URL >> $TMP
echo '</style>' >> $TMP
echo '<!-- end Simple Custom CSS and JS -->' >> $TMP

mv $TMP $FILE
NEW_STATIC=$(wc -c < $FILE)
echo "   Fichier: $NEW_STATIC octets"

echo ""
echo "=== 4. Verif wrapper OK ==="
head -2 $FILE
echo "..."
tail -2 $FILE

echo ""
echo "=== 5. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -2

echo ""
echo "=== 6. Smoke tests ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'

echo ""
echo "--- Fiche produit : data-theme + presence remap ---"
HTML=$(curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/")
echo "   data-theme inject:"
echo "$HTML" | grep -oE "documentElement.dataset.theme='[^']+'" | head -1
echo "   Section 60 presente:"
echo "$HTML" | grep -c 'REMAP DESIGN SYSTEM' || true
echo "   Variable --i-red remap presente:"
echo "$HTML" | grep -c 'i-red: var(--inari-red)' || true

echo ""
echo "--- Homepage : toujours rouge defaut ---"
HTML=$(curl -s -u "$AUTH" "$URL/")
echo "   data-theme inject (vide = rouge):"
echo "$HTML" | grep -oE "documentElement.dataset.theme='[^']+'" | head -1 || echo "   (pas d'attribut = rouge defaut OK)"

echo ""
echo "================================================================"
echo "Push section 60 i-remap TERMINE"
echo "Backup : /tmp/347-backup-before-iremap-$TS.css"
echo "================================================================"
