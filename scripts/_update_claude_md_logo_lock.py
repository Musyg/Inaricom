"""Ajouter guardrail logo-immutable a CLAUDE.md."""
import pathlib

p = pathlib.Path('CLAUDE.md')
c = p.read_text(encoding='utf-8')

# Ajouter dans la section GUARDRAILS ABSOLUS
old_guardrails = """- JAMAIS de filtre CSS pour recolorer le logo
- JAMAIS de refactor complet d'un code qui fonctionne"""

new_guardrails = """- JAMAIS de filtre CSS pour recolorer le logo
- JAMAIS creer, modifier, regenerer ou proposer un nouveau logo (voir `.claude/rules/logo-immutable.md`)
- JAMAIS de variantes thematiques du logo (pas de logo or/vert/bleu/argent — un seul logo partout)
- JAMAIS de refactor complet d'un code qui fonctionne"""

assert old_guardrails in c, 'OLD guardrails not found'
c = c.replace(old_guardrails, new_guardrails)
print('[OK] Guardrail logo ajoute')

# Ajouter la reference a la regle dans la section SYSTEME DE COULEURS
old_logo_rule = """- **Jamais de filtres CSS** pour recolorer le logo — fichiers SVG separes par theme (swap via `content: url()`)
- **Liseret blanc systematique** sur logo : `filter: drop-shadow(0 0 2px rgba(255,255,255,0.6))`"""

new_logo_rule = """- **Logo IMMUTABLE** : un seul logo rouge (`cropped-LogoLong4White-1.png`, attachment WP 600) partout sur le site. Pas de variantes thematiques. Pas de recreation. Voir `.claude/rules/logo-immutable.md` pour la regle complete.
- **Seul effet autorise sur logo** : liseret blanc via `filter: drop-shadow(0 0 2px rgba(255,255,255,0.6))` — rien d'autre."""

assert old_logo_rule in c, 'OLD logo rule not found'
c = c.replace(old_logo_rule, new_logo_rule)
print('[OK] Regle logo dans SYSTEME DE COULEURS mise a jour')

p.write_text(c, encoding='utf-8')
print()
print('[SUCCESS] CLAUDE.md : guardrail logo ajoute')
