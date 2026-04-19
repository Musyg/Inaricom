<?php
/**
 * Taxonomy Pillar — 4 piliers sémantiques avec mapping couleurs.
 *
 * @package Inaricom\Core\Taxonomy
 */

declare(strict_types=1);

namespace Inaricom\Core\Taxonomy;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Chaque contenu (CPT ou post) est classé dans 1 pilier :
 * - securite       -> thème rouge (défaut)
 * - ia             -> thème or
 * - blog           -> thème vert
 * - institutionnel -> thème bleu
 *
 * Le slug du terme détermine la couleur CSS appliquée via data-theme.
 */
final class PillarTaxonomy
{
    public const TAXONOMY_SLUG = 'inaricom_pillar';

    /**
     * Mapping pilier -> thème CSS.
     *
     * @var array<string, array{theme: string, color: string, label: string}>
     */
    public const PILLARS = [
        'securite'       => [
            'theme' => 'rouge',
            'color' => '#E31E24',
            'label' => 'Sécurité',
        ],
        'ia'             => [
            'theme' => 'or',
            'color' => '#FFD700',
            'label' => 'Intelligence Artificielle',
        ],
        'blog'           => [
            'theme' => 'vert',
            'color' => '#10B981',
            'label' => 'Blog & Ressources',
        ],
        'institutionnel' => [
            'theme' => 'bleu',
            'color' => '#00D4FF',
            'label' => 'Institutionnel',
        ],
    ];

    /**
     * Hook WordPress.
     */
    public function register(): void
    {
        add_action('init', [$this, 'register_taxonomy'], 11);
    }

    /**
     * Enregistre la taxonomy sur les 3 CPT Inaricom + post standard.
     */
    public function register_taxonomy(): void
    {
        register_taxonomy(
            self::TAXONOMY_SLUG,
            ['post', 'inaricom_resource', 'inaricom_case_study', 'inaricom_service'],
            [
                'labels' => [
                    'name'              => _x('Piliers', 'taxonomy general name', 'inaricom-core'),
                    'singular_name'     => _x('Pilier', 'taxonomy singular name', 'inaricom-core'),
                    'search_items'      => __('Rechercher des piliers', 'inaricom-core'),
                    'all_items'         => __('Tous les piliers', 'inaricom-core'),
                    'parent_item'       => null,
                    'parent_item_colon' => null,
                    'edit_item'         => __('Modifier le pilier', 'inaricom-core'),
                    'update_item'       => __('Mettre à jour le pilier', 'inaricom-core'),
                    'add_new_item'      => __('Ajouter un pilier', 'inaricom-core'),
                    'new_item_name'     => __('Nom du nouveau pilier', 'inaricom-core'),
                    'menu_name'         => __('Piliers', 'inaricom-core'),
                ],
                'hierarchical'      => true,  // style categorie, pas tag
                'show_ui'           => true,
                'show_admin_column' => true,
                'show_in_rest'      => true,
                'show_in_nav_menus' => true,
                'query_var'         => true,
                'public'            => true,
                'rewrite'           => ['slug' => 'pilier', 'with_front' => false],
                'capabilities'      => [
                    // Seuls les admins peuvent creer/renommer les piliers
                    'manage_terms' => 'manage_options',
                    'edit_terms'   => 'manage_options',
                    'delete_terms' => 'manage_options',
                    'assign_terms' => 'edit_posts',
                ],
            ]
        );
    }

    /**
     * Crée les 4 termes par défaut s'ils n'existent pas.
     * Appelé uniquement à l'activation du plugin.
     */
    public function seed_default_terms(): void
    {
        // La taxonomy doit etre enregistree avant de seed
        if (!taxonomy_exists(self::TAXONOMY_SLUG)) {
            $this->register_taxonomy();
        }

        foreach (self::PILLARS as $slug => $config) {
            if (term_exists($slug, self::TAXONOMY_SLUG)) {
                continue;
            }
            wp_insert_term(
                $config['label'],
                self::TAXONOMY_SLUG,
                [
                    'slug'        => $slug,
                    'description' => sprintf(
                        __('Pilier %s — thème CSS : %s', 'inaricom-core'),
                        $config['label'],
                        $config['theme']
                    ),
                ]
            );
        }
    }

    /**
     * Retourne le thème CSS associé à un slug de pilier.
     * Fallback : rouge (sécurité).
     */
    public static function get_theme_for_pillar(string $pillar_slug): string
    {
        return self::PILLARS[$pillar_slug]['theme'] ?? 'rouge';
    }

    /**
     * Retourne la couleur hex principale d'un pilier.
     */
    public static function get_color_for_pillar(string $pillar_slug): string
    {
        return self::PILLARS[$pillar_slug]['color'] ?? '#E31E24';
    }
}
