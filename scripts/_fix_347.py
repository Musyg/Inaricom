#!/usr/bin/env python3
"""
Refacto du post 347 (custom CSS INARICOM) sur staging.
Actions :
1. Remplace ligne 1 @import Google Fonts par block @font-face self-hosted
2. Supprime section 40 (vestige switcher, ecrase par le 768)
Usage : python3 fix_347.py <input.css> <output.css>
"""
import sys
import re

if len(sys.argv) != 3:
    print("Usage: python3 fix_347.py <in> <out>")
    sys.exit(1)

inp, out = sys.argv[1], sys.argv[2]

with open(inp, 'r', encoding='utf-8') as f:
    content = f.read()

# === Fix 1 : remplacer @import Google Fonts par @font-face self-hosted ===
old_import = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');"

# Chemin des fonts : deployees dans kadence-child/assets/fonts/inter/
# Accessible meme si child theme pas active : WP sert le fichier statique
font_base = "/wp-content/themes/kadence-child/assets/fonts/inter"

new_fonts = f"""/* ============================================================
   FONTS SELF-HOSTED — Inter (OFL, rsms.me)
   Violation nLPD/RGPD resolue : plus de Google Fonts CDN.
   Poids 400/500/600/700.
   ============================================================ */

@font-face {{ font-family: 'Inter'; font-style: normal; font-weight: 400; font-display: swap; src: url('{font_base}/inter-400.woff2') format('woff2'); }}
@font-face {{ font-family: 'Inter'; font-style: normal; font-weight: 500; font-display: swap; src: url('{font_base}/inter-500.woff2') format('woff2'); }}
@font-face {{ font-family: 'Inter'; font-style: normal; font-weight: 600; font-display: swap; src: url('{font_base}/inter-600.woff2') format('woff2'); }}
@font-face {{ font-family: 'Inter'; font-style: normal; font-weight: 700; font-display: swap; src: url('{font_base}/inter-700.woff2') format('woff2'); }}"""

if old_import not in content:
    print("ERREUR: @import Google Fonts non trouve")
    sys.exit(2)

content = content.replace(old_import, new_fonts, 1)
print("[OK] @import Google Fonts remplace par @font-face self-hosted")

# === Fix 2 : supprimer section 40 (vestige switcher) ===
# Pattern : de "40. THEME SWITCHER — DOTS" jusqu'a juste avant "41. TRANSITIONS"
# Incluant les blocs ===== de commentaires au debut et fin

# Match le bloc complet : ===== / 40. / ===== / ...contenu... / ===== fin
pattern = re.compile(
    r'/\* =+\s*\n\s+40\. THEME SWITCHER — DOTS\s*\n\s+=+\s*\*/.*?(?=/\* =+\s*\n\s+41\. TRANSITIONS)',
    re.DOTALL
)

replacement = """/* ============================================================
   40. (DEPRECATED) — Theme switcher deplace dans le snippet 768
   Voir : wp post 768 "Theme Switcher Mobile" pour la source de verite.
   Section retiree pour supprimer l'override silencieux.
   ============================================================ */

"""

new_content, n = pattern.subn(replacement, content)
if n == 0:
    print("ATTENTION: section 40 non trouvee, skip (peut-etre deja supprimee)")
else:
    print(f"[OK] Section 40 supprimee ({n} occurrence remplacee)")
    content = new_content

with open(out, 'w', encoding='utf-8') as f:
    f.write(content)

# Stats
import os
old_size = os.path.getsize(inp)
new_size = os.path.getsize(out)
diff = old_size - new_size
print(f"")
print(f"Taille avant : {old_size:>7} octets")
print(f"Taille apres : {new_size:>7} octets")
print(f"Diff         : {diff:>7} octets ({diff/old_size*100:+.1f}%)")
