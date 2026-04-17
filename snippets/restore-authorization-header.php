<?php
/**
 * Inaricom — Restaure le header Authorization strippe par le serveur
 *
 * Beaucoup d'hebergeurs mutualises (SwissCenter, Apanel, OVH, Infomaniak
 * mutualise, etc.) retirent le header Authorization de la requete HTTP
 * avant qu'il arrive a PHP, par configuration Apache/ModSecurity par
 * defaut. Resultat : WooCommerce REST API ne voit jamais les cles ck/cs
 * envoyees en Basic Auth, WordPress prend le relais et tente un login
 * user/password classique qui echoue avec "invalid_username".
 *
 * Ce snippet reinjecte le header depuis REDIRECT_HTTP_AUTHORIZATION (CGI
 * classique) ou apache_request_headers(), puis decode le Basic Auth en
 * PHP_AUTH_USER/PW pour que WooCommerce et WordPress l'utilisent.
 *
 * Compatible : cles ck/cs WooCommerce + Application Passwords WordPress.
 * Zero impact sur les requetes qui n'ont pas de header Authorization.
 *
 * Version : 2026-04-17 (Phase 0 refonte Inaricom - debloquage MCP)
 */
add_action('init', 'inaricom_restore_authorization_header', 1);

function inaricom_restore_authorization_header() {
    // Cas 1 : header present mais sous nom CGI (REDIRECT_HTTP_AUTHORIZATION)
    if (empty($_SERVER['HTTP_AUTHORIZATION'])) {
        if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } elseif (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            if (!empty($headers['Authorization'])) {
                $_SERVER['HTTP_AUTHORIZATION'] = $headers['Authorization'];
            }
        }
    }

    // Cas 2 : decoder Basic Auth en PHP_AUTH_USER/PW si pas deja fait
    if (!empty($_SERVER['HTTP_AUTHORIZATION']) && empty($_SERVER['PHP_AUTH_USER'])) {
        if (preg_match('/Basic\s+(.+)/i', $_SERVER['HTTP_AUTHORIZATION'], $m)) {
            $decoded = base64_decode($m[1]);
            if ($decoded && strpos($decoded, ':') !== false) {
                list($user, $pass) = explode(':', $decoded, 2);
                $_SERVER['PHP_AUTH_USER'] = $user;
                $_SERVER['PHP_AUTH_PW'] = $pass;
            }
        }
    }
}
