#!/bin/bash
# Identifier le "Inaricom" titre mobile
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'
HTML=$(curl -s -u "$AUTH" "$URL/")

echo "=== Blocks site-title / site-description / tagline ==="
echo "$HTML" | grep -oE '<(div|span|p|h1)[^>]*(site-title|site-description|tagline)[^>]*>[^<]*</[^>]+>' | head -10

echo ""
echo "=== site-branding complet structure ==="
# Extraire la section site-branding mobile
echo "$HTML" | grep -oE 'mobile-site-branding[^<]*<[^>]*>' | head -5
echo ""
echo "--- Contexte complet mobile-site-branding ---"
awk '/mobile-site-branding/,/<\/a>/' /tmp/prod.html 2>/dev/null | head -15

# Sauvegarder le HTML pour inspection
echo "$HTML" > /tmp/homepage.html
echo ""
echo "=== Recherche texte 'Inaricom' + classes ==="
grep -oE '[^<>]*Inaricom[^<>]*' /tmp/homepage.html | sort -u | head -15
echo ""
echo "--- Element avec class site-title ---"
grep -oE '<[^>]*site-title[^>]*>[^<]*</[^>]+>' /tmp/homepage.html | head -3
