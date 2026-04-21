#!/bin/bash
# Supprimer le bloc "Stats mobile GRILLE 2x2" de la page 985
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== 1. Backup page 985 ==="
TS=$(date +%Y%m%d-%H%M%S)
wp post get 985 --field=post_content --url=$URL > /tmp/page-985-backup-$TS.html
echo "   Backup : /tmp/page-985-backup-$TS.html"

echo ""
echo "=== 2. Extraire le bloc a supprimer ==="
# On garde le contenu, on supprime juste la section media query mobile stats
# Extraire la ligne de debut et fin du bloc

# Le bloc commence a "/* Stats mobile — GRILLE 2x2 */" et finit au "}" qui ferme le @media
# Pour etre propre, on va utiliser un replace Python

python3 << 'PYEOF'
import re

with open('/tmp/page-985-backup-' + open('/tmp/latest-ts').read().strip() + '.html', 'r', encoding='utf-8') as f:
    content = f.read()
PYEOF

# Plus simple : utiliser sed avec patterns multilignes
python3 - << 'PYEOF'
import re, sys, os, glob

# Trouver le backup le plus recent
backups = sorted(glob.glob('/tmp/page-985-backup-*.html'))
if not backups:
    print('Pas de backup')
    sys.exit(1)

with open(backups[-1], 'r', encoding='utf-8') as f:
    content = f.read()

original_size = len(content)

# Pattern : supprimer le bloc /* Stats mobile - GRILLE 2x2 */ jusqu'a la fin du @media matching
# On cible le commentaire + tout le @media block qui suit
# Le @media se termine par une accolade fermante isolee (apres la derniere regle interne)

pattern = r'/\*\s*Stats mobile\s*[—-]\s*GRILLE\s*2x2\s*\*/\s*@media\s*\(max-width:\s*1024px\)\s*\{.*?\n\}\s*\n'
new_content = re.sub(pattern, '', content, flags=re.DOTALL)

# Aussi supprimer le bloc @media (max-width: 480px) pour stat-number qui suit
pattern2 = r'@media\s*\(max-width:\s*480px\)\s*\{\s*\.inari-hero-stats\s*\.stat-number\s*\{[^}]+\}\s*\}\s*'
new_content = re.sub(pattern2, '', new_content, flags=re.DOTALL)

new_size = len(new_content)
removed = original_size - new_size

print(f"Taille originale : {original_size} octets")
print(f"Taille nouvelle  : {new_size} octets")
print(f"Supprime         : {removed} octets")

# Sauvegarder le contenu modifie
with open('/tmp/page-985-fixed.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

# Verif : plus de repeat(2, 1fr) pour stats
if 'repeat(2, 1fr)' in new_content:
    print("ATTENTION : encore 'repeat(2, 1fr)' dans le contenu")
else:
    print("OK : plus de 'repeat(2, 1fr)'")
if 'Stats mobile' in new_content:
    print("ATTENTION : encore 'Stats mobile' dans le contenu")
else:
    print("OK : plus de 'Stats mobile'")
PYEOF

echo ""
echo "=== 3. Update post 985 ==="
wp eval "
\$content = file_get_contents('/tmp/page-985-fixed.html');
kses_remove_filters();
\$r = wp_update_post([
    'ID' => 985,
    'post_content' => \$content,
    'post_content_filtered' => \$content,
], true);
if (is_wp_error(\$r)) { echo 'ERREUR: ' . \$r->get_error_message(); exit(1); }
echo 'OK: post 985 update (' . strlen(\$content) . ' octets)' . PHP_EOL;
kses_init_filters();
" --url=$URL

echo ""
echo "=== 4. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -1

echo ""
echo "=== 5. Verif page rendered ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
HTML=$(curl -s -u "$AUTH" "$URL/")
echo "   'Stats mobile' dans HTML rendered : $(echo "$HTML" | grep -c 'Stats mobile')"
echo "   'repeat(2, 1fr)' dans HTML rendered : $(echo "$HTML" | grep -c 'repeat(2, 1fr)')"
echo "   (doit etre 0 pour les deux)"

echo ""
echo "Backup : /tmp/page-985-backup-$TS.html"
echo "Rollback : wp post update 985 --post_content='\$(cat /tmp/page-985-backup-$TS.html)' --url=$URL"
