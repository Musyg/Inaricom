#!/bin/bash
# Smoke test HTTP fonts self-hosted staging
AUTH='staging:InaStg-Kx7m9vR2@pL'
BASE='https://staging.inaricom.com'

echo "=== Test 1: Font WOFF2 accessible ? ==="
STATUS=$(curl -sI "${BASE}/wp-content/themes/kadence-child/assets/fonts/inter/inter-400.woff2" -u "$AUTH" -o /dev/null -w "%{http_code}")
SIZE=$(curl -sI "${BASE}/wp-content/themes/kadence-child/assets/fonts/inter/inter-400.woff2" -u "$AUTH" | grep -i 'content-length' | awk '{print $2}' | tr -d '\r')
CTYPE=$(curl -sI "${BASE}/wp-content/themes/kadence-child/assets/fonts/inter/inter-400.woff2" -u "$AUTH" | grep -i 'content-type' | awk '{print $2}' | tr -d '\r')
echo "   HTTP: $STATUS"
echo "   Size: $SIZE octets"
echo "   Content-Type: $CTYPE"

echo ""
echo "=== Test 2: Homepage HTML contient references fonts self-hosted ? ==="
HTML=$(curl -s "${BASE}/" -u "$AUTH")
N_SELFHOST=$(echo "$HTML" | grep -c 'kadence-child/assets/fonts/inter' || true)
echo "   Matches 'kadence-child/assets/fonts/inter': $N_SELFHOST"

echo ""
echo "=== Test 3: Homepage HTML contient encore Google Fonts ? ==="
N_GOOGLE=$(echo "$HTML" | grep -c 'fonts.googleapis.com' || true)
N_GFONTS2=$(echo "$HTML" | grep -c 'fonts.gstatic.com' || true)
echo "   Matches 'fonts.googleapis.com': $N_GOOGLE"
echo "   Matches 'fonts.gstatic.com':    $N_GFONTS2"

echo ""
echo "=== Test 4: CSS 347 contient @font-face ? ==="
N_FONTFACE=$(echo "$HTML" | grep -c '@font-face' || true)
echo "   Matches '@font-face' inline: $N_FONTFACE"

echo ""
echo "=== Test 5: Section 40 deprecated ? ==="
N_DEPRECATED=$(echo "$HTML" | grep -c 'DEPRECATED' || true)
N_THEMEDOTS=$(echo "$HTML" | grep -c 'THEME SWITCHER — DOTS' || true)
echo "   Matches 'DEPRECATED': $N_DEPRECATED"
echo "   Matches 'THEME SWITCHER — DOTS' (ancien code): $N_THEMEDOTS"

echo ""
echo "=== Resume ==="
if [ "$STATUS" = "200" ] && [ "$N_SELFHOST" -gt 0 ] && [ "$N_GOOGLE" = "0" ] && [ "$N_GFONTS2" = "0" ]; then
    echo "[OK] Fonts self-hosted fonctionne, plus de Google Fonts"
else
    echo "[ATTENTION] Verifier manuellement"
fi
if [ "$N_THEMEDOTS" = "0" ]; then
    echo "[OK] Section 40 vestige supprimee"
else
    echo "[ATTENTION] Section 40 encore presente"
fi
