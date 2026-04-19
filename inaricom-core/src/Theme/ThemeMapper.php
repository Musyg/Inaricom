<?php
/**
 * ThemeMapper — Injecte automatiquement data-theme + body class selon le pilier courant.
 *
 * @package Inaricom\Core\Theme
 */

declare(strict_types=1);

namespace Inaricom\Core\Theme;

use Inaricom\Core\Taxonomy\PillarTaxonomy;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Regles de résolution du thème pour une page donnée :
 *
 * 1. Si singular et a un terme 'inaricom_pillar' -> le thème de ce pilier
 * 2. Si archive de taxonomy 'inaricom_pillar' -> le thème de ce pilier
 * 3. Si archive d'un CPT Inaricom (sans pilier spécifique) -> défaut par CPT
 * 4. Sinon -> rouge (sécurité, défaut)
 *
 * Le thème est injecté via :
 * - filter `body_class` : ajoute `theme-rouge`, `theme-or`, etc.
 * - action `wp_head` : ajoute `<script>document.documentElement.dataset.theme='or'</script>`
 *   (place sur html pour que le CSS matche avant le premier paint)
 */
final class ThemeMapper
{
    /**
     * CPT -> thème par défaut (si post n'a pas de pilier assigné).
     *
     * @var array<string, string>
     */
    private const CPT_DEFAULT_THEMES = [
        'inaricom_resource'    => 'vert',    // ressources -> blog
        'inaricom_case_study'  => 'rouge',   // études de cas -> sécurité (dominant)
        'inaricom_service'     => 'rouge',   // services -> sécurité (dominant)
    ];

    public function register(): void
    {
        add_filter('body_class', [$this, 'add_theme_body_class'], 10, 1);
        add_action('wp_head', [$this, 'inject_html_data_theme'], 1);
    }

    /**
     * Ajoute `theme-<slug>` aux classes du body.
     *
     * @param array<int, string> $classes
     * @return array<int, string>
     */
    public function add_theme_body_class(array $classes): array
    {
        $theme = $this->resolve_current_theme();
        $classes[] = 'theme-' . $theme;
        return $classes;
    }

    /**
     * Inject `<script>document.documentElement.dataset.theme='X';</script>` dans <head>
     * pour que le CSS [data-theme="X"] s'applique AVANT le premier paint.
     *
     * Note : inline script court, pas de cout perf. Pas d'event listener, pas de delay.
     */
    public function inject_html_data_theme(): void
    {
        $theme = $this->resolve_current_theme();
        $theme_safe = esc_attr($theme);

        // Si theme = rouge (defaut), on n'injecte RIEN. Le CSS ciblera l'absence d'attribut.
        if ($theme === 'rouge') {
            return;
        }

        echo "<script>document.documentElement.dataset.theme='{$theme_safe}';</script>\n";
    }

    /**
     * Résout le thème actif pour la vue courante.
     */
    private function resolve_current_theme(): string
    {
        // 1. Singular avec terme pilier
        if (is_singular()) {
            $post_id = get_queried_object_id();
            $terms = wp_get_post_terms($post_id, PillarTaxonomy::TAXONOMY_SLUG, ['fields' => 'slugs']);

            if (!is_wp_error($terms) && !empty($terms)) {
                return PillarTaxonomy::get_theme_for_pillar($terms[0]);
            }

            // Fallback : theme par défaut du CPT
            $post_type = get_post_type($post_id);
            if (isset(self::CPT_DEFAULT_THEMES[$post_type])) {
                return self::CPT_DEFAULT_THEMES[$post_type];
            }
        }

        // 2. Archive de taxonomy pilier
        if (is_tax(PillarTaxonomy::TAXONOMY_SLUG)) {
            $term = get_queried_object();
            if ($term && isset($term->slug)) {
                return PillarTaxonomy::get_theme_for_pillar($term->slug);
            }
        }

        // 3. Archive de CPT Inaricom
        if (is_post_type_archive(array_keys(self::CPT_DEFAULT_THEMES))) {
            $post_type = get_query_var('post_type');
            if (isset(self::CPT_DEFAULT_THEMES[$post_type])) {
                return self::CPT_DEFAULT_THEMES[$post_type];
            }
        }

        // 4. Default : rouge (sécurité = dominant de la marque)
        return 'rouge';
    }
}
