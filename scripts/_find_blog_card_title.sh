#!/bin/bash
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'
curl -s -u "$AUTH" "$URL/articles/" > /tmp/articles.html

echo "=== 1. Structure HTML des cards articles (page Articles) ==="
grep -oE '<[^>]*class="[^"]*(article|post)[-_]?(card|entry|item)[^"]*"[^>]*>' /tmp/articles.html | head -5

echo ""
echo "=== 2. Class des titres dans les cards ==="
grep -oE '<h[1-6][^>]*class="[^"]*"[^>]*>' /tmp/articles.html | head -10

echo ""
echo "=== 3. Si c'est Kadence : classes Kadence typiques ==="
grep -oE 'class="entry-title[^"]*"' /tmp/articles.html | head -3
grep -oE 'class="loop-entry[^"]*"' /tmp/articles.html | head -3

echo ""
echo "=== 4. Regles CSS appliquees aux titres des cards (h2/h3 + entry-title) ==="
grep -nB1 -A4 '\.entry-title\b\|loop-entry h2\|loop-entry h3\|article-card h[23]\|post-card h[23]' /tmp/articles.html | head -40

echo ""
echo "=== 5. Font-size dans les regles avec entry-title ==="
grep -B1 -A10 'entry-title' /tmp/articles.html | grep -E 'font-size|\.entry-title' | head -20

echo ""
echo "=== 6. Apercu taille extreme actuelle ==="
grep -oE 'font-size:\s*[0-9]+(rem|px|em|\.[0-9]+rem)' /tmp/articles.html | sort | uniq -c | sort -rn | head -15
