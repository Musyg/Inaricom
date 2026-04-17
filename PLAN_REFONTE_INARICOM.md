# PLAN REFONTE INARICOM.COM — v2 (pivot securite-first)

> Plan consolide integrant le pivot strategique cybersecurite et les 5 deep searches validees.
> Remplace PLAN_REFONTE_INARICOM.v1.md (archive, IA-first).
> Derniere MAJ : 17 avril 2026
> Progression globale : ~30% (revision apres pivot)

---

## VISION

Positionner Inaricom comme **cabinet cybersec de reference pour PME francophones** (Suisse romande + FR + BE + LU), tout en conservant la verticale IA. Site premium dark + 4 themes semantiques + sous-agents Claude Code + hardening exemplaire.

### 3 differenciateurs uniques marche FR
1. **Transparence tarifaire** (grilles CHF/EUR publiques)
2. **Convergence IA + cybersec offensif** (pentest LLM / OWASP LLM Top 10)
3. **Swiss trust stack** (FADP/nFADP + FINMA + NIS2 + ISO 27001/27018)

---

## PHASE 0 — FONDATIONS INFRA

### 0.1 Repo + Claude Code
- [x] Git repo initialise + lie GitHub `Musyg/Inaricom`
- [x] 23 skills claudedesignskills installes
- [x] CLAUDE.md v2 (pivot securite-first)
- [x] `.claude/agents/` (5 sous-agents)
- [x] `.claude/settings.json`
- [x] `.mcp.json`
- [x] `docs/` (architecture, backlog, tech-debt, session-log)
- [ ] `.claude/commands/` slash commands (deploy-staging, visual-qa, security-scan, etc.)
- [ ] `.claude/rules/` regles fixes
- [ ] `.gitignore` propre (secrets, node_modules, vendor)

### 0.2 Decisions techniques verrouillees
- [x] Theme : **Kadence Classic** (pas FSE avant 2027)
- [x] SEO : **Rank Math Free**
- [x] Hebergeur : **Infomaniak** (Geneve/Zurich, nLPD native)
- [x] Animation fox : migration **Canvas 2D -> OGL + glow additif** (15 KB, 60fps mobile)
- [x] Fonts : **Geist Sans + Geist Mono + Instrument Serif** (gratuits, self-hostes)
- [x] Pipeline : **GitHub Actions + SSH/rsync + atomic symlinks**

### 0.3 Securite des cles (P1)
- [ ] Deplacer `C:\Users\gimu8\Desktop\API KEYS` vers `C:\Users\gimu8\.secrets\` (masque)
- [ ] Exclure de OneDrive/backup cloud
- [ ] Verifier exclusion git-ignore
- [ ] (Optionnel) Mettre en place 1Password CLI

### 0.4 Staging Infomaniak
- [ ] Provisionner staging.inaricom.com (ou subdomain Infomaniak)
- [ ] Configurer SSH avec cle dedieee staging
- [ ] Configurer SSH prod read-only
- [ ] Test connexion via `.mcp.json`

### 0.5 GitHub Actions
- [ ] `.github/workflows/security.yml` (WPScan daily)
- [ ] `.github/workflows/lighthouse.yml` (sur PRs)
- [ ] `.github/workflows/playwright.yml` (visual regression)
- [ ] `.github/workflows/deploy.yml` (staging + prod manuel)
- [ ] GitHub Secrets : SSH_PRIVATE_KEY, SSH_HOST, WPSCAN_API_TOKEN, SLACK_WEBHOOK

**Status Phase 0 : 60%**

---

## PHASE 1 — DESIGN SYSTEM + HOMEPAGE RED OPS

### 1.1 Child theme Kadence enrichi
- [x] `kadence-child/style.css` scaffold minimal
- [x] `kadence-child/functions.php` scaffold minimal (fox canvas)
- [ ] Integrer **design tokens complets** `--inari-*` dans `style.css`
- [ ] Integrer **4 themes** `[data-theme="or|vert|bleu"]` (defaut rouge)
- [ ] Integrer **palette semantic** (`--semantic-error: #F59E0B` separe du rouge brand)
- [ ] Integrer **rayons + ombres + glass tokens**
- [ ] Integrer **swap logo** `content: url()` par theme

### 1.2 Plugin `inaricom-core`
- [ ] Scaffold : `inaricom-core.php` + `composer.json` + `includes/`
- [ ] `class-theme-mapper.php` : body_class + data-theme selon categorie/CPT
- [ ] `class-security.php` : headers, CSP, wp-config helpers
- [ ] `class-schema.php` : JSON-LD Service, LocalBusiness, TechArticle
- [ ] `class-webhooks.php` : integration Slack/Sentry

### 1.3 Hero Homepage Red Ops
- [ ] Refonte titre : pivot **securite + IA** (remplace "L'IA qui s'adapte")
- [ ] Sub-headline Inter Geist + CTA primaire rouge + CTA secondaire ghost
- [ ] Fox animation OGL integree (voir Phase 1.5)
- [ ] Noise overlay SVG 4% opacity `mix-blend-mode: overlay`
- [ ] Radial glow rouge top-center (rgba(227,30,36,0.10) fading)
- [ ] Aurora mesh subtile drift 30s GSAP
- [ ] Cursor-follow spotlight (ROI eleve, 20 lignes JS)
- [ ] Ligne mono `> inaricom scan --deep --ai` (typing effect)

### 1.4 Sections homepage (3 piliers)
- [ ] **Section Securite** (theme rouge) : Pentest / Red Team / Audit
- [ ] **Section IA** (theme or) : Services / Hardware / Tutos
- [ ] **Section Ressources** (theme vert) : Guides / Checklists / Blog
- [ ] Bentogrid 6-9 cards asymetriques (borders `rgba(227,30,36,0.12)` + glow hover)
- [ ] Glass cards premium (backdrop-blur 20px + saturate 180%)
- [ ] Swiss trust signals footer (FADP/nFADP, FINMA, NIS2, ISO 27001)

### 1.5 Fox animation OGL (migration Canvas 2D)
- [ ] Etape 1 : bootstrap WebGL parallele via `?engine=webgl` (1 jour)
- [ ] Etape 2 : Polyline OGL + theme bindings (1-2 jours)
- [ ] Etape 3 : animation one-shot `uHead` 0->1 (1-2 jours)
- [ ] Etape 4 : desktop-only bloom 2-pass (1-2 jours)
- [ ] Etape 5 : polish + IntersectionObserver + FPS check (1 jour)
- [ ] Fallback SVG inline + `drop-shadow` stacked

### 1.6 Theme switcher
- [x] Theme switcher bottom-left fixe (existant)
- [ ] Integrer 4 themes : rouge/or/vert/bleu (actuellement rouge seulement)
- [ ] Persistence localStorage
- [ ] Transition smooth via `@property --accent`

### 1.7 Footer
- [x] Structure footer Kadence basique
- [ ] 3 colonnes (A propos / Liens / Contact + newsletter)
- [ ] Liens legaux (Mentions, CGV, Confidentialite nLPD)
- [ ] Swiss trust signals (logos conformite)
- [ ] Copyright "(c) 2026 Inaricom"

### 1.8 Optimisations homepage
- [ ] Lighthouse Performance 95+ (mobile et desktop)
- [ ] Images AVIF + lazy loading + fetchpriority LCP
- [ ] Minify CSS/JS
- [ ] SEO : meta title/description/OG
- [ ] Responsive QA 375/768/1440

**Status Phase 1 : 40%**

---

## PHASE 2 — STRUCTURE CONTENU SECURITE-FIRST

### 2.1 Nouvelle arborescence
- [ ] Creer sections `/securite/` avec 6 sous-categories
- [ ] Creer sections `/ia/` (conserver existant + `/ia/securite/` bridge)
- [ ] Creer section `/ressources/`
- [ ] Conserver `/a-propos/`, `/contact/`, pages legales

### 2.2 Redirections 301
- [ ] Remapping anciennes URLs vers nouvelle arbo
- [ ] Configurer via Rank Math Redirections (gratuit)

### 2.3 CPT + Taxonomies
- [ ] CPT `cve` + champs ACF (severity, CVSS, vendor)
- [ ] CPT `etudes-de-cas` + taxonomies secteur/tech
- [ ] CPT `outils` + github-url/langage
- [ ] Taxonomies transverses : niveau, secteur, tech, format, geo, conformite

### 2.4 Mapping couleurs PHP
- [ ] Filter `body_class` selon categorie/CPT
- [ ] Injection `data-theme` sur `<html>` via `wp_head`
- [ ] Badge `.theme-badge` visible sur articles (thematique)

### 2.5 Categories blog existantes
- [x] IA Locale, Materiel IA, Cloud & Hybride, Tutoriels, LLMs & Modeles, IA Business, Actualites IA (existent)
- [ ] Rebrancher sur nouvelle arbo `/ia/*`
- [ ] Creer nouvelles categories securite : Pentest, Red Team, Audit, Conformite, Menaces, IR

### 2.6 Template article premium
- [ ] Hero article (titre Instrument Serif + meta + theme badge)
- [ ] Sommaire sticky a gauche
- [ ] Typographie lecture optimisee (Geist body 18px, line-height 1.7)
- [ ] Zone "Articles similaires" (thematique)
- [ ] CTA service contextuel (Pentest apres article pentest, etc.)
- [ ] Schema.org TechArticle + Person (author)

**Status Phase 2 : 30%**

---

## PHASE 3 — BOUTIQUE WOOCOMMERCE HARDWARE IA

### 3.1 Configuration
- [x] Devise EUR/CHF
- [x] Frais de port basiques
- [x] Pages obligatoires (Panier, Compte)
- [ ] Passerelle Stripe (+ Twint pour CH)
- [ ] Emails automatiques (commande/expedition/livraison)

### 3.2 Produits prioritaires
- [ ] Jetson Orin Nano (via DigiKey API existante)
- [ ] Jetson Orin NX
- [ ] Jetson Orin AGX
- [ ] Raspberry Pi 5 + kits IA
- [ ] Mini-PC IA preconfigures
- [ ] Templates Shopiweb (downloads numeriques)
- [ ] Packs "IA Starter" et "IA Pro"

### 3.3 Design shop
- [ ] Dark theme WooCommerce (hooks via Code Snippets)
- [ ] Grille produits premium (theme or)
- [ ] Stock badges dynamiques
- [ ] Prix temps reel via API fournisseurs (DigiKey OAuth fonctionnel)
- [ ] Filtres produits (prix, categorie, stock)

### 3.4 SEO produits
- [ ] Meta title/description par produit
- [ ] Schema.org Product + Offer + AggregateRating
- [ ] Breadcrumbs configures

**Status Phase 3 : 10%**

---

## PHASE 4 — ARTICLES PREMIUM

### 4.1 Piliers securite (nouveau pivot)
- [ ] P1 : Guide complet pentest PME suisses 2026 (4500 mots)
- [ ] P2 : Red Team vs Pentest vs Audit (3000 mots)
- [ ] P3 : nLPD et cybersec 2026 (4500 mots)
- [ ] P4 : Securite applications IA / pentest LLM (4000 mots) [bridge]

### 4.2 Articles IA existants
- [x] Article 1 : IA locale vs cloud
- [x] Article 2 : Raspberry Pi 5 + IA
- [x] Article 3 : Jetson Orin comparatif
- [ ] Article 4 : Benchmarks IA locale Pi vs Orin
- [ ] Article 5 : Guide assistant IA complet local
- [ ] Article 6 : Installer LLM local (Qwen/Mistral/DeepSeek)
- [ ] Article 7 : Architecture IA hybride PME
- [ ] Article 8 : **UPGRADE** IA locale securite RGPD nLPD Cloud Act
- [ ] Article 9 : Assistant vocal IA offline
- [ ] Article 10 : LLMs 4-bit meilleurs modeles

### 4.3 Articles e-commerce (reporte Q2 2027)
- [ ] IA pour Shopify best practices
- [ ] Templates Shopiweb IA-ready
- [ ] Automatiser 40% business ecommerce
- [ ] IA pour TikTok Ads strategie
- [ ] IA & SEO moderne

**Status Phase 4 : 20%**

---

## PHASE 5 — LEAD MAGNETS + INSTITUTIONNEL

### 5.1 PDF lead magnets
- [ ] PDF 1 : Guide complet IA locale 2026 (20-30 pages)
- [ ] PDF 2 : Checklist nLPD pour PME 2026 (nouveau, pivot secu)
- [ ] PDF 3 : Pipeline e-commerce automatise
- [ ] Design PDFs premium (Canva brand kit `kAG6uk9Uvbs`)

### 5.2 Automation
- [x] Formulaire WPForms cree + integre
- [ ] Automation email (lien download)
- [ ] Double opt-in RGPD/nLPD
- [ ] Tracking conversions

### 5.3 Pages legales + institutionnelles
- [ ] Mentions legales
- [ ] CGV
- [ ] Politique confidentialite nLPD (responsable Inaricom + sous-traitant Infomaniak)
- [ ] Politique cookies (consent mode)
- [ ] `/politique-divulgation-responsable/`
- [ ] `security.txt` (RFC 9116 + PGP key)
- [ ] Accessibility statement FR (EAA juin 2025)

**Status Phase 5 : 20%**

---

## PHASE 6 — HARDENING SECURITE (obligatoire avant prod)

### 6.1 wp-config
- [ ] `DISALLOW_FILE_EDIT`
- [ ] `DISALLOW_FILE_MODS`
- [ ] `FORCE_SSL_ADMIN`
- [ ] `WP_AUTO_UPDATE_CORE => 'minor'`
- [ ] `WP_DEBUG` + `WP_DEBUG_DISPLAY` a false
- [ ] `WP_HTTP_BLOCK_EXTERNAL` + allowlist
- [ ] Salts regeneres
- [ ] `table_prefix` custom (jamais `wp_`)
- [ ] `chmod 600 wp-config.php`

### 6.2 Headers
- [ ] CSP Report-Only (2 semaines de log)
- [ ] CSP enforce avec nonces
- [ ] HSTS avec preload
- [ ] X-Frame-Options SAMEORIGIN
- [ ] X-Content-Type-Options nosniff
- [ ] Referrer-Policy strict-origin-when-cross-origin
- [ ] Permissions-Policy

### 6.3 WAF Cloudflare
- [ ] Rate-limit `/wp-login.php` (5 req/min)
- [ ] Block `/xmlrpc.php` (sauf si usage justifie)
- [ ] Admin whitelist IPs CH/FR/BE/LU
- [ ] Bot fight mode ON
- [ ] Challenge countries hors EU
- [ ] Managed rules OWASP

### 6.4 Monitoring
- [ ] Wordfence Premium ($149/an)
- [ ] UpdraftPlus Premium ou BlogVault (backups chiffres GPG)
- [ ] Rotation 30j/12m/7y + test restore
- [ ] WPScan daily cron + Slack alerts
- [ ] Sentry PHP + JS
- [ ] UptimeRobot 5 URLs cles
- [ ] Cloudflare Analytics
- [ ] Dependabot + Renovate

### 6.5 Pentest interne
- [ ] Scan WPScan complet
- [ ] Audit via `security-redteam` agent
- [ ] Review headers (securityheaders.com target A+)
- [ ] Review CSP (csp-evaluator.withgoogle.com)
- [ ] Review SSL (ssllabs.com target A+)

**Status Phase 6 : 0%**

---

## PHASE 7 — PUBLICATION FINALE

### 7.1 Checklist technique
- [ ] Lighthouse 95+ mobile + desktop
- [ ] GTmetrix A grade
- [ ] Responsive all devices (BrowserStack ou Playwright)
- [ ] SSL + HTTPS redirect actif
- [ ] Vitesse chargement < 2s

### 7.2 Checklist SEO
- [ ] Meta title/description toutes pages
- [ ] Open Graph + Twitter Cards
- [ ] Sitemap XML submitted Search Console
- [ ] robots.txt + llms.txt + llms-full.txt
- [ ] Schema.org validates Google Rich Results

### 7.3 Checklist contenu
- [x] Homepage publiee (a refondre Phase 1)
- [ ] Boutique active (produits charges)
- [ ] Blog avec 10+ articles premium
- [ ] Lead magnets actifs
- [ ] Pages legales publiees

### 7.4 Publication
- [ ] Desactiver maintenance mode
- [ ] Annonce reseaux sociaux (LinkedIn prioritaire Suisse)
- [ ] Google Analytics / Matomo self-hosted
- [ ] Monitorer conversions 30j

**Status Phase 7 : 0%**

---

## RECAPITULATIF GLOBAL

| Phase | Nom | Status | Progression |
|-------|-----|--------|-------------|
| 0 | Fondations infra | ~ | 60% |
| 1 | Design System + Homepage Red Ops | ~ | 40% |
| 2 | Contenu securite-first | ~ | 30% |
| 3 | Boutique WooCommerce | ~ | 10% |
| 4 | Articles premium | ~ | 20% |
| 5 | Lead magnets + Institutionnel | ~ | 20% |
| 6 | Hardening securite | - | 0% |
| 7 | Publication finale | - | 0% |

**PROGRESSION TOTALE : ~30%**

---

## CHECKPOINTS MILESTONES

- **M1 (Semaine 2)** : Fondations infra 100%, pipeline deploy staging operationnel
- **M2 (Semaine 6)** : Homepage Red Ops en staging avec fox OGL et 4 themes
- **M3 (Semaine 14)** : Structure contenu securite-first complete, 4 piliers publies
- **M4 (Semaine 18)** : Hardening securite complete, Cloudflare + Wordfence + backups
- **M5 (Semaine 22)** : Boutique operationnelle, 10+ produits, Stripe actif
- **M6 (Semaine 26)** : Publication prod, Lighthouse 95+, annonce reseaux

---

## Legende

- [x] : fait et valide
- [ ] : todo
- [~] : en cours  
- [!] : bloqueur
