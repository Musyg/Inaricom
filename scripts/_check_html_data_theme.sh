#!/bin/bash
# Verifier precisement que data-theme="or" est bien present sur html
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'
HTML=$(curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/")

echo "=== <html> tag initial (sans JS execution) ==="
echo "$HTML" | grep -oE '<html[^>]*>' | head -1

echo ""
echo "=== Script qui pose data-theme ==="
echo "$HTML" | grep -oE "documentElement\.dataset\.theme='[^']+'" | head -1

echo ""
echo "=== Position du script qui pose data-theme ==="
POS_SCRIPT=$(echo "$HTML" | grep -bo "documentElement.dataset.theme" | head -1 | cut -d: -f1)
echo "   Position script : $POS_SCRIPT"
POS_STYLE=$(echo "$HTML" | grep -bo "47b. CTA BOX BUTTON" | head -1 | cut -d: -f1)
echo "   Position CSS 47b : $POS_STYLE"

echo ""
echo "=== Le <html> a-t-il un attribut data-theme STATIQUE (render PHP) ? ==="
# Si le PHP posait l'attribut via le filtre language_attributes, on verrait data-theme=... directement
echo "$HTML" | grep -oE '<html[^>]*data-theme[^>]*>' | head

echo ""
echo "=== POINT CRUCIAL : le script JS qui pose data-theme est dans <head> AVANT les styles ou APRES ==="
POS_HEAD_CLOSE=$(echo "$HTML" | grep -bo '</head>' | head -1 | cut -d: -f1)
echo "   Position </head> : $POS_HEAD_CLOSE"
echo "   Script est avant </head> : $([ $POS_SCRIPT -lt $POS_HEAD_CLOSE ] && echo OUI || echo NON)"
echo "   Style 47b est avant </head> : $([ $POS_STYLE -lt $POS_HEAD_CLOSE ] && echo OUI || echo NON)"

echo ""
echo "=== Test ultime : le style 347 est-il CHARGE avec le parametre data-theme deja present ? ==="
# La cascade CSS matche au moment du render (pas au moment du load)
# Le navigateur applique les styles APRES que tous les scripts en head aient fait leur travail
# Donc quand [data-theme="or"] est posee par le script inline et le CSS declare cette regle, le bouton devrait etre or

echo ""
echo "=== Verifier si une FEUILLE DE STYLE CONTENANT la regle template .i-* est chargee APRES le 347 ==="
echo "--- Ordre de chargement des <link rel=stylesheet> ---"
echo "$HTML" | grep -oE '<link[^>]*stylesheet[^>]*>' | grep -oE 'href="[^"]+"' | head -20
