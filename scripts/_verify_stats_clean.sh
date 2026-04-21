#!/bin/bash
# Verifier que les regles grid sur .inari-hero-stats sont bien toutes parties
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/" > /tmp/home.html

echo "=== Toutes les regles .inari-hero-stats { } dans HTML rendered ==="
grep -nB1 -A10 '^\s*\.inari-hero-stats\s*{' /tmp/home.html | head -50

echo ""
echo "=== Recherche 'display: grid' proche de inari-hero-stats ==="
grep -nB2 -A4 'inari-hero-stats' /tmp/home.html | grep -E 'inari-hero-stats|display|grid-template' | head -20

echo ""
echo "=== Ma section 61 est-elle presente ? ==="
grep -c '61\. HERO HOMEPAGE' /tmp/home.html
echo ""
echo "--- Regle flex-direction column (la notre) ---"
grep -B2 -A3 'flex-direction: column' /tmp/home.html | head -20
