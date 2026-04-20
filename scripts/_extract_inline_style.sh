#!/bin/bash
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com
AUTH='staging:InaStg-Kx7m9vR2@pL'

curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/" > /tmp/prod-full.html

echo "--- Lignes contenant i-desc-card ---"
grep -n 'i-desc-card' /tmp/prod-full.html | head -5

echo ""
echo "--- Contexte lignes 130-200 ---"
sed -n '130,200p' /tmp/prod-full.html
