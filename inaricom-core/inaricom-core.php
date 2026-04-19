<?php
/**
 * Plugin Name:       Inaricom Core
 * Plugin URI:        https://inaricom.com
 * Description:       Custom Post Types, taxonomies, theme-switcher automatique et schema JSON-LD pour Inaricom. Ne duplique PAS les headers/hardening de inaricom-security (must-use).
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.3
 * Author:            Inaricom
 * Author URI:        https://inaricom.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       inaricom-core
 * Network:           true
 *
 * @package Inaricom\Core
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

// ---------------------------------------------------------------------------
// Constantes plugin
// ---------------------------------------------------------------------------
define('INARICOM_CORE_VERSION', '0.1.0');
define('INARICOM_CORE_FILE', __FILE__);
define('INARICOM_CORE_PATH', plugin_dir_path(__FILE__));
define('INARICOM_CORE_URL', plugin_dir_url(__FILE__));
define('INARICOM_CORE_REQUIRES_PHP', '8.3');
define('INARICOM_CORE_REQUIRES_WP', '6.5');

// ---------------------------------------------------------------------------
// Check environnement minimal avant de charger quoi que ce soit
// ---------------------------------------------------------------------------
if (version_compare(PHP_VERSION, INARICOM_CORE_REQUIRES_PHP, '<')) {
    add_action('admin_notices', function () {
        echo '<div class="notice notice-error"><p><strong>Inaricom Core</strong> requires PHP ' .
            esc_html(INARICOM_CORE_REQUIRES_PHP) . ' or higher. Current: ' . esc_html(PHP_VERSION) . '</p></div>';
    });
    return;
}

// ---------------------------------------------------------------------------
// Autoload PSR-4 manuel (pas de Composer en prod pour un plugin mutualise)
// Si composer install a tourne, on privilegie vendor/autoload.php
// ---------------------------------------------------------------------------
if (file_exists(INARICOM_CORE_PATH . 'vendor/autoload.php')) {
    require_once INARICOM_CORE_PATH . 'vendor/autoload.php';
} else {
    spl_autoload_register(function (string $class): void {
        $prefix = 'Inaricom\\Core\\';
        $base_dir = INARICOM_CORE_PATH . 'src/';

        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }

        $relative_class = substr($class, $len);
        $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

        if (file_exists($file)) {
            require $file;
        }
    });
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
add_action('plugins_loaded', function () {
    if (class_exists('Inaricom\\Core\\Plugin')) {
        \Inaricom\Core\Plugin::instance()->boot();
    }
}, 5);

// ---------------------------------------------------------------------------
// Activation / Deactivation hooks
// ---------------------------------------------------------------------------
register_activation_hook(__FILE__, function (): void {
    if (class_exists('Inaricom\\Core\\Plugin')) {
        \Inaricom\Core\Plugin::instance()->activate();
    }
});

register_deactivation_hook(__FILE__, function (): void {
    if (class_exists('Inaricom\\Core\\Plugin')) {
        \Inaricom\Core\Plugin::instance()->deactivate();
    }
});
