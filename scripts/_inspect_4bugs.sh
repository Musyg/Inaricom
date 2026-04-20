#!/bin/bash
# Inspection des 4 bugs residuels + titres gradient
set -e
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL='https://staging.inaricom.com'

HTML=$(curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/")

echo "=== A. LOGO : quel element HTML ? ==="
echo "$HTML" | grep -oE '<a[^>]*(custom-logo-link|site-logo)[^>]*>[^<]*<img[^>]*/?>' | head -2
echo ""
echo "--- Classes sur le <img> du logo ---"
echo "$HTML" | grep -oE '<img[^>]*custom-logo[^>]*>' | head -2
echo ""
echo "--- URL image du logo actuellement rendered ---"
echo "$HTML" | grep -oE 'src="[^"]*Design-sans-titre[^"]*"' | head -3

echo ""
echo "=== B. ICONES PUSH-PIN : definition CSS ==="
echo "$HTML" | grep -oE '\.i-desc-card__icon\{[^}]+\}' | head -2
echo "--- hex rgba(230, 57, 70) occurrences ---"
echo "$HTML" | grep -cE 'rgba\(230,\s*57,\s*70' || true
echo "   occurrences (doit etre remplace par var(--inari-red-rgb))"

echo ""
echo "=== C. BOUTON 'Nous contacter' : HTML + CSS ==="
echo "--- Markup bouton ---"
echo "$HTML" | grep -oE '<a[^>]*i-cta-box__btn[^>]*>[^<]*</a>' | head -2
echo ""
echo "--- Regles CSS .i-cta-box__btn ---"
echo "$HTML" | grep -oE '\.i-cta-box__btn[^{]*\{[^}]+\}' | head -5

echo ""
echo "=== D. HOVER CARDS PRODUITS SIMILAIRES ==="
echo "--- Wrapper HTML ---"
echo "$HTML" | grep -oE '<section[^>]*related[^>]*>' | head -2
echo "$HTML" | grep -oE '<ul class="[^"]*products[^"]*"' | head -3
echo ""
echo "--- Regles hover dans notre 347 ---"
echo "$HTML" | grep -oE 'ul\.products li\.product:hover[^}]+}' | head -3

echo ""
echo "=== E. TITRES 'En detail' + 'Caracteristiques techniques' ==="
echo "--- HTML des h2 section ---"
echo "$HTML" | grep -oE '<h2[^>]*>[^<]*(detail|technique|Technique|Detail|Specif)[^<]*</h2>' | head -3
echo "$HTML" | grep -oE '<h2[^>]*i-section__title[^>]*>.{0,200}' | head -3
echo ""
echo "--- Classe i-section__title definition ---"
echo "$HTML" | grep -oE '\.i-section__title[^{]*\{[^}]+\}' | head -2
echo ""
echo "--- Span dans h2 ---"
echo "$HTML" | grep -oE '\.i-section__title span[^{]*\{[^}]+\}' | head -2
