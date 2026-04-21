#!/bin/bash
# Supprime le bloc "Stats mobile GRILLE 2x2" de la page 985
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com
AUTH='staging:InaStg-Kx7m9vR2@pL'

TS=$(date +%Y%m%d-%H%M%S)

echo "=== 1. Backup page 985 ==="
wp post get 985 --field=post_content --url=$URL > /tmp/page-985-backup-$TS.html
cp /tmp/page-985-backup-$TS.html /tmp/page-985-in.html
SIZE=$(wc -c < /tmp/page-985-backup-$TS.html)
echo "   Backup : /tmp/page-985-backup-$TS.html ($SIZE octets)"

echo ""
echo "=== 2. Executer le script Python de nettoyage ==="
python3 /tmp/_clean_985.py

echo ""
echo "=== 3. Verifier le resultat ==="
ls -la /tmp/page-985-out.html

echo ""
echo "=== 4. Update post 985 sans kses ==="
wp eval "
\$content = file_get_contents('/tmp/page-985-out.html');
if (\$content === false) { echo 'ERREUR lecture'; exit(1); }
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
echo "=== 5. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -1

echo ""
echo "=== 6. Verif HTML rendered ==="
HTML=$(curl -s -u "$AUTH" "$URL/")
echo "   'Stats mobile' dans HTML rendered : $(echo "$HTML" | grep -c 'Stats mobile')"
echo "   'repeat(2, 1fr)' dans HTML rendered : $(echo "$HTML" | grep -c 'repeat(2, 1fr)')"
echo "   (doit etre 0 pour les deux)"

echo ""
echo "=== 7. Verif que mes regles section 61 sont toujours la ==="
echo "   flex-direction: column : $(echo "$HTML" | grep -c 'flex-direction: column')"
echo "   section 61 : $(echo "$HTML" | grep -c '61\. HERO HOMEPAGE')"

echo ""
echo "================================================================"
echo "Nettoyage page 985 TERMINE"
echo "Backup : /tmp/page-985-backup-$TS.html"
echo "Rollback : wp post update 985 --post_content=...  (cf backup)"
echo "================================================================"
