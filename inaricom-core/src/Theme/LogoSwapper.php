<?php
/**
 * LogoSwapper - swap le src/srcset du logo Kadence selon le theme courant.
 *
 * Pourquoi PHP et pas CSS ?
 *
 * Le hack CSS `[data-theme="X"] .custom-logo { content: url(...) }` ne marche
 * pas si l'image a un attribut `srcset`, parce que le browser ignore `content`
 * en presence de srcset. Le hack alternatif `opacity: 0.05 + bg-image` exige
 * une classe `.brand.has-logo-image` qui n'existe pas sur tous les Kadence.
 *
 * Solution propre : intervenir AVANT que le HTML soit emis, en modifiant
 * directement les attributs `src` + `srcset` via le filtre WP
 * `wp_get_attachment_image_attributes`. Marche partout, pas de srcset
 * mismatch, pas de double-flash.
 *
 * @package Inaricom\Core\Theme
 */

declare(strict_types=1);

namespace Inaricom\Core\Theme;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Swap dynamique du logo selon le theme resolu par ThemeMapper.
 */
final class LogoSwapper
{
    /**
     * Mapping theme -> nom de fichier base. Pour chaque variante, on
     * remplace toute occurrence de '/cropped-LogoLong4White' (logo rouge
     * default Kadence) par '/Design-sans-titre-XX' (variante du theme).
     *
     * @var array<string, string>
     */
    private const THEME_LOGO_MAP = [
        'or'     => 'Design-sans-titre-16',
        'bleu'   => 'Design-sans-titre-13',
        'vert'   => 'Design-sans-titre-15',
        'neutre' => 'Design-sans-titre-17',
    ];

    /** Le slug du logo rouge default (pattern dans les URLs Kadence). */
    private const DEFAULT_LOGO_SLUG = 'cropped-LogoLong4White';

    /** Annee/mois du dossier upload pour les variantes (Design-sans-titre-XX). */
    private const VARIANT_UPLOADS_PATH = '/wp-content/uploads/2026/01/';

    private ?ThemeMapper $theme_mapper = null;

    public function __construct(?ThemeMapper $theme_mapper = null)
    {
        $this->theme_mapper = $theme_mapper;
    }

    public function register(): void
    {
        // Filter sur l'image du logo Kadence + WP custom-logo
        add_filter('wp_get_attachment_image_attributes', [$this, 'swap_logo_attrs'], 10, 3);
        // Filter sur le HTML complet du custom logo (defense en profondeur)
        add_filter('get_custom_logo', [$this, 'swap_custom_logo_html'], 10, 1);
    }

    /**
     * Modifie src/srcset de l'<img> Kadence si :
     *   - on est sur une page avec theme != rouge
     *   - l'image est le logo principal (URL contient cropped-LogoLong4White)
     *
     * @param array<string, string|null> $attrs
     * @param \WP_Post|null $attachment
     * @param string|array<int, int>|null $size
     * @return array<string, string|null>
     */
    public function swap_logo_attrs($attrs, $attachment = null, $size = null): array
    {
        $theme = $this->resolve_theme();
        if ($theme === 'rouge' || $theme === null) {
            return $attrs; // logo default rouge, rien a swap
        }
        if (!isset(self::THEME_LOGO_MAP[$theme])) {
            return $attrs;
        }

        $src = $attrs['src'] ?? '';
        if (!is_string($src) || strpos($src, self::DEFAULT_LOGO_SLUG) === false) {
            return $attrs; // pas le logo principal Inaricom
        }

        $variant_filename = self::THEME_LOGO_MAP[$theme] . '.png';
        $variant_url = home_url(self::VARIANT_UPLOADS_PATH . $variant_filename);

        $attrs['src'] = $variant_url;

        // Retire srcset entierement (le variant n'a pas de srcset multi-tailles)
        if (isset($attrs['srcset'])) {
            unset($attrs['srcset']);
        }
        if (isset($attrs['sizes'])) {
            unset($attrs['sizes']);
        }

        return $attrs;
    }

    /**
     * Filter sur get_custom_logo() pour les cas ou wp_get_attachment_image
     * n'a pas suffi (ex : Kadence wraps avec srcset injecte plus tard).
     */
    public function swap_custom_logo_html($html): string
    {
        $theme = $this->resolve_theme();
        if ($theme === 'rouge' || $theme === null) {
            return (string) $html;
        }
        if (!isset(self::THEME_LOGO_MAP[$theme])) {
            return (string) $html;
        }

        $variant_filename = self::THEME_LOGO_MAP[$theme] . '.png';
        $variant_url = home_url(self::VARIANT_UPLOADS_PATH . $variant_filename);

        // Remplace toute URL contenant 'cropped-LogoLong4White' par le variant
        $html = (string) preg_replace(
            '#https?://[^"\']*cropped-LogoLong4White[^"\']*\.png#i',
            $variant_url,
            $html
        );

        // Retire l'attribut srcset si present
        $html = (string) preg_replace('/\s+srcset="[^"]*"/', '', $html);
        $html = (string) preg_replace('/\s+sizes="[^"]*"/', '', $html);

        return $html;
    }

    /**
     * Resout le theme courant (passe par ThemeMapper si fourni, sinon
     * lit data-theme depuis le body class fallback).
     */
    private function resolve_theme(): ?string
    {
        if ($this->theme_mapper !== null) {
            return $this->theme_mapper->resolve_current_theme();
        }
        // Fallback : reconstruit la logique minimale via is_front_page
        if (is_front_page()) {
            return 'neutre';
        }
        return null;
    }
}
