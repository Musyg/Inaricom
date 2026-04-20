#!/bin/bash
# Verif [data-theme=or] vs .theme-or dans HTML rendered
grep -nE '\[data-theme=' /tmp/prod-full.html | head -20
echo ""
echo "=== .theme-or dans body class ==="
grep -oE 'class="[^"]*theme-or[^"]*"' /tmp/prod-full.html | head -1
echo ""
echo "=== data-theme attribute sur html ==="
grep -oE '<html[^>]*>' /tmp/prod-full.html | head -1
grep -oE "dataset\.theme='[^']+'" /tmp/prod-full.html | head -3
