#!/bin/bash
# Verifier si la section 60b est bien dans le fichier statique servi
cd ~/inaricom.com/web-staging/wp-content/uploads/custom-css-js

ls -la 347.css

echo ""
echo "=== Recherche section 60b dans fichier statique 347 ==="
grep -c '60b. OVERRIDES' 347.css
echo ""
echo "--- Lignes autour section 60b ---"
grep -A8 '60b. OVERRIDES' 347.css | head -30

echo ""
echo "=== Notre regle .i-cta-box__btn avec !important ? ==="
grep -c 'i-cta-box__btn' 347.css
echo ""
grep -B1 -A5 'i-cta-box__btn \{' 347.css | head -15

echo ""
echo "=== Fichier chargé dans le HTML ? ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'
HTML=$(curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/")
echo "$HTML" | grep -oE 'wp-content/uploads/custom-css-js/347[^"]*' | head -2

echo ""
echo "=== Tailles comparees ==="
wc -c 347.css
echo "   doit etre ~91310"
