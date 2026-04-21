"""Ajouter section SKILLS a utiliser/eviter dans le brief Phase 2.0."""
import pathlib

p = pathlib.Path('docs/BRIEF_CLAUDE_CODE_PHASE_2.0.md')
c = p.read_text(encoding='utf-8')

# Inserer une section SKILLS juste apres le bloc CONTRAINTES DURES,
# avant "Objectif de cette session"
old_marker = """### 🔒 Ne pas modifier l'existant
- `inaricom-security.php` (must-use Gilles) = intouchable
- `inaricom-core/` existant = etendre, pas reecrire
- Snippet 347 en DB = ne pas dupliquer (le lire via CSS custom properties)

---

## Objectif de cette session"""

new_marker = """### 🔒 Ne pas modifier l'existant
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

assert old_marker in c, 'OLD marker not found'
c = c.replace(old_marker, new_marker)
print('[OK] Section SKILLS ajoutee au brief')

p.write_text(c, encoding='utf-8')
print('[SUCCESS] BRIEF_CLAUDE_CODE_PHASE_2.0.md : skills explicites')
