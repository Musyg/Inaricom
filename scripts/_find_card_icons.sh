#!/bin/bash
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'
curl -s -u "$AUTH" "$URL/" > /tmp/home.html

echo "=== 1. Structure card service (icone bouclier) ==="
grep -B1 -A6 'class="service-card"' /tmp/home.html | head -20

echo ""
echo "=== 2. Structure card Audit Essentiel (page packages / image 2) ==="
# Chercher le terme "Audit Essentiel"
grep -oE '<[^>]*>[^<]*Audit Essentiel[^<]*' /tmp/home.html | head -3
echo ""
echo "--- URL de la page qui contient les packages ---"
grep -oE 'href="[^"]*audit[^"]*"' /tmp/home.html | head -5

echo ""
echo "=== 3. Regles CSS actuelles pour service-icon ==="
grep -B1 -A6 'service-icon\s*{' /tmp/home.html | head -30

echo ""
echo "=== 4. Regles CSS pour pkg-icon ou autre icone centree (image 2) ==="
grep -B1 -A6 'pkg-icon\|package-icon\|audit-card-icon' /tmp/home.html | head -30
