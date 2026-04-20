#!/bin/bash
# Trouver OU exactement se trouve le CSS .i-desc-card dans les fichiers du site
set -e
cd ~/inaricom.com/web-staging

echo "=== Grep recursif dans wp-content + mu-plugins pour --i-red et i-desc-card ==="
grep -rn '\-\-i-red\|i-desc-card' wp-content/ 2>/dev/null | grep -v '\.min\.\|node_modules\|.git' | head -20

echo ""
echo "=== Chercher dans post_meta (peut-etre un meta personnalise) ==="
wp db query "
SELECT pm.post_id, p.post_title, pm.meta_key, LENGTH(pm.meta_value) AS size
FROM hiiw_postmeta pm
JOIN hiiw_posts p ON pm.post_id = p.ID
WHERE pm.meta_value LIKE '%i-desc-card%' OR pm.meta_value LIKE '%--i-red%'
LIMIT 10;
" --url=https://staging.inaricom.com 2>&1

echo ""
echo "=== Chercher dans wp_options (option globale injectee) ==="
wp db query "
SELECT option_name, LENGTH(option_value) AS size
FROM hiiw_options
WHERE option_value LIKE '%i-desc-card%' OR option_value LIKE '%--i-red%'
LIMIT 10;
" --url=https://staging.inaricom.com 2>&1

echo ""
echo "=== Chercher dans le theme actif + child theme ==="
find wp-content/themes/kadence wp-content/themes/kadence-child -type f \( -name "*.php" -o -name "*.css" -o -name "*.js" \) -exec grep -l 'i-desc-card\|--i-red' {} \; 2>/dev/null | head
