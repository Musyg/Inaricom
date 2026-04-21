# Activation des skills - Inaricom

> Derniere MAJ : 21 avril 2026 (ajout 13 skills premium pour construire Inaricom)

## Skills actifs pour Inaricom (20 au total)

Ces skills sont directement sous `.claude/skills/<nom>/SKILL.md` et sont automatiquement detectes et charges par Claude Code quand le contexte matche leur trigger.

### Tier 1 — Les premium installes le 21/04/2026 (13 skills)

Ultra-specifiques au projet Inaricom (WordPress + React + animations + design premium).

| Skill | Source | Usage principal |
|-------|--------|-----------------|
| `taste-skill` | [Leonxlnx](https://github.com/Leonxlnx/taste-skill) | Direction esthetique avec 3 molettes (VARIANCE, MOTION, DENSITY). Anti-slop. |
| `motion-dev` | [199-biotechnologies](https://github.com/199-biotechnologies/motion-dev-animations-skill) | Motion.dev 120fps GPU, spring physics, scroll effects. |
| `design-motion-principles` | [kylezantos](https://github.com/kylezantos/design-motion-principles) | Audit motion forme sur Kowalski/Krehel/Tompkins. |
| `r3f-best-practices` | [emalorenzo](https://github.com/emalorenzo/three-agent-skills) | 70+ regles React Three Fiber pour Phase 2.6 configurator. |
| `three-best-practices` | emalorenzo (bonus) | Three.js patterns (gestion memoire, shaders). |
| `webgpu-threejs-tsl` | [dgreenheck](https://github.com/dgreenheck/webgpu-claude-skill) | WebGPU shaders, backgrounds premium, particle systems. |
| `tailwind-v4-shadcn` | [secondsky](https://github.com/secondsky/claude-skills) | Setup Tailwind v4 + shadcn/ui sans erreur (production-tested). |
| `woocommerce-backend-dev` | secondsky | Hooks WooCommerce, data integrity, DI, unit tests. |
| `wordpress-plugin-core` | secondsky | Structure plugin WordPress pro. |
| `design-system-creation` | secondsky | Creation design system. |
| `interaction-design` | secondsky | Micro-interactions. |
| `web-design-guidelines` | vercel-labs (deja dans external/, active ici) | 100+ regles UX/a11y (Apple HIG + Material 3 + WCAG 2.2). |
| `react-best-practices` | vercel-labs (deja dans external/, active ici) | 62 regles perf React/Next.js. |

### Tier 2 — Skills deja actifs avant (installes le 17/04/2026)

| Skill | Source | Usage principal |
|-------|--------|----------------|
| `frontend-design` | anthropics-skills | Anti-AI slop officiel Anthropic. Complement taste-skill. |
| `impeccable` | pbakaus-impeccable | 18 slash commands (/polish /audit /critique /overdrive). |
| `using-superpowers` | obra-superpowers | Meta-skill methodo (TDD, brainstorming, subagents). |
| `webapp-testing` | anthropics-skills | Playwright E2E + visual regression (Phase 2.4 QA). |
| `modern-web-design` | (claudedesignskills) | Patterns 2025-2026. |

Plus les 22 skills claudedesignskills (threejs-webgl, gsap-scrolltrigger, motion-framer, etc.) deja installes.

---

## Skills disponibles mais non-actifs

### Dans `.claude/skills/external/`
Repos clones entiers (anthropics, vercel, obra-superpowers, pbakaus-impeccable, garrytan-gstack, ui-ux-pro-max, shannon-pentest). A activer individuellement si besoin en copiant leur dossier vers `.claude/skills/<nom>/`.

### Dans `.claude/skills/` mais avec .zip equivalent
Les 22 skills claudedesignskills ont tous un .zip equivalent (dupliques par l'installeur original). On peut les supprimer pour gagner de l'espace mais ce n'est pas critique.

---

## Installation manuelle d'un skill supplementaire

```bash
# Cloner le repo source
cd .claude\skills
git clone --depth 1 <url> _tmp_nom
# Inspecter la structure
dir /B _tmp_nom
# Copier uniquement le dossier skill pertinent
xcopy /E /I /Q /Y _tmp_nom\<path>\<skill> <nom>\
# Verifier SKILL.md present
dir /B <nom>\SKILL.md
# Cleanup
rmdir /S /Q _tmp_nom
# Supprimer .git si le repo est present
rmdir /S /Q <nom>\.git 2>nul
```

---

## Desactivation d'un skill

```bash
# Soit supprimer le dossier actif
rmdir /S /Q .claude\skills\<nom>
# Soit renommer en _<nom> pour le garder mais le desactiver
```

---

## Pour Claude Code

Pour connaitre les skills disponibles dans cette session :
- Scan automatique de `.claude/skills/*/SKILL.md` au demarrage
- Invocation via matching trigger (naturelle) ou explicite (`use taste-skill`)
- Guide d'usage par phase : voir CLAUDE.md section SKILLS
