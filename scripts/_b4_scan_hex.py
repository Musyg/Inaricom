#!/usr/bin/env python3
"""
B.4 etape 1 - Scanner sections 1-42 du 347 pour hex rouge hardcode restant.
Si presence, il faut variabiliser AVANT de supprimer les sections 43-46.
"""
from pathlib import Path
import re

BASE = Path('C:/Users/gimu8/Desktop/Inaricom/audits')
src = BASE / 'css-dump' / '347-custom_CSS_INARICOM.css'
content = src.read_text(encoding='utf-8')

# Localiser debut section 43
marker_43 = '/* ===========================================\n   43. PATCH THÈMES'
pos_43 = content.find(marker_43)
if pos_43 == -1:
    raise SystemExit("ERREUR: section 43 introuvable")

# Sections 1-42
sections_1_42 = content[:pos_43]
# Sections 43+ 
sections_43_plus = content[pos_43:]

print(f"=== Analyse ===")
print(f"   Taille sections 1-42: {len(sections_1_42)} octets")
print(f"   Taille sections 43+ : {len(sections_43_plus)} octets")

# Scanner les hex rouges hardcodes dans sections 1-42
print(f"\n=== Hex rouges hardcodes dans sections 1-42 ===")

patterns = [
    (r'#E31E24', 'hex rouge direct'),
    (r'#B8161B', 'hex rouge dark'),
    (r'#FF3A40', 'hex rouge light'),
    (r'rgba\(\s*227\s*,\s*30\s*,\s*36\s*,', 'rgba rouge direct'),
]

total_issues = 0
for pattern, label in patterns:
    matches = []
    for m in re.finditer(pattern, sections_1_42, re.IGNORECASE):
        line_num = sections_1_42[:m.start()].count('\n') + 1
        line = sections_1_42.split('\n')[line_num - 1].strip()
        matches.append((line_num, line[:100]))
    
    if matches:
        print(f"\n   [{label}] {len(matches)} occurrences :")
        for line_num, line in matches[:10]:  # Max 10 pour lisibilite
            print(f"      L{line_num}: {line}")
        if len(matches) > 10:
            print(f"      ... et {len(matches)-10} autres")
        total_issues += len(matches)

# Verifier aussi autres couleurs thematiques hardcodees
print(f"\n=== Autres hex thematiques dans sections 1-42 (OR/BLEU/VERT) ===")

theme_patterns = [
    (r'#FFD700', 'hex or'),
    (r'#FFE55C', 'hex or light'),
    (r'#B8860B', 'hex or dark'),
    (r'#00D4FF|#00d4ff', 'hex bleu'),
    (r'#4DE8FF', 'hex bleu light'),
    (r'#00A8CC', 'hex bleu dark'),
    (r'#10B981', 'hex vert'),
    (r'#34D399', 'hex vert light'),
    (r'#059669', 'hex vert dark'),
]

theme_issues = 0
for pattern, label in theme_patterns:
    matches = list(re.finditer(pattern, sections_1_42, re.IGNORECASE))
    if matches:
        print(f"\n   [{label}] {len(matches)} occurrences :")
        for m in matches[:5]:
            line_num = sections_1_42[:m.start()].count('\n') + 1
            line = sections_1_42.split('\n')[line_num - 1].strip()
            print(f"      L{line_num}: {line[:100]}")
        if len(matches) > 5:
            print(f"      ... et {len(matches)-5} autres")
        theme_issues += len(matches)

print(f"\n=== BILAN ===")
print(f"   Hex rouge hardcode (doit etre 0 hors section 1) : {total_issues}")
print(f"   Hex theme hardcode (attendu en section 1b/1c/1d) : {theme_issues}")

# Compter specifiquement hors section 1 (qui a le droit de contenir les hex themes)
# Section 1 se finit avec la fermeture de :root + themes OR/BLEU/VERT + logo swaps
pos_section_2 = sections_1_42.find('/* ===========================================\n   2. BASE')
if pos_section_2 == -1:
    pos_section_2 = sections_1_42.find('   2. BASE')

if pos_section_2 > 0:
    sections_5_42 = sections_1_42[pos_section_2:]
    print(f"\n=== Hors section 1 (position {pos_section_2}) ===")
    
    for pattern, label in patterns + theme_patterns:
        matches = list(re.finditer(pattern, sections_5_42, re.IGNORECASE))
        if matches:
            print(f"\n   [{label}] {len(matches)} occurrences :")
            for m in matches[:5]:
                line_num = sections_5_42[:m.start()].count('\n') + 1
                line = sections_5_42.split('\n')[line_num - 1].strip()
                print(f"      L{line_num} (hors section 1): {line[:100]}")

print(f"\n[INFO] Scan termine. Les hex dans section 1 (:root + [data-theme]) sont attendus.")
print(f"       Les hex hors section 1 doivent etre variabilises avant de supprimer 43-46.")
