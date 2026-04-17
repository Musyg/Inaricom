# 🦊 INARICOM — Audit CSS/JS Mobile

**Objectif:** Répertorier TOUTES les règles qui modifient l'affichage mobile (≤768px)
**Date:** 2026-01-09
**Référence:** Layout Cloudflare Mobile

---

## 📋 FICHIERS À ANALYSER

1. [x] CSS Canvas Animation Renard (fox-animation.css)
2. [x] CSS Unifié Premium v5.1 (inaricom-unified.css)
3. [x] JS Fox Animation (fox-animation.js)
4. [ ] HTML Homepage (inline styles potentiels)

---

## 📱 RÈGLES MOBILE TROUVÉES

---

### 1. CSS Canvas Animation Renard

**Source:** Code fourni dans le prompt

#### Media Query `@media (max-width: 768px)`

```css
#fox-canvas-container,
#fox-canvas {
  display: none !important;
}

.hero-section,
.inari-hero {
  background: linear-gradient(180deg, #0a0a0b 0%, #12121a 100%) !important;
}
```

**Impact:**
- ❌ Cache complètement le canvas du renard animé sur mobile
- ✅ Applique un gradient de fond au hero (car plus de canvas)

**Problème identifié:**
- Le renard animé ne s'affiche PAS du tout sur mobile
- Contradictoire avec le JS qui prévoit un mode mobile (canvas 200px en bas du hero)

---

### 2. CSS Unifié Premium v5.1

**Source:** Document index 2

#### 2.1 Media Query `@media (max-width: 1500px)` — Section 49

```css
.inari-container,
.inaricom-container,
.site-main {
  padding-left: 32px;
  padding-right: 32px;
}
```

**Impact:** Réduit le padding latéral sur écrans < 1500px

---

#### 2.2 Media Query `@media (max-width: 1024px)` — Section 7 (Header/Navigation)

```css
.menu-toggle,
.mobile-toggle,
.kadence-menu-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.primary-navigation,
.main-navigation,
.kadence-navigation {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: rgba(10, 10, 15, 0.98);
  backdrop-filter: blur(20px);
  padding: 20px;
  transform: translateY(-100%);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 999;
}

.primary-navigation.active,
.main-navigation.active,
.navigation-open .primary-navigation {
  transform: translateY(0);
  opacity: 1;
}

.primary-navigation .menu,
.main-navigation .menu {
  flex-direction: column;
  gap: 4px;
}

.primary-navigation .menu-item a,
.main-navigation .menu-item a {
  padding: 12px 16px;
  border-radius: var(--radius-sm);
}

.primary-navigation .menu-item a:hover {
  background: rgba(var(--inari-red-rgb), 0.1);
}
```

**Impact:** 
- Affiche le burger menu
- Navigation en overlay plein écran
- Menu vertical

---

#### 2.3 Media Query `@media (max-width: 960px)` — Section 25

```css
.inaricom-hero {
  grid-template-columns: 1fr;
}

.resources-box {
  grid-template-columns: 1fr;
  gap: 40px;
  padding: 40px 24px;
}
```

**Impact:** Hero et resources passent en colonne unique

---

#### 2.4 Media Query `@media (max-width: 768px)` — Section 25

```css
.inari-hero-stats {
  gap: 32px;
}

.inari-hero-stats .stat-number {
  font-size: 1.5rem;
}
```

**Impact:** Réduit les stats du hero

---

#### 2.5 Media Query `@media (max-width: 720px)` — Section 25

```css
.hero-section,
.inari-services,
.inari-shop,
.inari-articles,
.inari-resources {
  padding: 60px 20px;
}

.inaricom-page-wrapper {
  padding-top: 3rem;
  padding-bottom: 3rem;
}
```

**Impact:** Réduit le padding des sections

---

#### 2.6 Media Query `@media (max-width: 768px)` — Section 38 (Blog/Archives)

```css
.posts-list,
.blog-posts,
.archive-posts {
  grid-template-columns: 1fr;
}

.post-navigation .nav-links {
  grid-template-columns: 1fr;
}

.author-box {
  flex-direction: column;
  text-align: center;
}

.comment .children {
  padding-left: 16px;
}

.wp-block-columns {
  flex-direction: column;
}

.entry-hero .entry-hero-container-inner {
  padding: 24px !important;
  margin: 10px !important;
}
```

**Impact:** Blog/articles en colonne unique

---

#### 2.7 Media Query `@media (max-width: 480px)` — Section 38

```css
.entry-meta,
.post-meta {
  flex-direction: column;
  gap: 8px;
}

.pagination {
  gap: 4px;
}

.page-numbers {
  min-width: 38px;
  height: 38px;
  padding: 0 12px;
}
```

**Impact:** Métadonnées articles + pagination compactées

---

#### 2.8 Media Query `@media (max-width: 768px)` — Section 40 (Theme Switcher)

```css
.theme-switcher-label { 
  display: none; 
}

.theme-dot { 
  width: 10px; 
  height: 10px; 
}

.theme-dot.active { 
  width: 14px; 
  height: 14px; 
}
```

**Impact:** Cache le label du switcher, réduit les dots

---

#### 2.9 Media Query `@media (max-width: 768px)` — Section 49 (Patch largeur)

```css
.inari-container,
.inaricom-container,
.site-main {
  padding-left: 20px;
  padding-right: 20px;
}
```

**Impact:** Padding latéral 20px sur mobile

---

#### 2.10 Media Query `@media (max-width: 768px)` — Section 50 (CLOUDFLARE STYLE) ⭐ PRINCIPAL

```css
/* === HEADER === */
.site-header .site-container,
.site-header-inner-wrap,
.site-header-wrap,
.site-header-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 12px 20px !important;
  width: 100% !important;
}

/* Logo */
.custom-logo,
.site-logo img {
  max-height: 32px !important;
  width: auto !important;
}

/* === BURGER KADENCE === */
.mobile-toggle-open-container {
  padding: 0 !important;
  margin: 0 !important;
  margin-left: auto !important;
}

.menu-toggle-open,
.menu-toggle-open.menu-toggle-style-default,
.mobile-toggle-open-container .menu-toggle-open {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 0 !important;
  color: rgba(255,255,255,0.5) !important;
}

.menu-toggle-open svg,
.mobile-toggle-open-container svg {
  width: 20px !important;
  height: 20px !important;
}

/* === HERO === */
.hero-section,
.inari-hero {
  padding: 20px 20px 24px !important;
}

.section-badge,
.inari-hero-badge,
.inaricom-badge {
  padding: 5px 10px !important;
  font-size: 10px !important;
  margin-bottom: 16px !important;
}

/* Titre — RÉDUIT */
.inari-hero-title,
.hero-section h1,
.inari-hero h1 {
  font-size: 1.5rem !important;
  line-height: 1.2 !important;
  margin-bottom: 10px !important;
}

/* Sous-titre */
.inari-hero-subtitle,
.inari-hero-content > p {
  font-size: 0.85rem !important;
  line-height: 1.5 !important;
  margin-bottom: 16px !important;
}

/* === BOUTONS CTA === */
.inari-hero-cta {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: 8px !important;
}

.inari-hero-cta .btn-primary,
.inari-hero-cta .inaricom-btn-primary,
.inari-hero-cta a.btn-primary {
  padding: 10px 18px !important;
  font-size: 13px !important;
  min-width: auto !important;
  width: auto !important;
}

.inari-hero-cta .btn-secondary,
.inari-hero-cta a.btn-secondary {
  padding: 8px 14px !important;
  font-size: 12px !important;
  background: transparent !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
  min-width: auto !important;
  width: auto !important;
}

/* Stats — CACHÉES */
.inari-hero-stats {
  display: none !important;
}

/* === GRILLES === */
.services-grid,
.shop-grid,
.articles-grid {
  grid-template-columns: 1fr !important;
}

.resources-box {
  grid-template-columns: 1fr !important;
  padding: 20px 16px !important;
}
```

**Impact MAJEUR:**
- Header: flex avec logo à gauche, burger à droite
- Logo: 32px max
- Burger: 24x24px, transparent, minimal
- Hero: padding réduit
- Badge: très petit (10px)
- Titre: 1.5rem (trop petit vs Cloudflare ~2rem)
- Sous-titre: 0.85rem
- CTAs: colonne, petits boutons
- Stats: CACHÉES
- Grilles: colonne unique

---

## 🔍 TABLEAU RÉCAPITULATIF

| Breakpoint | Sections impactées | Priorité |
|------------|-------------------|----------|
| 1500px | Padding containers | Basse |
| 1024px | Navigation burger | Moyenne |
| 960px | Hero grid, resources | Moyenne |
| 768px | **TOUT** (Section 50) | ⭐ HAUTE |
| 720px | Padding sections | Basse |
| 480px | Meta articles, pagination | Basse |

---

## ⚠️ PROBLÈMES IDENTIFIÉS

1. **Canvas renard CACHÉ** par fox-animation.css (`display: none`)
2. **Stats hero CACHÉES** par Section 50
3. **Titre trop petit** (1.5rem vs ~2rem Cloudflare)
4. **Pas de zone pour le renard** en bas des CTAs
5. **Conflits potentiels** entre Section 25 et Section 50 (même breakpoint 768px)
6. **Pas de placement explicite** du logo animé sous les CTAs

---

---

### 3. JS Fox Animation (fox-animation-wordpress.js)

**Source:** `C:\Users\gimu8\Desktop\fox-animation\fox-animation-wordpress.js`

#### ⚠️ AUCUNE LOGIQUE MOBILE DANS LE JS

Le code JS actuel :
- Crée dynamiquement `#fox-canvas-container` et `#fox-canvas`
- Charge les paths depuis GitHub JSON
- Anime les faisceaux lumineux
- **MAIS** : utilise les dimensions du JSON pour le canvas (pas de resize responsive)

```javascript
const canvasW = Array.isArray(data.canvas) ? data.canvas[0] : data.canvas.width;
const canvasH = Array.isArray(data.canvas) ? data.canvas[1] : data.canvas.height;
canvas.width = canvasW;
canvas.height = canvasH;
```

**Problèmes identifiés:**

1. **Pas de détection mobile** (`window.innerWidth <= 768`)
2. **Pas de resize listener** pour adapter le canvas
3. **Pas de repositionnement** du renard (droite desktop → centré mobile)
4. **Taille fixe** basée sur le JSON, pas responsive

**Ce qui MANQUE pour le layout Cloudflare mobile:**

```javascript
// ABSENT du code actuel :
function handleResize() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    // Réduire canvas à 200px hauteur
    // Centrer le renard
    // Positionner en bas du hero (après CTAs)
  }
}
window.addEventListener('resize', handleResize);
```

---

## 🎯 BILAN COMPLET

### Sources des problèmes mobile :

| Fichier | Problème | Impact |
|---------|----------|--------|
| fox-animation.css | `display: none` sur mobile | Canvas INVISIBLE |
| inaricom-unified.css | Pas de zone prévue pour canvas mobile | Pas d'emplacement |
| fox-animation.js | Aucune logique responsive | Taille fixe, pas de repositionnement |

### Actions correctives nécessaires :

1. **fox-animation.css** : Remplacer `display: none` par un positionnement mobile
2. **inaricom-unified.css** : Ajouter une zone `.fox-mobile-zone` après les CTAs
3. **fox-animation.js** : Ajouter détection mobile + resize + repositionnement

---

## 🎯 PROCHAINE ÉTAPE

Analyser le **HTML Homepage** pour vérifier les inline styles, puis proposer le **plan de correction**.

