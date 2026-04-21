#!/bin/bash
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'
curl -s -u "$AUTH" "$URL/" > /tmp/home.html

echo "=== Toutes les regles min-height sur hero/inari-hero ==="
grep -nB1 -A2 'hero-section\|inari-hero' /tmp/home.html | grep -iE 'min-height|height:|padding-bottom' | head -20

echo ""
echo "=== Regles mobile pour hero dans @media ==="
awk '/@media[^{]*max-width.*(768|720|480)/,/^}/ { print NR": "$0 }' /tmp/home.html | grep -iE 'hero-section|min-height|padding|height:' | head -30

echo ""
echo "=== Element suivant dans DOM apres inari-hero-stats-wrapper ==="
grep -oE 'inari-hero-stats-wrapper.{0,300}' /tmp/home.html | head -2

echo ""
echo "=== La hero section a-t-elle un min-height 100vh ==="
grep -c 'min-height: 100vh' /tmp/home.html
echo "   occurrences min-height: 100vh"
grep -B1 -A2 'min-height: 100vh' /tmp/home.html | head -10

echo ""
echo "=== La stats-wrapper a-t-elle un padding-bottom important ==="
grep -B2 -A5 'inari-hero-stats-wrapper\s*{' /tmp/home.html | head -30
