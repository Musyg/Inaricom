#!/bin/bash
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== 1. Liste des menus ==="
wp menu list --url=$URL

echo ""
echo "=== 2. Items de chaque menu ==="
for SLUG in $(wp menu list --field=slug --url=$URL); do
    echo ""
    echo "--- Menu : $SLUG ---"
    wp menu item list $SLUG --url=$URL --fields=db_id,type,title,status,url,position 2>&1
done

echo ""
echo "=== 3. Pages disponibles a ajouter ==="
wp post list --post_type=page --post_status=publish --url=$URL --format=table --fields=ID,post_title,post_name | head -20

echo ""
echo "=== 4. CPT / archives disponibles ==="
wp post list --post_type=product --posts_per_page=5 --url=$URL --format=table --fields=ID,post_title 2>&1 | head -10
echo ""
wp post list --post_type=post --posts_per_page=3 --url=$URL --format=table --fields=ID,post_title 2>&1 | head -10

echo ""
echo "=== 5. URL boutique WooCommerce ==="
wp option get woocommerce_shop_page_id --url=$URL
SHOP_ID=$(wp option get woocommerce_shop_page_id --url=$URL)
if [ -n "$SHOP_ID" ] && [ "$SHOP_ID" != "0" ]; then
    wp post get $SHOP_ID --url=$URL --fields=ID,post_title,post_name,post_status
fi

echo ""
echo "=== 6. URL page blog ==="
wp option get page_for_posts --url=$URL
echo ""
wp option get show_on_front --url=$URL
wp option get page_on_front --url=$URL
