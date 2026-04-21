# Phase 2 — React Islands sur WordPress

> Brief executif + plan technique pour basculer le frontend des zones premium
> d'Inaricom vers React + Tailwind, tout en gardant WordPress comme backend.
>
> Date de redaction : 21 avril 2026
> Statut : DEMARRE (Q2 2026, pas Q1 2027 comme prevu initialement)
> Responsable execution : Claude Code via sous-agents

---

## 1. Decision strategique

### Modele retenu : React islands (hybride)

WordPress **reste le backend complet** :
- Contenu (articles, produits, pages) stocke dans WP (DB MySQL)
- Back-office (`/wp-admin`) inchange
- WooCommerce natif pour la boutique (Stripe, Twint, DigiKey)
- SEO via Rank Math (Schema.org, sitemaps, llms.txt)
- Rendu HTML serveur via PHP/Kadence

React/Tailwind prend en charge **uniquement les zones premium** :
- Homepage (hero + cards piliers + pourquoi + derniers articles + CTA final)
- Futur : AI Tool Finder (questionnaire interactif)
- Futur : Hardware Configurator 3D (R3F + WebGPU)
- Futur : AI Mastery Hub (tutoriels interactifs)

### Modeles rejetes

- **Full headless Next.js** : 3-6 mois de dev, refaire WooCommerce, refaire SEO, refaire auth. Pas ROI.
- **100% WordPress + Kadence blocks** : plafond visuel atteint, impossible de livrer le premium "dernier cri" voulu.

### Principe architectural

Chaque "island" = **bundle JS React autonome** qui monte dans un `<div id="...">` vide genere par WordPress.

```
Page WP servie par PHP/Kadence
├── Header (WP)
├── Main content
│   └── <div id="inari-homepage-root"></div>  ← React monte ici
└── Footer (WP)
```

Le HTML envoye par WP inclut le meta + title + Schema.org + skeleton loader. React prend le relais une fois hydrate.

---

## 2. Stack technique verrouillee

### Stack frontend React

| Composant | Choix | Version | Raison |
|-----------|-------|---------|--------|
| Build tool | **Vite** | 6.x | Bundle leger, HMR instantane, zero overhead framework |
| Language | **TypeScript** | 5.6+ | Types stricts, DX moderne, autocompletion |
| UI framework | **React** | 19.x | Concurrent mode stable, RSC optionnel, ecosystem mature |
| Styling | **Tailwind CSS** | **v4.x** | Compilation native CSS, tokens `--inari-*` via `@theme`, 10x plus rapide que v3 |
| Components | **shadcn/ui** | latest | Code copie dans le projet, Radix accessible WCAG, custom total |
| Icons | **lucide-react** | latest | 1400+ icons, tree-shake, coherent avec shadcn |
| Animations | **Framer Motion** | 11.x | Pour animations UI React (complementaire a GSAP pour anim WP-side) |
| 3D (plus tard) | **React Three Fiber** | v9 | Pour le hardware configurator Phase 2 |
| Data fetching | **@tanstack/react-query** | v5 | Cache + revalidation + optimistic updates, standard 2026 |

### Stack WordPress (inchangee)

Tout ce qui est Phase 1 reste en place. Seul ajout cote WP : un module dans `inaricom-core` qui enregistre et enqueue les bundles React.

### Integration Tailwind v4 avec les tokens existants

Tailwind v4 utilise `@theme` (CSS-native) pour definir les tokens. On reutilise les `--inari-*` du snippet 347 via CSS custom properties :

```css
@theme {
  --color-inari-black: #0A0A0F;
  --color-inari-black-alt: #12121A;
  --color-inari-red: var(--inari-red); /* heritage du theme WP actif */
  --color-inari-red-rgb: var(--inari-red-rgb);
  --color-inari-text: #F0F0F5;
  --color-inari-text-soft: #B6B0B4;
  --color-inari-text-muted: #8A8A9A;
  
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;
  --font-serif: 'Instrument Serif', ui-serif, serif;
  
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 22px;
  --radius-full: 999px;
}
```

Quand le body a `theme-or`, la variable `--inari-red` vaut `#FFD700`, donc `--color-inari-red` aussi. **Les classes Tailwind reagissent automatiquement au theme actif** sans code JS de switch.

---

## 3. Arborescence projet

Nouveau dossier `react-islands/` a la racine du repo :

```
Inaricom/
├── react-islands/                      ← NOUVEAU
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── index.html                      ← dev preview
│   ├── src/
│   │   ├── main.tsx                    ← entry points multiples (un par island)
│   │   ├── islands/
│   │   │   ├── Homepage.tsx
│   │   │   ├── AIToolFinder.tsx        ← Phase 2.2
│   │   │   └── HardwareConfig.tsx      ← Phase 2.3
│   │   ├── components/
│   │   │   ├── ui/                     ← shadcn/ui copies
│   │   │   ├── hero/
│   │   │   │   └── HeroNeutral.tsx
│   │   │   ├── cards/
│   │   │   │   ├── PillarCard.tsx
│   │   │   │   └── ArticleCard.tsx
│   │   │   └── layout/
│   │   ├── hooks/
│   │   │   ├── useWPPosts.ts           ← fetch articles via REST
│   │   │   └── useTheme.ts             ← lire data-theme courant
│   │   ├── lib/
│   │   │   ├── wp-api.ts               ← client REST WP
│   │   │   └── utils.ts                ← cn(), clsx
│   │   └── styles/
│   │       └── globals.css             ← @theme + tailwind directives
│   └── dist/                           ← gitignore, build output
│
├── inaricom-core/
│   └── src/
│       └── React/
│           ├── ReactLoader.php         ← NOUVEAU : enqueue bundles
│           └── ReactMountPoints.php    ← NOUVEAU : injecte <div id=...>
│
└── [tout l'existant inchange]
```

### Pipeline de build

1. Dev : `cd react-islands && npm run dev` → HMR Vite sur `http://localhost:5173`
2. Preview : on peut iterer visuellement sans deployer WordPress
3. Build : `npm run build` → `react-islands/dist/` produit les bundles
4. Deploy : script copie `dist/*` vers `plugins/inaricom-core/assets/react/` (committe)
5. WP enqueue les fichiers via `ReactLoader.php`

---

## 4. Plan d'execution — sous-etapes Phase 2

### 2.0 — Setup du projet (1 session, ~2-3h)

- [ ] Creer `react-islands/` avec `npm create vite@latest` (template React-TS)
- [ ] Installer Tailwind v4 : `npm install tailwindcss @tailwindcss/vite`
- [ ] Installer shadcn/ui : `npx shadcn@latest init`
- [ ] Configurer `vite.config.ts` avec entry points multiples (un par island)
- [ ] Configurer `tailwind.config.ts` pour mapper `--inari-*` en classes
- [ ] Creer `src/styles/globals.css` avec `@theme` heritant des tokens WP
- [ ] Verifier HMR fonctionnel sur la page de dev
- [ ] Commit : "Phase 2.0 : setup Vite + React + Tailwind v4 + shadcn/ui"

### 2.1 — Homepage island (2-3 sessions)

- [ ] `src/islands/Homepage.tsx` : structure complete (Hero, Piliers, Pourquoi, Articles, CTA)
- [ ] Composant `HeroNeutral.tsx` : fond noir + titre fil rouge (d) + sous-titre + indicateur scroll
- [ ] Composant `PillarCard.tsx` : card accent configurable (rouge/or/vert), animations survol, CTA vers page cible
- [ ] Composant `ArticleCard.tsx` : design article avec meta + thumbnail + excerpt
- [ ] Hook `useWPPosts.ts` : fetch 3 derniers articles via `/wp-json/wp/v2/posts`
- [ ] Section "Pourquoi Inaricom" : 4 points-cles (local-first, PME-friendly, methodologie lisible, couplage hardware+services)
- [ ] CTA final contact : bouton vers `/contact/`
- [ ] Respect `prefers-reduced-motion` sur toutes animations
- [ ] Tests visuels 375/768/1280/1920
- [ ] Commit : "Phase 2.1 : homepage island React complete"

### 2.2 — Integration WordPress (1 session)

- [ ] `inaricom-core/src/React/ReactLoader.php` :
  - Lit les manifests Vite (`dist/manifest.json`)
  - Enqueue scripts + styles avec versioning par hash
  - Defer loading, crossorigin, module type
  - Conditional : n'enqueue que si le mount point existe dans la page
- [ ] `inaricom-core/src/React/ReactMountPoints.php` :
  - Shortcode `[inari_island name="homepage"]` qui output `<div id="inari-homepage-root"></div>`
  - Filter `the_content` qui detecte une meta page `_inari_react_island` et inject
- [ ] Tests : creer une page WP "Accueil Inaricom" avec shortcode, verifier montage React
- [ ] Gestion erreurs : fallback HTML si bundle 404 (skeleton visible)
- [ ] Commit : "Phase 2.2 : integration WP via ReactLoader + mount points"

### 2.3 — Swap homepage production (1 session)

- [ ] Creer page WP "Accueil Inaricom" en brouillon
- [ ] Ajouter shortcode `[inari_island name="homepage"]`
- [ ] Ajouter meta title/description SEO optimises
- [ ] Tester en brouillon sur staging (preview URL)
- [ ] Deplacer page 985 "Acceuil Cybersecurite" vers slug `/accueil-cybersecurite/` (garde tout son contenu)
- [ ] Changer `page_on_front` WP pour pointer sur nouvelle page
- [ ] Redirection 301 ancienne URL si pertinent
- [ ] Update menu principal (Accueil pointe sur nouvelle home)
- [ ] Tests : homepage prod = React island, cybersecu landing = contenu preserve
- [ ] Commit : "Phase 2.3 : swap homepage, ancienne page renommee"

### 2.4 — QA + polish (1-2 sessions)

- [ ] Lighthouse Performance 95+ mobile et desktop
- [ ] Core Web Vitals : LCP < 2.5s, INP < 200ms, CLS < 0.1
- [ ] Bundle size critique : < 80 KB gzipped
- [ ] axe-core : zero violation accessibilite
- [ ] Responsive QA 375/768/1280/1920 via Playwright
- [ ] Check data-theme transitions (observer MutationObserver dans React)
- [ ] Visual regression tests (Playwright screenshots)
- [ ] Commit : "Phase 2.4 : QA + tests Lighthouse passes"

---

## 5. Integration technique detaillee

### 5.1 Entry points Vite (bundles separes)

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        homepage: 'src/islands/homepage.tsx',
        'ai-tool-finder': 'src/islands/ai-tool-finder.tsx',
        'hardware-config': 'src/islands/hardware-config.tsx',
      },
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'css/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    manifest: true,
    outDir: '../plugins/inaricom-core/assets/react',
    emptyOutDir: true,
  },
});
```

### 5.2 Mounting pattern (un entry par island)

```typescript
// src/islands/homepage.tsx
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Homepage from './Homepage';
import '../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000 }, // 5 min
  },
});

const rootEl = document.getElementById('inari-homepage-root');
if (rootEl) {
  createRoot(rootEl).render(
    <QueryClientProvider client={queryClient}>
      <Homepage />
    </QueryClientProvider>
  );
}
```

### 5.3 Lecture du theme WP courant depuis React

```typescript
// src/hooks/useTheme.ts
import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<string>('neutre');
  
  useEffect(() => {
    const html = document.documentElement;
    const updateTheme = () => {
      setTheme(html.getAttribute('data-theme') || 'rouge');
    };
    updateTheme();
    
    const observer = new MutationObserver(updateTheme);
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  
  return theme;
}
```

### 5.4 Enqueue cote WP

```php
// inaricom-core/src/React/ReactLoader.php
namespace Inaricom\Core\React;

final class ReactLoader {
  private const MANIFEST_PATH = INARICOM_CORE_PATH . '/assets/react/manifest.json';
  
  public function register(): void {
    add_action('wp_enqueue_scripts', [$this, 'enqueue_islands']);
  }
  
  public function enqueue_islands(): void {
    if (!file_exists(self::MANIFEST_PATH)) {
      return;
    }
    
    $manifest = json_decode(file_get_contents(self::MANIFEST_PATH), true);
    
    // Homepage island
    if (is_front_page() && $this->page_has_island('homepage')) {
      $this->enqueue_from_manifest('homepage', $manifest);
    }
  }
  
  private function page_has_island(string $name): bool {
    $content = get_post_field('post_content', get_the_ID());
    return str_contains($content, "[inari_island name=\"{$name}\"]");
  }
  
  private function enqueue_from_manifest(string $entry, array $manifest): void {
    $key = "src/islands/{$entry}.tsx";
    if (!isset($manifest[$key])) return;
    
    $meta = $manifest[$key];
    $base_url = INARICOM_CORE_URL . '/assets/react/';
    
    wp_enqueue_script(
      "inari-island-{$entry}",
      $base_url . $meta['file'],
      [],
      null,
      ['strategy' => 'defer', 'in_footer' => true]
    );
    
    // Module type (ES modules)
    add_filter('script_loader_tag', function($tag, $handle) use ($entry) {
      if ($handle === "inari-island-{$entry}") {
        return str_replace('<script ', '<script type="module" crossorigin ', $tag);
      }
      return $tag;
    }, 10, 2);
    
    // CSS associe
    if (!empty($meta['css'])) {
      foreach ($meta['css'] as $i => $css_file) {
        wp_enqueue_style(
          "inari-island-{$entry}-css-{$i}",
          $base_url . $css_file,
          [],
          null
        );
      }
    }
  }
}
```

### 5.5 Shortcode mount point

```php
// inaricom-core/src/React/ReactMountPoints.php
namespace Inaricom\Core\React;

final class ReactMountPoints {
  public function register(): void {
    add_shortcode('inari_island', [$this, 'render_mount_point']);
  }
  
  public function render_mount_point(array $atts): string {
    $atts = shortcode_atts(['name' => ''], $atts);
    $name = sanitize_key($atts['name']);
    
    if (empty($name)) {
      return '';
    }
    
    // Skeleton loader visible pendant l'hydratation React
    $skeleton = $this->get_skeleton_for($name);
    
    return sprintf(
      '<div id="inari-%s-root" class="inari-island-root" data-island="%s">%s</div>',
      esc_attr($name),
      esc_attr($name),
      $skeleton
    );
  }
  
  private function get_skeleton_for(string $name): string {
    // Skeletons basiques par island, evitent le CLS
    $skeletons = [
      'homepage' => '<div class="inari-skeleton-hero" style="min-height:80vh;background:#0A0A0F;"></div>',
    ];
    return $skeletons[$name] ?? '';
  }
}
```

---

## 6. SEO et performance

### Ce qui reste dans WordPress (inchange)
- Balises `<title>`, `<meta description>`, Open Graph, Twitter Cards via Rank Math
- Schema.org JSON-LD injecte dans `<head>` par `inaricom-core` et Rank Math
- Sitemaps XML, `robots.txt`, `llms.txt` natifs Rank Math
- URLs propres, slugs SEO-friendly geres par WP

### Ce qui est rendu par React (client-side)
- Contenu interactif (hero, cards, animations)
- Mais **pas les balises SEO** — tout le head est gere par WP

### Impact Google bots
- Google execute JavaScript (Googlebot evergreen) → React content indexe normalement
- Pour etre safe : le skeleton HTML WP contient deja un H1 avec le titre fil rouge, crawlable meme sans JS
- Test : `view-source:` sur la home doit montrer le H1 dans le skeleton, pas seulement une div vide

### Performance target
- LCP : le skeleton HTML WP s'affiche en < 1s, React prend le relais apres
- FCP : ~800ms (skeleton)
- TBT : < 200ms (bundle React < 80 KB gzipped)
- CLS : 0 (skeleton a la meme hauteur que le contenu final)

---

## 7. Risques identifies et mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Bundle React trop gros | Perf mobile degradee | Code splitting, lazy load composants 3D, bundle analyzer |
| FOUC lors de l'hydratation | UX degradee | Skeleton HTML matching design final, pas de flash |
| React ne monte pas (404 bundle) | Homepage cassee | Fallback skeleton = au minimum un titre + CTA visibles |
| Pas d'indexation SEO | Perte trafic | Test via Google Search Console URL Inspector regulierement |
| CSP bloquant React | Bundle ne charge pas | Adapter CSP dans `inaricom-security.php` pour `'self'` sur `/wp-content/plugins/inaricom-core/assets/react/` |
| Conflits CSS Kadence vs Tailwind | Design casse | Namespacing Tailwind (`.inari-island-root` scope) ou `@layer` pour prioriser |

---

## 8. Livrables et checkpoints

### Checkpoint 1 (fin session 2.0)
- [ ] `react-islands/` initialise avec Vite + React + Tailwind v4 + shadcn/ui
- [ ] HMR fonctionnel en dev
- [ ] Premier composant minimal visible dans page de preview
- [ ] Commit + push

### Checkpoint 2 (fin session 2.1)
- [ ] Homepage island visuellement complete en dev mode
- [ ] 5 composants : HeroNeutral, PillarCard, ArticleCard, WhySection, FinalCTA
- [ ] Responsive 4 breakpoints valide
- [ ] Accessibility baseline (focus visible, aria-labels)
- [ ] Commit + push

### Checkpoint 3 (fin session 2.2)
- [ ] `ReactLoader.php` + `ReactMountPoints.php` dans inaricom-core
- [ ] Bundle build copie vers assets/react/
- [ ] Shortcode `[inari_island]` fonctionnel en staging
- [ ] Homepage React visible sur staging en brouillon
- [ ] Commit + push

### Checkpoint 4 (fin session 2.3)
- [ ] Swap page_on_front effectue sur staging
- [ ] Page 985 renommee en `/accueil-cybersecurite/`
- [ ] Tests : homepage = React, autres pages = WP classique
- [ ] Commit + push

### Checkpoint 5 (fin session 2.4)
- [ ] Lighthouse 95+ mobile + desktop
- [ ] axe-core 0 violation
- [ ] Visual regression tests passent
- [ ] Prod-ready, pret pour deploy prod

### Deploy prod (decision Kevin)
- [ ] Review finale avec Kevin
- [ ] Deploy via `scripts/deploy-prod.sh`
- [ ] Monitoring 24h (Sentry, UptimeRobot)

---

## 9. Roadmap Phase 2 post-homepage

Apres homepage sortie, itererer sur les autres islands :

### Phase 2.5 — AI Tool Finder (Q3 2026)
- Questionnaire interactif React
- Recommandations IA tools par profil (free/medium/paid)
- Affiliate links integres
- Theme **or** (univers IA)

### Phase 2.6 — Hardware Configurator (Q3-Q4 2026)
- Interface 3D via React Three Fiber + WebGPU
- Probe Rust pour scanner hardware user (optionnel)
- Reco achat via DigiKey API
- Theme **or** (univers IA)

### Phase 2.7 — AI Mastery Hub (Q4 2026)
- Tutoriels Claude/Gemini/ChatGPT/MCP
- Niveaux beginner/intermediate/advanced
- Code playground integre
- Theme **vert** (blog/ressources)

### Phase 2.8 — Pages services cybersec (Q1 2027)
- Landing pages pentest, red team, audit
- Animations premium (parallax, glow effects)
- CTA conversion optimises
- Theme **rouge**

---

## 10. References techniques

- Vite : https://vite.dev
- Tailwind v4 : https://tailwindcss.com/blog/tailwindcss-v4
- shadcn/ui : https://ui.shadcn.com
- React Query : https://tanstack.com/query
- Pattern islands architecture : https://docs.astro.build/en/concepts/islands/
- WPGraphQL (option future) : https://www.wpgraphql.com

---

## Legende status

- [x] : fait et valide
- [ ] : todo
- [~] : en cours
- [!] : bloqueur
