<?php
/**
 * CPT Case Study — Études de cas pentest, red team, missions IA.
 *
 * @package Inaricom\Core\CPT
 */

declare(strict_types=1);

namespace Inaricom\Core\CPT;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Retours d'expérience sur missions réelles (pentest, red team, audit, déploiement IA).
 * Slug URL: /etudes-de-cas/
 */
final class CaseStudyCPT extends AbstractCPT
{
    protected string $slug = 'inaricom_case_study';

    protected string $rewrite_slug = 'etudes-de-cas';

    protected string $menu_icon = 'dashicons-clipboard';

    protected int $menu_position = 26;

    protected function labels(): array
    {
        return [
            'name'                  => _x('Études de cas', 'post type general name', 'inaricom-core'),
            'singular_name'         => _x('Étude de cas', 'post type singular name', 'inaricom-core'),
            'menu_name'             => _x('Études de cas', 'admin menu', 'inaricom-core'),
            'name_admin_bar'        => _x('Étude de cas', 'add new on admin bar', 'inaricom-core'),
            'add_new'               => _x('Ajouter', 'case_study', 'inaricom-core'),
            'add_new_item'          => __('Ajouter une étude de cas', 'inaricom-core'),
            'new_item'              => __('Nouvelle étude de cas', 'inaricom-core'),
            'edit_item'             => __('Modifier l\'étude de cas', 'inaricom-core'),
            'view_item'             => __('Voir l\'étude de cas', 'inaricom-core'),
            'all_items'             => __('Toutes les études de cas', 'inaricom-core'),
            'search_items'          => __('Rechercher des études de cas', 'inaricom-core'),
            'not_found'             => __('Aucune étude de cas trouvée.', 'inaricom-core'),
            'not_found_in_trash'    => __('Aucune étude de cas dans la corbeille.', 'inaricom-core'),
            'featured_image'        => __('Image de couverture', 'inaricom-core'),
            'archives'              => __('Archive des études de cas', 'inaricom-core'),
        ];
    }
}
