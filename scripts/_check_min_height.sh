#!/bin/bash
# Voir le contexte des min-height 90vh et 100vh
grep -B3 -A3 'min-height: 90vh' /tmp/home.html | head -20
echo ""
echo "--- 100vh ---"
grep -B2 -A2 'min-height: 100vh' /tmp/home.html | head -10
echo ""
echo "--- Mes regles avec min-height dans section 61 ---"
grep -B1 -A1 'min-height' /tmp/home.html | grep -A2 'auto' | head -10
