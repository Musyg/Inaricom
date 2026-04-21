"""Ajouter une section WARNING en tete du SKILL.md de web-artifacts-builder
pour eviter que Claude Code l'active par erreur en Phase 2."""
import pathlib

p = pathlib.Path('.claude/skills/web-artifacts-builder/SKILL.md')
c = p.read_text(encoding='utf-8')

# Inserer un warning entre le frontmatter YAML et le titre "# Web Artifacts Builder"
old_header = """---
name: web-artifacts-builder
description: Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.
license: Complete terms in LICENSE.txt
---

# Web Artifacts Builder"""

new_header = """---
name: web-artifacts-builder
description: Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.
license: Complete terms in LICENSE.txt
---

> ⚠️ **INARICOM PROJECT-SPECIFIC WARNING** (added 2026-04-21)
>
> This skill is **NOT suitable** for the Inaricom `react-islands/` project (Phase 2+).
> It is designed for **claude.ai artifacts** (single HTML file bundled via Parcel).
> 
> The Inaricom project is a **production Vite application** that builds to
> `plugins/inaricom-core/assets/react/` and is loaded by WordPress at runtime.
> 
> **Do NOT** run `scripts/init-artifact.sh` or `scripts/bundle-artifact.sh`.
> **Do** use `npm create vite@latest react-islands --template react-ts` instead.
> 
> If the user asks for a Claude.ai artifact (standalone demo, shareable prototype),
> this skill is still valid. For all Inaricom production work, see
> `@docs/SKILLS_USAGE_PHASE_2.md` and `@docs/BRIEF_CLAUDE_CODE_PHASE_2.0.md`.

# Web Artifacts Builder"""

assert old_header in c, 'OLD header not found'
c = c.replace(old_header, new_header)
print('[OK] Warning Inaricom ajoute en tete du SKILL.md web-artifacts-builder')

p.write_text(c, encoding='utf-8')
print('[SUCCESS] Skill piegeux neutralise (warning inline)')
