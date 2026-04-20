#!/bin/bash
# Le CSS .i-desc-card EXISTE dans le HTML mais nulle part dans les fichiers ou la DB
# => il doit etre INJECTE directement dans un snippet custom-css-js ou dans un template dynamique
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== Lister TOUS les snippets custom-css-js (au cas ou il y en a un non liste) ==="
wp post list --post_type=custom-css-js --post_status=any --format=table --fields=ID,post_title,post_status --url=$URL 2>&1

echo ""
echo "=== Chercher --i-red dans les snippets (TOUS, y compris draft/private) ==="
for ID in $(wp post list --post_type=custom-css-js --post_status=any --format=ids --url=$URL 2>&1); do
    COUNT=$(wp post get $ID --field=post_content --url=$URL 2>/dev/null | grep -c '\-\-i-red\|i-desc-card' || true)
    if [ "$COUNT" -gt 0 ]; then
        TITLE=$(wp post get $ID --field=post_title --url=$URL 2>/dev/null)
        STATUS=$(wp post get $ID --field=post_status --url=$URL 2>/dev/null)
        echo "   [$ID] $TITLE ($STATUS) : $COUNT occurrences"
    fi
done

echo ""
echo "=== Lister les Kadence Elements (CPT kadence_element) ==="
wp post list --post_type=kadence_element --post_status=any --format=table --fields=ID,post_title,post_status --url=$URL 2>&1

echo ""
echo "=== Rechercher dans wp_options TOUS les patterns --i- (variables courtes) ==="
wp db query "
SELECT option_name, LENGTH(option_value) AS size, SUBSTRING(option_value, 1, 100) AS preview
FROM hiiw_options
WHERE option_value LIKE '%--i-red%'
LIMIT 5;
" --url=$URL 2>&1

echo ""
echo "=== Plugins actifs sur ce site ==="
wp plugin list --status=active --format=table --fields=name,status,version --url=$URL 2>&1 | head -30
