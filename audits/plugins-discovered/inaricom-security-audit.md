# Audit `inaricom-security.php` v1.2

> Plugin must-use localisé sur prod : `/home/toriispo/inaricom.com/web/wp-content/mu-plugins/inaricom-security.php`
> Copie locale : `audits/plugins-discovered/inaricom-security.php`
> Date audit : 17 avril 2026

## Bilan global

**Bonne architecture, protection sérieuse**. Le plugin couvre les 11 points critiques de durcissement WordPress (HL-001 à HL-011) référencés probablement dans un rapport de pentest antérieur ou une checklist interne. Positionnement en must-use = garantit chargement prioritaire et impossibilité de désactivation depuis le backoffice.

Responsable de la **quasi-totalité** de la stack headers HTTP observée dans l'audit baseline du 17 avril.

## Couverture détaillée

| ID | Fonction | Ligne approx. | Statut |
|---|---|---|---|
| HL-001 | Bloque REST `/wp/v2/users` + redirige pages author | 25-40 | ✅ |
| HL-002 | Rate limit login 5/15min par IP | 45-68 | ✅ |
| HL-003→010 | Headers sécu (HSTS + CSP + X-Frame + X-Content-Type + Referrer + Permissions-Policy) | 73-94 | ✅ |
| HL-007 | Hide WP/WC versions (remove generator + strip ?ver=) | 99-111 | ✅ |
| HL-008 | Bloque readme.txt/changelog.md/license.* | 116-126 | ✅ |
| HL-011 | Sert /.well-known/security.txt | 131-142 | ✅ |

## Helper notable

`inaricom_get_real_ip()` (lignes 14-22) : gère correctement l'IP réelle derrière Cloudflare (`HTTP_CF_CONNECTING_IP`) puis fallback sur `X-Forwarded-For` et `REMOTE_ADDR`. Important car sans ça, le rate limiting bannirait l'IP Cloudflare pour tout le monde.

## Points d'amélioration notés (Phase 2+)

### 1. CSP : retirer `'unsafe-inline'` et `'unsafe-eval'` avec des nonces
**Actuel** : `script-src 'self' 'unsafe-inline' 'unsafe-eval' ...` → CSP affaiblie contre XSS
**Cible** : nonces CSP par requête (comme Cloudflare/Anthropic/Vercel)
**Effort** : 1 jour, impact faible si bien fait

### 2. Rate limit login également par username
**Actuel** : compteur par IP uniquement → contournable avec botnet
**Cible** : double compteur IP + username
**Effort** : 2h

### 3. Logging des tentatives échouées
**Actuel** : transient, pas d'historique exploitable
**Cible** : table custom ou fichier plat pour analyse post-incident
**Effort** : 4h

### 4. CSP reporting
**Actuel** : pas de `report-uri` / `report-to`
**Cible** : endpoint `/csp-report` qui log les violations
**Effort** : 4h

### 5. Permissions-Policy plus complète
**Actuel** : camera/microphone/geolocation/payment désactivés
**Cible** : ajouter usb, bluetooth, midi, gyroscope, magnetometer, fullscreen=(self), etc.
**Effort** : 15 min

### 6. Pas d'audit log admin
Aucune trace des actions admin (plugin activé, user créé, option changée). Utile pour compliance et post-mortem.
**Cible** : hook `activated_plugin`, `user_register`, `update_option`, `profile_update`
**Effort** : 1 jour (plugin ou module séparé)

## Décisions pour Phase 1

- **Ne pas toucher le plugin** en Phase 1 → il marche, le modifier sans test = risque casser la sécu prod
- **Documenter clairement** que ce plugin est la source des headers (pour que personne ne les duplique dans `inaricom-core` à venir)
- **Noter son existence** dans `CLAUDE.md` pour que Claude Code ne tente pas de redéclarer les mêmes headers ailleurs

## Questions à Kevin (propriétaire)

1. Qui a écrit ce plugin ? Y a-t-il un repo git privé / versionné ?
2. Les IDs HL-001 à HL-011 correspondent-ils à un rapport de pentest ? Si oui, l'avoir pour voir les autres points.
3. Comment est-il déployé ? (manuel ? script ? rsync ?) — important pour les updates futures.
