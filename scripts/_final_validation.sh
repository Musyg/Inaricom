#!/bin/bash
# Verifier que les fonts Inter sont bien telechargeables avec les bons headers CORS
AUTH='staging:InaStg-Kx7m9vR2@pL'
BASE='https://staging.inaricom.com/wp-content/themes/kadence-child/assets/fonts/inter'

echo "=== Test headers fonts pour chaque poids ==="
for weight in 400 500 600 700; do
    URL="$BASE/inter-$weight.woff2"
    RESPONSE=$(curl -sI -u "$AUTH" "$URL" --compressed)
    STATUS=$(echo "$RESPONSE" | grep -i '^HTTP' | awk '{print $2}' | tr -d '\r')
    CTYPE=$(echo "$RESPONSE" | grep -i 'content-type' | awk -F': ' '{print $2}' | tr -d '\r')
    CACHE=$(echo "$RESPONSE" | grep -i 'cache-control' | awk -F': ' '{print $2}' | tr -d '\r')
    SIZE=$(echo "$RESPONSE" | grep -i 'content-length' | awk '{print $2}' | tr -d '\r')
    echo "   inter-$weight.woff2 : HTTP $STATUS, $SIZE octets, type=$CTYPE"
done

echo ""
echo "=== Test preload est injecte par le child theme functions.php ==="
echo "   (normalement le child theme nest pas actif, donc pas de preload attendu)"
curl -s -u "$AUTH" 'https://staging.inaricom.com/' | grep -oE '<link[^>]*rel="preload"[^>]*>' | head -5

echo ""
echo "=== Test complet : simuler un navigateur ==="
curl -s -u "$AUTH" \
  -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  "https://staging.inaricom.com/" > /tmp/staging-full.html

HTML_SIZE=$(wc -c < /tmp/staging-full.html)
echo "   HTML homepage: $HTML_SIZE octets"

# Extraire les URLs de fonts referencees
echo ""
echo "=== URLs fonts referencees dans HTML ==="
grep -oE 'https://[^"]*\.woff2' /tmp/staging-full.html | sort -u

echo ""
echo "=== Toutes les URLs externes (hors inaricom.com) ==="
grep -oE 'https?://[^"'"'"']*' /tmp/staging-full.html | grep -v 'inaricom.com' | sort -u | head -20
