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

        return sprintf(
            '<div id="inari-%1$s-root" class="inari-island-root" data-island="%1$s">%2$s</div>',
            esc_attr($name),
            $skeleton
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
            // Phase 2.5+ : ai-tool-finder, hardware-config, ai-mastery-hub, etc.
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
        ];

        return $skeletons[$name] ?? '';
    }
}
