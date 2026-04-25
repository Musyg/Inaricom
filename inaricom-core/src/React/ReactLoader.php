<?php
/**
 * ReactLoader - Enqueue conditionnel des bundles React islands via le manifest Vite.
 *
 * Lit `assets/react/manifest.json` produit par `pnpm build` dans react-islands/,
 * et enqueue le JS/CSS de l'island uniquement si la page courante contient le
 * shortcode `[inari_island name="..."]` correspondant.
 *
 * Architecture (cf. docs/phase2-react-islands.md) :
 *   react-islands/                 (source)
 *     vite build -> ../inaricom-core/assets/react/  (output)
 *       manifest.json                                 (mapping entry -> hash)
 *       js/homepage-{hash}.js                         (bundle ES module)
 *       js/chunks/                                    (lazy chunks)
 *       css/homepage-{hash}.css                       (Tailwind compile)
 *
 * @package Inaricom\Core\React
 */

declare(strict_types=1);

namespace Inaricom\Core\React;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Enqueue conditionnel des bundles React via manifest Vite.
 */
final class ReactLoader
{
    private const MANIFEST_RELATIVE_PATH = 'assets/react/.vite/manifest.json';
    private const MANIFEST_LEGACY_PATH   = 'assets/react/manifest.json';
    private const ASSETS_BASE_URL_REL    = 'assets/react/';

    /**
     * Cache memoire du manifest decode (lu une seule fois par requete).
     *
     * @var array<string, array<string, mixed>>|null
     */
    private ?array $manifest = null;

    /**
     * Liste des handles enqueues, pour les passer en type=module via filter.
     *
     * @var array<int, string>
     */
    private array $module_handles = [];

    public function register(): void
    {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_islands'], 20);
        add_filter('script_loader_tag', [$this, 'inject_module_attributes'], 10, 3);
    }

    /**
     * Hook principal : detecte les shortcodes presents et enqueue les bundles.
     */
    public function enqueue_islands(): void
    {
        $manifest = $this->get_manifest();
        if ($manifest === null) {
            return;
        }

        $islands_in_page = $this->detect_islands_in_current_page();
        if (empty($islands_in_page)) {
            return;
        }

        foreach ($islands_in_page as $island_name) {
            $this->enqueue_island($island_name, $manifest);
        }
    }

    /**
     * Charge et cache le manifest Vite.
     *
     * Vite v5+ ecrit le manifest dans `.vite/manifest.json` par defaut.
     * Fallback sur l'ancienne convention `manifest.json` racine pour compat.
     *
     * @return array<string, array<string, mixed>>|null
     */
    private function get_manifest(): ?array
    {
        if ($this->manifest !== null) {
            return $this->manifest;
        }

        $candidates = [
            INARICOM_CORE_PATH . self::MANIFEST_RELATIVE_PATH,
            INARICOM_CORE_PATH . self::MANIFEST_LEGACY_PATH,
        ];

        foreach ($candidates as $path) {
            if (!file_exists($path) || !is_readable($path)) {
                continue;
            }

            $raw = file_get_contents($path);
            if ($raw === false) {
                continue;
            }

            $decoded = json_decode($raw, true);
            if (!is_array($decoded)) {
                continue;
            }

            $this->manifest = $decoded;
            return $this->manifest;
        }

        return null;
    }

    /**
     * Detecte quels islands sont references sur la page courante via shortcode.
     *
     * @return array<int, string> liste des noms d'islands (sanitized).
     */
    private function detect_islands_in_current_page(): array
    {
        if (!is_singular() && !is_front_page() && !is_home()) {
            return [];
        }

        $post_id = get_the_ID();
        if (!$post_id) {
            return [];
        }

        $content = (string) get_post_field('post_content', $post_id);
        if ($content === '') {
            return [];
        }

        // Recherche [inari_island name="xxx"] avec name en quotes simples ou doubles.
        // Tolere les espaces autour du = et l'absence de quotes pour valeurs simples.
        $pattern = '/\[inari_island\s+name\s*=\s*[\'"]?([a-z0-9_-]+)[\'"]?[^\]]*\]/i';
        if (!preg_match_all($pattern, $content, $matches)) {
            return [];
        }

        $names = array_map('sanitize_key', $matches[1]);
        return array_values(array_unique(array_filter($names)));
    }

    /**
     * Enqueue le JS + CSS d'un island specifique a partir du manifest.
     *
     * @param array<string, array<string, mixed>> $manifest
     */
    private function enqueue_island(string $island_name, array $manifest): void
    {
        $entry_key = "src/islands/{$island_name}.tsx";

        if (!isset($manifest[$entry_key]) || !is_array($manifest[$entry_key])) {
            // Manifest n'a pas cette entree : silencieux (l'island n'existe peut-etre
            // pas encore cote source, ou le build est en retard sur le PHP).
            return;
        }

        $entry = $manifest[$entry_key];
        $base_url = INARICOM_CORE_URL . self::ASSETS_BASE_URL_REL;
        $js_handle = "inari-island-{$island_name}";

        // 1. Bundle JS principal de l'island
        $js_file = isset($entry['file']) && is_string($entry['file']) ? $entry['file'] : null;
        if ($js_file !== null) {
            wp_enqueue_script(
                $js_handle,
                $base_url . $js_file,
                [],
                INARICOM_CORE_VERSION,
                [
                    'in_footer' => true,
                    'strategy'  => 'defer',
                ]
            );
            $this->module_handles[] = $js_handle;
        }

        // 2. CSS associe (Tailwind compile + globals)
        if (isset($entry['css']) && is_array($entry['css'])) {
            foreach ($entry['css'] as $i => $css_file) {
                if (!is_string($css_file)) {
                    continue;
                }
                wp_enqueue_style(
                    "inari-island-{$island_name}-css-{$i}",
                    $base_url . $css_file,
                    [],
                    INARICOM_CORE_VERSION
                );
            }
        }

        // 3. Imports statiques (chunks importes synchronement par l'entry)
        // Vite les liste dans entry.imports comme cles d'autres entrees du manifest.
        if (isset($entry['imports']) && is_array($entry['imports'])) {
            foreach ($entry['imports'] as $imported_key) {
                if (!is_string($imported_key) || !isset($manifest[$imported_key])) {
                    continue;
                }
                $imported = $manifest[$imported_key];
                if (!is_array($imported) || !isset($imported['file']) || !is_string($imported['file'])) {
                    continue;
                }
                // Modulepreload via wp_resource_hints serait ideal, mais ici on
                // se contente de laisser le browser charger le chunk a la
                // demande de l'entry. Vite genere les imports en ESM dans le
                // bundle, le navigateur les resout naturellement.
            }
        }
    }

    /**
     * Injecte type="module" + crossorigin sur les <script> des islands.
     *
     * Hook script_loader_tag : WordPress >= 5.7 supporte ['strategy' => 'defer']
     * dans wp_enqueue_script, mais ne sait pas poser type="module" tout seul.
     *
     * @param string $tag    Le tag <script> complet genere par WP.
     * @param string $handle Handle du script (passe par notre register).
     * @param string $src    URL du script.
     */
    public function inject_module_attributes(string $tag, string $handle, string $src): string
    {
        if (!in_array($handle, $this->module_handles, true)) {
            return $tag;
        }

        // Remplace `<script ...src=` par `<script type="module" crossorigin ...src=`
        // Une seule occurrence (le tag du handle courant).
        return (string) preg_replace(
            '/<script(\s)/',
            '<script type="module" crossorigin$1',
            $tag,
            1
        );
    }
}
