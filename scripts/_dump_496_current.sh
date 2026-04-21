#!/bin/bash
# Dumper le snippet 496 (switcher JS) pour analyse
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== Snippet 496 metadata ==="
wp post get 496 --url=$URL --fields=ID,post_title,post_status,post_date_gmt

echo ""
echo "=== Snippet 496 content ==="
wp post get 496 --field=post_content --url=$URL > /tmp/snippet-496-current.js
wc -l /tmp/snippet-496-current.js
echo ""
cat /tmp/snippet-496-current.js

echo ""
echo "=== Est-ce un JS type ou CSS type ? ==="
wp db query "SELECT meta_key, meta_value FROM hiiw_postmeta WHERE post_id = 496 LIMIT 20;" --url=$URL
