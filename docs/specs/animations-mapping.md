# MAPPING animations → 5 thèmes Inaricom

> Mapping des 13 animations du dossier `Animations/` vers les 5 thèmes du site + éléments cinétiques réutilisables.
> Pour chaque animation : **quelles couleurs remplacer** et **par quelle variable Inari**.
>
> **RÈGLE ABSOLUE** : toutes les couleurs hardcodées (hex, rgb, hsl, palette Three.js) doivent être remplacées par `var(--inari-red)` et dérivées. Palette verrouillée, voir `.claude/rules/palette-locked.md`.
>
> Dernière MAJ : 25 avril 2026 (sync avec commits Phase 2.0).

---

## ✅ ÉTAT RÉEL D'IMPLÉMENTATION

**Les 5 backgrounds sont commités** dans `react-islands/src/components/backgrounds/`. Le code prime sur ce mapping qui documente l'intention de portage initiale.

| Thème | Composant commité | Source d'inspiration originale | Statut |
|---|---|---|---|
| 🔴 rouge | `MatrixRainRed.tsx` | `Animations/Run Matrix Text/` | ✅ aligné |
| 🟡 or | `ParticleNeonGold.tsx` | `Animations/Particle neon/` | ✅ aligné (multi-centres ajoutés) |
| 🟢 vert | `NeuralNetworkGreen.tsx` | `Animations/Ineractive neural network/` | ✅ aligné (2 étages desktop/mobile, sans UnrealBloomPass) |
| ⚪ neutre | `MeshGradientNeutral.tsx` v3 | _aucune source_ — créé from scratch | ✅ **concept changé** : prisme 5 halos au lieu de Particles |
| 🔵 bleu | `BlueprintGridBlue.tsx` v2.4 | _aucune source_ — créé from scratch | ✅ **créé from scratch** : L-shape routing |

---

## Palette de référence (à appliquer selon le thème)

| Thème | Accent | Dark | Light | RGB |
|-------|--------|------|-------|-----|
| 🔴 **rouge** (default, cybersec) | `#E31E24` | `#B8161B` | `#FF3A40` | `227, 30, 36` |
| 🟡 **or** (IA) | `#FFD700` | `#B8860B` | `#FFE55C` | `255, 215, 0` |
| 🟢 **vert** (blog) | `#10B981` | `#059669` | `#34D399` | `16, 185, 129` |
| 🔵 **bleu** (institutionnel) | `#00D4FF` | `#00A8CC` | `#4DE8FF` | `0, 212, 255` |
| ⚪ **neutre/argent** (homepage) | `#FFFFFF` | `#E0E0E0` | `#FFFFFF` | `255, 255, 255` |

**Principe de portage** : le code source garde ses **classes, structure, logique**. Seules les couleurs bougent, via `var(--inari-red)` (jamais de hex en dur), et le code doit réagir au changement de `[data-theme]` (les CSS custom properties Inari font déjà le taf).

---

## BACKGROUNDS PAR SECTION (5 thèmes)

### 🔴 THÈME ROUGE — Cybersec / Red Team / default

**Choix final : `Run Matrix Text`** (Canvas 2D, caractères qui défilent verticalement, authentique)

- Fichier : `Animations/Run Matrix Text/js.txt`
- Ligne à changer : `ctx.fillStyle = '#0f0';`
- Remplacer par : lecture dynamique de `var(--inari-red)` :
  ```js
  const red = getComputedStyle(document.documentElement).getPropertyValue('--inari-red').trim();
  ctx.fillStyle = red;
  ```
- Police `'10px Georgia'` → à remplacer par `'10px Geist Mono, monospace'` (Geist Mono self-hosted, voir CLAUDE.md typographie)
- Lib : Canvas 2D vanilla (~40 lignes, ultra léger)
- **Réagir au changement de `[data-theme]`** : MutationObserver sur `document.documentElement` attribute `data-theme` → relire la variable computed et appliquer

`Matrix rain` (CSS, gouttes dégringolantes) = **non retenu** pour backgrounds. À garder pour usage décoratif éventuel (loader, transition courte), pas pour fond de section permanent.

---

### 🟡 THÈME OR — IA (services + hardware + tutos)

**Choix final : `Particle neon`** (Canvas 2D, lignes hexagonales géométriques avec sparks — évoque circuits / nodes IA)

- Fichier : `Animations/Particle neon/js.txt`
- Ligne à changer : `color: 'hsl(hue,100%,light%)'` + `opts.hueChange: .1`
- Remplacer par : clamp sur la teinte du thème or, plus de cycle automatique
  ```js
  // Au lieu du cycle hsl(hue, ...), lire --inari-red et l'utiliser :
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--inari-red').trim();
  // utiliser accent comme base et varier seulement light (50±10)
  ```
- Supprimer `hueChange` (plus de cycle chromatique)
- Lib : Canvas 2D vanilla (~90 lignes)

---

### 🟢 THÈME VERT — Blog / Ressources

**Choix final : `Ineractive neural network`** (Three.js + UnrealBloomPass)

- Fichier : `Animations/Ineractive neural network/html.txt` (tout inline)
- ⚠️ **Utilise UnrealBloomPass Three.js** → explicitement exclu mobile dans CLAUDE.md (anti-pattern: "Heavy WebGL 3D au hero mobile sans conditional")
- **Desktop only**, fallback SVG/Canvas 2D sur mobile (détection `window.innerWidth < 1024` ou `navigator.userAgent`)
- Palettes à remplacer (section `colorPalettes`, 4 arrays de 5 couleurs) : garder UN seul array basé sur `var(--inari-red)` du thème actif
  ```js
  // Lire la variable computed + dériver via THREE.Color offsetHSL
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--inari-red').trim();
  const base = new THREE.Color(accent);
  const palette = [
    base.clone(),
    base.clone().offsetHSL(0, 0, -0.1),  // dark
    base.clone().offsetHSL(0, 0, 0.1),   // light
    base.clone().offsetHSL(0.02, 0, 0.05),
    base.clone().offsetHSL(-0.02, 0, 0.05),
  ];
  ```
- Supprimer le sélecteur de thème dans l'UI (le thème vient du site, pas d'un picker interne)
- Supprimer les contrôles `formation`, `pause`, `reset cam` (on veut un BG passif, pas une démo interactive)

---

### 🔵 THÈME BLEU — Institutionnel (about, contact, légal)

**Choix final implémenté : `BlueprintGridBlue.tsx` v2.4 "L-shape routing 1px"** (Canvas 2D vanilla, créé from scratch, aucune source dans `Animations/`)

- Fichier code : `react-islands/src/components/backgrounds/BlueprintGridBlue.tsx`
- Concept : grille blueprint statique fine (1px) + nœuds aux intersections + petits packets qui voyagent en **L** sur deux segments orthogonaux (A → B → C). Seul le point se déplace, avec une courte traînée qui tourne au coude B
- Couleur : `var(--inari-red)` (vaut `#00D4FF` en bleu)
- Contraintes appliquées : `prefers-reduced-motion` (1 frame statique), pause off-screen, MutationObserver couleur live, DPR cap 2

**Note historique** : la version initiale envisagée (grille respirante + pulse horizontal) n'a pas été retenue. Le L-shape routing donne un narratif plus clair "data qui chemine dans la structure".

---

### ⚪ THÈME NEUTRE / ARGENT — Homepage

**Choix final implémenté : `MeshGradientNeutral.tsx` v3 "prisme homepage"** (Canvas 2D vanilla, créé from scratch — aucune source dans `Animations/`)

- Fichier code : `react-islands/src/components/backgrounds/MeshGradientNeutral.tsx`
- Concept : 5 orbes radiaux ultra flous, stackés. **4 halos périphériques aux 4 coins** (un par pilier : top-left bleu institutionnel, top-right rouge cybersec, bottom-left or IA, bottom-right vert blog) + **1 halo argent dominant au centre** (couvre la zone fox v29). Ordre de dessin : périphériques d'abord, centre en dernier (gagne visuellement)
- Aucune particule, aucun bord net, aucune ligne. Atmosphère prismatique imperceptible en regardant fixement, mais visible sur 3 captures écartées de 5s
- Opacités calibrées V-lambda (sensibilité rétinienne) : bleu/vert remontés, rouge/or baissés, centre argent dominant
- Parallaxe souris légère, skip sur touch device. Canvas downscale 50% (gradients flous, retina inutile)
- Couleur centre via `var(--inari-red)` (= `#FFFFFF` en neutre), couleurs piliers via `--accent-rouge`, `--accent-or`, `--accent-vert`, `--accent-bleu` (fixes)

**Note historique** : `Animations/Particles/` (particles.js, particules + lignes reliées) avait été envisagé. Pivot vers le prisme parce qu'il annonce les 4 piliers + zone fox plus subtilement et atmosphériquement qu'une constellation à particules.

---

## ÉLÉMENTS CINÉTIQUES RÉUTILISABLES (pas backgrounds)

### 🦊 Fox animation v29 — hero homepage

**Source d'inspiration : `interractive particle logo`** — particules qui convergent pour dessiner la silhouette du logo renard, explosent/se reforment à l'interaction.

- **Respecte la contrainte de silhouette** : la tête triangulaire du logo reste identique (c'est la CIBLE des particules)
- **Portage** : Canvas 2D vanilla OU OGL (voir CLAUDE.md : "migration Canvas 2D v28 → OGL + Polyline + glow additif HDR"), remplace v28 actuelle

**Étapes**
1. Lire pixels de `fox-animation/Fox.svg` (rasterisé via canvas temporaire)
2. Générer N particules (600-1200 desktop, 300-400 mobile) qui convergent vers les pixels non-transparents
3. Animation idle : légère respiration des particules autour de leur position cible
4. Interaction hover/click : explosion des particules puis reformation
5. Couleur : `var(--inari-red)` (changera selon le thème actif)
6. Glow additif HDR pour effet premium (cf. CLAUDE.md spec fox v29)

**Ce qu'on PREND** du code source : la mécanique image→particules, le reset au clic
**Ce qu'on LAISSE** : ParticleSlider lib tierce (CDN S3 US, viole nLPD), dat.GUI, les liens Dribbble/Twitter
**Ce qu'on AJOUTE** : glow additif HDR, binding `var(--inari-red)`, fallback SVG statique mobile

---

### 🌀 Cyberspace portal — transitions de page + présentations premium

**Source : `Animations/cyberspace portal/`**

Tunnel 3D Three.js narratif avec caméra qui vole le long d'une CatmullRomCurve3, cartes-portails cliquables en bout de tunnel, sprites de code en décor, lumières qui se déplacent.

**Usages prévus pour Inaricom**

1. **Transition entre homepage et page services cybersec** — "Enter the Red Zone" → l'utilisateur clique sur le CTA "Commander un audit", le portail s'active, caméra vole dans le tunnel, arrive sur la page services
2. **Hero de présentation** d'une page services enterprise / offre premium — le visiteur arrive dans un tunnel narratif qui mène à la proposition de valeur
3. **Écran d'intro** pour lancement de produit / landing page d'un audit spécialisé
4. **Transition cliquable** entre grandes sections de la homepage (pilier → pilier)

**Adaptations à faire**

- Couleurs du tunnel (actuellement `#00a3ff`, `#00ffaa` — cyan/green) → `var(--inari-red)` + variation `var(--inari-red-light)`
  - Dans `createCircleTexture()` : reste en blanc OK (les étoiles)
  - Dans `initTunnel()` : `const color = new THREE.Color(i % 2 === 0 ? "#00a3ff" : "#00ffaa")` → remplacer les 2 hex par lecture de `--inari-red` et `--inari-red-light`
  - Dans `lightColors` : `[0x00a3ff, 0x00ffaa, 0x00a3ff, 0x00ffaa, 0xffffff]` → mix de `--inari-red` / `--inari-red-dark` / blanc
  - Dans `captureCardFrontImage()` et `createBackOfPortalCard()` : `gradient.addColorStop(0, "#00ffaa")` + `"#00a3ff"` → dériver de `--inari-red`
  - Couleur de fond : `0xffffff` (flash blanc au milieu de la transition) → garder (c'est l'effet "flash portal")
- Copy des cartes (`"ENTER THE / WEB PORTAL"`, `"YOU'VE REACHED THE / END OF THE INTERNET"`) → à rédiger par Gilles selon l'usage (ex: `"ENTER THE / RED ZONE"` pour services cybersec)
- Snippets de code dans les sprites (`snippetVarieties`) → remplacer par des snippets qui parlent à l'audience Inaricom : pentest, audit, OWASP LLM Top 10, CSP, Red Team, etc.
- Police `'Unica One'` → `'Instrument Serif'` (display hero CLAUDE.md)
- **Desktop only obligatoire** : Three.js + 2000 étoiles + 5000 étoiles + 100 sprites de code + tube 1200 segments = **pas question sur mobile**. Fallback : transition CSS simple (fade + zoom) sur mobile
- Self-host Three.js (pas de CDN)
- Bundle cible : <200 KB gzipped avec Three.js tree-shaken (import sélectif)

---

### 💫 Orbe pivotante (`Particle Orb CSS`) — composants décoratifs

**Usages**
- Loading state premium (attente devis, calcul config hardware, scan)
- Composant décoratif page About (sphère rouge qui tourne à côté de la bio Kevin Meunier)
- Background d'une card premium (service enterprise) — sphère très discrète derrière le titre
- Hero secondaire landing page (pas homepage)

**Adaptation**
- Fichier `Animations/Particle Orb CSS/css.txt`, ligne `$base-hue: 0;`
- Selon thème : `0` (rouge), `45` (or), `160` (vert), `190` (bleu), ou neutre = `hsl(0, 0%, X%)` en niveaux de gris
- Le fichier est en **SCSS** : compiler via Sass ou porter en CSS pur (300 particules `<div>` générées par boucle Sass)
- Pour Inaricom : idéalement porter en Canvas 2D vanilla pour éviter 300 nodes DOM

---

### ⏳ Matrix Wave Loading Animation — loader / transitions courtes

À garder comme **loader léger** (attente async, transitions de route <2s), pas comme background permanent.
Code à lire en détail quand on en aura besoin.

---

## À JETER

- `Smoke` : Three.js + texture PNG sur CDN S3 tiers → trop lourd + viole nLPD
- `3D Quantum Neural Network` : juste un PNG + html vide, pas de code utilisable
- `neural nervous system of brain` : redondant avec `Ineractive neural network` (à vérifier si besoin)
- `Matrix rain` (CSS avec gouttes) : non retenu, moins authentique que `Run Matrix Text`
- Les 2 `.mp4` à la racine : **références visuelles pour Gilles**, pas des sources à porter

---

## Règles de portage (à respecter pour CHAQUE animation)

1. **Jamais de hex en dur** dans le code final. Toujours `var(--inari-red)` et dérivées.
2. **Jamais de Google Fonts CDN** (voir guardrails CLAUDE.md). Si police référencée, la retirer ou passer sur Geist (self-hosted).
3. **Jamais de CDN tiers** pour assets (textures, scripts). Tout self-host (Infomaniak).
4. **`prefers-reduced-motion: reduce`** doit désactiver l'animation → fallback statique SVG.
5. **Pause off-screen** via `IntersectionObserver` (performance, voir `docs/specs/background-animations.md`).
6. **Opacité max 10%** pour les backgrounds de section (le contenu passe devant).
7. **60fps desktop / 30fps mobile** — si dépassement, réduire le nombre de particules/nodes.
8. **Bundle total < 25 KB gzipped** pour l'ensemble des 5 backgrounds. Canvas 2D vanilla > WebGL > Three.js.
9. **Three.js + UnrealBloomPass sur mobile = banni**. Conditionner au desktop (>=1024px) ou trouver alternative.
10. **Réagir au changement de `[data-theme]`** : MutationObserver sur `document.documentElement` attribute `data-theme` → relire `getComputedStyle(document.documentElement).getPropertyValue('--inari-red')` et redessiner.
11. **1 fichier par élément** dans `react-islands/src/components/backgrounds/` ou `react-islands/src/components/effects/` selon le type. Chaque composant reçoit un prop `themeColor` optionnel qui override la lecture auto.

---

## Prochaine étape

Ce fichier sert de brief à Claude Code pour porter les animations. Session type :
> "Porte l'animation `Run Matrix Text` du dossier `Animations/Run Matrix Text/` vers un composant React island `react-islands/src/components/backgrounds/MatrixRainRed.tsx`, en respectant STRICTEMENT les règles `Animations/MAPPING.md` section 🔴 THÈME ROUGE. Ne pas inventer, ne pas ajouter de features. Vérifier visuellement via Chrome DevTools MCP (capture + Lighthouse) que l'animation tourne à 60fps desktop et que la couleur est bien `var(--inari-red)` et pas du vert."
