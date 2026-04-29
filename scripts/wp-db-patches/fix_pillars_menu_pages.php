<?php
/**
 * Fix transactionnel apres bascule prod 2026-04-29 :
 *  1. Assigne les termes inaricom_pillar manquants aux pages island
 *  2. Repointe le menu item "Accueil" vers la vraie homepage React (1064)
 *  3. Ajoute "Cybersecurite" dans le menu + reparente les Audits dessous
 *  4. Met la page 471 "Articles" sur l'island blog
 *  5. Passe la page 366 (ancienne homepage Kadence) en draft (cache du public)
 *
 * Idempotent : verifie chaque etape avant d'agir, retourne 'skip' sinon.
 */

define('WP_USE_THEMES', false);
require_once '/home/toriispo/inaricom.com/web/wp-load.php';

echo "=== ACTION 1 : Assign pillar terms ===\n";
$pillar_assign = [
    1064 => 'neutre',     // homepage : pas besoin (front_page auto -> neutre) mais on le met explicite
    1066 => 'ia',         // accueil-ia
    985  => 'securite',   // accueil-cybersecurite
];
foreach ($pillar_assign as $pid => $pillar_slug) {
    $existing = wp_get_object_terms($pid, 'inaricom_pillar', ['fields' => 'slugs']);
    if (!is_wp_error($existing) && in_array($pillar_slug, (array) $existing, true)) {
        echo "  page $pid : pillar=$pillar_slug deja assigne, skip\n";
        continue;
    }
    // Skip neutre — pas un terme pillar, c'est juste le fallback front_page
    if ($pillar_slug === 'neutre') {
        echo "  page $pid : skip (neutre = front_page auto)\n";
        continue;
    }
    $res = wp_set_object_terms($pid, $pillar_slug, 'inaricom_pillar', false);
    if (is_wp_error($res)) {
        echo "  page $pid : ECHEC " . $res->get_error_message() . "\n";
    } else {
        echo "  page $pid : pillar=$pillar_slug assigne\n";
    }
}

echo "\n=== ACTION 2 : Menu Accueil (376) -> page 1064 (au lieu de 366) ===\n";
$current_obj_id = (int) get_post_meta(376, '_menu_item_object_id', true);
if ($current_obj_id === 1064) {
    echo "  deja repointe vers 1064, skip\n";
} else {
    update_post_meta(376, '_menu_item_object_id', 1064);
    update_post_meta(376, '_menu_item_object', 'page');
    update_post_meta(376, '_menu_item_type', 'post_type');
    echo "  menu item 376 repointe : object_id $current_obj_id -> 1064\n";
}

echo "\n=== ACTION 3 : Menu Cybersecurite (parent) + reparent Audits ===\n";
$menu_id = 21;
$items = wp_get_nav_menu_items($menu_id) ?: [];

// Trouve si "Cybersecurite" existe deja
$cyber_id = null;
foreach ($items as $it) {
    if ($it->title === 'Cybersécurité' || $it->title === 'Cybersecurite') {
        $cyber_id = (int) $it->ID;
        break;
    }
}
if ($cyber_id) {
    echo "  menu item Cybersecurite existe deja : $cyber_id\n";
} else {
    $cyber_id = wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title'     => 'Cybersécurité',
        'menu-item-object'    => 'page',
        'menu-item-object-id' => 985,
        'menu-item-type'      => 'post_type',
        'menu-item-status'    => 'publish',
    ]);
    echo "  cree menu item Cybersecurite : $cyber_id\n";
}

// Reparente Audit Web/Infra/Smart Contract sous Cybersecurite
$audit_pages = [997, 1000, 1002]; // audit-web, audit-infra, audit-smart-contract
foreach ($items as $it) {
    if ($it->object === 'page' && in_array((int) $it->object_id, $audit_pages, true)) {
        $current_parent = (int) get_post_meta($it->ID, '_menu_item_menu_item_parent', true);
        if ($current_parent !== $cyber_id) {
            update_post_meta($it->ID, '_menu_item_menu_item_parent', (string) $cyber_id);
            echo "  reparent {$it->title} (id {$it->ID}) sous Cybersecurite ($cyber_id)\n";
        } else {
            echo "  {$it->title} deja sous Cybersecurite, skip\n";
        }
    }
}

// Supprimer le custom item "Services" (1035) qui devient redondant
foreach ($items as $it) {
    if ($it->object === 'custom' && $it->title === 'Services' && (int) $it->ID === 1035) {
        wp_delete_post($it->ID, true);
        echo "  supprime ancien menu item custom 'Services' (id 1035)\n";
        break;
    }
}

echo "\n=== ACTION 4 : Page 471 Articles -> island blog ===\n";
$articles_post = get_post(471);
if ($articles_post) {
    $expected = '[inari_island name="blog"]';
    if (trim($articles_post->post_content) === $expected) {
        echo "  page 471 deja island blog, skip\n";
    } else {
        wp_update_post([
            'ID' => 471,
            'post_content' => $expected,
        ]);
        echo "  page 471 (Articles) -> $expected\n";
    }
} else {
    echo "  page 471 introuvable\n";
}

echo "\n=== ACTION 5 : Page 366 (ancienne homepage Kadence) -> draft ===\n";
$old_home = get_post(366);
if ($old_home) {
    if ($old_home->post_status === 'draft') {
        echo "  page 366 deja en draft, skip\n";
    } else {
        // Sauvegarde le contenu original dans meta pour traceability
        if (!get_post_meta(366, '_archive_old_homepage_content', true)) {
            update_post_meta(366, '_archive_old_homepage_content', $old_home->post_content);
        }
        wp_update_post([
            'ID' => 366,
            'post_status' => 'draft',
        ]);
        echo "  page 366 (Accueil ancienne) -> draft (contenu archivé en meta _archive_old_homepage_content)\n";
    }
} else {
    echo "  page 366 introuvable\n";
}

echo "\n=== Etat final menu ===\n";
$final = wp_get_nav_menu_items($menu_id) ?: [];
foreach ($final as $it) {
    $indent = $it->menu_item_parent != 0 ? '  └─ ' : '';
    $url = $it->object === 'page' ? get_permalink((int) $it->object_id) : ($it->url ?: '#');
    echo "  id={$it->ID} parent={$it->menu_item_parent} {$indent}{$it->title}  [{$url}]\n";
}

echo "\nOK\n";
