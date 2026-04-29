<?php
/**
 * Patch ciblé : bloc 2 du snippet 347 (texte noir → blanc sur boutons bleu).
 * Intervient sur le 2e bloc dédié (ligne ~3754) que le patch Python n'a pas
 * matche (line endings mixtes). Utilise regex pour etre robuste.
 */
define('WP_USE_THEMES', false);
require_once '/home/toriispo/inaricom.com/web/wp-load.php';

$post = get_post(347);
if (!$post) { echo "FAIL: post 347 introuvable"; exit(1); }
$css = $post->post_content;

// Regex multiligne, tolere CR/LF mixtes et legers ecarts d'indentation
$pattern = '/(\/\* Thème BLEU — Texte noir sur boutons cyan \*\/\s*\n[^}]+\{\s*\n\s*color:\s*)#0A0A0F(\s*!important;\s*\n\s*\})/';
$replacement = '/* Thème BLEU — Texte blanc sur boutons royal blue */' . "\n" .
    '[data-theme="bleu"] .btn-primary-large,' . "\n" .
    '[data-theme="bleu"] .btn-primary,' . "\n" .
    '[data-theme="bleu"] .btn-submit,' . "\n" .
    '[data-theme="bleu"] .btn-product:hover,' . "\n" .
    '[data-theme="bleu"] .inari-hero-cta .btn-primary,' . "\n" .
    '[data-theme="bleu"] .shop-cta .btn-primary-large {' . "\n" .
    '  color: #FFFFFF !important;' . "\n" .
    '}';

// Approche alternative simple : remplace juste le commentaire + la couleur dans le bloc identifie.
// On localise par marker "Thème BLEU — Texte noir sur boutons cyan".
$marker_old = '/* Thème BLEU — Texte noir sur boutons cyan */';
$marker_new = '/* Thème BLEU — Texte blanc sur boutons royal blue */';

if (strpos($css, $marker_old) === false) {
    echo "FAIL: marker '$marker_old' introuvable dans le contenu DB.\n";
    exit(1);
}

// Remplace le commentaire
$css_new = str_replace($marker_old, $marker_new, $css);

// Trouve la position du nouveau commentaire et remplace le 1er #0A0A0F qui suit (dans les ~250 chars apres le marker)
$pos = strpos($css_new, $marker_new);
$slice_before = substr($css_new, 0, $pos);
$slice_after = substr($css_new, $pos);

// Dans slice_after, remplace UNIQUEMENT la 1ere occurrence de "color: #0A0A0F !important"
$slice_after_patched = preg_replace('/color:\s*#0A0A0F\s*!important/', 'color: #FFFFFF !important', $slice_after, 1);

if ($slice_after === $slice_after_patched) {
    echo "FAIL: aucune substitution color: #0A0A0F apres le marker (deja patch ou format different ?)\n";
    exit(1);
}

$css_final = $slice_before . $slice_after_patched;

// Update DB
$res = wp_update_post(['ID' => 347, 'post_content' => $css_final], true);
if (is_wp_error($res)) { echo "FAIL DB: " . $res->get_error_message(); exit(1); }
echo "DB update OK\n";

// Regen static cache
$wrapped = "<!-- start Simple Custom CSS and JS -->\n<style>\n" . $css_final . "\n</style>\n<!-- end Simple Custom CSS and JS -->\n";
$cache_path = WP_CONTENT_DIR . '/uploads/custom-css-js/347.css';
$bytes = file_put_contents($cache_path, $wrapped);
if ($bytes === false) { echo "FAIL: cannot write cache file"; exit(1); }
echo "Static cache regenere ($bytes bytes)\n";

echo "OK\n";
