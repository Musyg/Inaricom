<?php
/**
 * NUKE radical du snippet 347 : remplace par un MINIMAL qui contient
 * UNIQUEMENT les CSS variables des 5 themes + box-sizing + boutons neutre.
 *
 * Justification : le snippet 347 prod faisait 109 KB et contenait ~4000
 * lignes de regles CSS legacy qui forcaient des couleurs (`h1 span { color
 * #E31E24 }`, `.btn-primary { ... }`, etc.) qui cascadaient par dessus
 * le styling propre des React islands. Resultat : titres tout en rouge
 * sur cybersec, tout en or sur IA, tout en bleu sur contact.
 *
 * Solution : ne garder que les tokens CSS (--inari-red, --glass-bg, etc.)
 * dont les React islands ont besoin via `var(--inari-red)`. Les regles
 * de couleur des H1/H2/etc. sont dans le bundle React lui-meme
 * (globals-jdp57FCy.css), pas besoin d'overrides legacy.
 *
 * Backup integral dans meta _pre_nuke_2026_04_29.
 *
 * Idempotent.
 */

define('WP_USE_THEMES', false);
require_once '/home/toriispo/inaricom.com/web/wp-load.php';

$post = get_post(347);
if (!$post) { echo "FAIL: post 347 introuvable"; exit(1); }

$current = $post->post_content;
$current_size = strlen($current);

// Idempotence : detecte si deja nuke (marker present)
$marker_already_nuked = '/* === SNIPPET 347 v2026-04-29 — MINIMAL TOKENS ONLY === */';
if (strpos($current, $marker_already_nuked) !== false) {
    echo "SKIP: deja nuke (idempotent)\n";
    exit(0);
}

// Backup integral
if (!get_post_meta(347, '_pre_nuke_2026_04_29', true)) {
    update_post_meta(347, '_pre_nuke_2026_04_29', $current);
    echo "Backup contenu original dans meta _pre_nuke_2026_04_29 (" . $current_size . " bytes)\n";
}

// Le NOUVEAU contenu : tokens uniquement, pas de regles cosmetiques
$new = <<<'CSS'
/* === SNIPPET 347 v2026-04-29 — MINIMAL TOKENS ONLY === */
/*
 * Ce snippet ne contient QUE les CSS custom properties dont les React
 * islands ont besoin via var(--inari-red). Les regles de styling
 * (h1, btn-primary, hero-section, etc.) sont dans le bundle React
 * (globals-jdp57FCy.css) et dans les composants island.
 *
 * Backup du contenu legacy (~109 KB) : meta _pre_nuke_2026_04_29 sur post 347.
 * Logo swap : gere par LogoSwapper.php (PHP filter wp_get_attachment_image_attributes).
 */

/* ===========================================
   1. TOKENS — THEME PAR DEFAUT (ROUGE)
   =========================================== */
:root {
  /* === Couleurs theme (changent selon [data-theme]) === */
  --inari-red:        #E31E24;
  --inari-red-dark:   #B8161B;
  --inari-red-light:  #FF3A40;
  --inari-red-rgb:    227, 30, 36;

  /* Glow & effets */
  --glow-color:   rgba(var(--inari-red-rgb), 0.5);
  --glow-soft:    rgba(var(--inari-red-rgb), 0.25);
  --glow-subtle:  rgba(var(--inari-red-rgb), 0.1);

  /* Bordures accent */
  --border-accent:        rgba(var(--inari-red-rgb), 0.3);
  --border-accent-hover:  rgba(var(--inari-red-rgb), 0.6);

  /* === Couleurs fixes (ne changent pas) === */
  --inari-black:          #0A0A0F;
  --inari-black-alt:      #12121A;
  --inari-black-light:    #1A1A24;
  --inari-black-lighter:  #242430;

  --inari-white:        #FFFFFF;
  --inari-text:         #F0F0F5;
  --inari-text-soft:    #B6B0B4;
  --inari-text-muted:   #8A8A9A;

  --inari-border:  #2A2A35;
  --inari-gradient: linear-gradient(135deg, var(--inari-red) 0%, var(--inari-red-dark) 100%);

  /* Rayons & ombres */
  --radius-sm:  6px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-xl:  22px;
  --radius-full: 999px;
  --shadow-soft:    0 18px 40px rgba(0, 0, 0, 0.55);
  --shadow-subtle:  0 10px 26px rgba(0, 0, 0, 0.35);

  /* Glassmorphism */
  --glass-bg:             rgba(18, 18, 22, 0.6);
  --glass-bg-light:       rgba(255, 255, 255, 0.03);
  --glass-border:         rgba(255, 255, 255, 0.08);
  --glass-border-accent:  rgba(var(--inari-red-rgb), 0.2);
  --glass-blur:           16px;
  --glass-blur-heavy:     24px;

  /* Semantic UI (jamais le rouge marque pour les erreurs) */
  --semantic-error:    #F59E0B;
  --semantic-success:  #10B981;
  --semantic-warning:  #F59E0B;
  --semantic-info:     #0081f2;
}

/* ===========================================
   2. THEME OR (IA)
   =========================================== */
[data-theme="or"],
.theme-or {
  --inari-red:        #FFD700;
  --inari-red-dark:   #B8860B;
  --inari-red-light:  #FFE55C;
  --inari-red-rgb:    255, 215, 0;

  --glow-color:   rgba(255, 215, 0, 0.5);
  --glow-soft:    rgba(255, 215, 0, 0.25);
  --glow-subtle:  rgba(255, 215, 0, 0.1);

  --border-accent:        rgba(255, 215, 0, 0.3);
  --border-accent-hover:  rgba(255, 215, 0, 0.6);

  --glass-bg:             rgba(22, 20, 18, 0.6);
  --glass-border-accent:  rgba(255, 215, 0, 0.2);

  --inari-gradient: linear-gradient(135deg, #FFD700 0%, #B8860B 100%);
}

/* ===========================================
   3. THEME BLEU (institutionnel)
   =========================================== */
[data-theme="bleu"],
.theme-bleu {
  --inari-red:        #0081f2;
  --inari-red-dark:   #1b61a6;
  --inari-red-light:  #1a93fe;
  --inari-red-rgb:    0, 129, 242;

  --glow-color:   rgba(0, 129, 242, 0.5);
  --glow-soft:    rgba(0, 129, 242, 0.25);
  --glow-subtle:  rgba(0, 129, 242, 0.1);

  --border-accent:        rgba(0, 129, 242, 0.3);
  --border-accent-hover:  rgba(0, 129, 242, 0.6);

  --glass-bg:             rgba(12, 16, 24, 0.6);
  --glass-border-accent:  rgba(0, 129, 242, 0.2);

  --inari-gradient: linear-gradient(135deg, #0081f2 0%, #1b61a6 100%);
}

/* ===========================================
   4. THEME VERT (blog / ressources)
   =========================================== */
[data-theme="vert"],
.theme-vert {
  --inari-red:        #10B981;
  --inari-red-dark:   #059669;
  --inari-red-light:  #34D399;
  --inari-red-rgb:    16, 185, 129;

  --glow-color:   rgba(16, 185, 129, 0.5);
  --glow-soft:    rgba(16, 185, 129, 0.25);
  --glow-subtle:  rgba(16, 185, 129, 0.1);

  --border-accent:        rgba(16, 185, 129, 0.3);
  --border-accent-hover:  rgba(16, 185, 129, 0.6);

  --glass-bg:             rgba(12, 20, 18, 0.6);
  --glass-border-accent:  rgba(16, 185, 129, 0.2);

  --inari-gradient: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

/* ===========================================
   5. THEME NEUTRE (homepage)
   ===========================================
   Pose par ThemeMapper sur is_front_page() : body class theme-neutre + html data-theme="neutre".
*/
[data-theme="neutre"],
body.theme-neutre {
  --inari-red:        #FFFFFF;
  --inari-red-dark:   #E0E0E0;
  --inari-red-light:  #FFFFFF;
  --inari-red-rgb:    255, 255, 255;

  --glow-color:   rgba(239, 235, 232, 0.15);
  --glow-soft:    rgba(239, 235, 232, 0.08);
  --glow-subtle:  rgba(239, 235, 232, 0.04);

  --border-accent:        rgba(255, 255, 255, 0.16);
  --border-accent-hover:  rgba(255, 255, 255, 0.28);

  --glass-bg:             rgba(18, 18, 22, 0.6);
  --glass-border-accent:  rgba(255, 255, 255, 0.18);

  --inari-gradient: linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, rgba(239, 235, 232, 0.04) 100%);
}

/* ===========================================
   6. RESET MINIMAL
   =========================================== */
*, *::before, *::after { box-sizing: border-box; }

/* ===========================================
   7. BOUTONS THEME-NEUTRE (homepage)
   =========================================== */
/* Sur la homepage uniquement, les boutons primary apparaissent en blanc
 * (puisque --inari-red = #FFFFFF) avec texte noir. */
body.theme-neutre .wp-block-button__link,
body.theme-neutre .kb-button:not(.kb-btn-outline),
body.theme-neutre .btn-primary:not(.theme-pilier-action),
body.theme-neutre .btn-primary-large:not(.theme-pilier-action) {
  background: #FFFFFF !important;
  color: #0A0A0F !important;
}
body.theme-neutre .wp-block-button__link:hover,
body.theme-neutre .kb-button:not(.kb-btn-outline):hover,
body.theme-neutre .btn-primary:hover:not(.theme-pilier-action),
body.theme-neutre .btn-primary-large:hover:not(.theme-pilier-action) {
  background: #EFEBE8 !important;
  color: #0A0A0F !important;
}

/* === FIN snippet 347 minimal v2026-04-29 === */
CSS;

wp_update_post(['ID' => 347, 'post_content' => $new]);

// Regen static cache
$wrapped = "<!-- start Simple Custom CSS and JS -->\n<style>\n" . $new . "\n</style>\n<!-- end Simple Custom CSS and JS -->\n";
$cache_path = WP_CONTENT_DIR . '/uploads/custom-css-js/347.css';
$bytes = file_put_contents($cache_path, $wrapped);

echo "DB update OK\n";
echo "Snippet 347 : $current_size bytes -> " . strlen($new) . " bytes (-" . round(($current_size - strlen($new)) * 100 / $current_size, 1) . "%)\n";
echo "Static cache regenere : $bytes bytes\n";

wp_cache_flush();
echo "Cache flush OK\n";
echo "OK\n";
