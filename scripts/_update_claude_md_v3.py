"""Modifier CLAUDE.md pour refleter 5 themes + Phase 2 React islands demarree."""
import pathlib

p = pathlib.Path('CLAUDE.md')
c = p.read_text(encoding='utf-8')

# --- Modif 2 : 4 THEMES -> 5 THEMES + ajout ligne neutre ---
old_themes_section = """## SYSTEME DE COULEURS — 4 THEMES

### Mapping semantique (LOGIQUE = THEMATIQUE, pas type de page)

| Theme | Section | Accent | Dark | Light | RGB |
|-------|---------|--------|------|-------|-----|
| **rouge** (defaut) | Securite / Red Team / pentest / cybersec | `#E31E24` | `#B8161B` | `#FF3A40` | `227, 30, 36` |
| **or** | IA (services + boutique hardware + tutos IA) | `#FFD700` | `#B8860B` | `#FFE55C` | `255, 215, 0` |
| **vert** | Blog / ressources / savoir general | `#10B981` | `#059669` | `#34D399` | `16, 185, 129` |
| **bleu** | Institutionnel (a propos, contact, legal) | `#00D4FF` | `#00A8CC` | `#4DE8FF` | `0, 212, 255` |"""

new_themes_section = """## SYSTEME DE COULEURS — 5 THEMES

### Mapping semantique (LOGIQUE = THEMATIQUE, pas type de page)

| Theme | Section | Accent | Dark | Light | RGB |
|-------|---------|--------|------|-------|-----|
| **neutre** | **Homepage** (equite entre piliers, pas de dominance) | `#FFFFFF` | `#E0E0E0` | `#FFFFFF` | `255, 255, 255` |
| **rouge** (defaut) | Securite / Red Team / pentest / cybersec | `#E31E24` | `#B8161B` | `#FF3A40` | `227, 30, 36` |
| **or** | IA (services + boutique hardware + tutos IA) | `#FFD700` | `#B8860B` | `#FFE55C` | `255, 215, 0` |
| **vert** | Blog / ressources / savoir general | `#10B981` | `#059669` | `#34D399` | `16, 185, 129` |
| **bleu** | Institutionnel (a propos, contact, legal) | `#00D4FF` | `#00A8CC` | `#4DE8FF` | `0, 212, 255` |"""

assert old_themes_section in c, 'OLD themes section not found'
c = c.replace(old_themes_section, new_themes_section)
print('[OK] Modif 2 : 5 themes table')

# --- Modif 3 : Phase 2 stack technique ---
old_phase2 = """### Phase 2 (Q1-Q3 2027) — React islands + Next.js headless
- **WordPress Interactivity API** (IAPI) pour tabs, filtres, add-to-cart
- **Ilots React** pour configurateur hardware 3D et zones interactives riches
- **Next.js 16** (App Router, RSC, Cache Components) pour frontend premium"""

new_phase2 = """### Phase 2 (Q2 2026 — DEMARRE) — React islands sur WordPress
- **React 19 + TypeScript + Vite** dans `react-islands/` (dev), buildé vers `plugins/inaricom-core/assets/react/` (prod)
- **Tailwind CSS v4** : tokens `--inari-*` via `@theme`, heritage des CSS custom properties WP
- **shadcn/ui** (Radix, WCAG par defaut) + **lucide-react** + **Framer Motion**
- **@tanstack/react-query** pour fetch WP REST API
- **Islands cibles** : homepage (actuelle), AI Tool Finder (2.5), Hardware Config 3D (2.6), AI Mastery Hub (2.7), pages services cybersec (2.8)
- **WordPress Interactivity API** (IAPI) : envisage Phase 3 pour tabs/filtres WooCommerce (pas prioritaire)
- **Next.js 16 headless** : reporte en Phase 3+ (uniquement si besoin reel)
- Plan detaille : `@docs/phase2-react-islands.md`"""

assert old_phase2 in c, 'OLD Phase 2 section not found'
c = c.replace(old_phase2, new_phase2)
print('[OK] Modif 3 : Phase 2 React islands stack')

# --- Modif 4 : Stack frontend pages WP classiques ---
# L'agent frontend-kadence dit deja "Tailwind en Phase 2" donc pas besoin de toucher l'agent
# Par contre, on met a jour la section "ANIMATION / 3D" pour clarifier
old_anim = """### Animation / 3D
- **Fox animation** : migration Canvas 2D -> **OGL + Polyline + glow additif HDR** (15 KB, 60fps mobile)
- **GSAP 3.13+** (gratuit depuis 2025, tous plugins inclus)
- **Lenis** smooth scroll
- **Three.js + R3F** uniquement pour configurateur hardware (Phase 2)
- **Fallback statique** : SVG inline + `filter: drop-shadow()` multicouches (visuellement ~90% de l'animation)"""

new_anim = """### Animation / 3D

**Cote WordPress (pages classiques)**
- **Fox animation** : migration Canvas 2D v28 -> **OGL + Polyline + glow additif HDR** (15 KB, 60fps mobile)
- **GSAP 3.13+** (gratuit depuis 2025, tous plugins inclus)
- **Lenis** smooth scroll
- **Fallback statique** : SVG inline + `filter: drop-shadow()` multicouches (visuellement ~90% de l'animation)

**Cote React islands**
- **Framer Motion 11+** pour anim UI React (entrées, transitions, micro-interactions)
- **React Three Fiber v9** (Phase 2.6) pour configurateur hardware 3D
- **Three.js + WebGPU** pour R3F (fallback WebGL2)
- Respect `prefers-reduced-motion` obligatoire cote WP **et** React"""

assert old_anim in c, 'OLD Animation section not found'
c = c.replace(old_anim, new_anim)
print('[OK] Modif 4 : Animation/3D section split WP/React')

# --- Modif 5 : Ajouter ligne sur react-islands dans FICHIERS & DOCS CLES ---
old_files = """- `@docs/architecture.md` — decisions structurelles
- `@docs/backlog.md` — plan consolide 7 phases
- `@docs/tech-debt.md` — dette technique suivie
- `@docs/session-log.md` — journal sessions (3-5 bullets/jour)
- `@docs/runbooks/` — procedures incident/rollback/DR
- `@PLAN_REFONTE_INARICOM.md` — plan execution detaille
- `.mcp.json` — configuration MCP servers"""

new_files = """- `@docs/architecture.md` — decisions structurelles
- `@docs/backlog.md` — plan consolide 8 phases
- `@docs/tech-debt.md` — dette technique suivie
- `@docs/session-log.md` — journal sessions (3-5 bullets/jour)
- `@docs/runbooks/` — procedures incident/rollback/DR
- `@docs/phase2-react-islands.md` — plan complet React islands (NEW)
- `@docs/BRIEF_CLAUDE_CODE_PHASE_2.0.md` — brief setup Vite pour Claude Code (NEW)
- `@PLAN_REFONTE_INARICOM.md` — plan execution detaille v3
- `.mcp.json` — configuration MCP servers
- `react-islands/` — projet React/Tailwind (NEW Phase 2)"""

assert old_files in c, 'OLD fichiers section not found'
c = c.replace(old_files, new_files)
print('[OK] Modif 5 : Fichiers & docs cles enrichie')

p.write_text(c, encoding='utf-8')
print()
print('[SUCCESS] CLAUDE.md mis a jour (v3)')
