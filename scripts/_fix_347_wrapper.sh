#!/bin/bash
# URGENT FIX : rajouter wrapper <style> au fichier 347.css
set -e
cd ~/inaricom.com/web-staging

FILE=wp-content/uploads/custom-css-js/347.css

echo "=== 1. Backup fichier casse ==="
cp $FILE /tmp/347-broken-nowrapper-$(date +%H%M%S).css
echo "   Backup: /tmp/347-broken-nowrapper-*.css"

echo ""
echo "=== 2. Verif : fichier commence par style ou par css brut ==="
head -2 $FILE | head -1

echo ""
echo "=== 3. Voir format d'un autre snippet (684) pour copier exactement ==="
head -3 wp-content/uploads/custom-css-js/684.css
echo "..."
tail -3 wp-content/uploads/custom-css-js/684.css

echo ""
echo "=== 4. Reecrire 347.css avec wrapper identique aux autres snippets ==="
TMP=/tmp/347-fixed.css

echo '<!-- start Simple Custom CSS and JS -->' > $TMP
echo '<style type="text/css">' >> $TMP
cat $FILE >> $TMP
echo '</style>' >> $TMP
echo '<!-- end Simple Custom CSS and JS -->' >> $TMP

NEW_SIZE=$(wc -c < $TMP)
echo "   Nouveau fichier: $NEW_SIZE octets"

# Verif debut et fin
echo ""
echo "=== 5. Verif debut ==="
head -3 $TMP
echo "..."
echo ""
echo "=== 6. Verif fin ==="
tail -3 $TMP

echo ""
echo "=== 7. Remplacer fichier live ==="
mv $TMP $FILE
echo "   OK : $FILE mis a jour"

echo ""
echo "=== 8. Flush cache ==="
wp cache flush --url=https://staging.inaricom.com 2>&1 | tail -3

echo ""
echo "=== 9. Smoke test final ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
HTML=$(curl -s -u "$AUTH" "https://staging.inaricom.com/")

# Compter les balises <style> qui englobent le 347
STYLE_COUNT=$(echo "$HTML" | grep -c '<style' || true)
echo "   Balises <style> dans HTML: $STYLE_COUNT"

# Le contenu '.woocommerce ul.products.woo-archive-action-on-hover' doit maintenant etre DANS un style, pas en texte brut
NAKED_CSS=$(echo "$HTML" | grep -c '^\.woocommerce ul.products.woo-archive-action' || true)
echo "   CSS brut commencant une ligne (doit etre 0): $NAKED_CSS"

# Verifier qu'une regle CSS du 347 est bien servie 
FOX_SIGNATURE=$(echo "$HTML" | grep -c 'FONTS SELF-HOSTED' || true)
echo "   'FONTS SELF-HOSTED' trouve (signature 347): $FOX_SIGNATURE"

echo ""
echo "================================================================"
echo "Fix wrapper 347 applique. Teste dans un onglet staging navigation privee."
echo "================================================================"
