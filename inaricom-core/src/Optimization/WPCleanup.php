<?php
/**
 * Cleanup WordPress par defaut : emojis, RSS pingbacks, oembed inutile, etc.
 *
 * Pourquoi : les emojis WP creent un Worker via blob: URL bloque par notre CSP.
 * Et de toute facon Inaricom n'a pas besoin de wp-emoji (les emojis modernes
 * sont rendus par les fonts systeme + Geist/Instrument Serif).
 *
 * Bonus : -3 a -8 KB par page, +1 requete reseau evitee.
 *
 * @package Inaricom\Core\Optimization
 */

declare(strict_types=1);

namespace Inaricom\Core\Optimization;

if (!defined('ABSPATH')) {
    exit;
}

final class WPCleanup
{
    public function register(): void
    {
        // === Emojis (CSP-violating worker blob:) ===
        add_action('init', [$this, 'disable_emojis']);

        // === oEmbed discovery sur le frontend (inutile pour nous) ===
        add_action('init', [$this, 'disable_embeds']);

        // === RSD link, wlwmanifest, generator (legacy XML-RPC / Live Writer) ===
        add_action('init', [$this, 'remove_legacy_head_links']);
    }

    public function disable_emojis(): void
    {
        remove_action('wp_head', 'print_emoji_detection_script', 7);
        remove_action('admin_print_scripts', 'print_emoji_detection_script');
        remove_action('wp_print_styles', 'print_emoji_styles');
        remove_action('admin_print_styles', 'print_emoji_styles');
        remove_filter('the_content_feed', 'wp_staticize_emoji');
        remove_filter('comment_text_rss', 'wp_staticize_emoji');
        remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
        // Empeche le DNS prefetch vers s.w.org
        add_filter('emoji_svg_url', '__return_false');
    }

    public function disable_embeds(): void
    {
        // Coupe le auto-embed de URLs WordPress externes (twitter, youtube auto, etc.)
        remove_action('wp_head', 'wp_oembed_add_discovery_links');
        remove_action('wp_head', 'wp_oembed_add_host_js');
    }

    public function remove_legacy_head_links(): void
    {
        remove_action('wp_head', 'rsd_link');
        remove_action('wp_head', 'wlwmanifest_link');
        remove_action('wp_head', 'wp_generator');
    }
}
