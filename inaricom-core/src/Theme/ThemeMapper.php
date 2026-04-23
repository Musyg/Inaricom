<?php
/**
 * ThemeMapper — Injecte automatiquement data-theme + body class selon la page courante.
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
 * Résolution du thème pour chaque vue du site.
 *
 * Règle métier (arbitrée 2026-04-20, étendue 2026-04-21) :
 * - NEUTRE = homepage (front page) : palette noir/blanc/crème, aucune couleur
 *            d'accent dominante. Les 3 cards piliers rouge/or/vert apparaissent
 *            chacune avec leur accent propre, en égalité visuelle.
 * - OR     = univers IA entier (boutique WooCommerce actuelle + futurs services/tutos IA)
 * - ROUGE  = univers sécurité/Red Team pur (services sécu, articles sécu premium)
 * - VERT   = blog / ressources / contenu éditorial gratuit
 * - BLEU   = pages institutionnelles (contact, à propos, légal, CGV)
 *
 * Ordre de résolution :
 *
 * 0. is_front_page() -> NEUTRE (priorité absolue, homepage équitable)
 * 1. Contenu avec terme `inaricom_pillar` assigné -> thème du pilier
 * 2. Archive de taxonomy `inaricom_pillar` -> thème du pilier
 * 3. Pages WooCommerce (shop, produit, panier, compte...) -> OR
 * 4. Pages institutionnelles (via slug) -> BLEU
 * 5. Contexte blog (posts, archives, tags, auteurs) -> VERT
 * 6. Archive de CPT Inaricom (sans pilier spécifique) -> défaut par CPT
 * 7. Sinon (pages non classées, 404) -> ROUGE (identité marque dominante)
 *
 * Injection :
 * - filter `body_class` : ajoute `theme-neutre|rouge|or|vert|bleu`
 * - action `wp_head` : inline script minimal qui pose `data-theme` sur <html>
 *   avant le premier paint (0 flash, pas d'event listener, <100 octets)
 */
final class ThemeMapper
{
    /**
     * CPT -> thème par défaut si le post n'a pas de pilier assigné.
     *
     * @var array<string, string>
     */
    private const CPT_DEFAULT_THEMES = [
        'inaricom_resource'   => 'vert',
        'inaricom_case_study' => 'rouge',
        'inaricom_service'    => 'rouge',
    ];

    /**
     * Slugs de pages identifiées comme "institutionnelles" (thème bleu).
     * Match exact ou partiel via str_contains pour tolérer les préfixes langue.
     *
     * @var array<int, string>
     */
    private const INSTITUTIONAL_SLUGS = [
        'contact',
        'a-propos',
        'about',
        'mentions-legales',
        'mentions',
        'legal',
        'cgv',
        'cgu',
        'conditions-generales',
        'politique-confidentialite',
        'politique-de-confidentialite',
        'privacy',
        'privacy-policy',
        'cookies',
        'politique-cookies',
    ];

    public function register(): void
    {
        add_filter('body_class', [$this, 'add_theme_body_class'], 10, 1);
        add_action('wp_head', [$this, 'inject_html_data_theme'], 1);
    }

    /**
     * Ajoute `theme-<slug>` aux classes du body (fallback pour ciblage CSS).
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
     * Inline script court dans <head> pour poser data-theme sur <html>
     * AVANT le premier paint. Pas d'attente DOMContentLoaded.
     *
     * Pour le thème rouge (défaut), aucun attribut n'est posé : le CSS cible
     * l'absence de `[data-theme]` pour servir les variables du :root.
     */
    public function inject_html_data_theme(): void
    {
        $theme = $this->resolve_current_theme();

        if ($theme === 'rouge') {
            return; // Défaut, rien à injecter
        }

        $theme_safe = esc_attr($theme);
        echo "<script>document.documentElement.dataset.theme='{$theme_safe}';</script>\n";
    }

    /**
     * Résout le thème actif pour la vue courante.
     * Public pour permettre aux tests/autres modules d'interroger la valeur.
     */
    public function resolve_current_theme(): string
    {
        // 0. Front page (homepage) -> NEUTRE, priorité absolue.
        //    La homepage présente les 3 piliers à égalité, aucun ne doit dominer.
        //    Les cards piliers portent chacune leur couleur d'accent propre.
        if (is_front_page()) {
            return 'neutre';
        }

        // 1. Singular avec terme pilier assigné (priorité max)
        if (is_singular()) {
            $post_id = get_queried_object_id();

            // 1a. Terme pilier explicite
            if (taxonomy_exists(PillarTaxonomy::TAXONOMY_SLUG)) {
                $terms = wp_get_post_terms(
                    $post_id,
                    PillarTaxonomy::TAXONOMY_SLUG,
                    ['fields' => 'slugs']
                );
                if (!is_wp_error($terms) && !empty($terms)) {
                    return PillarTaxonomy::get_theme_for_pillar($terms[0]);
                }
            }

            // 1b. Fallback CPT Inaricom par défaut (avant détection Woo/blog)
            $post_type = get_post_type($post_id);
            if (isset(self::CPT_DEFAULT_THEMES[$post_type])) {
                return self::CPT_DEFAULT_THEMES[$post_type];
            }
        }

        // 2. Archive de taxonomy pilier
        if (taxonomy_exists(PillarTaxonomy::TAXONOMY_SLUG) && is_tax(PillarTaxonomy::TAXONOMY_SLUG)) {
            $term = get_queried_object();
            if ($term && isset($term->slug)) {
                return PillarTaxonomy::get_theme_for_pillar($term->slug);
            }
        }

        // 3. Contexte WooCommerce entier -> OR (IA hardware + futur)
        if ($this->is_woocommerce_context()) {
            return 'or';
        }

        // 4. Pages institutionnelles détectées par slug -> BLEU
        if (is_page()) {
            $slug = $this->get_current_page_slug();
            if ($slug !== null && $this->is_institutional_slug($slug)) {
                return 'bleu';
            }
        }

        // 5. Contexte blog standard -> VERT
        if ($this->is_blog_context()) {
            return 'vert';
        }

        // 6. Archive de CPT Inaricom (sans pilier explicite)
        if (is_post_type_archive(array_keys(self::CPT_DEFAULT_THEMES))) {
            $post_type = get_query_var('post_type');
            if (is_string($post_type) && isset(self::CPT_DEFAULT_THEMES[$post_type])) {
                return self::CPT_DEFAULT_THEMES[$post_type];
            }
        }

        // 7. Défaut : rouge (identité marque, Red Team dominante)
        return 'rouge';
    }

    /**
     * Détecte si on est dans une vue WooCommerce quelconque.
     *
     * Couvre : shop archive, produit single, catégorie/tag produit,
     * panier, checkout, mon compte, et toute page flaggée WC.
     */
    private function is_woocommerce_context(): bool
    {
        if (!function_exists('is_woocommerce')) {
            return false;
        }

        // is_woocommerce() ne couvre pas cart/checkout/account par design
        // -> on teste aussi les fonctions spécifiques
        if (is_woocommerce()) {
            return true;
        }

        if (function_exists('is_cart') && is_cart()) {
            return true;
        }

        if (function_exists('is_checkout') && is_checkout()) {
            return true;
        }

        if (function_exists('is_account_page') && is_account_page()) {
            return true;
        }

        return false;
    }

    /**
     * Détecte si on est dans un contexte blog standard WordPress.
     *
     * Couvre : page des posts (is_home), post single, archive catégorie/tag,
     * auteur, date. Exclut pages statiques et CPT custom.
     */
    private function is_blog_context(): bool
    {
        // is_home() = "page des posts" (même si la front-page est statique)
        if (is_home()) {
            return true;
        }

        // Single post standard (post_type === 'post')
        if (is_singular('post')) {
            return true;
        }

        // Archives taxonomiques standard
        if (is_category() || is_tag() || is_tax()) {
            return true;
        }

        // Archives temporelles et auteurs
        if (is_author() || is_date()) {
            return true;
        }

        // Archive générique (sauf si c'est un CPT Inaricom -> géré au 6)
        if (is_archive() && !is_post_type_archive(array_keys(self::CPT_DEFAULT_THEMES))) {
            return true;
        }

        return false;
    }

    /**
     * Récupère le slug de la page courante si is_page().
     */
    private function get_current_page_slug(): ?string
    {
        $queried = get_queried_object();
        if (!$queried || !isset($queried->post_name)) {
            return null;
        }
        return (string) $queried->post_name;
    }

    /**
     * Vérifie si le slug correspond à une page institutionnelle.
     */
    private function is_institutional_slug(string $slug): bool
    {
        $slug_lower = strtolower($slug);

        foreach (self::INSTITUTIONAL_SLUGS as $institutional) {
            if ($slug_lower === $institutional) {
                return true;
            }
            // str_contains tolère les préfixes langue (ex: en-contact)
            if (str_contains($slug_lower, $institutional)) {
                return true;
            }
        }

        return false;
    }
}
