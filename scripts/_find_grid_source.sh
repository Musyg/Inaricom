#!/bin/bash
# Trouver la source exacte de la regle grid ligne 6099
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/" > /tmp/home.html

echo "=== Contexte lignes 6080-6140 du HTML rendered ==="
sed -n '6080,6140p' /tmp/home.html

echo ""
echo "=== Identifier le <style> contenant cette regle ==="
# Trouver la balise style qui contient la ligne 6099
awk '/<style/{start=NR; tag=$0} /<\/style>/{if(start){for(i=start;i<=NR;i++) if(lines[i] && lines[i] ~ /grid-template-columns: repeat\(2, 1fr\)/) print "Style tag commence ligne "start": "tag; start=0}} {lines[NR]=$0}' /tmp/home.html

echo ""
echo "=== Chercher la balise <style> juste avant ligne 6099 ==="
awk 'NR<=6099 && /<style/' /tmp/home.html | tail -5
