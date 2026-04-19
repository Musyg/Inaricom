#!/bin/bash
# Diagnostic : pourquoi Google Fonts encore servi apres update DB
set -e
cd ~/inaricom.com/web-staging

echo "=== 1. Verifier contenu DB actuel du post 347 ==="
wp post get 347 --field=post_content --url=https://staging.inaricom.com | head -12

echo ""
echo "=== 2. Chercher @import Google Fonts dans TOUS les snippets custom-css-js ==="
wp db query "SELECT ID, post_title FROM hiiw_posts WHERE post_type='custom-css-js' AND post_status='publish' AND post_content LIKE '%fonts.googleapis.com%';" --url=https://staging.inaricom.com

echo ""
echo "=== 3. Lister fichiers CSS generes par le plugin ==="
find wp-content/uploads -type d -iname '*custom-css*' 2>/dev/null
find wp-content/uploads -type f -iname '*.css' 2>/dev/null | head -10

echo ""
echo "=== 4. Chercher dossier du plugin simple-custom-css-and-js ==="
ls -la wp-content/plugins/simple-custom-css-and-js/ 2>&1 | head -10

echo ""
echo "=== 5. Chercher dossier cache/generated du plugin ==="
find wp-content -type d -iname '*custom-css-js*' 2>/dev/null
find wp-content -type f -iname '*.css' -path '*custom-css*' 2>/dev/null

echo ""
echo "=== 6. Methode d'injection (inline vs file) ==="
# Chercher dans HTML si tag style contient 347
curl -s -u 'staging:InaStg-Kx7m9vR2@pL' 'https://staging.inaricom.com/' > /tmp/home.html
grep -c '<style' /tmp/home.html || true
echo "   Nombre de balises <style>"
grep -B1 '@import url..https://fonts.googleapis' /tmp/home.html | head -5 || true

echo ""
echo "=== 7. Option plugin ==="
wp option get custom-css-js --format=json --url=https://staging.inaricom.com 2>&1 | head -5 || true
wp db query "SELECT option_name FROM hiiw_options WHERE option_name LIKE '%custom-css%' OR option_name LIKE '%simple-custom%';" --url=https://staging.inaricom.com
