# Installation du snippet Coming Soon

> Temps estime : 5 minutes
> Risque : faible (reversible en 1 clic depuis Code Snippets)

## Prerequis

- Acces WP Admin Inaricom (role Administrator)
- Plugin **Code Snippets** installe et actif
- Acces au fichier `snippets/coming-soon-*.php` (dans le repo)

---

## Choix : patch minimal OU remplacement complet ?

### Option A — Patch minimal (si ton Coming Soon actuel te plait)

Tu gardes le design existant et tu ajoutes juste la whitelist API/admin.

1. WP Admin > Snippets > Tous les snippets
2. Trouve le snippet Coming Soon existant, clic **Edit**
3. Copie le contenu de `snippets/coming-soon-patch-minimal.php`
4. Colle ce contenu **TOUT EN HAUT** du snippet, avant le PHP existant
   - Attention : ne pas dupliquer la ligne `<?php` initiale
   - Si ton snippet existant commence deja par `<?php`, retire cette ligne du patch avant de coller
5. Clic **Save Changes and Execute Once** pour verifier qu'il n'y a pas d'erreur
6. Si OK : clic **Save Changes and Activate**
7. **Test** : voir section "Tester l'install" ci-dessous

### Option B — Remplacement complet (recommande pour Red Ops)

Tu remplaces l'actuel par la version refaite (design Inaricom Red Ops + whitelist + headers securite).

1. WP Admin > Snippets > Tous les snippets
2. Desactive l'ancien snippet Coming Soon (toggle off), mais ne le supprime pas
   - Garde-le comme backup historique
3. Clic **Add New**
4. Titre : `Coming Soon Red Ops v2`
5. Description : `Page maintenance avec whitelist API REST + admin (v2 - avril 2026)`
6. Type : **Functions (PHP)**
7. Copie TOUT le contenu de `snippets/coming-soon-complete.php`
8. Colle dans l'editeur
9. Scope : **Run snippet everywhere**
10. Priority : **10** (default)
11. Clic **Save Changes and Execute Once**
12. Si erreur au save : voir section Troubleshooting ci-dessous
13. Si OK : clic **Save Changes and Activate**

---

## Tester l'install

### Test 1 : page publique doit afficher le Coming Soon

Dans une fenetre **Incognito** (sinon tu es connecte admin) :

```
https://inaricom.com/
https://inaricom.com/web/
https://inaricom.com/shop/
```

→ Doit afficher la page Coming Soon avec statut HTTP 503.

### Test 2 : API REST doit repondre (debloquee)

Depuis Phoenix2, terminal :

```powershell
# API WooCommerce system_status (doit marcher)
curl.exe -u "ck_XXX:cs_XXX" "https://inaricom.com/web/wp-json/wc/v3/system_status"

# API WooCommerce products (doit aussi marcher apres patch)
curl.exe -u "ck_XXX:cs_XXX" "https://inaricom.com/web/wp-json/wc/v3/products"

# API WordPress native (marche apres App Password genere)
curl.exe -u "user:xxxx xxxx xxxx" "https://inaricom.com/web/wp-json/wp/v2/pages"
```

→ Doit retourner du JSON, pas du HTML 404.

### Test 3 : admin toujours accessible

```
https://inaricom.com/wp-admin/
```

→ Doit afficher la page de login WP normale.

---

## Troubleshooting

### "Error saving snippet" ou erreur 500 au save

Cause probable : WAF Infomaniak bloque le contenu (trop gros ou pattern suspect).

Solutions par ordre de preference :
1. Enlever temporairement le `<style>` inline et tester (le CSS est le plus gros)
2. Uploader le fichier en SFTP dans `wp-content/mu-plugins/coming-soon.php`
   (mu-plugins s'active automatiquement, pas besoin de Code Snippets)
3. Contact Infomaniak pour ajuster la regle WAF sur wp-admin/admin-ajax.php

### Les pages publiques affichent une erreur blanche au lieu du Coming Soon

Cause probable : erreur PHP fatale.

Actions :
1. Desactiver le snippet immediatement (toggle off dans Code Snippets)
2. Verifier les logs PHP dans Infomaniak (Panel > Logs > Error Log)
3. Corriger l'erreur
4. Reactiver

### Le site redirige toujours vers l'ancien Coming Soon

Cause : deux snippets Coming Soon actifs en meme temps.

Action : Snippets > Tous > desactiver l'ancien.

### Claude Code recoit toujours du HTML au lieu de JSON

Cause possible : cache CDN/Cloudflare qui stocke la redirection.

Actions :
1. Cloudflare > Caching > Purge Everything
2. Re-tester en ajoutant `?_cache=bust` a l'URL API
3. Verifier que le snippet est bien actif dans Code Snippets

---

## Rollback rapide

Si besoin de revert :
1. WP Admin > Snippets > trouver le snippet
2. Toggle off pour desactiver
3. Si ancien snippet Coming Soon encore present : toggle on dessus

Temps : 30 secondes.
