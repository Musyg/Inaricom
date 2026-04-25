<?php
/**
 * Bootstrap principal.
 *
 * @package Inaricom\Core
 */

declare(strict_types=1);

namespace Inaricom\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe singleton qui orchestre l'initialisation du plugin.
 */
final class Plugin
{
    private static ?self $instance = null;

    /** @var array<string, object> Services instancies */
    private array $services = [];

    /**
     * Singleton.
     */
    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructeur privé.
     */
    private function __construct()
    {
    }

    /**
     * Démarre le plugin : instancie et initialise tous les services.
     */
    public function boot(): void
    {
        // Theme (body class + data-theme) — prioritaire car tout le front en depend
        $this->services['theme_mapper'] = new Theme\ThemeMapper();
        $this->services['theme_mapper']->register();

        // WP Cleanup : emojis (CSP), embeds, generators legacy
        $this->services['wp_cleanup'] = new Optimization\WPCleanup();
        $this->services['wp_cleanup']->register();

        // React islands (Phase 2) — shortcode mount points + enqueue conditionnel
        // L'enqueue ne tournera qu'en front (hook wp_enqueue_scripts), mais le
        // shortcode est enregistre partout pour permettre les previews admin.
        $this->services['react_mount_points'] = new React\ReactMountPoints();
        $this->services['react_mount_points']->register();
        $this->services['react_loader'] = new React\ReactLoader();
        $this->services['react_loader']->register();

        // Custom Post Types
        $this->services['cpt_resource']    = new CPT\ResourceCPT();
        $this->services['cpt_case_study']  = new CPT\CaseStudyCPT();
        $this->services['cpt_service']     = new CPT\ServiceCPT();
        $this->services['cpt_resource']->register();
        $this->services['cpt_case_study']->register();
        $this->services['cpt_service']->register();

        // Taxonomies
        $this->services['taxonomy_pillar'] = new Taxonomy\PillarTaxonomy();
        $this->services['taxonomy_pillar']->register();

        // Admin UI (menu consolide)
        if (is_admin()) {
            $this->services['admin_menu'] = new Admin\AdminMenu();
            $this->services['admin_menu']->register();
        }

        // Schema JSON-LD (front uniquement)
        if (!is_admin()) {
            $this->services['schema'] = new Schema\SchemaInjector();
            $this->services['schema']->register();
        }

        do_action('inaricom_core_booted', $this);
    }

    /**
     * Hook d'activation : flush rewrite rules, seed taxonomy terms.
     */
    public function activate(): void
    {
        // Boot services pour qu'ils enregistrent leurs CPT/taxonomies
        $this->boot();

        // Seed les 4 termes de la taxonomy pillar si absents
        if (isset($this->services['taxonomy_pillar'])) {
            $this->services['taxonomy_pillar']->seed_default_terms();
        }

        // Flush pour prendre en compte les nouveaux slugs
        flush_rewrite_rules();
    }

    /**
     * Hook de désactivation : on NE supprime PAS les CPT ni les données,
     * on se contente de flush les rewrite rules.
     */
    public function deactivate(): void
    {
        flush_rewrite_rules();
    }

    /**
     * Récupère un service par clé.
     */
    public function service(string $key): ?object
    {
        return $this->services[$key] ?? null;
    }
}
