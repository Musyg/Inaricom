# Deployment pipeline — Inaricom

## Environnements

| Env | URL | Path | DB | Accès |
|-----|-----|------|-----|-------|
| **Prod** | https://inaricom.com | `/home/toriispo/inaricom.com/web/` | `toriispo_659c0a3` | `ssh inaricom` |
| **Staging** | https://staging.inaricom.com | `/home/toriispo/inaricom.com/web-staging/` | `toriispo_staging` | `ssh inaricom` |

Tous deux sur SwissCenter plan **Home** (128 MB PHP max). Accessible via la même connexion SSH
`toriispo@web24.swisscenter.com` avec la clé `~/.ssh/inaricom_swisscenter`.

## Règle d'or

**Le pipeline va TOUJOURS prod → staging. JAMAIS l'inverse.**

La prod contient des commandes clients WooCommerce réelles. Toute opération
staging → prod doit être manuelle, réfléchie, backupée. Voir section "Promotion staging → prod"
en bas de ce document (à rédiger quand Phase 2 démarre).

## Scripts disponibles

### `scripts/sync-from-prod.sh`
Rsync prod → staging (code uniquement, pas la DB).
Exclut toujours : `wp-config.php`, `.htaccess`, `.htyoezfp.appconfig.php`, `mu-plugins/staging-hardening.php`.

```bash
# Dry-run d'abord (recommande)
bash scripts/sync-from-prod.sh --dry-run

# Reel
bash scripts/sync-from-prod.sh

# Reel sans uploads (si ca prend trop de temps)
bash scripts/sync-from-prod.sh --skip-uploads
```

### `scripts/db-backup.sh`
Dump DB avec horodatage.

```bash
bash scripts/db-backup.sh prod       # dump prod -> ~/backup-prod-<timestamp>.sql
bash scripts/db-backup.sh staging    # dump staging -> ~/backup-staging-<timestamp>.sql

# Rapatrier en local
scp inaricom:~/backup-prod-<timestamp>.sql ./backups/
```

### `scripts/db-clone-prod-to-staging.sh`
Clone complet DB prod → staging avec :
1. Backup staging avant (safety net)
2. Dump prod (nettoyé des directives privilégiées GTID)
3. Import dans staging
4. Search-replace URLs prod → staging
5. Fix tables multisite
6. Anonymisation nLPD/RGPD (users, WC, comments)
7. Reset password admin staging
8. Désactivation Coming Soon + WC Payments
9. Flush cache

```bash
# Lancer avec password admin par defaut
bash scripts/db-clone-prod-to-staging.sh

# Ou avec password custom
STAGING_ADMIN_PASS="MonNouveauPassword!" bash scripts/db-clone-prod-to-staging.sh
```

Le script est **interactif** : demande confirmation avant d'écraser + avant le search-replace.

## Workflow dev typique

### Modifier un snippet / plugin custom / theme child

```bash
# 1. Sync staging <- prod (optionnel, si pas fait recemment)
bash scripts/sync-from-prod.sh

# 2. Edit en staging (via SSH ou via wp-admin staging)
ssh inaricom
nano ~/inaricom.com/web-staging/wp-content/plugins/mon-plugin/fichier.php

# 3. Tester en navigation privee sur https://staging.inaricom.com

# 4. Si OK, promouvoir vers prod (MANUEL, pas de script encore)
#    -> copier la modif vers /web/ via scp ou edit direct
#    -> wp cache flush cote prod

# 5. Commit dans le repo local
git add ...
git commit -m "feat(snippet): ajout filtre XYZ"
git push
```

### Avant modif DB prod

```bash
# Backup obligatoire
bash scripts/db-backup.sh prod

# Test sur staging d'abord
bash scripts/db-clone-prod-to-staging.sh
# ...faire la modif...
# ...tester sur https://staging.inaricom.com...

# Si OK, reproduire manuellement en prod
ssh inaricom
cd ~/inaricom.com/web
wp db query "UPDATE ..."
wp cache flush
```

## Gotchas connus

### 1. WP Multisite
Inaricom est un **WP Multisite** avec 3 sous-sites (ID 1, 2, 5). Sur staging, seul ID 1
(`inaricom.com` → `staging.inaricom.com`) est accessible. Les sous-sites ID 2 (`torii-sport.ch`)
et ID 5 (`shop.inaricom.com`) nécessiteraient des sous-domaines staging dédiés pour être testables.

### 2. Path legacy `/web/`
La prod a `siteurl = https://inaricom.com/web` et `home = https://inaricom.com` (WP core
dans `/web/` sous-dossier). Sur staging le vhost pointe directement sur `/web-staging/` donc
`siteurl = home = https://staging.inaricom.com` (sans `/web`). Le search-replace doit toujours
**cleanup les refs legacy** après :
```bash
wp search-replace 'staging.inaricom.com/web' 'staging.inaricom.com' --all-tables-with-prefix
```

### 3. Mémoire 128 MB plan Home
Plafond dur SwissCenter. Pour tenir :
- OPcache ON dans Apanel → Configuration PHP
- Plugins tracking désactivés (GTM, FB Pixel, WC Analytics, WC Payments)
- `DISABLE_WP_CRON` + `AUTO_UPDATE_CORE=false` dans wp-config staging

### 4. Coming Soon WooCommerce
Page "En transformation" = `woocommerce_coming_soon = yes` + snippet PHP #8.
**Désactivé uniquement en staging** (option DB, pas partagée avec prod). En prod reste `yes`.

### 5. SwissCenter ne lit pas `.user.ini`
Toute config PHP passe par Apanel UI (Configuration PHP par domaine).
`.user.ini` et `php_value` dans `.htaccess` sont ignorés.

### 6. Directive GTID dans mysqldump
WP-CLI inclut par défaut `SET @@GLOBAL.GTID_PURGED`, nécessite SUPER privilège
(pas disponible sur mutualisé). Tous les scripts cleanup ces lignes via grep -v.

## Plan d'upgrade possible

Si la mémoire 128 MB devient bloquante :
- **Option A** : upgrade SwissCenter Home → Business (256 MB, ~CHF 5-10/mois) - à valider avec Kevin
- **Option B** : migration Infomaniak Managed Cloud (voir Research Report)
- **Workaround court terme** : "Boost 24h à 2048 MB" via bouton Apanel (Configuration PHP)

## Historique

- **2026-04-18** : création initiale staging (voir `session-2026-04-18-recap.md`)
