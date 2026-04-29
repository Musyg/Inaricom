# Backlog Inaricom — plan consolide

> Vue transversale : priorites actuelles, tickets en cours, roadmap par phase.
> Source de verite pour "sur quoi on bosse aujourd'hui".

Derniere MAJ : 29 avril 2026

---

## Priorites immediates (cette semaine — Post bascule prod + perf optim)

| # | Tache | Agent | Impact | Effort |
|---|-------|-------|--------|--------|
| 1 | ~~**Bascule prod**~~ FAIT 2026-04-29 (tag `prod-20260429-144213`) | frontend-kadence | — | — |
| 2 | ~~**Verifier pages WP prod**~~ FAIT : 1064 (homepage), 1066 (IA, pas 1078), 985 (cybersec) avec shortcodes en place + 7 pages legales en island | woo-backend | — | — |
| 3 | ~~**Ticket P1 `perf/fox-paths-worker`**~~ FAIT 2026-04-29 : Web Worker decharge fetch + JSON.parse 2.3 MB + stitch O(n²) + split + trim. Worker chunk 3.65 KB autonome, fallback main thread. Mesure Lighthouse Pass 5 a faire pour confirmer -30 ms LCP mobile. | frontend-kadence | — | — |
| 4 | ~~**Fix CLAUDE.md Infomaniak->SwissCenter**~~ FAIT 2026-04-29 (CLAUDE.md + 12 fichiers connexes alignes sur SwissCenter) | — | — | — |

**Phase 2 React islands FINIE** (12 commits `6bd4cd8..884c106` merges 29 avril) — voir `docs/session-log.md` du 29 avril.

QA Lighthouse Pass 4 = **GO** sur 6/6 configs (devtools no-throttle) :
- Homepage / IA / cybersec : LCP 1.5-2.5 s · TBT 0-73 ms · A11y 100/100 · 0 axe critical/serious
- Une seule reserve : LCP homepage mobile 2529 ms (+29 ms) — pre-existant FoxAnimationV29, traite par ticket P1.

---

## Phase 0 — Fondations infra (Q2 2026)

### Status : 85% — repo OK, MCP OK, CI/CD a finaliser

- [x] Git repo local + GitHub `Musyg/Inaricom`
- [x] 23 skills claudedesignskills installes (`.claude/skills/`)
- [x] `CLAUDE.md` v2 actualise (pivot securite-first)
- [x] `.claude/agents/` (5 sous-agents)
- [x] `.claude/settings.json`
- [x] `.mcp.json` (scope projet)
- [x] `docs/architecture.md`
- [x] `docs/backlog.md` (ce fichier)
- [x] Staging SwissCenter provisionne + clone prod fonctionnel (sous-domaine staging.inaricom.com, meme SSH host que prod)
- [x] SSH staging + prod (alias `inaricom`)
- [x] Scripts deploy (`sync-from-prod.sh`, `db-backup.sh`, `db-clone-prod-to-staging.sh`)
- [x] mu-plugin `staging-hardening.php` (noindex + banner + mail-block)
- [x] `.gitignore` propre (secrets, node_modules, vendor, .env)
- [x] Cles API hors Desktop (`C:\Users\gimu8\.secrets\`)
- [ ] `.claude/commands/` slash commands custom (deploy-staging, visual-qa, etc.)
- [ ] `.claude/rules/` regles fixes (security-first, css-custom-properties, surgical-fixes deja crees)
- [ ] GitHub Actions : `security.yml`, `lighthouse.yml`, `playwright.yml`, `deploy.yml`
- [ ] Secrets management (GitHub Secrets + 1Password CLI)
- [ ] Auth HTTP basique staging via Apanel

---

## Phase 1 — Design System + Homepage Red Ops (Q3 2026)

### Status : 85% — infra tokens + 5 themes operationnels

**Fait (Phase 1.A + 1.B)**
- [x] Plugin `inaricom-core` v0.1 : 3 CPT (resource, case_study, service)
- [x] Taxonomy `inaricom_pillar` avec 4 piliers seedes (securite, ia, blog, institutionnel)
- [x] `ThemeMapper.php` : injection automatique `data-theme` + body class selon contexte
- [x] `SchemaInjector.php` : JSON-LD Organization, Service, Article, BlogPosting
- [x] AdminMenu consolide
- [x] PHPCS + PSR-4 + composer.json propres
- [x] Snippet 347 DB : tokens `--inari-*` complets + 4 themes via `[data-theme]`
- [x] Section 61 (hero + icones cards), 62 (blog cards), 63 (theme-neutre homepage)
- [x] Logo 4 variantes thematiques + logo argente (Design-sans-titre-13/15/16/17)
- [x] Fox animation Canvas 2D v28 : 5 themes supportes (rouge/or/vert/bleu/neutre)
- [x] Child theme Kadence scaffold (pas actif en staging, preserve theme_mods_kadence parent)
- [x] Self-host Inter fonts (nLPD/GDPR compliant, Phase 1.B0)
- [x] Menu principal reorganise (Contact en fin, Mentions legales retiree du menu principal)
- [x] Theme switcher UI supprime definitivement (arbitrage couleurs fait, plus besoin)

**A faire (Phase 1.C — fox animation et header complet)**
- [ ] Fox animation : migration Canvas 2D v28 -> OGL + glow additif HDR (P2, 6-8 jours). **Contrainte silhouette : tete/museau du logo identique (forme triangulaire), seule l'animation INTERNE change. Pas de renard 3D realiste.** Ref : `assets/logo-rouge-original.png`, `fox-animation/Fox.svg`, `snippets/snippet-443-fox-v28.js`, animation narrative Sherlock.xyz.
- [ ] Hero homepage actuelle (page 985) : sera replacee par React island Phase 2
- [ ] Noise overlay SVG 4% opacity
- [ ] Radial glow + aurora mesh sur pages avec hero (pas homepage, c'est React maintenant)
- [ ] Cursor-follow spotlight (ROI eleve, 20 lignes JS) sur pages services
- [ ] Glass cards premium (blur 20px + saturate 180%) generalisees
- [ ] **Backgrounds animes par theme (5 animations)** — Canvas 2D vanilla, opacity max 10%, <25 KB total gzipped, respect `prefers-reduced-motion`. Specs completes : `docs/specs/background-animations.md`. Mapping : rouge=code flux / or=nodes IA / vert=reseau neuronal / neutre=constellation convergente / bleu=blueprint grid. P2, ~5-7 jours (1-2j par animation + orchestrateur + fallbacks SVG).
- [ ] Fox animation paths JSON : migrer depuis raw.githubusercontent vers self-hosted (P3 dette tech)
- [ ] Section "Preuves techniques" (CVE publies, CTF, publications MISC) sur landing cybersec

---

## Phase 2 — React islands sur WordPress (Q2 2026 — MERGE MAIN, BASCULE PROD A FAIRE)

### Status : 95% — 12 commits merges main 29 avril (`6bd4cd8..884c106`), bascule prod restante

**Plan detaille** : voir `docs/phase2-react-islands.md` + `docs/session-log.md` (29 avril).

### Phase 2.0 Setup — FAIT
- [x] `react-islands/` a la racine (pnpm v10 securise)
- [x] Vite + React 19 + Tailwind v4 + `@tailwindcss/vite`
- [x] `@tanstack/react-query`, `framer-motion`, `lucide-react`, `cva`, `tailwind-merge`
- [x] `vite.config.ts` entries multiples (homepage + cybersec) + build vers `inaricom-core/assets/react/`
- [x] `globals.css` avec `@theme` heritant des tokens WP (5 themes)
- [x] HMR fonctionnel + multiples composants livres en dev

### Phase 2.1 Homepage island — FAIT
- [x] Hero : copy pivot ("Securite offensive. / IA souveraine. / Sans dependance."), badge neutre, H1 72px, fox v28 prod
- [x] FoxAnimationV29 : `foxScale 0.85`, `foxOffsetX 0.72`, `offsetY = (cssH - foxH)/2 - cssH*0.1` (snippet 443 exact)
- [x] 3 cards arguments inline (OWASP/PTES/MITRE, IA local-first, Tarifs publics)
- [x] PillarCards : Cybersec (rouge) / IA souveraine (or) / Ressources (vert)
- [x] WhySection : 4 engagements numerotes
- [x] ArticleCards + useWPPosts (TanStack Query, fetch `/wp/v2/posts`)
- [x] FinalCTA : "Parlons de votre projet" -> /contact/
- [x] 5 backgrounds animes (MatrixRainRed, ParticleNeonGold, NeuralNetworkGreen, MeshGradientNeutral fixed, BlueprintGridBlue)
- [x] Respect `prefers-reduced-motion`
- [x] Responsive 375/768/1440 valide (1920 a verifier QA Lighthouse)

### Phase 2.2 Integration WP — FAIT
- [x] `ReactLoader.php` : enqueue bundles Vite avec manifest
- [x] `ReactMountPoints.php` : shortcode `[inari_island name="homepage"]` + skeleton HTML
- [x] CSP adaptee pour bundles React
- [x] `IslandFullBleed.php` : marges Cloudflare 1360px scopees
- [x] CSS critique inline pour cacher entry-header Kadence sur pages island

### Phase 2.3 Swap homepage (staging) — FAIT
- [x] Page WP 1069 "Accueil Inaricom" creee
- [x] Shortcode `[inari_island name=homepage]` ajoute
- [x] Page 985 "Accueil Cybersecurite" deplacee vers `/accueil-cybersecurite/`
- [x] Menu Kadence : item 376 -> page 1069
- [x] Tests staging OK
- [x] Page WP 1078 "Accueil IA" creee + shortcode `[inari_island name=ia]` (28 avril)

### Phase 2.4 QA + polish — FAIT (29 avril, QA Pass 4 GO)
- [x] Bundle JS critique < 80 KB gzipped (homepage 12 KB / ia 8.7 KB / cybersec 7.9 KB)
- [x] Lighthouse Performance LCP < 2.5s sur 5/6 configs (homepage mobile 2529 ms = +29 ms, traite par ticket P1)
- [x] Core Web Vitals : TBT 0-73 ms (mode devtools no-throttle), CLS < 0.01
- [x] axe-core 0 violation critical/serious WCAG 2.2 AA
- [x] A11y 100/100 sur 6/6 audits
- [ ] Bascule prod via `bash scripts/deploy-prod.sh` (en cours)

### Phase 2.X — Refonte cybersec + IA + design system unifie (29 avril) — FAIT
- [x] Refonte page IA (commit `d066e6e`) : 7 sections B/A/E/C
- [x] Refonte page cybersec (commit `3f5dce3`) : 7 sections + chiffres marche
- [x] VolumetricFog universel (commit `25e3efc`) sur 3 islands
- [x] Cards opacite 0.10 + icones filled gold tint site-wide
- [x] Particles ParticleNeonGold tuning final (taille/alpha/dispersion)
- [x] Vite manualChunks (commit `4151ac4`) : react-vendor / three / tanstack splits
- [x] Retrait CTAs verbaux (decision Gilles : ecrit only au debut)
- [x] Lazy backgrounds (homepage `8b8958d`, ia/cybersec `137b76f`)
- [x] Snippet 443 fox v28 desactivee (deprecated par FoxAnimationV29 React)

### Phase 2.5+ Roadmap post-homepage
- [ ] AI Tool Finder (Q3 2026) : questionnaire interactif IA
- [ ] Hardware Configurator 3D (Q3-Q4 2026) : R3F + WebGPU
- [ ] AI Mastery Hub (Q4 2026) : tutoriels interactifs
- [ ] Pages services cybersec premium (Q1 2027) : landings pentest/red-team/audit

---

## Phase 3 — Structure contenu securite-first (Q3-Q4 2026)

### Status : 40% — categories IA existent, categories securite a creer

**A creer**
- [ ] Silo 1 Pentest (rouge) : pillar + 5 clusters
- [ ] Silo 2 Red Team (rouge) : pillar + 5 clusters
- [ ] Silo 3 Conformite CH/EU (rouge) : pillar + clusters nLPD/FINMA/NIS2/DORA
- [ ] Silo 4 IA Securite (rouge bridge) : pillar + clusters OWASP LLM/MITRE ATLAS
- [ ] CPT `cve` + taxonomies severity/vendor
- [ ] CPT `etudes-de-cas` + taxonomies secteur/technologie (deja dans inaricom-core)
- [ ] CPT `outils` + champs github-url/langage/license
- [ ] Template article premium (hero + sommaire + CTA + articles similaires)
- [ ] Schema.org Service sur pages services (deja via SchemaInjector)
- [ ] Schema.org TechArticle sur articles (author Person + citation OWASP/NIST)

**A conserver du v1**
- [x] Categorie IA Locale
- [x] Categorie Materiel IA
- [x] Categorie Cloud & Hybride
- [x] Categorie Tutoriels
- [x] Categorie LLMs & Modeles
- [x] Categorie IA Business
- [x] 3 articles IA publies (Article 1/2/3)

**A rebrancher**
- [ ] Remapper categories IA sur `/ia/*` et categories securite sur `/securite/*`
- [ ] Redirections 301 des anciennes URLs vers nouvelle arbo

---

## Phase 4 — Boutique WooCommerce hardware IA (Q4 2026)

### Status : 15% — config basique OK, DigiKey API fonctionnelle, produits manquants

- [x] Plugin `inaricom-digikey` : OAuth DigiKey fonctionnel
- [ ] Passerelle paiement Stripe (+Twint pour CH)
- [ ] Emails automatiques (commande confirmee, expediee, livree)
- [ ] Produits Jetson Orin (Nano/NX/AGX) + variations RAM/stockage
- [ ] Produits Raspberry Pi 5 + kits IA + accessoires
- [ ] Stations IA preconfigurees
- [ ] Templates Shopiweb (downloads numeriques)
- [ ] Packs "IA Starter" + "IA Pro"
- [ ] Mouser API backup
- [ ] Dark theme WooCommerce custom (hooks, theme-or)
- [ ] Stock badges dynamiques
- [ ] Prix temps reel via API fournisseurs

---

## Phase 5 — Articles premium (Q4 2026 - Q2 2027)

### Status : 20% — 3/15 articles publies

**Priorite 1 — Piliers SEO cybersec (nouveau pivot)**
- [ ] Pillar 1 : "Guide complet du pentest pour PME francophones 2026" (4500 mots)
- [ ] Pillar 2 : "Red Team vs Pentest vs Audit : quelle difference ?" (3000 mots)
- [ ] Pillar 3 : "RGPD + nLPD : obligations cyber PME francophones 2026" (4500 mots)
- [ ] Pillar 4 : "Securite des applications IA : guide pentest LLM" (4000 mots) [bridge IA+secu]

**Priorite 2 — Contenu IA existant a enrichir / republier**
- [x] Article 1 : IA locale vs cloud
- [x] Article 2 : Raspberry Pi 5 + IA
- [x] Article 3 : Jetson Orin comparatif
- [ ] Article 4 : Benchmarks IA locale Pi vs Orin vs mini-PC
- [ ] Article 5 : Guide assistant IA complet local
- [ ] Article 6 : Installer LLM local (Qwen/Mistral/DeepSeek)
- [ ] Article 7 : Architecture IA hybride PME
- [ ] Article 8 : IA locale securite RGPD souverainete **[UPGRADE : pivot nLPD + Cloud Act]**
- [ ] Article 9 : Assistant vocal IA offline
- [ ] Article 10 : LLMs 4-bit meilleurs modeles

---

## Phase 6 — Lead magnets + Institutionnel (Q1 2027)

- [ ] PDF 1 : "Guide complet IA locale 2026" (20-30 pages)
- [ ] PDF 2 : "Checklist nLPD pour PME 2026" (lead magnet cybersec)
- [ ] PDF 3 : "Pipeline e-commerce automatise" (IA + ecom)
- [ ] Formulaire WPForms avec automation email (lien download)
- [ ] Pages legales (Mentions, CGV, Confidentialite nLPD)
- [ ] Politique de divulgation responsable (`/politique-divulgation-responsable/`)
- [ ] `security.txt` (format RFC 9116 + PGP key)
- [ ] Accessibility statement FR/DE/IT

---

## Phase 7 — Hardening securite (Q1 2027)

### Obligatoire avant publication prod

- [x] `inaricom-security.php` must-use : headers, CSP, rate-limit, version hiding (189 lignes)
- [ ] `wp-config.php` durci (checklist complete)
- [ ] Cloudflare WAF rules custom (rate-limit wp-login, block XML-RPC, bot fight)
- [ ] Wordfence Premium installe + configure
- [ ] UpdraftPlus Premium + rotation backups + chiffrement GPG
- [ ] WPScan daily cron + Slack alerts
- [ ] Sentry PHP + JS configure
- [ ] UptimeRobot 5 URLs cles
- [ ] Dependabot + Renovate actifs
- [ ] Premier pentest interne par security-redteam agent

---

## Phase 8 — Publication finale + SEO (Q1-Q2 2027)

- [ ] Lighthouse 95+ toutes pages principales (homepage React deja validee Phase 2.4)
- [ ] GTmetrix A grade
- [ ] Responsive all devices (BrowserStack ou Playwright)
- [ ] SSL + HTTPS redirect actif
- [ ] Sitemap XML soumis Search Console
- [ ] robots.txt + llms.txt publies
- [ ] Meta titles/descriptions toutes pages
- [ ] Open Graph + Twitter Cards
- [ ] Schema.org validates (Google Rich Results Test)
- [ ] Aucune page 404 (Rank Math Redirections)

---

## Apres refonte (Phase 9 produit — 2027+)

### Idees outils a developper (React islands Phase 2.5+)
- [x] Planifie : AI Tool Finder (questionnaire recommandant outils IA) -> Phase 2.5
- [x] Planifie : AI Mastery Hub (tutoriels Claude/Gemini/ChatGPT/MCP) -> Phase 2.7
- [x] Planifie : Inaricom Configurator (probe Rust hardware + reco achat) -> Phase 2.6
- [ ] Inaricom Local Ops (console gestion agents IA)
- [ ] Edge Box (appliance IA cle en main)
- [ ] White paper IA locale (15 chapitres, 60-80 pages)

### Partenariats
- Clusis (CH) + CLUSIF (FR)
- ALSO + Alltron (distribution CH)
- DigiKey + Mouser (deja integre via inaricom-digikey)
- CJ Affiliate + Awin + Impact
- Digitec Galaxus (~50% parts marche CH)

---

## Legende

- [x] : fait et valide
- [ ] : todo
- [~] : en cours
- [!] : bloqueur
