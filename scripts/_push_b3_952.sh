#!/bin/bash
# B.3 push : variabilisation 952 Fiches produits
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== 1. Backup DB state 952 ==="
TS=$(date +%Y%m%d-%H%M%S)
wp post get 952 --field=post_content --url=$URL > /tmp/952-backup-b3-$TS.css
echo "   Backup: /tmp/952-backup-b3-$TS.css ($(wc -c < /tmp/952-backup-b3-$TS.css) octets)"

echo ""
echo "=== 2. Update post 952 via wp eval ==="
wp eval "
\$content = file_get_contents('/tmp/952-REFACTORED.css');
if (\$content === false) { echo 'ERREUR lecture'; exit(1); }
\$r = wp_update_post(['ID' => 952, 'post_content' => \$content], true);
if (is_wp_error(\$r)) { echo 'ERREUR: ' . \$r->get_error_message(); exit(1); }
echo 'OK: post 952 update (' . strlen(\$content) . ' octets)' . PHP_EOL;
" --url=$URL

echo ""
echo "=== 3. Resync fichier statique AVEC WRAPPER (lecon B'.3) ==="
FILE=wp-content/uploads/custom-css-js/952.css
TMP=/tmp/952-with-wrapper.css

echo '<!-- start Simple Custom CSS and JS -->' > $TMP
echo '<style type="text/css">' >> $TMP
wp post get 952 --field=post_content --url=$URL >> $TMP
echo '</style>' >> $TMP
echo '<!-- end Simple Custom CSS and JS -->' >> $TMP

mv $TMP $FILE
echo "   Fichier: $(wc -c < $FILE) octets"

echo ""
echo "=== 4. Verif wrapper correct ==="
head -2 $FILE
echo "..."
tail -2 $FILE

echo ""
echo "=== 5. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -2

echo ""
echo "=== 6. Smoke test ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'

# Trouver une URL fiche produit pour tester
PRODUCT_SLUG=$(wp post list --post_type=product --post_status=publish --format=csv --fields=post_name --url=$URL 2>/dev/null | tail -n +2 | head -1)
if [ -n "$PRODUCT_SLUG" ]; then
  echo "   URL fiche produit trouvee: $URL/produit/$PRODUCT_SLUG/"
  HTML=$(curl -s -u "$AUTH" "$URL/produit/$PRODUCT_SLUG/")
else
  echo "   Pas de fiche produit publiee, test sur home"
  HTML=$(curl -s -u "$AUTH" "$URL/")
fi

# Verif : plus de #E31E24 dans les classes .inari-*
INARI_REDS=$(echo "$HTML" | grep -cE '\.inari-.*#E31E24|#E31E24.*\.inari-' || true)
echo "   Hex rouge .inari-* dans HTML: $INARI_REDS (doit etre 0)"

# Verif presence var() dans les regles inari-badge
INARI_VARS=$(echo "$HTML" | grep -c 'inari-badge--guarantee' || true)
echo "   Regle .inari-badge--guarantee servie: $INARI_VARS"

echo ""
echo "================================================================"
echo "Push B.3 TERMINE"
echo "Backup DB : /tmp/952-backup-b3-$TS.css"
echo "================================================================"
