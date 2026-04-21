#!/bin/bash
# Forcer resync fichier statique depuis DB
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

FILE=wp-content/uploads/custom-css-js/347.css
TMP=/tmp/347-force-resync.css

echo "=== 1. Recuperer contenu DB ==="
DB_SIZE=$(wp post get 347 --field=post_content --url=$URL | wc -c)
echo "   DB size : $DB_SIZE"

echo ""
echo "=== 2. Regenerer fichier statique avec wrapper ==="
echo '<!-- start Simple Custom CSS and JS -->' > $TMP
echo '<style type="text/css">' >> $TMP
wp post get 347 --field=post_content --url=$URL >> $TMP
echo '</style>' >> $TMP
echo '<!-- end Simple Custom CSS and JS -->' >> $TMP

mv $TMP $FILE
NEW_SIZE=$(wc -c < $FILE)
echo "   New static size : $NEW_SIZE"

echo ""
echo "=== 3. Verif 61c ==="
grep -c '61c\. ICONES' $FILE
grep -c 'service-icon' $FILE

echo ""
echo "=== 4. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -1

echo ""
echo "=== 5. Verif dans HTML rendered ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
sleep 1
HTML=$(curl -s -u "$AUTH" "$URL/")
echo "   61c dans HTML : $(echo "$HTML" | grep -c '61c\. ICONES')"
echo "   service-icon regle : $(echo "$HTML" | grep -c '\.service-icon')"
