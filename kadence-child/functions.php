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

// ============================================================
// A11Y : footer widget titles h4 -> h3 (heading-order Lighthouse)
// Les titres "Informations" et "Legal" du footer sont dans le HTML brut de
// widgets Gutenberg blocks (block-8, block-10) en tant que <h4 class="footer-title">.
// Cela casse l'ordre semantique (H1 > H2 > H4) et fail l'audit heading-order.
// Fix chirurgical : str_replace tres specifique sur "footer-title" (classe unique).
// ============================================================
add_filter('widget_block_content', 'inaricom_footer_title_h3', 10, 1);
function inaricom_footer_title_h3($content) {
    if (strpos($content, 'footer-title') === false) {
        return $content;
    }
    // Cible <h4 class="footer-title">...</h4> -> <h3>...</h3>, preserve attributs
    return preg_replace(
        '#<h4(\s+class="footer-title"[^>]*)>(.*?)</h4>#s',
        '<h3$1>$2</h3>',
        $content
    );
}
