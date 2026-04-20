#!/bin/bash
# Trouver d'ou vient .i-desc-card et var(--i-red)
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com
AUTH='staging:InaStg-Kx7m9vR2@pL'

echo "=== Chercher .i-desc-card dans tous les snippets 347/684/740/952/1051/etc ==="
for ID in 347 442 443 496 497 508 672 673 684 740 768 952 1051; do
    RESULT=$(wp post get $ID --field=post_content --url=$URL 2>/dev/null | grep -c 'i-desc-card\|--i-red' || true)
    if [ "$RESULT" -gt 0 ]; then
        echo "--- Snippet $ID : $RESULT occurrences ---"
        wp post get $ID --field=post_content --url=$URL 2>/dev/null | grep -n 'i-desc-card\|--i-red' | head -10
        echo ""
    fi
done

echo "=== Si rien trouve dans snippets, chercher dans theme/plugins PHP ==="
echo "--- grep recursif pour 'i-desc-card' ---"
grep -rn 'i-desc-card' wp-content/themes wp-content/plugins 2>/dev/null | grep -v '.min.' | head -10

echo ""
echo "--- grep recursif pour '--i-red' ---"
grep -rn '\-\-i-red' wp-content/themes wp-content/plugins 2>/dev/null | grep -v '.min.' | head -10

echo ""
echo "=== Chercher dans le HTML rendered si c'est inline d'un bloc ==="
PROD_HTML=$(curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/")
echo "$PROD_HTML" | grep -oE '<style[^>]*>[^<]*i-desc-card[^<]*' | head -2
