#!/bin/bash
# Diagnostic pourquoi la fiche produit ne change pas avec le theme
set -e
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

echo "=== 1. HTML fiche produit : chercher tous les styles inline et hex rouges ==="
PROD_HTML=$(curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/")

# Chercher hex rouges hardcodes
echo ""
echo "--- Occurrences de #E31E24 dans le HTML de la fiche produit ---"
echo "$PROD_HTML" | grep -n '#E31E24' | head -10

echo ""
echo "--- Occurrences de 'rgb(227' dans le HTML ---"
echo "$PROD_HTML" | grep -nE 'rgb\(227|rgba\(227' | head -10

echo ""
echo "--- Styles inline sur les <li> (bullets) ---"
echo "$PROD_HTML" | grep -oE '<li[^>]*style="[^"]+"' | head -10

echo ""
echo "--- Classes des <li> dans la fiche ---"
echo "$PROD_HTML" | grep -oE '<li class="[^"]+"' | sort -u | head -20

echo ""
echo "=== 2. Verifier si data-theme est bien set sur html/body ==="
echo "$PROD_HTML" | grep -oE '<(html|body)[^>]*data-theme[^>]*' | head

echo ""
echo "=== 3. Styles Gutenberg inline (dans <body>) ==="
# Gutenberg ajoute souvent des styles inline par bloc
echo "$PROD_HTML" | grep -c '<style' 
echo "   balises <style> au total dans le HTML"

# Les styles inline blocs Kadence
echo ""
echo "--- Styles Kadence Blocks inline (si presents) ---"
echo "$PROD_HTML" | grep -oE '<style[^>]*kadence[^>]*>' | head

echo ""
echo "=== 4. Inspect fichier 952 et 1051 actuels en DB ==="
cd ~/inaricom.com/web-staging
wp post get 952 --field=post_content --url=$URL > /tmp/952-current.css 2>&1
wp post get 1051 --field=post_content --url=$URL > /tmp/1051-current.css 2>&1

echo "--- 952 : recherche hex rouges hardcodes ---"
grep -n '#E31E24\|rgb(227\|rgba(227' /tmp/952-current.css | head -5
RESULT=$?
if [ $RESULT -ne 0 ]; then
    echo "   (aucune occurrence - snippet 952 est propre)"
fi

echo ""
echo "--- 1051 : recherche hex rouges hardcodes ---"
grep -n '#E31E24\|rgb(227\|rgba(227' /tmp/1051-current.css | head -5
RESULT=$?
if [ $RESULT -ne 0 ]; then
    echo "   (aucune occurrence)"
fi

echo ""
echo "--- 1051 contenu complet (c'est court) ---"
cat /tmp/1051-current.css
