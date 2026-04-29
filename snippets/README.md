# Snippets PHP custom Inaricom

> Snippets a installer via le plugin **Code Snippets** dans WP Admin.
> Tous les snippets sont versionnes ici dans Git pour historique + partage avec Emre.

## Convention de nommage

- `<fonction>-<version>.php` : version pretes a coller dans Code Snippets
- `<fonction>-patch-XX.php` : patch cible sur un snippet existant
- `<fonction>-complete.php` : remplacement complet d'un snippet

## Comment installer un snippet

1. WP Admin > Snippets > Add New (ou Edit pour un snippet existant)
2. Type : **Functions (PHP)** ou **Front-end CSS** selon le cas
3. Scope : **Run snippet everywhere** (sauf indication contraire)
4. Coller le contenu du fichier `.php`
5. **Test** : "Save Changes and Execute" > verifier qu'aucune erreur 500 n'apparait
6. Si OK : clic "Save Changes and Activate"

## Troubleshooting

Si "save failed" ou erreur 500 au save :
- Le snippet est peut-etre trop gros pour le WAF Cloudflare ou les limites SwissCenter
- Solution : decouper en 2 snippets plus petits
- Ou : uploader le fichier `.php` directement dans `mu-plugins/` via SFTP

## Snippets disponibles

### coming-soon
- **coming-soon-patch-minimal.php** : 4 lignes a ajouter AU DEBUT du snippet Coming Soon actuel pour debloquer l'API REST sans toucher au reste
- **coming-soon-complete.php** : snippet COMPLET refait from scratch (remplace l'actuel), design Red Ops, whitelist API et admin

## Historique

- 2026-04-17 : creation initiale avec snippets Coming Soon
