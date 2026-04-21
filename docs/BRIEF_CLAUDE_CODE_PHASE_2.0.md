# Brief Claude Code — Demarrer Phase 2.0 (setup React islands)

> Document d'execution pour Claude Code.  
> Charge `@docs/phase2-react-islands.md` pour le contexte complet.  
> Charge `@CLAUDE.md` pour les regles projet.  
> Charge `@.claude/rules/logo-immutable.md` pour la regle logo.  
> Charge `@.claude/rules/palette-locked.md` pour la regle palette.  
> Charge `@.claude/rules/npm-security.md` pour la regle supply chain.

Date : 2026-04-21 (MAJ securite supply chain)  
Sous-agent responsable : `frontend-kadence`

---

## CONTRAINTES DURES — LIRE AVANT DE CODER

Cette session installe l'infra React. Meme si aucun code applicatif n'est ecrit ici, Claude Code DOIT internaliser ces regles car elles s'appliqueront des la Phase 2.1 :

### 🔒 Logo IMMUTABLE
- Le logo Inaricom actuel (`cropped-LogoLong4White-1.png`) est **verrouille par decision du proprietaire Kevin Meunier**
- **Ne PAS creer, regenerer, modifier, remplacer, ou proposer de nouveau logo**
- **Ne PAS creer de variantes thematiques** (pas de logo or/vert/bleu/argent)
- **Ne PAS inclure de logo dans les components React** — le logo est rendu cote WordPress (header Kadence)
- Voir regle complete : `.claude/rules/logo-immutable.md`

### 🔒 Palette 5 themes VERROUILLEE
- 5 couleurs d'accent arbitrees par Kevin : **neutre (argent), rouge (secu), or (IA), vert (blog), bleu (institutionnel)**
- **Ne PAS introduire** de nouvelle couleur (violet, orange, cyan custom, rose)
- **Ne PAS utiliser** les Tailwind defaults (`red-500`, `amber-400`, `emerald-500`) pour les accents de marque
- ✅ **Autorise** : gradients, halos, glows, opacites **a partir des 5 couleurs**
- ✅ **Autorise** : creation de nuances derivees (`rgba(var(--inari-red-rgb), 0.15)`)
- Voir regle complete : `.claude/rules/palette-locked.md`

### 🔒 Securite supply chain npm — PNPM obligatoire
- **Interdiction d'utiliser `npm install`** pour installer des dependances projet
- **Utiliser `pnpm` exclusivement** (v10.33.0+ deja installe sur Phoenix2)
- pnpm bloque les `postinstall` scripts par defaut (vecteur attaque Axios 31 mars 2026)
- Config globale deja en place : `ignore-scripts=true`, `min-release-age=7j`, `strict-dep-builds=true`
- **Versions pinees exactes** dans `package.json` (pas de `^` ni `~`)
- **Audit obligatoire** apres install : `pnpm audit --prod`
- Voir regle complete : `.claude/rules/npm-security.md`

### 🔒 Pas de hex hardcodes
- Tous les couleurs via tokens `--inari-*` mappes en classes Tailwind
- Pas de `#FF3A40` ou `#FFD700` ecrit en dur dans les composants

### 🔒 Fonts self-hostees
- Geist + Instrument Serif deja self-hostes dans `kadence-child/assets/fonts/`
- **Ne PAS ajouter `<link>` vers Google Fonts CDN** (risque legal €250k)

### 🔒 Ne pas modifier l'existant
- `inaricom-security.php` (must-use Gilles) = intouchable
- `inaricom-core/` existant = etendre, pas reecrire
- Snippet 347 en DB = ne pas dupliquer (le lire via CSS custom properties)

---

## Objectif de cette session

Mettre en place le dossier `react-islands/` operationnel avec :
- Vite + React 19 + TypeScript
- Tailwind v4 avec tokens `--inari-*` heritant des CSS custom properties WP
- shadcn/ui initialise
- HMR fonctionnel en dev
- **pnpm comme package manager** (pas npm)

**Pas de code applicatif cette session** — uniquement l'infra.  
La homepage sera faite en Phase 2.1 (session suivante).

---

## Commandes a executer (dans l'ordre)

### 0. Cleanup reliquats logo (a faire AVANT setup React)

Le logo est desormais unifie. Ces 4 fichiers PNG et les regles CSS associees sont obsoletes :

**a. Retirer du snippet 63 (theme-neutre)** — editer `audits/snippet-63-theme-neutre.css` :

Supprimer ces blocs :

```css
/* Logo : version argentee (Design-sans-titre-17.png) via content: url(...) */
[data-theme="neutre"] .site-logo img,
[data-theme="neutre"] .custom-logo {
  content: url('https://staging.inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-17.png');
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.55));
}

.theme-neutre img.custom-logo {
  opacity: 0;
}

.theme-neutre .site-branding .brand.has-logo-image {
  background-image: url('https://staging.inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-17.png');
  ...
}
```

Remplacer par (un seul halo commun) :

```css
/* Logo : le logo rouge natif reste sur theme-neutre, avec halo renforce */
body.theme-neutre .site-logo img,
body.theme-neutre .custom-logo {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.55));
}
```

**b. Retirer aussi les swaps logo des autres themes** (si presents dans le 347) :

Chercher `[data-theme="or"] .site-logo img`, `[data-theme="bleu"] ...`, `[data-theme="vert"] ...` dans le 347 et supprimer les regles `content: url(...)` + les `.theme-X img.custom-logo { opacity: 0 }` + les background-image sur `.site-branding`. Garder uniquement le logo natif rouge avec drop-shadow standard.

**c. Rebuild + push 347** :

```bash
cd ~/Desktop/Inaricom
python scripts/_build_347.py
scp audits/347-REFACTORED-B5.css inaricom:/tmp/
ssh inaricom 'bash /tmp/_push_b5_nokses.sh && bash /tmp/_force_resync.sh'
```

**d. Supprimer les PNG obsoletes sur le serveur** :

```bash
ssh inaricom 'rm /home/toriispo/inaricom.com/web-staging/wp-content/uploads/2026/01/Design-sans-titre-13*.png /home/toriispo/inaricom.com/web-staging/wp-content/uploads/2026/01/Design-sans-titre-15*.png /home/toriispo/inaricom.com/web-staging/wp-content/uploads/2026/01/Design-sans-titre-16*.png /home/toriispo/inaricom.com/web-staging/wp-content/uploads/2026/01/Design-sans-titre-17*.png'
```

**e. Verification via Chrome integration** :

Via l'integration Chrome deja active (credentials staging memorises), Claude Code peut :
1. Naviguer sur https://staging.inaricom.com/
2. Inspecter le DOM pour verifier la balise `<img class="custom-logo">` et son `src`
3. Faire de meme sur /shop/ , /articles/ , /contact/
4. Confirmer que le logo rouge natif (`cropped-LogoLong4White-1.png`) s'affiche partout

**f. Commit cleanup** :

```bash
git add audits/snippet-63-theme-neutre.css audits/347-REFACTORED-B5.css audits/347-REFACTORED-B4-PLUS-IREMAP.css
git commit -m "Cleanup reliquats logo variants (theme-neutre + 4 PNG obsoletes)"
git push origin main
```

Une fois ces etapes faites, on peut passer au setup Vite.

---

### 1. Creer le dossier et initialiser Vite (via pnpm)

```bash
cd ~/Desktop/Inaricom
pnpm create vite@latest react-islands --template react-ts
cd react-islands
```

**Note securite** : `pnpm create` respecte `min-release-age` global (7j). Si Vite est ultra-recent (<7j), pnpm prendra la version precedente stable. C'est le comportement voulu.

### 2. Figer les versions AVANT install

**Pinner toutes les deps** dans `package.json` (pas de `^` ni `~`). Editer le `package.json` genere pour remplacer :
- `"react": "^19.x.x"` → `"react": "19.1.0"` (verifier la version stable actuelle via `pnpm view react version`)
- Idem pour `react-dom`, `@vitejs/plugin-react`, `vite`, `typescript`, `@types/*`

### 3. Installer les dependances avec pnpm (deps critiques seulement)

```bash
# Core (deja dans package.json genere)
pnpm install

# Audit immediat apres install
pnpm audit --prod
# Doit retourner 0 vulnerability (sinon STOP et analyser)

# Tailwind v4 (versions pinees)
pnpm add -D tailwindcss@4.0.0 @tailwindcss/vite@4.0.0
# Verifier les versions reellement installees (pnpm peut ajuster via min-release-age)

# Data fetching + animations
pnpm add @tanstack/react-query framer-motion lucide-react

# Utilitaires shadcn
pnpm add class-variance-authority clsx tailwind-merge
```

**IMPORTANT — Verification explicite apres chaque `pnpm add`** :

```bash
# Check absence packages compromis (Axios attack 31 mars 2026)
grep -E "axios@1\.14\.1|axios@0\.30\.4|plain-crypto-js" pnpm-lock.yaml
# Doit retourner RIEN (exit code 1). Si ca matche -> STOP, rollback, alerter Gilles.

# Audit complet
pnpm audit --prod --audit-level=moderate
# Doit retourner "No known vulnerabilities found"
```

### 4. Configurer Vite pour multi-entry + output vers inaricom-core

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

### 5. Configurer `tsconfig.json` pour les alias

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

### 6. Creer `.npmrc` projet (redondance securite)

Creer `react-islands/.npmrc` :

```
ignore-scripts=true
min-release-age=10080
audit-level=moderate
```

### 7. Creer `src/styles/globals.css` avec Tailwind v4 + tokens Inaricom

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

### 8. Initialiser shadcn/ui (via pnpm dlx)

```bash
pnpm dlx shadcn@latest init
```

**Note** : `pnpm dlx` remplace `npx`. Il respecte aussi `ignore-scripts`.

Repondre aux prompts :
- Style : **New York** (le plus moderne)
- Base color : **Neutral**
- CSS variables : **Yes**
- Path alias : `@/components` (deja configure)

### 9. Creer la structure de dossiers

```bash
mkdir -p src/islands
mkdir -p src/components/ui
mkdir -p src/components/hero
mkdir -p src/components/cards
mkdir -p src/components/layout
mkdir -p src/hooks
mkdir -p src/lib
```

### 10. Creer un island minimal de test

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

### 11. Creer `index.html` de preview (dev only)

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
    <div id="inari-homepage-root"></div>
    <script type="module" src="/src/islands/homepage.tsx"></script>
  </body>
</html>
```

### 12. Lancer le dev server

```bash
pnpm dev
```

Ouvrir `http://localhost:5173` → doit afficher :
- Fond noir
- H1 "Inaricom" en Instrument Serif
- Sous-titre "React island setup OK..."
- HMR actif (modifier le texte → update instantane sans reload)

### 13. Tester le build

```bash
pnpm build
```

Verifier que :
- `plugins/inaricom-core/assets/react/` est bien cree
- Il contient `manifest.json`, `js/homepage-XXX.js`, `css/XXX.css`
- Pas d'erreurs TypeScript

### 14. Ajouter au `.gitignore`

A la racine du repo Inaricom, ajouter dans `.gitignore` :

```gitignore
# React islands
react-islands/node_modules/
react-islands/dist/
react-islands/.vite/
```

### 15. Commit + push

```bash
cd ~/Desktop/Inaricom
git add react-islands/ plugins/inaricom-core/assets/react/ .gitignore
git commit -m "Phase 2.0: setup Vite + React 19 + Tailwind v4 + shadcn/ui (pnpm-secure)

- Creation react-islands/ avec template Vite React-TS
- Package manager : pnpm (ignore-scripts, min-release-age 7j, strict-dep-builds)
- Versions toutes pinees (pas de ^ ni ~) dans package.json
- pnpm-lock.yaml committed pour reproductibilite
- Tailwind v4 via @tailwindcss/vite
- @theme heritant des tokens --inari-* du snippet 347 WP
- shadcn/ui initialise (style New York, Neutral)
- Multi-entry Vite, output vers plugins/inaricom-core/assets/react/
- Island test homepage montrant que l'infra fonctionne
- HMR valide en dev
- pnpm audit : 0 vulnerability"
git push origin main
```

---

## Livrables attendus fin de session

- [x] `react-islands/` initialise et fonctionnel
- [x] `pnpm-lock.yaml` committed (pas package-lock.json)
- [x] `.npmrc` projet-level present
- [x] `vite.config.ts` configure pour multi-entry + output WP
- [x] `src/styles/globals.css` avec `@theme` et tokens Inaricom
- [x] shadcn/ui initialise (`components.json` present)
- [x] Structure de dossiers prete pour Phase 2.1
- [x] Island test `homepage.tsx` minimal qui monte
- [x] `pnpm dev` fonctionne sur localhost:5173
- [x] `pnpm build` genere les bundles dans `inaricom-core/assets/react/`
- [x] `pnpm audit --prod` retourne 0 vulnerability
- [x] Aucune mention de `axios@1.14.1`, `axios@0.30.4`, `plain-crypto-js` dans le lockfile
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
6. **Ne JAMAIS utiliser `npm install`** — toujours `pnpm` (voir `.claude/rules/npm-security.md`)
7. **Ne JAMAIS `pnpm install <package>@latest`** — toujours version pinee exacte

---

## En cas de probleme supply chain

Si `pnpm add` refuse un package pour `min-release-age` :
- NE PAS forcer avec `--ignore-min-release-age`
- Prendre la version N-1 stable (celle d'il y a plus de 7 jours)
- Logger l'incident dans `.claude/logs/phase2-0-issues.md`

Si `pnpm audit` trouve une vulnerabilite :
- CRITICAL/HIGH : STOP immediat, rollback, alerter Gilles dans un report
- MODERATE : logger, continuer SEULEMENT si override possible sans impact prod
- LOW : logger, continuer

---

## Ressources

- `@docs/phase2-react-islands.md` — plan complet Phase 2
- `@docs/architecture.md` — decisions structurelles projet
- `@CLAUDE.md` — regles projet + guardrails
- `@.claude/rules/npm-security.md` — regle supply chain
- pnpm docs : https://pnpm.io
- Vite docs : https://vite.dev
- Tailwind v4 : https://tailwindcss.com/docs/installation/using-vite
- shadcn/ui : https://ui.shadcn.com/docs/installation/vite
- CISA Axios advisory : https://www.cisa.gov/news-events/alerts/2026/04/20/supply-chain-compromise-impacts-axios-node-package-manager
