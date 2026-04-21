#!/usr/bin/env python3
"""
Nettoyage v2 : supprime le bloc complet 'STATS - CENTREES SUR LA PAGE'
du contenu de la page 985. Ce bloc fait doublon avec le 347 et cree des conflits.
"""
import re

with open('/tmp/page-985-in.html', 'r', encoding='utf-8') as f:
    content = f.read()

original_size = len(content)

# Pattern 1 : bloc "Stats mobile GRILLE 2x2" + media query mobile
pattern1 = r'/\*\s*Stats mobile[\s\S]*?@media\s*\(max-width:\s*1024px\)\s*\{[\s\S]*?\n\}\s*\n'
content = re.sub(pattern1, '', content)

# Pattern 2 : @media (max-width: 480px) { .inari-hero-stats .stat-number {...} }
pattern2 = r'@media\s*\(max-width:\s*480px\)\s*\{\s*\.inari-hero-stats\s*\.stat-number\s*\{[^}]+\}\s*\}\s*\n?'
content = re.sub(pattern2, '', content)

# Pattern 3 : tout le bloc "STATS - CENTREES SUR LA PAGE" jusqu'a la section suivante
# Structure : commentaire + .inari-hero-stats-wrapper + .inari-hero-stats + .stat + .stat-number + .stat-label
# Finit avant le prochain "/* ========================================" ou "/* ======"
pattern3 = r'/\*\s*=+\s*\n\s*STATS[\s\S]*?CENTR[ÉE]{1,2}E?S? SUR LA PAGE[\s\S]*?=+\s*\*/\s*\n[\s\S]*?(?=/\*\s*={6,}|@media|$)'
content_new = re.sub(pattern3, '', content)

# Pattern 4 : "Stats plus grandes et espacees" + "Stats desktop" commentaire + regles desktop .inari-hero-stats
pattern4 = r'/\*\s*Stats plus grandes et espac[ée]{1,2}es?\s*\*/\s*\n\s*/\*\s*Stats desktop\s*\*/\s*\n\s*\.inari-hero-stats\s*\{[^}]+\}\s*\n\s*\.inari-hero-stats\s*\.stat-number\s*\{[^}]+\}\s*\n\s*\.inari-hero-stats\s*\.stat-label\s*\{[^}]+\}\s*\n?'
content_new = re.sub(pattern4, '', content_new)

new_size = len(content_new)
removed = original_size - new_size

print(f"Taille originale : {original_size} octets")
print(f"Taille nouvelle  : {new_size} octets")
print(f"Supprime         : {removed} octets")

# Verifs
occurrences_stats = content_new.count('inari-hero-stats')
print(f"\nOccurrences .inari-hero-stats restantes : {occurrences_stats}")

if 'display: inline-flex' in content_new and '.inari-hero-stats' in content_new:
    # Verifier si inline-flex est sur stats
    import re
    matches = re.findall(r'\.inari-hero-stats[^{]*\{\s*display:\s*inline-flex', content_new)
    if matches:
        print(f"ATTENTION : encore {len(matches)} regle(s) 'display: inline-flex' sur stats")
    else:
        print("OK : display: inline-flex n'affecte plus stats directement")

if 'repeat(2, 1fr)' in content_new:
    # Voir si c'est pour stats ou pour shop-grid
    lines_with = [line for line in content_new.split('\n') if 'repeat(2, 1fr)' in line]
    print(f"\n'repeat(2, 1fr)' occurrences restantes : {len(lines_with)}")
    for line in lines_with[:3]:
        print(f"   {line.strip()[:80]}")

with open('/tmp/page-985-out.html', 'w', encoding='utf-8') as f:
    f.write(content_new)

print(f"\n[WRITE] /tmp/page-985-out.html")
