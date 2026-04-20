#!/bin/bash
# Extraction exhaustive
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/" > /tmp/prod-full.html

echo "=== LOGO : toutes les occurrences de custom-logo ==="
grep -oE '.{0,80}custom-logo.{0,200}' /tmp/prod-full.html | head -20

echo ""
echo "=== LOGO : src LogoLong4 presente ? ==="
grep -c 'LogoLong4' /tmp/prod-full.html
grep -c 'Design-sans-titre' /tmp/prod-full.html
echo "--- URLs Design-sans-titre presentes ---"
grep -oE '[a-zA-Z0-9/._-]*Design-sans-titre[a-zA-Z0-9._-]*' /tmp/prod-full.html | sort -u

echo ""
echo "=== LOGO : extrait lignes autour premiere occurrence 'custom-logo' ==="
awk '/custom-logo/ {print NR": "$0}' /tmp/prod-full.html | head -6

echo ""
echo "=== BOUTON i-cta-box__btn : extraction brute ==="
grep -oE '.{0,10}i-cta-box__btn[^;}]*[;}]' /tmp/prod-full.html | head -15
