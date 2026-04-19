#!/usr/bin/env python3
"""
B.2 — Variabiliser snippet 740 WPForms
Remplace hex rouges hardcodés par variables CSS.
Garde les couleurs semantiques (erreur, succès) inchangées.
"""

from pathlib import Path

BASE = Path('C:/Users/gimu8/Desktop/Inaricom/audits')
src = BASE / 'css-dump' / '740-WPforms_Style.css'
out = BASE / '740-REFACTORED.css'

content = src.read_text(encoding='utf-8')
original_size = len(content)

# Liste des remplacements ordonnés (order matters pour eviter doubles matches)
replacements = [
    # Gradient bouton : hex + hex-corail -> var + var-light
    ("linear-gradient(135deg, #E31E24, #ff4757)",
     "linear-gradient(135deg, var(--inari-red), var(--inari-red-light))"),
    # Focus border
    ("border-color: #E31E24 !important",
     "border-color: var(--inari-red) !important"),
    # Box-shadows avec rgba rouge hardcode
    ("rgba(227, 30, 36, 0.2)", "rgba(var(--inari-red-rgb), 0.2)"),
    ("rgba(227, 30, 36, 0.4)", "rgba(var(--inari-red-rgb), 0.4)"),
]

print("=== Remplacements B.2 ===")
for old, new in replacements:
    n = content.count(old)
    content = content.replace(old, new)
    status = "OK" if n > 0 else "SKIP (non trouve)"
    print(f"   [{status}] {n}x : {old[:50]}{'...' if len(old) > 50 else ''}")

# Mise a jour du commentaire header
old_header = "COULEUR PAR DÉFAUT : ROUGE #E31E24"
new_header = "COULEURS : var(--inari-red) reactif aux themes (rouge/or/bleu/vert)"
if old_header in content:
    content = content.replace(old_header, new_header)
    print(f"   [OK] Header commentaire mis a jour")

# Stats
new_size = len(content)
print(f"\n=== Stats ===")
print(f"   Avant : {original_size} octets")
print(f"   Apres : {new_size} octets")
print(f"   Delta : {new_size - original_size:+d} octets")

# Verification : plus aucun hex rouge Inaricom ne doit rester
import re
remaining_red = re.findall(r'#E31E24|#ff4757|227,\s*30,\s*36', content, re.IGNORECASE)
if remaining_red:
    print(f"\n[WARN] Hex rouges restants : {remaining_red}")
else:
    print(f"\n[OK] Plus aucun hex rouge hardcode")

# Verifier que les semantiques sont preservees (erreur/succes)
assert '#ff6b6b' in content, "ff6b6b (erreur) doit etre preserve"
assert '0, 255, 136' in content, "rgba vert succes doit etre preserve"
print(f"[OK] Couleurs semantiques (erreur #ff6b6b + succes rgba 0,255,136) preservees")

out.write_text(content, encoding='utf-8')
print(f"\n[WRITE] {out.name}")
