#!/bin/bash
# Verifier que les regles section 60 ciblent bien .theme-* maintenant
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/" > /tmp/prod.html

echo "=== 1. Remap .i-* : selecteur .theme-rouge/or/bleu/vert present ? ==="
grep -c '.theme-rouge,' /tmp/prod.html
grep -c '.theme-or,' /tmp/prod.html
grep -c '.theme-bleu,' /tmp/prod.html
grep -c '.theme-vert' /tmp/prod.html

echo ""
echo "=== 2. Logo swap : background-image sur .brand.has-logo-image ==="
grep -c 'brand.has-logo-image' /tmp/prod.html
echo "   Design-sans-titre URLs dans la section logo :"
grep -oE 'Design-sans-titre-1[356]' /tmp/prod.html | sort -u

echo ""
echo "=== 3. Bouton .i-cta-box__btn : override present ==="
grep -oE '\.i-cta-box__btn \{[^}]+background: var[^}]+\}' /tmp/prod.html | head -1

echo ""
echo "=== 4. Body class theme-or confirmee ==="
grep -oE 'class="[^"]*theme-or[^"]*"' /tmp/prod.html | head -1 | grep -oE 'theme-or'

echo ""
echo "=== 5. Ordre CSS : notre section 60 est APRES le template i-* ==="
POS_TPL=$(grep -bo 'i-cta-box__btn{' /tmp/prod.html | head -1 | cut -d: -f1)
POS_60=$(grep -bo '60b. OVERRIDES' /tmp/prod.html | head -1 | cut -d: -f1)
POS_60E=$(grep -bo '60e. LOGO SWAP' /tmp/prod.html | head -1 | cut -d: -f1)
echo "   Position template (.i-cta-box__btn{) : $POS_TPL"
echo "   Position notre section 60b           : $POS_60"
echo "   Position notre section 60e logo swap : $POS_60E"
if [ -n "$POS_TPL" ] && [ -n "$POS_60" ]; then
    if [ "$POS_60" -gt "$POS_TPL" ]; then
        echo "   OK : notre override APRES template -> specificite + ordre = on gagne"
    else
        echo "   ATTENTION : notre override AVANT template -> template ecrase"
    fi
fi
