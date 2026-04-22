#!/bin/bash
F=/home/toriispo/inaricom.com/web-staging/wp-content/uploads/custom-css-js/347.css
ls -la "$F"
echo "--- FIRST 3 LINES ---"
head -3 "$F"
echo "--- LAST 3 LINES ---"
tail -3 "$F"
echo "--- COUNT Design-sans-titre ---"
grep -c "Design-sans-titre" "$F" || echo 0
echo "--- COUNT content: url Design ---"
grep -c "content: url" "$F" || echo 0
echo "--- TAILLE ---"
wc -c "$F"
