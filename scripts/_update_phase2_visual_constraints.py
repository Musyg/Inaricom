"""Ajouter section contraintes visuelles / logo immutable dans phase2-react-islands.md."""
import pathlib

p = pathlib.Path('docs/phase2-react-islands.md')
c = p.read_text(encoding='utf-8')

# Inserer une section "Contraintes visuelles" juste apres la section "1. Decision strategique"
old_section = """### Principe architectural

Chaque "island" = **bundle JS React autonome** qui monte dans un `<div id="...">` vide genere par WordPress.

```
Page WP servie par PHP/Kadence
├── Header (WP)
├── Main content
│   └── <div id="inari-homepage-root"></div>  ← React monte ici
└── Footer (WP)
```

Le HTML envoye par WP inclut le meta + title + Schema.org + skeleton loader. React prend le relais une fois hydrate.

---

## 2. Stack technique verrouillee"""

new_section = """### Principe architectural

Chaque "island" = **bundle JS React autonome** qui monte dans un `<div id="...">` vide genere par WordPress.

```
Page WP servie par PHP/Kadence
├── Header (WP) ← logo Inaricom ici, INCHANGE
├── Main content
│   └── <div id="inari-homepage-root"></div>  ← React monte ici
└── Footer (WP)
```

Le HTML envoye par WP inclut le meta + title + Schema.org + skeleton loader. React prend le relais une fois hydrate.

### CONTRAINTES VISUELLES VERROUILLEES (lire AVANT de coder)

Avant toute creation de composant React, Claude Code DOIT integrer ces regles :

**1. LOGO IMMUTABLE — non-negociable**
- Le logo actuel (`cropped-LogoLong4White-1.png`, attachment WP 600) est **definitif**
- **AUCUNE** creation de nouveau logo, variante, filtre de recoloration, regeneration
- Le logo est rendu cote WordPress via `.custom-logo`, les islands React **n'affichent pas de logo**
- Regle complete : `.claude/rules/logo-immutable.md`
- Guardrail : `CLAUDE.md` section "GUARDRAILS ABSOLUS"

**2. COULEURS — 5 themes existants**
- Les tokens `--inari-*` sont la source de verite
- Les classes Tailwind doivent utiliser `var(--inari-*)` via `@theme`
- Pas de hex hardcodes dans les composants React
- 5 themes : neutre (homepage), rouge (secu), or (IA), vert (blog), bleu (institutionnel)

**3. TYPOGRAPHIE — Geist + Instrument Serif**
- Body/UI : Geist Sans (self-hoste)
- Hero display : Instrument Serif (self-hoste)
- Code/mono : Geist Mono
- JAMAIS Google Fonts CDN (risque €250k Munich)

**4. ANIMATIONS — respect prefers-reduced-motion**
- Tous les composants avec animation doivent respecter `prefers-reduced-motion`
- Framer Motion a un helper `useReducedMotion()` — l'utiliser systematiquement
- Fallback statique pour users reduced-motion

**5. ACCESSIBILITE — WCAG 2.2 AA minimum**
- Focus visible sur tous interactifs
- aria-labels sur buttons iconiques
- Contrastes AAA souhaites (`#EFEBE8` sur `#0A0A0F` = 17:1)
- shadcn/ui = accessible par defaut, le garder tel quel

---

## 2. Stack technique verrouillee"""

assert old_section in c, 'OLD section principe architectural not found'
c = c.replace(old_section, new_section)
print('[OK] Contraintes visuelles ajoutees a phase2-react-islands.md')

p.write_text(c, encoding='utf-8')
print('[SUCCESS] phase2-react-islands.md mis a jour')
