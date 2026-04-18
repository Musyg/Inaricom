#!/bin/bash
# ============================================================================
# db-backup.sh
# ----------------------------------------------------------------------------
# Dump DB prod (ou staging) avec horodatage, chiffrement GPG optionnel.
# A lancer AVANT toute modif DB.
#
# Usage:
#   bash scripts/db-backup.sh prod
#   bash scripts/db-backup.sh staging
#
# Exit code:
#   0 = backup OK
#   1 = erreur
# ============================================================================

set -euo pipefail

SSH_HOST="inaricom"
ENV="${1:-}"

if [[ "$ENV" != "prod" && "$ENV" != "staging" ]]; then
    echo "Usage: $0 <prod|staging>"
    exit 1
fi

if [[ "$ENV" == "prod" ]]; then
    WP_PATH="/home/toriispo/inaricom.com/web"
    LABEL="prod"
else
    WP_PATH="/home/toriispo/inaricom.com/web-staging"
    LABEL="staging"
fi

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DUMP_NAME="backup-${LABEL}-${TIMESTAMP}.sql"
REMOTE_PATH="/home/toriispo/${DUMP_NAME}"

echo "================================================================"
echo "  DB BACKUP ${LABEL^^}"
echo "  Timestamp: $TIMESTAMP"
echo "  Remote  : $SSH_HOST:$REMOTE_PATH"
echo "================================================================"

# Dump via WP-CLI (compatible multi-env, respecte wp-config)
# Skip triggers/routines pour eviter erreurs SUPER privilege sur mutualise
ssh "$SSH_HOST" "cd $WP_PATH && wp db export $REMOTE_PATH \
    --default-character-set=utf8mb4 \
    --skip-triggers --skip-routines --add-drop-table"

# Nettoyage des directives privilegiees
ssh "$SSH_HOST" "grep -vE '@@SESSION\\.SQL_LOG_BIN|SET @@GLOBAL\\.GTID_PURGED|MYSQLDUMP_TEMP_LOG_BIN' $REMOTE_PATH > ${REMOTE_PATH}.tmp && mv ${REMOTE_PATH}.tmp $REMOTE_PATH"

# Taille
SIZE=$(ssh "$SSH_HOST" "du -h $REMOTE_PATH" | cut -f1)
echo ""
echo "Backup cree : $REMOTE_PATH ($SIZE)"
echo ""
echo "=> Rappel : ce backup reste sur le serveur (non chiffre)."
echo "   Pour rapatrier en local :"
echo "   scp $SSH_HOST:$REMOTE_PATH ./backups/"
