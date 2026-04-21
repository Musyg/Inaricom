# Règle : Logo Inaricom IMMUTABLE

> Règle chargée automatiquement. Contrainte absolue non-négociable.
> Dernière MAJ : 21 avril 2026 (correction d'une règle fausse précédente)

## Principe central

Le logo Inaricom existe en **5 variantes thématiques** (rouge, or, vert, bleu, argent/neutre).
Ces 5 fichiers sont **IMMUTABLES**. Claude Code NE DOIT PAS :

- ❌ Créer un nouveau logo ou une variante supplémentaire
- ❌ Régénérer, modifier, resampler un des 5 logos existants (couleur, forme, stroke, proportions)
- ❌ Dupliquer ou renommer un des fichiers
- ❌ Proposer un « logo v2 » ou « logo alternatif »
- ❌ Appliquer des filtres CSS de recoloration (`hue-rotate`, `grayscale`, `invert`, `brightness != 1`, etc.)
- ❌ Supprimer les règles CSS de swap par thème (`[data-theme="X"] .site-logo img { content: url(...) }`)
- ❌ Supprimer un des 5 fichiers PNG du serveur ou du repo

**Les 5 logos EXISTENT et DOIVENT RESTER TELS QU'ILS SONT.**

**Le swap entre eux via CSS selon `[data-theme]` est le comportement VOULU, pas un reliquat à nettoyer.**

## Les 5 fichiers logos de référence

| Thème | Section | Fichier | Sélecteur CSS |
|---|---|---|---|
| **default (rouge)** | Sécurité / Red Team / pentest | `cropped-LogoLong4White-1.png` (attachment WP 600, `/wp-content/uploads/2024/01/`) | pas de `[data-theme]` (défaut) |
| **or** | IA (services + boutique hardware + tutos IA) | `Design-sans-titre-16.png` (`/wp-content/uploads/2026/01/`) | `[data-theme="or"]` |
| **vert** | Blog / ressources / savoir général | `Design-sans-titre-15.png` (`/wp-content/uploads/2026/01/`) | `[data-theme="vert"]` |
| **bleu** | Institutionnel (à propos, contact, légal) | `Design-sans-titre-13.png` (`/wp-content/uploads/2026/01/`) | `[data-theme="bleu"]` |
| **neutre** | Homepage (argenté) | `Design-sans-titre-17.png` (`/wp-content/uploads/2026/01/`) | `[data-theme="neutre"]` |

Copie locale de référence (immuable aussi) : `assets/logo-rouge-original.png`.

## Mécanisme de swap (OBLIGATOIRE, à préserver)

Le swap se fait **uniquement** via `content: url()` en CSS, jamais via filtre de recoloration.

```css
/* Défaut (rouge) : aucune règle, le logo natif est rendu par WP/Kadence via .custom-logo */

[data-theme="or"] .site-logo img,
[data-theme="or"] .custom-logo {
  content: url('/wp-content/uploads/2026/01/Design-sans-titre-16.png');
}

[data-theme="vert"] .site-logo img,
[data-theme="vert"] .custom-logo {
  content: url('/wp-content/uploads/2026/01/Design-sans-titre-15.png');
}

[data-theme="bleu"] .site-logo img,
[data-theme="bleu"] .custom-logo {
  content: url('/wp-content/uploads/2026/01/Design-sans-titre-13.png');
}

[data-theme="neutre"] .site-logo img,
[data-theme="neutre"] .custom-logo {
  content: url('/wp-content/uploads/2026/01/Design-sans-titre-17.png');
}
```

### Seul effet CSS autorisé sur le logo : le halo blanc

```css
.custom-logo,
.site-logo img {
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.6));
}
```

Rien d'autre. Pas de `hue-rotate`, `grayscale`, `invert`, `brightness != 1`, `opacity < 1`, etc.

## En React islands

Les islands React **ne rendent pas le logo**. Le logo est rendu côté WordPress (header Kadence via `the_custom_logo()` + règles CSS de swap ci-dessus). Si un island a besoin d'une référence visuelle de marque, il utilise le nom textuel « Inaricom » avec la typo Instrument Serif, pas une image.

## Pourquoi cette règle

1. **Identité de marque cohérente par univers** : un logo dédié par thématique (sécu / IA / blog / institutionnel / homepage), créé manuellement dans Canva (brand kit `kAG6uk9Uvbs`) pour garantir des couleurs brand exactes.
2. **Pas de filtre CSS de recoloration** : les filtres dénaturent les couleurs. Les 5 fichiers séparés garantissent la fidélité colorimétrique.
3. **Simplicité opérationnelle** : 5 fichiers, 5 règles CSS, zéro logique conditionnelle côté JS.
4. **Décision propriétaire** : les 5 variantes sont validées par Kevin Meunier.

## Historique : ancienne règle fausse (à ne plus suivre)

Une version antérieure de ce fichier instruisait par erreur :

> « Le logo unique rouge s'affiche partout, supprimer les variantes or / vert / bleu / neutre et les 4 PNG `Design-sans-titre-*.png` du serveur. »

**Cette instruction était FAUSSE.** Elle a conduit à :

- un commit git `af24375` supprimant 174 lignes de swap CSS dans les fichiers `audits/` (revert par `b8bd982` le 21 avril 2026),
- un brief `docs/BRIEF_CLAUDE_CODE_PHASE_2.0.md` qui planifiait `ssh inaricom 'rm ...Design-sans-titre-*.png'` sur le staging (heureusement skippé par Claude Code en Phase 2.0).

Toutes les sections « Étape 0 cleanup logo variants » dans les briefs, prompts et logs Phase 2.0 sont basées sur cette fausse règle et sont **OBSOLÈTES**. Elles doivent être ignorées et ne jamais être réexécutées.

## Si un utilisateur demande de modifier un logo

Refuser poliment et renvoyer vers Kevin Meunier :

> « Les 5 logos actuels sont verrouillés par décision du propriétaire (Kevin Meunier). Toute modification doit passer par lui directement. »

## Cas autorisés (par exception, sur demande explicite de Kevin Meunier)

- Création d'un favicon dérivé (`.ico`), basé sur un des 5 logos existants
- Création d'une version Open Graph (export PNG 1200×630 avec padding), basée sur un des 5 logos
- Création d'une version email signature (PNG basse résolution), basée sur un des 5 logos

Même dans ces cas, **les 5 logos originaux ne sont jamais modifiés visuellement**.

## À retenir

- **5 logos. 5 thèmes. Un par univers.**
- **Fichiers immuables.** On ne les modifie pas, on ne les supprime pas, on n'en crée pas d'autres.
- **Swap CSS par `[data-theme]` = comportement voulu**, pas un reliquat.
- **Pas de filtres CSS de recoloration.** Halo blanc (`drop-shadow`) autorisé.
- **Si tentation d' « uniformiser » ou « nettoyer » les logos**, STOP et relire cette règle.
