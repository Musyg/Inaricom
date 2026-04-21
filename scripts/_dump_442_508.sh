#!/bin/bash
# Dump contenu snippets 442 et 508 pour consolidation B.5
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=============================================="
echo "SNIPPET 442 - Fox Canvas Container"
echo "=============================================="
wp post get 442 --field=post_title --url=$URL
echo ""
wp post get 442 --field=post_status --url=$URL
echo ""
wp post get 442 --field=post_content --url=$URL > /tmp/snippet-442.css
SIZE_442=$(wc -c < /tmp/snippet-442.css)
LINES_442=$(wc -l < /tmp/snippet-442.css)
echo "Taille : $SIZE_442 octets, $LINES_442 lignes"
echo ""
echo "--- Contenu ---"
cat /tmp/snippet-442.css

echo ""
echo ""
echo "=============================================="
echo "SNIPPET 508 - Centrage Hero page d'accueil"
echo "=============================================="
wp post get 508 --field=post_title --url=$URL
echo ""
wp post get 508 --field=post_status --url=$URL
echo ""
wp post get 508 --field=post_content --url=$URL > /tmp/snippet-508.css
SIZE_508=$(wc -c < /tmp/snippet-508.css)
LINES_508=$(wc -l < /tmp/snippet-508.css)
echo "Taille : $SIZE_508 octets, $LINES_508 lignes"
echo ""
echo "--- Contenu ---"
cat /tmp/snippet-508.css

echo ""
echo "=============================================="
echo "TOTAL a consolider : $((SIZE_442 + SIZE_508)) octets, $((LINES_442 + LINES_508)) lignes"
echo "=============================================="
