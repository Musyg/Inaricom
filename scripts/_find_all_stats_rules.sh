#!/bin/bash
# Trouver TOUTES les regles CSS ciblant .inari-hero-stats peu importe la source
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/" > /tmp/home.html

echo "=== 1. Toutes les regles .inari-hero-stats dans HTML rendered ==="
echo "(inclut CSS inline + tous les fichiers servis)"
# Extraire les regles brutes
python3 << 'PYEOF'
import re
import subprocess
result = subprocess.run(['curl', '-s', '-u', 'staging:InaStg-Kx7m9vR2@pL', 'https://staging.inaricom.com/'], capture_output=True, text=True)
html = result.stdout

# Extraire toutes les balises <style> inline
style_tags = re.findall(r'<style[^>]*>([^<]*(?:(?!</style>).)*)</style>', html, re.DOTALL)
print(f"Nombre de balises <style> inline : {len(style_tags)}")

# Rechercher dans chaque <style> toutes les regles concernant inari-hero-stats
all_rules = []
for i, css in enumerate(style_tags):
    rules = re.findall(r'[^{}]*\.inari-hero-stats[^{]*\{[^}]+\}', css)
    for r in rules:
        all_rules.append((i, r.strip()))

print(f"\nRegles trouvees : {len(all_rules)}\n")
for i, (style_idx, rule) in enumerate(all_rules):
    print(f"--- [{i+1}] (dans style tag #{style_idx}) ---")
    print(rule[:400])
    print()
PYEOF

echo ""
echo "=== 2. Fichiers CSS externes charges ==="
grep -oE '<link[^>]*stylesheet[^>]*href="[^"]+"' /tmp/home.html | grep -oE 'href="[^"]+"' | head -20
