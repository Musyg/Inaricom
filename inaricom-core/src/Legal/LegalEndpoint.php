<?php
/**
 * LegalEndpoint — endpoint REST custom pour servir le contenu HTML original
 * d'une page legale, stocke dans le meta `_legal_original_content`.
 *
 * Pourquoi : les pages legales (refund-policy, privacy, etc.) ont leur
 * post_content remplace par `[inari_island name="legal"]`. Le shortcode rend
 * un mount point React. L'island fetch /wp-json/inaricom/v1/legal/{slug}
 * pour recuperer le contenu HTML original (sauvegarde en meta avant le
 * remplacement) et le rendre dans le wrapper bleu glassmorphism.
 *
 * Endpoint : GET /wp-json/inaricom/v1/legal/{slug}
 * Reponse  : { id, slug, title, content (HTML), modified }
 *
 * @package Inaricom\Core\Legal
 */

declare(strict_types=1);

namespace Inaricom\Core\Legal;

if (!defined('ABSPATH')) {
    exit;
}

final class LegalEndpoint
{
    private const NAMESPACE = 'inaricom/v1';
    private const ROUTE = '/legal/(?P<slug>[a-z0-9_-]+)';
    private const META_KEY = '_legal_original_content';

    public function register(): void
    {
        add_action('rest_api_init', [$this, 'register_route']);
    }

    public function register_route(): void
    {
        register_rest_route(
            self::NAMESPACE,
            self::ROUTE,
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'handle_get'],
                'permission_callback' => '__return_true', // public read
                'args'                => [
                    'slug' => [
                        'required'          => true,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_title',
                    ],
                ],
            ]
        );
    }

    public function handle_get(\WP_REST_Request $request): \WP_REST_Response
    {
        $slug = (string) $request->get_param('slug');
        $page = get_page_by_path($slug);
        if (!$page) {
            return new \WP_REST_Response(
                ['code' => 'not_found', 'message' => 'Page introuvable'],
                404
            );
        }

        // Le contenu original est dans le meta. Fallback sur post_content si absent.
        $original = get_post_meta($page->ID, self::META_KEY, true);
        if (!is_string($original) || $original === '') {
            $original = (string) $page->post_content;
        }

        // Apply WP filters (do_shortcode, wpautop, etc.) pour rendre du HTML propre
        $rendered = apply_filters('the_content', $original);
        // Nettoyage : retire un eventuel shortcode [inari_island] residuel
        $rendered = (string) preg_replace('/\[inari_island[^\]]*\]/', '', $rendered);

        return new \WP_REST_Response(
            [
                'id'       => $page->ID,
                'slug'     => $page->post_name,
                'title'    => get_the_title($page),
                'content'  => $rendered,
                'modified' => mysql2date('c', $page->post_modified),
            ],
            200
        );
    }
}
