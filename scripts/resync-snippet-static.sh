#!/bin/bash
# Resync fichier custom-css-js/{ID}.css avec contenu DB + wrapper obligatoire
#
# CRITIQUE : Le plugin custom-css-js fait `echo file_get_contents($file)` pur.
# Il N'AJOUTE PAS de wrapper <style> au runtime.
# Chaque fichier .css DOIT contenir son propre <!-- start --> <style>...</style> <!-- end -->
# sinon le CSS apparaît en TEXTE BRUT dans le <head> → casse complètement le rendu.
#
# Usage: bash _resync_snippet_static.sh <POST_ID>
# Exemple: bash _resync_snippet_static.sh 347

set -e

POST_ID=${1:-347}
URL=https://staging.inaricom.com
FILE=~/inaricom.com/web-staging/wp-content/uploads/custom-css-js/${POST_ID}.css

if [ ! -f "$FILE" ]; then
    echo "ERREUR: fichier $FILE introuvable"
    exit 1
fi

cd ~/inaricom.com/web-staging

echo "=== 1. Backup fichier actuel ==="
BACKUP=/tmp/${POST_ID}-resync-backup-$(date +%Y%m%d-%H%M%S).css
cp $FILE $BACKUP
echo "   Backup: $BACKUP"

echo ""
echo "=== 2. Recuperer contenu DB ==="
TMP_CONTENT=/tmp/${POST_ID}-db-content.css
wp post get $POST_ID --field=post_content --url=$URL > $TMP_CONTENT
DB_SIZE=$(wc -c < $TMP_CONTENT)
echo "   Contenu DB: $DB_SIZE octets"

echo ""
echo "=== 3. Construire fichier statique AVEC wrapper ==="
TMP_OUT=/tmp/${POST_ID}-with-wrapper.css

echo '<!-- start Simple Custom CSS and JS -->' > $TMP_OUT
echo '<style type="text/css">' >> $TMP_OUT
cat $TMP_CONTENT >> $TMP_OUT
echo '</style>' >> $TMP_OUT
echo '<!-- end Simple Custom CSS and JS -->' >> $TMP_OUT

OUT_SIZE=$(wc -c < $TMP_OUT)
echo "   Fichier final avec wrapper: $OUT_SIZE octets"

echo ""
echo "=== 4. Remplacer fichier live ==="
mv $TMP_OUT $FILE
echo "   OK : $FILE"

echo ""
echo "=== 5. Verif format ==="
echo "--- Debut ---"
head -3 $FILE
echo "--- Fin ---"
tail -3 $FILE

echo ""
echo "=== 6. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -2

echo ""
echo "Resync snippet $POST_ID : OK"
