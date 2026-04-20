#!/bin/bash
# Extraire contexte autour de toutes les regles i-cta-box
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/" > /tmp/prod-full.html

echo "=== Positions de i-cta-box dans HTML ==="
grep -bn 'i-cta-box' /tmp/prod-full.html | head -10

echo ""
echo "=== Lignes 5170-5260 (autour template i-cta-box) ==="
awk 'NR>=5170 && NR<=5260' /tmp/prod-full.html | grep -v '^\s*$' | head -40

echo ""
echo "=== Rechercher debut regle .i-cta-box (multi-lignes ou compacte) ==="
grep -n 'i-cta-box' /tmp/prod-full.html | head -30
