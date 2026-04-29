<?php
/**
 * Patch script : déplacer les sélecteurs [data-theme="bleu"] *
 * du groupe "texte noir" vers le groupe "texte blanc" dans snippet 347.
 *
 * Raison : depuis le passage de bleu cyan #00D4FF -> royal blue #0081f2,
 * le texte noir n'est plus lisible sur le fond royal blue. Le bleu doit
 * suivre le rouge (texte blanc) plutôt que l'or/vert (texte noir).
 *
 * Usage (cote staging) :
 *   ssh inaricom 'cd ~/inaricom.com/web-staging && wp eval-file /chemin/patch_347_bleu_buttons.php'
 */

$pid = 347;
$content = get_post_field('post_content', $pid);
if (!$content) {
    echo "ERROR: empty content\n";
    return;
}

// Sauvegarde
$backup_file = '/tmp/snippet-347-backup-' . date('YmdHis') . '.css';
file_put_contents($backup_file, $content);
echo "Backup: $backup_file\n";

// Extraire les lignes [data-theme="bleu"] * jusqu'a la prochaine occurrence vert
$lines = explode("\n", $content);
$start = -1;
$end = -1;
foreach ($lines as $i => $line) {
    if ($start === -1 && preg_match('/^\[data-theme="bleu"\] \.wp-block-button__link,?\s*$/', $line)) {
        $start = $i;
    }
    if ($start !== -1 && $i > $start && strpos($line, '[data-theme="vert"] .wp-block-button__link') !== false) {
        $end = $i - 1;
        break;
    }
}
if ($start === -1 || $end === -1) {
    echo "ERROR: could not locate bleu block (start=$start, end=$end)\n";
    return;
}
echo "Bleu block at lines $start..$end\n";

// Extraire les selecteurs bleu (avec leur virgule de fin)
$bleu_selectors = array_slice($lines, $start, $end - $start + 1);
echo "Selectors to move: " . count($bleu_selectors) . "\n";

// Supprimer les selecteurs bleu du groupe "texte noir"
array_splice($lines, $start, count($bleu_selectors));

// Trouver le groupe "texte blanc" : ligne contenant [data-theme="rouge"] .wp-block-button__link
$rouge_idx = -1;
foreach ($lines as $i => $line) {
    if (strpos($line, '[data-theme="rouge"] .wp-block-button__link') !== false) {
        $rouge_idx = $i;
        break;
    }
}
if ($rouge_idx === -1) {
    echo "ERROR: rouge block not found\n";
    return;
}
echo "Rouge block starts at line $rouge_idx\n";

// Inserer les selecteurs bleu juste apres le commentaire du groupe blanc
// (ils s'ajoutent avant la ligne rouge, en preservant l'ordre)
array_splice($lines, $rouge_idx, 0, $bleu_selectors);

$new_content = implode("\n", $lines);

// Sanity check
if (substr_count($new_content, '[data-theme="bleu"] .wp-block-button__link') !== 1) {
    echo "ERROR: bleu selector count wrong after move\n";
    return;
}

// Save back
$update = wp_update_post([
    'ID'           => $pid,
    'post_content' => $new_content,
]);
if (is_wp_error($update)) {
    echo "ERROR: " . $update->get_error_message() . "\n";
    return;
}
echo "Post 347 updated successfully\n";

// Regenerer le static .css avec wrap correct
$wrapped = "<!-- start Simple Custom CSS and JS -->\n<style>\n" . $new_content . "\n</style>\n<!-- end Simple Custom CSS and JS -->\n";
$file = '/home/toriispo/inaricom.com/web-staging/wp-content/uploads/custom-css-js/347.css';
$bytes = file_put_contents($file, $wrapped);
echo "Static file regenerated: $bytes bytes\n";
