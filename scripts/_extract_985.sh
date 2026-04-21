#!/bin/bash
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

wp post get 985 --field=post_content --url=$URL > /tmp/page-985.html

echo "--- Taille page 985 ---"
wc -c /tmp/page-985.html

echo ""
echo "--- Extraire bloc style avec Stats mobile ---"
grep -B3 -A30 'Stats mobile' /tmp/page-985.html | head -60

echo ""
echo "--- Position du bloc ---"
grep -nb 'Stats mobile' /tmp/page-985.html | head -5
