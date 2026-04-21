#!/bin/bash
# Voir ce qui reste autour de ligne 968
cd ~/inaricom.com/web-staging

# Relire la page courante
wp post get 985 --field=post_content --url=https://staging.inaricom.com > /tmp/985-current.html

echo "=== Contexte lignes 950-1020 ==="
sed -n '950,1020p' /tmp/985-current.html

echo ""
echo "=== Position des @media ==="
grep -n '@media' /tmp/985-current.html | head -20
