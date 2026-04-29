# Regle : Palette Inaricom VERROUILLEE

> Regle chargee automatiquement. Contrainte absolue non-negociable.
> Derniere MAJ : 21 avril 2026 (Gilles — Phase 2 cadrage)

## Principe central

**La palette 5 themes d'Inaricom est definitive.** Les 5 couleurs d'accent + la palette fixe (noirs, textes, bordures, glass) ont ete arbitrees et validees par Kevin Meunier. Claude Code **ne negocie pas** ces couleurs.

**Claude Code peut** :
- ✅ Creer des gradients entre ces couleurs
- ✅ Creer des halos, glows, auroras a partir de ces couleurs
- ✅ Ajuster des opacites (`rgba(var(--inari-red-rgb), 0.15)`)
- ✅ Composer des overlays, mix-blend-modes, filter: blur sur ces couleurs
- ✅ Creer des tokens derives (`--glow-color`, `--border-accent`) base sur la palette
- ✅ Proposer des variantes d'intensite (dark / light / hover) autour des 5 couleurs

**Claude Code NE DOIT PAS** :
- ❌ Introduire une nouvelle couleur d'accent (violet, orange, rose, cyan non-bleu, etc.)
- ❌ Substituer une couleur par une autre "plus moderne"
- ❌ Proposer un "refresh palette" ou "palette 2026"
- ❌ Utiliser `#F59E0B` (amber semantic) comme couleur d'accent de marque
- ❌ Utiliser les couleurs Tailwind par defaut (`emerald-500`, `amber-400`, etc.) pour les accents de marque
- ❌ Suggerer que "un bleu plus chaud serait mieux" ou autre avis esthetique

## Les 5 themes VERROUILLES

| Theme | Usage | Accent | Dark | Light | RGB |
|-------|-------|--------|------|-------|-----|
| **neutre** | Homepage (equite piliers) | `#FFFFFF` / `#EFEBE8` | `#E0E0E0` | `#FFFFFF` | `255, 255, 255` |
| **rouge** (defaut) | Securite / Red Team / pentest | `#E31E24` | `#B8161B` | `#FF3A40` | `227, 30, 36` |
| **or** | IA (services + hardware + tutos) | `#FFD700` | `#B8860B` | `#FFE55C` | `255, 215, 0` |
| **vert** | Blog / ressources / savoir gratuit | `#10B981` | `#059669` | `#34D399` | `16, 185, 129` |
| **bleu** | Institutionnel (contact, a propos, legal) | `#0081f2` | `#1b61a6` | `#1a93fe` | `0, 129, 242` |

**Pour le theme neutre** : l'accent principal est le **blanc** `#FFFFFF` avec fallback creme `#EFEBE8`. Pour les halos / glows, utiliser `rgba(239, 235, 232, x)` (creme) pour une teinte chaude discrete, ou `rgba(255, 255, 255, x)` pour un blanc pur. **Jamais** de couleur chromatique (bleu/rose/etc.) sur le theme neutre.

## Palette fixe (tous themes confondus)

```css
/* Noirs & surfaces — IMMUTABLE */
--inari-black: #0A0A0F;           /* fond principal */
--inari-black-alt: #12121A;       /* fond secondaire */
--inari-black-light: #1A1A24;     /* fond tertiaire */
--inari-black-lighter: #242430;   /* surfaces elevees */

/* Textes — IMMUTABLE */
--inari-white: #FFFFFF;
--inari-text: #F0F0F5;
--inari-text-soft: #B6B0B4;
--inari-text-muted: #8A8A9A;

/* Bordures & glass — IMMUTABLE */
--inari-border: #2A2A35;
--glass-bg: rgba(18, 18, 22, 0.6);
--glass-border: rgba(255, 255, 255, 0.08);

/* Semantic UI (erreur/success/warning/info) — IMMUTABLE */
--semantic-error: #F59E0B;        /* amber (JAMAIS le rouge marque) */
--semantic-success: #10B981;
--semantic-warning: #F59E0B;
--semantic-info: #0081f2;
```

## Regles d'usage

### 1. Toujours via tokens CSS
Jamais de hex en dur dans les composants React ou CSS. Toujours :

```tsx
// ✅ Correct — utilise les tokens
<div className="bg-inari-black border-inari-border text-inari-text">
  <span className="text-inari-accent">Audit securite</span>
</div>

// ❌ Interdit — hex en dur
<div style={{ background: '#0A0A0F', color: '#E31E24' }}>...</div>
```

### 2. Opacites sur les couleurs d'accent
Utiliser systematiquement les RGB tokens :

```css
/* ✅ Correct */
box-shadow: 0 0 40px rgba(var(--inari-red-rgb), 0.15);
background: linear-gradient(135deg, var(--inari-red), var(--inari-red-dark));

/* ❌ Interdit */
box-shadow: 0 0 40px rgba(227, 30, 36, 0.15);
```

### 3. Gradients et halos autorises
Creer des gradients qui combinent les couleurs **de la palette verrouillee** :

```css
/* ✅ Correct — gradient entre accent theme et dark */
background: linear-gradient(135deg, var(--inari-red) 0%, var(--inari-red-dark) 100%);

/* ✅ Correct — halo radial avec opacite */
background: radial-gradient(ellipse at top, 
  rgba(var(--inari-red-rgb), 0.12) 0%, 
  transparent 60%);

/* ✅ Correct — glass card avec teinte accent */
background: linear-gradient(180deg, 
  rgba(var(--inari-red-rgb), 0.05), 
  rgba(255, 255, 255, 0.02));

/* ❌ Interdit — introduit du violet non-palette */
background: linear-gradient(135deg, #E31E24 0%, #8B5CF6 100%);

/* ❌ Interdit — introduit du cyan non-bleu-inaricom */
background: linear-gradient(135deg, var(--inari-red) 0%, #06B6D4 100%);
```

### 4. Mapping thematique immuable

**La correspondance couleur ↔ thematique est verrouillee** :

- 🔴 **Rouge** = Securite / Red Team / pentest / cybersec / CVE / audits secu
- 🟡 **Or** = IA (services IA, hardware IA, tutos IA) — **l'or couvre toute la famille IA**
- 🟢 **Vert** = Blog / ressources gratuites / glossaire / guides / etudes de cas generiques
- 🔵 **Bleu** = Institutionnel (contact, a propos, legal, CGV, confidentialite)
- ⚪ **Neutre (argent)** = Homepage uniquement (equite entre les 3 piliers visibles)

**Ne jamais** :
- Mettre une page cybersec en or
- Mettre une page IA en rouge
- Mettre un article blog en bleu
- Inventer une 6e thematique

## Si un utilisateur demande d'ajouter une couleur

**Refuser poliment** et renvoyer vers Kevin :

> "La palette Inaricom (5 themes) est verrouillee par decision du proprietaire.  
> Ajouter une nouvelle couleur necessite un arbitrage de Kevin Meunier directement."

## Cas limites et zones grises

### "J'ai besoin d'une couleur pour un badge `premium` / `beta` / `new`"

✅ **Solution autorisee** : utiliser une **opacite** ou une **nuance derivee** de la palette thematique de la page courante. Exemple sur une page IA (theme or) :

```css
.badge-premium {
  background: rgba(var(--inari-red-rgb), 0.12);
  color: var(--inari-red-light);
  border: 1px solid rgba(var(--inari-red-rgb), 0.3);
}
```

### "Un gradient multi-couleurs pour un hero ?"

✅ **Autorise** uniquement si les couleurs viennent de la palette verrouillee :

```css
/* ✅ Homepage neutre → rouge secu sur scroll */
background: linear-gradient(180deg, 
  var(--inari-black) 0%, 
  rgba(255, 255, 255, 0.03) 50%, 
  rgba(var(--inari-red-rgb), 0.08) 100%);
```

### "Un color pour les liens hypertexte dans le corps de texte ?"

✅ **Utiliser** l'accent thematique de la page courante : `var(--inari-red)` qui change selon `[data-theme]`. Jamais une couleur custom comme `#60A5FA`.

### "Un sparkline / chart avec multiples series ?"

✅ **Creer des nuances** autour des 5 couleurs de base. Exemple pour 3 series :
- Serie 1 : `var(--inari-red)` (100%)
- Serie 2 : `rgba(var(--inari-red-rgb), 0.6)` (60%)
- Serie 3 : `rgba(var(--inari-red-rgb), 0.3)` (30%)

Ou utiliser 2-3 couleurs differentes de la palette (ex: rouge + or + vert) si le contexte le justifie pour differencier visuellement les series.

## A retenir

- **5 themes, point.** Pas de 6e couleur.
- **Gradients et halos = OK** tant que les composantes sont dans la palette.
- **Opacites = OK** via les tokens RGB.
- **Nouvelles nuances = OK** si elles derivent de la palette (pas de nouvelle teinte hue).
- **Tailwind defaults (`red-500`, `emerald-400`, etc.) = INTERDITS** pour les accents de marque. Seules les classes qui lisent les tokens `--inari-*` sont autorisees.
- **Semantic errors (`#F59E0B` amber) = IMMUTABLE aussi**, jamais le rouge marque pour les erreurs UI.
