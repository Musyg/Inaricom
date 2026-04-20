#!/bin/bash
cd ~/inaricom.com/web-staging/wp-content/uploads/custom-css-js
echo "=== Section 47b existante dans 347 (probablement la cause) ==="
sed -n '3080,3135p' 347.css
