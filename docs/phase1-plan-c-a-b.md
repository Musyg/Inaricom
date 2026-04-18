# 🎯 Plan Phase 1 — Ordre C→A→B

> Plan d'action issu du prompt de reprise du 18 avril 2026.
> Logique : on ne touche ni à A ni à B avant d'avoir un filet de sécurité (staging + rollback).

---

## 📊 État d'avancement

| Étape | Nom | Status | Session |
|-------|-----|--------|---------|
| **C** | Staging + pipeline déploiement | 🟢 **BOUCLÉE** | 2026-04-18 |
| **A** | Plugin inaricom-core | ⏳ à faire | prochaine |
| **B** | Design tokens `--inari-*` + 4 thèmes | ⏳ à faire | après A |

---

## 🟢 C — Staging + pipeline (PRIORITÉ 1) — FAIT

**Effort réel** : 1 session (3-4h via hermes-control)

**Livré** :
- ✅ Sous-domaine `staging.inaricom.com` fonctionnel (DNS direct, SSL Let's Encrypt)
- ✅ DB `toriispo_staging` clonée + anonymisée (nLPD/RGPD : 2155 users, 1 order, 42 comments)
- ✅ WP Multisite fix (`DOMAIN_CURRENT_SITE`, tables `hiiw_site`/`hiiw_blogs`/`hiiw_sitemeta`)
- ✅ Allègement plugins pour tenir dans 128 MB (WC Payments, tracking, Coming Soon WC)
- ✅ mu-plugin `staging-hardening.php` (noindex HTTP + banner visuel + mail-block)
- ✅ 3 scripts bash (`sync-from-prod.sh`, `db-backup.sh`, `db-clone-prod-to-staging.sh`)
- ✅ Doc `docs/deployment.md` + `docs/session-2026-04-18-recap.md`
- ✅ Commit `7fd6259` sur main

**Reste à peaufiner dans C** (à faire avant A) :
- [ ] Auth HTTP basique via Apanel "Protection des répertoires" (UI native)
- [ ] Test end-to-end du script `db-clone-prod-to-staging.sh` (valider au moins 1 fois)
- [ ] `git push origin main`
- [ ] Décider du plan SwissCenter avec Kevin (Home 128 MB vs Business 256 MB)

**Voir** : `session-2026-04-18-recap.md` pour le détail complet.

---

## ⏳ A — Plugin `inaricom-core` (PRIORITÉ 2)

**Effort estimé** : 4-6h pour scaffold + premier CPT
**ROI** : fondation sur laquelle s'accroche tout le reste (contenu, SEO, theme-switching)

### A.1 Scaffold plugin PSR-4
- [ ] `wp-content/plugins/inaricom-core/inaricom-core.php` (header WP)
- [ ] `composer.json` avec `autoload.psr-4 = { "Inaricom\\Core\\" : "src/" }`
- [ ] Structure `src/` : `CPT/`, `Taxonomy/`, `Admin/`, `Frontend/`, `Schema/`, `Theme/`
- [ ] PHPCS ruleset WordPress Coding Standards + GrumPHP pre-commit

### A.2 Custom Post Types (CPT) métier
- [ ] `inaricom_resource` (lead magnets, checklists, guides)
- [ ] `inaricom_case_study` (études de cas pentest/IA)
- [ ] `inaricom_service` (fiches service cybersec + IA)
- [ ] Registrer via classes dédiées, archives custom, slug rewrite

### A.3 Taxonomies avec mapping couleurs
- [ ] Taxonomy `inaricom_pillar` (4 termes fixes : `securite`, `ia`, `blog`, `institutionnel`)
- [ ] Métadonnée term = code thème (`rouge`, `or`, `vert`, `bleu`)
- [ ] Filtre `body_class` qui ajoute `data-theme="X"` sur `<body>` selon catégorie
- [ ] Admin UI : colonne colorée dans la liste des termes

### A.4 Hooks Kadence pour theme-switcher automatique
- [ ] Action `wp_head` ou filtre `body_class` qui injecte `data-theme` selon pilier du post
- [ ] Exception par défaut = rouge (pas d'attribut) sur homepage et pages sécu

### A.5 Schema JSON-LD par type de contenu
- [ ] `Service` pour les fiches service
- [ ] `Article` + `BlogPosting` pour les articles
- [ ] `FAQPage`, `HowTo` injectables via ACF/champs custom
- [ ] Output dans `wp_head` avec `wp_json_encode()` propre

### A.6 Interface admin consolidée
- [ ] Menu principal "Inaricom" regroupant tous les CPT
- [ ] Dashboard widget avec stats (articles publiés, leads collectés, etc.)

**Règle absolue** : pas de duplication de `inaricom-security.php` (les headers/rate-limiting/version-hiding sont délégués au must-use existant v1.2).

**Livrables attendus** :
- Plugin `inaricom-core` v0.1 activé en staging
- 3 CPT fonctionnels + taxonomy `inaricom_pillar` avec 4 termes
- Theme-switcher automatique validé (créer un article "sécurité" → body a `data-theme="rouge"` implicite)
- Schema JSON-LD testé via Google Rich Results Test
- PHPCS passant sans erreur
- Doc dans `docs/inaricom-core.md`

**Risques** :
- Kadence a ses propres hooks et filtres — validation sur staging obligatoire (d'où C en premier ✅)
- Migration future des articles existants vers CPT dédiés : prévoir script `wp post meta update` batch

---

## ⏳ B — Design tokens `--inari-*` + 4 thèmes (PRIORITÉ 3)

**Effort estimé** : 3-4h pour tokens + switcher, 1-2 jours pour full refactor des styles existants
**ROI** : rend tout le reste stylable sans hex en dur. Condition pour que toute page future respecte la charte automatiquement.

### B.1 Child theme Kadence (si pas encore en place côté serveur)
- [ ] Installer via `child-theme-configurator` (plugin déjà actif)
- [ ] Activer en staging d'abord, vérifier rien ne casse

### B.2 `kadence-child/style.css` exhaustif avec tous les `--inari-*` du CLAUDE.md
- [ ] Palette fixe (noirs, textes, bordures, glass)
- [ ] Variables accent par défaut (thème rouge)
- [ ] Rayons standardisés (`--radius-sm` à `--radius-full`)
- [ ] Ombres (`--shadow-soft`, `--shadow-subtle`)
- [ ] Gradient variables

### B.3 Sélecteurs `[data-theme]` pour les 4 thèmes
- [ ] `[data-theme="or"]` recalcule `--inari-red`, `--inari-red-dark`, `--inari-red-light`, `--inari-red-rgb`, `--glow-color`, `--border-accent`, `--glass-bg` (teinte chaude)
- [ ] Idem pour `vert` et `bleu`
- [ ] Pas de `[data-theme="rouge"]` — c'est le défaut

### B.4 Fonts self-hostées (nLPD/GDPR critical)
- [ ] Download Geist Sans + Geist Mono depuis npm `geist` → `wp-content/themes/kadence-child/assets/fonts/`
- [ ] Download Instrument Serif depuis Google Fonts en local via OMGF (déjà pattern adopté)
- [ ] `@font-face` avec `font-display: swap` + preload dans `wp_head`
- [ ] ⚠️ Rappel : **JAMAIS Google Fonts via CDN** (risque €250 000 Munich)

### B.5 Logo 4 variantes
- [ ] Vérifier que les 4 fichiers Canva (rouge/or/vert/bleu) sont bien uploadés sur `/web/wp-content/uploads/2026/01/`
- [ ] CSS `.site-logo img { content: url(...) }` selon `[data-theme]`
- [ ] `filter: drop-shadow(0 0 2px rgba(255,255,255,0.6))` systématique

### B.6 Anti-patterns vérifiés
- [ ] Audit hex hardcodés dans les CSS existants (Simple Custom CSS/JS plugin) → remplacer par variables
- [ ] Pas de rouge dans les messages d'erreur UI (utiliser amber `#F59E0B`)

### B.7 Theme-switcher JS minimal (pour tests manuels avant binding auto via A)
- [ ] Bouton debug qui cycle rouge → or → vert → bleu → rouge
- [ ] Retiré en prod, sert de preview pendant développement

**Livrables attendus** :
- Child theme Kadence actif en staging
- `style.css` complet avec ~80 variables CSS custom properties
- Fonts self-hostées, validation DevTools Network (aucune requête Google Fonts)
- 4 thèmes testés visuellement sur staging
- Audit hex hardcodés → zéro valeur en dur
- Doc `docs/design-tokens.md` avec toutes les variables listées

**Risques** :
- Kadence injecte ses propres CSS avec spécificité parfois gênante → utiliser `!important` avec parcimonie ou sélecteurs plus spécifiques
- Fonts self-hostées : charge additionnelle à compenser par `font-display: swap` + preload des 2-3 poids critiques uniquement

---

## 🎬 Plan séance par séance (2h chaque max)

| # | Session | Chantier | Livrable |
|---|---------|----------|----------|
| 1 | Admin SwissCenter + WP-CLI | C.1 + C.2 | Staging clone fonctionnel ✅ |
| 2 | Scripts bash | C.3 + C.4 | `deploy-staging.sh` + `db-backup.sh` testés ✅ |
| 3 | Scripts bash | C.3 suite + C.5 | `deploy-prod.sh` + tests de fumée ⏳ |
| 4 | PHP architecture | A.1 + A.2 | Plugin scaffold + 3 CPT |
| 5 | PHP métier | A.3 + A.4 | Taxonomy pillar + theme-switcher |
| 6 | PHP SEO | A.5 + A.6 | Schema JSON-LD + admin UI |
| 7 | Frontend CSS | B.1 + B.2 + B.3 | Child theme + 80 variables + 4 thèmes |
| 8 | Frontend fonts | B.4 + B.5 + B.6 | Self-hosted fonts + logo 4 variantes + audit hex |

**Total estimé** : 15-20h réparties sur 4-8 sessions, soit 1-2 semaines de travail réaliste avec testing entre chaque.

---

## ⚠️ Guardrails absolus pour toutes les sessions

Extraits de CLAUDE.md, à respecter strictement :

- JAMAIS éditer `/wp-content/themes/kadence/` directement (toujours child theme)
- JAMAIS d'écriture directe sur prod (tout via pipeline C)
- JAMAIS de hex en dur après les design tokens (après B)
- JAMAIS de refactor complet d'un code qui fonctionne → corrections chirurgicales
- JAMAIS `wp search-replace` sans `--dry-run` + backup
- JAMAIS Google Fonts via CDN (risque €250 000 Munich)
- JAMAIS dupliquer les headers/hooks de `inaricom-security.php` (must-use existant)
- JAMAIS de secrets en dur — toujours `.env` + `gitignore`
- JAMAIS toucher `inaricom-security.php` sans staging complet (écrit par Gilles, test avant tout)

---

## 📋 Questions ouvertes — État

| Question | Réponse | Session |
|----------|---------|---------|
| SwissCenter staging natif ? | ❌ Non → sous-domaine manuel via Apanel | 18/04 |
| Application Password WP | ⏳ À générer pour `.env` | prochaine |
| Backup actuel ? | ⏳ UpdraftPlus pas encore config → script `db-backup.sh` fait | 18/04 ✅ |
| Origine HL-IDs inaricom-security | Plugin v1.2 écrit par Gilles, audit fait | 17/04 ✅ |
| Plan SwissCenter Home → Business ? | ⏳ Discussion Kevin nécessaire | bloqué |

---

## 🎬 Commande de reprise pour prochaine session

```bash
cd ~/Desktop/Inaricom
./scripts/claude.sh
```

Puis dans Claude Code :

> On continue Phase 1 selon le plan C→A→B. C est bouclée (staging ops,
> cf docs/session-2026-04-18-recap.md). Reste à peaufiner C :
> auth HTTP via Apanel + test du script db-clone + git push.
> Puis on attaque A (plugin inaricom-core). PRD en 1 page avant de coder.
