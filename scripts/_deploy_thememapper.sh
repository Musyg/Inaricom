#!/bin/bash
# Deployer le nouveau ThemeMapper.php en staging
set -e
cd ~/inaricom.com/web-staging

TARGET=wp-content/plugins/inaricom-core/src/Theme/ThemeMapper.php

echo "=== 1. Backup ancien ThemeMapper ==="
TS=$(date +%Y%m%d-%H%M%S)
cp "$TARGET" "/tmp/ThemeMapper-before-wooblog-$TS.php"
ls -la /tmp/ThemeMapper-before-wooblog-$TS.php

echo ""
echo "=== 2. Remplacer par nouvelle version ==="
cp /tmp/ThemeMapper-new.php "$TARGET"

echo ""
echo "=== 3. Sanity-check PHP ==="
php -l "$TARGET"

echo ""
echo "=== 4. Flush cache ==="
wp cache flush --url=https://staging.inaricom.com 2>&1 | tail -2

echo ""
echo "=== 5. Test resolution du theme sur plusieurs pages ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

echo ""
echo "--- Test fiche produit (doit etre OR) ---"
HTML=$(curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/")
echo "   data-theme injected:"
echo "$HTML" | grep -oE "documentElement.dataset.theme='[^']+'" | head -3
echo "   body class :"
echo "$HTML" | grep -oE 'class="[^"]*theme-[^ "]+[^"]*"' | head -1 | grep -oE 'theme-[a-z]+'

echo ""
echo "--- Test boutique (doit etre OR) ---"
HTML=$(curl -s -u "$AUTH" "$URL/boutique/")
echo "   data-theme injected:"
echo "$HTML" | grep -oE "documentElement.dataset.theme='[^']+'" | head -3
echo "   body class :"
echo "$HTML" | grep -oE 'class="[^"]*theme-[^ "]+[^"]*"' | head -1 | grep -oE 'theme-[a-z]+'

echo ""
echo "--- Test page contact (doit etre BLEU) ---"
HTML=$(curl -s -u "$AUTH" "$URL/contact/")
echo "   data-theme injected:"
echo "$HTML" | grep -oE "documentElement.dataset.theme='[^']+'" | head -3
echo "   body class :"
echo "$HTML" | grep -oE 'class="[^"]*theme-[^ "]+[^"]*"' | head -1 | grep -oE 'theme-[a-z]+'

echo ""
echo "--- Test service single (doit etre ROUGE, pilier securite) ---"
HTML=$(curl -s -u "$AUTH" "$URL/services/test-pentest-audit-ia/")
echo "   data-theme injected (vide = rouge defaut):"
echo "$HTML" | grep -oE "documentElement.dataset.theme='[^']+'" | head -3 || echo "   (aucun = rouge defaut OK)"
echo "   body class :"
echo "$HTML" | grep -oE 'class="[^"]*theme-[^ "]+[^"]*"' | head -1 | grep -oE 'theme-[a-z]+'

echo ""
echo "--- Test homepage (defaut rouge) ---"
HTML=$(curl -s -u "$AUTH" "$URL/")
echo "   data-theme injected (vide = rouge defaut):"
echo "$HTML" | grep -oE "documentElement.dataset.theme='[^']+'" | head -3 || echo "   (aucun = rouge defaut OK)"
echo "   body class :"
echo "$HTML" | grep -oE 'class="[^"]*theme-[^ "]+[^"]*"' | head -1 | grep -oE 'theme-[a-z]+'

echo ""
echo "================================================================"
echo "Deploy ThemeMapper TERMINE"
echo "Backup : /tmp/ThemeMapper-before-wooblog-$TS.php"
echo "================================================================"
