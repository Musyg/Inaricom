# Inventaire CSS/JS Custom Inaricom

> Audit 2026-04-19 — Gilles / Claude
> Source : plugin **Simple Custom CSS and JS** (post_type=custom-css-js)
> Staging DB : `toriispo_staging`, table `hiiw_posts`

## Vue d'ensemble

**13 posts custom-css-js actifs**, pour un total de **~6 450 lignes**.

Typologie mélangée : CSS (majorité), JS (switcher + fox + table scroll), HTML (markup switcher).

Le plugin permet 4 attributs par snippet :
- **type** : `header` (dans `<head>`) ou `footer` (avant `</body>`)
- **language** : `css` ou `js`
- **side** : `frontend` / `admin`
- **priority** : ordre d'injection (tous à 5 — ambigu pour résoudre les conflits de spécificité)

## Inventaire détaillé

### 🔴 Majeurs (>1 000 lignes) — Le cœur du système

| ID | Titre | Type | Lang | Lignes | Rôle | État |
|----|-------|------|------|--------|------|------|
| **347** | custom CSS INARICOM | header | css | **4 065** | CSS principal (v5.1) : variables, thèmes, composants, WooCommerce, blog, Gutenberg | 🟡 Dette technique forte |
| **684** | Pages Legales CSS | header | css | **792** | Style dédié pages légales (sections 54-56, continuation du 347) + 4 thèmes | 🟢 Propre, mais thèmes dupliqués manuellement |
| **443** | Fox Animation | footer | js | **715** | Canvas 2D renard v28 | 🟡 À migrer OGL (Phase 2 plan) |

### 🟡 Moyens (100-500 lignes) — Composants isolés

| ID | Titre | Type | Lang | Lignes | Rôle | État |
|----|-------|------|------|--------|------|------|
| **952** | Fiches produits (Premium) | header | css | 197 | Classes `.inari-*` pour fiches produits WooCommerce | 🔴 Hex hardcodés (`#E31E24`, `#22C55E`) au lieu de variables |
| **740** | WPforms Style | header | css | 157 | Style glassmorphism WPForms isolé | 🔴 Hex hardcodés rouge partout |
| **768** | Theme Switcher Mobile | header | css | 102 | Switcher position fixed bottom-left + tailles plus grandes | 🟠 **PAS un doublon du 347 #40** : réécrit complètement le switcher, override silencieux (voir section Conflits) |

### 🟢 Mineurs (<100 lignes) — Micro-composants

| ID | Titre | Type | Lang | Lignes | Rôle | État |
|----|-------|------|------|--------|------|------|
| **496** | Thème Switcher | header | js | 77 | Logique localStorage + events `.theme-dot` + `CustomEvent('inaricom-theme-change')` | 🟢 Propre, code clean |
| **442** | Fox Canvas Container | header | css | 51 | Position absolue canvas renard mobile (opacity 0.35 derrière contenu) | 🟢 Propre, clair |
| **1051** | Fiches produit | header | css | 26 | Classes `.fp-*` pour fiches audit produits | 🔴 Hex hardcodés, minifié monoligne |
| **497** | Thème Toggle | header | html | 12 | Markup HTML du switcher `<div class="theme-switcher">` | 🟢 Propre, à mettre dans Kadence Header Builder |
| **673** | Tableau Scrolling Horizontal | header | js | 10 | Wrap auto `<table>` dans `.table-scroll` | 🟢 Minimal |
| **672** | Tableaux Scroll Horizontal | header | css | 12 | Styles `.table-scroll` pour le wrap | 🟢 Minimal |
| **508** | Centrage Hero page accueil | header | css | 10 | Hero full-width desktop (`width: 100vw`) | 🟢 Trivial mais redondant avec #25 du 347 |

---

## Problèmes identifiés

### 🔴 Problème 1 — Google Fonts CDN (347 ligne 1)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

**Violation directe CLAUDE.md §Guardrails** (risque nLPD/RGPD, Munich €100-250k).
**Impact** : chaque visite fait requête Google depuis UE, transfert IP Mountain View.
**Fix** : self-host Inter dans `kadence-child/assets/fonts/` + `@font-face`.

### 🔴 Problème 2 — Hex hardcodés dans 3 snippets

| Snippet | Hex détectés | Conséquence |
|---------|--------------|-------------|
| **740** (WPForms) | `#E31E24`, `rgba(227,30,36,*)` en dur | Boutons/focus restent rouges même en thème or/bleu/vert |
| **952** (Fiches produits) | `#E31E24`, `#22C55E`, `#3B82F6`, `#8A8A9A` en dur | Couleurs fixes pour badges, specs, icônes — inari-red cassé |
| **1051** (Fiches produit audit) | `#E31E24` en dur partout | Idem — mais c'est un sous-template audit, peu critique si assume rouge |

**Fix commun** : remplacer par `var(--inari-red)`, `var(--inari-text-muted)`, etc.

### 🟠 Problème 3 — Théme switcher : 2 versions coexistantes (347 #40 + 768)

**Ce n'est pas un doublon, c'est un override silencieux** :
- Le 347 #40 définit le switcher petit (12px dots, 16px active)
- Le 768 redéfinit complètement (16px dots, `border: 2px`, glow coloré actif, mobile fixed bottom-left 28px)
- Même priority (5) → ordre d'injection WP détermine le gagnant → **768 gagne systématiquement**

**Conséquence** : éditer le 347 #40 ne change **rien** visuellement — trap pour Gilles.
**Fix** : supprimer le switcher de 347 #40 (vestige), garder uniquement 768. Ou consolider les deux dans un seul snippet.

### 🔴 Problème 4 — Thèmes dupliqués dans 347 et 684

Le 347 section 43-46 réécrit **à la main** toutes les règles pour or/bleu/vert :
```css
[data-theme="or"] .section-badge { background: rgba(255,215,0,0.08) !important; ... }
[data-theme="bleu"] .section-badge { background: rgba(0,212,255,0.08) !important; ... }
[data-theme="vert"] .section-badge { background: rgba(16,185,129,0.08) !important; ... }
```

**Pourquoi c'est problématique** : la section 1 du 347 (variables) fait déjà :
```css
[data-theme="or"] { --inari-red: #FFD700; --inari-red-rgb: 255, 215, 0; ... }
```

Ce qui **aurait dû suffire** si toutes les règles utilisaient `var(--inari-red)` / `rgba(var(--inari-red-rgb), *)`. Mais comme beaucoup de règles mettent **explicitement** `#E31E24` dans le CSS de base (sans variable), il a fallu tout réécrire pour chaque thème.

**Exemple de règle qui aurait dû être universelle** :
```css
/* Écrit 4 fois dans le 347 (sections 43, 44, 46) */
[data-theme="or"] .woocommerce .price { color: #FFD700 !important; }
[data-theme="bleu"] .woocommerce .price { color: #00d4ff !important; }
[data-theme="vert"] .woocommerce .price { color: #10B981 !important; }
/* + default ne change pas */

/* Devrait être écrit une seule fois */
.woocommerce .price { color: var(--inari-red); }
```

**Conséquence** : **~200+ règles `!important` par couleur hardcodée** dans les sections 43-46. Multiplie la taille du CSS par 4.

**Fix** : refactoring qui remplace les hex par des variables dans les sections 5-42, puis suppression quasi-totale des sections 43-46.

### 🟡 Problème 5 — Organisation : sections 54-56 dans le 684 au lieu du 347

Les sections 54 (Pages légales), 55 (Pages légales responsive), 56 (Pages légales thèmes) sont **numérotées comme une suite** de 347, mais stockées dans un snippet séparé (684). Cohérent en tant que module isolé mais la numérotation trompe. Pas critique, juste déroutant.

### 🟡 Problème 6 — Fiches produits : 2 snippets (952 + 1051)

- **952** "Fiches produits" (197 lignes, namespace `.inari-*`)
- **1051** "Fiches produit" (26 lignes, namespace `.fp-*`)

**Pas un doublon** (namespaces différents), mais **deux systèmes en parallèle** pour le même besoin (styler les fiches produits WooCommerce). Probablement un vestige (`.fp-*` ancien, remplacé par `.inari-*`). À vérifier par visite d'une fiche produit réelle pour voir laquelle est utilisée activement.

### 🟢 Problème 7 — 508 Hero Centrage redondant avec 347 #49

- **508** ligne unique : `width: 100vw; margin-left: calc(-50vw + 50%)` pour `.hero-section` desktop
- **347 #49** "Patch largeur Cloudflare" : `max-width: 1440px` sur les containers et `max-width: 100%` sur `.hero-section`

Les deux coexistent sans se cogner, le 508 fait un full-width plus agressif qui override le 347 #49 sur desktop. Peut rester, mais **mérite d'être fusionné** quand on refactorise.

---

## Taille réelle vs taille effective

**Brut** : 6 450 lignes
**Compressible** (après consolidation + variables) : **estimation ~2 500-3 000 lignes**, soit **-55%**.

Gros gains possibles :
- Sections 43-46 du 347 : ~800 lignes qui disparaissent avec variables partout
- Patchs mobiles (sections 50-53) : ~200 lignes consolidables
- Théme switcher 347 #40 : ~50 lignes à supprimer (doublon avec 768)
- Total **~1 050 lignes potentiellement éliminables** dans le 347 seul

---

## Destin recommandé par snippet

| ID | Destin | Commentaire |
|----|--------|-------------|
| **347** | 🔧 Refactor progressif | Le plus gros chantier : virer hex + consolider sections 43-46 |
| **684** | 🔧 Simplification | Supprimer sections 56 (thèmes) si 347 refactorisé avec variables |
| **952** | 🔧 Variabiliser | Remplacer hex par variables, garder en snippet WC-specific |
| **740** | 🔧 Variabiliser | Idem, snippet WPForms-specific |
| **1051** | ❓ Décision | Auditer usage réel. Si `.fp-*` inutilisé, supprimer. Sinon variabiliser. |
| **443** | 🔄 Migration OGL | Plan Phase 2 — Canvas 2D → OGL (15 KB, 60 FPS mobile) |
| **442** | ➡️ Fusion avec 347 | Petit snippet mobile, à fusionner dans la section mobile du 347 |
| **508** | ➡️ Fusion avec 347 #49 | Redondant, à nettoyer |
| **768** | ✅ Garder tel quel | **Seule source de vérité** du switcher. Supprimer 347 #40 pour éviter confusion. |
| **496** | ✅ Garder tel quel | JS propre, bien structuré. Migration possible dans child theme plus tard. |
| **497** | ➡️ Header Builder Kadence | HTML à coller dans Header Builder directement, pas dans un snippet CSS/JS. |
| **673** | ✅ Garder | JS minimal utile |
| **672** | ✅ Garder | CSS minimal du 673 |

---

## Plan de refactoring proposé

### Étape B.0 (prioritaire 15 min) — Self-host Inter
Virer le `@import Google Fonts` du 347 ligne 1. Self-host dans `kadence-child/assets/fonts/`. Règle CLAUDE #1 respectée.

### Étape B.1 (30 min) — Supprimer 347 #40 (doublon switcher)
Garder uniquement le 768. Alléger 347 de ~50 lignes. Zéro risque visuel (le 768 gagne déjà).

### Étape B.2 (45 min) — Variabiliser 740 (WPForms)
Remplacer tous les hex par `var(--inari-*)`. WPForms deviendra réactif aux thèmes automatiquement.

### Étape B.3 (1h) — Variabiliser 952 (Fiches produits)
Idem, + validation visuelle sur une fiche produit staging.

### Étape B.4 (2-3h) — Refactor massif 347 sections 43-46
Le gros morceau : replacer hex par variables dans les sections 5-42 du 347, puis supprimer 200+ règles `!important` dans les sections 43-46 devenues inutiles.

### Étape B.5 (30 min) — Consolider 442 + 508 dans 347
Sous-snippets mobiles/hero à fusionner dans les sections mobile du 347.

### Étape B.6 (30 min) — Décision 1051 (Fiches produit audit)
Audit sur le site : si `.fp-*` n'apparait plus dans les pages, supprimer. Sinon variabiliser.

**Total estimé : 5-6h de travail concentré.**

---

## Hors scope pour maintenant

- **443 Fox Animation** (715 lignes JS) : migration OGL est un chantier Phase 2 à part entière (6-8 jours documentés). Ne pas toucher ce snippet dans B.
- **Migration vers child theme Kadence** : peut attendre après le refactoring propre. Quand le CSS est consolidé dans `styles.css` child theme, on pourra le versionner via git et bénéficier du cache HTTP natif.

---

## Takeaway

**Le CSS actuel fonctionne**. Il n'y a pas de bug visible pour l'utilisateur. Mais :
- Il est **lourd** (100 KB pour le 347 seul, 6 450 lignes total)
- Il est **fragile** (modifier une section risque d'être silencieusement écrasé par une autre, cf 347 #40 ↔ 768)
- Il **viole la règle #1 CLAUDE.md** (Google Fonts CDN)
- Il **multiplie par 4** les règles pour les 4 thèmes au lieu d'utiliser les variables CSS

Le chantier est **gros mais faisable** en 5-6h concentrées. On peut y aller **progressivement** : B.0 → B.5 en micro-étapes validables après chaque.

Ou on peut **le laisser en l'état** et attaquer d'autres priorités (C.A.B → continuer A avec des templates WordPress, ou refacto hero premium). Le CSS actuel n'empêche rien, il rend juste les futures modifs plus lourdes.

**Ma reco** : faire **B.0 et B.1 tout de suite** (45 min combinés, gains immédiats), puis décider le reste au cas par cas en fonction des priorités.
