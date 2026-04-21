#!/bin/bash
# Diagnostic : espace vide sous stats + cards mobile trop etroites
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/" > /tmp/home.html

echo "=== 1. Element apres inari-hero-stats-wrapper (espace vide sous 48h) ==="
grep -oE '</div>\s*<div class="inari-hero-stats-wrapper[^>]*>' /tmp/home.html | head -3
grep -oE '<div class="inari-hero-stats-wrapper[^"]*"[^>]*>' /tmp/home.html | head -3

echo ""
echo "=== 2. Padding/margin du wrapper en mobile ==="
grep -B1 -A5 'inari-hero-stats-wrapper' /tmp/home.html | grep -E 'padding|margin' | head -10

echo ""
echo "=== 3. Classes des cards 'Audit Web' (services) sur mobile ==="
grep -oE '<[^>]*service-card[^>]*>' /tmp/home.html | head -3
grep -oE '<[^>]*services-grid[^>]*>' /tmp/home.html | head -3

echo ""
echo "=== 4. Regles CSS existantes pour services-grid en mobile ==="
grep -nB1 -A5 'services-grid' /tmp/home.html | head -30

echo ""
echo "=== 5. Regles CSS .inari-container (wrapper probable des cards) ==="
grep -nB1 -A5 '\.inari-container\s*{' /tmp/home.html | head -30

echo ""
echo "=== 6. Padding/marges des sections services/boutique/articles en mobile ==="
grep -B2 -A5 '\.inari-services\|\.inari-shop\|\.inari-articles' /tmp/home.html | grep -E 'padding|margin' | head -20

echo ""
echo "=== 7. Hero section : padding-bottom ou margin-bottom en mobile ==="
grep -B1 -A6 '^\s*\.hero-section\s*{' /tmp/home.html | head -40
