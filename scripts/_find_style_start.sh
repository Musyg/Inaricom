#!/bin/bash
# Extraire le contexte complet du style .i-desc-card
# C'est un style inline dans le HTML, identifier sa source
grep -n '<style' /tmp/prod-full.html | head -20

echo ""
echo "--- Ligne 5165-5220 (definition .i-desc-card*) ---"
sed -n '5165,5220p' /tmp/prod-full.html

echo ""
echo "--- Chercher le debut du style bloc (remonter depuis 5166) ---"
# Le style commence par <style ou des --variables CSS
sed -n '5100,5170p' /tmp/prod-full.html
