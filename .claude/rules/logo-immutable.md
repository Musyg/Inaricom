# Regle : Logo Inaricom IMMUTABLE

> Regle chargee automatiquement. Contrainte absolue non-negociable.
> Derniere MAJ : 21 avril 2026 (Gilles — Phase 2 cadrage)

## Principe central

**Le logo actuel d'Inaricom est definitif. Claude Code NE DOIT PAS :**

- ❌ Creer un nouveau logo
- ❌ Regenerer le logo via Pillow, Canva, IA, SVG ou tout outil
- ❌ Modifier le logo existant (couleur, forme, stroke, proportions)
- ❌ Proposer un "logo alternatif" ou "logo v2"
- ❌ Faire des variantes thematiques (or, vert, bleu, argent, etc.)
- ❌ Appliquer des filtres CSS pour "recolorer" le logo
- ❌ Suggerer un redesign de logo, meme en pretexte "moderniser"

**Le logo EST ce qu'il est. On l'utilise tel quel partout.**

## Fichier logo de reference unique

Le seul et unique logo a utiliser sur tout le site :

- **Chemin WordPress** : `/wp-content/uploads/2024/01/cropped-LogoLong4White-1.png`
- **Attachment ID WP** : 600
- **Dimensions natives** : 348×126 px
- **Format** : PNG avec transparence
- **Copie locale de reference** : `assets/logo-rouge-original.png`

Ce fichier est **la source de verite unique**. Claude Code ne doit pas le dupliquer, le renommer, le resampler, ou en creer des "versions".

## Usage autorise

### En CSS
Le logo s'utilise via la classe WordPress native `.custom-logo` (rendu par `the_custom_logo()` de Kadence/WP).

```css
/* Halo blanc subtil — SEUL effet autorise sur le logo */
.custom-logo {
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.6));
}
```

**Rien d'autre sur le logo. Pas de hue-rotate, pas de grayscale, pas de invert, pas de content: url() de substitution.**

### En React islands
Le logo est rendu cote WordPress (header Kadence). Les islands React **ne doivent pas** contenir de logo. Si un island a besoin de reference visuelle de la marque, il utilise le nom textuel "Inaricom" avec la typo Instrument Serif, pas une image.

## Anciens logos a IGNORER / SUPPRIMER

Les 5 fichiers suivants uploades dans `/wp-content/uploads/2026/01/` sont des **reliquats** de l'ancienne strategie "logo variant par theme" **abandonnee** :

- ❌ `Design-sans-titre-13.png` (bleu) — a supprimer, ne plus referencer
- ❌ `Design-sans-titre-15.png` (vert) — a supprimer, ne plus referencer
- ❌ `Design-sans-titre-16.png` (or) — a supprimer, ne plus referencer
- ❌ `Design-sans-titre-17.png` (argent) — a supprimer, ne plus referencer

Le snippet 63 (theme-neutre) qui swappait le logo vers l'argent **doit etre nettoye** : retirer les regles `[data-theme="neutre"] .site-logo img { content: url(...) }` et `.theme-neutre img.custom-logo { opacity: 0 }`.

Les regles similaires dans les autres themes (`[data-theme="or"]`, `[data-theme="bleu"]`, `[data-theme="vert"]`) sont aussi **a supprimer** — le logo unique rouge s'affiche partout, point.

## Pourquoi cette regle

1. **Identite de marque** : le logo actuel est l'identite Inaricom, pas un placeholder
2. **Coherence** : un logo unique = reconnaissance, pas de confusion
3. **Simplicite** : moins de fichiers a gerer, moins de swap logic
4. **Priorite Kevin** : arbitrage proprietaire valide 21 avril 2026

## Si un utilisateur demande de modifier le logo

**Refuser poliment** et renvoyer vers Kevin Meunier (proprietaire Inaricom) :

> "Le logo actuel est verrouille par decision du proprietaire (Kevin Meunier). Toute modification du logo doit passer par lui directement, pas par Claude Code."

## Cas autorises (par exception)

Seulement sur demande explicite de **Kevin Meunier** :

- Creation d'un favicon derive (format `.ico`, mais toujours base sur le logo actuel)
- Creation d'une version Open Graph (export PNG 1200×630 avec padding)
- Creation d'une version email signature (resampling PNG basse-res, pas modification)

Meme dans ces cas, **le logo lui-meme n'est jamais modifie visuellement**.

## A retenir

- **Le logo est sacro-saint.** On ne le touche pas.
- **Un fichier, partout.** Pas de variantes thematiques.
- **Si tentation de "creer un logo"**, STOP et relire cette regle.
