#!/bin/bash
# ============================================================================
# db-clone-prod-to-staging.sh
# ----------------------------------------------------------------------------
# Clone DB prod vers staging + search-replace URLs + anonymisation nLPD/RGPD.
#
# SEQUENCE :
# 1. Backup DB staging actuelle (au cas ou)
# 2. Dump DB prod (nettoye des directives privilegiees)
# 3. Import dans DB staging
# 4. search-replace URL prod -> staging (all-tables-with-prefix)
# 5. Fix tables multisite (hiiw_site, hiiw_blogs, hiiw_sitemeta)
# 6. Anonymisation users + WooCommerce + comments
# 7. Reset password admin staging
# 8. Flush cache + rewrite
#
# Usage:
#   bash scripts/db-clone-prod-to-staging.sh
#
# Interactif : demande confirmation avant anonymisation.
# ============================================================================

set -euo pipefail

SSH_HOST="inaricom"
PROD_PATH="/home/toriispo/inaricom.com/web"
STAGING_PATH="/home/toriispo/inaricom.com/web-staging"
STAGING_ADMIN_PASS="${STAGING_ADMIN_PASS:-StagingAdmin2026!}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "================================================================"
echo "  DB CLONE PROD -> STAGING + ANONYMISATION"
echo "================================================================"
echo ""
read -p "ATTENTION: va ecraser DB staging avec clone prod anonymise. Continuer ? (oui/non) " confirm
[[ "$confirm" != "oui" ]] && { echo "Annule."; exit 1; }

# ============================================================================
# 1. Backup staging actuel (safety net)
# ============================================================================
echo ""
echo "=== 1. Backup DB staging actuelle ==="
bash "$(dirname "$0")/db-backup.sh" staging

# ============================================================================
# 2. Dump DB prod
# ============================================================================
echo ""
echo "=== 2. Dump DB prod ==="
PROD_DUMP="/home/toriispo/backup-prod-${TIMESTAMP}.sql"
ssh "$SSH_HOST" "cd $PROD_PATH && wp db export $PROD_DUMP \
    --default-character-set=utf8mb4 \
    --skip-triggers --skip-routines --add-drop-table"

# Nettoyage directives privilegiees
ssh "$SSH_HOST" "grep -vE '@@SESSION\\.SQL_LOG_BIN|SET @@GLOBAL\\.GTID_PURGED|MYSQLDUMP_TEMP_LOG_BIN' $PROD_DUMP > ${PROD_DUMP}.tmp && mv ${PROD_DUMP}.tmp $PROD_DUMP"

# ============================================================================
# 3. Import dans staging
# ============================================================================
echo ""
echo "=== 3. Import dans DB staging ==="
ssh "$SSH_HOST" "cd $STAGING_PATH && wp db import $PROD_DUMP"

# ============================================================================
# 4. Search-replace URLs
# ============================================================================
echo ""
echo "=== 4. Search-replace URLs (dry-run) ==="
ssh "$SSH_HOST" "cd $STAGING_PATH && wp search-replace \
    'https://inaricom.com' 'https://staging.inaricom.com' \
    --all-tables-with-prefix --dry-run 2>&1 | tail -3"

read -p "Appliquer search-replace reel ? (oui/non) " confirm_sr
if [[ "$confirm_sr" == "oui" ]]; then
    ssh "$SSH_HOST" "cd $STAGING_PATH && wp search-replace \
        'https://inaricom.com' 'https://staging.inaricom.com' \
        --all-tables-with-prefix 2>&1 | tail -3"
    # Cleanup du path /web/ legacy
    ssh "$SSH_HOST" "cd $STAGING_PATH && wp search-replace \
        'staging.inaricom.com/web' 'staging.inaricom.com' \
        --all-tables-with-prefix 2>&1 | tail -3"
fi

# ============================================================================
# 5. Fix tables multisite
# ============================================================================
echo ""
echo "=== 5. Fix tables multisite ==="
ssh "$SSH_HOST" "cd $STAGING_PATH && \
    wp db query \"UPDATE hiiw_site SET domain='staging.inaricom.com' WHERE domain='inaricom.com';\" && \
    wp db query \"UPDATE hiiw_blogs SET domain='staging.inaricom.com' WHERE domain='inaricom.com';\" && \
    wp db query \"UPDATE hiiw_sitemeta SET meta_value='https://staging.inaricom.com/' WHERE meta_key='siteurl';\" && \
    wp db query \"UPDATE hiiw_sitemeta SET meta_value='admin@staging.local' WHERE meta_key='admin_email';\" && \
    wp option update siteurl 'https://staging.inaricom.com' && \
    wp option update home 'https://staging.inaricom.com'"

# ============================================================================
# 6. Anonymisation nLPD/RGPD
# ============================================================================
echo ""
echo "=== 6. Anonymisation DB staging (nLPD/RGPD) ==="
ssh "$SSH_HOST" bash -s <<'ANONYMIZE_EOF'
cd /home/toriispo/inaricom.com/web-staging

# Users
wp db query "UPDATE hiiw_users SET user_email = CONCAT('staging-user-', ID, '@staging.local') WHERE ID != 1;"
wp db query "UPDATE hiiw_users SET user_email = 'admin@staging.local' WHERE ID = 1;"

# WooCommerce billing/shipping metas
wp db query "UPDATE hiiw_postmeta SET meta_value = CONCAT('anon-', post_id, '@staging.local') WHERE meta_key IN ('_billing_email', '_shipping_email');"
wp db query "UPDATE hiiw_postmeta SET meta_value = '+41000000000' WHERE meta_key IN ('_billing_phone', '_shipping_phone');"
wp db query "UPDATE hiiw_postmeta SET meta_value = 'Anonyme' WHERE meta_key IN ('_billing_first_name', '_shipping_first_name', '_billing_last_name', '_shipping_last_name');"
wp db query "UPDATE hiiw_postmeta SET meta_value = 'Rue anonymisee 1' WHERE meta_key IN ('_billing_address_1', '_shipping_address_1');"

# HPOS si present
wp db query "UPDATE hiiw_wc_orders SET billing_email = CONCAT('anon-', id, '@staging.local');" 2>/dev/null || true
wp db query "UPDATE hiiw_wc_orders_addresses SET email = CONCAT('anon-', order_id, '@staging.local'), phone = '+41000000000', first_name = 'Anonyme', last_name = 'Anonyme', address_1 = 'Rue anonymisee 1';" 2>/dev/null || true

# Comments
wp db query "UPDATE hiiw_comments SET comment_author_email = CONCAT('staging-comment-', comment_ID, '@staging.local'), comment_author_IP = '0.0.0.0';"

# Options sensibles
wp db query "UPDATE hiiw_options SET option_value = 'admin@staging.local' WHERE option_name = 'admin_email';"
wp db query "UPDATE hiiw_options SET option_value = 'admin@staging.local' WHERE option_name = 'woocommerce_email_from_address';" 2>/dev/null || true
ANONYMIZE_EOF

# ============================================================================
# 7. Reset admin password staging
# ============================================================================
echo ""
echo "=== 7. Reset password admin staging ==="
ssh "$SSH_HOST" "cd $STAGING_PATH && wp user update 1 --user_pass='$STAGING_ADMIN_PASS' --skip-email"

# ============================================================================
# 8. Desactivation Coming Soon + plugins dangereux
# ============================================================================
echo ""
echo "=== 8. Desactivation Coming Soon + plugins tracking ==="
ssh "$SSH_HOST" "cd $STAGING_PATH && \
    wp option update woocommerce_coming_soon 'no' --url=https://staging.inaricom.com && \
    wp option update woocommerce_private_link 'no' --url=https://staging.inaricom.com && \
    wp plugin deactivate woocommerce-payments --network 2>/dev/null || true"

# ============================================================================
# 9. Flush cache + rewrite
# ============================================================================
echo ""
echo "=== 9. Flush ==="
ssh "$SSH_HOST" "cd $STAGING_PATH && wp cache flush && wp rewrite flush"

# ============================================================================
# 10. Test HTTP
# ============================================================================
echo ""
echo "=== 10. Test HTTP ==="
sleep 2
HTTP=$(curl -sI -o /dev/null -w "%{http_code}" https://staging.inaricom.com/ --insecure)
echo "HTTP $HTTP"

echo ""
echo "================================================================"
echo "Clone termine. Staging iso prod (anonymise)."
echo "Admin: inaroot / $STAGING_ADMIN_PASS"
echo "================================================================"
