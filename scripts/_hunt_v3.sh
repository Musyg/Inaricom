#!/bin/bash
# Chasse ultime : le CSS doit venir d'un template PHP qui genere ce markup
cd ~/inaricom.com/web-staging

echo "=== 1. Lister les plugins actifs manuellement ==="
ls wp-content/plugins/ 2>&1 | head -30

echo ""
echo "=== 2. Grep recursif *tres* large ==="
grep -rn '\-\-i-red:' wp-content 2>/dev/null | head -20
echo ""
grep -rn '\.i-desc-card{' wp-content 2>/dev/null | head -20

echo ""
echo "=== 3. Chercher dans wp_posts de type autre que product/css ==="
wp db query "
SELECT ID, post_title, post_type, post_status, LENGTH(post_content) AS size
FROM hiiw_posts
WHERE post_content LIKE '%i-desc-card%' OR post_content LIKE '%--i-red%'
LIMIT 10;
" --url=https://staging.inaricom.com 2>&1

echo ""
echo "=== 4. Fetcher le HTML et voir sur QUELLE balise <style> c'est ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
curl -s -u "$AUTH" "https://staging.inaricom.com/produit/nvidia-jetson-orin-nano-super/" > /tmp/prod-full.html

# Pour chaque balise <style>, afficher son id et savoir laquelle contient i-desc-card
python3 << 'EOF'
import re

with open('/tmp/prod-full.html') as f:
    html = f.read()

# Extraire toutes les balises <style>
pattern = r'<style([^>]*)>([^<]*(?:(?!</style>).)*)</style>'
for m in re.finditer(pattern, html, re.DOTALL):
    attrs = m.group(1)
    content = m.group(2)
    if 'i-desc-card' in content or '--i-red' in content:
        print(f"FOUND in style tag with attrs: {attrs[:150]}")
        print(f"Position in HTML: {m.start()}")
        # Afficher le debut
        print(f"First 500 chars of style:")
        print(content[:500])
        print("---")
        break
EOF
