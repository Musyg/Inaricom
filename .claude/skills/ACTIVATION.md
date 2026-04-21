# Activation des skills - Inaricom Phase 2

> Tous les skills actifs sont charges automatiquement par Claude Code.
> Derniere MAJ : 21 avril 2026

## Skills actifs (14 pour Phase 2 Inaricom)

### Direction esthetique (2)

| Skill | Source | Role |
|-------|--------|------|
| `taste-skill` | Leonxlnx/taste-skill | 3 molettes DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY, anti-slop |
| `frontend-design` | anthropics-skills | Anti-AI slop, bold aesthetic direction |

### Setup technique React 19 + Tailwind v4 (3)

| Skill | Source | Role |
|-------|--------|------|
| `tailwind-v4-shadcn` | secondsky/claude-skills | @theme inline, CSS vars hsl(), previent 8 erreurs v4 |
| `react-best-practices` | vercel-labs/agent-skills | 70 regles perf React/Next.js en 8 categories |
| `web-design-guidelines` | vercel-labs/agent-skills | 100+ regles UX/a11y (Apple HIG + Material 3 + WCAG 2.2) |

### Animations (3)

| Skill | Source | Role |
|-------|--------|------|
| `motion-dev` | 199-biotechnologies/motion-dev-animations-skill | Motion.dev 120fps, spring physics, scroll effects |
| `motion-framer` | freshtechbro/claudedesignskills | Framer Motion classique |
| `design-motion-principles` | kylezantos/design-motion-principles | Audit motion forme sur Emil Kowalski, Jakub Krehel, Jhey Tompkins |

### 3D / WebGPU (reserve Phase 2.6) (3)

| Skill | Source | Role |
|-------|--------|------|
| `r3f-best-practices` | emalorenzo/three-agent-skills | 70+ regles React Three Fiber |
| `three-best-practices` | emalorenzo/three-agent-skills | Three.js patterns production |
| `webgpu-threejs-tsl` | dgreenheck/webgpu-claude-skill | WebGPU shaders, compute, post-processing |

### WordPress / WooCommerce (2)

| Skill | Source | Role |
|-------|--------|------|
| `wordpress-plugin-core` | secondsky/claude-skills | Structure plugin WP pro |
| `woocommerce-backend-dev` | secondsky/claude-skills | Hooks, data integrity, DI, unit tests WC |

### Design system (1)

| Skill | Source | Role |
|-------|--------|------|
| `design-system-creation` | secondsky/claude-skills | Creation design system complet |
| `interaction-design` | secondsky/claude-skills | Micro-interactions |

## Autres skills actifs (deja presents, heritage freshtechbro/claudedesignskills et divers)

Ces 20+ skills 3D/animation restent disponibles mais ne sont PAS prioritaires Phase 2 :
- Animations : animejs, lottie-animations, rive-interactive, react-spring-physics, barba-js, locomotive-scroll, scroll-reveal-libraries, animated-component-libraries
- 3D : aframe-webxr, babylonjs-engine, playcanvas-engine, pixijs-2d, lightweight-3d-effects, threejs-webgl, react-three-fiber (doublon avec r3f-best-practices), gsap-scrolltrigger, blender-web-pipeline, spline-interactive, substance-3d-texturing, web3d-integration-patterns
- Meta : modern-web-design, skill-creator, impeccable, using-superpowers, webapp-testing

## Usage par phase

### Phase 2.0 (setup Vite + cleanup logo)
Prioritaires : `tailwind-v4-shadcn`, `react-best-practices`

### Phase 2.1 (homepage island)
Prioritaires : `taste-skill`, `frontend-design`, `motion-dev`, `motion-framer`, `design-motion-principles`, `web-design-guidelines`, `react-best-practices`

### Phase 2.6 (Hardware Configurator 3D)
Prioritaires : `r3f-best-practices`, `three-best-practices`, `webgpu-threejs-tsl`

### Tout moment
`taste-skill` pour garder la direction esthetique "premium pas slop".

## Reglages recommandes taste-skill pour Inaricom

Dans `.claude/skills/taste-skill/SKILL.md` (ou override via prompt) :
- **DESIGN_VARIANCE: 7** (asymetrique moderne, pas chaos, pas centre-centre)
- **MOTION_INTENSITY: 6** (animations soignees, pas cinematiques)
- **VISUAL_DENSITY: 4** (aere, respire, premium)

## Bibliotheque externe (dans `.claude/skills/external/`)

Non actifs par defaut, a copier individuellement vers `.claude/skills/<nom>/` si besoin :
- `anthropics-skills/` - 17 skills Anthropic (docx, pdf, pptx, xlsx, claude-api, mcp-builder, algorithmic-art, canvas-design...)
- `vercel-agent-skills/` - 5 skills restants (composition-patterns, react-view-transitions, react-native-skills, deploy-to-vercel, vercel-cli-with-tokens)
- `obra-superpowers/` - 13 skills methodologie (brainstorming, writing-plans, systematic-debugging, TDD...)
- `pbakaus-impeccable/` - 16 commandes /polish, /audit, /critique, /overdrive...
- `garrytan-gstack/` - 28 commandes virtual engineering team
- `ui-ux-pro-max/` - 7 skills + database design
- `shannon-pentest/` - pentest IA (NE PAS activer par defaut)

## Comment activer un skill supplementaire

```cmd
cd C:\Users\gimu8\Desktop\Inaricom\.claude\skills
xcopy /E /I /Q /Y external\<repo>\skills\<skill> <skill>\
```

Le skill devient disponible a la prochaine session Claude Code.

## Comment desactiver un skill

Supprimer le dossier `.claude/skills/<skill>/`. Les sources restent dans `external/` pour reactivation future.

---

Installation 2025-11-13 : 7 repos externes (anthropics, vercel, obra, impeccable, gstack, ui-ux-pro-max, shannon)
Installation 2026-04-21 : 6 skills supplementaires Phase 2 (taste-skill, tailwind-v4-shadcn, motion-dev, design-motion-principles, r3f+three-best-practices, webgpu-threejs-tsl, woocommerce-backend-dev, wordpress-plugin-core, design-system-creation, interaction-design) + activation web-design-guidelines.
