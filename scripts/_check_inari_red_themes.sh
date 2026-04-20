#!/bin/bash
# Verifier redefinition de --inari-red pour chaque theme dans le HTML
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/" > /tmp/prod-full.html

echo "=== Redefinition --inari-red par theme ==="
grep -nB1 -A3 '\-\-inari-red:' /tmp/prod-full.html | head -60
