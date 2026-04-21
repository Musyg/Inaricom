#!/bin/bash
# Deploy ThemeMapper v2 avec support theme-neutre pour homepage
set -e

REMOTE_PATH=/home/toriispo/inaricom.com/web-staging/wp-content/plugins/inaricom-core/src/Theme/ThemeMapper.php
TS=$(date +%Y%m%d-%H%M%S)

echo "=== 1. Backup ThemeMapper actuel ==="
cp "$REMOTE_PATH" /tmp/ThemeMapper-before-neutre-$TS.php
wc -c "$REMOTE_PATH"
echo "   Backup : /tmp/ThemeMapper-before-neutre-$TS.php"

echo ""
echo "=== 2. Installer nouvelle version ==="
cp /tmp/ThemeMapper-new.php "$REMOTE_PATH"
wc -c "$REMOTE_PATH"

echo ""
echo "=== 3. Verif syntaxe PHP ==="
php -l "$REMOTE_PATH" 2>&1 | head -5

echo ""
echo "=== 4. Flush opcache + WP cache ==="
cd ~/inaricom.com/web-staging
wp cache flush --url=https://staging.inaricom.com 2>&1 | tail -1

# Purger l'opcache PHP si accessible
php -r "if (function_exists('opcache_reset')) { opcache_reset(); echo 'OPcache reset OK'; }" 2>&1 | tail -1

echo ""
echo "=== 5. Verif que la homepage pose bien theme-neutre ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

sleep 1
HTML_HOME=$(curl -s -u "$AUTH" "$URL/")
echo "--- / homepage ---"
echo "$HTML_HOME" | grep -oE 'body class="[^"]*"' | head -1

HTML_SHOP=$(curl -s -u "$AUTH" "$URL/shop/")
echo ""
echo "--- /shop/ (doit rester theme-or) ---"
echo "$HTML_SHOP" | grep -oE 'body class="[^"]*"' | head -1

HTML_ART=$(curl -s -u "$AUTH" "$URL/articles/")
echo ""
echo "--- /articles/ (doit rester theme-vert) ---"
echo "$HTML_ART" | grep -oE 'body class="[^"]*"' | head -1

HTML_CON=$(curl -s -u "$AUTH" "$URL/contact/")
echo ""
echo "--- /contact/ (doit rester theme-bleu) ---"
echo "$HTML_CON" | grep -oE 'body class="[^"]*"' | head -1

echo ""
echo "=== 6. Verif data-theme sur <html> ==="
echo "--- / ---"
echo "$HTML_HOME" | grep -oE 'dataset.theme=.[a-z]+' | head -1
echo "--- /shop/ ---"
echo "$HTML_SHOP" | grep -oE 'dataset.theme=.[a-z]+' | head -1

echo ""
echo "Backup : /tmp/ThemeMapper-before-neutre-$TS.php"
echo "Rollback : cp /tmp/ThemeMapper-before-neutre-$TS.php $REMOTE_PATH"
