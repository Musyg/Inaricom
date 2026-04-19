#!/bin/bash
# Verification post-consolidation : comptage exact des sources
set -e
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/" > /tmp/home-after-b3.html

echo "=== 1. Compter les balises <style> ==="
N_STYLE=$(grep -c '<style' /tmp/home-after-b3.html || true)
echo "   Balises <style> dans HTML: $N_STYLE"

echo ""
echo "=== 2. Verifier que le Customizer (#362) ne sert plus de CSS WooCommerce ==="
echo "   Compter contextes d'apparition de 'woo-archive-action-on-hover' :"
grep -n 'woo-archive-action-on-hover' /tmp/home-after-b3.html | head -10

echo ""
echo "=== 3. Compter [data-theme='rouge'] dans HTML (doit etre 0 post-suppression) ==="
grep -c 'data-theme="rouge"' /tmp/home-after-b3.html || true
echo "   (le switcher JS mettra data-theme='rouge' sur <html> au runtime, mais PAS dans le CSS statique)"

echo ""
echo "=== 4. Verifier bloc Customizer CSS (Kadence) ==="
# Kadence Customizer injecte dans un style 'kadence-global-frontend-inline-css' ou similaire
grep -E 'kadence.*inline|custom_css|additional-css' /tmp/home-after-b3.html | head -5

echo ""
echo "=== 5. Taille totale HTML ==="
wc -c /tmp/home-after-b3.html
