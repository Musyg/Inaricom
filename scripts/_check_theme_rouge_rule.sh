#!/bin/bash
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'
curl -s -u "$AUTH" "$URL/shop/" > /tmp/shop.html

echo "=== 1. Selecteurs [data-theme=...] dans le CSS ==="
grep -oE '\[data-theme="[^"]*"\]' /tmp/shop.html | sort | uniq -c | sort -rn

echo ""
echo "=== 2. Regles pour [data-theme=\"rouge\"] (doit exister pour reset) ==="
grep -c 'data-theme="rouge"' /tmp/shop.html
grep -nB1 -A3 '\[data-theme="rouge"\]' /tmp/shop.html | head -30

echo ""
echo "=== 3. Regles pour [data-theme=\"or\"] ==="
grep -nB1 -A5 '\[data-theme="or"\]' /tmp/shop.html | head -40

echo ""
echo "=== 4. Selecteurs .theme-rouge (classe au lieu d'attribut) ==="
grep -oE '\.theme-rouge' /tmp/shop.html | wc -l
grep -nB1 -A5 '\.theme-rouge' /tmp/shop.html | head -40

echo ""
echo "=== 5. Verif ThemeMapper : attribut data-theme applique ==="
grep -oE 'data-theme="[^"]*"' /tmp/shop.html | sort | uniq -c

echo ""
echo "=== 6. Class 'theme-*' sur body (ajoutee par ThemeMapper ?) ==="
grep -oE '<body[^>]*class="[^"]*"' /tmp/shop.html | head -3
