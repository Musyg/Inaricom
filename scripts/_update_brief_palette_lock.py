"""Ajouter palette lock dans la section CONTRAINTES DURES du brief."""
import pathlib

p = pathlib.Path('docs/BRIEF_CLAUDE_CODE_PHASE_2.0.md')
c = p.read_text(encoding='utf-8')

old_constraints = """### 🔒 Pas de hex hardcodes
- Tous les couleurs via tokens `--inari-*` mappes en classes Tailwind
- Pas de `#FF3A40` ou `#FFD700` ecrit en dur dans les composants"""

new_constraints = """### 🔒 Palette 5 themes VERROUILLEE
- 5 couleurs d'accent arbitrees par Kevin : **neutre (argent), rouge (secu), or (IA), vert (blog), bleu (institutionnel)**
- **Ne PAS introduire** de nouvelle couleur (violet, orange, cyan custom, rose)
- **Ne PAS utiliser** les Tailwind defaults (`red-500`, `amber-400`, `emerald-500`) pour les accents de marque
- ✅ **Autorise** : gradients, halos, glows, opacites **a partir des 5 couleurs**
- ✅ **Autorise** : creation de nuances derivees (`rgba(var(--inari-red-rgb), 0.15)`)
- Voir regle complete : `.claude/rules/palette-locked.md`

### 🔒 Pas de hex hardcodes
- Tous les couleurs via tokens `--inari-*` mappes en classes Tailwind
- Pas de `#FF3A40` ou `#FFD700` ecrit en dur dans les composants"""

assert old_constraints in c, 'OLD constraints not found'
c = c.replace(old_constraints, new_constraints)
print('[OK] Palette lock ajoutee au brief')

# Ajouter aussi la ref a la regle dans l'en-tete
old_header = """> Charge `@docs/phase2-react-islands.md` pour le contexte complet.  
> Charge `@CLAUDE.md` pour les regles projet.  
> Charge `@.claude/rules/logo-immutable.md` pour la regle logo."""

new_header = """> Charge `@docs/phase2-react-islands.md` pour le contexte complet.  
> Charge `@CLAUDE.md` pour les regles projet.  
> Charge `@.claude/rules/logo-immutable.md` pour la regle logo.  
> Charge `@.claude/rules/palette-locked.md` pour la regle palette."""

assert old_header in c, 'OLD header not found'
c = c.replace(old_header, new_header)
print('[OK] Ref palette-locked.md ajoutee au header')

p.write_text(c, encoding='utf-8')
print('[SUCCESS] BRIEF : palette verrouillee renforcee')
