<?php
/**
 * MENAGE COMPLET CSS LEGACY (post-bascule prod 2026-04-29)
 *
 * Probleme : superposition de regles CSS de l'ancien site (avant React islands)
 * qui forcent #E31E24 partout, cassent les themes or/bleu/vert/neutre, et
 * empilent des bouts deprecated. Resultat : page IA toute en or-titre, page
 * cybersec toute en rouge-titre, logo homepage invisible, etc.
 *
 * Strategy : desactive ce qui est obsolete + vide la partie nocive du
 * Customizer kadence (post 362). Conserve les vrais utilitaires (table-scroll).
 * Sauvegarde tout dans meta pour rollback complet possible.
 *
 * Idempotent.
 */

define('WP_USE_THEMES', false);
require_once '/home/toriispo/inaricom.com/web/wp-load.php';

echo "=== ACTION 1 : Desactiver snippets fox legacy + centrage hero (deprecated React Phase 2) ===\n";
$obsolete = [
    442 => 'Fox Canvas Container (v28 deprecated, remplace par FoxAnimationV29 React)',
    443 => 'Fox Animation (v27/v28 deprecated, remplace par FoxAnimationV29 React)',
    508 => 'Centrage Hero page d accueil (homepage est React island avec son propre layout)',
];
foreach ($obsolete as $pid => $reason) {
    $p = get_post($pid);
    if (!$p) { echo "  $pid : NOT FOUND\n"; continue; }
    if ($p->post_status === 'draft' && get_post_meta($pid, '_active', true) === 'no') {
        echo "  $pid ({$p->post_title}) : deja desactive, skip\n";
        continue;
    }
    update_post_meta($pid, '_active', 'no');
    wp_update_post(['ID' => $pid, 'post_status' => 'draft']);
    // Renommer le static cache file si present
    $cache = WP_CONTENT_DIR . "/uploads/custom-css-js/{$pid}.css";
    if (file_exists($cache)) {
        rename($cache, $cache . '.disabled-' . date('Ymd-His'));
    }
    $cache_js = WP_CONTENT_DIR . "/uploads/custom-css-js/{$pid}.js";
    if (file_exists($cache_js)) {
        rename($cache_js, $cache_js . '.disabled-' . date('Ymd-His'));
    }
    echo "  $pid ({$p->post_title}) : draft + _active=no  ($reason)\n";
}

echo "\n=== ACTION 2 : Custom CSS Customizer kadence (post 362) - retire les regles legacy [data-theme=\"rouge\"] ===\n";
$kadence_css = get_post(362);
if (!$kadence_css) {
    echo "  post 362 introuvable, skip\n";
} else {
    $current = $kadence_css->post_content;

    // Sauvegarde si pas deja fait
    if (!get_post_meta(362, '_pre_cleanup_2026_04_29', true)) {
        update_post_meta(362, '_pre_cleanup_2026_04_29', $current);
        echo "  Backup contenu original dans meta _pre_cleanup_2026_04_29 (" . strlen($current) . " bytes)\n";
    }

    // Detecte la frontiere "fix WC hover" vs "regles theme rouge legacy".
    // La 1ere section (lignes 1-22) est WooCommerce hover fix, on la garde.
    // Tout ce qui suit le header "/* === THEME ROUGE - Regles manquantes" est legacy.
    $marker = '/* ===================================================';
    $marker_full = "/* ===================================================\n   THÈME ROUGE";

    $pos = strpos($current, $marker_full);
    if ($pos === false) {
        // Fallback : cherche "THÈME ROUGE" tout court
        $pos = strpos($current, 'THÈME ROUGE');
        if ($pos !== false) {
            // remonte au /* avant
            $pos = strrpos(substr($current, 0, $pos), '/*');
        }
    }

    if ($pos === false) {
        echo "  ATTENTION : marker 'THEME ROUGE' introuvable. Vide complet du post 362 (avec backup).\n";
        $new_content = "/* Customizer kadence — vide apres cleanup 2026-04-29 (legacy retire). Voir meta _pre_cleanup_2026_04_29 pour rollback. */\n";
    } else {
        $kept = substr($current, 0, $pos);
        $new_content = rtrim($kept) . "\n\n/* === Cleanup 2026-04-29 : regles [data-theme=\"rouge\"] legacy retirees. Backup : meta _pre_cleanup_2026_04_29 === */\n";
    }

    if (trim($new_content) === trim($current)) {
        echo "  contenu deja nettoye, skip\n";
    } else {
        wp_update_post(['ID' => 362, 'post_content' => $new_content]);
        echo "  Customizer 362 nettoye : " . strlen($current) . " bytes -> " . strlen($new_content) . " bytes\n";
        // WP customizer cache : flush_rewrite_rules + delete_transient
        delete_transient('inaricom_customizer_cache');
        wp_cache_flush();
    }
}

echo "\n=== ACTION 3 : Revert srcset hack du snippet 347 (qui casse logo homepage) ===\n";
$s347 = get_post(347);
if ($s347) {
    $css = $s347->post_content;
    $marker_start = "/* Hack srcset : masquer l'<img> natif pour tous les themes non-rouge */";
    $marker_end_v1 = "/* Theme rouge (defaut) : garder le logo natif visible avec halo */";
    $marker_end_v2 = "}\n\n/* ============================================================\n   63. THEME NEUTRE";

    $start_pos = strpos($css, $marker_start);
    if ($start_pos === false) {
        echo "  hack srcset non trouve, skip\n";
    } else {
        // Cherche fin : soit le bloc theme-rouge halo, soit le bloc 63
        $end_marker = '.theme-rouge .site-branding .brand.has-logo-image img.custom-logo';
        $end_pos = strpos($css, $end_marker, $start_pos);
        if ($end_pos !== false) {
            // Trouve la fin du bloc (le } qui ferme la rule .theme-rouge)
            $closing = strpos($css, '}', $end_pos);
            if ($closing !== false) {
                // Backup avant
                if (!get_post_meta(347, '_pre_revert_srcset_hack_2026_04_29', true)) {
                    update_post_meta(347, '_pre_revert_srcset_hack_2026_04_29', $css);
                }
                // Retire le bloc complet [start_pos -> closing+1]
                $new_css = substr($css, 0, $start_pos) .
                    "/* Hack srcset retire le 2026-04-29 : la classe .brand.has-logo-image n existe pas\n   sur Kadence prod, le hack rendait l img invisible sans la remplacer.\n   Solution alternative : hook PHP wp_get_attachment_image_attributes (a venir). */\n" .
                    substr($css, $closing + 1);
                wp_update_post(['ID' => 347, 'post_content' => $new_css]);
                // Regen static cache
                $wrapped = "<!-- start Simple Custom CSS and JS -->\n<style>\n" . $new_css . "\n</style>\n<!-- end Simple Custom CSS and JS -->\n";
                file_put_contents(WP_CONTENT_DIR . '/uploads/custom-css-js/347.css', $wrapped);
                echo "  hack srcset retire du snippet 347 (" . (strlen($css) - strlen($new_css)) . " bytes en moins) + cache regen\n";
            } else {
                echo "  fin de bloc introuvable, skip pour safety\n";
            }
        } else {
            echo "  fin de bloc introuvable (marker theme-rouge .brand absent), skip\n";
        }
    }
}

echo "\n=== ACTION 4 : Cache flush + opcache + customizer transients ===\n";
wp_cache_flush();
delete_transient('kadence_starter_templates_data');
echo "  cache flush\n";

echo "\nOK\n";
