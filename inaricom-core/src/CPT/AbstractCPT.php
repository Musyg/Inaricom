<?php
/**
 * Classe abstraite pour tous les CPT Inaricom.
 *
 * @package Inaricom\Core\CPT
 */

declare(strict_types=1);

namespace Inaricom\Core\CPT;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Chaque CPT concret héritent de celle-ci et définissent :
 * - $slug : slug technique (ex: 'inaricom_resource')
 * - $labels() : les labels WordPress
 * - $args_overrides() : overrides optionnels de register_post_type
 */
abstract class AbstractCPT
{
    /** Slug technique du CPT (underscore, <20 chars). */
    protected string $slug = '';

    /** Slug d'URL (kebab-case). */
    protected string $rewrite_slug = '';

    /** Icône dashicon. */
    protected string $menu_icon = 'dashicons-admin-post';

    /** Supporte quoi ? */
    protected array $supports = ['title', 'editor', 'thumbnail', 'excerpt', 'revisions', 'custom-fields'];

    /** Taxonomies associées. */
    protected array $taxonomies = ['inaricom_pillar'];

    /** Menu position (entre 20 et 30 pour etre groupe avec Pages). */
    protected int $menu_position = 25;

    /**
     * Hook WordPress : register_post_type.
     */
    public function register(): void
    {
        add_action('init', [$this, 'register_post_type'], 10);
    }

    /**
     * Appelle register_post_type() avec des defaults sains + les overrides du CPT concret.
     */
    public function register_post_type(): void
    {
        if (empty($this->slug)) {
            return;
        }

        $args = [
            'labels'              => $this->labels(),
            'public'              => true,
            'publicly_queryable'  => true,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'show_in_rest'        => true,
            'show_in_nav_menus'   => true,
            'show_in_admin_bar'   => true,
            'query_var'           => true,
            'rewrite'             => [
                'slug'       => $this->rewrite_slug ?: $this->slug,
                'with_front' => false,
                'feeds'      => true,
                'pages'      => true,
            ],
            'capability_type'     => 'post',
            'has_archive'         => $this->rewrite_slug ?: $this->slug,
            'hierarchical'        => false,
            'menu_position'       => $this->menu_position,
            'menu_icon'           => $this->menu_icon,
            'supports'            => $this->supports,
            'taxonomies'          => $this->taxonomies,
            'can_export'          => true,
            'delete_with_user'    => false,
        ];

        register_post_type($this->slug, array_merge($args, $this->args_overrides()));
    }

    /**
     * Labels WordPress. Les CPT concrets doivent surcharger.
     *
     * @return array<string, string>
     */
    abstract protected function labels(): array;

    /**
     * Overrides d'args register_post_type. Vide par défaut.
     *
     * @return array<string, mixed>
     */
    protected function args_overrides(): array
    {
        return [];
    }

    /**
     * Getter slug (utile pour le theme mapper).
     */
    public function get_slug(): string
    {
        return $this->slug;
    }
}
