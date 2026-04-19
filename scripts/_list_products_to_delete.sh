#!/bin/bash
# Inventaire complet produits WooCommerce + categories pour decision de suppression
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== 1. TOUS les produits WooCommerce (publish + draft + trash) ==="
wp post list --post_type=product --post_status=any --format=table --fields=ID,post_title,post_status,post_name --url=$URL 2>&1

echo ""
echo "=== 2. Categories WooCommerce ==="
wp term list product_cat --format=table --fields=term_id,name,slug,count --url=$URL 2>&1

echo ""
echo "=== 3. Mapping produit -> categorie ==="
wp db query "
SELECT p.ID, p.post_title, p.post_status,
       GROUP_CONCAT(t.name SEPARATOR ', ') AS categories,
       GROUP_CONCAT(t.slug SEPARATOR ', ') AS slugs
FROM hiiw_posts p
LEFT JOIN hiiw_term_relationships tr ON p.ID = tr.object_id
LEFT JOIN hiiw_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id AND tt.taxonomy = 'product_cat'
LEFT JOIN hiiw_terms t ON tt.term_id = t.term_id
WHERE p.post_type = 'product' AND p.post_status IN ('publish', 'draft')
GROUP BY p.ID
ORDER BY p.post_title;
" --url=$URL 2>&1

echo ""
echo "=== 4. Produits variations liees (pour les supprimer aussi si parent supprime) ==="
wp db query "
SELECT p.ID, p.post_title, p.post_parent, parent.post_title AS parent_title
FROM hiiw_posts p
LEFT JOIN hiiw_posts parent ON p.post_parent = parent.ID
WHERE p.post_type = 'product_variation' AND p.post_status IN ('publish', 'private')
ORDER BY p.post_parent;
" --url=$URL 2>&1
