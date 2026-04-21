#!/bin/bash
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== Recherche dans wp_posts (tous post_types) ==="
wp db query "
SELECT ID, post_type, post_status, post_title, LENGTH(post_content) as size
FROM hiiw_posts 
WHERE post_content LIKE '%Stats mobile%' 
   OR post_content LIKE '%GRILLE 2x2%'
   OR post_content LIKE '%repeat(2, 1fr)%'
ORDER BY post_type, ID;" --url=$URL

echo ""
echo "=== Recherche dans postmeta (meta_value) ==="
wp db query "
SELECT post_id, meta_key, LENGTH(meta_value) as size
FROM hiiw_postmeta 
WHERE meta_value LIKE '%Stats mobile%' 
   OR meta_value LIKE '%GRILLE 2x2%'
LIMIT 20;" --url=$URL

echo ""
echo "=== Recherche dans wp_options ==="
wp db query "
SELECT option_name, LENGTH(option_value) as size 
FROM hiiw_options 
WHERE option_value LIKE '%Stats mobile — GRILLE%'
   OR option_value LIKE '%Stats mobile%GRILLE%'
LIMIT 10;" --url=$URL
