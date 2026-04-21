#!/bin/bash
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== Snippet 496 - Theme Switcher (JS) ==="
wp post get 496 --field=post_title --url=$URL
echo ""
wp post get 496 --field=post_content --url=$URL > /tmp/snippet-496.js
SIZE=$(wc -c < /tmp/snippet-496.js)
LINES=$(wc -l < /tmp/snippet-496.js)
echo "Taille : $SIZE octets, $LINES lignes"
echo ""
echo "--- Contenu complet ---"
cat /tmp/snippet-496.js
