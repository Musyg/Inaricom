#!/bin/bash
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'
curl -s -u "$AUTH" "$URL/" > /tmp/home.html

echo "=== 1. Toutes les regles .service-card dans HTML rendered ==="
grep -n '^\s*\.service-card' /tmp/home.html | head -20

echo ""
echo "=== 2. Toutes les regles .service-icon dans HTML rendered ==="
grep -n '\.service-icon' /tmp/home.html | head -20

echo ""
echo "=== 3. Contexte autour de la derniere regle service-card ==="
LAST_LINE=$(grep -n '\.service-card' /tmp/home.html | tail -1 | cut -d: -f1)
echo "Derniere occurrence ligne $LAST_LINE"
if [ -n "$LAST_LINE" ]; then
    START=$((LAST_LINE - 2))
    END=$((LAST_LINE + 30))
    sed -n "${START},${END}p" /tmp/home.html
fi

echo ""
echo "=== 4. Contexte autour de la derniere regle service-icon ==="
LAST_LINE=$(grep -n '\.service-icon' /tmp/home.html | tail -1 | cut -d: -f1)
echo "Derniere occurrence ligne $LAST_LINE"
if [ -n "$LAST_LINE" ]; then
    START=$((LAST_LINE - 2))
    END=$((LAST_LINE + 15))
    sed -n "${START},${END}p" /tmp/home.html
fi

echo ""
echo "=== 5. Ma section 61c est-elle bien dans le HTML ? ==="
grep -c '61c\. ICONES CARDS' /tmp/home.html
