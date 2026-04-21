#!/bin/bash
# Corriger l'item Accueil : supprimer ancien (376) et recreer pointant vers 985
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== 1. Inspect meta de l'item 376 ==="
wp db query "SELECT meta_key, meta_value FROM hiiw_postmeta WHERE post_id = 376;" --url=$URL

echo ""
echo "=== 2. Fix direct via SQL : changer _menu_item_object_id 366 -> 985 ==="
wp db query "UPDATE hiiw_postmeta SET meta_value='985' WHERE post_id=376 AND meta_key='_menu_item_object_id';" --url=$URL

echo ""
echo "=== 3. Verifier ==="
wp menu item list principal --url=$URL --fields=db_id,type,title,url

echo ""
echo "=== 4. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -1
