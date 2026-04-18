# Session 2026-04-18 — Phase 1.C : Staging environment + pipeline deploy

## 🎯 Objectif atteint
Création de `staging.inaricom.com` iso-prod (clone code + DB + anonymisation),
permettant de tester toutes les modifs Phase 1 sans risque pour la prod.

**Status final : Phase 1.C 100% BOUCLÉE** (C.1 + C.2 + C.3).

## ✅ C.1 — Environnement staging (BOUCLÉE)

### Infrastructure
- **Sous-domaine** : `staging.inaricom.com` créé dans Apanel
- **DNS** : Record A `94.103.96.197` (IP origine SwissCenter), proxy Cloudflare **désactivé** (nuage gris) pour bypass cache + WAF
- **SSL** : Let's Encrypt géré automatiquement par SwissCenter
- **Dossier** : `/home/toriispo/inaricom.com/web-staging/` (417 MB rsync depuis prod)
- **DB** : `toriispo_staging` (user identique, password dans password manager)

### Configurations critiques

#### `wp-config.php` staging (différences vs prod)
```php
define( 'DB_NAME', 'toriispo_staging' );
define( 'DB_USER', 'toriispo_staging' );
define( 'DB_PASSWORD', '<password staging>' );
define( 'DOMAIN_CURRENT_SITE', 'staging.inaricom.com' );  // multisite fix
define( 'WP_HOME', 'https://staging.inaricom.com' );
define( 'WP_SITEURL', 'https://staging.inaricom.com' );
define( 'COOKIE_DOMAIN', '' );  // evite conflit cookies prod
define( 'NOBLOGREDIRECT', 'https://staging.inaricom.com' );
define( 'WP_MEMORY_LIMIT', '512M' );
define( 'WP_MAX_MEMORY_LIMIT', '512M' );
define( 'DISABLE_WP_CRON', true );
define( 'AUTOMATIC_UPDATER_DISABLED', true );
define( 'WP_AUTO_UPDATE_CORE', false );
```

#### Tables multisite DB
```sql
UPDATE hiiw_site  SET domain='staging.inaricom.com' WHERE domain='inaricom.com';
UPDATE hiiw_blogs SET domain='staging.inaricom.com' WHERE domain='inaricom.com';
UPDATE hiiw_sitemeta SET meta_value='https://staging.inaricom.com/' WHERE meta_key='siteurl';
UPDATE hiiw_sitemeta SET meta_value='admin@staging.local' WHERE meta_key='admin_email';
```

#### Search-replace WP-CLI
- `https://inaricom.com` → `https://staging.inaricom.com` : **875 remplacements**
- `staging.inaricom.com/web` → `staging.inaricom.com` : **278 remplacements** (legacy du path prod `/web/`)
- `http://` version : 0 remplacement (prod deja full HTTPS)

### Anonymisation nLPD/RGPD (DB staging uniquement)
- **2155 users** → emails `staging-user-<ID>@staging.local`
- **Admin ID=1 `inaroot`** → email `admin@staging.local`, password reset `StagingAdmin2026!`
- **1 commande WooCommerce** (HPOS + legacy metas) anonymisée
- **42 commentaires** → emails fake, IPs `0.0.0.0`
- `admin_email` + `woocommerce_email_from_address` + `hiiw_sitemeta admin_email` anonymises

### Plugins désactivés en staging
Ces plugins sont actifs en prod mais dangereux/inutiles en staging :
- `advance-wc-analytics` (tracking)
- `duracelltomi-google-tag-manager` (GTM)
- `official-facebook-pixel` (tracking pub)
- `kadence-starter-templates` (bloat)
- `ns-cloner-site-copier` (migration)
- `cloudflare` (Cloudflare ne proxy pas staging de toute façon)
- **`woocommerce-payments`** (⚠️ critique : evite traitements Stripe fictifs)

### Options WooCommerce staging uniquement
- `woocommerce_coming_soon` = `no` (la prod reste en `yes`)
- `woocommerce_private_link` = `no`

### mu-plugin `staging-hardening.php` (staging only)
Nouveau mu-plugin sécurité, **safety check** sur `WP_HOME` pour ne jamais s'activer en prod même copié par erreur. Fonctions :
1. `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex` HTTP header
2. `<meta name="robots">` dans `<head>`
3. `blog_public = 0` forcé (SEO plugins compliants)
4. Bandeau zebra rouge/noir en bas visible partout front
5. Badge "STAGING" dans admin bar + banner rouge pied de wp-admin
6. **Blocage mails sortants** : `wp_mail` redirigé vers `admin@staging.local`, `pre_wp_mail` bypassé
7. Cron requests non-bloquants (doublon safe avec `DISABLE_WP_CRON`)
8. **Auto-désactivation** des plugins bannis (Stripe, FB Pixel, GTM) si réactivés par erreur

## ✅ C.2 — Scripts de deploy (BOUCLÉE)

- ✅ `scripts/sync-from-prod.sh` — rsync prod → staging (one-way, dry-run par défaut, exclusions propres)
- ✅ `scripts/db-clone-prod-to-staging.sh` — dump + nettoyage GTID + import + search-replace + multisite fix + anonymisation
- ✅ `scripts/db-backup.sh` — dump horodaté avec nettoyage privilèges
- ✅ `docs/deployment.md` — procédure complète + gotchas

**Tests de validation** :
- `db-backup.sh prod` → dump 21 MB OK ✅
- `db-backup.sh staging` → dump 21 MB OK ✅
- `sync-from-prod.sh --dry-run` → exclusions correctes (`wp-config.php`, `.htaccess`, `error_log`, `mu-plugins/staging-hardening.php`) ✅

## ✅ C.3 — Protection accès staging (BOUCLÉE)

Auth HTTP basique activée via **Apanel → Site web → Protection des répertoires** (UI native SwissCenter).

- **Chemin protégé** : `/home/toriispo/inaricom.com/web-staging/` (récursif sur tout staging)
- **User** : `staging`
- **Password** : dans `STAGING_CREDENTIALS.txt` (18 chars, conforme charset SwissCenter)
- **Message realm** : `Staging Inaricom - Acces restreint`

**Tests curl de validation** :
- Sans auth → HTTP 401 ✅
- Avec bon couple → HTTP 200 ✅
- Avec mauvais password → HTTP 401 ✅

**Validation visuelle par Gilles** : site Inaricom chargé normalement en navigation privée,
avec banner STAGING visible en bas de page (screenshot 22h43).

## 🔐 Credentials
Stockés dans `C:\Users\gimu8\Desktop\Inaricom\STAGING_CREDENTIALS.txt`
(à migrer vers password manager et supprimer le .txt).

| Item | Valeur |
|------|--------|
| URL | https://staging.inaricom.com |
| Auth HTTP user | `staging` |
| Auth HTTP pass | `InaStg-Kx7m9vR2@pL` |
| Admin WP user | `inaroot` |
| Admin WP pass | `StagingAdmin2026!` |
| DB name | `toriispo_staging` |
| DB user | `toriispo_staging` |
| DB pass | `VpXfH@w2rfijv2mwMzOeG` |

## ⚙️ Décisions importantes

### Plan SwissCenter = Home, 128 MB plafond
Le plan `Home` plafonne memory_limit à 128 MB (doc SwissCenter 2016).
Upgrade Business = 256 MB mais **plan de Kevin, pas d'upgrade avant revenue**.

**Stratégie adoptée** : alléger staging pour tenir dans 128 MB
- OPcache activé (Apanel)
- 7 plugins désactivés (tracking + bloat + WC Payments)
- Résultat : WP peak ~155 MB en CLI (sans OPcache), OK en HTTP avec OPcache
- Boost 24h NON utilisé (non pérenne)

### Coming Soon — découverte importante
La page "En transformation Juillet 2026" NE vient **pas** d'un plugin maintenance
mais du **WooCommerce Coming Soon natif** (WC 10+) avec snippet PHP #8
(plugin Code Snippets) qui intercepte via `get_option('woocommerce_coming_soon')`.

Le toggle est dans `wp_options` donc **isolé par instance WP** : désactivé en staging,
reste actif en prod.

### Multisite architecture découverte
Inaricom est un **WP Multisite** avec 3 sous-sites :
- ID 1 : `inaricom.com` (principal, maintenant staging)
- ID 2 : `torii-sport.ch` (WooCommerce Torii-Sport)
- ID 5 : `shop.inaricom.com` (boutique Inaricom)

Seul ID 1 est accessible via `staging.inaricom.com`. Les sous-sites 2 et 5 ne sont
**pas testables** via staging pour l'instant (nécessiterait sous-domaines dédiés
type `staging-torii.inaricom.com` + override DB blogs).

## 📌 Guardrails CLAUDE.md respectés

- ✅ Zero edition /wp-content/themes/kadence/ (thème parent intouché)
- ✅ Zero write direct en prod (uniquement lecture et dumps)
- ✅ Zero search-replace sans `--dry-run` d'abord
- ✅ Zero duplication headers/hooks de `inaricom-security.php`
- ✅ Zero Google Fonts CDN ajouté
- ✅ Credentials pas en Git (fichier local uniquement, dans .gitignore)

## 🟢 État final — staging 100% opérationnel

```
URL          : https://staging.inaricom.com/
Auth HTTP    : 401 sans cred, 200 avec staging:******
HTTP         : 200 OK
Taille page  : 262 KB (site Kadence complet)
Title        : "Inaricom - Solutions IA et cybersecurite pour PME suisses"
Headers      : HSTS, CSP, X-Frame-Options DENY, X-Robots-Tag noindex
Banner       : STAGING visible bas de page (zebra rouge/noir)
Admin        : /wp-admin accessible, badge STAGING rouge
Theme-swtch  : 4 pastilles rouge/or/bleu/vert en haut à gauche
```

**Validé visuellement par Gilles en navigation privée à 22h43.**

## 🔜 Prochaine session

Démarrage étape **A** du plan C→A→B : plugin `inaricom-core`.
Voir `docs/phase1-plan-c-a-b.md` pour le détail.

**Commande de reprise** :
```bash
cd ~/Desktop/Inaricom
./scripts/claude.sh
```

Puis dans Claude Code :
> On attaque l'étape A du plan Phase 1 (plugin inaricom-core).
> C est 100% bouclée (cf session-2026-04-18-recap.md).
> PRD en 1 page avant de coder : structure PSR-4, 3 CPT, taxonomy pillar, theme-switcher.
