#!/bin/bash
# Hard delete 6 produits audit + 2 categories Woo
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== 1. Hard delete 6 produits audit ==="
for ID in 1044 1045 1046 1047 1048 1049; do
    TITLE=$(wp post get $ID --field=post_title --url=$URL 2>/dev/null || echo 'DEJA SUPPRIME')
    if [ "$TITLE" = "DEJA SUPPRIME" ]; then
        echo "   [SKIP] $ID deja absent"
    else
        wp post delete $ID --force --url=$URL 2>&1 | sed 's/^/   /'
    fi
done

echo ""
echo "=== 2. Delete 2 categories Woo vides ==="
# product_cat term_id 70 (Audit Web) et 71 (Audit Infrastructure)
for TERM_ID in 70 71; do
    NAME=$(wp term get $TERM_ID --taxonomy=product_cat --field=name --url=$URL 2>/dev/null || echo 'DEJA SUPPRIME')
    if [ "$NAME" = "DEJA SUPPRIME" ]; then
        echo "   [SKIP] term $TERM_ID deja absent"
    else
        wp term delete product_cat $TERM_ID --url=$URL 2>&1 | sed 's/^/   /'
    fi
done

echo ""
echo "=== 3. Flush cache + permalinks ==="
wp cache flush --url=$URL 2>&1 | tail -2
wp rewrite flush --hard --url=$URL 2>&1 | tail -2

echo ""
echo "=== 4. Verif post-suppression ==="
echo "--- Produits restants par categorie ---"
wp db query "
SELECT t.name AS category, COUNT(DISTINCT tr.object_id) AS n_products
FROM hiiw_terms t
JOIN hiiw_term_taxonomy tt ON t.term_id = tt.term_id
LEFT JOIN hiiw_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
LEFT JOIN hiiw_posts p ON tr.object_id = p.ID AND p.post_type = 'product' AND p.post_status IN ('publish', 'draft')
WHERE tt.taxonomy = 'product_cat'
GROUP BY t.term_id, t.name
ORDER BY n_products DESC, t.name;
" --url=$URL 2>&1

echo ""
echo "--- Produits audit restants (doit etre 0) ---"
wp db query "
SELECT ID, post_title, post_status 
FROM hiiw_posts 
WHERE post_type='product' 
  AND (post_title LIKE '%Audit%' OR post_name LIKE '%audit%');
" --url=$URL 2>&1

echo ""
echo "=== 5. Test HTTP des anciennes URLs (doivent renvoyer 404) ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
for SLUG in audit-infrastructure-approfondi audit-infrastructure-standard audit-infrastructure-essentiel audit-web-approfondi audit-web-standard audit-web-essentiel; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -u "$AUTH" "$URL/produit/$SLUG/")
    echo "   /produit/$SLUG/ -> HTTP $HTTP_CODE"
done

echo ""
echo "================================================================"
echo "Hard delete TERMINE"
echo "Backup complet : /tmp/audit-products-backup-20260419-203830/"
echo "================================================================"
