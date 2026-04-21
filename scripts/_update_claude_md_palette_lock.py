"""Ajouter guardrails palette verrouillee + refs a la regle."""
import pathlib

p = pathlib.Path('CLAUDE.md')
c = p.read_text(encoding='utf-8')

# --- 1. Ajouter guardrails palette dans GUARDRAILS ABSOLUS ---
old_guardrails = """- JAMAIS creer, modifier, regenerer ou proposer un nouveau logo (voir `.claude/rules/logo-immutable.md`)
- JAMAIS de variantes thematiques du logo (pas de logo or/vert/bleu/argent — un seul logo partout)"""

new_guardrails = """- JAMAIS creer, modifier, regenerer ou proposer un nouveau logo (voir `.claude/rules/logo-immutable.md`)
- JAMAIS de variantes thematiques du logo (pas de logo or/vert/bleu/argent — un seul logo partout)
- JAMAIS introduire une couleur hors palette (pas de violet/orange/rose — 5 themes verrouilles, voir `.claude/rules/palette-locked.md`)
- JAMAIS utiliser les classes Tailwind defaut (`red-500`, `emerald-400`, etc.) pour des accents de marque (utiliser les tokens `--inari-*`)
- JAMAIS substituer ou "moderniser" une couleur de la palette existante"""

assert old_guardrails in c, 'OLD guardrails not found'
c = c.replace(old_guardrails, new_guardrails)
print('[OK] Guardrails palette ajoutes')

# --- 2. Ajouter note palette verrouillee dans SYSTEME DE COULEURS ---
old_color_title = """## SYSTEME DE COULEURS — 5 THEMES

### Mapping semantique (LOGIQUE = THEMATIQUE, pas type de page)"""

new_color_title = """## SYSTEME DE COULEURS — 5 THEMES

> 🔒 **Palette VERROUILLEE** par decision Kevin Meunier. Regle complete : `.claude/rules/palette-locked.md`
> Claude Code peut creer gradients, halos, opacites a partir de ces couleurs. Mais ne peut PAS introduire de nouvelle teinte.

### Mapping semantique (LOGIQUE = THEMATIQUE, pas type de page)"""

assert old_color_title in c, 'OLD color title not found'
c = c.replace(old_color_title, new_color_title)
print('[OK] Titre SYSTEME DE COULEURS enrichi')

p.write_text(c, encoding='utf-8')
print()
print('[SUCCESS] CLAUDE.md : verrouillage palette')
