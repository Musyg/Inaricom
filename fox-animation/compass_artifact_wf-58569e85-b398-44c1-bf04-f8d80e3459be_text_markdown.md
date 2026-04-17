# Animation de faisceaux lumineux révélant des tracés SVG

Les techniques de traînée lumineuse pour révéler des constellations reposent sur trois piliers : un **gradient d'opacité décroissant** stockant 10-15 positions dans une file FIFO, des **effets de glow multicouches** via `shadowBlur` ou filtres SVG, et une **interpolation linéaire avec easing** entre les points du path. Pour votre renard constellation (~600 points, fond sombre), l'approche optimale combine Canvas 2D avec `globalCompositeOperation: 'lighter'` pour un rendu additif premium, ou SVG avec la bibliothèque Vivus.js (~10KB) pour une implémentation rapide. Les paramètres professionnels recommandent **3 faisceaux** (1 principal + 2 secondaires à 60-70% d'intensité), une durée totale de **4-5 secondes**, et un ratio trail/épaisseur de **20:1**.

## L'architecture technique du trail lumineux en Canvas 2D

Le cœur de l'effet repose sur une **file FIFO (First-In-First-Out)** stockant l'historique des positions du faisceau. Chaque frame, la nouvelle position est ajoutée tandis que la plus ancienne est supprimée, créant naturellement l'effet de traînée. La brillance décroît exponentiellement de la tête vers la queue : le ratio `(index + 1) / trailLength` élevé au carré produit un fade dramatique où les **15% finaux du trail sont quasi-invisibles** tandis que la tête reste à pleine intensité.

Pour le rendu, deux techniques s'affrontent. La première utilise `clearRect()` puis redessine tout le trail avec des alphas décroissants. La seconde, plus élégante, remplace le clear par un rectangle semi-transparent (`rgba(10, 10, 11, 0.08-0.12)`) recouvrant le canvas—les éléments s'effacent naturellement frame après frame. Cette approche "overlay fade" produit des traînées plus organiques et réduit les artefacts de découpage.

```javascript
class LightBeam {
  constructor(pathPoints, hue = 200) {
    this.points = pathPoints;
    this.progress = 0;
    this.trail = [];
    this.trailLength = 12;
  }
  
  update() {
    this.progress += 0.003;
    if (this.progress > 1) this.progress = 0;
    
    const pos = this.getPosition(this.progress);
    this.trail.push({ x: pos.x, y: pos.y });
    if (this.trail.length > this.trailLength) this.trail.shift();
  }
  
  getPosition(t) {
    const idx = Math.floor(t * (this.points.length - 1));
    const localT = (t * (this.points.length - 1)) - idx;
    const p1 = this.points[Math.min(idx, this.points.length - 1)];
    const p2 = this.points[Math.min(idx + 1, this.points.length - 1)];
    return {
      x: p1.x + (p2.x - p1.x) * localT,
      y: p1.y + (p2.y - p1.y) * localT
    };
  }
}
```

## Créer un glow premium sans WebGL complexe

L'effet neon convaincant nécessite un **glow multicouche**. En Canvas 2D, `shadowBlur` constitue l'outil principal : une valeur de **15-25 pixels** avec `shadowColor` en couleur saturée (`hsla(200, 80%, 60%, 0.9)` pour un cyan constellation) produit un halo crédible. Le secret réside dans le dessin du trail AVANT la tête lumineuse, puis l'application de `shadowBlur` uniquement sur cette dernière pour économiser les ressources.

La technique `globalCompositeOperation = 'lighter'` transforme radicalement le rendu. Ce mode **additif** fait que les zones de chevauchement s'intensifient—deux faisceaux qui se croisent produisent un éclat accru plutôt qu'un simple empilement. Combiné avec plusieurs cercles concentriques de tailles décroissantes (5 couches : rayon de 10px à 2px, opacité de 0.04 à 1.0), cela simule un bloom HDR sans post-processing.

Pour SVG, le filtre `feGaussianBlur` dans un élément `<defs>` offre une alternative performante :

```svg
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur stdDeviation="4" result="blur"/>
  <feMerge>
    <feMergeNode in="blur"/>
    <feMergeNode in="blur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

La répétition des `feMergeNode` intensifie le glow. Garder `stdDeviation` sous **10** préserve les performances mobiles.

## L'interpolation fluide entre 301 points

Avec 301 points par path, l'interpolation linéaire suffit généralement. Le paramètre `t` (0 à 1) représente la progression sur l'ensemble du chemin. Le calcul détermine d'abord dans quel segment on se trouve (`floor(t * totalSegments)`), puis interpole entre les deux points adjacents avec le reste fractionnaire. L'application d'une fonction **easing sur `t`** avant l'interpolation crée des accélérations/décélérations organiques.

`cubic-bezier(0.65, 0, 0.35, 1)` (easeInOutCubic) représente le gold standard pour les mouvements lumineux—accélération douce au départ, décélération élégante à l'arrivée. En GSAP : `ease: "power2.inOut"`. Pour un effet plus naturel/constellation, `sine.inOut` adoucit davantage les transitions. La variation de vitesse recommandée suit ce pattern : **30% de vitesse max** sur les premiers 15% du path, **100%** sur la section centrale (70%), puis **50%** sur les 15% finaux.

## Paramètres optimaux pour un design ~600 points

La recherche en motion design établit des ratios précis. Le **trail devrait mesurer 15-25 fois l'épaisseur du trait**—pour un stroke de 2px, prévoir une traînée de 30-50 pixels. En termes de points stockés dans la file FIFO, **10-15 positions** équilibrent effet visuel et performance. L'opacité suit une courbe agressive : 100% à la tête, 70% à 25% de la queue, 35% à mi-chemin, quasi-invisible sur le dernier quart.

Pour votre renard bi-colore, **3 faisceaux total** offrent le meilleur équilibre : un faisceau principal à pleine intensité, deux secondaires à 60-70% de luminosité décalés de 20-30% derrière. Plus de 4 faisceaux sur 600 points risque la confusion visuelle. L'espacement minimal entre faisceaux sur un même path : **25-30% de la longueur totale** (75-90 points de séparation minimum).

La durée totale professionnelle pour un logo reveal se situe entre **3-5 secondes**. Pour vos paths de 301 points, viser 40-80 points/seconde soit environ 4 secondes par path. Le path rouge devrait démarrer en premier (capte l'attention), le blanc suivant avec **300-500ms de délai** pour créer profondeur et contraste.

## WebGL pour les effets avancés

Si Canvas 2D atteint ses limites, un setup WebGL minimal offre des options supérieures. La technique **SDF (Signed Distance Field)** calcule pour chaque pixel sa distance à la ligne, puis applique une fonction de falloff. La formule `glow = 0.01 / distance` produit l'aspect neon classique; `exp(-distance * 10.0)` adoucit le halo. Un fragment shader complet :

```glsl
float d = distanceToLine;
float core = smoothstep(0.01, 0.0, d);
float innerGlow = clamp(0.005 / d, 0.0, 1.0);
float outerGlow = clamp(0.02 / d, 0.0, 0.5);

vec3 color = vec3(0.0);
color += outerGlow * vec3(0.3, 0.8, 1.0) * 0.5;
color += innerGlow * vec3(0.3, 0.8, 1.0);
color += core * vec3(1.0);
color = 1.0 - exp(-color * 1.5); // tone mapping
```

La bibliothèque **OGL** (~13KB) simplifie considérablement le setup avec sa classe Polyline intégrée. Pour des besoins simples, travailler directement en NDC (Normalized Device Coordinates, -1 à 1) évite toute matrice de projection.

## Bibliothèques recommandées selon le contexte

**Vivus.js** (10KB, zéro dépendance) représente le choix optimal pour une implémentation rapide SVG. Son mode `oneByOne` dessine séquentiellement chaque path, parfait pour une constellation. Limitation : fonctionne uniquement avec `stroke`, pas `fill`.

**GSAP avec DrawSVG** offre le contrôle maximal. Le plugin `DrawSVGPlugin` anime `stroke-dashoffset` tandis que `MotionPathPlugin` fait suivre un élément le long du tracé. Combinés dans une timeline, ils synchronisent reveal et faisceau voyageur. DrawSVG est premium (Club GreenSock) mais gratuit sur CodePen.

**anime.js** (vanilla JS, documentation excellente) propose `anime.setDashoffset` pour les reveals et `anime.path()` pour le motion path. La version 4+ introduit `svg.createDrawable()` simplifiant encore l'API.

**Motion (ex-Framer Motion)** pour React gère nativement `pathLength` avec des transitions spring élégantes. Son API déclarative rend le staggering trivial.

## Performance et optimisations critiques

`requestAnimationFrame` avec compensation delta-time assure une animation constante indépendamment du taux de rafraîchissement. Le budget par frame est de **16.67ms** pour 60fps. Les propriétés `transform` et `opacity` bénéficient de l'accélération GPU; éviter d'animer `width`, `box-shadow` ou `filter` directement.

Batching les opérations similaires—configurer `shadowBlur` une fois puis dessiner tous les éléments partageant ces paramètres—réduit dramatiquement les state changes coûteux. L'**object pooling** pour les particules évite le garbage collector : maintenir un tableau de particules réutilisables plutôt que créer/détruire des objets.

Pour un fond statique (votre #0a0a0b), un canvas off-screen pré-rendu puis composité via `drawImage()` chaque frame économise les ressources. Le shadow blur étant coûteux, l'appliquer exclusivement à la tête du faisceau—jamais à chaque particule du trail.

## Configuration finale recommandée

```javascript
const foxAnimationConfig = {
  // Timing
  totalDuration: 4500,
  beamCount: 3,
  beamStagger: 600, // ms entre démarrages
  pathOffset: 400, // délai path blanc après rouge
  
  // Trail
  trailLength: 12, // positions FIFO
  trailPixels: { primary: 50, secondary: 35 },
  trailOpacity: [1.0, 0.85, 0.6, 0.35, 0.15, 0],
  
  // Vitesse
  pointsPerSecond: 65,
  speedVariation: 0.12,
  
  // Glow (Canvas 2D)
  shadowBlur: 20,
  compositeOperation: 'lighter',
  glowLayers: [
    { blur: 2, opacity: 1.0 },
    { blur: 8, opacity: 0.7 },
    { blur: 20, opacity: 0.3 }
  ],
  
  // Easing
  easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
  
  // Loop
  repeatDelay: 3000,
  fadeAlpha: 0.1 // pour overlay clear
};
```

## Conclusion

L'effet constellation-reveal premium repose sur l'accumulation de techniques simples bien paramétrées plutôt que sur une solution complexe unique. La combinaison file FIFO + overlay fade + composite additif en Canvas 2D produit des résultats professionnels avec ~50 lignes de code. Le ratio **20:1 trail/stroke** et les **3 faisceaux staggerés de 600ms** constituent le point de départ optimal avant ajustement fin. Pour une implémentation rapide, Vivus.js + filtre SVG glow offre le meilleur ratio effort/résultat; pour un contrôle total avec synchronisation timeline complexe, GSAP DrawSVG reste la référence industrie. La clé d'un rendu premium réside dans les détails : variation de vitesse ±10-15% entre faisceaux, délai 300-500ms entre paths colorés, et easing `easeInOutCubic` plutôt que linéaire.