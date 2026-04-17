# CLAUDE.md — Inaricom.com Refactoring Pipeline

> Ce fichier guide Claude Code pour la refonte complète du site inaricom.com.
> Stack: WordPress + WooCommerce | Objectif: site premium IA/cybersécurité

---

## IDENTITÉ BRAND

### Entreprise
- **Nom**: Inaricom (inaricom.com)
- **Activité**: Solutions IA locale, cybersécurité, e-commerce hardware IA
- **Cible**: PME, indépendants, CTOs — marché suisse/européen
- **Langue site**: Français
- **Siège**: Fribourg, Suisse

### Palette de couleurs (4 thèmes)
```css
/* Base commune */
--inari-bg: #0A0A0F;
--inari-bg-secondary: #111118;
--inari-text: #EFEBE8;
--inari-text-muted: rgba(239, 235, 232, 0.6);

/* Thème Rouge (défaut) */
--inari-accent: #E31E24;
--inari-accent-rgb: 227, 30, 36;
--inari-accent-hover: #FF3A40;

/* Thème Or */
--inari-accent: #D4A841;
--inari-accent-rgb: 212, 168, 65;

/* Thème Bleu */
--inari-accent: #2A7AE2;
--inari-accent-rgb: 42, 122, 226;

/* Thème Vert */
--inari-accent: #22C55E;
--inari-accent-rgb: 34, 197, 94;
```

### Design system
- **Logo**: Renard rouge (4 variantes couleur, SVG)
- **Aesthetic**: Dark premium, glassmorphism, high-tech
- **Références visuelles**: Nvidia.com, Groq.com, Mistral.ai, OpenAI.com, Cloudflare.com
- **Fonts**: Utiliser des fonts distinctives premium (PAS Inter, PAS Roboto)
- **Anti-patterns**: Aucun "AI slop" — pas de gradients violets, pas de layouts centrés génériques

### CSS Architecture
- Sélecteurs thème: `[data-theme="rouge"]`, `[data-theme="or"]`, etc.
- Toujours utiliser `var(--inari-*)` — JAMAIS de couleurs hardcodées
- Modifier les règles existantes plutôt qu'en ajouter
- Button text: utiliser `--inari-btn-text` pour contraste adaptatif

---

## STACK TECHNIQUE

### WordPress
- **Thème**: À déterminer (TT2 actuel → évaluer Kadence, Blocksy, ou custom)
- **Plugins essentiels**: WooCommerce, Simple Custom CSS and JS, Code Snippets, WPForms
- **Builder**: Gutenberg natif (pas Elementor)
- **CSS/JS custom**: Via plugin "Simple Custom CSS and JS" (AWCA)

### Technologies frontend premium (skills activés)
- **Vanta.js** — Backgrounds 3D animés (fog, net, waves) pour hero sections
- **GSAP + ScrollTrigger** — Animations scroll (reveal, parallax, pin)
- **anime.js** — Micro-animations SVG (fox logo draw, icon reveals)
- **Locomotive Scroll** — Smooth scrolling premium
- **Three.js** — Effets 3D avancés si nécessaire (fox constellation)
- **Barba.js** — Transitions entre pages (optionnel phase tardive)

### Infrastructure
- Tailscale: Phoenix2 (100.64.118.71), Phoenix4 (100.108.108.100)
- Optimisation: ShortPixel, BunnyCDN
- Qualité: PHPStan, PHPCS, Query Monitor

---

## ANIMATION FOX EXISTANTE

Le site a déjà une animation Canvas 2D du logo renard constellation:
- Canvas fixe en background (z-index: -1)
- `foxOffsetX: 0.72`, `foxScale: 0.85`
- Multi-theme color sync via MutationObserver sur `[data-theme]`
- Après `animationComplete = true`, les changements de thème appellent `drawFinalState()` avec `activeColors` mis à jour
- Trail lumineux FIFO 12 positions, composite 'lighter', shadowBlur 20

---

## PLAN DE REFACTO — 7 PHASES

### PHASE 1 — Homepage Premium ⚡ PRIORITÉ
- Hero section dark + Vanta.js background (fog ou net)
- Fox logo animé (anime.js SVG draw ou Canvas existant)
- Sections: IA locale / Boutique / Articles / Ressources
- CTA premium avec hover GSAP
- Mobile-first, responsive parfait
- Lighthouse 95+
- Theme switcher (4 couleurs) fixé bottom-left

### PHASE 2 — Structure Blog IA
Catégories:
- IA Locale (priorité)
- Raspberry Pi & IA
- Jetson Orin
- Stations & GPU IA
- LLMs en local
- Sécurité IA locale
- Edge Computing
- E-commerce & IA
- Guides / Ressources

### PHASE 3 — Boutique WooCommerce
Produits:
1. Jetson Orin (Nano/NX/AGX) — connexion DigiKey/Mouser API
2. Raspberry Pi 5 + kits IA
3. Stations IA préconfigurées
4. Templates Shopiweb
5. Packs IA locale (matériel + OS + guide)
- Dark theme WooCommerce custom (PHP hooks via Code Snippets)
- Stock badges dynamiques
- Prix temps réel via API fournisseurs

### PHASE 4 — Articles Premium (15 prévus)
Top 10 prioritaires:
1. IA locale : pourquoi les entreprises abandonnent le cloud
2. Raspberry Pi 5 + IA : limites et possibilités
3. Jetson Orin Nano / NX / AGX : comparatif définitif
4. Benchmarks IA locale : Pi vs Orin vs mini-PC IA
5. Guide : installer un assistant IA complet en local
6. Installer un LLM local (Qwen/Mistral/DeepSeek)
7. Architecture IA hybride pour PME et e-commerce
8. IA locale : sécurité, RGPD & souveraineté
9. Héberger ton assistant vocal IA (offline)
10. IA locale : les meilleurs modèles 4-bit
+ 5 articles e-commerce (Shopify, SEO, TikTok Ads, etc.)

### PHASE 5 — Lead Magnets (PDF gratuits)
1. Guide complet IA locale 2025
2. Pipeline e-commerce automatisé
3. Checklists IA entreprise
- Formulaire WPForms: "Télécharger gratuitement les ressources IA"

### PHASE 6 — Pages Services (brouillon, non publiées)
- Déploiement IA PME
- Architecture IA interne
- Agents IA personnalisés
- Consulting IA
- Sécurité & RGPD
- Migration cloud → local
- Agents marketing / trading / support

### PHASE 7 — Vérification & Publication
- Homepage → active
- Boutique → active
- Blog → articles publiés
- Ressources → formulaires actifs
- SEO: titres, métas, Open Graph
- Performance: Lighthouse 95+
- Mobile: responsive parfait

---

## EXIGENCES TECHNIQUES

### Performance
- Lighthouse Performance: 95+
- LCP < 2.5s
- CLS < 0.1
- FID < 100ms
- Pas de plugin inutile
- Images: WebP, lazy loading, ShortPixel

### SEO
- Titres H1 uniques par page
- Meta descriptions optimisées
- Schema.org (Product, Article, Organization)
- Sitemap XML
- Open Graph + Twitter Cards

### Responsive
- Mobile-first
- Breakpoints: 640px, 768px, 1024px, 1280px
- Fox canvas repositionné sous CTAs sur mobile
- Navigation hamburger premium

### Accessibilité
- Contrastes WCAG AA minimum
- Focus states visibles
- Alt text sur toutes les images
- Navigation clavier

---

## RÈGLES CLAUDE CODE

### Style de code
- CSS: variables custom, pas de !important sauf urgence
- PHP: hooks WooCommerce via Code Snippets, pas de modification theme files
- JS: ES6+, modules, pas de jQuery sauf WordPress natif
- HTML: sémantique, BEM pour classes custom

### Workflow
- Une modification à la fois
- Tester chaque changement
- Committer avec messages descriptifs
- Ne jamais supprimer du code sans backup

### Fichiers clés
- CSS custom: via Simple Custom CSS and JS plugin
- JS custom: via Simple Custom CSS and JS plugin  
- PHP hooks: via Code Snippets plugin
- Fox animation: `C:\Users\gimu8\Desktop\fox-animation\`

---

## FOURNISSEURS & REVENUS

### Distributeurs prioritaires
- ALSO (Emmen, CH) — 700+ vendors, API ACMP
- Alltron (Mägenwil, CH) — 200k+ produits
- DigiKey — API REST, livraison CH 48h
- Mouser — API Search + Order

### Affiliation
- CJ Affiliate (Dell, Corsair, B&H)
- Awin (HP, OVHcloud)
- Impact (Lenovo, Razer, Coursera)
- Amazon Associates DE

### Services haute marge
- Configuration workstations IA: 15-25% + 85% sur service
- Support technique par abonnement: CHF 29-299/mois
- Pré-installation OS IA: $50-200

---

## OUTILS FUTURS (post-refacto)

1. **AI Tool Finder** — questionnaire interactif recommandant des outils IA
2. **AI Mastery Hub** — tutoriels Claude, Gemini, ChatGPT, MCP
3. **Inaricom Configurator** — probe Rust détection hardware + recommandation achat
4. **Inaricom Local Ops** — console gestion agents IA locale
5. **Edge Box** — appliance IA clé en main (Jetson/Mini-PC + OS Inaricom)
