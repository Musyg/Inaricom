#!/bin/bash
# Trouver dans quelle section du 347 se trouvent les regles lignes 6084 et 6099
FILE=~/inaricom.com/web-staging/wp-content/uploads/custom-css-js/347.css

echo "=== Chercher dans le 347 ou est la regle grid 2 col ==="
grep -nB3 'grid-template-columns: repeat(2, 1fr) !important' "$FILE" | head -15

echo ""
echo "=== Section autour de cette regle (marqueurs de section) ==="
grep -n '^ *[0-9]\+\. \|^\/\* =' "$FILE" | head -80
