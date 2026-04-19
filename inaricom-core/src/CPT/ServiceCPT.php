<?php
/**
 * CPT Service — Fiches services commerciaux (audit, pentest, red team, IA).
 *
 * @package Inaricom\Core\CPT
 */

declare(strict_types=1);

namespace Inaricom\Core\CPT;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Fiches commerciales des services proposés par Inaricom.
 * Slug URL: /services/
 * Utilisé pour le schema.org Service + LocalBusiness.
 */
final class ServiceCPT extends AbstractCPT
{
    protected string $slug = 'inaricom_service';

    protected string $rewrite_slug = 'services';

    protected string $menu_icon = 'dashicons-shield-alt';

    protected int $menu_position = 24;

    protected function labels(): array
    {
        return [
            'name'                  => _x('Services', 'post type general name', 'inaricom-core'),
            'singular_name'         => _x('Service', 'post type singular name', 'inaricom-core'),
            'menu_name'             => _x('Services', 'admin menu', 'inaricom-core'),
            'name_admin_bar'        => _x('Service', 'add new on admin bar', 'inaricom-core'),
            'add_new'               => _x('Ajouter', 'service', 'inaricom-core'),
            'add_new_item'          => __('Ajouter un service', 'inaricom-core'),
            'new_item'              => __('Nouveau service', 'inaricom-core'),
            'edit_item'             => __('Modifier le service', 'inaricom-core'),
            'view_item'             => __('Voir le service', 'inaricom-core'),
            'all_items'             => __('Tous les services', 'inaricom-core'),
            'search_items'          => __('Rechercher des services', 'inaricom-core'),
            'not_found'             => __('Aucun service trouvé.', 'inaricom-core'),
            'not_found_in_trash'    => __('Aucun service dans la corbeille.', 'inaricom-core'),
            'featured_image'        => __('Image de couverture', 'inaricom-core'),
            'archives'              => __('Archive des services', 'inaricom-core'),
        ];
    }
}
