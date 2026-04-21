#!/bin/bash
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'
curl -s -u "$AUTH" "$URL/" > /tmp/homepage.html

echo "=== Badge WEB INFRASTRUCTURE BLOCKCHAIN - classes ==="
grep -oE '<[^>]*>[^<]*(WEB|INFRASTRUCTURE|BLOCKCHAIN)[^<]*</[^>]+>' /tmp/homepage.html | head -3
echo ""
echo "--- Elements parents autour ---"
grep -oE '<[^>]*hero-badge[^>]*>' /tmp/homepage.html | head -3
grep -oE '<[^>]*badge-wrapper[^>]*>' /tmp/homepage.html | head -3
grep -oE '<[^>]*inari-badge[^>]*>' /tmp/homepage.html | head -3

echo ""
echo "=== Stats 48% 1366 48h - classes wrapper ==="
grep -oE '<[^>]*stats-wrapper[^>]*>' /tmp/homepage.html | head -3
grep -oE '<[^>]*hero-stats[^>]*>' /tmp/homepage.html | head -3
grep -oE '<[^>]*inari-stat[^>]*>' /tmp/homepage.html | head -3

echo ""
echo "--- Contexte autour de '48%' ---"
grep -oE '.{0,100}48%.{0,100}' /tmp/homepage.html | head -3

echo ""
echo "--- Contexte autour de '1366' ou '1 366' ---"
grep -oE '.{0,100}1[ ]*366.{0,100}' /tmp/homepage.html | head -3

echo ""
echo "=== Regles CSS actuelles sur hero-badge et stats ==="
grep -B1 -A4 'inari-hero-badge\|hero-badge-wrapper' ~/inaricom.com/web-staging/wp-content/uploads/custom-css-js/347.css | head -30
echo ""
grep -B1 -A4 'inari-hero-stats\|hero-stats-wrapper' ~/inaricom.com/web-staging/wp-content/uploads/custom-css-js/347.css | head -30
