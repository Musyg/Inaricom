#!/bin/bash
# Verifier : les fiches produits ont-elles JAMAIS reagi au theme ? 
# Test : restaurer backup PRE-B.4 et refaire curl, voir si reactive au theme
# Si non -> B.4 n'a rien casse, c'est un bug pre-existant
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com
AUTH='staging:InaStg-Kx7m9vR2@pL'

echo "=== 1. Verifier : le snippet 347 (post B.4) contient-il des regles pour .i-desc-card ? ==="
wp post get 347 --field=post_content --url=$URL | grep -c 'i-desc-card\|--i-red' || true
echo ""
echo "=== 2. Le HTML de la fiche produit contient ces regles INDEPENDAMMENT du 347 ==="
echo "Les styles inline viennent du post_content (description Gutenberg) du produit."
echo ""
echo "--- Apercu post_content du produit 896 (Jetson Orin Nano Super) ---"
wp post get 896 --field=post_content --url=$URL | head -c 500
echo ""
echo "..."
echo ""
echo "--- Si le post_content contient '<style>' ---"
HAS_STYLE=$(wp post get 896 --field=post_content --url=$URL | grep -c '<style' || true)
echo "   Balises <style> dans post_content du produit : $HAS_STYLE"

echo ""
echo "=== 3. Chercher les produits avec des styles inline dans leur contenu ==="
wp db query "
SELECT ID, post_title, 
       LENGTH(post_content) AS content_size,
       post_content LIKE '%<style%' AS has_inline_style
FROM hiiw_posts 
WHERE post_type='product' AND post_status='publish'
ORDER BY ID;
" --url=$URL 2>&1 | head -20
