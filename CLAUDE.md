# CLAUDE.md — Inaricom Refactoring Pipeline (v2)

> Brief Claude Code pour la refonte complete du site inaricom.com.
> **Pivot strategique** : positionnement cybersecurite-first (Red Team) + IA.
> Stack : WordPress + WooCommerce + Kadence + React islands (Phase 2).

---

## IDENTITE & POSITIONNEMENT

### Entreprise
- **Nom** : Inaricom (inaricom.com)
- **Siege** : Suisse (Fribourg/Suisse romande)
- **Proprietaire** : Kevin Ronald Mathieu Meunier (entreprise individuelle)
- **Responsable technique site** : Gilles Munier

### Activite — pivot en cours
1. **Pilier 1 (prioritaire)** : Cybersecurite / Red Team / pentest / audit cyber
2. **Pilier 2** : Solutions IA (services, hardware, tutoriels, local-first)
3. **Pilier 3** : Contenu editorial (blog, ressources gratuites, lead magnets)
4. **Pilier 4** : Institutionnel (a propos, contact, legal)

### Cible
- PME suisses (Suisse romande prioritaire)
- Independants, TPE
- CTO / RSSI europeens francophones (FR, BE, LU)
- Dirigeants non-techniques (pedagogie essentielle)

### Positionnement differenciant
- **Convergence unique** : IA + cybersec offensif (pentest LLM, OWASP LLM Top 10)
- **Transparence tarifaire** : grilles CHF/EUR publiques (rupture marche)
- **Local-first / souverainete** : Ollama, Mistral self-hosted, data residency CH
- **Pedagogie double-livrable** : rapport technique + synthese COMEX

---

## SYSTEME DE COULEURS — 4 THEMES

### Mapping semantique (LOGIQUE = THEMATIQUE, pas type de page)

| Theme | Section | Accent | Dark | Light | RGB |
|-------|---------|--------|------|-------|-----|
| **rouge** (defaut) | Securite / Red Team / pentest / cybersec | `#E31E24` | `#B8161B` | `#FF3A40` | `227, 30, 36` |
| **or** | IA (services + boutique hardware + tutos IA) | `#FFD700` | `#B8860B` | `#FFE55C` | `255, 215, 0` |
| **vert** | Blog / ressources / savoir general | `#10B981` | `#059669` | `#34D399` | `16, 185, 129` |
| **bleu** | Institutionnel (a propos, contact, legal) | `#00D4FF` | `#00A8CC` | `#4DE8FF` | `0, 212, 255` |

**Regle** : un article blog sur la cybersecurite s'affiche en ROUGE (thematique secu), un article hardware IA en OR (thematique IA). La couleur suit le sujet, jamais le template.

### Palette fixe (immuable tous themes)

```css
/* Noirs & surfaces */
--inari-black: #0A0A0F;           /* fond principal */
--inari-black-alt: #12121A;       /* fond secondaire */
--inari-black-light: #1A1A24;     /* fond tertiaire */
--inari-black-lighter: #242430;   /* surfaces elevees */

/* Textes */
--inari-white: #FFFFFF;
--inari-text: #F0F0F5;
--inari-text-soft: #B6B0B4;
--inari-text-muted: #8A8A9A;

/* Bordures & glass */
--inari-border: #2A2A35;
--glass-bg: rgba(18, 18, 22, 0.6);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-blur: 16px;
--glass-blur-heavy: 24px;

/* Semantic (JAMAIS le rouge marque pour erreurs UI) */
--semantic-error: #F59E0B;        /* amber */
--semantic-success: #10B981;
--semantic-warning: #F59E0B;
--semantic-info: #00D4FF;
```

### Regles CSS absolues
- **Variable `--inari-red` change selon theme actif** via `[data-theme]` — le code utilise toujours `var(--inari-red)`, jamais les hex en dur
- **Pour opacites** : `rgba(var(--inari-red-rgb), x.x)`
- **Jamais de filtres CSS** pour recolorer le logo — fichiers SVG separes par theme (swap via `content: url()`)
- **Liseret blanc systematique** sur logo : `filter: drop-shadow(0 0 2px rgba(255,255,255,0.6))`

---

## TYPOGRAPHIE

### Choix verrouilles (gratuits, OFL)
- **Geist Sans** (body + UI) — variable font, lisibilite technique, heritee Vercel
- **Geist Mono** (code, CVE, hashes, logs, terminal) — famille coherente
- **Instrument Serif** (display hero + pages manifestes/about/security) — ajoute moment editorial premium

### Hierarchie
- H1 hero : Instrument Serif 64-96px, letter-spacing -0.03em
- H2-H3 : Geist Sans Bold
- Body : Geist Sans Regular 16-18px
- UI/labels : Geist Sans Medium
- Code/mono : Geist Mono (CVE, latences, hashes, terminal)

### Sourcing
- **Geist** : via npm `geist` ou CDN Vercel Fonts (auto-hebergement obligatoire pour nLPD/GDPR — JAMAIS Google Fonts CDN)
- **Instrument Serif** : Google Fonts (mais self-hoste via plugin OMGF)

---

## STACK TECHNIQUE

### Site principal (Phase 1 — maintenu)
- **WordPress** (dernier stable) + **WooCommerce**
- **Theme** : Kadence Classic (pas FSE avant 2027)
- **CSS custom** : plugin Simple Custom CSS and JS
- **PHP custom** : plugin Code Snippets
- **Plugin maison** : `inaricom-core` (CPT, mapping couleurs, hooks metiers)
- **SEO** : Rank Math Free (llms.txt natif)
- **Multilingue** : Polylang Pro (sous-repertoires `/fr/`, `/en/`)

### Phase 2 (Q1-Q3 2027) — React islands + Next.js headless
- **WordPress Interactivity API** (IAPI) pour tabs, filtres, add-to-cart
- **Ilots React** pour configurateur hardware 3D et zones interactives riches
- **Next.js 16** (App Router, RSC, Cache Components) pour frontend premium

### Animation / 3D
- **Fox animation** : migration Canvas 2D -> **OGL + Polyline + glow additif HDR** (15 KB, 60fps mobile)
- **GSAP 3.13+** (gratuit depuis 2025, tous plugins inclus)
- **Lenis** smooth scroll
- **Three.js + R3F** uniquement pour configurateur hardware (Phase 2)
- **Fallback statique** : SVG inline + `filter: drop-shadow()` multicouches (visuellement ~90% de l'animation)

### Hebergement & infra
- **Hebergeur** : Infomaniak (Geneve/Zurich) — nLPD native, ISO 27001
- **CDN/WAF** : Cloudflare (Free tier suffit initialement)
- **Repo** : GitHub `Musyg/Inaricom` (ce repo local)
- **Pipeline** : GitHub Actions + SSH/rsync vers Infomaniak
- **Monitoring** : UptimeRobot + Sentry + Cloudflare Analytics + WPScan daily

### Infrastructure dev
- **Phoenix2** (Windows, Tailscale 100.64.118.71) — machine dev principale
- **Path projet** : `C:\Users\gimu8\Desktop\Inaricom\`
- **Phoenix4** (Windows, Tailscale 100.108.108.100) — secondaire
- **Claude Code** installe (`claude` dans PATH)
- **Skills 3D/animation** : `claudedesignskills` (23 skills) dans `.claude/skills/`

---

## IDENTITE VISUELLE — PRINCIPES

### Direction artistique : **Red Ops**
Defense-grade minimalism + posture red-team confiante + sobriete suisse.

### Recettes visuelles state-of-the-art
1. **Layered dark canvas** : jamais `#000` flat, tier system `#0A0A0F -> #14141C -> #1A1A24`
2. **Noise overlay SVG** 4% opacity `mix-blend-mode: overlay` (kill banding)
3. **Radial glow subtil** par theme (pas neon gaming)
4. **Aurora mesh gradients** themed, drift 30s GSAP
5. **Specular borders Linear-style** : `inset 0 1px 0 0 rgba(255,255,255,0.08)`
6. **Glass cards 2025** : `backdrop-filter: blur(20px) saturate(180%)` — saturate OBLIGATOIRE
7. **Cursor-follow spotlight** (20 lignes JS, ROI enorme)

### Anti-patterns (bannissement strict)
- Matrix code rain (mort depuis 2018)
- Hooded hacker / stock photos cliche
- Generic padlock / shield icons
- Glassmorphism 2021 flat-behind
- Neumorphism
- Bento grids uniform-cells
- Google Fonts via CDN (risque €250 000 Munich)
- Heavy WebGL 3D au hero mobile sans conditional

### References d'inspiration (6 archetypes principaux)
- **Darknode** (palette quasi-identique)
- **Bishop Fox** (stack WP + rouge, archetype red-team)
- **Horizon3.ai** (posture red-team, data-viz attack paths)
- **Linear** (bentogrid + aurora + cursor spotlight)
- **Resend** (minimalisme dev + serif display)
- **Anthropic** (maturite editoriale serif/sans collision)

---

## REGLES COMPORTEMENTALES

### Corrections chirurgicales > reecritures
Si un bloc de 200 lignes a un bug ligne 47, corriger la ligne 47. **Pas** de refactor complet qui casse du code qui marchait.

### Verifier avant d'affirmer
Sur WordPress/WooCommerce/Kadence notamment, si pas sur, le dire. Pas d'affirmation approximative.

### Respecter le contexte etabli
Si une version v18 existe, enchainer sur v19, pas repartir de v1.

### Minimalisme plugin
Aucun plugin inutile. Si 20 lignes PHP suffisent, pas de plugin. Stack mince = perf + securite + maintenance.

### Performance d'abord
Core Web Vitals > feature visuelle. **Lighthouse 95+ non negociable** sur pages commerciales.
Budgets : LCP < 2.5s, INP < 200ms, CLS < 0.1.

### Securite by design
Site cybersec **doit** etre exemplaire : CSP strict, headers securite, pas de secrets en front, sanitation WP, HTTPS + HSTS.

### Pas de conseil juridique/fiscal precis
TVA suisse, droit contractuel : grandes lignes + renvoi vers fiduciaire/avocat.

---

## GUARDRAILS ABSOLUS

- JAMAIS editer `/wp-content/themes/kadence/` directement (toujours child theme)
- JAMAIS d'ecriture directe sur prod (tout via pipeline Git -> Actions -> rsync)
- JAMAIS de hex en dur apres les design tokens
- JAMAIS de filtre CSS pour recolorer le logo
- JAMAIS de refactor complet d'un code qui fonctionne
- JAMAIS `wp search-replace` sans `--dry-run` + backup
- JAMAIS Google Fonts via CDN (risque €250 000)
- JAMAIS le rouge marque pour semantic errors (utiliser amber `#F59E0B`)
- JAMAIS de secrets en dur dans le code (toujours `.env` + gitignore)
- JAMAIS d'auto-update WP Core sans review (filter `WP_AUTO_UPDATE_CORE => 'minor'`)

---

## SOUS-AGENTS CLAUDE CODE (voir `.claude/agents/`)

5 sous-agents specialises, delegation automatique selon contexte :

1. **frontend-kadence** — CSS custom properties `--inari-*`, responsive, GSAP, theme switcher
2. **woo-backend** — Hooks WooCommerce, templates, CPT, WordPress Coding Standards
3. **seo-content** — Rank Math, schema.org, llms.txt, GEO, articles premium
4. **qa-visual** — Chrome DevTools MCP, Playwright, Lighthouse, axe-core WCAG 2.2
5. **security-redteam** — WPScan, hardening wp-config, CSP, WAF, headers securite

Invocation : `/agents` dans Claude Code ou delegation auto.

---

## SLASH COMMANDS (voir `.claude/commands/`)

- `/deploy-staging` — deploy branche courante vers staging
- `/deploy-prod` — deploy main vers prod (confirmation humaine)
- `/visual-qa [url]` — screenshots 3 viewports + axe + Lighthouse
- `/security-scan` — WPScan + headers check + CVE check
- `/new-article [slug]` — scaffold article (outline + research + draft)
- `/backup-db [env]` — dump DB + chiffrement + upload distant

---

## FICHIERS & DOCS CLES

- `@docs/architecture.md` — decisions structurelles
- `@docs/backlog.md` — plan consolide 7 phases
- `@docs/tech-debt.md` — dette technique suivie
- `@docs/session-log.md` — journal sessions (3-5 bullets/jour)
- `@docs/runbooks/` — procedures incident/rollback/DR
- `@PLAN_REFONTE_INARICOM.md` — plan execution detaille
- `.mcp.json` — configuration MCP servers

---

## REGLE D'OR

**Tout outil / page / fonctionnalite doit :**
- reduire un cout, OU
- reduire une dependance, OU
- permettre une decision claire.

Sinon, on ne le construit pas.
