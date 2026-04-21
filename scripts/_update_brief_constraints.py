"""Ajouter contraintes dures en tete du brief Claude Code."""
import pathlib

p = pathlib.Path('docs/BRIEF_CLAUDE_CODE_PHASE_2.0.md')
c = p.read_text(encoding='utf-8')

# Inserer une section CONTRAINTES DURES juste apres le header et avant "Objectif de cette session"
old_header = """# Brief Claude Code — Demarrer Phase 2.0 (setup React islands)

> Document d'execution pour Claude Code.  
> Charge `@docs/phase2-react-islands.md` pour le contexte complet.  
> Charge `@CLAUDE.md` pour les regles projet.

Date : 2026-04-21  
Sous-agent responsable : `frontend-kadence`

---

## Objectif de cette session"""

new_header = """# Brief Claude Code — Demarrer Phase 2.0 (setup React islands)

> Document d'execution pour Claude Code.  
> Charge `@docs/phase2-react-islands.md` pour le contexte complet.  
> Charge `@CLAUDE.md` pour les regles projet.  
> Charge `@.claude/rules/logo-immutable.md` pour la regle logo.

Date : 2026-04-21  
Sous-agent responsable : `frontend-kadence`

---

## CONTRAINTES DURES — LIRE AVANT DE CODER

Cette session installe l'infra React. Meme si aucun code applicatif n'est ecrit ici, Claude Code DOIT internaliser ces regles car elles s'appliqueront des la Phase 2.1 :

### 🔒 Logo IMMUTABLE
- Le logo Inaricom actuel (`cropped-LogoLong4White-1.png`) est **verrouille par decision du proprietaire Kevin Meunier**
- **Ne PAS creer, regenerer, modifier, remplacer, ou proposer de nouveau logo**
- **Ne PAS creer de variantes thematiques** (pas de logo or/vert/bleu/argent)
- **Ne PAS inclure de logo dans les components React** — le logo est rendu cote WordPress (header Kadence)
- Voir regle complete : `.claude/rules/logo-immutable.md`

### 🔒 Pas de hex hardcodes
- Tous les couleurs via tokens `--inari-*` mappes en classes Tailwind
- Pas de `#FF3A40` ou `#FFD700` ecrit en dur dans les composants

### 🔒 Fonts self-hostees
- Geist + Instrument Serif deja self-hostes dans `kadence-child/assets/fonts/`
- **Ne PAS ajouter `<link>` vers Google Fonts CDN** (risque legal €250k)

### 🔒 Ne pas modifier l'existant
- `inaricom-security.php` (must-use Gilles) = intouchable
- `inaricom-core/` existant = etendre, pas reecrire
- Snippet 347 en DB = ne pas dupliquer (le lire via CSS custom properties)

---

## Objectif de cette session"""

assert old_header in c, 'OLD header not found'
c = c.replace(old_header, new_header)
print('[OK] Contraintes dures ajoutees en tete de brief')

p.write_text(c, encoding='utf-8')
print('[SUCCESS] BRIEF_CLAUDE_CODE_PHASE_2.0.md mis a jour')
