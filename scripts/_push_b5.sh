#!/bin/bash
# B.5 : push 347 avec section 61 + desactiver snippets 442 et 508
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com
AUTH='staging:InaStg-Kx7m9vR2@pL'

echo "=== 1. Backup DB state actuel ==="
TS=$(date +%Y%m%d-%H%M%S)
wp post get 347 --field=post_content --url=$URL > /tmp/347-backup-before-b5-$TS.css
SIZE=$(wc -c < /tmp/347-backup-before-b5-$TS.css)
echo "   Backup 347 : /tmp/347-backup-before-b5-$TS.css ($SIZE octets)"

# Backup aussi 442 et 508 avant de les desactiver
wp post get 442 --field=post_content --url=$URL > /tmp/442-backup-before-b5-$TS.css
wp post get 508 --field=post_content --url=$URL > /tmp/508-backup-before-b5-$TS.css
echo "   Backup 442 : /tmp/442-backup-before-b5-$TS.css"
echo "   Backup 508 : /tmp/508-backup-before-b5-$TS.css"

echo ""
echo "=== 2. Update DB 347 avec section 61 ==="
wp eval "
\$content = file_get_contents('/tmp/347-REFACTORED-B5.css');
if (\$content === false) { echo 'ERREUR lecture'; exit(1); }
\$r = wp_update_post(['ID' => 347, 'post_content' => \$content], true);
if (is_wp_error(\$r)) { echo 'ERREUR: ' . \$r->get_error_message(); exit(1); }
echo 'OK: post 347 update (' . strlen(\$content) . ' octets)' . PHP_EOL;
" --url=$URL

echo ""
echo "=== 3. Resync fichier statique 347 AVEC WRAPPER ==="
FILE=wp-content/uploads/custom-css-js/347.css
TMP=/tmp/347-with-wrapper-b5.css

echo '<!-- start Simple Custom CSS and JS -->' > $TMP
echo '<style type="text/css">' >> $TMP
wp post get 347 --field=post_content --url=$URL >> $TMP
echo '</style>' >> $TMP
echo '<!-- end Simple Custom CSS and JS -->' >> $TMP

mv $TMP $FILE
NEW_STATIC=$(wc -c < $FILE)
echo "   Fichier 347 : $NEW_STATIC octets"

echo ""
echo "=== 4. Desactiver snippets 442 et 508 (post_status=draft) ==="
wp post update 442 --post_status=draft --url=$URL 2>&1 | tail -2
wp post update 508 --post_status=draft --url=$URL 2>&1 | tail -2

# Verifier
STATUS_442=$(wp post get 442 --field=post_status --url=$URL)
STATUS_508=$(wp post get 508 --field=post_status --url=$URL)
echo "   Snippet 442 : $STATUS_442"
echo "   Snippet 508 : $STATUS_508"

echo ""
echo "=== 5. Supprimer fichiers statiques 442 et 508 ==="
rm -f wp-content/uploads/custom-css-js/442.css
rm -f wp-content/uploads/custom-css-js/508.css
echo "   Fichiers statiques supprimes"

echo ""
echo "=== 6. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -2

echo ""
echo "=== 7. Smoke tests ==="
echo "--- Homepage : fox canvas + hero full-width presents ---"
HTML=$(curl -s -u "$AUTH" "$URL/")
echo "   fox-canvas dans HTML : $(echo "$HTML" | grep -c 'fox-canvas') occurrences"
echo "   hero-section dans HTML : $(echo "$HTML" | grep -c 'hero-section') occurrences"
echo "   Section 61 presente : $(echo "$HTML" | grep -c '61. HERO HOMEPAGE')"
echo ""
echo "--- Snippets 442 et 508 ne sont plus charges ---"
echo "   442.css dans HTML : $(echo "$HTML" | grep -c 'custom-css-js/442')"
echo "   508.css dans HTML : $(echo "$HTML" | grep -c 'custom-css-js/508')"
echo "   (doit etre 0 pour les deux)"

echo ""
echo "================================================================"
echo "B.5 TERMINE"
echo "Backup 347 : /tmp/347-backup-before-b5-$TS.css"
echo "Backup 442 : /tmp/442-backup-before-b5-$TS.css (snippet desactive, reactiver avec: wp post update 442 --post_status=publish)"
echo "Backup 508 : /tmp/508-backup-before-b5-$TS.css"
echo "================================================================"
