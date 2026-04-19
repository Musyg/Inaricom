#!/bin/bash
# B'.3 etape 2 : extraction CSS Customizer + theme_mods_kadence
set -e

cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

mkdir -p /tmp/customizer-dump

echo "=== 1. Dump post 362 (Additional CSS Kadence) ==="
wp post get 362 --field=post_content --url=$URL > /tmp/customizer-dump/additional-css-362.css
SIZE=$(wc -c < /tmp/customizer-dump/additional-css-362.css)
LINES=$(wc -l < /tmp/customizer-dump/additional-css-362.css)
echo "   Taille: $SIZE octets / $LINES lignes"

echo ""
echo "=== 2. Premieres lignes (20) ==="
head -20 /tmp/customizer-dump/additional-css-362.css

echo ""
echo "=== 3. Chercher @import Google Fonts ou patterns louches ==="
grep -c 'fonts.googleapis\|fonts.gstatic' /tmp/customizer-dump/additional-css-362.css || true
echo "   matches Google Fonts CDN"
grep -c '!important' /tmp/customizer-dump/additional-css-362.css || true
echo "   matches !important"
grep -c '@media' /tmp/customizer-dump/additional-css-362.css || true
echo "   matches @media"
grep -c '\\[data-theme' /tmp/customizer-dump/additional-css-362.css || true
echo "   matches [data-theme (switcher custom)"

echo ""
echo "=== 4. Dump theme_mods_kadence (option) ==="
wp option get theme_mods_kadence --format=json --url=$URL > /tmp/customizer-dump/theme_mods_kadence.json 2>&1
SIZE=$(wc -c < /tmp/customizer-dump/theme_mods_kadence.json)
echo "   Taille JSON: $SIZE octets"

echo ""
echo "=== 5. Cles contenant 'code', 'css', 'script', 'header', 'footer' dans theme_mods ==="
python3 << 'EOF'
import json
with open('/tmp/customizer-dump/theme_mods_kadence.json') as f:
    data = json.load(f)

suspect_keys = []
for k, v in data.items():
    kl = k.lower()
    if any(word in kl for word in ['code', 'css', 'script', 'header_html', 'footer_html', 'custom']):
        suspect_keys.append((k, v))

if not suspect_keys:
    print("   Aucune cle suspecte trouvee dans theme_mods_kadence")
else:
    for k, v in suspect_keys:
        vs = str(v)
        size = len(vs)
        preview = vs[:100].replace('\n', ' ')
        print(f"   {k} ({size} chars) : {preview}{'...' if size > 100 else ''}")
EOF

echo ""
echo "=== 6. Total cles dans theme_mods_kadence ==="
python3 -c "
import json
with open('/tmp/customizer-dump/theme_mods_kadence.json') as f:
    d = json.load(f)
print(f'   {len(d)} cles total')
print(f'   Cles: ' + ', '.join(sorted(d.keys())[:20]))
"

echo ""
echo "=== FIN ==="
