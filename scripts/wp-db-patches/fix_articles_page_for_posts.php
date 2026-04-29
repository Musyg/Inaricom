<?php
/**
 * Fix routing /articles/ : retire page_for_posts qui forcait l archive
 * blog WP auto et ignorait le shortcode [inari_island name="blog"].
 *
 * PROBLEME (decouvert 2026-04-29 PM par Gilles) :
 *
 * Sur prod, WP option `page_for_posts` = 471 (la page Articles).
 * Quand `page_for_posts` est defini, WP traite cette page comme
 * l ARCHIVE BLOG AUTO : il IGNORE le post_content (et donc le
 * shortcode [inari_island]) et affiche le template `home.php`
 * (ou `index.php` fallback) avec le loop des posts standards.
 *
 * Resultat visible : le menu Articles -> /articles/ -> WP archive
 * blog par defaut (cards Kadence stylees), au lieu du BlogIsland
 * React (BlogHero "Le savoir, en clair" + sections).
 *
 * Sur staging, page_for_posts = 0, donc /articles/ est rendu comme
 * page normale et le shortcode fait son job.
 *
 * SOLUTION :
 *   wp option update page_for_posts 0
 *
 * Effet : /articles/ devient une page singulaire normale, le shortcode
 * [inari_island name="blog"] genere le mount point, et le React island
 * BlogIsland hydrate dessus avec son BlogHero, FeaturedSection, etc.
 *
 * Idempotent.
 */

define('WP_USE_THEMES', false);
require_once '/home/toriispo/inaricom.com/web/wp-load.php';

$current = (int) get_option('page_for_posts');
echo "page_for_posts actuel : $current\n";

if ($current === 0) {
    echo "deja a 0, rien a faire\n";
    exit(0);
}

// Backup pour traceability
update_option('_pre_fix_articles_page_for_posts_2026_04_29', $current);

update_option('page_for_posts', 0);
echo "page_for_posts mis a 0 (etait $current)\n";

wp_cache_flush();
flush_rewrite_rules();
echo "cache + rewrite flush OK\n";
echo "OK\n";
