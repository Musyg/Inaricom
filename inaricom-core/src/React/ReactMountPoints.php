<?php
/**
 * ReactMountPoints - Shortcode pour injecter les divs de mount des React islands.
 *
 * Usage : `[inari_island name="homepage"]` dans une page WP.
 *
 * Sortie : <div id="inari-homepage-root" class="inari-island-root" data-island="homepage">{skeleton}</div>
 *
 * Le data-theme n'est PAS pose ici : ThemeMapper.php le pose sur <html> en
 * priorite absolue (homepage = neutre, autres pages = pilier de la page).
 * Les composants React font `closest('[data-theme]')` qui remonte au <html>.
 *
 * Le skeleton interne sert a eviter le CLS (Cumulative Layout Shift) en
 * reservant la hauteur attendue du contenu React avant hydratation.
 *
 * @package Inaricom\Core\React
 */

declare(strict_types=1);

namespace Inaricom\Core\React;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shortcode `[inari_island name="..."]` -> div de mount React.
 */
final class ReactMountPoints
{
    public function register(): void
    {
        add_shortcode('inari_island', [$this, 'render_mount_point']);
    }

    /**
     * Rend le div de mount + skeleton pour un island donne.
     *
     * @param array<string, mixed>|string $atts Attributs du shortcode.
     */
    public function render_mount_point($atts): string
    {
        $atts = shortcode_atts(
            ['name' => ''],
            is_array($atts) ? $atts : [],
            'inari_island'
        );

        $name = sanitize_key((string) $atts['name']);
        if ($name === '') {
            return '';
        }

        // Whitelist des islands connus (defense en profondeur : evite qu'on
        // injecte un id arbitraire en passant n'importe quoi dans le shortcode).
        if (!$this->is_known_island($name)) {
            return '';
        }

        $skeleton = $this->get_skeleton_for($name);
        $embedded = $this->get_embedded_payload_for($name);

        return sprintf(
            '<div id="inari-%1$s-root" class="inari-island-root" data-island="%1$s">%2$s%3$s</div>',
            esc_attr($name),
            $skeleton,
            $embedded
        );
    }

    /**
     * Pour certains islands (legal), embedde le contenu necessaire dans le
     * mount point sous forme de <script type="application/json"> pour eviter
     * un fetch REST API supplementaire au mount React.
     *
     * Le React island lit le JSON via document.getElementById(...) avant de
     * fallback sur fetch.
     *
     * Resultat : zero round-trip reseau, render quasi-instantane.
     */
    private function get_embedded_payload_for(string $name): string
    {
        if ($name !== 'legal') {
            return '';
        }

        $post_id = get_the_ID();
        if (!$post_id) {
            return '';
        }
        $post = get_post($post_id);
        if (!$post instanceof \WP_Post) {
            return '';
        }

        // Contenu original sauvegarde dans le meta lors de la migration en island.
        // Fallback sur post_content (cas exceptionnel : si meta absent et content
        // != shortcode, on prend le content tel quel).
        $original = (string) get_post_meta($post_id, '_legal_original_content', true);
        if ($original === '') {
            $original = (string) $post->post_content;
        }
        // Skip si le contenu est juste le shortcode (boucle)
        if (preg_match('/^\s*\[inari_island[^\]]*\]\s*$/', $original)) {
            return '';
        }

        // Apply WP filters pour rendre le HTML final (do_shortcode, wpautop, etc.)
        $rendered = apply_filters('the_content', $original);
        // Nettoyage : retire eventuels shortcodes residuels
        $rendered = (string) preg_replace('/\[inari_island[^\]]*\]/', '', $rendered);

        $payload = [
            'id'       => $post_id,
            'slug'     => $post->post_name,
            'title'    => get_the_title($post),
            'content'  => $rendered,
            'modified' => mysql2date('c', $post->post_modified),
        ];

        // wp_json_encode echappe correctement pour <script>. Pas besoin de htmlspecialchars
        // car JSON est parse par JSON.parse, pas par le HTML parser.
        return sprintf(
            '<script type="application/json" id="inari-%1$s-data">%2$s</script>',
            esc_attr($name),
            wp_json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    }

    /**
     * Whitelist des islands disponibles. Ajouter ici a chaque nouvel island
     * cree dans react-islands/src/islands/.
     */
    private function is_known_island(string $name): bool
    {
        $known = [
            'homepage',
            'cybersec',
            'ia',
            'blog',
            'about',
            'contact',
            'legal',
            'audit-web',
            // Phase 2.5+ : audit-infra, audit-smart-contract, ai-tool-finder, etc.
        ];
        return in_array($name, $known, true);
    }

    /**
     * Retourne le skeleton HTML a afficher pendant l'hydratation React.
     *
     * Objectif :
     * - Match la hauteur attendue du composant final (anti CLS)
     * - Couleur de fond identique au hero (--inari-black) pour zero flash
     * - Pas de contenu textuel (le H1 SEO est gere par WP / Rank Math)
     *
     * Style inline pour ne pas dependre du CSS de l'island (qui charge async).
     */
    private function get_skeleton_for(string $name): string
    {
        $skeletons = [
            'homepage' => '<div class="inari-skeleton-hero" style="min-height:100vh;background:#0A0A0F;"></div>',
            'cybersec' => '<div class="inari-skeleton-hero" style="min-height:100vh;background:#0A0A0F;"></div>',
            'ia'       => '<div class="inari-skeleton-hero" style="min-height:100vh;background:#0A0A0F;"></div>',
            'blog'     => '<div class="inari-skeleton-hero" style="min-height:60vh;background:#0A0A0F;"></div>',
            'about'    => '<div class="inari-skeleton-hero" style="min-height:70vh;background:#0A0A0F;"></div>',
            'contact'  => '<div class="inari-skeleton-hero" style="min-height:50vh;background:#0A0A0F;"></div>',
            'legal'    => '<div class="inari-skeleton-hero" style="min-height:60vh;background:#0A0A0F;"></div>',
            'audit-web' => '<div class="inari-skeleton-hero" style="min-height:100vh;background:#0A0A0F;"></div>',
        ];

        return $skeletons[$name] ?? '';
    }
}
