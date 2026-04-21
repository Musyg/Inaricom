"""Retirer les mentions web-artifacts-builder et section SKILLS provisoire
des docs. On reecrira proprement apres la recherche de skills specifiques."""
import pathlib

# --- 1. CLAUDE.md : retirer les guardrails web-artifacts et section SKILLS ---
p = pathlib.Path('CLAUDE.md')
c = p.read_text(encoding='utf-8')

old_block = """- JAMAIS d'auto-update WP Core sans review (filter `WP_AUTO_UPDATE_CORE => 'minor'`)
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

new_block = """- JAMAIS d'auto-update WP Core sans review (filter `WP_AUTO_UPDATE_CORE => 'minor'`)

---

## SOUS-AGENTS CLAUDE CODE"""

assert old_block in c, 'OLD block CLAUDE.md not found'
c = c.replace(old_block, new_block)
p.write_text(c, encoding='utf-8')
print('[OK] CLAUDE.md : section SKILLS provisoire retiree')

# --- 2. BRIEF_CLAUDE_CODE_PHASE_2.0.md : retirer section SKILLS ---
p = pathlib.Path('docs/BRIEF_CLAUDE_CODE_PHASE_2.0.md')
c = p.read_text(encoding='utf-8')

old_section = """### 🔒 Ne pas modifier l'existant
- `inaricom-security.php` (must-use Gilles) = intouchable
- `inaricom-core/` existant = etendre, pas reecrire
- Snippet 347 en DB = ne pas dupliquer (le lire via CSS custom properties)

---

## SKILLS — utilisation obligatoire et interdite

Le repo a 60+ skills disponibles. Pour Phase 2.0 (setup Vite + cleanup logo), **seuls les skills suivants sont pertinents**. Guide complet : `@docs/SKILLS_USAGE_PHASE_2.md`.

### ✅ Skills a CHARGER et APPLIQUER pour Phase 2.0

- **`react-best-practices`** : 62 regles perf React/Next.js. Applique-les pour la config Vite, `tsconfig.json`, structure des dossiers React. Meme sans composants applicatifs cette session, les fondations doivent respecter ces regles.
- **`surgical-fixes`** (regle `.claude/rules/`) : pour Etape 0 (cleanup snippet 63). Retirer uniquement les blocs de swap logo, ne PAS reecrire la section.
- **`css-custom-properties`** (regle `.claude/rules/`) : pour les tokens dans `src/styles/globals.css` et la config Tailwind.

### ❌ Skills a NE PAS UTILISER en Phase 2.0

- **`web-artifacts-builder`** : **CE SKILL EST PIEGEUX**. Son trigger matche "React + TypeScript + Tailwind + shadcn/ui" mais il est concu pour les artifacts Claude.ai (bundle single-file via Parcel). **NOUS faisons un projet Vite de production** qui build vers `plugins/inaricom-core/assets/react/`. Si ce skill se charge, il proposera `scripts/init-artifact.sh` → **STOP**, ignore-le. Utilise directement `npm create vite@latest react-islands --template react-ts`.
- **`frontend-design`** : reserve Phase 2.1 (construction visuelle). Pas d'utilite en 2.0.
- **`web-design-guidelines`** : reserve Phase 2.1.
- **`modern-web-design`** : reserve Phase 2.1.
- **`webapp-testing`** : reserve Phase 2.4 (QA).
- **`impeccable`** (/polish /audit /critique) : reserve Phase 2.1 pour raffiner les composants.
- **Tous les skills 3D** (`react-three-fiber`, `threejs-webgl`, `babylonjs-engine`, `playcanvas-engine`, `aframe-webxr`, etc.) : reserves Phase 2.6 (Hardware Configurator). **Aucune utilite maintenant.**
- **Tous les skills animations** (`animejs`, `motion-framer`, `gsap-scrolltrigger`, `barba-js`, `locomotive-scroll`, `rive-interactive`, `lottie-animations`, `react-spring-physics`, `scroll-reveal-libraries`, `animated-component-libraries`) : reserves Phase 2.1+. Setup Vite n'en a pas besoin.

### Regle d'invocation

Quand un skill se charge automatiquement alors qu'il ne devrait pas (surtout `web-artifacts-builder`), **annonce-le a Gilles** avant de l'appliquer :

> "Le skill X se propose de se charger. Je vois qu'il n'est pas dans la liste autorisee pour Phase 2.0. Je l'ignore, je continue avec l'approche manuelle. Confirme-tu ?"

Si Gilles confirme d'ignorer, tu continues. Si Gilles demande de l'appliquer, tu appliques.

---

## Objectif de cette session"""

new_section = """### 🔒 Ne pas modifier l'existant
- `inaricom-security.php` (must-use Gilles) = intouchable
- `inaricom-core/` existant = etendre, pas reecrire
- Snippet 347 en DB = ne pas dupliquer (le lire via CSS custom properties)

---

## Objectif de cette session"""

assert old_section in c, 'OLD brief skills section not found'
c = c.replace(old_section, new_section)
p.write_text(c, encoding='utf-8')
print('[OK] BRIEF : section SKILLS provisoire retiree')

# --- 3. Supprimer SKILLS_USAGE_PHASE_2.md (provisoire, sera remplace) ---
old_path = pathlib.Path('docs/SKILLS_USAGE_PHASE_2.md')
if old_path.exists():
    old_path.unlink()
    print('[OK] docs/SKILLS_USAGE_PHASE_2.md supprime (provisoire)')

print()
print('[SUCCESS] Nettoyage des provisoires termine')
