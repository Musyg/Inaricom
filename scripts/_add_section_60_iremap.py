#!/usr/bin/env python3
"""
Ajoute section 60 au snippet 347 : REMAP .i-* -> .inari-*
Cette section rend les composants .i-* (fiches produits plugin externe) reactifs au theme.
"""
from pathlib import Path

BASE = Path('C:/Users/gimu8/Desktop/Inaricom/audits')

# Lire le 347 actuel (post B.4)
current_347 = (BASE / '347-REFACTORED-B4.css').read_text(encoding='utf-8')
original_size = len(current_347)

# Lire le remap
remap = (BASE / 'snippet-i-remap.css').read_text(encoding='utf-8')

# Ajouter une section 60 a la fin (apres section 53 MOBILE TAILLES qui termine le fichier)
new_section = f"""
/* ===========================================
   60. REMAP DESIGN SYSTEM .i-* (plugin externe)
   =========================================== */

{remap}
"""

new_content = current_347.rstrip() + '\n' + new_section

new_size = len(new_content)
print(f"=== Stats ===")
print(f"   Avant (post B.4) : {original_size} octets")
print(f"   Apres ajout 60   : {new_size} octets")
print(f"   Delta            : +{new_size - original_size} octets")

# Sauvegarder
out = BASE / '347-REFACTORED-B4-PLUS-IREMAP.css'
out.write_text(new_content, encoding='utf-8')
print(f"\n[WRITE] {out.name}")

# Verif presence variables critiques
assert '--i-red: var(--inari-red)' in new_content, "remap --i-red manquant"
assert '60. REMAP DESIGN SYSTEM' in new_content, "marqueur section 60 manquant"
print(f"[OK] Remap variables present et marqueur section 60 present")
