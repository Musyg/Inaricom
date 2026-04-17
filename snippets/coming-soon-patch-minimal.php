<?php
/**
 * COMING SOON — PATCH MINIMAL (whitelist API + admin)
 *
 * A AJOUTER : tout en haut du snippet Coming Soon actuel, AVANT le
 *             add_action('template_redirect', ...) existant.
 *
 * Ce patch debloque :
 *   - L'API REST WordPress (wp-json/*)   ← requetes authentifiees
 *   - L'API WooCommerce (wc/v3/*)        ← avec cles ck/cs
 *   - Le backoffice admin + login        ← pour toi
 *
 * Ne debloque PAS :
 *   - Les visiteurs anonymes sur les pages publiques
 *   - Les crawlers Google, Bing, etc.
 *
 * Effet : toi + Claude Code acces plein API. Public voit Coming Soon.
 *
 * Version : 1.0 — 17 avril 2026
 */

// Empeche l'acces direct
defined( 'ABSPATH' ) || exit;

/**
 * Intercepter tres tot dans le cycle WP, avant template_redirect
 */
add_action( 'init', function() {

    // 1. WHITELIST API REST (la plus importante pour Claude Code)
    // REST_REQUEST est defini automatiquement par WP quand on hit /wp-json/*
    if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
        return;
    }

    // 2. Double securite : detecter aussi via URL
    $uri = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '';
    if ( strpos( $uri, '/wp-json/' ) !== false ) {
        // Retirer le hook Coming Soon avant qu'il s'execute
        remove_all_actions( 'template_redirect' );
        return;
    }

    // 3. WHITELIST ADMIN + LOGIN
    if ( is_admin() ) {
        return;
    }
    if ( strpos( $uri, 'wp-login.php' ) !== false ) {
        return;
    }
    if ( strpos( $uri, 'wp-admin' ) !== false ) {
        return;
    }

}, 1 ); // priorite 1 = tres tot
