# Specs — Animations background par theme

> 5 animations de fond thematiques, une par theme. Legeres, contextuelles, non-distractives.
> Derniere MAJ : 24 avril 2026 (arbitrage Gilles Munier)

---

## Principe

Chaque theme a SA propre animation de background qui reflete sa thematique :
- le sujet de la section est "raconte" subtilement par l'animation derriere
- l'animation ne vole jamais la vedette au contenu (opacity max 8-10%)
- la couleur suit le theme actif via `var(--inari-red)` (qui change selon `[data-theme]`)
- changement de theme = swap fluide d'animation via MutationObserver

---

## Tableau de correspondance

| Theme | Usage | Animation | Vibe |
|---|---|---|---|
| `default` (rouge) | Securite / Red Team / pentest | **Code flux** — caracteres qui defilent verticalement (Matrix a la sauce Inari) | Surveillance, vigilance, analyse |
| `or` | IA (services + hardware + tutos) | **Nodes IA** — graphe de nodes connectes avec signaux qui parcourent les aretes | Intelligence distribuee, calcul |
| `vert` | Blog / ressources / knowledge | **Reseau neuronal** — couches de neurones avec pulses qui traversent layer par layer | Apprentissage, partage du savoir |
| `neutre` | Homepage | **Constellation convergente** — particules argentees + liaisons fugaces + pulses pilier rares | Convergence, "sans boite noire" |
| `bleu` | Contact / legal / a propos | **Blueprint grid** — grille d'architecte cyan qui respire + pulse horizontal | Structure, rigueur institutionnelle |


---

## Contraintes techniques communes (NON-NEGOCIABLES)

### Rendu
- **Canvas 2D vanilla** (pas WebGL, pas Three.js, pas OGL pour le background — OGL reste pour la fox animation)
- **`position: fixed; z-index: -1; pointer-events: none;`** sur le container — aucune capture de clic
- **Full viewport width/height**, DPR-aware (`window.devicePixelRatio` pris en compte)
- **Opacity max 10%** sur les elements dessines — jamais voler la vedette au contenu

### Performance
- **60 fps desktop, 30 fps mobile** — throttle via timestamp delta dans la loop d'animation
- **`requestAnimationFrame`** avec compensation delta-time (pas de freezes ni de sauts visuels)
- **`IntersectionObserver` + `document.visibilityState`** : pause quand tab hidden OU container off-screen
- **Budget bundle** : <5 KB gzipped par animation, <20 KB pour les 5 combinees
- **Zero dependance externe**, tout self-hosted (conformite nLPD / RGPD)
- **Aucune allocation dans la loop** — object pools pour particules, nodes, pulses

### Theme-aware
- Utiliser **`var(--inari-red)` / `var(--inari-red-rgb)`** (recuperer via `getComputedStyle(document.documentElement)`) — l'anim herite du theme actif via MutationObserver sur `[data-theme]`
- Jamais de hex en dur, jamais de couleur hors palette verrouillee
- Sur theme neutre : blanc argente `#EFEBE8` par defaut + 3 touches accent rouge/or/vert subtiles (pulses rares)

### Accessibilite (WCAG 2.2 AA)
- **`@media (prefers-reduced-motion: reduce)`** → anim arretee, remplacee par un SVG statique equivalent (faux-semblant)
- **Pas de flicker** susceptible de declencher des sensibilites (pas de flash rapide, pas de contraste violent)
- **Pas de motion sickness** — mouvements lents, pas de scroll hijack, pas de parallax violent

### Integration
- Chaque anim est une **classe JS isolee** instantiable : `new InariCodeFlux(container, options)`, `new InariNodesIA(container, options)`, etc.
- Classe de base commune `BackgroundAnimation` qui gere : cycle de vie, resize, theme change, reduced motion, pause off-screen
- Chargement via **snippet unique** (Code Snippets ou React island) qui detecte le theme actif et instancie la bonne animation
- Swap d'animation au changement de theme : fade-out l'ancienne + destroy, fade-in la nouvelle


---

## 🔴 Theme ROUGE — "Code flux" (cybersec / Red Team / pentest)

### Concept
Matrix a la sauce Inaricom. Caracteres qui descendent verticalement dans des colonnes eparses, mais **nettement moins dense et plus lent** que le Matrix classique. Pas de katakana anime : on utilise un alphabet pertinent cybersec (hex, base64, ASCII, quelques symboles `<>{}$%#@`).

### Visuel
- **Colonnes de caracteres** espacees (espacement ~60-100 px horizontal, pas de colonnes serrees)
- **Densite** : ~30-50 colonnes actives simultanement sur un viewport 1920x1080 (pas 200 comme le Matrix classique)
- **Vitesse** : 0.3-0.8 px/ms (tres lent, contemplatif)
- **Fondu** : chaque caractere s'estompe progressivement apres avoir descendu (trail ~15-20 caracteres)
- **Caractere de tete** : legerement plus lumineux (`rgba(var(--inari-red-rgb), 0.18)`), le reste du trail a 0.04-0.08 d'opacity
- **Police** : Geist Mono (deja self-hostee) — 12-14px
- **Changement de caractere** : chaque caractere du trail change aleatoirement ~1 fois par seconde

### Jeu de caracteres (pool)
```
0-9, A-F (hex)
A-Z, a-z (ASCII alpha)
< > { } [ ] ( ) / \ | ~ ! @ # $ % ^ & * + = ? . , : ;
```
Pas de caracteres speciaux exotiques, pas d'emoji, pas de binaire pur (`0100110` est illisible et peu evocateur).

### Parametres par defaut
```js
{
  columnSpacing: 80,       // px entre deux colonnes actives
  columnCount: 40,         // nombre de colonnes actives
  charHeight: 16,          // hauteur d'un caractere
  fontFamily: 'Geist Mono, monospace',
  fontSize: 13,
  speedMin: 0.3,           // px/ms
  speedMax: 0.8,
  trailLength: 18,         // nombre de caracteres dans le trail
  headOpacity: 0.18,
  trailOpacityMin: 0.04,
  trailOpacityMax: 0.08,
  charMutationRate: 1.0,   // changements par seconde par caractere
  color: 'var(--inari-red)'
}
```

### Refs inspirations
- Matrix 1999 (concept originel) mais debarrasse de sa densite
- Darknode (notre palette de reference)
- `ghost.log` / consoles de supervision SOC


---

## 🟡 Theme OR — "Nodes IA" (services IA, hardware, tutos)

### Concept
Graphe de nodes (neurones / unites de calcul) disposes en nuage semi-aleatoire, relies par des aretes fines. Des **signaux lumineux** parcourent regulierement les aretes d'un node a l'autre, evoquant du calcul distribue / du message passing.

### Visuel
- **Nodes** : petits cercles (3-4 px de rayon), disperses en grille perturbee (type Poisson disk sampling pour eviter grille reguliere)
- **Densite** : ~25-40 nodes sur un viewport 1920x1080
- **Aretes** : chaque node est connecte a ses 2-4 voisins les plus proches (distance max ~300 px)
- **Signaux** : petites spheres lumineuses qui parcourent une arete en 800-1500ms, puis disparaissent. Frequence : 1 signal toutes les 400-800ms sur l'ensemble du graphe (pas 1 par arete)
- **Opacity nodes** : 0.08 au repos, 0.20 quand un signal arrive dessus (flash de 200ms)
- **Opacity aretes** : 0.03-0.05 (tres discret)
- **Opacity signal** : 0.25 au peak, avec glow via shadow blur 8px
- **Legere derive** : l'ensemble du graphe flotte lentement (0.05-0.1 px/ms), les nodes "respirent" legerement

### Comportement des signaux
- Un signal part d'un node, choisit une arete au hasard (pondere pour preferer des aretes pas recemment utilisees)
- Arrive au node suivant, il a 30% de chance de continuer (chainage), 70% de s'eteindre
- Chainage max : 4 nodes consecutifs (evite les signaux infinis)

### Parametres par defaut
```js
{
  nodeCount: 30,
  nodeRadius: 3.5,
  maxConnectionDistance: 300,  // px
  maxConnectionsPerNode: 4,
  nodeOpacity: 0.08,
  nodeOpacityActive: 0.20,
  edgeOpacity: 0.04,
  signalFrequency: 600,         // ms entre deux signaux spawn
  signalDuration: 1200,         // ms de traversee d'une arete
  signalOpacity: 0.25,
  signalGlowBlur: 8,
  signalChainProbability: 0.3,
  signalChainMax: 4,
  driftSpeed: 0.07,            // px/ms
  color: 'var(--inari-red)'    // qui vaudra l'or via theme switch
}
```

### Refs inspirations
- Graphes de calcul de Pytorch / TensorFlow (visualisations)
- Anthropic "constellation" visuals
- Cloudflare edge network maps


---

## 🟢 Theme VERT — "Reseau neuronal" (blog / ressources / knowledge)

### Concept
Reseau de neurones organise en **couches** (input / hidden / output), avec des pulses qui traversent le reseau de gauche a droite (forward pass visuel). C'est le cousin structure du graphe or, mais avec une **directionalite** et une **organisation en layers** — evoque l'apprentissage, le savoir qui se propage.

### Visuel
- **Layers** : 4-6 colonnes verticales (selon largeur viewport), espacees regulierement
- **Neurones par layer** : 5-8 neurones par colonne, espacement vertical aleatoire dans une zone centrale (60% de la hauteur)
- **Neurones** : cercles de 3-4 px, opacity 0.06 au repos
- **Connections** : entre chaque neurone d'un layer N et CHAQUE neurone du layer N+1 (pas full connected pour eviter le visual clutter : garder 40-60% des liaisons possibles aleatoirement)
- **Opacity connections** : 0.025-0.035 (tres discret, densite visuelle controlee)
- **Pulse forward pass** : toutes les 4-7 secondes, une "vague" d'activations part du layer input et se propage layer par layer jusqu'a output
  - Chaque neurone touche par la vague flash brievement (opacity 0.25 pendant 300ms puis decay)
  - Les connections actives (neurones source et cible flashes) se renforcent visuellement (opacity 0.1 pendant 200ms)
  - Le pulse met ~1500ms a traverser tout le reseau (lent et lisible)

### Parametres par defaut
```js
{
  layerCount: 5,
  neuronsPerLayerMin: 5,
  neuronsPerLayerMax: 8,
  neuronRadius: 3.5,
  neuronOpacity: 0.06,
  neuronOpacityActive: 0.25,
  connectionDensity: 0.5,       // 0..1, fraction des connections possibles
  connectionOpacity: 0.03,
  connectionOpacityActive: 0.10,
  forwardPassInterval: 5000,    // ms entre deux vagues
  forwardPassDuration: 1500,    // ms pour traverser tout le reseau
  neuronFlashDuration: 300,     // ms
  color: 'var(--inari-red)'     // qui vaudra le vert via theme switch
}
```

### Refs inspirations
- Visualisations "3Blue1Brown" de reseaux de neurones
- Anthropic "circuit tracing" images
- TensorFlow Playground


---

## ⚪ Theme NEUTRE — "Constellation convergente" (homepage)

### Concept
Particules argentees qui derivent lentement dans l'espace. Quand 2 particules passent proches l'une de l'autre, une ligne fine apparait entre elles, puis s'efface. **Rarement** (1 fois toutes les 8-12 secondes), un "pulse" de couleur (rouge, or ou vert — l'un des 3 piliers en rotation) parcourt une connexion le temps d'un instant. Rappel subtil des piliers sans dominance.

### Visuel
- **Particules** : petits points argentes `#EFEBE8` (creme), 2-3 px de rayon
- **Densite** : ~60-80 particules sur un viewport 1920x1080
- **Mouvement** : chaque particule a un vecteur de velocite aleatoire initial (0.03-0.08 px/ms), rebond doux aux bords du viewport (ou teleport edges-wrap)
- **Opacity particule** : 0.25 (plus visible que les autres anims car c'est le signature de la home)
- **Liaisons** : quand 2 particules sont a < 150 px l'une de l'autre, une ligne apparait avec opacity proportionnelle a la proximite (plus elles sont proches, plus la ligne est visible). Max opacity liaison : 0.08.
- **Pulse pilier (rare)** : toutes les 8-12s (jitter aleatoire), un pulse colore parcourt une liaison active en 400-600ms
  - Couleur du pulse : rotation entre `#E31E24` (rouge), `#FFD700` (or), `#10B981` (vert) — **jamais 2 pulses en meme temps**
  - Opacity pulse : 0.35 peak, avec glow 6px
  - Le pulse ne dure que le temps de traverser la liaison, puis disparait

### Comportement
- Le pulse choisit une liaison existante au hasard, prend un node source, glisse vers le node cible
- Le node source et le node cible flashent brievement (opacity 0.45 pendant 200ms) dans la couleur du pulse
- Apres le pulse, retour immediat au rendu neutre

### Parametres par defaut
```js
{
  particleCount: 70,
  particleRadius: 2.5,
  particleOpacity: 0.25,
  speedMin: 0.03,                    // px/ms
  speedMax: 0.08,
  edgeBehavior: 'wrap',              // 'bounce' ou 'wrap'
  maxLinkDistance: 150,              // px
  maxLinkOpacity: 0.08,
  pulseIntervalMin: 8000,            // ms
  pulseIntervalMax: 12000,
  pulseDuration: 500,                // ms de traversee d'une liaison
  pulseOpacity: 0.35,
  pulseGlowBlur: 6,
  pulseColors: ['#E31E24', '#FFD700', '#10B981'],
  pulseColorRotation: 'sequential',  // 'sequential' ou 'random'
  nodeFlashOpacity: 0.45,
  nodeFlashDuration: 200,
  color: '#EFEBE8'                   // creme, sans var() car theme neutre
}
```

### Refs inspirations
- Linear homepage (hero)
- Vercel homepage (hero)
- Particles.js (sans le cote 2015 kitsch)
- Ciel etoile, convergence des savoirs


---

## 🔵 Theme BLEU — "Blueprint grid" (contact / legal / a propos)

### Concept
Grille geometrique fine type plan d'architecte qu'on inspecte. Lignes verticales et horizontales reglees, espacees regulierement, en cyan tres discret. La grille "respire" (opacity oscille doucement). Toutes les 6-10 secondes, un **pulse lumineux** parcourt une ligne horizontale de gauche a droite — evoque l'examen, la lecture, la structure.

### Visuel
- **Grille** : lignes verticales + horizontales, espacement 60-80 px
- **Lignes** : stroke 1px, opacity de base 0.015-0.025 (tres discret, on doit a peine la voir)
- **Intersection points** : petits points aux intersections, legerement plus visibles (opacity 0.04)
- **Respiration** : toute la grille oscille en opacity (sinus) avec amplitude +/- 20% sur sa valeur de base, periode 6-8s
- **Pulse horizontal** : toutes les 6-10s (jitter), un segment lumineux de 200-300 px de long traverse une ligne horizontale de la grille de gauche a droite en 1500-2500ms
  - Opacity peak 0.22, fade progressif aux extremites (gradient lineaire)
  - 1 pulse a la fois sur toute la grille
- **Vertical pulse** (rare, 1 sur 4 pulses) : meme logique mais sur une ligne verticale de haut en bas, plus court (1200ms)

### Parametres par defaut
```js
{
  gridSpacing: 70,              // px entre deux lignes
  gridLineWidth: 1,
  gridLineOpacity: 0.02,
  gridIntersectionRadius: 1.5,
  gridIntersectionOpacity: 0.04,
  breathingAmplitude: 0.2,      // +/- fraction
  breathingPeriod: 7000,        // ms
  pulseIntervalMin: 6000,       // ms
  pulseIntervalMax: 10000,
  pulseDurationHorizontal: 2000,// ms
  pulseDurationVertical: 1200,
  pulseLength: 250,             // px (longueur du segment lumineux)
  pulseOpacity: 0.22,
  verticalPulseRatio: 0.25,     // 25% des pulses sont verticaux
  color: 'var(--inari-red)'     // qui vaudra le bleu via theme switch
}
```

### Refs inspirations
- Stripe dashboard (grilles de fond)
- Cloudflare status pages
- Plans d'architecte / CAD blueprints
- Figma canvas grid


---

## Architecture d'implementation

### Arborescence proposee

**Cote WordPress (pages classiques)** — dans `react-islands/src/background-animations/` ou en snippet dedie :
```
background-animations/
├── BackgroundAnimation.js       # classe de base (cycle de vie, resize, theme, reduced-motion, off-screen pause)
├── CodeFlux.js                  # theme rouge
├── NodesIA.js                   # theme or
├── NeuralNetwork.js             # theme vert
├── Constellation.js             # theme neutre (homepage)
├── BlueprintGrid.js             # theme bleu
├── index.js                     # detect theme + instancier + swap au changement
└── fallbacks/
    ├── code-flux.svg            # SVG statique pour prefers-reduced-motion
    ├── nodes-ia.svg
    ├── neural-network.svg
    ├── constellation.svg
    └── blueprint-grid.svg
```

### Classe de base `BackgroundAnimation`
- constructor(container, options)
- init() : setup canvas, DPR, pointer-events none, z-index -1
- start() : lance la loop RAF
- stop() : suspend la loop
- destroy() : cleanup canvas + observers
- onResize() : recalcul dimensions + DPR
- onThemeChange(newTheme) : recalcul des couleurs
- onVisibilityChange() : pause si tab hidden ou off-screen
- Respect `prefers-reduced-motion` : start() ne lance pas la RAF si reduce, render() affiche le fallback SVG

### Chargement conditionnel
- Sur la homepage React island, on bundle uniquement `Constellation` (chargement direct)
- Sur les autres pages, on bundle un orchestrateur `index.js` qui lit `[data-theme]` au load et charge dynamiquement (import dynamique ES) le module de l'animation correspondante
- Au changement de theme (via theme switcher ou navigation interne), destroy l'actuel + lazy-load le nouveau + init

### Budget total
- Classe de base : ~2 KB
- Chaque animation : 3-5 KB
- Orchestrateur + fallbacks SVG : ~2 KB
- **Total : <25 KB gzipped pour le systeme complet des 5 anims**

---

## Regles de non-dominance (important)

Chaque animation doit **passer le test de l'oeil distrait** :
1. Ouvrir la page, lire un paragraphe du contenu principal
2. Au bout de 30 secondes, l'oeil ne doit PAS avoir ete attire par le fond plus d'une ou deux fois
3. Si on ferme les yeux et qu'on se rappelle ce qu'on a vu, on doit se souvenir du CONTENU, pas de l'animation

Si une animation echoue ce test (trop visible, trop rapide, trop colore), baisser l'opacity et ralentir.

---

## Dette technique / futures optimisations

- **Phase 2** : portage en WebGL via OGL pour gros ecrans ou retina (factoriser si bundle le permet)
- **Phase 3** : variantes saisonnieres / evenementielles (ex : pulse doree intense lors d'une annonce produit) — optionnel
- **Monitoring** : mesurer le FPS reel via `performance.now()` sur 50 frames echantillonnees et desactiver l'anim si < 25 fps mobile
