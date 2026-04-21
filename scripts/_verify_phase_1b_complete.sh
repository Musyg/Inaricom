#!/bin/bash
# Verification complete Phase 1.B : fox + logo + theme-neutre sur /
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

echo "=========================================="
echo "  VERIFICATION PHASE 1.B SUR STAGING /"
echo "=========================================="
echo ""

HTML=$(curl -s -u "$AUTH" "$URL/")

echo "1. THEME & BODY"
echo "   body class : $(echo "$HTML" | grep -oE '<body[^>]*class=\"[^\"]*\"' | grep -oE 'theme-[a-z]+' | tail -1)"
echo "   <html data-theme> : $(echo "$HTML" | grep -oE \"dataset\\.theme=.[a-z]+\" | head -1)"
echo ""

echo "2. LOGO ARGENTE (Design-sans-titre-17)"
echo "   Nb references dans HTML : $(echo "$HTML" | grep -c 'Design-sans-titre-17')"
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' -u "$AUTH" "$URL/wp-content/uploads/2026/01/Design-sans-titre-17.png")
echo "   HTTP sur PNG : $HTTP_CODE"
echo ""

echo "3. FOX v28"
echo "   VERSION v28 dans HTML : $(echo "$HTML" | grep -c 'VERSION: v28')"
echo "   THEME_COLORS.neutre : $(echo "$HTML" | grep -c 'neutre:')"
echo "   Halos rgba(208,208,208) : $(echo "$HTML" | grep -cE 'r: 208,? g: 208')"
echo ""

echo "4. NON-REGRESSION AUTRES THEMES"
for PAGE in shop articles contact; do
    BODY_THEME=$(curl -s -u "$AUTH" "$URL/$PAGE/" | grep -oE '<body[^>]*class=\"[^\"]*\"' | grep -oE 'theme-[a-z]+' | tail -1)
    echo "   /$PAGE/ : $BODY_THEME"
done
echo ""

echo "5. CSS SECTION 63 (theme-neutre vars)"
CSS_CONTENT=$(curl -s -u "$AUTH" "$URL/wp-content/uploads/custom-css-js/347.css")
echo "   body.theme-neutre rules : $(echo "$CSS_CONTENT" | grep -c 'body\.theme-neutre')"
echo "   [data-theme=neutre] logo swap : $(echo "$CSS_CONTENT" | grep -c 'data-theme=\"neutre\"')"
echo "   --inari-red: #FFFFFF sur theme-neutre : $(echo "$CSS_CONTENT" | grep -A1 'body.theme-neutre' | grep -c '#FFFFFF')"
