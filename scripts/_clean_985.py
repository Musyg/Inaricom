#!/usr/bin/env python3
"""
Supprime le bloc "Stats mobile GRILLE 2x2" du contenu de la page 985.
Lit /tmp/page-985-in.html, ecrit /tmp/page-985-out.html.
"""
import re
import sys

with open('/tmp/page-985-in.html', 'r', encoding='utf-8') as f:
    content = f.read()

original_size = len(content)

# Pattern 1 : bloc /* Stats mobile GRILLE 2x2 */ + @media (max-width: 1024px) complet
# On cible depuis le commentaire jusqu'a la fin du @media (accolade fermante finale seule sur sa ligne)
pattern1 = r'/\*\s*Stats mobile[\s\S]*?@media\s*\(max-width:\s*1024px\)\s*\{[\s\S]*?\n\}\s*\n'
new_content = re.sub(pattern1, '', content)

# Pattern 2 : bloc @media (max-width: 480px) pour stat-number qui suit souvent
pattern2 = r'@media\s*\(max-width:\s*480px\)\s*\{\s*\.inari-hero-stats\s*\.stat-number\s*\{[^}]+\}\s*\}\s*\n?'
new_content = re.sub(pattern2, '', new_content)

# Pattern 3 : ligne .inari-hero-stats { gap: 60px !important; } et suite (stats desktop overrides redondants)
# On les garde pour desktop, seulement supprime mobile grid

new_size = len(new_content)
removed = original_size - new_size

print(f"Taille originale : {original_size} octets")
print(f"Taille nouvelle  : {new_size} octets")
print(f"Supprime         : {removed} octets")

if 'repeat(2, 1fr)' in new_content:
    print("ATTENTION : encore 'repeat(2, 1fr)' dans le contenu")
    # Chercher ou
    for i, line in enumerate(new_content.split('\n'), 1):
        if 'repeat(2, 1fr)' in line:
            print(f"   Ligne {i}: {line[:100]}")
else:
    print("OK : plus de 'repeat(2, 1fr)'")

if 'Stats mobile' in new_content:
    print("ATTENTION : encore 'Stats mobile' dans le contenu")
else:
    print("OK : plus de 'Stats mobile'")

with open('/tmp/page-985-out.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"\n[WRITE] /tmp/page-985-out.html")
