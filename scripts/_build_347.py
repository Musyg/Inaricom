#!/usr/bin/env python3
"""
Build 347 avec sections 61 + 62.
Source 347 : audits/347-REFACTORED-B4-PLUS-IREMAP.css (avec section 60)
Source 61  : audits/snippet-61-hero.css
Source 62  : audits/snippet-62-blog-cards.css
Output    : audits/347-REFACTORED-B5.css
"""
from pathlib import Path

BASE = Path('C:/Users/gimu8/Desktop/Inaricom/audits')

# Lire le 347 actuel (post section 60)
current_347 = (BASE / '347-REFACTORED-B4-PLUS-IREMAP.css').read_text(encoding='utf-8')
original_size = len(current_347)

# Lire les sections a ajouter
section_61 = (BASE / 'snippet-61-hero.css').read_text(encoding='utf-8')
section_62 = (BASE / 'snippet-62-blog-cards.css').read_text(encoding='utf-8')

# Concat
new_content = current_347.rstrip() + '\n\n' + section_61.rstrip() + '\n\n' + section_62

new_size = len(new_content)
print("=== Stats build 347 ===")
print(f"   Avant (post section 60)     : {original_size} octets")
print(f"   Section 61 (hero)           : +{len(section_61)} octets")
print(f"   Section 62 (blog cards)     : +{len(section_62)} octets")
print(f"   Apres integration           : {new_size} octets")
print(f"   Delta total                 : +{new_size - original_size} octets")

# Sauvegarder
out = BASE / '347-REFACTORED-B5.css'
out.write_text(new_content, encoding='utf-8')
print(f"\n[WRITE] {out.name}")

# Verifs
assert '61. HERO HOMEPAGE' in new_content, "marqueur section 61 manquant"
assert '62. BLOG ARCHIVES' in new_content, "marqueur section 62 manquant"
assert '#fox-canvas-container' in new_content, "regle fox-canvas manquante"
assert '.hero-section' in new_content, "regle hero-section manquante"
assert '.loop-entry .entry-title' in new_content, "regle blog card title manquante"
print("[OK] Sections 61 + 62 integrees")
