<?php
/**
 * AdminMenu — Regroupe tous les CPT Inaricom sous un menu parent "Inaricom".
 *
 * @package Inaricom\Core\Admin
 */

declare(strict_types=1);

namespace Inaricom\Core\Admin;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Crée un menu racine "Inaricom" dans wp-admin et réorganise les CPT dessous.
 * Utile pour ne pas polluer le menu principal avec 3 items séparés.
 */
final class AdminMenu
{
    public const MENU_SLUG = 'inaricom-dashboard';

    public function register(): void
    {
        add_action('admin_menu', [$this, 'register_menu'], 9);  // avant les CPT (10)
    }

    public function register_menu(): void
    {
        add_menu_page(
            __('Inaricom', 'inaricom-core'),
            __('Inaricom', 'inaricom-core'),
            'edit_posts',
            self::MENU_SLUG,
            [$this, 'render_dashboard'],
            'dashicons-shield',
            23  // position juste avant Pages (20) et Posts (5)
        );

        // Sous-menu "Tableau de bord" (réécrit le lien par défaut qui pointe sur le slug principal)
        add_submenu_page(
            self::MENU_SLUG,
            __('Tableau de bord', 'inaricom-core'),
            __('Tableau de bord', 'inaricom-core'),
            'edit_posts',
            self::MENU_SLUG,
            [$this, 'render_dashboard']
        );
    }

    /**
     * Page dashboard minimaliste — stats et raccourcis.
     */
    public function render_dashboard(): void
    {
        $stats = [
            'resources'    => wp_count_posts('inaricom_resource'),
            'case_studies' => wp_count_posts('inaricom_case_study'),
            'services'     => wp_count_posts('inaricom_service'),
        ];

        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Inaricom — Tableau de bord', 'inaricom-core'); ?></h1>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 24px;">
                <?php $this->render_stat_card(
                    __('Ressources', 'inaricom-core'),
                    (int) ($stats['resources']->publish ?? 0),
                    'edit.php?post_type=inaricom_resource',
                    '#10B981'
                ); ?>

                <?php $this->render_stat_card(
                    __('Études de cas', 'inaricom-core'),
                    (int) ($stats['case_studies']->publish ?? 0),
                    'edit.php?post_type=inaricom_case_study',
                    '#E31E24'
                ); ?>

                <?php $this->render_stat_card(
                    __('Services', 'inaricom-core'),
                    (int) ($stats['services']->publish ?? 0),
                    'edit.php?post_type=inaricom_service',
                    '#E31E24'
                ); ?>
            </div>

            <div style="margin-top: 32px; padding: 16px; background: #fff; border: 1px solid #e5e5e5; border-radius: 6px;">
                <h2><?php esc_html_e('Raccourcis', 'inaricom-core'); ?></h2>
                <ul>
                    <li><a href="<?php echo esc_url(admin_url('edit-tags.php?taxonomy=inaricom_pillar')); ?>">
                        <?php esc_html_e('Gérer les piliers', 'inaricom-core'); ?>
                    </a></li>
                    <li><a href="<?php echo esc_url(admin_url('plugins.php')); ?>">
                        <?php esc_html_e('Plugins installés', 'inaricom-core'); ?>
                    </a></li>
                </ul>
            </div>

            <div style="margin-top: 24px; color: #666; font-size: 13px;">
                <p><?php
                    printf(
                        esc_html__('Inaricom Core v%s — %d piliers actifs.', 'inaricom-core'),
                        esc_html(INARICOM_CORE_VERSION),
                        count(\Inaricom\Core\Taxonomy\PillarTaxonomy::PILLARS)
                    );
                ?></p>
            </div>
        </div>
        <?php
    }

    private function render_stat_card(string $label, int $count, string $link, string $color): void
    {
        $url = esc_url(admin_url($link));
        ?>
        <a href="<?php echo $url; ?>" style="text-decoration: none; color: inherit;">
            <div style="padding: 20px; background: #fff; border: 1px solid #e5e5e5; border-left: 4px solid <?php echo esc_attr($color); ?>; border-radius: 6px; transition: box-shadow 0.2s;"
                 onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'"
                 onmouseout="this.style.boxShadow='none'">
                <div style="font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;"><?php echo esc_html($label); ?></div>
                <div style="font-size: 28px; font-weight: 700; margin-top: 4px; color: #1d2327;"><?php echo esc_html((string) $count); ?></div>
            </div>
        </a>
        <?php
    }
}
