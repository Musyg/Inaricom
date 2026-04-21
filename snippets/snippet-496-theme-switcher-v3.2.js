/**
 * INARICOM - Theme Switcher v3.2
 *
 * MAJ 2026-04-21 :
 * - Priorite PHP (ThemeMapper) au chargement : lit data-theme pose par
 *   le serveur avant tout, pas de localStorage par defaut.
 * - localStorage ne sert plus comme source de verite au load.
 * - Le switcher utilisateur ne persiste plus en localStorage par defaut
 *   (option A possible : reactiver via flag USER_PERSISTENCE).
 * - Le clic utilisateur override le theme PHP pour la session courante
 *   uniquement (session sessionStorage, pas localStorage).
 *
 * Comportement :
 * - Page IA (boutique/shop) -> PHP pose data-theme="or" -> switcher affiche or
 * - Utilisateur clique "rouge" sur cette page -> theme passe a rouge (cette session)
 * - Utilisateur navigue vers /blog/ -> PHP pose data-theme="vert" -> affiche vert
 *   (le choix "rouge" ne persiste pas entre pages, c'etait un override ponctuel)
 * - Retour sur boutique -> affiche "or" (PHP gagne)
 */
(function() {
  'use strict';

  const CONFIG = {
    storageKey: 'inaricom-theme',       // sessionStorage cle
    defaultTheme: 'rouge',
    themes: {
      rouge: { name: 'Rouge Inaricom', color: '#E31E24', rgb: '227, 30, 36' },
      or:    { name: 'Or Hermès',      color: '#FFD700', rgb: '255, 215, 0' },
      bleu:  { name: 'Bleu Tech',      color: '#00d4ff', rgb: '0, 212, 255' },
      vert:  { name: 'Vert Émeraude',  color: '#10B981', rgb: '16, 185, 129' }
    }
  };

  /**
   * Applique un theme (met a jour DOM + dots).
   * @param {string} theme - rouge/or/bleu/vert
   * @param {boolean} isUserClick - true si declenche par un clic utilisateur
   */
  function setTheme(theme, isUserClick = false) {
    if (!CONFIG.themes[theme]) theme = CONFIG.defaultTheme;

    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    // Persistance : session seulement (reset a la fermeture du navigateur)
    // et uniquement si clic utilisateur (pas au load)
    if (isUserClick) {
      try { sessionStorage.setItem(CONFIG.storageKey, theme); } catch(e) {}
    }

    document.querySelectorAll('.theme-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.theme === theme);
    });

    window.dispatchEvent(new CustomEvent('inaricom-theme-change', {
      detail: { theme, config: CONFIG.themes[theme], source: isUserClick ? 'user' : 'server' }
    }));

    console.log('[Inaricom] Thème:', CONFIG.themes[theme].name, isUserClick ? '(user)' : '(server)');
  }

  /**
   * Determine le theme au chargement.
   * PRIORITE : PHP data-theme > sessionStorage > defaut
   */
  function getInitialTheme() {
    // 1. Priorite : attribut data-theme pose par le serveur (ThemeMapper)
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    if (htmlTheme && CONFIG.themes[htmlTheme]) {
      return htmlTheme;
    }

    // 2. Fallback : sessionStorage (choix utilisateur dans cette session)
    try {
      const saved = sessionStorage.getItem(CONFIG.storageKey);
      if (saved && CONFIG.themes[saved]) return saved;
    } catch(e) {}

    // 3. Dernier recours : theme par defaut
    return CONFIG.defaultTheme;
  }

  /**
   * API publique de lecture (compat avec v3.1).
   */
  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || CONFIG.defaultTheme;
  }

  /**
   * Migration transparente : ancien localStorage inaricom-theme supprime
   * pour eviter override indesire. Execute une seule fois par visite.
   */
  function cleanupLegacyStorage() {
    try {
      if (localStorage.getItem(CONFIG.storageKey)) {
        localStorage.removeItem(CONFIG.storageKey);
        console.log('[Inaricom] localStorage legacy theme supprime, PHP prime maintenant.');
      }
    } catch(e) {}
  }

  function init() {
    cleanupLegacyStorage();

    // Applique le theme initial SANS marquer comme user click
    // (donc pas de persistance, le PHP garde la main sur chaque nouvelle page)
    const initialTheme = getInitialTheme();
    setTheme(initialTheme, false);

    // Ecouter les clics sur les theme-dots
    document.querySelectorAll('.theme-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        setTheme(dot.dataset.theme, true);  // true = clic utilisateur
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.InaricomTheme = { set: setTheme, get: getTheme, config: CONFIG };
})();
