#!/bin/bash
# Diagnostic precis : pourquoi logo et bouton contacter ne suivent pas ?
set -e
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'
HTML=$(curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/")

echo "=== 1. LOGO : HTML balise complete ==="
echo "$HTML" | grep -oE '<img[^>]*custom-logo[^>]*/?>' | head -1

echo ""
echo "=== 2. LOGO : toutes les regles CSS qui ciblent .custom-logo dans HTML ==="
# Utiliser python pour extraire toutes les regles
python3 << 'EOF'
import re
with open('/tmp/prod-full.html') as f:
    pass
import subprocess
html = subprocess.run(['curl', '-s', '-u', 'staging:InaStg-Kx7m9vR2@pL', 'https://staging.inaricom.com/produit/nvidia-jetson-orin-nano-super/'], capture_output=True, text=True).stdout

# Toutes les regles qui contiennent .custom-logo
pattern = r'[^{}]*\.custom-logo[^{]*\{[^}]+\}'
matches = re.findall(pattern, html)
for i, m in enumerate(matches[:15]):
    clean = m.strip()[:200]
    print(f"[{i+1}] {clean}")
    print()
EOF

echo ""
echo "=== 3. BOUTON Nous contacter : regles CSS completes ==="
python3 << 'EOF'
import re, subprocess
html = subprocess.run(['curl', '-s', '-u', 'staging:InaStg-Kx7m9vR2@pL', 'https://staging.inaricom.com/produit/nvidia-jetson-orin-nano-super/'], capture_output=True, text=True).stdout

# Regles pour i-cta-box__btn
pattern = r'[^{}]*\.i-cta-box__btn[^{]*\{[^}]+\}'
matches = re.findall(pattern, html)
for i, m in enumerate(matches[:10]):
    clean = m.strip()[:300]
    print(f"[{i+1}] {clean}")
    print()
EOF

echo ""
echo "=== 4. Ordre des styles : la section 60 est-elle APRES le template i-* ==="
python3 << 'EOF'
import subprocess
html = subprocess.run(['curl', '-s', '-u', 'staging:InaStg-Kx7m9vR2@pL', 'https://staging.inaricom.com/produit/nvidia-jetson-orin-nano-super/'], capture_output=True, text=True).stdout

# Position du template i-* (celui qui definit .i-cta-box__btn base)
pos_template = html.find('.i-cta-box__btn{')
# Position de notre override
pos_override = html.find('60b. OVERRIDES CIBLES')
# Position du @media ou regle suivante
pos_our_rule = html.find('.i-cta-box__btn {')

print(f"Position template i-* (rule .i-cta-box__btn): {pos_template}")
print(f"Position notre section 60b (commentaire):    {pos_override}")
print(f"Position notre regle (.i-cta-box__btn {{):    {pos_our_rule}")

if pos_template > 0 and pos_our_rule > 0:
    if pos_our_rule > pos_template:
        print("OK : notre regle vient APRES le template (elle devrait gagner)")
    else:
        print("PROBLEME : notre regle vient AVANT le template (le template ecrase)")
EOF
