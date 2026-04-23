# CLAUDE.md — Inaricom Refactoring Pipeline (v3)

> Brief Claude Code pour la refonte complete du site inaricom.com.
> **Pivot strategique** : positionnement cybersecurite-first (Red Team) + IA.
> **Phase 2 React islands DEMARRE** (Q2 2026, avance d un an sur plan initial).
> Stack : WordPress backend + React 19/Tailwind v4 islands pour zones premium.
> Derniere MAJ : 21 avril 2026.

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
- PME et TPE francophones (FR, BE, LU, CH) — marche francophone global, pas de priorite geographique
- Independants / freelances
- CTO / RSSI francophones
- Dirigeants non-techniques (pedagogie essentielle)

### Positionnement differenciant
- **Convergence unique** : IA + cybersec offensif (pentest LLM, OWASP LLM Top 10)
- **Transparence tarifaire** : grilles EUR/CHF publiques (rupture marche)
- **Local-first / self-hosting** : Ollama, Mistral self-hosted, donnees hebergees chez Infomaniak (Europe)
- **Pedagogie double-livrable** : rapport technique + synthese COMEX

---

## SYSTEME DE COULEURS — 5 THEMES

> 🔒 **Palette VERROUILLEE** par decision Kevin Meunier. Regle complete : `.claude/rules/palette-locked.md`
> Claude Code peut creer gradients, halos, opacites a partir de ces couleurs. Mais ne peut PAS introduire de nouvelle teinte.

### Mapping semantique (LOGIQUE = THEMATIQUE, pas type de page)

| Theme | Section | Accent | Dark | Light | RGB |
|-------|---------|--------|------|-------|-----|
| **neutre** | **Homepage** (equite entre piliers, pas de dominance) | `#FFFFFF` | `#E0E0E0` | `#FFFFFF` | `255, 255, 255` |
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
- **Logo IMMUTABLE** : 5 variantes thematiques (rouge default / or / vert / bleu / neutre argent). Swap via `content: url()` sur `[data-theme]`, JAMAIS de filtre CSS pour recolorer. Fichiers et selecteurs dans `.claude/rules/logo-immutable.md` (source de verite unique).
- **Seul effet autorise sur logo** : liseret blanc via `filter: drop-shadow(0 0 2px rgba(255,255,255,0.6))` — rien d'autre.

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

### Phase 2 (Q2 2026 — DEMARRE) — React islands sur WordPress
- **React 19 + TypeScript + Vite** dans `react-islands/` (dev), buildé vers `plugins/inaricom-core/assets/react/` (prod)
- **Tailwind CSS v4** : tokens `--inari-*` via `@theme`, heritage des CSS custom properties WP
- **shadcn/ui** (Radix, WCAG par defaut) + **lucide-react** + **Framer Motion**
- **@tanstack/react-query** pour fetch WP REST API
- **Islands cibles** : homepage (actuelle), AI Tool Finder (2.5), Hardware Config 3D (2.6), AI Mastery Hub (2.7), pages services cybersec (2.8)
- **WordPress Interactivity API** (IAPI) : envisage Phase 3 pour tabs/filtres WooCommerce (pas prioritaire)
- **Next.js 16 headless** : reporte en Phase 3+ (uniquement si besoin reel)
- Plan detaille : `@docs/phase2-react-islands.md`

### Animation / 3D

**Cote WordPress (pages classiques)**
- **Fox animation** : migration Canvas 2D v28 -> **OGL + Polyline + glow additif HDR** (15 KB, 60fps mobile).
  - **Contrainte formelle de silhouette** : la tete/museau du logo DOIT rester identique (meme forme triangulaire caracteristique). Seule l'animation INTERNE change (particules, trace SVG revele, glow breathing, faisceaux lumineux, deformation legere des contours, etc.). Pas de renard 3D realiste, pas de morphing qui casse l'identite.
  - **References visuelles** : `assets/logo-rouge-original.png`, `fox-animation/Fox.svg`, derniere version fonctionnelle `snippets/snippet-443-fox-v28.js`, reference animation narrative Sherlock.xyz pour le timing/storytelling.
- **GSAP 3.13+** (gratuit depuis 2025, tous plugins inclus)
- **Lenis** smooth scroll
- **Fallback statique** : SVG inline + `filter: drop-shadow()` multicouches (visuellement ~90% de l'animation)

**Backgrounds animes par theme (5 animations)**
- Une animation de fond dediee par theme, Canvas 2D vanilla, opacity max 10%, <25 KB total gzipped
- Mapping : `rouge=code flux` (Matrix a la sauce Inari, caracteres hex/ASCII en colonnes eparses) / `or=nodes IA` (graphe de nodes avec signaux) / `vert=reseau neuronal` (layers avec forward pass pulses) / `neutre=constellation convergente` (particules argentees + pulses pilier rares) / `bleu=blueprint grid` (grille architecte avec pulse horizontal)
- Contraintes : `prefers-reduced-motion` respecte avec fallback SVG statique, pause off-screen via IntersectionObserver, couleurs via `var(--inari-red)` (jamais de hex en dur), 60fps desktop / 30fps mobile
- **Specs completes et parametres par animation** : `docs/specs/background-animations.md`

**Cote React islands**
- **Framer Motion 11+** pour anim UI React (entrées, transitions, micro-interactions)
- **React Three Fiber v9** (Phase 2.6) pour configurateur hardware 3D
- **Three.js + WebGPU** pour R3F (fallback WebGL2)
- Respect `prefers-reduced-motion` obligatoire cote WP **et** React

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
Defense-grade minimalism + posture red-team confiante + clarte editoriale.

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

### References d'inspiration (7 archetypes principaux)
- **Darknode** (palette quasi-identique)
- **Bishop Fox** (stack WP + rouge, archetype red-team)
- **Horizon3.ai** (posture red-team, data-viz attack paths)
- **Linear** (bentogrid + aurora + cursor spotlight)
- **Resend** (minimalisme dev + serif display)
- **Anthropic** (maturite editoriale serif/sans collision)
- **Sherlock.xyz** (animations narratives synchronisees au scroll, storytelling visuel par piliers — reference haute priorite pour animations homepage + sections services)

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

## EXISTANT PROD — NE PAS DUPLIQUER

Ecrit et deploye par Gilles Munier. **A NE PAS toucher sans test staging complet**. Pour toute evolution, passer par Gilles.

### `inaricom-security.php` (must-use, 189 lignes)
- **Chemin** : `/home/toriispo/inaricom.com/web/wp-content/mu-plugins/inaricom-security.php`
- **Copie locale** : `audits/plugins-discovered/inaricom-security.php`
- **Audit detaille** : `audits/plugins-discovered/inaricom-security-audit.md`
- **Couvre** : HSTS, CSP complet, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, rate limit login (5/15min/IP), REST user enumeration lockdown, version hiding WP/WC, blocage readme/changelog, security.txt, helper IP Cloudflare-aware.
- **NE PAS redeclarer** ces headers ni ces hooks dans `inaricom-core` ou ailleurs. Les modifications vont dans ce plugin directement.
- **Points d'evolution Phase 2** notes dans l'audit (nonces CSP, rate-limit par username, logging, CSP reporting, audit log admin).

### `inaricom-digikey` (actif, namespace `inaricom/v1`)
- Plugin custom d'integration DigiKey (OAuth fonctionnel)
- **Pas encore audite** — a inspecter quand on travaillera sur le configurateur hardware.

### Snippets WooCommerce (via plugin Code Snippets, hook `template_redirect`)
1. **Coming Soon Red Team** (actif, v2 avec REST bypass) — message retour juillet 2026, signature "Your Red Team", contact security@inaricom.com
2. **Bypass Coming Soon API** (actif) — hook `pre_option_woocommerce_coming_soon` pour permettre l'auth REST meme pendant le mode Coming Soon
3. ~~Restore Authorization Header~~ (desactivable, inutile — le `.htaccess` racine forwarde deja `HTTP_AUTHORIZATION`)

### Architecture WordPress particuliere
- **WP_SITEURL** = `https://inaricom.com/web` (fichiers physiques dans `/web/`)
- **WP_HOME** = `https://inaricom.com` (URL publique = racine)
- **Consequence critique** : REST API accessible UNIQUEMENT a la racine `/wp-json/`, **jamais** dans `/web/wp-json/` (404).
- Ref pattern : https://developer.wordpress.org/advanced-administration/server/wordpress-in-directory/

### Acces prod operationnel
- **SSH** : `ssh inaricom` (alias dans `~/.ssh/config`) — user `toriispo`, host `web24.swisscenter.com:22`, cle `~/.ssh/inaricom_swisscenter`
- **WP-CLI 2.12.0** dispo globalement sur serveur (`/usr/local/bin/wp`)
- **PHP 8.5.4** (binaire `/usr/local/bin/php85`, detection auto dans `~/inaricom.com/`)
- **REST API auth** : Basic Auth avec ck/cs dans `.env` (variables `WC_CONSUMER_KEY/SECRET`)
- **WooCommerce MCP natif** : `https://inaricom.com/wp-json/woocommerce/mcp` (JSON-RPC 2.0)

### Headers HTTP deja en place (source = inaricom-security)
Audit baseline 17/04/2026 confirme : HSTS 1 an + preload, CSP stricte, X-Frame DENY, frame-ancestors 'none', X-Content-Type nosniff, Referrer-Policy strict, Permissions-Policy restrictive, Cloudflare NEL monitoring. **Ne rien redeclarer ailleurs, l'existant est propre.**

---

## GUARDRAILS ABSOLUS

- JAMAIS editer `/wp-content/themes/kadence/` directement (toujours child theme)
- JAMAIS d'ecriture directe sur prod (tout via pipeline Git -> Actions -> rsync)
- JAMAIS de hex en dur apres les design tokens
- JAMAIS de filtre CSS pour recolorer le logo
- JAMAIS creer, modifier, regenerer ou proposer un nouveau logo (voir `.claude/rules/logo-immutable.md`)
- JAMAIS supprimer ou fusionner les 5 variantes thematiques du logo (rouge/or/vert/bleu/neutre argent — toutes actives via swap `[data-theme]`)
- JAMAIS utiliser "Suisse" comme argument marketing (badge, slogan, trust-signal, "Swiss made", "sobriete suisse", etc.) — la Suisse est un fait legal/technique, pas un argument. Voir `.claude/rules/no-swiss-marketing.md`.
- JAMAIS introduire une couleur hors palette (pas de violet/orange/rose — 5 themes verrouilles, voir `.claude/rules/palette-locked.md`)
- JAMAIS utiliser les classes Tailwind defaut (`red-500`, `emerald-400`, etc.) pour des accents de marque (utiliser les tokens `--inari-*`)
- JAMAIS substituer ou "moderniser" une couleur de la palette existante
- JAMAIS de refactor complet d'un code qui fonctionne
- JAMAIS `wp search-replace` sans `--dry-run` + backup
- JAMAIS Google Fonts via CDN (risque €250 000)
- JAMAIS le rouge marque pour semantic errors (utiliser amber `#F59E0B`)
- JAMAIS de secrets en dur dans le code (toujours `.env` + gitignore)
- JAMAIS d'auto-update WP Core sans review (filter `WP_AUTO_UPDATE_CORE => 'minor'`)
- JAMAIS utiliser `npm install` sur un projet Inaricom - toujours `pnpm` (voir `.claude/rules/npm-security.md`)
- JAMAIS de versions floating (`^1.2.0`, `~1.2.0`) dans `package.json` - toujours versions EXACTES
- JAMAIS ignorer un `pnpm audit` CRITICAL ou HIGH - STOP immediat et rollback

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
- `@docs/backlog.md` — plan consolide 8 phases
- `@docs/tech-debt.md` — dette technique suivie
- `@docs/session-log.md` — journal sessions (3-5 bullets/jour)
- `@docs/runbooks/` — procedures incident/rollback/DR
- `@docs/phase2-react-islands.md` — plan complet React islands (NEW)
- `@docs/BRIEF_CLAUDE_CODE_PHASE_2.0.md` — brief setup Vite pour Claude Code (NEW)
- `@PLAN_REFONTE_INARICOM.md` — plan execution detaille v3
- `.mcp.json` — configuration MCP servers
- `react-islands/` — projet React/Tailwind (NEW Phase 2)

---

## REGLE D'OR

**Tout outil / page / fonctionnalite doit :**
- reduire un cout, OU
- reduire une dependance, OU
- permettre une decision claire.

Sinon, on ne le construit pas.
