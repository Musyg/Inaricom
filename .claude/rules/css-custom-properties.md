# Regle : CSS Custom Properties partout

> Regle chargee automatiquement. S'applique a TOUT travail CSS sur Inaricom.

## Principes

### 1. Source de verite unique
Les design tokens vivent dans `kadence-child/style.css`, section `:root`. C'est le SEUL endroit ou les hex sont ecrits en dur.

### 2. JAMAIS de hex hardcode
❌ **Mauvais** :
```css
.card { background: #0A0A0F; border: 1px solid #E31E24; }
```

✅ **Bon** :
```css
.card {
  background: var(--inari-black);
  border: 1px solid var(--inari-red);
}
```

### 3. Opacites via rgba + variables RGB
❌ **Mauvais** :
```css
.glow { box-shadow: 0 0 20px rgba(227, 30, 36, 0.5); }
```

✅ **Bon** :
```css
.glow { box-shadow: 0 0 20px rgba(var(--inari-red-rgb), 0.5); }
```

### 4. Themes surchargent les variables
Le code utilise **toujours** `var(--inari-red)`. Les themes changent la valeur de la variable :
```css
[data-theme="or"] { --inari-red: #FFD700; }
[data-theme="vert"] { --inari-red: #10B981; }
[data-theme="bleu"] { --inari-red: #00D4FF; }
```

### 5. Semantic separe du brand
- `--inari-red` : couleur de marque (CTAs, accents, highlights)
- `--semantic-error` : feedback UI (champ en erreur, alerte)
- JAMAIS les confondre (`#F59E0B` amber pour semantic-error)

### 6. Audit regulier
Commande : `grep -r "#E31E24\|#FFD700\|#10B981\|#00D4FF" --include="*.css" --include="*.php" --include="*.js"`
Doit retourner **uniquement** `style.css` section `:root`.

### 7. Avant d'ajouter une variable, chercher l'existante
```bash
grep -r "var(--inari-" kadence-child/style.css
```

### 8. Nommage
- Palette fixe : `--inari-*`
- Accent thematique : `--inari-red`, `--inari-red-dark`, `--inari-red-light`, `--inari-red-rgb`
- Semantic : `--semantic-error`, `--semantic-success`, `--semantic-warning`, `--semantic-info`
- Rayons : `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`
- Ombres : `--shadow-soft`, `--shadow-subtle`
- Glass : `--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-blur-heavy`

### 9. Pour modifier une valeur de couleur
Ne PAS creer une nouvelle variable. **Modifier** la valeur existante dans `:root` et voir comment ca impacte tout le site (c'est l'avantage du design system).

### 10. Logo
Utiliser `content: url()` pour swap par theme, JAMAIS de `filter: hue-rotate` ou `filter: invert`. Les 4 fichiers SVG sont dans `https://inaricom.com/web/wp-content/uploads/2026/01/Design-sans-titre-XX.png`.

---

Cette regle est **structurante**. Toute violation cree du debt technique immediat.
