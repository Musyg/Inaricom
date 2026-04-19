#!/bin/bash
# Le plugin custom-css-js - comment il injecte
cd ~/inaricom.com/web-staging/wp-content/plugins/custom-css-js

echo "=== Fichiers PHP du plugin ==="
find . -name "*.php" -not -path "*/codemirror/*" 2>&1 | head -15

echo ""
echo "=== Grep pour readfile + file_get_contents ==="
grep -rn "readfile\|file_get_contents" . --include="*.php" 2>&1 | grep -v codemirror | head -20
