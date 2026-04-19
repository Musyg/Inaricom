<?php
/**
 * CPT Resource — Lead magnets, checklists, guides téléchargeables.
 *
 * @package Inaricom\Core\CPT
 */

declare(strict_types=1);

namespace Inaricom\Core\CPT;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Contenu gratuit à télécharger (PDF, checklist) servant au lead gen.
 * Slug URL: /ressources/
 */
final class ResourceCPT extends AbstractCPT
{
    protected string $slug = 'inaricom_resource';

    protected string $rewrite_slug = 'ressources';

    protected string $menu_icon = 'dashicons-download';

    protected int $menu_position = 25;

    protected function labels(): array
    {
        return [
            'name'                  => _x('Ressources', 'post type general name', 'inaricom-core'),
            'singular_name'         => _x('Ressource', 'post type singular name', 'inaricom-core'),
            'menu_name'             => _x('Ressources', 'admin menu', 'inaricom-core'),
            'name_admin_bar'        => _x('Ressource', 'add new on admin bar', 'inaricom-core'),
            'add_new'               => _x('Ajouter', 'resource', 'inaricom-core'),
            'add_new_item'          => __('Ajouter une ressource', 'inaricom-core'),
            'new_item'              => __('Nouvelle ressource', 'inaricom-core'),
            'edit_item'             => __('Modifier la ressource', 'inaricom-core'),
            'view_item'             => __('Voir la ressource', 'inaricom-core'),
            'all_items'             => __('Toutes les ressources', 'inaricom-core'),
            'search_items'          => __('Rechercher des ressources', 'inaricom-core'),
            'not_found'             => __('Aucune ressource trouvée.', 'inaricom-core'),
            'not_found_in_trash'    => __('Aucune ressource dans la corbeille.', 'inaricom-core'),
            'featured_image'        => __('Image de couverture', 'inaricom-core'),
            'archives'              => __('Archive des ressources', 'inaricom-core'),
        ];
    }
}
