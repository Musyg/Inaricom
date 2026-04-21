#!/bin/bash
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

echo "=== / homepage ==="
curl -s -u "$AUTH" "$URL/" | grep -oE '<body[^>]*class="[^"]*"' | head -1 | grep -oE 'theme-[a-z]+'

echo ""
echo "=== /shop/ ==="
curl -s -u "$AUTH" "$URL/shop/" | grep -oE '<body[^>]*class="[^"]*"' | head -1 | grep -oE 'theme-[a-z]+'

echo ""
echo "=== /articles/ ==="
curl -s -u "$AUTH" "$URL/articles/" | grep -oE '<body[^>]*class="[^"]*"' | head -1 | grep -oE 'theme-[a-z]+'

echo ""
echo "=== /contact/ ==="
curl -s -u "$AUTH" "$URL/contact/" | grep -oE '<body[^>]*class="[^"]*"' | head -1 | grep -oE 'theme-[a-z]+'
