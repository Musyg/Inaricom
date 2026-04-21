#!/bin/bash
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== 1. WP Customizer custom_css ==="
wp post list --post_type=custom_css --format=table --fields=ID,post_title,post_status,post_modified --url=$URL 2>&1 | head -10

echo ""
echo "=== 2. Chercher 'Stats mobile' ou '2x2' dans wp_options ==="
wp db query "SELECT option_name, LENGTH(option_value) as size FROM hiiw_options WHERE option_value LIKE '%Stats mobile%' OR option_value LIKE '%2x2%' OR option_value LIKE '%grid-template-columns: repeat(2, 1fr)%' LIMIT 10;" --url=$URL

echo ""
echo "=== 3. Chercher dans les custom_css posts ==="
for ID in $(wp post list --post_type=custom_css --format=ids --url=$URL); do
    wp post get $ID --field=post_content --url=$URL > /tmp/css-$ID.css
    if grep -q 'repeat(2, 1fr)' /tmp/css-$ID.css; then
        echo "TROUVE dans post $ID :"
        wp post get $ID --field=post_title --url=$URL
        grep -B2 -A5 'repeat(2, 1fr)' /tmp/css-$ID.css
    fi
done

echo ""
echo "=== 4. Chercher dans les snippets custom-css-js ==="
for ID in $(wp post list --post_type=custom-css-js --post_status=publish --format=ids --url=$URL); do
    CONTENT=$(wp post get $ID --field=post_content --url=$URL 2>/dev/null)
    if echo "$CONTENT" | grep -q 'repeat(2, 1fr)\|Stats mobile.*GRILLE\|2x2'; then
        TITLE=$(wp post get $ID --field=post_title --url=$URL 2>/dev/null)
        echo "TROUVE dans snippet [$ID] $TITLE"
    fi
done

echo ""
echo "=== 5. Chercher dans Kadence hooks (post_type kadence_element) ==="
wp post list --post_type=kadence_element --format=table --fields=ID,post_title,post_status --url=$URL 2>&1 | head

echo ""
echo "=== 6. Post meta d'options theme_mods_kadence ==="
wp db query "SELECT option_name FROM hiiw_options WHERE option_name LIKE '%theme_mods%';" --url=$URL
