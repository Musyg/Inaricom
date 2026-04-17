# Regle : Securite d'abord

> Regle chargee automatiquement dans le contexte Claude Code.
> Principe directeur : **un site cybersec DOIT etre exemplaire**.

## Principes non negociables

### 1. Secrets JAMAIS en clair
- Secrets dans `.env` (gitignore)
- Production via GitHub Secrets
- Clés API hors Desktop/OneDrive
- JAMAIS `echo $SECRET` dans un log ou une PR

### 2. Sanitize in, Escape out
**Toute entree utilisateur** : `sanitize_text_field`, `sanitize_email`, `absint`, `wp_kses_post`
**Toute sortie** : `esc_html`, `esc_attr`, `esc_url`, `wp_kses`
**Requetes SQL** : `$wpdb->prepare` obligatoire

### 3. Nonces sur tous formulaires
```php
wp_nonce_field('action_name', '_wpnonce');
// ... traitement ...
if (!wp_verify_nonce($_POST['_wpnonce'], 'action_name')) wp_die();
```

### 4. Capability checks avant action privilegiee
```php
if (!current_user_can('manage_options')) wp_die();
```

### 5. Headers obligatoires en prod
- CSP (progressive : Report-Only 2 semaines puis enforce)
- HSTS avec preload
- X-Frame-Options SAMEORIGIN
- X-Content-Type-Options nosniff
- Referrer-Policy strict-origin-when-cross-origin

### 6. DB operations
- JAMAIS `wp search-replace` sans `--dry-run` prealable
- TOUJOURS `wp db export` avant operation DB
- Backups chiffres GPG + rotation

### 7. WP hardening wp-config
- `DISALLOW_FILE_EDIT` + `DISALLOW_FILE_MODS`
- `FORCE_SSL_ADMIN`
- `WP_AUTO_UPDATE_CORE => 'minor'`
- Salts regeneres 2x/an
- `table_prefix` jamais `wp_`

### 8. Cloudflare WAF
- Rate-limit wp-login
- Block XML-RPC (sauf usage justifie)
- Bot fight mode ON

### 9. Surveiller les CVE
- Dependabot actif
- WPScan daily
- PHPCS sur PR

### 10. Semantic vs Brand colors
- `--semantic-error: #F59E0B` (amber) pour erreurs UI
- `--inari-red: #E31E24` JAMAIS pour semantic error (brand uniquement)

---

Ces regles sont **non negociables** quelle que soit la pression projet. La credibilite cybersec d'Inaricom en depend.
