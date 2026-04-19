#!/bin/bash
# B'.3 etape 1 : decouvrir les meta keys qui pourraient contenir du CSS/JS
# Sans hypothese : on cherche largement toutes les meta_keys suspectes
set -e

cd ~/inaricom.com/web-staging

echo "=== 1. Toutes les meta_keys distinctes commencant par _kad_ ==="
wp db query "SELECT DISTINCT meta_key, COUNT(*) as n FROM hiiw_postmeta WHERE meta_key LIKE '\\_kad\\_%' GROUP BY meta_key ORDER BY n DESC;" --url=https://staging.inaricom.com 2>&1 | head -40

echo ""
echo "=== 2. Toutes les meta_keys contenant 'css' ou 'code' ou 'style' ==="
wp db query "SELECT DISTINCT meta_key, COUNT(*) as n FROM hiiw_postmeta WHERE meta_key LIKE '%css%' OR meta_key LIKE '%\\_code\\_%' OR meta_key LIKE '%style%' OR meta_key LIKE '%script%' GROUP BY meta_key ORDER BY n DESC;" --url=https://staging.inaricom.com 2>&1 | head -40

echo ""
echo "=== 3. Meta values NON VIDES parmi les candidats Kadence ==="
# On cherche les meta_keys dont au moins UNE valeur est non vide et > 10 chars
wp db query "
SELECT pm.meta_key, COUNT(*) as n, AVG(CHAR_LENGTH(pm.meta_value)) as avg_size, MAX(CHAR_LENGTH(pm.meta_value)) as max_size
FROM hiiw_postmeta pm
WHERE (pm.meta_key LIKE '\\_kad\\_%'
   OR pm.meta_key LIKE '%\\_css\\_%'
   OR pm.meta_key LIKE '%header_code%'
   OR pm.meta_key LIKE '%footer_code%'
   OR pm.meta_key LIKE '%custom_code%')
  AND pm.meta_value IS NOT NULL
  AND CHAR_LENGTH(pm.meta_value) > 10
GROUP BY pm.meta_key
ORDER BY n DESC;
" --url=https://staging.inaricom.com 2>&1

echo ""
echo "=== 4. Scan options table pour CSS additionnel Customizer ==="
wp db query "
SELECT option_name, CHAR_LENGTH(option_value) as size
FROM hiiw_options
WHERE option_name LIKE '%custom_css%'
   OR option_name LIKE '%additional_css%'
   OR option_name LIKE 'theme_mods_%'
ORDER BY size DESC
LIMIT 10;
" --url=https://staging.inaricom.com 2>&1

echo ""
echo "=== 5. Existe-t-il des posts type custom_css (Customizer Additional CSS) ==="
wp db query "SELECT ID, post_title, post_status, CHAR_LENGTH(post_content) as size FROM hiiw_posts WHERE post_type='custom_css' ORDER BY ID;" --url=https://staging.inaricom.com 2>&1

echo ""
echo "=== 6. Existe-t-il des Kadence Elements ==="
wp db query "SELECT ID, post_title, post_status, CHAR_LENGTH(post_content) as size FROM hiiw_posts WHERE post_type='kadence_element' AND post_status='publish' ORDER BY ID;" --url=https://staging.inaricom.com 2>&1

echo ""
echo "=== FIN ==="
