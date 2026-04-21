"""Ajouter un guardrail skill-usage dans CLAUDE.md."""
import pathlib

p = pathlib.Path('CLAUDE.md')
c = p.read_text(encoding='utf-8')

# Ajouter une ligne dans les guardrails absolus
old_guardrails = """- JAMAIS d'auto-update WP Core sans review (filter `WP_AUTO_UPDATE_CORE => 'minor'`)

---

## SOUS-AGENTS CLAUDE CODE"""

new_guardrails = """- JAMAIS d'auto-update WP Core sans review (filter `WP_AUTO_UPDATE_CORE => 'minor'`)
- JAMAIS utiliser `web-artifacts-builder` skill pour le projet `react-islands/` (il est pour Claude.ai artifacts, pas Vite prod — voir `@docs/SKILLS_USAGE_PHASE_2.md`)
- JAMAIS charger silencieusement un skill sans le mentionner — annoncer son usage pour validation Gilles

---

## SKILLS — REGLES D'USAGE

Le repo contient 60+ skills installes (`.claude/skills/` et `.claude/skills/external/`). Tous ne doivent pas etre actives simultanement.

**Guide complet** : `@docs/SKILLS_USAGE_PHASE_2.md`

**Regles d'or** :
1. Activer **uniquement** les skills pertinents pour la tache en cours (max 4-5 simultanement)
2. **Invocation explicite** : Claude Code annonce chaque skill qu'il charge et pourquoi
3. **Piege connu** : `web-artifacts-builder` a un trigger qui matche "React + Tailwind + shadcn/ui" mais est **inadapte** au projet `react-islands/` (c'est pour les artifacts Claude.ai). Si ce skill se propose de se charger, **ignorer** et continuer avec Vite standard.
4. Par phase :
   - **Phase 2.0** (setup) : `react-best-practices` seul
   - **Phase 2.1** (homepage) : `frontend-design` + `web-design-guidelines` + `modern-web-design` + `react-best-practices`
   - **Phase 2.4** (QA) : `webapp-testing` + `impeccable` (/audit /critique)
   - **Phase 2.6** (3D configurator) : `react-three-fiber` + `threejs-webgl`

---

## SOUS-AGENTS CLAUDE CODE"""

assert old_guardrails in c, 'OLD guardrails section not found'
c = c.replace(old_guardrails, new_guardrails)
print('[OK] Guardrail skill-usage + section SKILLS ajoutes a CLAUDE.md')

p.write_text(c, encoding='utf-8')
print('[SUCCESS] CLAUDE.md : regles skills explicites')
