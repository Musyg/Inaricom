# Récap session — Vendredi 17 avril 2026

## Phase 0 — BOUCLÉE ✅

Toute la stack technique est en place. On peut attaquer le gros œuvre (Phase 1) en sachant que les fondations tiennent.

### Ce qui marche à 100%

- **PHP 8.5.4** (SwissCenter), upload 64 MB, OPcache actif
- **WordPress 6.9.4** + **WooCommerce 10.7.0** + **Kadence 1.4.5**
- **Headers HTTP enterprise-grade** déjà en place (HSTS + CSP + X-Frame + Permissions-Policy)
- **REST API** : Basic Auth ck/cs validé sur `https://inaricom.com/wp-json/wc/v3/`
- **WooCommerce MCP** natif : `https://inaricom.com/wp-json/woocommerce/mcp` — handshake + tools/list OK
- **SSH prod** : alias `inaricom` (web24.swisscenter.com / toriispo / port 22), clé ed25519
- **WP-CLI 2.12.0** à distance via SSH (`/usr/local/bin/wp`)
- **Claude Code 2.1.45** : 5 MCP projet connectés (filesystem, chrome-devtools, playwright, ssh-inaricom, woocommerce-mcp)
- **30 skills** chargeables (7 ultimes + 23 claudedesignskills)

### Découvertes notables

- **Architecture WP en sous-dossier** : WP_SITEURL = `/web/`, WP_HOME = racine. REST API accessible à la racine uniquement (pas dans `/web/`).
- **Plugin custom `inaricom-security` v1.2** en must-use → probable source des excellents headers HTTP
- **Plugin custom `inaricom-digikey` v1.0.2** actif → intégration DigiKey fonctionnelle (expose `inaricom/v1`)
- **Produit existant en boutique** : "Audit Infra — Pentest Pro" @ 3990 EUR → pivot Red Team déjà amorcé côté catalogue
- **`blogname` vide en DB** → à fixer (`wp option update blogname "Inaricom"`)

### Snippets WooCommerce actifs (à garder)

1. **Coming Soon Red Team** (patched avec REST bypass)
2. **Bypass Coming Soon API** (`pre_option_woocommerce_coming_soon`)
3. ~~Restore Authorization Header~~ → désactivable (htaccess fait déjà le forwarding)

---

## Comment relancer Claude Code demain

```bash
cd ~/Desktop/Inaricom
./scripts/claude.sh
```

Le wrapper charge `.env` → les 5 MCP démarrent avec toutes les variables nécessaires.

---

## Phase 1 — Chantiers prévus (ordre suggéré)

### A. Quick wins (1-2h chacun)

1. **Fixer `blogname`** dans WP (1 min)
2. **Désactiver "Afficher erreurs PHP"** dans Apanel (1 min, avant ouverture publique)
3. **Inspecter `inaricom-security`** (must-use) → documenter ce qu'il fait, l'améliorer si besoin

### B. Design tokens (1/2 journée)

- Créer `kadence-child/style.css` avec toutes les variables `--inari-*`
- 4 thèmes via `[data-theme]` : rouge (sécu), or (IA), vert (blog), bleu (institutionnel)
- Typos self-hostées : Geist Sans + Geist Mono + Instrument Serif
- Glassmorphism + rayons + ombres standardisés

### C. Plugin `inaricom-core` (1-2 jours)

- CPT pour ressources, études de cas, lead magnets
- Taxonomies avec mapping couleurs par catégorie
- Hooks Kadence pour injecter le theme-switcher
- Schema JSON-LD par type de contenu
- Headers sécu additionnels (à coordonner avec `inaricom-security`)

### D. Audit Chrome MCP complet (post-Phase 1)

- Lighthouse via le MCP chrome-devtools
- Comparer aux objectifs : Performance ≥ 90, LCP < 2.5s, INP < 200ms, CLS < 0.1

---

## Dette technique notée (Phase 2+)

- Créer user SSH dédié read-only (via support SwissCenter)
- Générer Application Password WP pour `.env` (WP_APPLICATION_PASSWORD)
- Migrer fox animation Canvas 2D v28 → OGL + glow additif (6-8j)
- Audit hex couleurs hardcodés à remplacer par variables CSS (2-4h)
- Config Stripe + Twint + WPForms automation + UpdraftPlus
- Durcir CSP progressivement (retirer `'unsafe-inline'` et `'unsafe-eval'` avec nonces)

---

## Tools connectés dans Claude Code

| MCP | Outils | Usage principal |
|---|---|---|
| filesystem | 11 | Lire/éditer fichiers projet |
| ssh-inaricom | ~15 | WP-CLI, rsync, commandes shell prod |
| chrome-devtools | 29 | Lighthouse, perf, debug, screenshots |
| playwright | 21 | E2E tests, multi-browser, regression |
| woocommerce-mcp | 9 | CRUD produits/commandes |
