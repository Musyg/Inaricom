#!/bin/bash
# Verifier les regles CSS du logo swap dans le 347
set -e
cd ~/inaricom.com/web-staging

echo "=== Extraction regles custom-logo dans 347 ==="
wp post get 347 --field=post_content --url=https://staging.inaricom.com | grep -A2 'custom-logo' | head -40

echo ""
echo "=== Verifier les images de logos disponibles dans uploads ==="
ls -la wp-content/uploads/2024/01/ | grep -iE 'logo|design' | head -20

echo ""
echo "=== Verifier Design-sans-titre-* ==="
find wp-content/uploads/ -iname 'Design-sans-titre*' -o -iname 'LogoLong*' 2>/dev/null | head -20
