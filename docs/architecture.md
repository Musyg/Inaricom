# Architecture Inaricom — decisions structurelles

Document de reference pour les decisions architecturales du site inaricom.com.

Derniere MAJ : 21 avril 2026 (accelerage Phase 2 React islands)

---

## 1. Phasage global

### Phase 1 (Q2-Q4 2026) — WordPress + Kadence vanilla
**Statut reel : ~85% fait**

- **WordPress + Kadence Classic** (pas FSE)
- **Animations** : vanilla CSS + GSAP via CDN + OGL pour fox animation
- **Custom code** : Simple Custom CSS and JS plugin + Code Snippets plugin
- **Plugin maison** : `inaricom-core` (CPT, taxonomy pillar, ThemeMapper, SchemaInjector)
- **Theme switcher** 5 couleurs via `[data-theme]` + body class PHP (rouge, or, vert, bleu, neutre)

### Phase 2 (Q2 2026 — DEMARRE) — React islands sur WordPress
**Avance d'un an par rapport au plan initial.**

- **React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui**
- **Homepage islands** : hero + cards piliers + derniers articles (remplace page 985)
- **AI Tool Finder** (Phase 2.5, Q3 2026) : questionnaire interactif
- **Hardware Configurator 3D** (Phase 2.6, Q3-Q4 2026) : R3F + WebGPU
- **AI Mastery Hub** (Phase 2.7, Q4 2026) : tutoriels interactifs
- **Pages services cybersec** (Phase 2.8, Q1 2027) : landings premium

WordPress reste backend complet (contenu, WooCommerce, SEO, back-office).
React monte via `<div id="inari-*-root">` genere par `inaricom-core`.

Voir plan detaille : `docs/phase2-react-islands.md`

### Phase 3 (Q4 2027+) — Headless complet optionnel
**Statut : conditionnel, pas engage**

- **Speculation Rules API** prerender
- **WebGPU defaut** + fallback WebGL2
- **Migration Next.js 16 headless** si besoin reel (blog + pages marketing)
- **Faust.js** si HWP Toolkit stabilise

---

## 2. Stack verrouillee

### Backend (inchange Phase 1 -> 2)
| Composant | Choix | Raison |
|-----------|-------|--------|
| CMS | WordPress (dernier stable) | Ecosysteme, maitrise equipe |
| Theme | Kadence Classic | Maturite 5 ans, hooks documentes, CWV OK |
| E-commerce | WooCommerce | Standard marche, compat Twint/Swiss VAT |
| Hebergement | Infomaniak (Geneve/Zurich) | nLPD native, ISO 27001 |
| CDN/WAF | Cloudflare Free (puis Pro) | WAF custom, bot mgmt, DDoS |
| SEO | Rank Math Free | llms.txt natif, Schema Builder |
| Multilingue | Polylang Pro | Hreflang auto, sous-repertoires |
| Perf | WP Rocket (optionnel) | Si Cloudflare Pro insuffisant |
| Security | Wordfence Premium + WPScan | Defense en profondeur |

### Frontend WP (pages classiques — blog, services hors home, boutique, legal)
| Composant | Choix | Raison |
|-----------|-------|--------|
| CSS | Vanilla + CSS custom properties | Zero dependance, perf max |
| Animations | GSAP 3.13+ | Gratuit depuis avril 2025, tous plugins |
| Smooth scroll | Lenis v1.3.x | Standard 2026 (remplace Locomotive) |
| Fox animation | OGL + Polyline + glow additif HDR | 15 KB, 60fps mobile (Three.js 155 KB) |
| Fonts | Geist Sans + Geist Mono + Instrument Serif | Gratuits OFL, self-hostes |
| Logo swap | `content: url()` (fichiers PNG separes) | Pas de filtre CSS approximatif |

### Frontend React islands (homepage, AI Tool Finder, Configurator, Mastery Hub)
**Nouveau depuis Phase 2.**

| Composant | Choix | Version | Raison |
|-----------|-------|---------|--------|
| Build tool | **Vite** | 6.x | Bundle leger, HMR instantane |
| Language | **TypeScript** | 5.6+ | Types stricts, DX moderne |
| UI framework | **React** | 19.x | Concurrent mode, ecosystem mature |
| Styling | **Tailwind CSS** | v4.x | Tokens `--inari-*` via `@theme`, 10x plus rapide |
| Components | **shadcn/ui** | latest | Code copie, Radix accessible WCAG |
| Icons | **lucide-react** | latest | 1400+ icons, tree-shake |
| Anim UI React | **Framer Motion** | 11.x | Complementaire a GSAP (WP-side) |
| 3D React | **React Three Fiber** | v9 | Phase 2.6 configurator |
| Data fetching | **@tanstack/react-query** | v5 | Cache + revalidation |

Location : `react-islands/` a la racine du repo.  
Bundles buildés vers : `plugins/inaricom-core/assets/react/`.

### Dev pipeline
| Composant | Choix | Raison |
|-----------|-------|--------|
| Repo | GitHub `Musyg/Inaricom` | Integration Actions, Dependabot |
| CI/CD | GitHub Actions | Free tier 2000 min/mois suffit |
| Deploy | SSH + rsync + atomic symlinks | Capistrano pattern, rollback < 1s |
| Monitoring | UptimeRobot + Sentry + Cloudflare | Gratuit ou low-cost |
| MCP | filesystem + ssh + chrome-devtools + playwright | Segmentation staging/prod |

---

## 3. Architecture du site — arborescence

```
inaricom.com
|
+-- /                               [THEME NEUTRE] homepage React island
|   (hero + 3 cards piliers + pourquoi + derniers articles + CTA contact)
|
+-- /securite/                      [THEME ROUGE] pilier 1
|   +-- /securite/pentest/
|   +-- /securite/red-team/
|   +-- /securite/audit/
|   +-- /securite/conformite/ (nLPD, FINMA, NIS2, DORA)
|   +-- /securite/menaces/
|   +-- /securite/reponse-incident/
|
+-- /accueil-cybersecurite/         [THEME ROUGE] ex-homepage, landing secu
|
+-- /ia/                            [THEME OR] pilier 2
|   +-- /ia/services/
|   +-- /ia/hardware/ (boutique WooCommerce)
|   +-- /ia/tutoriels/
|   +-- /ia/local-first/
|   +-- /ia/securite/               [THEME ROUGE — secu prime]
|
+-- /ressources/                    [THEME VERT] pilier 3
|   +-- /ressources/glossaire/
|   +-- /ressources/guides/
|   +-- /ressources/checklists/
|   +-- /ressources/etudes-de-cas/
|
+-- /                               [THEME BLEU] pilier 4 institutionnel
    +-- /a-propos/
    +-- /services/
    +-- /contact/
    +-- /politique-divulgation-responsable/
```

**CPT additionnels** (mapping couleurs via body class) :
- `/cve/` -> theme rouge
- `/outils/` -> theme or (si tools IA) ou rouge (si tools secu)
- `/etudes-de-cas/` -> theme rouge

---

## 4. Design tokens — source de verite unique

### Source de verite Phase 1
Snippet 347 (custom-css-js plugin) en DB + fichier statique `wp-content/uploads/custom-css-js/347.css`.

Build via `scripts/_build_347.py` a partir des sections modulaires dans `audits/` :
- Sections 1-60 : base (palette fixe, 4 themes, tokens)
- Section 61 : hero + icones cards
- Section 62 : blog cards titles
- Section 63 : theme-neutre homepage

### Source de verite Phase 2
`react-islands/src/styles/globals.css` :
- `@theme` heritant des tokens WP (via CSS custom properties)
- Classes Tailwind auto-reagissent a `[data-theme]`

### Regles absolues
- Variables `--inari-*` pour palette fixe (noirs, textes, bordures, glass)
- Variables `--inari-red-*` surchargees par `[data-theme]` (5 themes maintenant)
- `--semantic-error` = amber `#F59E0B` (JAMAIS le rouge brand)
- Toutes opacites via `rgba(var(--inari-red-rgb), x.x)`

---

## 5. Securite — principes non negociables

1. **wp-config durci** : `DISALLOW_FILE_EDIT`, `FORCE_SSL_ADMIN`, `WP_AUTO_UPDATE_CORE => 'minor'`
2. **Headers** : CSP progressive, HSTS, X-Frame-Options, X-Content-Type-Options (deja en place via `inaricom-security.php` mu-plugin)
3. **WAF Cloudflare** : rate-limit wp-login, block XML-RPC, bot fight mode
4. **Secrets** : JAMAIS dans le code, `.env` gitignore + GitHub Secrets pour CI
5. **Backups** : UpdraftPlus Premium, rotation 30j/12m/7y, chiffrement GPG
6. **CVE monitoring** : WPScan daily + Dependabot auto-PR
7. **React islands** : CSP adaptee pour `'self'` sur `/wp-content/plugins/inaricom-core/assets/react/`, SRI hashes sur scripts critiques

**Principe directeur** : un site cybersec DOIT etre exemplaire. C'est un argument commercial.

---

## 6. Performance — budgets non negociables

| Metrique | Seuil | Mesure |
|----------|-------|--------|
| LCP | < 2.5s | PageSpeed Insights + CrUX |
| INP | < 200ms | Chrome DevTools + CrUX (remplace FID depuis mars 2024) |
| CLS | < 0.1 | Chrome DevTools |
| Lighthouse Perf | >= 90 (mobile) / >= 95 (desktop) | CI sur PRs |
| Lighthouse A11y | = 100 | CI obligatoire |
| Bundle JS critique | < 80 KB gzipped | Webpack Bundle Analyzer / Vite |
| LCP candidate | H1 text (pas canvas WebGL) | Chrome DevTools |
| Skeleton SSR | LCP du skeleton < 1s | Must, avant hydratation React |

---

## 7. Multilingue — strategie

- **Structure** : sous-repertoires `/fr/` (defaut) + `/en/` via Polylang Pro
- **Hreflang** : auto via Rank Math
- **Contenu prioritaire FR** (marche francophone : FR + BE + LU + CH, sans priorite geographique)
- **EN** : pages services + articles tier 1 seulement (budget)
- **DE/IT** : non prioritaires (pas de plan a court terme)
- **React islands** : i18n via `react-i18next` quand on branchera EN

---

## 8. Accessibilite — conformite

- **WCAG 2.2 AA** minimum (obligatoire European Accessibility Act juin 2025)
- **Contrastes** : ratio AAA souhaite (`#EFEBE8` sur `#0A0A0F` = 17:1)
- **Focus visible** : outline 2px thematique sur tous interactifs
- **`prefers-reduced-motion`** : respecte sur TOUS animations (GSAP et Framer Motion)
- **Lecteur ecran** : test NVDA (Windows) + VoiceOver (macOS)
- **Accessibility statement** publie FR/DE/IT
- **shadcn/ui** : base Radix donc accessible par defaut, validation axe-core obligatoire

---

## 9. Data residency — nLPD

- **Donnees utilisateurs** : 100% Suisse (Infomaniak Geneve/Zurich)
- **CDN Cloudflare** : pas de stockage PII, uniquement cache de rendu
- **Fonts** : self-hostees obligatoires (jugement Munich €250k Google Fonts CDN)
- **Analytics** : Matomo self-hosted (pas Google Analytics) ou consent mode
- **Politique confidentialite** : publiee FR/DE/IT, responsable Inaricom Sarl, sous-traitant Infomaniak
- **Fox animation paths JSON** : a migrer depuis raw.githubusercontent vers self-hosted WP (dette tech P3)

---

## 10. Roadmap infrastructure

- [x] Git repo initialise
- [x] Phoenix2 dev env (skills, Claude Code)
- [x] Staging Infomaniak provisionne (clone prod)
- [x] SSH staging + prod (alias `inaricom`)
- [ ] Infomaniak prod configure (production finale, post-Phase 2)
- [ ] Cloudflare DNS + WAF
- [ ] GitHub Actions (lighthouse, playwright, security, deploy)
- [ ] MCP staging + MCP prod-readonly
- [ ] Secrets management (GitHub Secrets + 1Password CLI)
- [ ] Pipeline build `react-islands/` -> `plugins/inaricom-core/assets/react/` (NEW Phase 2)
