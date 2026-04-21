#!/bin/bash
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== Contenu complet post 362 (Customizer) ==="
wp post get 362 --field=post_content --url=$URL > /tmp/post-362.css
SIZE=$(wc -c < /tmp/post-362.css)
LINES=$(wc -l < /tmp/post-362.css)
echo "Taille : $SIZE octets, $LINES lignes"
echo ""
cat /tmp/post-362.css
