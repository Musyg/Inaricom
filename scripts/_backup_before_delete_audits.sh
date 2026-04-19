#!/bin/bash
# Backup complet AVANT suppression produits audit
set -e
cd ~/inaricom.com/web-staging
URL=https://staging.inaricom.com

TS=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=/tmp/audit-products-backup-$TS
mkdir -p $BACKUP_DIR

echo "=== 1. Export JSON complet des 6 produits audit (contenu + meta) ==="
for ID in 1044 1045 1046 1047 1048 1049; do
    echo "--- Produit $ID ---"
    # Post content
    wp post get $ID --format=json --url=$URL > $BACKUP_DIR/product-$ID.json 2>&1
    # Post meta (toutes les _meta dont price, sku, stock, etc.)
    wp post meta list $ID --format=json --url=$URL > $BACKUP_DIR/product-$ID-meta.json 2>&1
    # Taxonomy terms
    wp post term list $ID product_cat --format=json --url=$URL > $BACKUP_DIR/product-$ID-terms.json 2>&1
    SIZE=$(wc -c < $BACKUP_DIR/product-$ID.json)
    TITLE=$(wp post get $ID --field=post_title --url=$URL)
    echo "   [$ID] $TITLE ($SIZE octets)"
done

echo ""
echo "=== 2. Backup full DB (filet de securite) ==="
wp db export $BACKUP_DIR/full-db-before-deletion.sql --url=$URL 2>&1 | tail -3
ls -lah $BACKUP_DIR/full-db-before-deletion.sql

echo ""
echo "=== 3. Liste fichiers backup ==="
ls -la $BACKUP_DIR/

echo ""
echo "================================================================"
echo "Backup complet : $BACKUP_DIR"
echo "================================================================"
