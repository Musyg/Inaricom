#!/bin/bash
# B.4 push : refactor massif 347 sections 43-48
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

echo "=== 1. Backup complet DB + fichier statique 347 ==="
TS=$(date +%Y%m%d-%H%M%S)
wp post get 347 --field=post_content --url=$URL > /tmp/347-backup-b4-db-$TS.css
cp wp-content/uploads/custom-css-js/347.css /tmp/347-backup-b4-static-$TS.css

DB_SIZE=$(wc -c < /tmp/347-backup-b4-db-$TS.css)
STATIC_SIZE=$(wc -c < /tmp/347-backup-b4-static-$TS.css)
echo "   Backup DB:     /tmp/347-backup-b4-db-$TS.css ($DB_SIZE octets)"
echo "   Backup static: /tmp/347-backup-b4-static-$TS.css ($STATIC_SIZE octets)"

echo ""
echo "=== 2. Update DB 347 (wp_update_post) ==="
wp eval "
\$content = file_get_contents('/tmp/347-REFACTORED-B4.css');
if (\$content === false) { echo 'ERREUR lecture'; exit(1); }
\$r = wp_update_post(['ID' => 347, 'post_content' => \$content], true);
if (is_wp_error(\$r)) { echo 'ERREUR: ' . \$r->get_error_message(); exit(1); }
echo 'OK: post 347 updated (' . strlen(\$content) . ' octets)' . PHP_EOL;
" --url=$URL

echo ""
echo "=== 3. Resync fichier statique AVEC WRAPPER (critique B'.3) ==="
FILE=wp-content/uploads/custom-css-js/347.css
TMP=/tmp/347-with-wrapper-b4.css

echo '<!-- start Simple Custom CSS and JS -->' > $TMP
echo '<style type="text/css">' >> $TMP
wp post get 347 --field=post_content --url=$URL >> $TMP
echo '</style>' >> $TMP
echo '<!-- end Simple Custom CSS and JS -->' >> $TMP

mv $TMP $FILE
NEW_STATIC=$(wc -c < $FILE)
echo "   Fichier: $NEW_STATIC octets"

echo ""
echo "=== 4. Verif wrapper ==="
head -2 $FILE
echo "..."
tail -2 $FILE

echo ""
echo "=== 5. Flush cache ==="
wp cache flush --url=$URL 2>&1 | tail -2

echo ""
echo "=== 6. Smoke tests ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'

echo ""
echo "--- Test 1 : Homepage ---"
HOME_HTML=$(curl -s -u "$AUTH" "$URL/")
HOME_SIZE=$(echo "$HOME_HTML" | wc -c)
HOME_STYLES=$(echo "$HOME_HTML" | grep -c '<style' || true)
echo "   Taille HTML: $HOME_SIZE octets"
echo "   Balises <style>: $HOME_STYLES"

# Chercher signature nouvelle section 43
HAS_NEW_43=$(echo "$HOME_HTML" | grep -c 'EXCEPTIONS THÈME' || true)
echo "   Signature nouvelle section 43 (EXCEPTIONS THÈME): $HAS_NEW_43"

# Verifier absence ancienne section 43
HAS_OLD_43=$(echo "$HOME_HTML" | grep -c 'PATCH THÈMES — FORÇAGE COULEURS' || true)
echo "   Signature ancienne section 43 supprimee (doit etre 0): $HAS_OLD_43"

echo ""
echo "--- Test 2 : Page fiche produit ---"
PROD_HTML=$(curl -s -u "$AUTH" "$URL/produit/nvidia-jetson-orin-nano-super/")
PROD_SIZE=$(echo "$PROD_HTML" | wc -c)
echo "   Taille HTML: $PROD_SIZE octets"

echo ""
echo "--- Test 3 : Page contact ---"
CONTACT_HTML=$(curl -s -u "$AUTH" "$URL/contact/")
CONTACT_SIZE=$(echo "$CONTACT_HTML" | wc -c)
echo "   Taille HTML: $CONTACT_SIZE octets"

echo ""
echo "================================================================"
echo "Push B.4 TERMINE"
echo "Backups : /tmp/347-backup-b4-db-$TS.css"
echo "          /tmp/347-backup-b4-static-$TS.css"
echo ""
echo "EN CAS DE REGRESSION : bash rollback_b4.sh"
echo "================================================================"
