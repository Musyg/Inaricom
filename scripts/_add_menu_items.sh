#!/bin/bash
# Ajouter Boutique, Articles, Mentions legales au menu Principal
# + corriger l'item Accueil (pointer vers / et pas /366-2/)
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== 1. Etat avant modifications ==="
wp menu item list principal --url=$URL --fields=db_id,type,title,url

echo ""
echo "=== 2. Corriger Accueil : pointer vers / (ID 985) au lieu de /366-2/ ==="
# L'item 376 pointe vers page 366 (ancien Accueil)
# La homepage actuelle est 985. On met a jour l'item pour pointer vers 985
wp menu item update 376 --title=Accueil --url=$URL/ --link=$URL/ --url=$URL 2>&1 || echo "   (update direct echoue, on va recreer)"

# Plan B : supprimer et recreer proprement
# wp menu item delete 376 --url=$URL

echo ""
echo "=== 3. Ajouter Boutique (WooCommerce shop page 56) ==="
# Position : apres Services (1035) et avant Contact (383)
# On vise position 5 (Contact est actuellement en 6)
wp menu item add-post principal 56 --title="Boutique" --url=$URL

echo ""
echo "=== 4. Ajouter Articles (page 471) ==="
wp menu item add-post principal 471 --title="Articles" --url=$URL

echo ""
echo "=== 5. Ajouter Mentions legales (page 675) ==="
wp menu item add-post principal 675 --title="Mentions legales" --url=$URL

echo ""
echo "=== 6. Etat apres ajouts ==="
wp menu item list principal --url=$URL --fields=db_id,type,title,url

echo ""
echo "=== 7. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -1
