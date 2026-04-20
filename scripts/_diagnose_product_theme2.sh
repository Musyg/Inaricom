#!/bin/bash
# Verifier precisement pourquoi fiche produit ne reagit pas
set -e
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

echo "=== 1. Recuperer fiche produit + chercher var(--inari-red) actif ==="
PROD_HTML=$(curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/")

# Les spans des titres hero utilisent var(--inari-red)
echo "--- Structure titre produit ---"
echo "$PROD_HTML" | grep -oE '<h1[^>]*product[^>]*>[^<]+</h1>' | head -3

echo ""
echo "=== 2. Identifier les bullets rouges visibles sur les <li> ==="
# Les bullets rouges sont probablement des markers CSS list-style ou ::before 
# Chercher dans les styles inline

# Regarder le contenu brut du produit (post_content)
cd ~/inaricom.com/web-staging
wp post get 896 --field=post_content --url=$URL > /tmp/product-896.content
echo "--- Post content produit 896 (premiers 2000 chars) ---"
head -c 2000 /tmp/product-896.content

echo ""
echo ""
echo "=== 3. Chercher dans le post_content les styles/class qui ont des bullets rouges ==="
grep -oE 'class="[^"]*"' /tmp/product-896.content | sort -u | head -20
echo ""
grep -oE 'style="[^"]*"' /tmp/product-896.content | head -5

echo ""
echo "=== 4. CSS rendered pour la fiche - chercher les ::before / list-style ==="
echo "$PROD_HTML" | grep -oE '[^{]*::before[^}]*{[^}]*' | grep -E 'color|background' | head -10

echo ""
echo "=== 5. Les bullets rouges viennent d'ou ? Test avec JS disabled ==="
# On verifie si data-theme est bien sette au runtime via inspection
# Mais on peut pas exe JS dans curl, donc on cherche le snippet 443 (fox) ou 496 (switcher) dans le HTML
echo "--- Snippet 496 (switcher JS) charge ? ---"
echo "$PROD_HTML" | grep -c 'inaricom-theme' || true
echo "   occurrences 'inaricom-theme' (cle localStorage)"

echo "--- Snippet 497 (markup switcher HTML) present ? ---"
echo "$PROD_HTML" | grep -c 'theme-switcher' || true
echo "   occurrences 'theme-switcher' (markup HTML)"

echo ""
echo "=== 6. Conflit potentiel : Kadence applique des couleurs en inline ? ==="
# Chercher les styles inline Kadence qui auraient des couleurs rouge fixees
echo "$PROD_HTML" | grep -oE 'style="[^"]*color[^"]*"' | grep -iE '#E31E24|rgb\(227' | head -5
