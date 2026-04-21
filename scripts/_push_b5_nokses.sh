#!/bin/bash
# Push B.5 + verif post-push que > restent bien des >
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com
AUTH='staging:InaStg-Kx7m9vR2@pL'

echo "=== 1. Backup DB state ==="
TS=$(date +%Y%m%d-%H%M%S)
wp post get 347 --field=post_content --url=$URL > /tmp/347-backup-$TS.css

echo ""
echo "=== 2. Update DB via wp eval (evite wp_kses) ==="
wp eval "
\$content = file_get_contents('/tmp/347-REFACTORED-B5.css');
if (\$content === false) { echo 'ERREUR lecture'; exit(1); }

// Desactiver les filtres de sanitation pour preserver > dans le CSS
kses_remove_filters();

\$r = wp_update_post([
    'ID' => 347,
    'post_content' => \$content,
    'post_content_filtered' => \$content,
], true);
if (is_wp_error(\$r)) { echo 'ERREUR: ' . \$r->get_error_message(); exit(1); }
echo 'OK: post 347 update (' . strlen(\$content) . ' octets)' . PHP_EOL;

// Restaurer les filtres
kses_init_filters();
" --url=$URL

echo ""
echo "=== 3. Verif : le post_content contient-il encore > ou &gt; ? ==="
wp post get 347 --field=post_content --url=$URL > /tmp/347-check.css
GT_OCTET=$(grep -c '>' /tmp/347-check.css)
GT_ENTITY=$(grep -c '&gt;' /tmp/347-check.css)
echo "   > (octet)  : $GT_OCTET"
echo "   &gt; (entity) : $GT_ENTITY"

if [ $GT_ENTITY -gt 0 ]; then
    echo "   /!\ WP convertit encore > en &gt;. Utilisation methode directe DB."
fi

echo ""
echo "=== 4. Resync fichier statique AVEC WRAPPER ==="
FILE=wp-content/uploads/custom-css-js/347.css
TMP=/tmp/347-wrapped.css

echo '<!-- start Simple Custom CSS and JS -->' > $TMP
echo '<style type="text/css">' >> $TMP
wp post get 347 --field=post_content --url=$URL >> $TMP
echo '</style>' >> $TMP
echo '<!-- end Simple Custom CSS and JS -->' >> $TMP

mv $TMP $FILE
NEW_SIZE=$(wc -c < $FILE)
echo "   Fichier $NEW_SIZE octets"

echo ""
echo "=== 5. Verif FINALE dans fichier statique : > non-converti ==="
echo "   > dans 347.css    : $(grep -c '>' $FILE)"
echo "   &gt; dans 347.css : $(grep -c '&gt;' $FILE)"

echo ""
echo "=== 6. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -1

echo ""
echo "Backup : /tmp/347-backup-$TS.css"
