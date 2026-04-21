#!/bin/bash
# Voir le contexte de la regle ligne 5375 (quelle media query ?)
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/" > /tmp/home.html

echo "=== Contexte ligne 5360-5400 pour voir si @media entoure ==="
sed -n '5360,5400p' /tmp/home.html

echo ""
echo "=== Remonter depuis 5375 pour trouver @media ou balise <style> ==="
awk 'NR<=5375 && (/@media/ || /<style/)' /tmp/home.html | tail -10

echo ""
echo "=== Test reel : verifier avec un point d'ancrage connu ==="
# Voir dans quel <style> block on est ligne 5375
STYLE_STARTS=$(grep -nb '<style' /tmp/home.html | cut -d: -f1)
STYLE_ENDS=$(grep -nb '</style>' /tmp/home.html | cut -d: -f1)

echo "Balises <style> a ces lignes :"
grep -n '<style' /tmp/home.html | head -10
echo ""
echo "Fermetures </style> a ces lignes :"
grep -n '</style>' /tmp/home.html | head -10
