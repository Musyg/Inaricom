<?php
/**
 * Kadence Child Theme - Inaricom
 *
 * @package Kadence_Child
 */

// ============================================================
// ENQUEUE STYLES (parent + child)
// ============================================================
add_action('wp_enqueue_scripts', 'kadence_child_enqueue_styles');
function kadence_child_enqueue_styles() {
    wp_enqueue_style(
        'kadence-parent-style',
        get_template_directory_uri() . '/style.css'
    );
    wp_enqueue_style(
        'kadence-child-style',
        get_stylesheet_uri(),
        array('kadence-parent-style'),
        wp_get_theme()->get('Version')
    );
}

// ============================================================
// PRELOAD FONTS CRITIQUES (LCP optimization)
// Precharge Inter 400 et 700 — utilises sur body et headings.
// Gain LCP ~100-200ms sur connexion mobile.
// ============================================================
add_action('wp_head', 'inaricom_preload_critical_fonts', 1);
function inaricom_preload_critical_fonts() {
    $fonts = ['inter-400.woff2', 'inter-700.woff2'];
    $base  = get_stylesheet_directory_uri() . '/assets/fonts/inter/';
    foreach ($fonts as $font) {
        printf(
            '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin="anonymous">' . "\n",
            esc_url($base . $font)
        );
    }
}

// ============================================================
// FOX ANIMATION - Background Parallax
// ============================================================

// Charger le script de l'animation fox (uniquement sur la homepage)
add_action('wp_enqueue_scripts', 'inaricom_fox_animation_scripts');
function inaricom_fox_animation_scripts() {
    // Charger uniquement sur la page d'accueil (decommenter si besoin)
    // if (!is_front_page()) return;

    wp_enqueue_script(
        'fox-animation',
        get_stylesheet_directory_uri() . '/assets/js/fox-animation.js',
        array(),
        '1.0.0',
        true // Charger dans le footer
    );

    // Passer l'URL du JSON au script
    wp_localize_script('fox-animation', 'foxAnimationData', array(
        'jsonUrl' => get_stylesheet_directory_uri() . '/assets/data/fox-paths.json'
    ));
}

// Ajouter le canvas dans le body (juste apres l'ouverture)
add_action('wp_body_open', 'inaricom_fox_canvas');
function inaricom_fox_canvas() {
    // Decommenter pour limiter a la homepage uniquement
    // if (!is_front_page()) return;
    ?>
    <div id="fox-canvas-container">
        <canvas id="fox-canvas"></canvas>
    </div>
    <?php
}
