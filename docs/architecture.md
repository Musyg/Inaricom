# Architecture Inaricom — decisions structurelles

Document de reference pour les decisions architecturales du site inaricom.com.

---

## 1. Phasage global

### Phase 1 (actuelle — Q2-Q4 2026)
- **WordPress + Kadence Classic** (pas FSE)
- **Animations** : vanilla CSS + GSAP via CDN + OGL pour fox animation
- **Custom code** : Simple Custom CSS and JS plugin + Code Snippets plugin
- **Plugin maison** : `inaricom-core` (CPT, mapping couleurs, hooks metier)
- **Theme switcher** 4 couleurs via `[data-theme]` + body class PHP

### Phase 2 (Q1-Q3 2027)
- **React islands** : configurateur hardware 3D (R3F + WebGPU)
- **WordPress Interactivity API** (IAPI) pour tabs/filtres/add-to-cart
- **Next.js 16 headless** progressivement sur blog + pages marketing

### Phase 3 (Q4 2027+)
- **Speculation Rules API** prerender
- **WebGPU defaut** + fallback WebGL2
- **Migration Faust.js** si HWP Toolkit stabilise

---

## 2. Stack verrouillee

### Backend
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

### Frontend
| Composant | Choix | Raison |
|-----------|-------|--------|
| CSS | Vanilla + CSS custom properties | Zero dependance, perf max |
| Animations | GSAP 3.13+ | Gratuit depuis avril 2025, tous plugins |
| Smooth scroll | Lenis v1.3.x | Standard 2026 (remplace Locomotive) |
| Fox animation | OGL + Polyline + glow additif HDR | 15 KB, 60fps mobile (Three.js 155 KB) |
| Fonts | Geist Sans + Geist Mono + Instrument Serif | Gratuits OFL, self-hostes |
| Logo swap | `content: url()` (fichiers SVG separes) | Pas de filtre CSS approximatif |

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
+-- /securite/                      [THEME ROUGE] pilier 1
|   +-- /securite/pentest/
|   +-- /securite/red-team/
|   +-- /securite/audit/
|   +-- /securite/conformite/ (nLPD, FINMA, NIS2, DORA)
|   +-- /securite/menaces/
|   +-- /securite/reponse-incident/
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
+-- /                               [THEME BLEU — defaut] pilier 4
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

Voir `inaricom-child/style.css` section `:root`. Regles :

- Variables `--inari-*` pour palette fixe (noirs, textes, bordures, glass)
- Variables `--inari-red-*` surchargees par `[data-theme]` (4 themes)
- `--semantic-error` = amber `#F59E0B` (JAMAIS le rouge brand)
- Toutes opacites via `rgba(var(--inari-red-rgb), x.x)`

---

## 5. Securite — principes non negociables

1. **wp-config durci** : `DISALLOW_FILE_EDIT`, `FORCE_SSL_ADMIN`, `WP_AUTO_UPDATE_CORE => 'minor'`
2. **Headers** : CSP progressive, HSTS, X-Frame-Options, X-Content-Type-Options
3. **WAF Cloudflare** : rate-limit wp-login, block XML-RPC, bot fight mode
4. **Secrets** : JAMAIS dans le code, `.env` gitignore + GitHub Secrets pour CI
5. **Backups** : UpdraftPlus Premium, rotation 30j/12m/7y, chiffrement GPG
6. **CVE monitoring** : WPScan daily + Dependabot auto-PR

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
| Bundle JS critique | < 80 KB gzipped | Webpack Bundle Analyzer |
| LCP candidate | H1 text (pas canvas WebGL) | Chrome DevTools |

---

## 7. Multilingue — strategie

- **Structure** : sous-repertoires `/fr/` (defaut) + `/en/` via Polylang Pro
- **Hreflang** : auto via Rank Math
- **Contenu prioritaire FR** (marche Suisse romande + FR + BE + LU)
- **EN** : pages services + articles tier 1 seulement (budget)
- **DE/IT** : non prioritaires (pas de plan a court terme)

---

## 8. Accessibilite — conformite

- **WCAG 2.2 AA** minimum (obligatoire European Accessibility Act juin 2025)
- **Contrastes** : ratio AAA souhaite (`#EFEBE8` sur `#0A0A0F` = 17:1)
- **Focus visible** : outline 2px thematique sur tous interactifs
- **`prefers-reduced-motion`** : respecte sur TOUS animations
- **Lecteur ecran** : test NVDA (Windows) + VoiceOver (macOS)
- **Accessibility statement** publie FR/DE/IT

---

## 9. Data residency — nLPD

- **Donnees utilisateurs** : 100% Suisse (Infomaniak Geneve/Zurich)
- **CDN Cloudflare** : pas de stockage PII, uniquement cache de rendu
- **Fonts** : self-hostees obligatoires (jugement Munich €250k Google Fonts CDN)
- **Analytics** : Matomo self-hosted (pas Google Analytics) ou consent mode
- **Politique confidentialite** : publiee FR/DE/IT, responsable Inaricom Sarl, sous-traitant Infomaniak

---

## 10. Roadmap infrastructure

- [x] Git repo initialise
- [x] Phoenix2 dev env (skills, Claude Code)
- [ ] Infomaniak staging provisionne
- [ ] Infomaniak prod configure
- [ ] Cloudflare DNS + WAF
- [ ] GitHub Actions (lighthouse, playwright, security, deploy)
- [ ] MCP staging + MCP prod-readonly
- [ ] Secrets management (GitHub Secrets + 1Password CLI)
