#!/bin/bash
# B'.3 push : migre #362 → vidé, #347 → consolide
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== 1. Backup DB state actuel #362 et #347 ==="
TS=$(date +%Y%m%d-%H%M%S)
wp post get 362 --field=post_content --url=$URL > /tmp/362-backup-before-clear-$TS.css
wp post get 347 --field=post_content --url=$URL > /tmp/347-backup-before-consolidate-$TS.css
echo "   Backup 362: $(wc -c < /tmp/362-backup-before-clear-$TS.css) octets"
echo "   Backup 347: $(wc -c < /tmp/347-backup-before-consolidate-$TS.css) octets"

echo ""
echo "=== 2. Verifier fichiers sources presents ==="
ls -la /tmp/347-CONSOLIDATED.css /tmp/362-CLEARED.css 2>&1

echo ""
echo "=== 3. Update post #362 (Customizer) ==="
wp eval "
\$content = file_get_contents('/tmp/362-CLEARED.css');
if (\$content === false) { echo 'ERREUR lecture 362'; exit(1); }
\$r = wp_update_post(['ID' => 362, 'post_content' => \$content], true);
if (is_wp_error(\$r)) { echo 'ERREUR 362: ' . \$r->get_error_message(); exit(1); }
echo 'OK: post 362 updated (' . strlen(\$content) . ' octets)' . PHP_EOL;
" --url=$URL

echo ""
echo "=== 4. Update post #347 (snippet principal) ==="
wp eval "
\$content = file_get_contents('/tmp/347-CONSOLIDATED.css');
if (\$content === false) { echo 'ERREUR lecture 347'; exit(1); }
\$r = wp_update_post(['ID' => 347, 'post_content' => \$content], true);
if (is_wp_error(\$r)) { echo 'ERREUR 347: ' . \$r->get_error_message(); exit(1); }
echo 'OK: post 347 updated (' . strlen(\$content) . ' octets)' . PHP_EOL;
" --url=$URL

echo ""
echo "=== 5. Resync fichier statique 347.css (plugin custom-css-js ne le fait pas) ==="
wp post get 347 --field=post_content --url=$URL > wp-content/uploads/custom-css-js/347.css
echo "   Fichier 347.css mis a jour: $(wc -c < wp-content/uploads/custom-css-js/347.css) octets"

echo ""
echo "=== 6. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -3

echo ""
echo "=== 7. Smoke test ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
HTML=$(curl -s -u "$AUTH" "$URL/")
echo "   HTML homepage: $(echo "$HTML" | wc -c) octets"
echo "   Matches 'WOOCOMMERCE SHOP HOVER' (nouvelle section 47): $(echo "$HTML" | grep -c 'WOOCOMMERCE SHOP' || true)"
echo "   Matches '.i-cta-box__btn' (section 47b): $(echo "$HTML" | grep -c 'i-cta-box__btn' || true)"
echo "   Matches Google Fonts (doit etre 0): $(echo "$HTML" | grep -c 'fonts.googleapis' || true)"
echo "   Matches Customizer vide (doit etre 0 ligne CSS): $(echo "$HTML" | grep -c 'woo-archive-action-on-hover' || true) refs à l'ex-CSS Customizer"

echo ""
echo "================================================================"
echo "Push B'.3 : TERMINE"
echo "Backups : /tmp/362-backup-before-clear-$TS.css"
echo "          /tmp/347-backup-before-consolidate-$TS.css"
echo "================================================================"
