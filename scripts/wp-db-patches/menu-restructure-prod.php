<?php
/**
 * Menu restructure prod — IDEMPOTENT.
 *
 * Menu Principal (ID 21) — etat cible :
 *   - Accueil
 *   - Services (custom) -> Audit Web, Audit Infra, Audit Smart Contract
 *   - Intelligence Artificielle (page accueil-ia ID 1066)
 *       └─ Boutique (page shop ID 56)
 *   - Articles (page ID 471)
 *       ├─ Actualités IA (cat 45)
 *       ├─ IA Locale (cat 39)
 *       ├─ Matériel IA (cat 40)
 *       ├─ Raspberry Pi & IA (cat 27)
 *       ├─ Tutoriels (cat 42)
 *       ├─ LLMs & Modèles (cat 43)
 *       ├─ IA Business (cat 44)
 *       ├─ Cloud & Hybride (cat 41)
 *       └─ Architecture IA (cat 56)
 *   - Contact
 *
 * Idempotent : verifie l'existence avant chaque ajout.
 */
define('WP_USE_THEMES', false);
require_once '/home/toriispo/inaricom.com/web/wp-load.php';

$menu_id = 21;
$menu_items = wp_get_nav_menu_items($menu_id) ?: [];

// Helpers
function find_item_by_title(array $items, string $title): ?int {
    foreach ($items as $it) {
        if ($it->title === $title) return (int) $it->ID;
    }
    return null;
}
function find_item_by_object(array $items, string $object, int $object_id): ?int {
    foreach ($items as $it) {
        if ($it->object === $object && (int) $it->object_id === $object_id) return (int) $it->ID;
    }
    return null;
}

echo "=== Etat actuel menu Principal (id=$menu_id) ===\n";
foreach ($menu_items as $it) {
    echo "  id=" . $it->ID . " parent=" . $it->menu_item_parent . " obj=" . $it->object . "/" . $it->object_id . " title=" . $it->title . "\n";
}

// 1. Trouver/creer "Intelligence Artificielle" (page 1066)
$ia_item_id = find_item_by_title($menu_items, 'Intelligence Artificielle');
if (!$ia_item_id) {
    $ia_item_id = wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title'     => 'Intelligence Artificielle',
        'menu-item-object'    => 'page',
        'menu-item-object-id' => 1066,
        'menu-item-type'      => 'post_type',
        'menu-item-status'    => 'publish',
    ]);
    echo "Cree IA menu item : $ia_item_id\n";
} else {
    echo "IA menu item existe deja : $ia_item_id\n";
}

// 2. Ajouter "Boutique" (page Shop ID 56) sous IA si pas deja la
$shop_item = find_item_by_object($menu_items, 'page', 56);
if (!$shop_item) {
    $new = wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title'     => 'Boutique',
        'menu-item-object'    => 'page',
        'menu-item-object-id' => 56,
        'menu-item-type'      => 'post_type',
        'menu-item-parent-id' => $ia_item_id,
        'menu-item-status'    => 'publish',
    ]);
    echo "Cree Boutique sous IA : $new\n";
} else {
    // Reparenter si necessaire
    $current_parent = (int) get_post_meta($shop_item, '_menu_item_menu_item_parent', true);
    if ($current_parent !== $ia_item_id) {
        update_post_meta($shop_item, '_menu_item_menu_item_parent', (string) $ia_item_id);
        echo "Reparente Boutique (id $shop_item) sous IA ($ia_item_id)\n";
    } else {
        echo "Boutique deja sous IA : $shop_item\n";
    }
}

// 3. Trouver/creer "Articles" (page 471)
$articles_item_id = find_item_by_title($menu_items, 'Articles');
if (!$articles_item_id) {
    $articles_item_id = wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title'     => 'Articles',
        'menu-item-object'    => 'page',
        'menu-item-object-id' => 471,
        'menu-item-type'      => 'post_type',
        'menu-item-status'    => 'publish',
    ]);
    echo "Cree Articles menu item : $articles_item_id\n";
} else {
    echo "Articles menu item existe deja : $articles_item_id\n";
}

// 4. Ajouter les 9 categories comme enfants d'Articles
$categories = [
    45 => 'Actualités IA',
    39 => 'IA Locale',
    40 => 'Matériel IA',
    27 => 'Raspberry Pi & IA',
    42 => 'Tutoriels',
    43 => 'LLMs & Modèles',
    44 => 'IA Business',
    41 => 'Cloud & Hybride',
    56 => 'Architecture IA',
];

// Refresh items list pour catch les nouveaux
$menu_items = wp_get_nav_menu_items($menu_id) ?: [];

foreach ($categories as $term_id => $title) {
    // Cherche si une categorie avec ce term_id est deja dans le menu
    $existing = null;
    foreach ($menu_items as $it) {
        if ($it->object === 'category' && (int) $it->object_id === $term_id) {
            $existing = (int) $it->ID;
            break;
        }
    }
    if ($existing) {
        // Verifie le parent
        $parent = (int) get_post_meta($existing, '_menu_item_menu_item_parent', true);
        if ($parent !== $articles_item_id) {
            update_post_meta($existing, '_menu_item_menu_item_parent', (string) $articles_item_id);
            echo "  cat $term_id ($title) reparente sous Articles\n";
        } else {
            echo "  cat $term_id ($title) deja sous Articles\n";
        }
    } else {
        $new = wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title'     => $title,
            'menu-item-object'    => 'category',
            'menu-item-object-id' => $term_id,
            'menu-item-type'      => 'taxonomy',
            'menu-item-parent-id' => $articles_item_id,
            'menu-item-status'    => 'publish',
        ]);
        echo "  cat $term_id ($title) ajoute sous Articles : $new\n";
    }
}

// 5. Verification finale
echo "\n=== Etat final menu Principal ===\n";
$final = wp_get_nav_menu_items($menu_id) ?: [];
foreach ($final as $it) {
    $indent = $it->menu_item_parent != 0 ? '  └─ ' : '';
    echo "  id=" . $it->ID . " parent=" . $it->menu_item_parent . " {$indent}" . $it->title . "\n";
}

echo "\nOK\n";
