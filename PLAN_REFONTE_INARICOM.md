# PLAN REFONTE INARICOM.COM — v3 (Phase 2 React islands demarree)

> Plan consolide integrant le pivot strategique cybersecurite et l'acceleration Phase 2 React islands.
> v2 archive (~17 avril 2026) pour historique.
> Derniere MAJ : 28 avril 2026
> Progression globale : ~62%

---

## VISION

Positionner Inaricom comme **cabinet cybersec de reference pour PME francophones** (FR + BE + LU + CH, sans priorite geographique), tout en conservant la verticale IA. 

**Site premium dark** + 5 themes semantiques (neutre/rouge/or/vert/bleu) + WordPress backend solide + **React islands pour zones premium** + hardening exemplaire.

### Fil rouge editorial
**"L'IA et la cybersecurite, sans boite noire."**  
*Des audits que vous comprenez. Des systemes IA que vous controlez. Des ressources gratuites pour decider.*

### 3 differenciateurs uniques marche FR
1. **Transparence pedagogique** : "sans boite noire" — audits, systemes et contenus lisibles
2. **Convergence IA + cybersec offensif** (pentest LLM / OWASP LLM Top 10)
3. **Local-first + self-hosting** : Ollama, Mistral self-hosted, donnees hebergees chez Infomaniak (Europe)

---

## PHASE 0 — FONDATIONS INFRA

### Status : 85%

**Fait**
- [x] Git repo initialise + lie GitHub `Musyg/Inaricom`
- [x] 23 skills claudedesignskills installes
- [x] CLAUDE.md v2 (pivot securite-first)
- [x] `.claude/agents/` (5 sous-agents)
- [x] `.claude/settings.json` + `.mcp.json`
- [x] `.claude/rules/` (security-first, css-custom-properties, surgical-fixes)
- [x] `docs/` (architecture, backlog, tech-debt, session-log, runbooks, deployment)
- [x] Staging Infomaniak provisionne (clone prod + DB anonymisee)
- [x] mu-plugin `staging-hardening.php` (noindex + banner + mail-block)
- [x] Scripts deploy (`sync-from-prod.sh`, `db-backup.sh`, `db-clone-prod-to-staging.sh`)
- [x] Cles API hors Desktop (`C:\Users\gimu8\.secrets\`)
- [x] `.gitignore` propre
- [x] SSH alias `inaricom` + WP-CLI 2.12.0 serveur

**Reste**
- [ ] `.claude/commands/` slash commands custom (deploy-staging, visual-qa, security-scan)
- [ ] GitHub Actions : `security.yml`, `lighthouse.yml`, `playwright.yml`, `deploy.yml`
- [ ] GitHub Secrets : SSH_PRIVATE_KEY, SSH_HOST, WPSCAN_API_TOKEN
- [ ] Cloudflare DNS + WAF
- [ ] MCP prod read-only (staging existe deja)
- [ ] Upgrade chiffrement cles API (7-Zip ou Bitwarden)

---

## PHASE 1 — DESIGN SYSTEM + INFRA WORDPRESS

### Status : 85% — infra solide, on peut s'appuyer dessus pour Phase 2

**Plugin inaricom-core v0.1 (fait)**
- [x] Scaffold PSR-4 + composer.json + phpcs.xml.dist
- [x] 3 CPT : `inaricom_resource`, `inaricom_case_study`, `inaricom_service`
- [x] Taxonomy `inaricom_pillar` avec 4 piliers seedes auto
- [x] `ThemeMapper.php` : injection `data-theme` + body class (5 themes : rouge/or/vert/bleu/neutre)
- [x] `SchemaInjector.php` : JSON-LD Organization, Service, Article, BlogPosting
- [x] `AdminMenu.php` : menu parent "Inaricom" consolide
- [x] Multisite ready (`Network: true`)

**Design tokens (fait)**
- [x] Snippet 347 DB : tokens `--inari-*` complets + 4 themes via `[data-theme]`
- [x] Section 61 : hero + icones cards
- [x] Section 62 : blog cards titles
- [x] Section 63 : theme-neutre homepage (Phase 1.B 2026-04-21)
- [x] Script `_build_347.py` : build section par section

**Assets visuels (fait)**
- [x] Logo 4 variantes themes (Design-sans-titre-13 bleu / 15 vert / 16 or + natif rouge)
- [x] Logo argente v2 (Design-sans-titre-17) genere via Pillow
- [x] Fox animation Canvas 2D v28 : 5 themes supportes
- [x] Self-host Inter fonts (child theme, nLPD compliant)

**Plugin securite must-use (fait par Gilles, ne pas toucher)**
- [x] `inaricom-security.php` v1.2 : HSTS, CSP, X-Frame-Options, rate-limit login, REST user enum lockdown, version hiding (189 lignes)

**Plugin DigiKey (fait)**
- [x] `inaricom-digikey` : OAuth fonctionnel, prix temps reel (backup Mouser a venir)

**Reste (Phase 1.C)**
- [ ] Fox animation : migration Canvas 2D v28 -> OGL + glow additif HDR (6-8 jours, P2 dette tech)
- [ ] Noise overlay SVG 4% sur hero des autres pages
- [ ] Cursor-follow spotlight sur pages services
- [ ] Section "Preuves techniques" landing cybersec
- [ ] Fox paths JSON : migrer de raw.githubusercontent vers self-hosted (P3)

---

## PHASE 2 — REACT ISLANDS SUR WORDPRESS (Q2 2026 — EN COURS)

### Status : ~85% — homepage staging finalisee, QA Lighthouse a faire

**Avance d'un an sur le plan initial.** Le backend WP est mature (Phase 1 a 85%), homepage React livree sur staging.

**Plan detaille complet** : `docs/phase2-react-islands.md`

### Phase 2.0 — Setup Vite + React + Tailwind v4 — FAIT
**Effort** : 2-3h  
**Livrable** : `react-islands/` operationnel avec HMR

- [x] `pnpm create vite@latest react-islands` (template React-TS, pnpm v10 securise)
- [x] Installer Tailwind v4 + `@tailwindcss/vite`
- [x] Installer `@tanstack/react-query`, `framer-motion`, `lucide-react`, `class-variance-authority`, `tailwind-merge`
- [x] Configurer `vite.config.ts` entries multiples (homepage + cybersec) + build vers `inaricom-core/assets/react/`
- [x] Configurer `globals.css` avec `@theme` heritant des tokens WP (5 themes)
- [x] HMR fonctionnel + premier composant valide

### Phase 2.1 — Homepage island complete — FAIT
**Effort** : 2-3 sessions
**Livrable** : Homepage React complete en staging

- [x] Hero : copy pivot cybersec ("Securite offensive. / IA souveraine. / Sans dependance."), badge neutre, H1 72px
- [x] FoxAnimationV29 : aligne sur constantes EXACTES v28 prod (snippet 443) : foxScale 0.85, foxOffsetX 0.72, offsetY centre viewport - 10%
- [x] 3 cards arguments inline (OWASP/PTES/MITRE, IA local-first, Tarifs publics)
- [x] PillarCards : 3 piliers Cybersec (rouge) / IA souveraine (or) / Ressources (vert) avec accents thematiques
- [x] WhySection : 4 engagements local-first / PME / methodo / convergence
- [x] ArticleCards + useWPPosts (TanStack Query) : fetch WP REST `/wp/v2/posts`
- [x] FinalCTA : "Parlons de votre projet" -> /contact/
- [x] 5 backgrounds animes par theme (MatrixRainRed, ParticleNeonGold, NeuralNetworkGreen, MeshGradientNeutral, BlueprintGridBlue)
- [x] Mesh background passe en `fixed` (suit le scroll)
- [x] Marges Cloudflare 1360px globales
- [x] cybersec.tsx : island scaffold pour `/accueil-cybersecurite/`

### Phase 2.2 — Integration WordPress — FAIT
**Effort** : 1 session
**Livrable** : React island monte via shortcode WP

- [x] `inaricom-core/src/React/ReactLoader.php` : enqueue bundles Vite avec manifest
- [x] `inaricom-core/src/React/ReactMountPoints.php` : shortcode `[inari_island name="homepage"]`
- [x] Skeleton HTML dans shortcode (pas de CLS)
- [x] CSP adaptee pour charger bundles React depuis `/wp-content/plugins/inaricom-core/assets/react/`
- [x] `IslandFullBleed.php` : marges Cloudflare 1360px scopees `.content-area .site-container`
- [x] CSS critique inline pour cacher entry-header Kadence sur pages island

### Phase 2.3 — Swap homepage production — FAIT
**Effort** : 1 session
**Livrable** : Page React montee sur staging ET prod

Staging :
- [x] Page WP 1069 "Accueil Inaricom" creee
- [x] Shortcode `[inari_island name=homepage]` ajoute
- [x] Page 985 "Accueil Cybersecurite" deplacee vers `/accueil-cybersecurite/`
- [x] Menu Kadence : item 376 pointe vers page 1069
- [x] Tests OK : homepage staging = React, `/accueil-cybersecurite/` preservee

Prod (bascule 28/04/2026 19:00) :
- [x] Backup DB prod (20MB) + backup code prod tar (98MB)
- [x] Tag git `prod-20260428-185919` poussé
- [x] Rsync staging -> prod (42MB transfere, exclusions wp-config/htaccess/staging-hardening/uploads)
- [x] Page WP 1064 "Accueil Inaricom" creee en prod (shortcode `[inari_island name=homepage]`)
- [x] `page_on_front` bascule de 985 -> 1064
- [x] Plugin Ultimate Member desactive (resout `crawlable-anchors` Lighthouse)
- [x] Footer widgets h4 -> h3 (DB widget_block, resout `heading-order`)
- [x] Cache + rewrite flush prod
- [x] Smoke test : /wp-login.php 200 / /wp-json/ 200 / /.well-known/security.txt 200
- [!] Pages publiques 503 = Coming Soon mode actif (etat normal, retour juillet 2026)
- [ ] Validation visuelle bypass Coming Soon (session admin) — a faire si besoin

### Phase 2.4 — QA + polish — FAIT (staging) / a confirmer prod sortie Coming Soon
**Effort** : 1-2 sessions
**Livrable** : Homepage prod-ready, metrics validees

Staging :
- [x] Bundle JS critique < 80 KB gzipped (homepage.js = 27.5 KB gzipped) ✓
- [x] Lighthouse Accessibility 100 / Best Practices 100 / SEO 69 (sera ~95 prod sans noindex staging)
- [x] LCP 2.02s ✓ (< 2.5s) / CLS 0.00 ✓ (< 0.1)
- [x] 4 fixes appliques : color-contrast PillarCards / meta-description fallback / crawlable-anchors UM / heading-order footer h3
- [ ] axe-core scan complet (cible 0 violation, mais Lighthouse a11y 100 deja OK)
- [ ] Visual regression tests Playwright (3 viewports 375/768/1440)
- [ ] Check data-theme transitions (MutationObserver React)
- [ ] Confirmer ArticleCards en prod (REST WP retourne articles publies)
- [ ] Re-Lighthouse prod a la sortie Coming Soon (juillet 2026 attendu)

### Phase 2.5+ — Roadmap post-homepage (inchangee)

### Phase 2.5+ — Roadmap post-homepage

Une fois homepage sortie, on itere sur les autres islands :
- **Phase 2.5** (Q3 2026) : AI Tool Finder (questionnaire interactif)
- **Phase 2.6** (Q3-Q4 2026) : Hardware Configurator 3D (R3F + WebGPU)
- **Phase 2.7** (Q4 2026) : AI Mastery Hub (tutoriels interactifs)
- **Phase 2.8** (Q1 2027) : Pages services cybersec premium (pentest/red-team/audit)

---

## PHASE 3 — STRUCTURE CONTENU SECURITE-FIRST

### Status : 40%

**A creer**
- [ ] Silo `/securite/pentest/` pillar + 5 clusters
- [ ] Silo `/securite/red-team/` pillar + 5 clusters
- [ ] Silo `/securite/conformite/` pillar + clusters nLPD/FINMA/NIS2/DORA
- [ ] Silo `/securite/ia/` pillar + clusters OWASP LLM/MITRE ATLAS (bridge)
- [ ] CPT `cve` + taxonomies severity/vendor
- [ ] CPT `outils` + champs github-url/langage/license
- [ ] Template article premium (hero + sommaire sticky + CTA + articles similaires)

**A rebrancher**
- [ ] Remapper categories IA sur `/ia/*` + categories securite sur `/securite/*`
- [ ] Redirections 301 des anciennes URLs vers nouvelle arbo

---

## PHASE 4 — BOUTIQUE WOOCOMMERCE HARDWARE IA

### Status : 15%

- [x] DigiKey API OAuth fonctionnel (plugin `inaricom-digikey`)
- [ ] Passerelle Stripe + Twint (CH specifique)
- [ ] Emails automatiques (commande/expedition/livraison)
- [ ] Produits Jetson Orin (Nano/NX/AGX)
- [ ] Produits Raspberry Pi 5 + kits IA
- [ ] Stations IA preconfigurees
- [ ] Templates Shopiweb (downloads numeriques)
- [ ] Packs "IA Starter" + "IA Pro"
- [ ] Mouser API backup
- [ ] Dark theme WooCommerce custom (hooks, theme-or via body class)
- [ ] Prix temps reel via API fournisseurs

---

## PHASE 5 — ARTICLES PREMIUM

### Status : 20% — 3/15 articles

**Priorite 1 — Piliers SEO cybersec (post-pivot)**
- [ ] Pillar 1 : "Guide complet du pentest pour PME francophones 2026" (4500 mots)
- [ ] Pillar 2 : "Red Team vs Pentest vs Audit : quelle difference ?" (3000 mots)
- [ ] Pillar 3 : "RGPD + nLPD : obligations cyber PME francophones 2026" (4500 mots)
- [ ] Pillar 4 : "Securite des applications IA : guide pentest LLM" (4000 mots) [bridge]

**Priorite 2 — Articles IA**
- [x] Articles 1-3 (IA locale vs cloud, Raspberry Pi 5, Jetson Orin)
- [ ] Articles 4-10 : benchmarks, assistant IA local, LLMs, architecture hybride PME

---

## PHASE 6 — LEAD MAGNETS + INSTITUTIONNEL

### Status : 20%

- [ ] PDF 1 : "Guide complet IA locale 2026" (20-30 pages)
- [ ] PDF 2 : "Checklist nLPD pour PME 2026" (lead magnet cybersec)
- [ ] PDF 3 : "Pipeline e-commerce automatise"
- [ ] WPForms + automation email (lien download + double opt-in)
- [ ] Pages legales (Mentions, CGV, Confidentialite nLPD)
- [ ] `/politique-divulgation-responsable/`
- [ ] `security.txt` RFC 9116 + PGP key
- [ ] Accessibility statement FR/DE/IT

---

## PHASE 7 — HARDENING SECURITE

### Status : 30% — headers deja en place, reste infra

- [x] `inaricom-security.php` must-use : headers complets + rate-limit + version hiding
- [ ] `wp-config.php` durci (checklist complete)
- [ ] Cloudflare WAF rules custom
- [ ] Wordfence Premium
- [ ] UpdraftPlus Premium + rotation backups + chiffrement GPG
- [ ] WPScan daily cron + Slack alerts
- [ ] Sentry PHP + JS
- [ ] UptimeRobot 5 URLs cles
- [ ] Dependabot + Renovate

---

## PHASE 8 — PUBLICATION FINALE

### Status : 0%

- [ ] Lighthouse 95+ toutes pages principales (homepage React deja validee Phase 2.4)
- [ ] GTmetrix A grade
- [ ] Responsive all devices
- [ ] SSL + HTTPS redirect + HSTS preload
- [ ] Sitemap XML submitted Search Console
- [ ] robots.txt + llms.txt publies
- [ ] Meta titles/descriptions toutes pages
- [ ] Open Graph + Twitter Cards
- [ ] Schema.org validates (Rich Results Test)
- [ ] Desactiver maintenance mode
- [ ] Annonce LinkedIn marche francophone (FR + BE + LU + CH)
- [ ] Monitorer conversions 30j

---

## RECAPITULATIF GLOBAL

| Phase | Nom | Status | Progression |
|-------|-----|--------|-------------|
| 0 | Fondations infra | ~ | 85% |
| 1 | Design System + Infra WP | ~ | 85% |
| **2** | **React islands (Q2 2026)** | **~** | **95% — bascule prod faite (masquee par Coming Soon), reste re-Lighthouse prod sortie** |
| 3 | Contenu securite-first | ~ | 40% |
| 4 | Boutique WooCommerce | ~ | 15% |
| 5 | Articles premium | ~ | 20% |
| 6 | Lead magnets + Institutionnel | ~ | 20% |
| 7 | Hardening securite | ~ | 30% |
| 8 | Publication finale | - | 0% |

**PROGRESSION TOTALE : ~65%**

---

## CHECKPOINTS MILESTONES

- **M1** (fait) : Fondations infra + staging operationnel
- **M2** (fait) : Plugin inaricom-core v0.1 + design tokens 4 themes + infra tokens 5 themes
- **M3** (28 avril 2026) : **Phase 2.0-2.4 finalisees. Bascule prod faite (commit 41487b4..c52385d, tag prod-20260428-185919). Page 1064 "Accueil Inaricom" front-page prod, masquee par Coming Soon jusqu'a sortie juillet 2026. Lighthouse staging : a11y 100 / best-practices 100 / SEO 69 (~95 prod). LCP 2.02s / CLS 0.00.**
- **M4** (Q3 2026) : Structure contenu securite-first complete, 4 piliers publies
- **M5** (Q3-Q4 2026) : AI Tool Finder + Hardware Configurator livres
- **M6** (Q4 2026) : Boutique operationnelle, 10+ produits, Stripe+Twint actifs
- **M7** (Q1 2027) : Hardening securite complet, Cloudflare + Wordfence + backups
- **M8** (Q1-Q2 2027) : Publication prod officielle, Lighthouse 95+, annonce LinkedIn

---

## REGLE D'OR (rappel)

**Tout outil / page / fonctionnalite doit :**
- reduire un cout, OU
- reduire une dependance, OU
- permettre une decision claire.

Sinon, on ne le construit pas.

---

## Legende

- [x] : fait et valide
- [ ] : todo
- [~] : en cours
- [!] : bloqueur
