#!/bin/bash
# Diagnostic logo staging - LECTURE SEULE (pas de rm, mv, cp, echo>, sed -i)
# A executer via : ssh inaricom 'bash -s' < diagnostic_logo_staging.sh > diagnostic_result.txt

set +e  # ne pas stopper sur erreurs partielles

STAGING="/home/toriispo/inaricom.com/web-staging"
PROD="/home/toriispo/inaricom.com/web"

echo "=============================================="
echo "DIAGNOSTIC LOGO STAGING - $(date)"
echo "=============================================="

echo ""
echo "=== 1. HOST / STRUCTURE INARICOM.COM ==="
hostname
echo "Contenu /home/toriispo/inaricom.com/ :"
ls -la /home/toriispo/inaricom.com/ 2>/dev/null | head -20
echo ""
[ -d "$STAGING" ] && echo "web-staging OK: $STAGING" || echo "web-staging MANQUANT"
[ -d "$PROD" ] && echo "web (prod) OK: $PROD" || echo "web MANQUANT"

echo ""
echo "=== 2. RECHERCHE GLOBALE PNG LOGOS (staging) ==="
echo "--- find Design-sans-titre*.png dans tout le staging ---"
find "$STAGING" -iname "design-sans-titre*" -type f 2>/dev/null | head -30
echo ""
echo "--- find cropped-logolong*.png dans tout le staging ---"
find "$STAGING" -iname "cropped-logolong*" -type f 2>/dev/null | head -10
echo ""
echo "--- find tous les fichiers logo/Logo dans staging/wp-content/uploads ---"
find "$STAGING/wp-content/uploads/" -iname "*logo*" -type f 2>/dev/null | head -30

echo ""
echo "=== 3. STRUCTURE UPLOADS ==="
echo "--- /wp-content/uploads/ annees ---"
ls "$STAGING/wp-content/uploads/" 2>/dev/null | head -20
echo ""
echo "--- /wp-content/uploads/2024/ ---"
ls "$STAGING/wp-content/uploads/2024/" 2>/dev/null
echo ""
echo "--- /wp-content/uploads/2026/ ---"
ls "$STAGING/wp-content/uploads/2026/" 2>/dev/null

echo ""
echo "=== 4. DETAIL 2026/01 (la ou etaient cense etre les 4 variantes) ==="
ls -la "$STAGING/wp-content/uploads/2026/01/" 2>/dev/null | head -40

echo ""
echo "=== 5. DETAIL 2024/01 (logo rouge natif) ==="
ls -la "$STAGING/wp-content/uploads/2024/01/" 2>/dev/null | head -30

echo ""
echo "=== 6. CUSTOM-CSS-JS FICHIERS ACTIFS ==="
ls -la "$STAGING/wp-content/uploads/custom-css-js/" 2>/dev/null | head -30

echo ""
echo "=== 7. REFS LOGO DANS LES CSS STATIQUES ==="
CSS_DIR="$STAGING/wp-content/uploads/custom-css-js"
echo "--- fichiers CSS contenant 'Design-sans-titre' ---"
grep -l "Design-sans-titre" "$CSS_DIR"/*.css 2>/dev/null || echo "(aucun)"
echo ""
echo "--- occurrences par variante ---"
for n in 13 15 16 17; do
    c=$(grep -h "Design-sans-titre-$n" "$CSS_DIR"/*.css 2>/dev/null | wc -l)
    echo "  Design-sans-titre-$n : $c refs"
done
echo ""
echo "--- occurrences cropped-LogoLong4White ---"
grep -c "LogoLong4White\|cropped-LogoLong" "$CSS_DIR"/*.css 2>/dev/null | grep -v ":0$" | head -10 || echo "(aucun)"

echo ""
echo "=== 8. REGLES DE SWAP PAR [data-theme=X] ==="
for theme in or vert bleu neutre; do
    c=$(grep -E "\[data-theme=\"$theme\"\].*(site-logo|custom-logo)" "$CSS_DIR"/*.css 2>/dev/null | wc -l)
    echo "  [data-theme=\"$theme\"] .site-logo/.custom-logo : $c refs"
done

echo ""
echo "=== 9. REGLES .theme-X BODY ==="
for theme in neutre or vert bleu; do
    c=$(grep -E "\.theme-$theme.*(custom-logo|site-logo|logo)" "$CSS_DIR"/*.css 2>/dev/null | wc -l)
    echo "  .theme-$theme *logo : $c refs"
done

echo ""
echo "=== 10. EXTRAIT BRUT DES 3 PREMIERES LIGNES DE CHAQUE OCCURRENCE ==="
echo "--- Toutes les lignes contenant 'Design-sans-titre' ---"
grep -H "Design-sans-titre" "$CSS_DIR"/*.css 2>/dev/null | head -30

echo ""
echo "=== 11. DATES DE MODIF DES CSS STATIQUES (tri recent) ==="
ls -lt "$CSS_DIR"/*.css 2>/dev/null | head -15

echo ""
echo "=== 12. RECHERCHE EVENTUELLE DE BACKUPS LOGO AILLEURS ==="
find /home/toriispo -iname "design-sans-titre*" -type f 2>/dev/null | head -20

echo ""
echo "=============================================="
echo "FIN DIAGNOSTIC $(date)"
echo "=============================================="
