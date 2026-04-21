#!/bin/bash
# Pourquoi flex-direction column n'est pas applique sur mobile
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/" > /tmp/home.html

echo "=== 1. Le fichier statique contient bien flex-direction:column ? ==="
grep -c 'flex-direction: column' ~/inaricom.com/web-staging/wp-content/uploads/custom-css-js/347.css
echo ""
echo "--- Toutes les regles .inari-hero-stats dans 347 (statique) ---"
grep -nB1 -A3 'inari-hero-stats' ~/inaricom.com/web-staging/wp-content/uploads/custom-css-js/347.css | head -50

echo ""
echo "=== 2. HTML : le fichier 347.css est-il bien charge ? ==="
grep -oE 'custom-css-js/347\.css\?[^"]*' /tmp/home.html | head -1

echo ""
echo "=== 3. Le HTML contient-il une regle <style> inline qui override ? ==="
grep -oE '<style[^>]*>[^<]*inari-hero-stats[^<]*' /tmp/home.html | head -3

echo ""
echo "=== 4. Regles inari-hero-stats dans HTML rendered (toutes sources) ==="
grep -oE '\.inari-hero-stats[^{]*\{[^}]+\}' /tmp/home.html | head -10

echo ""
echo "=== 5. Lignes 61 section dans statique ==="
awk '/61\. HERO HOMEPAGE/,/FIN SECTION 61/' ~/inaricom.com/web-staging/wp-content/uploads/custom-css-js/347.css | head -50
