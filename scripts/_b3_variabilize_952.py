#!/usr/bin/env python3
"""
B.3 — Variabiliser snippet 952 Fiches produits (variabilisation max)
Remplace TOUS les hex qui ont une variable equivalente dans 347.
Garde intacts : vert stock (#22C55E), bleu shipping (#3B82F6),
               gris textes sans equivalent variable (#E8E8E8, #B0B0C0).
"""

from pathlib import Path
import re

BASE = Path('C:/Users/gimu8/Desktop/Inaricom/audits')
src = BASE / 'css-dump' / '952-Fiches_produits.css'
out = BASE / '952-REFACTORED.css'

content = src.read_text(encoding='utf-8')
original_size = len(content)

# Remplacements : rouges thematiques + gris/noirs avec variable equivalente dans 347
replacements = [
    # === ROUGES THEMATIQUES (reactifs au theme actif) ===
    ("rgba(227, 30, 36, 0.15)", "rgba(var(--inari-red-rgb), 0.15)"),
    ("rgba(227, 30, 36, 0.3)",  "rgba(var(--inari-red-rgb), 0.3)"),
    ("rgba(227, 30, 36, 0.1)",  "rgba(var(--inari-red-rgb), 0.1)"),
    ("rgba(227, 30, 36, 0.05)", "rgba(var(--inari-red-rgb), 0.05)"),
    ("#E31E24",                 "var(--inari-red)"),

    # === GRIS / NOIRS avec variable dediee dans 347 :root ===
    # #8A8A9A = --inari-text-muted (gris muted labels/secondaire)
    ("#8A8A9A", "var(--inari-text-muted)"),
    # #12121A = --inari-black-alt (noir surfaces elevees)
    ("#12121A", "var(--inari-black-alt)"),
]

print("=== Remplacements B.3 sur snippet 952 (variabilisation max) ===\n")
total = 0
for old, new in replacements:
    n = content.count(old)
    content = content.replace(old, new)
    total += n
    status = "OK  " if n > 0 else "SKIP"
    print(f"   [{status}] {n}x : {old[:40]:<40} -> {new[:40]}")

print(f"\n   Total : {total} remplacements")

# Stats
new_size = len(content)
print(f"\n=== Stats ===")
print(f"   Avant : {original_size} octets")
print(f"   Apres : {new_size} octets")
print(f"   Delta : {new_size - original_size:+d} octets")

# === Verifications strictes ===
# 1. Plus aucun hex rouge
remaining_red = re.findall(r'#E31E24|227,\s*30,\s*36', content, re.IGNORECASE)
if remaining_red:
    print(f"\n[FAIL] Hex rouges restants : {remaining_red}")
    raise SystemExit(1)
print(f"\n[OK] Aucun hex rouge hardcode")

# 2. Plus de #8A8A9A ni #12121A (doivent etre tous convertis)
leftover_muted = content.count('#8A8A9A')
leftover_alt = content.count('#12121A')
if leftover_muted > 0 or leftover_alt > 0:
    print(f"[FAIL] Gris/noirs restants : {leftover_muted}x #8A8A9A, {leftover_alt}x #12121A")
    raise SystemExit(1)
print(f"[OK] Tous les gris/noirs variabilisables convertis")

# 3. Couleurs semantiques preservees
assert '#22C55E' in content, "#22C55E (vert stock/succes) doit etre preserve"
assert '#3B82F6' in content, "#3B82F6 (bleu shipping) doit etre preserve"
print(f"[OK] Couleurs semantiques preservees (#22C55E vert, #3B82F6 bleu)")

# 4. Gris sans equivalent variable preserves (#E8E8E8, #B0B0C0)
assert '#E8E8E8' in content, "#E8E8E8 (titre gris) doit etre preserve"
assert '#B0B0C0' in content, "#B0B0C0 (texte gris) doit etre preserve"
print(f"[OK] Gris sans equivalent preserves (#E8E8E8, #B0B0C0)")

# 5. Variables CSS presentes
assert 'var(--inari-red)' in content, "var(--inari-red) doit etre present"
assert 'var(--inari-red-rgb)' in content, "var(--inari-red-rgb) doit etre present"
assert 'var(--inari-text-muted)' in content, "var(--inari-text-muted) doit etre present"
assert 'var(--inari-black-alt)' in content, "var(--inari-black-alt) doit etre present"
print(f"[OK] Les 4 variables utilisees")

out.write_text(content, encoding='utf-8')
print(f"\n[WRITE] {out.name}")
