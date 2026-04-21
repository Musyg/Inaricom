#!/bin/bash
# Verifier si le 347 statique contient vraiment &gt; ou juste >
FILE=~/inaricom.com/web-staging/wp-content/uploads/custom-css-js/347.css

echo "=== Nombre de > (octet) dans le fichier ==="
grep -c '>' "$FILE"

echo ""
echo "=== Nombre de &gt; (entity HTML) dans le fichier ==="
grep -c '&gt;' "$FILE"

echo ""
echo "=== Lignes section 61 avec > relation ==="
awk '/61\. HERO HOMEPAGE/,/FIN SECTION 61/' "$FILE" | grep -E '^\s*\.[^{]*[>&]' | head -10

echo ""
echo "=== Hex dump d'une ligne avec hero-section ==="
awk '/61\. HERO HOMEPAGE/,/FIN SECTION 61/' "$FILE" | grep 'hero-section .inari-hero-badge-wrapper .inari-hero-badge' | head -1 | xxd | head -3
