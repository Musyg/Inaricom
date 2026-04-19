#!/bin/bash
# Trouver les pages qui utilisent WPForms pour tester visuellement
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== Pages avec shortcode WPForms ==="
wp db query "SELECT ID, post_title, post_status, post_type FROM hiiw_posts WHERE post_status='publish' AND (post_content LIKE '%[wpforms%' OR post_content LIKE '%wp:wpforms%') ORDER BY post_type, post_title;" --url=$URL 2>&1

echo ""
echo "=== URLs des pages WPForms ==="
wp db query "SELECT post_name FROM hiiw_posts WHERE post_status='publish' AND (post_content LIKE '%[wpforms%' OR post_content LIKE '%wp:wpforms%') AND post_type='page';" --url=$URL 2>&1 | tail -n +2 | while read slug; do
  if [ -n "$slug" ]; then
    echo "   $URL/$slug/"
  fi
done
