# Regle : Corrections chirurgicales > reecritures

> Regle chargee automatiquement. Reflex absolu lors de tout debug ou patch.

## Principe central

**Si un code de 200 lignes a un bug ligne 47, tu corriges la ligne 47.**
**Pas** 200 lignes "refaites proprement".

## Pourquoi cette regle existe

Historiquement :
- Refactors complets ont casse des fonctionnalites qui marchaient
- Temps de re-validation × 10 vs patch chirurgical
- Impossibilite de faire un `git diff` propre
- Perte de contexte (choix historiques) lors de reecriture
- Risque de regression sur sujets hors scope du bug initial

## Comment appliquer

### 1. Diagnostic avant toute modification
- Lire le code en entier (contexte complet)
- Identifier la ligne / la fonction exacte en cause
- Verifier si le reste du code est OK ou si c'est systematique

### 2. Patch minimal
✅ **Bon** :
> "Ligne 47 de `fox-animation.js`, remplace `opacity: 0` par `opacity: 0.85`. C'est tout."

❌ **Mauvais** :
> "J'ai refait toute la classe avec une meilleure architecture. Voici les 180 lignes..."

### 3. Si refactor vraiment necessaire
- Expliquer **pourquoi** une correction locale ne suffit pas
- Demander validation avant
- Garder l'ancien code en commentaire avec date
- Commits atomiques (un refactor par commit, pas tout melange)

### 4. Versionnage explicite
Si une v18 existe et qu'on travaille sur v19 :
- Ne PAS repartir de v1
- Demander a voir v18 si besoin
- Enchaîner sur les changements
- Noter la version dans le commit : `feat(fox): v19 - add glow additive HDR`

### 5. Garder ce qui marche
- Les tests qui passent restent tels quels
- Les styles valides restent
- Les dependances stables restent
- On change **une chose a la fois**

## Exemples concrets

### Cas 1 : bug CSS
**Demande** : "Mon hero a un gap de 8px en trop en mobile"
✅ **Bonne reponse** : "Ligne 234 de `hero.css`, ajoute `@media (max-width: 768px) { .hero { gap: 0; } }`"
❌ **Mauvaise reponse** : "Voici un hero refait avec une architecture CSS Grid propre..."

### Cas 2 : hook WooCommerce
**Demande** : "Le prix affiche mal pour les produits variables"
✅ **Bonne reponse** : "Dans ton snippet, ligne 12, il faut ajouter le check `is_type('variable')` avant d'afficher. Voici le patch..."
❌ **Mauvaise reponse** : "Je vais refaire tout le systeme d'affichage des prix..."

### Cas 3 : animation fox
**Demande** : "L'animation fox ne change pas de couleur quand je change de theme"
✅ **Bonne reponse** : "Dans ta classe `FoxAnimation` ligne XX, ton MutationObserver ne rappelle pas `drawFinalState()` apres la fin. Ajoute..."
❌ **Mauvaise reponse** : "Voici une refonte complete avec une architecture amelioree..."

## A retenir

- **Commencer petit**, elargir si necessaire
- **Demander validation** avant tout changement > 50 lignes
- **Versionner** via commits atomiques
- **Documenter** le pourquoi dans le commit, pas le quoi (le diff le montre)

La sobriete > l'elegance. Un patch moche qui resout le bug > une refonte elegante qui casse trois autres choses.
