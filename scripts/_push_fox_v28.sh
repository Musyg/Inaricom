#!/bin/bash
# Push snippet 443 v28 (fox avec theme neutre) vers staging
set -e

cd ~/inaricom.com/web-staging
URL='https://staging.inaricom.com'
SNIPPET_ID=443
TS=$(date +%Y%m%d-%H%M%S)

echo "=== 1. Backup DB + fichier statique ==="
wp post get $SNIPPET_ID --field=post_content --url=$URL > /tmp/snippet-443-backup-$TS.js
BACKUP_SIZE=$(wc -c < /tmp/snippet-443-backup-$TS.js)
echo "   Backup DB  : /tmp/snippet-443-backup-$TS.js ($BACKUP_SIZE octets)"

STATIC_FILE=wp-content/uploads/custom-css-js/443.js
if [ -f "$STATIC_FILE" ]; then
    cp "$STATIC_FILE" /tmp/snippet-443-static-backup-$TS.js
    STATIC_SIZE=$(wc -c < /tmp/snippet-443-static-backup-$TS.js)
    echo "   Backup fichier static : /tmp/snippet-443-static-backup-$TS.js ($STATIC_SIZE octets)"
fi

echo ""
echo "=== 2. Update DB via wp eval (evite wp_kses JS) ==="
NEW_SIZE=$(wc -c < /tmp/snippet-443-new.js)
echo "   Nouvelle taille : $NEW_SIZE octets"

wp eval "
kses_remove_filters();
\$content = file_get_contents('/tmp/snippet-443-new.js');
\$result = wp_update_post([
    'ID' => $SNIPPET_ID,
    'post_content' => \$content,
]);
kses_init_filters();
if (is_wp_error(\$result)) {
    echo 'ERROR: ' . \$result->get_error_message() . \"\n\";
    exit(1);
}
echo 'OK: post 443 update (' . strlen(\$content) . ' octets)' . \"\n\";
" --url=$URL

echo ""
echo "=== 3. Verif post_content updated ==="
wp post get $SNIPPET_ID --field=post_content --url=$URL | head -5
echo ""
echo "   VERSION: $(wp post get $SNIPPET_ID --field=post_content --url=$URL | grep -oE 'VERSION: v[0-9]+' | head -1)"
echo "   neutre entry present: $(wp post get $SNIPPET_ID --field=post_content --url=$URL | grep -c 'neutre:')"

echo ""
echo "=== 4. Resync fichier statique /wp-content/uploads/custom-css-js/443.js ==="
# Le plugin custom-css-js sert le fichier statique avec echo file_get_contents() SANS wrapper au runtime
# Donc le fichier statique DOIT contenir son wrapper <script>...</script>
STATIC_CONTENT=$(cat <<'WRAPPER_START'
<!-- start Simple Custom CSS and JS -->
<script type="text/javascript">
WRAPPER_START
)
STATIC_CONTENT="${STATIC_CONTENT}
$(cat /tmp/snippet-443-new.js)
$(cat <<'WRAPPER_END'
</script>
<!-- end Simple Custom CSS and JS -->
WRAPPER_END
)"

echo "$STATIC_CONTENT" > "$STATIC_FILE"
NEW_STATIC_SIZE=$(wc -c < "$STATIC_FILE")
echo "   Fichier static : $NEW_STATIC_SIZE octets"

echo ""
echo "=== 5. Flush WP cache ==="
wp cache flush --url=$URL 2>&1 | tail -1

echo ""
echo "=== 6. Verif HTML home contient le fox v28 ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
sleep 1
HTML=$(curl -s -u "$AUTH" "$URL/")
echo "   v28 dans le HTML : $(echo "$HTML" | grep -c 'VERSION: v28')"
echo "   neutre entry dans le HTML : $(echo "$HTML" | grep -c 'neutre:')"

echo ""
echo "Rollback si necessaire :"
echo "   wp post update $SNIPPET_ID --post_content=\"\$(cat /tmp/snippet-443-backup-$TS.js)\" --url=$URL"
echo "   cp /tmp/snippet-443-static-backup-$TS.js $STATIC_FILE"
