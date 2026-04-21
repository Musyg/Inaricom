#!/bin/bash
# Push snippet 496 v3.2 (theme switcher avec priorite PHP)
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

TS=$(date +%Y%m%d-%H%M%S)

echo "=== 1. Backup snippet 496 actuel ==="
wp post get 496 --field=post_content --url=$URL > /tmp/snippet-496-backup-$TS.js
echo "   Backup : /tmp/snippet-496-backup-$TS.js"
echo "   Taille : $(wc -c < /tmp/snippet-496-backup-$TS.js) octets"

echo ""
echo "=== 2. Update DB via wp eval ==="
# Le JS n'a pas de > (pas de selecteurs enfants), mais par securite :
wp eval "
\$content = file_get_contents('/tmp/snippet-496-new.js');
if (\$content === false) { echo 'ERREUR lecture'; exit(1); }
kses_remove_filters();
\$r = wp_update_post([
    'ID' => 496,
    'post_content' => \$content,
    'post_content_filtered' => \$content,
], true);
if (is_wp_error(\$r)) { echo 'ERREUR: ' . \$r->get_error_message(); exit(1); }
echo 'OK: post 496 update (' . strlen(\$content) . ' octets)' . PHP_EOL;
kses_init_filters();
" --url=$URL

echo ""
echo "=== 3. Resync fichier statique du snippet ==="
# Chercher le fichier statique correspondant (plugin custom-css-js stocke en .js et .css)
STATIC_FILE=~/inaricom.com/web-staging/wp-content/uploads/custom-css-js/496.js
if [ -f "$STATIC_FILE" ]; then
    SIZE_BEFORE=$(wc -c < "$STATIC_FILE")
    echo "   Static file trouve : $SIZE_BEFORE octets"
    
    # Regenerer avec wrapper
    echo '<!-- start Simple Custom CSS and JS -->' > /tmp/496-new-static.js
    echo '<script type="text/javascript">' >> /tmp/496-new-static.js
    wp post get 496 --field=post_content --url=$URL >> /tmp/496-new-static.js
    echo '</script>' >> /tmp/496-new-static.js
    echo '<!-- end Simple Custom CSS and JS -->' >> /tmp/496-new-static.js
    
    mv /tmp/496-new-static.js "$STATIC_FILE"
    SIZE_AFTER=$(wc -c < "$STATIC_FILE")
    echo "   Resync OK : $SIZE_AFTER octets"
else
    echo "   Pas de fichier statique 496.js trouve (snippet peut etre inline)"
    ls -la ~/inaricom.com/web-staging/wp-content/uploads/custom-css-js/ | grep 496 || echo "   Rien trouve"
fi

echo ""
echo "=== 4. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -1

echo ""
echo "=== 5. Verif dans HTML rendered ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
HTML=$(curl -s -u "$AUTH" "$URL/")
echo "   v3.2 dans HTML : $(echo "$HTML" | grep -c 'Theme Switcher v3.2')"
echo "   cleanupLegacyStorage : $(echo "$HTML" | grep -c 'cleanupLegacyStorage')"
echo "   getInitialTheme : $(echo "$HTML" | grep -c 'getInitialTheme')"

echo ""
echo "Backup : /tmp/snippet-496-backup-$TS.js"
