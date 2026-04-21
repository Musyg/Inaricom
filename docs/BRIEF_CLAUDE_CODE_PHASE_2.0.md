# Brief Claude Code — Demarrer Phase 2.0 (setup React islands)

> Document d'execution pour Claude Code.  
> Charge `@docs/phase2-react-islands.md` pour le contexte complet.  
> Charge `@CLAUDE.md` pour les regles projet.

Date : 2026-04-21  
Sous-agent responsable : `frontend-kadence`

---

## Objectif de cette session

Mettre en place le dossier `react-islands/` operationnel avec :
- Vite + React 19 + TypeScript
- Tailwind v4 avec tokens `--inari-*` heritant des CSS custom properties WP
- shadcn/ui initialise
- HMR fonctionnel en dev

**Pas de code applicatif cette session** — uniquement l'infra.  
La homepage sera faite en Phase 2.1 (session suivante).

---

## Commandes a executer (dans l'ordre)

### 1. Creer le dossier et initialiser Vite

```bash
cd ~/Desktop/Inaricom
npm create vite@latest react-islands -- --template react-ts
cd react-islands
```

### 2. Installer les dependances

```bash
# Core
npm install

# Tailwind v4
npm install -D tailwindcss @tailwindcss/vite

# shadcn/ui (init apres Tailwind configure)
# -> on fait en etape 6

# Data fetching + anim
npm install @tanstack/react-query framer-motion lucide-react

# Utilitaires shadcn
npm install class-variance-authority clsx tailwind-merge
```

### 3. Configurer Vite pour multi-entry + output vers inaricom-core

Remplacer `vite.config.ts` par :

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    manifest: true,
    outDir: '../plugins/inaricom-core/assets/react',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        homepage: path.resolve(__dirname, 'src/islands/homepage.tsx'),
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
  },
});
```

### 4. Configurer `tsconfig.json` pour les alias

Ajouter dans `compilerOptions` :

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 5. Creer `src/styles/globals.css` avec Tailwind v4 + tokens Inaricom

```css
@import "tailwindcss";

@theme {
  /* Palette fixe (immuable tous themes) */
  --color-inari-black: #0A0A0F;
  --color-inari-black-alt: #12121A;
  --color-inari-black-light: #1A1A24;
  --color-inari-black-lighter: #242430;
  
  --color-inari-white: #FFFFFF;
  --color-inari-text: #F0F0F5;
  --color-inari-text-soft: #B6B0B4;
  --color-inari-text-muted: #8A8A9A;
  
  --color-inari-border: #2A2A35;
  
  /* Accent — suit le theme WP courant via CSS custom property */
  /* Quand body.theme-neutre : --inari-red = #FFFFFF */
  /* Quand body.theme-rouge : --inari-red = #E31E24 */
  /* etc. */
  --color-inari-accent: var(--inari-red);
  
  /* Fonts */
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;
  --font-serif: 'Instrument Serif', ui-serif, serif;
  
  /* Radii */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 22px;
}

/* Reset pour les mounts points (pas de styles parasites WP) */
.inari-island-root {
  all: initial;
  font-family: var(--font-sans);
  color: var(--color-inari-text);
}

.inari-island-root * {
  box-sizing: border-box;
}
```

### 6. Initialiser shadcn/ui

```bash
npx shadcn@latest init
```

Repondre aux prompts :
- Style : **New York** (le plus moderne)
- Base color : **Neutral**
- CSS variables : **Yes**
- Path alias : `@/components` (deja configure)

### 7. Creer la structure de dossiers

```bash
mkdir -p src/islands
mkdir -p src/components/ui
mkdir -p src/components/hero
mkdir -p src/components/cards
mkdir -p src/components/layout
mkdir -p src/hooks
mkdir -p src/lib
```

### 8. Creer un island minimal de test

Fichier `src/islands/homepage.tsx` :

```tsx
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';

function Homepage() {
  return (
    <div className="min-h-screen bg-inari-black text-inari-text p-8">
      <h1 className="font-serif text-6xl">Inaricom</h1>
      <p className="mt-4 text-inari-text-soft">
        React island setup OK — Phase 2.0 validee
      </p>
    </div>
  );
}

const rootEl = document.getElementById('inari-homepage-root');
if (rootEl) {
  createRoot(rootEl).render(<Homepage />);
}
```

### 9. Creer `index.html` de preview (dev only)

Remplacer `index.html` genere par Vite avec :

```html
<!doctype html>
<html lang="fr" data-theme="neutre">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Inaricom — React islands dev</title>
  </head>
  <body class="theme-neutre" style="margin:0;background:#0A0A0F;">
    <!-- On simule le <body class="theme-neutre"> + data-theme que pose ThemeMapper PHP -->
    <div id="inari-homepage-root"></div>
    <script type="module" src="/src/islands/homepage.tsx"></script>
  </body>
</html>
```

### 10. Lancer le dev server

```bash
npm run dev
```

Ouvrir `http://localhost:5173` → doit afficher :
- Fond noir
- H1 "Inaricom" en Instrument Serif
- Sous-titre "React island setup OK..."
- HMR actif (modifier le texte → update instantane sans reload)

### 11. Tester le build

```bash
npm run build
```

Verifier que :
- `plugins/inaricom-core/assets/react/` est bien cree
- Il contient `manifest.json`, `js/homepage-XXX.js`, `css/XXX.css`
- Pas d'erreurs TypeScript

### 12. Ajouter au `.gitignore`

A la racine du repo Inaricom, ajouter dans `.gitignore` :

```gitignore
# React islands
react-islands/node_modules/
react-islands/dist/
react-islands/.vite/
```

### 13. Commit + push

```bash
cd ~/Desktop/Inaricom
git add react-islands/ plugins/inaricom-core/assets/react/ .gitignore
git commit -m "Phase 2.0: setup Vite + React 19 + Tailwind v4 + shadcn/ui

- Creation react-islands/ avec template Vite React-TS
- Tailwind v4 via @tailwindcss/vite
- @theme heritant des tokens --inari-* du snippet 347 WP
- shadcn/ui initialise (style New York, Neutral)
- Multi-entry Vite, output vers plugins/inaricom-core/assets/react/
- Island test homepage montrant que l'infra fonctionne
- HMR valide en dev"
git push origin main
```

---

## Livrables attendus fin de session

- [x] `react-islands/` initialise et fonctionnel
- [x] `vite.config.ts` configure pour multi-entry + output WP
- [x] `src/styles/globals.css` avec `@theme` et tokens Inaricom
- [x] shadcn/ui initialise (`components.json` present)
- [x] Structure de dossiers prete pour Phase 2.1
- [x] Island test `homepage.tsx` minimal qui monte
- [x] `npm run dev` fonctionne sur localhost:5173
- [x] `npm run build` genere les bundles dans `inaricom-core/assets/react/`
- [x] Commit pushed sur main

---

## Next session (Phase 2.1)

Une fois Phase 2.0 committee, on attaque :
- HeroNeutral (titre fil rouge + sous-titre + scroll indicator)
- PillarCard generique + 3 instances (cybersecurite, IA, ressources)
- WhySection (4 points-cles)
- ArticleCard + hook useWPPosts (fetch via WP REST API)
- FinalCTA

Tous les composants devront respecter :
- `prefers-reduced-motion` sur animations
- Responsive 375/768/1280/1920
- Accessibility baseline (focus visible, aria-labels)
- Utilisation exclusive des tokens `--inari-*` via classes Tailwind

---

## Pieges a eviter

1. **Ne PAS activer le child theme Kadence** pour l'instant (preservera `theme_mods_kadence` parent)
2. **Ne PAS toucher a `inaricom-security.php`** (mu-plugin, Gilles only)
3. **Ne PAS Google Fonts via CDN** — Geist et Instrument Serif doivent etre self-hostes (deja dans kadence-child/assets/fonts/)
4. **Ne PAS hardcoder les couleurs** dans les composants React — toujours classes Tailwind avec tokens `--inari-*`
5. **Ne PAS importer GSAP dans les bundles React** — Framer Motion pour les animations UI cote React, GSAP reste cote WP

---

## Ressources

- `@docs/phase2-react-islands.md` — plan complet Phase 2
- `@docs/architecture.md` — decisions structurelles projet
- `@CLAUDE.md` — regles projet + guardrails
- Vite docs : https://vite.dev
- Tailwind v4 : https://tailwindcss.com/docs/installation/using-vite
- shadcn/ui : https://ui.shadcn.com/docs/installation/vite
