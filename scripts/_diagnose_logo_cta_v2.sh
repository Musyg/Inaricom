#!/bin/bash
# Diagnostic simple sans python inline
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/" > /tmp/prod-full.html

echo "=== 1. LOGO : HTML balise ==="
grep -oE '<img[^>]*custom-logo[^>]*/?>' /tmp/prod-full.html | head -1

echo ""
echo "=== 2. LOGO : URL src actuel (doit etre Design-sans-titre-16 si or fonctionne) ==="
grep -oE 'src="[^"]*logo[^"]*\.png"' /tmp/prod-full.html | head -3

echo ""
echo "=== 3. Recherche regle content: url avec Design-sans-titre-16 ==="
grep -c 'Design-sans-titre-16' /tmp/prod-full.html || true
echo "   occurrences dans le HTML"
grep -c '!important' /tmp/prod-full.html | head -1

echo ""
echo "=== 4. Presence de notre regle section 60e (logo swap override) ==="
grep -A2 '60e. LOGO SWAP' /tmp/prod-full.html | head -10

echo ""
echo "=== 5. BOUTON nous contacter : chercher TOUTES les regles .i-cta-box__btn ==="
grep -oE '\.i-cta-box__btn[^{]*\{[^}]+\}' /tmp/prod-full.html | head -8

echo ""
echo "=== 6. Y a-t-il notre regle 60b pour i-cta-box ==="
grep -c 'i-cta-box__btn \{' /tmp/prod-full.html || true
echo "   (doit etre au moins 1 pour que notre override soit present)"

echo ""
echo "=== 7. Position : le template i-* vient APRES notre section 60 ? ==="
POS_TEMPLATE=$(grep -bo '.i-cta-box__btn{background:var' /tmp/prod-full.html | head -1 | cut -d: -f1)
POS_OUR=$(grep -bo '60b. OVERRIDES CIBLES' /tmp/prod-full.html | head -1 | cut -d: -f1)
echo "   Position template i-* (rule compacte .i-cta-box__btn{background:var) : $POS_TEMPLATE"
echo "   Position notre section 60b : $POS_OUR"
if [ -n "$POS_TEMPLATE" ] && [ -n "$POS_OUR" ]; then
    if [ "$POS_TEMPLATE" -gt "$POS_OUR" ]; then
        echo "   /!\ PROBLEME : template i-* est APRES notre section 60 -> il ecrase notre override"
    else
        echo "   OK : template i-* est AVANT notre section 60 -> notre override devrait gagner"
    fi
fi

echo ""
echo "=== 8. Taille totale HTML + position des styles ==="
wc -c /tmp/prod-full.html
echo ""
echo "--- Les 3 derniers <style> tags positions ---"
grep -bo '<style' /tmp/prod-full.html | tail -5
