"""Enrichir phase2-react-islands.md avec palette locked."""
import pathlib

p = pathlib.Path('docs/phase2-react-islands.md')
c = p.read_text(encoding='utf-8')

old_section = """**2. COULEURS — 5 themes existants**
- Les tokens `--inari-*` sont la source de verite
- Les classes Tailwind doivent utiliser `var(--inari-*)` via `@theme`
- Pas de hex hardcodes dans les composants React
- 5 themes : neutre (homepage), rouge (secu), or (IA), vert (blog), bleu (institutionnel)"""

new_section = """**2. COULEURS — 5 themes VERROUILLES**
- Les tokens `--inari-*` sont la source de verite unique
- Les classes Tailwind doivent utiliser `var(--inari-*)` via `@theme`
- Pas de hex hardcodes dans les composants React
- 5 themes : neutre (homepage, argent/blanc), rouge (secu), or (IA), vert (blog), bleu (institutionnel)
- **Ne pas introduire de 6e couleur** (violet, orange, rose, cyan non-bleu — interdit)
- **Gradients et halos autorises** tant qu'ils composent ces 5 couleurs + noirs + textes
- Regle complete : `.claude/rules/palette-locked.md`"""

assert old_section in c, 'OLD colors section not found'
c = c.replace(old_section, new_section)
print('[OK] Section couleurs enrichie')

p.write_text(c, encoding='utf-8')
print('[SUCCESS] phase2-react-islands.md : palette lock ajoutee')
