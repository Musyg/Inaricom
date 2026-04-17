# Inaricom DigiKey Integration

**Plugin WordPress/WooCommerce pour l'intégration API DigiKey v4**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![WordPress](https://img.shields.io/badge/WordPress-6.0+-green)
![WooCommerce](https://img.shields.io/badge/WooCommerce-8.0+-purple)
![PHP](https://img.shields.io/badge/PHP-8.0+-orange)

## 🚀 Fonctionnalités

### Importation de produits
- **Recherche en temps réel** dans le catalogue DigiKey (300+ millions de produits)
- **Import individuel ou en masse** vers WooCommerce
- **Téléchargement automatique** des images produits
- **Conversion des paramètres** en attributs WooCommerce
- **Détection des doublons** à l'import

### Synchronisation automatique
- **Mise à jour prix et stock** 2x par jour (cron)
- **Marge configurable** appliquée automatiquement
- **Synchronisation individuelle** ou globale
- **Historique des mises à jour**

### Livraison intelligente
- **Configuration par pays** (9 pays européens inclus)
- **Délais fabricant** (ManufacturerLeadWeeks) intégrés
- **Seuils de livraison gratuite** personnalisables
- **Badges frontend** sur les fiches produit

### Interface Admin
- **Dashboard** avec statistiques
- **Recherche avancée** avec filtres et tri
- **Page de synchronisation** avec suivi temps réel
- **Configuration livraison** par pays

## 📦 Installation

### Prérequis
- WordPress 6.0+
- WooCommerce 8.0+
- PHP 8.0+
- Compte développeur DigiKey avec API v4

### Installation manuelle
1. Télécharger le dossier `inaricom-digikey`
2. Uploader dans `/wp-content/plugins/`
3. Activer le plugin dans WordPress
4. Configurer dans **DigiKey** > **Settings**

### Configuration API DigiKey

1. Créer une application sur [developer.digikey.com](https://developer.digikey.com)
2. Configurer l'URL de callback : `https://votre-site.com/wp-json/inaricom/v1/digikey-callback`
3. Copier Client ID et Client Secret dans les réglages du plugin
4. Cliquer sur "Autoriser DigiKey" pour OAuth

## 🔧 Configuration

### Réglages généraux
| Option | Description | Défaut |
|--------|-------------|--------|
| Client ID | Identifiant API DigiKey | - |
| Client Secret | Secret API DigiKey | - |
| Marge (%) | Pourcentage appliqué au prix DigiKey | 15% |
| Sync automatique | Activer la synchronisation cron | Oui |

### Configuration livraison (par pays)
- **Délais min/max** : Jours ouvrés de livraison
- **Seuil gratuit** : Montant pour livraison gratuite
- **Frais de port** : Coût standard
- **Devise** : CHF, EUR, GBP
- **Incoterms** : DDP, CPT, DAP

## 📊 Données récupérées

Pour chaque produit DigiKey :
- Numéro de pièce (DigiKey & fabricant)
- Description complète
- Prix en temps réel (CHF)
- Stock disponible
- Délai fabricant (semaines)
- Image produit
- Datasheet URL
- Paramètres techniques
- Catégorie DigiKey

## 🎨 Affichage Frontend

Le plugin affiche automatiquement sur les fiches produit :
- 🚚 Délai de livraison estimé
- ✅ Statut livraison gratuite
- ⏳ Délai fabricant (si rupture)
- 📦 Provenance DigiKey

Compatible avec les thèmes dark mode.

## 🔐 Sécurité

- OAuth 2.0 avec refresh token automatique
- Tokens stockés de manière sécurisée
- Vérification des capabilities WordPress
- Nonces AJAX pour toutes les actions
- Sanitization des entrées utilisateur

## 📝 API Endpoints REST

```
GET  /wp-json/inaricom/v1/digikey-callback  # OAuth callback
POST /wp-json/inaricom/v1/search             # Recherche produits
GET  /wp-json/inaricom/v1/product/{part}     # Détails produit
```

## ⚙️ Hooks disponibles

### Actions
```php
// Après import d'un produit
do_action('inaricom_dk_product_imported', $product_id, $dk_product);

// Après synchronisation
do_action('inaricom_dk_sync_completed', $products_count);
```

### Filtres
```php
// Modifier le prix avant import
add_filter('inaricom_dk_import_price', function($price, $product) {
    return $price * 1.05; // +5% supplémentaire
}, 10, 2);
```

## 🐛 Dépannage

### Erreur "Token expiré"
1. Aller dans DigiKey > Settings
2. Cliquer sur "Autoriser DigiKey"
3. Compléter le flux OAuth

### Produits non synchronisés
- Vérifier que le cron WordPress fonctionne
- Lancer manuellement depuis DigiKey > Sync

### Images non téléchargées
- Vérifier les permissions du dossier uploads
- Vérifier que `allow_url_fopen` est activé

## 📄 Changelog

### 1.0.0 (2025-01-12)
- 🎉 Version initiale
- ✅ API DigiKey v4 complète
- ✅ Import single + bulk
- ✅ Sync automatique
- ✅ Configuration livraison 9 pays
- ✅ Badges frontend

## 📜 Licence

Propriétaire - Inaricom Meunier K.

## 👤 Auteur

**Inaricom**
- Site : [inaricom.com](https://inaricom.com)
- Contact : contact@inaricom.com
