<?php
/**
 * Patch script : remplacer les references cyan #00d4ff hardcodees dans
 * snippet 684 "Pages Legales CSS" par le royal blue #0081f2.
 *
 * Raison : depuis le passage de la palette bleue cyan -> royal blue, 18
 * occurrences hardcodees de #00d4ff / rgba(0, 212, 255, X) restaient dans
 * snippet 684, principalement dans le bloc [data-theme="bleu"] .legal-*
 * mais aussi dans la regle de base .legal-info.
 *
 * Visible sur les 7 pages footer en theme bleu : refund-policy, privacy,
 * mentions-legales, cookie-policy, terms-of-service, acceptable-use,
 * et le bouton "Retour a l'accueil" partout cyan.
 *
 * Substitutions :
 *   #00d4ff             -> #0081f2
 *   #00D4FF             -> #0081f2
 *   rgba(0, 212, 255    -> rgba(0, 129, 242
 *
 * Le bloc [data-theme="bleu"] etant deja scope, on peut utiliser des hex
 * directs au lieu de var(--inari-red). Plus simple, lecture immediate.
 *
 * Usage:
 *   ssh inaricom 'cd ~/inaricom.com/web-staging && wp eval-file /tmp/patch_684_legal_pages_cyan.php'
 */

$pid = 684;
$content = get_post_field('post_content', $pid);
if (!$content) {
    echo "ERROR: empty content for post $pid\n";
    return;
}

// Backup
$backup_file = '/tmp/snippet-684-backup-' . date('YmdHis') . '.css';
file_put_contents($backup_file, $content);
echo "Backup: $backup_file\n";

// Count before
$before_hex = preg_match_all('/#00d4ff/i', $content);
$before_rgba = preg_match_all('/rgba\(0,\s*212,\s*255/', $content);
echo "Before patch: $before_hex hex + $before_rgba rgba cyan refs\n";

// Substitutions (idempotent : si deja royal blue, no-op)
$new_content = str_replace(
    ['#00d4ff', '#00D4FF'],
    ['#0081f2', '#0081f2'],
    $content
);
$new_content = preg_replace(
    '/rgba\(\s*0\s*,\s*212\s*,\s*255\s*,/',
    'rgba(0, 129, 242,',
    $new_content
);

// Verify
$after_hex = preg_match_all('/#00d4ff/i', $new_content);
$after_rgba = preg_match_all('/rgba\(0,\s*212,\s*255/', $new_content);
echo "After patch:  $after_hex hex + $after_rgba rgba cyan refs (should be 0)\n";

if ($after_hex > 0 || $after_rgba > 0) {
    echo "WARN: residual cyan refs detected. Manual review needed.\n";
}

// Update post
$update = wp_update_post([
    'ID'           => $pid,
    'post_content' => $new_content,
]);
if (is_wp_error($update)) {
    echo "ERROR: " . $update->get_error_message() . "\n";
    return;
}
echo "Post 684 updated\n";

// Regenerate static .css with proper wrapping
$wrapped = "<!-- start Simple Custom CSS and JS -->\n<style>\n" . $new_content . "\n</style>\n<!-- end Simple Custom CSS and JS -->\n";
$upload_dir = wp_upload_dir();
$file = $upload_dir['basedir'] . '/custom-css-js/684.css';
$bytes = file_put_contents($file, $wrapped);
echo "Static file regenerated: $file ($bytes bytes)\n";
