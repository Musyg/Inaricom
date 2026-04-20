#!/bin/bash
# Diagnostic final : logo + bouton
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/" > /tmp/prod.html

echo "=== 1. LOGO : dimensions natives du <img> ==="
grep -oE '<img[^>]*class="custom-logo"[^>]*>' /tmp/prod.html | head -1
# Regarder width/height natifs
grep -oE '<img width="[^"]+" height="[^"]+"[^>]*custom-logo[^>]*>' /tmp/prod.html | head -1

echo ""
echo "=== 2. Le <img> est-il cache (opacity 0) quand theme-or actif ? ==="
# Verifier regle dans fichier statique
cd ~/inaricom.com/web-staging/wp-content/uploads/custom-css-js
grep -B1 -A3 'theme-or.*custom-logo' 347.css | head -20

echo ""
echo "=== 3. Halo blanc filter drop-shadow dans le 347 ? ==="
grep -c 'drop-shadow' 347.css
grep -B2 'drop-shadow(0 0 2px' 347.css | head -20

echo ""
echo "=== 4. BOUTON : TOUTES les regles .i-cta-box__btn dans fichier statique ==="
grep -n 'i-cta-box__btn' 347.css

echo ""
echo "=== 5. BOUTON : regles dans le HTML rendered ==="
# Combien de fois la regle apparait en HTML
grep -c '\.i-cta-box__btn' /tmp/prod.html
echo ""
echo "--- Toutes les regles i-cta-box__btn (extrait) ---"
# Extraire contexte
awk '/\.i-cta-box__btn/ {print NR": "$0}' /tmp/prod.html | head -20
