#!/bin/bash
# B.2 push : variabilisation 740 WPForms
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== 1. Backup DB state 740 ==="
TS=$(date +%Y%m%d-%H%M%S)
wp post get 740 --field=post_content --url=$URL > /tmp/740-backup-b2-$TS.css
echo "   Backup: /tmp/740-backup-b2-$TS.css ($(wc -c < /tmp/740-backup-b2-$TS.css) octets)"

echo ""
echo "=== 2. Update post 740 via wp eval ==="
wp eval "
\$content = file_get_contents('/tmp/740-REFACTORED.css');
if (\$content === false) { echo 'ERREUR lecture'; exit(1); }
\$r = wp_update_post(['ID' => 740, 'post_content' => \$content], true);
if (is_wp_error(\$r)) { echo 'ERREUR: ' . \$r->get_error_message(); exit(1); }
echo 'OK: post 740 update (' . strlen(\$content) . ' octets)' . PHP_EOL;
" --url=$URL

echo ""
echo "=== 3. Resync fichier statique AVEC WRAPPER (leçon B'.3) ==="
FILE=wp-content/uploads/custom-css-js/740.css
TMP=/tmp/740-with-wrapper.css

echo '<!-- start Simple Custom CSS and JS -->' > $TMP
echo '<style type="text/css">' >> $TMP
wp post get 740 --field=post_content --url=$URL >> $TMP
echo '</style>' >> $TMP
echo '<!-- end Simple Custom CSS and JS -->' >> $TMP

mv $TMP $FILE
echo "   Fichier: $(wc -c < $FILE) octets"

echo ""
echo "=== 4. Verif wrapper correct ==="
head -2 $FILE
echo "..."
tail -2 $FILE

echo ""
echo "=== 5. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -2

echo ""
echo "=== 6. Smoke test ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
HTML=$(curl -s -u "$AUTH" "$URL/")

# Verif : plus de #E31E24 dans WPForms
WPFORMS_HARDCODED=$(echo "$HTML" | grep -cE 'wpforms.*#E31E24|#E31E24.*wpforms' || true)
echo "   Hex rouge WPForms dans HTML: $WPFORMS_HARDCODED (doit etre 0)"

# Verif presence var(--inari-red) WPForms
WPFORMS_VARS=$(echo "$HTML" | grep -c 'wpforms-form input:focus' || true)
echo "   Regle WPForms focus servie: $WPFORMS_VARS"

echo ""
echo "================================================================"
echo "Push B.2 TERMINE"
echo "Backup DB : /tmp/740-backup-b2-$TS.css"
echo "================================================================"
