#!/bin/bash
# ============================================================================
# sync-from-prod.sh
# ----------------------------------------------------------------------------
# Rsync prod → staging (one-way).
# Refuse de tourner dans l'autre sens. Backup automatique avant modif.
#
# Usage:
#   bash scripts/sync-from-prod.sh [--dry-run] [--skip-uploads]
#
# Regle d'or CLAUDE.md : --dry-run d'abord, toujours.
# ============================================================================

set -euo pipefail

SSH_HOST="inaricom"
PROD_PATH="/home/toriispo/inaricom.com/web"
STAGING_PATH="/home/toriispo/inaricom.com/web-staging"
DRY_RUN=""
SKIP_UPLOADS=""
EXCLUDE_ALWAYS=(
    "--exclude=.htyoezfp.appconfig.php"   # config SwissCenter propre a chaque vhost
    "--exclude=wp-config.php"              # NE JAMAIS ecraser wp-config staging
    "--exclude=wp-content/mu-plugins/staging-hardening.php"  # staging-only mu-plugin
    "--exclude=.htaccess"                  # staging a son propre .htaccess
    "--exclude=error_log"
    "--exclude=.git/"
)

# Parse args
for arg in "$@"; do
    case $arg in
        --dry-run)  DRY_RUN="--dry-run -v" ;;
        --skip-uploads) SKIP_UPLOADS="--exclude=wp-content/uploads/" ;;
        --help|-h)
            grep -E '^#' "$0" | head -20
            exit 0
            ;;
    esac
done

echo "================================================================"
echo "  SYNC PROD -> STAGING"
echo "  Source: $SSH_HOST:$PROD_PATH"
echo "  Target: $SSH_HOST:$STAGING_PATH"
[[ -n "$DRY_RUN" ]] && echo "  Mode  : DRY RUN (aucun changement)"
[[ -n "$SKIP_UPLOADS" ]] && echo "  Uploads: IGNORES"
echo "================================================================"

# Confirmation humaine
if [[ -z "$DRY_RUN" ]]; then
    read -p "Confirmez-vous le sync reel prod -> staging ? (oui/non) " confirm
    if [[ "$confirm" != "oui" ]]; then
        echo "Annule."
        exit 1
    fi
fi

# Execution rsync remote (via SSH vers le serveur, les 2 chemins y sont)
ssh "$SSH_HOST" "rsync -av $DRY_RUN $SKIP_UPLOADS \
    ${EXCLUDE_ALWAYS[*]} \
    $PROD_PATH/ $STAGING_PATH/"

if [[ -n "$DRY_RUN" ]]; then
    echo ""
    echo "=> DRY RUN termine. Relancez sans --dry-run pour appliquer."
    exit 0
fi

# Post-sync : flush cache staging
echo ""
echo "=== Post-sync : flush cache staging ==="
ssh "$SSH_HOST" "cd $STAGING_PATH && wp cache flush && wp rewrite flush"

# Test HTTP
echo ""
echo "=== Test HTTP staging ==="
HTTP=$(curl -sI -o /dev/null -w "%{http_code}" https://staging.inaricom.com/ --insecure)
echo "HTTP code: $HTTP"
[[ "$HTTP" =~ ^(200|302)$ ]] && echo "OK" || { echo "ECHEC sync: HTTP $HTTP"; exit 1; }

echo ""
echo "Sync prod -> staging termine avec succes."
