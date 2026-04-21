#!/bin/bash
FILE=~/inaricom.com/web-staging/wp-content/uploads/custom-css-js/347.css

echo "=== Taille fichier statique ==="
wc -c "$FILE"

echo ""
echo "=== Section 61c dans fichier ==="
grep -c '61c\. ICONES' "$FILE"

echo ""
echo "=== Service-icon dans fichier ==="
grep -c 'service-icon' "$FILE"

echo ""
echo "=== Occurrences service-card { (avec ou sans !important pour text-align) ==="
grep -c 'text-align: center.*!important' "$FILE"

echo ""
echo "=== Taille post_content DB ==="
wp post get 347 --field=post_content --url=https://staging.inaricom.com | wc -c
