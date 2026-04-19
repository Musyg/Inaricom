#!/bin/bash
# Verification switcher : si data-theme='rouge' est jamais pose, les 200 lignes du Customizer sont inertes
cd ~/inaricom.com/web-staging

echo "=== 1. Snippet 496 (JS switcher) ==="
wp post get 496 --field=post_content --url=https://staging.inaricom.com

echo ""
echo "=== 2. Snippet 497 (HTML markup switcher) ==="
wp post get 497 --field=post_content --url=https://staging.inaricom.com
