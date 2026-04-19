# Inaricom Core

Plugin WordPress custom pour Inaricom. Scaffold PSR-4, activable en staging.

## Fonctionnalités v0.1.0

### Custom Post Types
- `inaricom_resource` — Lead magnets, checklists, guides (slug: `/ressources/`)
- `inaricom_case_study` — Études de cas pentest/red team/IA (slug: `/etudes-de-cas/`)
- `inaricom_service` — Fiches services commerciaux (slug: `/services/`)

### Taxonomy `inaricom_pillar`
4 piliers sémantiques avec mapping couleurs :

| Slug | Label | Thème CSS | Couleur |
|------|-------|-----------|---------|
| `securite` | Sécurité | rouge (défaut) | `#E31E24` |
| `ia` | Intelligence Artificielle | or | `#FFD700` |
| `blog` | Blog & Ressources | vert | `#10B981` |
| `institutionnel` | Institutionnel | bleu | `#00D4FF` |

Les 4 termes sont seedés automatiquement à l'activation.

### ThemeMapper (injection automatique)
- Ajoute `theme-<slug>` aux classes du `<body>`
- Injecte `<script>document.documentElement.dataset.theme='X';</script>` en `<head>`
  pour que le CSS `[data-theme="X"]` s'applique AVANT le premier paint (zéro FOUC)

Règle de résolution :
1. Post singulier avec pilier → thème du pilier
2. Archive de taxonomy pilier → thème de la taxonomy
3. Archive CPT Inaricom → thème par défaut du CPT
4. Sinon → rouge (sécurité)

### Schema JSON-LD
- Homepage → `Organization` + `WebSite` (search action)
- `inaricom_service` → `Service`
- `inaricom_case_study` → `Article`
- `inaricom_resource` → `CreativeWork`
- Post standard → `BlogPosting`

**Désactivé** si Rank Math ou Yoast SEO est actif (évite les doublons).

### Admin UI
- Menu parent "Inaricom" consolidé dans wp-admin
- Dashboard minimal avec stats des 3 CPT
- Raccourcis vers gestion piliers et plugins

## Architecture PSR-4

```
inaricom-core/
├── inaricom-core.php          # Bootstrap (header WP, constants, autoloader)
├── composer.json              # PSR-4 + devDependencies PHPCS
├── phpcs.xml.dist             # Ruleset WPCS + PHPCompatibilityWP
├── README.md
└── src/
    ├── Plugin.php             # Singleton orchestrateur
    ├── CPT/
    │   ├── AbstractCPT.php    # Classe abstraite avec defaults sains
    │   ├── ResourceCPT.php
    │   ├── CaseStudyCPT.php
    │   └── ServiceCPT.php
    ├── Taxonomy/
    │   └── PillarTaxonomy.php # 4 piliers + seed_default_terms()
    ├── Theme/
    │   └── ThemeMapper.php    # body_class + wp_head injection
    ├── Admin/
    │   └── AdminMenu.php      # Menu consolidé + dashboard
    └── Schema/
        └── SchemaInjector.php # JSON-LD par type de contenu
```

## Installation (staging uniquement au début)

```bash
# 1. Déployer
cd ~/Desktop/Inaricom
bash scripts/deploy-staging.sh

# 2. Activer via WP-CLI
ssh inaricom
cd ~/inaricom.com/web-staging
wp plugin activate inaricom-core

# 3. Vérifier les 4 piliers créés
wp term list inaricom_pillar --fields=slug,name
# Attendu: securite, ia, blog, institutionnel

# 4. Créer un post de test
wp post create --post_type=inaricom_service --post_title="Pentest Test" --post_status=publish
```

## Développement

```bash
# Installer les devDependencies
composer install

# Linter
composer lint

# Auto-fix
composer lint:fix
```

## Principes respectés (CLAUDE.md)

- ✅ Pas de duplication avec `inaricom-security.php` (must-use) : headers et rate-limiting restent là-bas
- ✅ PSR-4 propre, namespaces stricts, `declare(strict_types=1)`
- ✅ Hooks avec priorités explicites (init:10, init:11, wp_head:1, wp_head:30)
- ✅ Nonces, escaping, sanitization (wp_strip_all_tags, esc_html, esc_url, esc_attr)
- ✅ `Network: true` pour fonctionner en WP Multisite
- ✅ Check PHP >= 8.3 avant boot
- ✅ Activation seed les piliers, désactivation ne détruit rien
- ✅ Singleton pattern pour éviter double-boot
- ✅ Autoload PSR-4 manuel (pas besoin de composer install en prod)

## Roadmap v0.2+

- [ ] Meta box ACF-like pour les champs custom des CPT (sans dépendance ACF Pro)
- [ ] Widget dashboard avec graphes (views/téléchargements)
- [ ] Shortcodes `[inaricom_cta]`, `[inaricom_pillar_badge]`
- [ ] Gutenberg blocks custom (service-card, case-study-hero)
- [ ] Integration WPForms pour lead capture sur resources

## Licence

GPL v2 or later. Compatible WordPress.
