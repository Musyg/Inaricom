#!/bin/bash
# Debug CSS : identifier comment le plugin Simple CSS&JS sert 347
AUTH='staging:InaStg-Kx7m9vR2@pL'
BASE='https://staging.inaricom.com'
TMP=/tmp/staging-home.html

curl -s -u "$AUTH" "${BASE}/" > "$TMP"
echo "=== HTML homepage taille ==="
wc -c "$TMP"

echo ""
echo "=== Liens CSS (href=...css...) ==="
grep -oE 'href=[^>]*\.css[^>]*' "$TMP" | head -15

echo ""
echo "=== Styles inline avec @font-face ==="
grep -c '@font-face' "$TMP" || true

echo ""
echo "=== Scripts reference fonts staging ==="
grep -c 'staging.inaricom.com/wp-content/themes/kadence-child' "$TMP" || true

echo ""
echo "=== Sources de Google Fonts trouvees ==="
grep -oE '[^"]*fonts.googleapis.com[^"]*' "$TMP" | sort -u

echo ""
echo "=== URL endpoint custom-css-js plugin ==="
grep -oE '[^"]*custom-css[^"]*\.css[^"]*' "$TMP" | sort -u | head -5
