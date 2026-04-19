#!/bin/bash
# Analyser comment le plugin injecte le fichier statique
cd ~/inaricom.com/web-staging

echo "=== Comparer format fichier vs autres snippets ==="
echo "--- 684 (Pages Legales) premieres lignes ---"
head -3 wp-content/uploads/custom-css-js/684.css
echo ""
echo "--- 952 (Fiches produits) premieres lignes ---"
head -3 wp-content/uploads/custom-css-js/952.css
echo ""
echo "--- 740 (WPforms) premieres lignes ---"
head -3 wp-content/uploads/custom-css-js/740.css
echo ""
echo "=== Mon 347 actuellement ==="
head -3 wp-content/uploads/custom-css-js/347.css

echo ""
echo "=== Verifier HTML homepage pour voir si 347 CSS charge sans wrapper ==="
curl -s -u 'staging:InaStg-Kx7m9vR2@pL' 'https://staging.inaricom.com/' > /tmp/home.html

# Chercher les marqueurs Inaricom v5.1 (signature 347)
grep -c 'CSS UNIFIÉ PREMIUM' /tmp/home.html || true
echo "   matches 'CSS UNIFIÉ PREMIUM' (signature 347)"

grep -c 'FONTS SELF-HOSTED' /tmp/home.html || true
echo "   matches 'FONTS SELF-HOSTED' (nouveau content)"

grep -c 'DEPRECATED' /tmp/home.html || true
echo "   matches 'DEPRECATED' (section 40)"

grep -c 'fonts.googleapis.com' /tmp/home.html || true
echo "   matches 'fonts.googleapis.com' dans HTML final"

echo ""
echo "=== Verifier si fichier est inclus avec wrapper ==="
# Extraire la balise style qui contient le contenu 347
grep -A2 '<!-- start Simple Custom CSS' /tmp/home.html | head -20 || true
