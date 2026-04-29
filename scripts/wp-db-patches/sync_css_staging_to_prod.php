<?php
/**
 * SYNC complet staging -> prod pour CSS/snippets/customizer.
 *
 * Reconnaissance d'erreur : la strategie surgical-empilage etait mauvaise.
 * Le staging a une config CSS coherente qui FONCTIONNE (React islands rendent
 * correctement). Apres bascule prod, j'ai patche bouts par bouts au lieu de
 * simplement copier la config staging. Resultat : config prod incoherente,
 * titres invisibles, boutons casses, header degrade.
 *
 * Solution propre : prendre tel quel ce qui fonctionne sur staging et le
 * pousser sur prod, avec adaptation des URLs (staging.inaricom.com -> inaricom.com).
 *
 * Idempotent : check checksums avant overwrite.
 *
 * Backup automatique sur prod dans meta `_pre_sync_2026_04_29_T2`.
 *
 * Usage : depuis la machine de dev (Phoenix2), via SSH inaricom.
 */

define('WP_USE_THEMES', false);

// Connect to PROD WordPress
require_once '/home/toriispo/inaricom.com/web/wp-load.php';

// On ouvre staging via DB directe (meme serveur, meme user MySQL).
// Le staging est sur une DB differente, mais on peut interroger via le
// chemin web-staging (qui a son propre wp-load.php).
//
// Approche : on lance un PHP separe pour staging, on dump le contenu
// dans un fichier intermediaire, puis on lit depuis prod.
//
// Plus simple : on passe par WP-CLI pour pull staging, on stocke dans
// /tmp, on read depuis prod.
//
// Mais on est deja dans wp-load prod, donc on lit /tmp/files prepares
// avant le run par le shell wrapper.

$prod_url = 'https://inaricom.com';
$staging_url = 'https://staging.inaricom.com';

function adapt_urls(string $content, string $from, string $to): string {
    return str_replace($from, $to, $content);
}

// === 1. Snippet 347 ===
echo "=== 1. Sync snippet 347 (custom CSS INARICOM) ===\n";
$staging_347_path = '/tmp/sync_staging_347.txt';
if (!file_exists($staging_347_path)) {
    echo "  ERREUR : $staging_347_path manquant. Le shell wrapper doit dump staging avant.\n";
    exit(1);
}
$staging_content = file_get_contents($staging_347_path);
$staging_content = adapt_urls($staging_content, $staging_url, $prod_url);
$staging_size = strlen($staging_content);

$prod_post = get_post(347);
$prod_content = $prod_post ? $prod_post->post_content : '';
$prod_size = strlen($prod_content);

if ($prod_content === $staging_content) {
    echo "  identique, skip\n";
} else {
    // Backup
    if (!get_post_meta(347, '_pre_sync_2026_04_29_T2', true)) {
        update_post_meta(347, '_pre_sync_2026_04_29_T2', $prod_content);
    }
    wp_update_post(['ID' => 347, 'post_content' => $staging_content]);
    // Regen static cache
    $wrapped = "<!-- start Simple Custom CSS and JS -->\n<style>\n" . $staging_content . "\n</style>\n<!-- end Simple Custom CSS and JS -->\n";
    file_put_contents(WP_CONTENT_DIR . '/uploads/custom-css-js/347.css', $wrapped);
    echo "  prod 347 : $prod_size bytes -> $staging_size bytes (delta " . ($staging_size - $prod_size) . " bytes)\n";
    echo "  static cache regen : " . strlen($wrapped) . " bytes\n";
    update_post_meta(347, '_active', 'yes');
    wp_update_post(['ID' => 347, 'post_status' => 'publish']);
}

// === 2. Customizer 362 ===
echo "\n=== 2. Sync customizer 362 ===\n";
$staging_362_path = '/tmp/sync_staging_362.txt';
if (!file_exists($staging_362_path)) {
    echo "  ERREUR : $staging_362_path manquant. Skip.\n";
} else {
    $staging_362_content = file_get_contents($staging_362_path);
    $staging_362_content = adapt_urls($staging_362_content, $staging_url, $prod_url);
    $prod_362 = get_post(362);
    $prod_362_content = $prod_362 ? $prod_362->post_content : '';
    if ($prod_362_content === $staging_362_content) {
        echo "  identique, skip\n";
    } else {
        if (!get_post_meta(362, '_pre_sync_2026_04_29_T2', true)) {
            update_post_meta(362, '_pre_sync_2026_04_29_T2', $prod_362_content);
        }
        wp_update_post(['ID' => 362, 'post_content' => $staging_362_content]);
        echo "  customizer 362 : " . strlen($prod_362_content) . " -> " . strlen($staging_362_content) . " bytes\n";
    }
}

// === 3. Cache flush + delete transients ===
echo "\n=== 3. Cache flush ===\n";
wp_cache_flush();
delete_transient('inaricom_customizer_cache');
echo "  cache flush OK\n";

echo "\nOK\n";
