<?php
/**
 * SchemaInjector — Injecte du JSON-LD selon le type de contenu.
 *
 * @package Inaricom\Core\Schema
 */

declare(strict_types=1);

namespace Inaricom\Core\Schema;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Types schema.org injectes selon le contexte :
 * - CPT inaricom_service  -> Service + LocalBusiness (provider)
 * - CPT inaricom_case_study -> Article
 * - CPT inaricom_resource -> CreativeWork + AboutPage selon cas
 * - Post standard           -> BlogPosting
 * - Homepage                -> Organization + WebSite (search potential action)
 *
 * Design : seul un schema par page (pas de doublon). Les autres plugins SEO
 * (Rank Math, Yoast) sont respectes si deja injectes.
 */
final class SchemaInjector
{
    public function register(): void
    {
        add_action('wp_head', [$this, 'inject_schema'], 30);  // apres les SEO plugins
    }

    public function inject_schema(): void
    {
        // Ne pas dupliquer si Rank Math / Yoast ont deja injecte
        if ($this->schema_already_present()) {
            return;
        }

        $schema = $this->build_schema_for_current_view();
        if ($schema === null) {
            return;
        }

        echo '<script type="application/ld+json">' . "\n";
        echo wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        echo "\n" . '</script>' . "\n";
    }

    /**
     * Check sommaire : si un <script type="application/ld+json"> est deja dans le buffer,
     * on ne duplique pas. Implementation minimale : on se base sur la presence
     * des plugins seo actifs.
     */
    private function schema_already_present(): bool
    {
        // Rank Math
        if (defined('RANK_MATH_VERSION')) {
            return true;
        }
        // Yoast SEO
        if (defined('WPSEO_VERSION')) {
            return true;
        }
        return false;
    }

    /**
     * Construit le schema approprié pour la vue courante.
     *
     * @return array<string, mixed>|null
     */
    private function build_schema_for_current_view(): ?array
    {
        if (is_front_page() || is_home()) {
            return $this->build_organization_schema();
        }

        if (is_singular('inaricom_service')) {
            return $this->build_service_schema(get_post());
        }

        if (is_singular('inaricom_case_study')) {
            return $this->build_article_schema(get_post(), 'Article');
        }

        if (is_singular('inaricom_resource')) {
            return $this->build_creative_work_schema(get_post());
        }

        if (is_singular('post')) {
            return $this->build_article_schema(get_post(), 'BlogPosting');
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function build_organization_schema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@graph'   => [
                [
                    '@type'    => 'Organization',
                    '@id'      => home_url('/#organization'),
                    'name'     => get_bloginfo('name') ?: 'Inaricom',
                    'url'      => home_url('/'),
                    'logo'     => [
                        '@type' => 'ImageObject',
                        'url'   => $this->get_logo_url(),
                    ],
                    'sameAs'   => [
                        // A completer quand les profiles sociaux sont finalises
                    ],
                ],
                [
                    '@type'           => 'WebSite',
                    '@id'             => home_url('/#website'),
                    'url'             => home_url('/'),
                    'name'            => get_bloginfo('name') ?: 'Inaricom',
                    'description'     => get_bloginfo('description'),
                    'publisher'       => ['@id' => home_url('/#organization')],
                    'potentialAction' => [
                        '@type'       => 'SearchAction',
                        'target'      => [
                            '@type'       => 'EntryPoint',
                            'urlTemplate' => home_url('/?s={search_term_string}'),
                        ],
                        'query-input' => 'required name=search_term_string',
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function build_service_schema(?\WP_Post $post): ?array
    {
        if (!$post) {
            return null;
        }
        return [
            '@context'    => 'https://schema.org',
            '@type'       => 'Service',
            'name'        => $post->post_title,
            'description' => wp_strip_all_tags(get_the_excerpt($post) ?: wp_trim_words($post->post_content, 30)),
            'url'         => get_permalink($post),
            'provider'    => [
                '@type' => 'Organization',
                'name'  => get_bloginfo('name') ?: 'Inaricom',
                'url'   => home_url('/'),
            ],
            'areaServed'  => [
                '@type' => 'Country',
                'name'  => 'Switzerland',
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function build_article_schema(?\WP_Post $post, string $type = 'Article'): ?array
    {
        if (!$post) {
            return null;
        }
        return [
            '@context'         => 'https://schema.org',
            '@type'            => $type,
            'headline'         => $post->post_title,
            'description'      => wp_strip_all_tags(get_the_excerpt($post) ?: wp_trim_words($post->post_content, 30)),
            'url'              => get_permalink($post),
            'datePublished'    => get_the_date('c', $post),
            'dateModified'     => get_the_modified_date('c', $post),
            'author'           => [
                '@type' => 'Person',
                'name'  => get_the_author_meta('display_name', $post->post_author),
            ],
            'publisher'        => [
                '@type' => 'Organization',
                'name'  => get_bloginfo('name') ?: 'Inaricom',
                'logo'  => [
                    '@type' => 'ImageObject',
                    'url'   => $this->get_logo_url(),
                ],
            ],
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id'   => get_permalink($post),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function build_creative_work_schema(?\WP_Post $post): ?array
    {
        if (!$post) {
            return null;
        }
        return [
            '@context'    => 'https://schema.org',
            '@type'       => 'CreativeWork',
            'name'        => $post->post_title,
            'description' => wp_strip_all_tags(get_the_excerpt($post) ?: wp_trim_words($post->post_content, 30)),
            'url'         => get_permalink($post),
            'author'      => [
                '@type' => 'Organization',
                'name'  => get_bloginfo('name') ?: 'Inaricom',
            ],
        ];
    }

    private function get_logo_url(): string
    {
        $custom_logo_id = (int) get_theme_mod('custom_logo');
        if ($custom_logo_id) {
            $logo = wp_get_attachment_image_src($custom_logo_id, 'full');
            if ($logo) {
                return $logo[0];
            }
        }
        return home_url('/wp-content/uploads/2026/01/logo-default.png');
    }
}
