#!/bin/bash
# Test theme injection - voir si le script est bien dans <head>
set -e
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

echo "=== Fiche produit ==="
HTML=$(curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/")
echo "--- Script inline dataset.theme dans <head> ---"
echo "$HTML" | grep -oE '<script>document\.documentElement\.dataset\.theme[^<]*</script>' | head -3
echo ""
echo "--- body class theme-X ---"
echo "$HTML" | grep -oE 'class="[^"]*theme-(rouge|or|vert|bleu)[^"]*"' | head -2

echo ""
echo "=== Boutique (/shop/ et /boutique/) ==="
for SHOP_SLUG in shop boutique; do
    echo "--- /$SHOP_SLUG/ HTTP status ---"
    curl -s -o /dev/null -w "%{http_code}\n" -u "$AUTH" "$URL/$SHOP_SLUG/"
done

echo ""
echo "=== Trouver URL correcte de la boutique Woo ==="
cd ~/inaricom.com/web-staging
wp option get woocommerce_shop_page_id --url=$URL
wp eval "echo get_permalink(get_option('woocommerce_shop_page_id')) . PHP_EOL;" --url=$URL

echo ""
echo "=== Page contact ==="
HTML=$(curl -s -u "$AUTH" "$URL/contact/")
echo "--- Script inline ---"
echo "$HTML" | grep -oE '<script>document\.documentElement\.dataset\.theme[^<]*</script>' | head -2
echo "--- body class ---"
echo "$HTML" | grep -oE 'class="[^"]*theme-(rouge|or|vert|bleu)[^"]*"' | head -2

echo ""
echo "=== Page service single ==="
HTML=$(curl -s -u "$AUTH" "$URL/services/test-pentest-audit-ia/")
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -u "$AUTH" "$URL/services/test-pentest-audit-ia/")
echo "HTTP: $HTTP_CODE"
echo "--- Script inline (doit etre vide = rouge defaut) ---"
echo "$HTML" | grep -oE '<script>document\.documentElement\.dataset\.theme[^<]*</script>' | head -2
echo "--- body class ---"
echo "$HTML" | grep -oE 'class="[^"]*theme-(rouge|or|vert|bleu)[^"]*"' | head -2

echo ""
echo "=== Homepage ==="
HTML=$(curl -s -u "$AUTH" "$URL/")
echo "--- Script inline (doit etre vide = rouge defaut) ---"
echo "$HTML" | grep -oE '<script>document\.documentElement\.dataset\.theme[^<]*</script>' | head -2
echo "--- body class ---"
echo "$HTML" | grep -oE 'class="[^"]*theme-(rouge|or|vert|bleu)[^"]*"' | head -2
