#!/bin/bash
# Resync fichier 347.css statique avec contenu DB + check mecanisme plugin
set -e
cd ~/inaricom.com/web-staging

echo "=== 1. Backup fichier 347.css actuel ==="
cp wp-content/uploads/custom-css-js/347.css /tmp/347-static-backup-$(date +%Y%m%d-%H%M%S).css
ls -la /tmp/347-static-backup-*.css | tail -1

echo ""
echo "=== 2. Diff rapide : fichier vs DB ==="
echo "--- Fichier statique (5 premieres lignes) ---"
head -5 wp-content/uploads/custom-css-js/347.css
echo ""
echo "--- DB (5 premieres lignes) ---"
wp post get 347 --field=post_content --url=https://staging.inaricom.com | head -5

echo ""
echo "=== 3. Chercher fonction plugin qui genere le fichier ==="
grep -rn "uploads/custom-css-js" wp-content/plugins/custom-css-js/ --include="*.php" | head -5
echo ""
grep -rn "function.*save_file\|function.*write_file\|function.*generate" wp-content/plugins/custom-css-js/ --include="*.php" | grep -v codemirror | head -10

echo ""
echo "=== 4. Reecrire fichier statique avec contenu DB ==="
wp post get 347 --field=post_content --url=https://staging.inaricom.com > wp-content/uploads/custom-css-js/347.css
NEW_SIZE=$(wc -c < wp-content/uploads/custom-css-js/347.css)
echo "   Nouvelle taille fichier: $NEW_SIZE octets"

echo ""
echo "=== 5. Verifier ==="
head -12 wp-content/uploads/custom-css-js/347.css
echo "..."
grep -c 'fonts.googleapis' wp-content/uploads/custom-css-js/347.css || true
echo "   matches 'fonts.googleapis' dans fichier (doit etre 0)"
grep -c '@font-face' wp-content/uploads/custom-css-js/347.css || true
echo "   matches '@font-face' dans fichier (doit etre 4)"
grep -c 'DEPRECATED' wp-content/uploads/custom-css-js/347.css || true
echo "   matches 'DEPRECATED' dans fichier (doit etre 1+)"

echo ""
echo "=== 6. Tester le hook de regen du plugin ==="
# On va tenter de trigger wp_insert_post sur 347 pour voir si ca regenere
wp eval "
// Recuperer le post
\$post = get_post(347);
// Forcer un save
\$result = wp_update_post([
    'ID' => 347,
    'post_modified' => current_time('mysql'),
], true);
if (!is_wp_error(\$result)) echo 'OK: save_post trigger envoye';
else echo 'ERREUR: ' . \$result->get_error_message();
" --url=https://staging.inaricom.com
echo ""

# Verifier si le plugin a regenere le fichier
AFTER_SAVE_SIZE=$(wc -c < wp-content/uploads/custom-css-js/347.css)
echo "   Taille fichier apres trigger save: $AFTER_SAVE_SIZE"

echo ""
echo "=== 7. Verif Google Fonts DANS FICHIER final ==="
grep -c 'fonts.googleapis' wp-content/uploads/custom-css-js/347.css || true
