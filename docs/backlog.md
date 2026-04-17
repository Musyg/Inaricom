# Backlog Inaricom — plan consolide

> Vue transversale : priorites actuelles, tickets en cours, roadmap par phase.
> Source de verite pour "sur quoi on bosse aujourd'hui".

Derniere MAJ : 17 avril 2026

---

## Priorites immediates (cette semaine)

| # | Tache | Agent | Impact | Effort |
|---|-------|-------|--------|--------|
| 1 | Deplacer `C:\Users\gimu8\Desktop\API KEYS` hors Desktop + chiffrer | security-redteam | Critique | 15 min |
| 2 | Enrichir `kadence-child/style.css` avec design tokens `--inari-*` + 4 themes | frontend-kadence | Critique | 2h |
| 3 | Enrichir `kadence-child/functions.php` avec mapping couleurs body_class + data-theme | woo-backend | Critique | 1h |
| 4 | Fox animation : migration v20 -> OGL + glow additif | frontend-kadence | Important | 6-8 jours |
| 5 | Audit Chrome MCP du site actuel (etat des lieux) | qa-visual | Important | 1h |

---

## Phase 0 — Fondations infra (Q2 2026)

### Status : 60% — Phoenix2 OK, repo OK, MCP a finaliser

- [x] Git repo local + GitHub `Musyg/Inaricom`
- [x] 23 skills claudedesignskills installes (`.claude/skills/`)
- [x] `CLAUDE.md` v2 actualise (pivot securite-first)
- [x] `.claude/agents/` (5 sous-agents)
- [x] `.claude/settings.json`
- [x] `.mcp.json` (scope projet)
- [x] `docs/architecture.md`
- [x] `docs/backlog.md` (ce fichier)
- [ ] `.claude/commands/` slash commands custom (deploy-staging, visual-qa, etc.)
- [ ] `.claude/rules/` regles fixes (security-first, css-custom-properties, surgical-fixes)
- [ ] `.gitignore` propre (secrets, node_modules, vendor)
- [ ] Provisionner staging Infomaniak
- [ ] Configurer SSH staging + SSH prod read-only
- [ ] GitHub Actions : `security.yml`, `lighthouse.yml`, `playwright.yml`, `deploy.yml`
- [ ] Scripts deploy atomic (`scripts/deploy.sh`, `scripts/backup.sh`, `scripts/restore.sh`)

---

## Phase 1 — Design System + Homepage Red Ops (Q3 2026)

### Status : 85% Homepage v1 existe, mais doit etre refondue sur pivot securite-first

**Enrichissements a apporter (priorite)**
- [ ] Child theme Kadence : `:root` complet avec 4 themes via `[data-theme]`
- [ ] Theme switcher 4 couleurs (rouge/or/vert/bleu) bottom-left fixe
- [ ] Hero homepage Red Ops (titre Instrument Serif + CTA + fox OGL)
- [ ] Noise overlay SVG 4% opacity
- [ ] Radial glow rouge hero + aurora mesh subtile
- [ ] Bentogrid 6-9 cards services (Pentest, Red Team, Audit, IA Securite)
- [ ] Section "Swiss trust-signal" footer (FADP/nFADP, FINMA, NIS2, ISO 27001)
- [ ] Cursor-follow spotlight (ROI eleve, 20 lignes JS)
- [ ] Glass cards premium (blur 20px + saturate 180%)

**Deja fait (garder)**
- [x] Logo renard vectoriel + 4 variantes couleur
- [x] Hero section v1 existante
- [x] Menu principal + burger mobile
- [x] Structure footer Kadence (a enrichir)
- [x] 3 sections blog existantes (Articles, E-commerce, Services)

**Ajustements vs v1 (avant pivot securite)**
- [ ] Retitrer hero : de "L'IA qui s'adapte a votre business" -> axe securite + IA convergents
- [ ] Reviser ordre des sections : Securite d'abord, IA ensuite
- [ ] Ajouter section "Preuves techniques" (CVE publies, CTF, publications MISC)

---

## Phase 2 — Structure contenu securite-first (Q3-Q4 2026)

### Status : 50% — categories IA existent, categories securite a creer

**A creer**
- [ ] Silo 1 Pentest (rouge) : pillar + 5 clusters
- [ ] Silo 2 Red Team (rouge) : pillar + 5 clusters
- [ ] Silo 3 Conformite CH/EU (rouge) : pillar + clusters nLPD/FINMA/NIS2/DORA
- [ ] Silo 4 IA Securite (rouge bridge) : pillar + clusters OWASP LLM/MITRE ATLAS
- [ ] CPT `cve` + taxonomies severity/vendor
- [ ] CPT `etudes-de-cas` + taxonomies secteur/technologie
- [ ] CPT `outils` + champs github-url/langage/license
- [ ] Template article premium (hero + sommaire + CTA + articles similaires)
- [ ] Schema.org Service sur pages services
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

## Phase 3 — Boutique WooCommerce hardware IA (Q4 2026)

### Status : 10% — config basique OK, produits manquants

- [ ] Passerelle paiement Stripe (+Twint pour CH)
- [ ] Emails automatiques (commande confirmee, expediee, livree)
- [ ] Produits Jetson Orin (Nano/NX/AGX) + variations RAM/stockage
- [ ] Produits Raspberry Pi 5 + kits IA + accessoires
- [ ] Stations IA preconfigurees
- [ ] Templates Shopiweb (downloads numeriques)
- [ ] Packs "IA Starter" + "IA Pro"
- [ ] Integration DigiKey API (plugin `inaricom-digikey` existant)
- [ ] Mouser API backup
- [ ] Dark theme WooCommerce custom (hooks)
- [ ] Stock badges dynamiques
- [ ] Prix temps reel via API fournisseurs

---

## Phase 4 — Articles premium (Q4 2026 - Q2 2027)

### Status : 20% — 3/15 articles publies

**Priorite 1 — Piliers SEO cybersec (nouveau pivot)**
- [ ] Pillar 1 : "Guide complet du pentest pour PME suisses 2026" (4500 mots)
- [ ] Pillar 2 : "Red Team vs Pentest vs Audit : quelle difference ?" (3000 mots)
- [ ] Pillar 3 : "nLPD et cybersec : obligations PME suisses 2026" (4500 mots)
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

## Phase 5 — Lead magnets + Institutionnel (Q1 2027)

- [ ] PDF 1 : "Guide complet IA locale 2026" (20-30 pages)
- [ ] PDF 2 : "Checklist nLPD pour PME 2026" (lead magnet cybersec)
- [ ] PDF 3 : "Pipeline e-commerce automatise" (IA + ecom)
- [ ] Formulaire WPForms avec automation email (lien download)
- [ ] Pages legales (Mentions, CGV, Confidentialite nLPD)
- [ ] Politique de divulgation responsable (`/politique-divulgation-responsable/`)
- [ ] `security.txt` (format RFC 9116 + PGP key)
- [ ] Accessibility statement FR/DE/IT

---

## Phase 6 — Hardening securite (Q1 2027)

### Obligatoire avant publication prod

- [ ] `wp-config.php` durci (checklist complete)
- [ ] Headers securite (CSP progressive, HSTS, X-Frame-Options)
- [ ] Cloudflare WAF rules custom (rate-limit wp-login, block XML-RPC, bot fight)
- [ ] Wordfence Premium installe + configure
- [ ] UpdraftPlus Premium + rotation backups + chiffrement GPG
- [ ] WPScan daily cron + Slack alerts
- [ ] Sentry PHP + JS configure
- [ ] UptimeRobot 5 URLs cles
- [ ] Dependabot + Renovate actifs
- [ ] Premier pentest interne par security-redteam agent

---

## Phase 7 — Publication finale + SEO (Q1-Q2 2027)

- [ ] Lighthouse 95+ toutes pages principales
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

## Apres refonte (Phase 4 produit — 2027+)

### Idees outils a developper
- AI Tool Finder (questionnaire recommandant outils IA)
- AI Mastery Hub (tutoriels Claude/Gemini/ChatGPT/MCP)
- Inaricom Configurator (probe Rust hardware + reco achat)
- Inaricom Local Ops (console gestion agents IA)
- Edge Box (appliance IA cle en main)
- White paper IA locale (15 chapitres, 60-80 pages)

### Partenariats
- Clusis (CH) + CLUSIF (FR)
- ALSO + Alltron (distribution CH)
- DigiKey + Mouser (deja integre)
- CJ Affiliate + Awin + Impact
- Digitec Galaxus (~50% parts marche CH)

---

## Legende

- [x] : fait et valide
- [ ] : todo
- [~] : en cours
- [!] : bloqueur
