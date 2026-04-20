#!/bin/bash
# Extraire le contexte HTML autour de la balise img.custom-logo
# Trouver la ligne dans le HTML
LINE=$(grep -n 'img[^>]*custom-logo' /tmp/prod-full.html | head -1 | cut -d: -f1)
echo "Ligne img.custom-logo : $LINE"
if [ -n "$LINE" ]; then
    START=$((LINE - 3))
    END=$((LINE + 2))
    sed -n "${START},${END}p" /tmp/prod-full.html
fi

echo ""
echo "=== Chercher contexte complet <a...>img custom-logo</a> ==="
grep -B1 -A1 'class="custom-logo"' /tmp/prod-full.html | head -20
