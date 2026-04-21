/**
 * INARICOM - Theme Switcher v3.3
 *
 * MAJ 2026-04-21 (fix switcher rouge bloqué) :
 * - Le JS doit AUSSI gerer les classes .theme-rouge/or/bleu/vert sur <body>,
 *   pas juste l'attribut data-theme. Le CSS (sections 60 du 347) utilise
 *   les classes comme selecteurs primaires pour les couleurs accent.
 * - Sans ce retrait/ajout de classe, cliquer "rouge" sur une page
 *   ThemeMapper="or" conserve la classe .theme-or sur le body et les
 *   couleurs or dominaient.
 *
 * v3.2 heritee :
 * - Priorite PHP (ThemeMapper) au chargement : lit data-theme pose par
 *   le serveur avant tout, pas de localStorage par defaut.
 * - Le clic utilisateur override le theme PHP pour la session courante
 *   uniquement (sessionStorage, pas localStorage).
 */
(function() {
  'use strict';

  const CONFIG = {
    storageKey: 'inaricom-theme',
    defaultTheme: 'rouge',
    themeClasses: ['theme-rouge', 'theme-or', 'theme-bleu', 'theme-vert'],
    themes: {
      rouge: { name: 'Rouge Inaricom', color: '#E31E24', rgb: '227, 30, 36' },
      or:    { name: 'Or Hermès',      color: '#FFD700', rgb: '255, 215, 0' },
      bleu:  { name: 'Bleu Tech',      color: '#00d4ff', rgb: '0, 212, 255' },
      vert:  { name: 'Vert Émeraude',  color: '#10B981', rgb: '16, 185, 129' }
    }
  };

  /**
   * Applique un theme au DOM : attribut data-theme + classe .theme-* sur body.
   * @param {string} theme - rouge/or/bleu/vert
   * @param {boolean} isUserClick - true si declenche par un clic utilisateur
   */
  function setTheme(theme, isUserClick = false) {
    if (!CONFIG.themes[theme]) theme = CONFIG.defaultTheme;

    // 1. Attribut data-theme sur html et body
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    // 2. Gestion des classes .theme-* sur body (CRITIQUE : le CSS utilise
    //    les classes comme selecteurs primaires pour les couleurs accent)
    CONFIG.themeClasses.forEach(cls => {
      document.body.classList.remove(cls);
    });
    document.body.classList.add('theme-' + theme);

    // 3. Persistance : session seulement si clic utilisateur
    if (isUserClick) {
      try { sessionStorage.setItem(CONFIG.storageKey, theme); } catch(e) {}
    }

    // 4. Maj des dots actifs
    document.querySelectorAll('.theme-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.theme === theme);
    });

    // 5. Evenement custom pour autres scripts (fox canvas, etc.)
    window.dispatchEvent(new CustomEvent('inaricom-theme-change', {
      detail: { theme, config: CONFIG.themes[theme], source: isUserClick ? 'user' : 'server' }
    }));

    console.log('[Inaricom] Thème:', CONFIG.themes[theme].name, isUserClick ? '(user)' : '(server)');
  }

  /**
   * Determine le theme initial au chargement.
   * PRIORITE : classe body .theme-* (PHP) > data-theme HTML > sessionStorage > defaut
   */
  function getInitialTheme() {
    // 1. Classe .theme-* sur le body (posee par ThemeMapper PHP via body_class)
    for (const cls of CONFIG.themeClasses) {
      if (document.body.classList.contains(cls)) {
        return cls.replace('theme-', '');
      }
    }

    // 2. Attribut data-theme sur html
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    if (htmlTheme && CONFIG.themes[htmlTheme]) {
      return htmlTheme;
    }

    // 3. sessionStorage (choix utilisateur dans cette session)
    try {
      const saved = sessionStorage.getItem(CONFIG.storageKey);
      if (saved && CONFIG.themes[saved]) return saved;
    } catch(e) {}

    // 4. Defaut
    return CONFIG.defaultTheme;
  }

  /**
   * API publique de lecture (compat v3.1).
   */
  function getTheme() {
    // Lit d'abord la classe body (source de verite), fallback data-theme
    for (const cls of CONFIG.themeClasses) {
      if (document.body.classList.contains(cls)) {
        return cls.replace('theme-', '');
      }
    }
    return document.documentElement.getAttribute('data-theme') || CONFIG.defaultTheme;
  }

  /**
   * Nettoyage : supprime l'ancien localStorage pour eviter override indesire.
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

    const initialTheme = getInitialTheme();
    setTheme(initialTheme, false);  // false = pas un clic, pas de persistance

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
