# Acces Claude Code au site Inaricom

> Etat au 17 avril 2026 — a tenir a jour a chaque changement.

## TL;DR

- [OK] `.env` cree, gitignore, reconnu par tout script
- [OK] Cles WooCommerce API stockees, authentifiees, fonctionnelles
- [WARN] Coming Soon actif bloque 99% des endpoints API
- [KO] Application Password WordPress pas encore genere
- [KO] Acces SSH / SFTP non configure

## Ce que Claude Code peut faire MAINTENANT

### 1. Lire les credentials depuis .env

Pattern standard : les variables sont dans `.env` (gitignore), Claude Code
les lit via read_file/bash_tool quand il en a besoin. Pas de hardcoded.

```powershell
# PowerShell
Get-Content .env | Where-Object { $_ -match '^[A-Z]' -and $_ -match '=' } | ForEach-Object {
    $k, $v = $_ -split '=', 2
    Set-Item -Path "env:$k" -Value $v
}
```

```bash
# Bash / WSL
set -a; source .env; set +a
```

### 2. Interroger WooCommerce API

**Fonctionnel immediatement** (teste 2026-04-17) :

```
GET https://inaricom.com/web/wp-json/wc/v3/system_status
Auth: Basic base64(WC_CONSUMER_KEY:WC_CONSUMER_SECRET)
```

Retourne versions WP/WC/PHP, thème actif, plugins. Endpoint unique qui
passe actuellement le Coming Soon.

### 3. Lire le code du thème local

Dossier `kadence-child/` dans le repo. Actuellement minimal — pas synchrone
avec la prod (style.css custom + fox-animation.js surtout).

---

## Ce qui ne marche PAS (et pourquoi)

### Coming Soon bloque tous les endpoints sauf system_status

Le snippet PHP `template_redirect` intercepte toutes les requetes non admin
et renvoie la page "retour en juillet 2026". Meme les requetes API authentifiees.

Symptome typique : `GET /wp-json/wc/v3/products` retourne du HTML 404 au lieu de JSON.

### Deux solutions

**Solution A — Whitelist REST API dans le snippet (recommandee)**

Ajouter en haut du snippet Coming Soon :

```php
add_action( 'template_redirect', function() {
    // Whitelist : laisser passer REST API authentifiee
    if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
        return;
    }
    // Whitelist : admin, login, cron
    if ( is_user_logged_in() || is_admin() ) {
        return;
    }
    // Sinon : afficher le Coming Soon
    // [reste du snippet inchange]
});
```

Effet : API REST accessible en auth. Visiteurs publics voient toujours le Coming Soon.

**Solution B — Whitelist par IP Tailscale**

Plus opaque, mais dependent de ton IP dynamique :

```php
$whitelist_ips = [ '100.64.118.71' ]; // Phoenix2 Tailscale
if ( in_array( $_SERVER['REMOTE_ADDR'], $whitelist_ips, true ) ) {
    return;
}
```

### Application Password WordPress pas genere

Pour les endpoints `/wp/v2/*` (pages, posts, media, users), il faut creer
un Application Password (pas le mdp admin).

Marche a suivre :
1. WP Admin > Utilisateurs > Profil
2. Section "Mots de passe d'application" (en bas)
3. Nom : `Claude Code Phoenix2`
4. Copier le resultat : `xxxx xxxx xxxx xxxx xxxx xxxx`
5. Renseigner dans `.env` :
   ```
   WP_ADMIN_USER=ton_user_admin
   WP_APPLICATION_PASSWORD_USER=ton_user_admin
   WP_APPLICATION_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
   ```

Rotation recommandee : tous les 6 mois (trace dans tech-debt).

---

## Workflows typiques Claude Code

### Session "modifier un produit WooCommerce"

```
1. Claude lit .env (variables WC_*)
2. GET /wp-json/wc/v3/products/<id>
3. Claude propose modifs (description, prix, categorie)
4. Toi : confirmation
5. PUT /wp-json/wc/v3/products/<id>
6. GET de verification
```

Pas besoin de MCP server, juste curl / Invoke-RestMethod.

### Session "creer un article de blog"

```
1. Claude lit .env (WP_APPLICATION_*)
2. POST /wp-json/wp/v2/posts auth Basic
3. Article cree en draft
4. Toi : valider + publier via admin ou 2e call API
```

Necessite App Password (pas encore genere).

### Session "auditer la perf du site"

```
1. Claude lit .env (WC_CONSUMER_*)
2. GET system_status -> versions, plugins, serveur
3. Suggere optimisations basees sur l'inventaire
```

Ca marche DEJA sans rien modifier au site.

---

## Securite

- Pas de credentials en clair dans les commits (`.env` gitignore)
- Pas dans Slack/email/chats exports
- Rotation tous les 6 mois (WC ck/cs + App Password WP)
- Privilege minimum : user WP dedie `claude_api_user` role Editor (pas Administrator)
- Plugin Simple History pour logger toutes les actions API
- Revoke rapide : supprimer App Password dans WP Admin > Profil,
  OU regenerer les cles dans WooCommerce > Settings > Advanced > REST API

---

## Prochaines etapes recommandees

- [ ] Patcher Coming Soon avec Solution A (whitelist REST API auth)
- [ ] Creer user WP dedie `claude_api` (role Editor)
- [ ] Generer App Password sur ce user, mettre dans `.env`
- [ ] Installer plugin Simple History
- [ ] Renommer le fichier mal nomme dans `.secrets` (`cles wordpress.txt` -> `cles woocommerce.txt`)

---

## Historique

- 2026-04-17 : creation, `.env` configure, API WC ck/cs testees et fonctionnelles sur system_status
