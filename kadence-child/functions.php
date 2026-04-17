<?php
/**
 * Kadence Child Theme - Inaricom
 * 
 * @package Kadence_Child
 */

// Charger les styles du thème parent
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
// FOX ANIMATION - Background Parallax
// ============================================================

// Charger le script de l'animation fox (uniquement sur la homepage)
add_action('wp_enqueue_scripts', 'inaricom_fox_animation_scripts');
function inaricom_fox_animation_scripts() {
    // Charger uniquement sur la page d'accueil (décommenter si besoin)
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

// Ajouter le canvas dans le body (juste après l'ouverture)
add_action('wp_body_open', 'inaricom_fox_canvas');
function inaricom_fox_canvas() {
    // Décommenter pour limiter à la homepage uniquement
    // if (!is_front_page()) return;
    ?>
    <div id="fox-canvas-container">
        <canvas id="fox-canvas"></canvas>
    </div>
    <?php
}
