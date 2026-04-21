#!/usr/bin/env python3
"""
B.5 : ajoute section 61 au 347 (Hero homepage depuis 442+508)
Source 347 : audits/347-REFACTORED-B4-PLUS-IREMAP.css (avec section 60)
Source 61  : audits/snippet-61-hero.css
Output    : audits/347-REFACTORED-B5.css
"""
from pathlib import Path

BASE = Path('C:/Users/gimu8/Desktop/Inaricom/audits')

# Lire le 347 actuel (post section 60)
current_347 = (BASE / '347-REFACTORED-B4-PLUS-IREMAP.css').read_text(encoding='utf-8')
original_size = len(current_347)

# Lire la section 61
section_61 = (BASE / 'snippet-61-hero.css').read_text(encoding='utf-8')

# Ajouter section 61 a la fin
new_content = current_347.rstrip() + '\n\n' + section_61

new_size = len(new_content)
print("=== Stats B.5 ===")
print(f"   Avant (post section 60) : {original_size} octets")
print(f"   Apres ajout section 61  : {new_size} octets")
print(f"   Delta                   : +{new_size - original_size} octets")

# Sauvegarder
out = BASE / '347-REFACTORED-B5.css'
out.write_text(new_content, encoding='utf-8')
print(f"\n[WRITE] {out.name}")

# Verif
assert '61. HERO HOMEPAGE' in new_content, "marqueur section 61 manquant"
assert '#fox-canvas-container' in new_content, "regle fox-canvas manquante"
assert '.hero-section' in new_content, "regle hero-section manquante"
print("[OK] Section 61 integree, fox + hero present")
