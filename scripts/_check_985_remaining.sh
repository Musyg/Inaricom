#!/bin/bash
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== Est-ce que cette regle est dans page 985 ? ==="
grep -B2 -A5 'display: inline-flex' /tmp/985-current.html | head -30

echo ""
echo "=== Compter les regles .inari-hero-stats dans page 985 ==="
grep -c 'inari-hero-stats' /tmp/985-current.html
