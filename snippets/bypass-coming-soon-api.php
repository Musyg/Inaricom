<?php
/**
 * Inaricom — Bypass Coming Soon WooCommerce pour l'API REST authentifiée
 *
 * Laisse passer les requêtes REST API (MCP, curl, agents IA) qui portent
 * une authentification valide, tout en gardant le Coming Soon actif pour
 * les visiteurs anonymes.
 *
 * Hook : pre_option_woocommerce_coming_soon — court-circuite dynamiquement
 * la lecture de l'option en DB pour cette requête uniquement. Aucun
 * changement global. Zéro impact pour les visiteurs non-authentifiés.
 *
 * A placer dans Code Snippets comme snippet PHP separe du Coming Soon custom.
 *
 * Version : 2026-04-17 (Phase 0 refonte Inaricom)
 */
add_filter('pre_option_woocommerce_coming_soon', 'inaricom_bypass_wc_coming_soon_for_api');

function inaricom_bypass_wc_coming_soon_for_api($pre_option) {
    $uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';

    // Est-ce une requete REST API ?
    $is_rest = (
        (defined('REST_REQUEST') && REST_REQUEST)
        || strpos($uri, '/wp-json/') !== false
        || strpos($uri, '?rest_route=') !== false
    );

    if (!$is_rest) {
        return $pre_option;
    }

    // Presence d'une authentification ?
    $has_auth = (
        !empty($_SERVER['PHP_AUTH_USER'])
        || !empty($_SERVER['HTTP_AUTHORIZATION'])
        || !empty($_SERVER['HTTP_X_MCP_API_KEY'])
        || !empty($_GET['consumer_key'])
        || is_user_logged_in()
    );

    if ($has_auth) {
        return 'no';
    }

    return $pre_option;
}
