# CSS Sources — Addendum Phase B' (2026-04-19)

> Extension de `css-inventory.md` suite à la découverte de **sources CSS hors plugin custom-css-js**.

## Cartographie complète des 7 sources CSS

Après audit approfondi DB staging, voici **toutes** les sources CSS du site :

| # | Source | Statut | Taille | Versionné git ? |
|---|--------|--------|--------|-----------------|
| 1 | Kadence parent theme | 🟢 externe (hors scope) | ~200 KB enqueued | Non (mais stable) |
| 2 | Customizer → Additional CSS (post #362) | 🟢 **vidé B'.3** | ~522 octets (commentaire) | ✅ oui |
| 3 | Kadence Elements (CPT `kadence_element`) | 🟢 inexistant | 0 octets | N/A |
| 4 | Plugin custom-css-js (13 snippets) | 🟡 inventorié | ~6 450 lignes | ✅ oui (dump) |
| 5 | Child theme kadence-child | 🟢 inactif (déployé mais pas activé) | ~2 KB | ✅ oui |
| 6 | Meta CSS par page (`_kad_post_*`) | 🟢 aucun (flags uniquement) | 0 CSS custom | N/A |
| 7 | Gutenberg/Kadence Blocks inline | 🟡 non audité | Variable par page | Non |

## Actions Phase B'.3 effectuées (2026-04-19)

### Découverte post #362 (Customizer Additional CSS)

Contenait **9 158 octets / 279 lignes** de CSS totalement invisibles pour l'équipe :

- **25 lignes** : Fix WooCommerce hover archive (produits action button reposition) → **migré section 47 du 347**
- **200 lignes** : Règles `[data-theme="rouge"]` dupliquant les sections 43-46 du 347 via variables CSS → **supprimées**
- **54 lignes** : Bouton `.i-cta-box__btn` par thème (or/bleu/vert/rouge) → **migré section 47b du 347**

### Suppression doublons

Les règles `[data-theme="rouge"]` étaient **actives** (le switcher JS met bien `data-theme="rouge"` par défaut sur `<html>`) mais **redondantes** avec le `:root {}` du 347 qui définit déjà les variables rouge par défaut. Résultat concret : elles créaient des conflits de spécificité selon l'ordre d'injection et contribuaient à des bugs d'affichage intermittents.

### Post #362 vidé

Contenu remplacé par un commentaire de traçabilité pour empêcher les futures additions silencieuses. Le Customizer WordPress de Kadence ne doit **plus jamais** être utilisé pour ajouter du CSS : tout passe par le snippet #347 à l'avenir.

## Sources encore potentiellement problématiques

### #7 Gutenberg/Kadence Blocks inline

Kadence Blocks génère des `<style>` inline dans le `<body>` basés sur les attributs de chaque bloc (espacement custom, couleur custom, etc.). Invisible globalement, mais **moins problématique** car :

- Contenu généré par Kadence depuis les attributs du bloc → versionné indirectement via `post_content`
- Ne peut pas contenir de règles CSS génériques (uniquement styles bloc-spécifiques)
- Si un bloc pose problème, c'est traçable : on édite le bloc dans Gutenberg

**Verdict** : pas un silent killer prioritaire. On y reviendra si un bug précis pointe vers un bloc.

## Sources définitivement neutralisées

Post-B'.3, les sources `invisible` sont :
- ✅ Customizer Additional CSS (vidé + traçable)
- ✅ Kadence Elements (aucun actif)
- ✅ Meta CSS par page (aucun contenu custom dans `_kad_post_*`)

Il ne reste qu'**une seule source principale de CSS custom** : le plugin `custom-css-js` (13 snippets, tous versionnés dans `audits/css-dump/`).

## Prochaines étapes

Le terrain est propre. Si bugs visuels restent, ils viennent de :
1. **Sections 43-46 du 347** (règles thème dupliquées, candidate refactor B.4)
2. **Hex hardcodés** dans 740/952/1051 (cible B.2/B.3)
3. **Gutenberg inline** sur pages spécifiques (cas par cas)

Le refactor progressif du 347 reste la grosse pièce à faire. Mais plus aucune source **invisible** ne peut venir contredire mystérieusement une modification.
