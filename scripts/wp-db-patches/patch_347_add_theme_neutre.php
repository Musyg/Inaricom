<?php
/**
 * Patch surgical : ajouter les blocs theme-neutre manquants au snippet 347 prod.
 *
 * Origine : le snippet 347 prod n'a jamais ete sync avec staging apres la
 * migration React islands (avril 2026). Resultat : la homepage (theme=neutre)
 * n'a aucune regle CSS adaptee :
 *  - Pas de swap logo neutre -> logo rouge default rendu
 *  - Pas de halo blanc -> logo plat sur fond noir
 *  - Pas de regles boutons body.theme-neutre -> boutons transparent
 *
 * Strategie : append en fin du snippet UNIQUEMENT les blocs neutre extraits
 * du staging (sans toucher au reste du fichier prod, pour preserver les
 * regles custom des pages inline-html audit-web/infra/smart-contract).
 *
 * Idempotent : verifie l'absence de "data-theme=\"neutre\"" avant d'append.
 *
 * Usage : ssh inaricom + scp + php85 /tmp/patch_347_add_theme_neutre.php
 */

define('WP_USE_THEMES', false);
require_once '/home/toriispo/inaricom.com/web/wp-load.php';

$post = get_post(347);
if (!$post) { echo "FAIL: post 347 introuvable"; exit(1); }

$css = $post->post_content;

// Idempotence : si le bloc theme-neutre existe deja, skip
if (strpos($css, '[data-theme="neutre"]') !== false) {
    echo "SKIP: bloc [data-theme=\"neutre\"] deja present (idempotent)\n";
    exit(0);
}

// Bloc à append (extrait du staging, URLs adaptees pour prod inaricom.com)
$append = <<<'CSS'


/* ============================================================
   60. THEME NEUTRE — Logo swap + srcset hack (Phase 2 React islands)
   ============================================================
   Ajoute le 2026-04-29 par patch_347_add_theme_neutre.php pour
   reparer la homepage (theme=neutre) qui rendait le logo rouge default.
   ============================================================ */

[data-theme="neutre"] .site-logo img,
[data-theme="neutre"] .custom-logo {
  content: url('https://inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-17.png');
  filter: drop-shadow(0 0 3px rgba(255,255,255,0.55));
}

/* Hack srcset : masquer l'<img> natif pour tous les themes non-rouge */
.theme-or img.custom-logo,
.theme-bleu img.custom-logo,
.theme-vert img.custom-logo,
.theme-neutre img.custom-logo {
  opacity: 0.05;
}

/* Re-afficher le bon logo en background-image sur le parent .brand */
.theme-or .site-branding .brand.has-logo-image {
  background-image: url('https://inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-16.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: left center;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.6));
}

.theme-bleu .site-branding .brand.has-logo-image {
  background-image: url('https://inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-13.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: left center;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.6));
}

.theme-vert .site-branding .brand.has-logo-image {
  background-image: url('https://inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-15.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: left center;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.6));
}

.theme-neutre .site-branding .brand.has-logo-image {
  background-image: url('https://inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-17.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: drop-shadow(0 0 3px rgba(255,255,255,0.55));
}

/* Theme rouge (defaut) : garder le logo natif visible avec halo */
.theme-rouge .site-branding .brand.has-logo-image img.custom-logo {
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.6));
}

/* ============================================================
   63. THEME NEUTRE — Homepage tokens + boutons
   ============================================================ */

body.theme-neutre {
  /* Accent principal -> BLANC */
  --inari-red: #FFFFFF;
  --inari-red-rgb: 255, 255, 255;
  --inari-red-dark: #E0E0E0;
  --inari-red-light: #FFFFFF;

  /* Alias --i-* (compat fiches produits) */
  --i-red: #FFFFFF;
  --i-red-rgb: 255, 255, 255;
  --i-red-dark: #E0E0E0;
  --i-red-light: #FFFFFF;

  /* Halos et effets lumineux : teinte creme legere au lieu de rouge vif */
  --glow-color: rgba(239, 235, 232, 0.15);
  --glow-soft: rgba(239, 235, 232, 0.08);
  --glow-subtle: rgba(239, 235, 232, 0.04);

  /* Bordures accentuees : blanc a opacite faible */
  --border-accent: rgba(255, 255, 255, 0.16);
  --border-accent-hover: rgba(255, 255, 255, 0.28);

  /* Glassmorphism neutre (sans teinte chaude/froide) */
  --glass-bg: rgba(18, 18, 22, 0.6);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-accent: rgba(255, 255, 255, 0.18);

  /* Gradient principal neutre */
  --inari-gradient: linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, rgba(239, 235, 232, 0.04) 100%);
}

/* Boutons primary sur theme-neutre : fond blanc, texte noir */
body.theme-neutre .wp-block-button__link,
body.theme-neutre .kb-button,
body.theme-neutre button[type="submit"]:not(.theme-pilier-action),
body.theme-neutre input[type="submit"]:not(.theme-pilier-action),
body.theme-neutre .btn-primary:not(.theme-pilier-action),
body.theme-neutre .btn-primary-large:not(.theme-pilier-action) {
  background: #FFFFFF !important;
  color: #0A0A0F !important;
}

body.theme-neutre .wp-block-button__link:hover,
body.theme-neutre .kb-button:hover,
body.theme-neutre .btn-primary:hover:not(.theme-pilier-action),
body.theme-neutre .btn-primary-large:hover:not(.theme-pilier-action) {
  background: #EFEBE8 !important;
  color: #0A0A0F !important;
}

/* Menu principal : liens sans accent colore sur theme-neutre */
body.theme-neutre .main-navigation .primary-menu-container > ul > li.menu-item > a:hover,
body.theme-neutre .main-navigation .primary-menu-container > ul > li.menu-item.current-menu-item > a {
  color: #FFFFFF !important;
}

/* FIN PATCH 2026-04-29 (theme-neutre) */
CSS;

$css_new = $css . $append;

// Update DB
$res = wp_update_post(['ID' => 347, 'post_content' => $css_new], true);
if (is_wp_error($res)) { echo "FAIL DB: " . $res->get_error_message(); exit(1); }
echo "DB update OK (post {$res})\n";

// Regen static cache
$wrapped = "<!-- start Simple Custom CSS and JS -->\n<style>\n" . $css_new . "\n</style>\n<!-- end Simple Custom CSS and JS -->\n";
$cache_path = WP_CONTENT_DIR . '/uploads/custom-css-js/347.css';
$bytes = file_put_contents($cache_path, $wrapped);
if ($bytes === false) { echo "FAIL: cannot write cache file"; exit(1); }
echo "Static cache regenere ({$bytes} bytes)\n";

echo "OK\n";
