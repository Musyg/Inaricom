<?php
/**
 * Plugin Name: Inaricom Security Hardening
 * Description: REST API lockdown, security headers, version hiding, login protection
 * Version: 1.2
 * Author: Inaricom
 *
 * INSTALLATION: Upload to /wp-content/mu-plugins/inaricom-security.php
 */

if (!defined('ABSPATH')) exit;

// =====================================================================
// HELPER: Get real visitor IP (works behind Cloudflare/proxy)
// =====================================================================
function inaricom_get_real_ip() {
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return sanitize_text_field($_SERVER['HTTP_CF_CONNECTING_IP']);
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return sanitize_text_field(trim($ips[0]));
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// =====================================================================
// HL-001 FIX: Block REST API user enumeration
// =====================================================================
add_filter('rest_endpoints', function ($endpoints) {
    if (!is_user_logged_in()) {
        unset($endpoints['/wp/v2/users']);
        unset($endpoints['/wp/v2/users/(?P<id>[\d]+)']);
    }
    return $endpoints;
});

add_action('template_redirect', function () {
    if (is_author() && !is_user_logged_in()) {
        wp_redirect(home_url(), 301);
        exit;
    }
});

// =====================================================================
// HL-002 FIX: Login brute force protection
// =====================================================================
add_filter('authenticate', function ($user, $username) {
    if (empty($username)) return $user;
    $ip = inaricom_get_real_ip();
    $transient = 'inaricom_login_' . md5($ip);
    $attempts = (int) get_transient($transient);
    if ($attempts >= 5) {
        return new WP_Error('too_many_attempts',
            'Trop de tentatives de connexion. Reessayez dans 15 minutes.');
    }
    return $user;
}, 30, 2);

add_action('wp_login_failed', function () {
    $ip = inaricom_get_real_ip();
    $transient = 'inaricom_login_' . md5($ip);
    $attempts = (int) get_transient($transient);
    set_transient($transient, $attempts + 1, 15 * MINUTE_IN_SECONDS);
});

add_action('wp_login', function () {
    $ip = inaricom_get_real_ip();
    delete_transient('inaricom_login_' . md5($ip));
});

// =====================================================================
// HL-003 to HL-010 FIX: Security headers with ENFORCING CSP
// =====================================================================
add_action('send_headers', function () {
    if (headers_sent() || is_admin()) return;
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    $csp = "default-src 'self'; ";
    $csp .= "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googletagmanager.com *.google-analytics.com connect.facebook.net js.stripe.com *.cloudflare.com; ";
    $csp .= "style-src 'self' 'unsafe-inline' fonts.googleapis.com; ";
    $csp .= "img-src 'self' data: blob: *.gravatar.com *.wp.com *.facebook.com *.google-analytics.com *.googletagmanager.com *.stripe.com; ";
    $csp .= "font-src 'self' fonts.gstatic.com data:; ";
    $csp .= "connect-src 'self' *.google-analytics.com *.facebook.com connect.facebook.net *.stripe.com *.cloudflare.com raw.githubusercontent.com; ";
    $csp .= "frame-src 'self' js.stripe.com *.facebook.com challenges.cloudflare.com; ";
    $csp .= "frame-ancestors 'none'; ";
    $csp .= "upgrade-insecure-requests";
    header('Content-Security-Policy: ' . $csp);
    header('X-Frame-Options: DENY');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
});

// =====================================================================
// HL-007 FIX: Hide WordPress and WooCommerce versions
// =====================================================================
remove_action('wp_head', 'wp_generator');
add_filter('the_generator', '__return_empty_string');

add_action('after_setup_theme', function () {
    remove_action('wp_head', 'wc_generator_tag');
});

add_filter('style_loader_src', function ($src) {
    return $src ? esc_url(remove_query_arg('ver', $src)) : $src;
});
add_filter('script_loader_src', function ($src) {
    return $src ? esc_url(remove_query_arg('ver', $src)) : $src;
});

// =====================================================================
// HL-008 FIX: Block plugin/theme readme files (backup for .htaccess)
// =====================================================================
add_action('init', function () {
    $request = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($request, '/wp-content/') === false) return;
    if (preg_match('/\/(readme|changelog|license)\.(txt|md|html)/i', $request)) {
        if (!is_user_logged_in()) {
            status_header(404);
            nocache_headers();
            exit;
        }
    }
});

// =====================================================================
// HL-011 FIX: Serve security.txt via PHP
// =====================================================================
add_action('init', function () {
    if ($_SERVER['REQUEST_URI'] === '/.well-known/security.txt') {
        header('Content-Type: text/plain; charset=utf-8');
        echo "Contact: mailto:security@inaricom.com\n";
        echo "Expires: 2027-03-30T23:59:00.000Z\n";
        echo "Preferred-Languages: fr, en\n";
        echo "Canonical: https://inaricom.com/.well-known/security.txt\n";
        exit;
    }
});
