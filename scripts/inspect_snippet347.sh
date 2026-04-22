#!/bin/bash
set -e
cd /home/toriispo/inaricom.com/web-staging

BACKUP=/tmp/snippet347_backup_$(date +%Y%m%d_%H%M%S).css
wp post get 347 --field=post_content > "$BACKUP"
echo "BACKUP: $BACKUP"
echo -n "TOTAL LIGNES: "; wc -l < "$BACKUP"
echo -n "TAILLE BYTES: "; wc -c < "$BACKUP"

echo ""
echo "=== REFS logo (site-logo, custom-logo, theme-X, Design-sans-titre) ==="
grep -nE 'site-logo|custom-logo|theme-[orbvnu][a-z]*|Design-sans-titre' "$BACKUP" || echo "(AUCUNE ref)"

echo ""
echo "=== DERNIERES 20 LIGNES ==="
tail -20 "$BACKUP"
