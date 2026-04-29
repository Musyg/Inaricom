<?php
/**
 * Plugin Name: Inaricom REST Lightweight
 * Description: Désactive WooCommerce + autres plugins lourds quand la requête HTTP cible /wp-json/inaricom/v1/* — workaround pour le cap PHP memory_limit 128MB de SwissCenter (l'autoload jetpack-connection embarqué dans WC 10.7+ exhauste la mémoire).
 * Version: 1.0
 * Author: Gilles Musy
 *
 * @package Inaricom
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Detecte si la requete HTTP courante cible un endpoint REST custom Inaricom.
 *
 * On filtre very early via le filtre `option_active_plugins` (precharge avant
 * plugins_loaded) pour exclure WooCommerce + plugins lourds.
 */
add_filter('option_active_plugins', function ($active_plugins) {
    if (!is_array($active_plugins)) {
        return $active_plugins;
    }

    $request_uri = (string) ($_SERVER['REQUEST_URI'] ?? '');

    // Match les endpoints REST custom Inaricom.
    // Couvre /wp-json/inaricom/v1/contact et autres futurs.
    if (strpos($request_uri, '/wp-json/inaricom/v1/') === false) {
        return $active_plugins;
    }

    // Plugins a desactiver pour ces requetes (ils ne sont pas necessaires
    // au handler email + ils consomment trop de memoire avec leur autoload).
    $skip = [
        'woocommerce/woocommerce.php',
        'woo-advanced-shipment-tracking/woo-advanced-shipment-tracking.php',
        'inaricom-digikey/inaricom-digikey.php',
        'wpforms-lite/wpforms.php',  // pas besoin de WPForms ici
        'kadence-starter-templates/kadence-starter-templates.php',
        'rest-api-oauth1/oauth-server.php',
        'limit-login-attempts-reloaded/limit-login-attempts-reloaded.php',
    ];

    return array_values(array_diff($active_plugins, $skip));
}, 1);

/**
 * Meme filtre pour multisite (active_sitewide_plugins est un array assoc plugin => timestamp).
 */
add_filter('site_option_active_sitewide_plugins', function ($active_plugins) {
    if (!is_array($active_plugins)) {
        return $active_plugins;
    }

    $request_uri = (string) ($_SERVER['REQUEST_URI'] ?? '');
    if (strpos($request_uri, '/wp-json/inaricom/v1/') === false) {
        return $active_plugins;
    }

    $skip = [
        'woocommerce/woocommerce.php',
        'woo-advanced-shipment-tracking/woo-advanced-shipment-tracking.php',
        'inaricom-digikey/inaricom-digikey.php',
        'wpforms-lite/wpforms.php',
        'kadence-starter-templates/kadence-starter-templates.php',
        'rest-api-oauth1/oauth-server.php',
        'limit-login-attempts-reloaded/limit-login-attempts-reloaded.php',
    ];

    foreach ($skip as $plugin_file) {
        unset($active_plugins[$plugin_file]);
    }

    return $active_plugins;
}, 1);
