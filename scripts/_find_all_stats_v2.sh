#!/bin/bash
# Trouver TOUTES les regles .inari-hero-stats dans le HTML rendered
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/" > /tmp/home.html

echo "=== 1. Lignes contenant .inari-hero-stats ==="
grep -n '\.inari-hero-stats' /tmp/home.html | head -30

echo ""
echo "=== 2. Contexte autour de chaque occurrence (ex 15 lignes) ==="
# Pour chaque ligne qui contient la classe, afficher avec +-2 lignes
for LINE in $(grep -n '\.inari-hero-stats\s*{' /tmp/home.html | cut -d: -f1 | head -10); do
    START=$((LINE - 1))
    END=$((LINE + 8))
    echo "--- Ligne $LINE ---"
    sed -n "${START},${END}p" /tmp/home.html
    echo ""
done

echo ""
echo "=== 3. Liens stylesheets externes ==="
grep -oE '<link[^>]*stylesheet[^>]*' /tmp/home.html | head -10

echo ""
echo "=== 4. Style Kadence inline qui pourrait override ==="
grep -o 'kadence-global-inline-css' /tmp/home.html | head -5
grep -o 'kadence-woocommerce-inline-css' /tmp/home.html | head -5
