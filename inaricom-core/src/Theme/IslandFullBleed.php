<?php
/**
 * Cache le titre Kadence sur les pages qui montent une React island full-bleed.
 *
 * Pourquoi : nos islands (homepage, et a venir : services-cybersecurite,
 * services-ia, etc.) ont leur propre H1 dans le composant React. Le titre
 * de page WP rendu par Kadence ("Accueil Inaricom") fait double emploi et
 * casse le rythme du Hero plein-ecran.
 *
 * Strategie : si le contenu de la page contient le shortcode [inari_island ...],
 * on desactive le post title via le filter `kadence_post_title` (renvoie false)
 * ET on ajoute une class CSS `inari-fullbleed` sur le body pour permettre
 * d eventuels override CSS ulterieurs (ex: padding-top du content area).
 *
 * Le check est cache au niveau du post id pour eviter une regex repetee
 * pendant le rendu d une meme requete.
 *
 * @package Inaricom\Core\Theme
 */

declare(strict_types=1);

namespace Inaricom\Core\Theme;

if (!defined('ABSPATH')) {
    exit;
}

final class IslandFullBleed
{
    /** @var array<int, bool> Cache : post_id => has_island_shortcode */
    private array $cache = [];

    public function register(): void
    {
        // Vire le titre Kadence de la page si elle contient une island.
        // Filter Kadence officiel (cf. kadencewp.com filters reference).
        // Note : ce filter ne marche pas dans toutes les configurations
        // Kadence (selon le template). Le CSS inline ci-dessous fait le job
        // de toute facon et reste defensif.
        add_filter('kadence_post_title', [$this, 'maybe_hide_title']);

        // Body class pour overrides CSS si besoin
        add_filter('body_class', [$this, 'add_body_class']);

        // CSS critique inline : cache l entry-header par defaut Kadence
        // sur les pages full-bleed. Inline pour eviter une requete CSS
        // supplementaire et eviter le FOUC.
        add_action('wp_head', [$this, 'print_critical_css'], 1);
    }

    /**
     * CSS critique inline pour les pages avec island.
     * Imprime SEULEMENT si la page courante en a une.
     */
    public function print_critical_css(): void
    {
        if (!is_singular() || !$this->page_has_island()) {
            return;
        }

        // CSS minimal :
        //  - hide entry-header (titre WP "Accueil Inaricom" et compagnie)
        //  - retire le padding default content area Kadence pour true full-bleed
        //  - assure que le mount React occupe 100% de la largeur dispo
        echo "<style id=\"inari-fullbleed-critical\">"
            . "body.inari-fullbleed .entry-header.page-title,"
            . "body.inari-fullbleed header.entry-header.page-title{display:none!important}"
            . "body.inari-fullbleed .content-area,"
            . "body.inari-fullbleed .site-main,"
            . "body.inari-fullbleed .entry-content{padding:0!important;margin:0!important;max-width:none!important}"
            . "body.inari-fullbleed .inari-island-root{width:100%}"
            . "</style>\n";
    }

    /**
     * @param bool $show Valeur courante du flag (true par defaut)
     */
    public function maybe_hide_title($show)
    {
        if (!is_singular()) {
            return $show;
        }
        return $this->page_has_island() ? false : $show;
    }

    /**
     * @param array<int, string> $classes
     * @return array<int, string>
     */
    public function add_body_class(array $classes): array
    {
        if (is_singular() && $this->page_has_island()) {
            $classes[] = 'inari-fullbleed';
        }
        return $classes;
    }

    /**
     * Detecte la presence d un shortcode [inari_island ...] dans le contenu
     * du post courant. Mise en cache par post_id.
     */
    private function page_has_island(): bool
    {
        $post_id = get_queried_object_id();
        if ($post_id <= 0) {
            return false;
        }
        if (isset($this->cache[$post_id])) {
            return $this->cache[$post_id];
        }

        $post = get_post($post_id);
        if (!$post instanceof \WP_Post) {
            return $this->cache[$post_id] = false;
        }

        // Detection rapide : has_shortcode officiel WordPress.
        $has = has_shortcode($post->post_content, 'inari_island');
        return $this->cache[$post_id] = $has;
    }
}
