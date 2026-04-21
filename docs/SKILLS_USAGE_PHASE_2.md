# Guide d'utilisation des skills pour Phase 2 React islands

> Document de reference pour Claude Code.
> Explicite quels skills utiliser, quand, et lesquels ignorer.
> Derniere MAJ : 21 avril 2026

---

## Contexte : pourquoi ce document

Le repo Inaricom a **60+ skills** installes (`.claude/skills/` + `.claude/skills/external/`). Claude Code **ne les utilisera pas tous** automatiquement, et certains **ne doivent surtout pas** etre utilises pour la Phase 2 car ils visent d'autres contextes (Claude.ai artifacts vs projet de prod).

Ce document liste les skills pertinents pour **Phase 2 React islands** et donne des regles d'activation claires.

---

## Skills a UTILISER en Phase 2

### 1. `frontend-design` (deja actif dans `.claude/skills/`)

**Quand l'utiliser** : au debut de Phase 2.1 (construction homepage island), pour etablir la direction esthetique et eviter l'"AI slop".

**Ce qu'il apporte** :
- Anti-patterns visuels (pas de purple gradients sur fond blanc, pas d'Inter generique, pas de centered layout fade)
- Direction esthetique audacieuse (choisir un style : refined minimalism, editorial, etc.)
- Guidance typo, couleur, motion, composition

**Comment l'invoquer** :
> "Active le skill frontend-design et applique-le pour construire la homepage island en respectant notre direction Red Ops + fil rouge 'sans boite noire'."

### 2. `web-design-guidelines` (deja actif)

**Quand l'utiliser** : pendant Phase 2.1 (construction composants) et Phase 2.4 (QA), comme reference sur tous les micro-details UX/accessibilite.

**Ce qu'il apporte** : 100+ regles couvrant spacing, typo, contrast, interactive states, hover, focus, motion, accessibility.

**Comment l'invoquer** :
> "Utilise web-design-guidelines pour checker chaque composant avant de le considerer fini."

### 3. `react-best-practices` (deja actif)

**Quand l'utiliser** : en Phase 2.0 (setup Vite + config) et Phase 2.1 (ecriture composants).

**Ce qu'il apporte** : 62 regles perf React/Next.js — hooks, memoization, bundle size, hydration, RSC, Server Actions.

**Comment l'invoquer** :
> "Applique react-best-practices pour tout le code React ecrit en Phase 2."

### 4. `modern-web-design` (deja actif dans `.claude/skills/`)

**Quand l'utiliser** : en Phase 2.1 quand on construit Hero + cards piliers, pour s'inspirer des patterns visuels 2025-2026.

**Ce qu'il apporte** : patterns modernes (aurora mesh, glass cards, bentogrids, cursor spotlight, etc.) — aligne avec les references Inaricom (Linear, Vercel, Resend, Sherlock, Anthropic).

### 5. `impeccable` (deja actif, hub pour /polish /audit /critique etc.)

**Quand l'utiliser** : a la **fin** de chaque sous-phase (2.1 / 2.2 / 2.3), pour raffiner le rendu.

**Comment l'invoquer** : par les slash commands qu'il expose.
- `/polish` — affine les micro-details visuels
- `/audit` — check qualite design
- `/critique` — revue critique constructive
- `/overdrive` — pousse l'esthetique plus loin si rendu trop sage

### 6. `using-superpowers` (deja actif, meta-skill)

**Quand l'utiliser** : au demarrage de Phase 2.1 si on veut challenger le plan avant de coder.

**Ce qu'il apporte** : bootstrap methodologie (TDD, brainstorming, subagents). Charge d'autres skills Superpowers si besoin.

### 7. `react-three-fiber` (deja installe dans `.claude/skills/`)

**Quand l'utiliser** : **PAS maintenant**. Reserve a Phase 2.6 (Hardware Configurator 3D). Ignorer pour Phase 2.0-2.4.

---

## Skills a NE PAS UTILISER en Phase 2

### ❌ `web-artifacts-builder` (deja actif mais **inadapte** ici)

**Pourquoi l'eviter** : ce skill est concu pour creer des **artifacts Claude.ai** (single HTML file bundle avec Parcel inline). Nous, on construit un **vrai projet Vite de production** qui build vers `plugins/inaricom-core/assets/react/`. Les scripts `init-artifact.sh` et `bundle-artifact.sh` ne s'appliquent pas.

**Si Claude Code propose de l'utiliser** : refuser et rappeler qu'on fait un projet Vite standalone, pas un artifact single-file.

### ❌ `webapp-testing` (deja actif)

**Pourquoi le reserver** : utile en Phase 2.4 (QA) mais **pas** en Phase 2.0/2.1. A activer explicitement au moment de la QA, pas avant.

### ❌ Skills de la bibliotheque `external/` (non actifs)

Par defaut : **ne pas les activer** sauf besoin specifique identifie. La philosophie du projet (cf `ACTIVATION.md`) est de garder un contexte Claude Code leger.

---

## Workflow d'activation recommande

### Phase 2.0 (setup Vite + cleanup logo) — SKILLS MINIMAUX

Aucune activation explicite necessaire. Les skills deja en place suffisent :
- `react-best-practices` (pour la config Vite/TypeScript)
- `surgical-fixes` (regle) pour le cleanup snippet 63

**Directive a donner a Claude Code** :
> "Tu peux charger react-best-practices au besoin, mais Phase 2.0 c'est surtout de la config. N'active pas de skills visuels maintenant, ils seront utiles en Phase 2.1."

### Phase 2.1 (homepage island) — STACK VISUELLE COMPLETE

Activer explicitement :
- `frontend-design` → direction esthetique
- `web-design-guidelines` → check UX/a11y
- `modern-web-design` → patterns 2025-2026
- `react-best-practices` → perf React

**Directive a donner a Claude Code au debut de Phase 2.1** :
> "On commence la construction de la homepage island. Charge et applique :
> - frontend-design (anti AI-slop, direction Red Ops)
> - web-design-guidelines (check micro-details)
> - modern-web-design (patterns visuels 2025-2026)
> - react-best-practices (perf React 19)
> 
> Reserve l'usage d'impeccable (/polish /audit /critique) pour la fin de chaque composant.
> 
> N'active PAS web-artifacts-builder (inadapte, c'est pour Claude.ai artifacts)."

### Phase 2.4 (QA) — AJOUTER TESTING + AUDIT

Activer :
- `webapp-testing` → Playwright E2E + screenshots
- `/audit` et `/critique` d'impeccable → revue finale

---

## Skills potentiels pour plus tard (Phase 2.5+)

### Phase 2.6 (Hardware Configurator 3D)
- `react-three-fiber` (deja installe) → R3F + WebGPU
- `threejs-webgl` (deja installe) → primitives Three.js
- `lightweight-3d-effects` (deja installe) → si on veut des effets 3D plus legers

### Phase 2.5 (AI Tool Finder)
- `animated-component-libraries` (deja installe) → animations questionnaire
- `scroll-reveal-libraries` (deja installe) → reveals progressifs
- `motion-framer` (deja installe) → Framer Motion avance

### Phase 2.7 (AI Mastery Hub)
- `barba-js` (deja installe) → transitions entre tutoriels
- `lottie-animations` (deja installe) → animations explicatives

---

## Regles de chargement tokens-friendly

### 1. Un skill charge = du contexte consomme

Chaque skill charge dans le context window Claude Code prend des tokens (metadata + triggers + potentiellement contenu complet). **Ne pas charger plus de 4-5 skills actifs simultanement** pour eviter la degradation.

### 2. Decharger entre les phases

Quand on passe de Phase 2.1 a 2.2, les skills visuels (`frontend-design`, `modern-web-design`) peuvent etre decharges, remplaces par des skills backend (`react-best-practices` reste, les autres varient).

### 3. Invocation explicite > chargement implicite

**Prefere dire** :
> "Utilise frontend-design pour cette section"

**Plutot que** :
> "Fais un beau design"

Claude Code invoquera alors le skill au bon moment, avec le bon contexte.

---

## En resume

| Phase | Skills a activer | Skills a ignorer |
|-------|------------------|------------------|
| 2.0 setup | `react-best-practices` | visuels, testing |
| 2.1 homepage | `frontend-design`, `web-design-guidelines`, `modern-web-design`, `react-best-practices` | `web-artifacts-builder`, 3D skills, testing |
| 2.2 integration WP | minimum | visuels |
| 2.3 swap home | minimum | visuels, testing lourd |
| 2.4 QA | `webapp-testing`, `/audit`, `/critique` | visuels |
| 2.5+ | voir "plus tard" ci-dessus | - |

**Regle d'or** : skills = outils. Claude Code les utilise **quand on lui dit**, **au bon moment**. Ne compte pas sur le chargement automatique — invoque explicitement.
