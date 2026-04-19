#!/bin/bash
# ============================================================================
# deploy-staging.sh
# ----------------------------------------------------------------------------
# Deploie le code local (child theme, plugins custom) vers staging.
# Utilise scp (natif Windows OpenSSH + Git Bash), pas rsync.
#
# Pour un delta rsync reel (bien plus rapide sur gros volumes), utilise
# sync-from-prod.sh qui tourne en SSH-only avec rsync cote serveur.
#
# Ne touche PAS a la prod. Ne touche PAS a la DB.
#
# Usage:
#   bash scripts/deploy-staging.sh [--dry-run] [--no-git-check]
#
# Sources locales deployees (si presentes) :
#   - kadence-child/           -> wp-content/themes/kadence-child/
#   - inaricom-core/           -> wp-content/plugins/inaricom-core/
#   - inaricom-digikey/        -> wp-content/plugins/inaricom-digikey/
#
# Pre-requis : working tree git clean. Override : --no-git-check
# ============================================================================

set -euo pipefail

SSH_HOST="inaricom"
STAGING_PATH="/home/toriispo/inaricom.com/web-staging"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DRY_RUN=""
SKIP_GIT_CHECK=""
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Parse args
for arg in "$@"; do
    case $arg in
        --dry-run) DRY_RUN="1" ;;
        --no-git-check) SKIP_GIT_CHECK="1" ;;
        --help|-h)
            grep -E '^#' "$0" | head -25
            exit 0
            ;;
    esac
done

echo "================================================================"
echo "  DEPLOY LOCAL -> STAGING"
echo "  Repo  : $REPO_ROOT"
echo "  Target: $SSH_HOST:$STAGING_PATH"
[[ -n "$DRY_RUN" ]] && echo "  Mode  : DRY RUN"
echo "================================================================"

cd "$REPO_ROOT"

# ============================================================================
# 1. Pre-flight : working tree git clean ?
# ============================================================================
if [[ -z "$SKIP_GIT_CHECK" ]]; then
    if [[ -n "$(git status --porcelain)" ]]; then
        echo ""
        echo "ERREUR: working tree non clean. Commitez ou stash avant de deployer."
        git status --short
        echo ""
        echo "Pour forcer : --no-git-check"
        exit 1
    fi

    BRANCH=$(git branch --show-current)
    SHA=$(git log -1 --format=%h)
    echo ""
    echo "Git : branche=$BRANCH commit=$SHA"
fi

# ============================================================================
# 2. Deploiement via tar + scp (pipe atomique)
# ============================================================================

deploy_folder() {
    local local_path="$1"
    local remote_path="$2"
    local label="$3"

    if [[ ! -d "$local_path" ]]; then
        echo "(skip) $label : $local_path absent"
        return 0
    fi

    echo ""
    echo "=== Deploy $label ==="
    echo "   Source: $local_path"
    echo "   Target: $SSH_HOST:$remote_path"

    if [[ -n "$DRY_RUN" ]]; then
        echo "   [DRY RUN] Fichiers qui seraient transferes :"
        (cd "$local_path" && find . -type f \
            ! -path './.git/*' ! -path './node_modules/*' ! -path './vendor/*' \
            ! -name '*.log' ! -name '.DS_Store' ! -name 'Thumbs.db' \
            | head -20)
        local count=$(cd "$local_path" && find . -type f \
            ! -path './.git/*' ! -path './node_modules/*' ! -path './vendor/*' \
            ! -name '*.log' | wc -l)
        echo "   [DRY RUN] Total: $count fichiers"
        return 0
    fi

    # Tar local + scp via SSH (pipe) + untar remote
    # Evite plusieurs connexions SSH et preserve les permissions
    local tmpfile="/tmp/deploy-${TIMESTAMP}-$$.tar.gz"
    tar -czf "$tmpfile" -C "$local_path" \
        --exclude='.git' --exclude='node_modules' --exclude='vendor' \
        --exclude='*.log' --exclude='.DS_Store' --exclude='Thumbs.db' \
        --exclude='tests' \
        .

    scp -q "$tmpfile" "$SSH_HOST:/tmp/deploy-${TIMESTAMP}.tar.gz"
    rm -f "$tmpfile"

    ssh "$SSH_HOST" "mkdir -p $remote_path && \
        tar -xzf /tmp/deploy-${TIMESTAMP}.tar.gz -C $remote_path && \
        rm /tmp/deploy-${TIMESTAMP}.tar.gz"

    echo "   OK"
}

deploy_folder "$REPO_ROOT/kadence-child" \
    "$STAGING_PATH/wp-content/themes/kadence-child" \
    "child theme kadence-child"

deploy_folder "$REPO_ROOT/inaricom-core" \
    "$STAGING_PATH/wp-content/plugins/inaricom-core" \
    "plugin inaricom-core"

deploy_folder "$REPO_ROOT/inaricom-digikey" \
    "$STAGING_PATH/wp-content/plugins/inaricom-digikey" \
    "plugin inaricom-digikey"

# ============================================================================
# 3. Post-deploy : flush cache + rewrite
# ============================================================================
if [[ -z "$DRY_RUN" ]]; then
    echo ""
    echo "=== Post-deploy : flush cache + rewrite staging ==="
    ssh "$SSH_HOST" "cd $STAGING_PATH && wp cache flush && wp rewrite flush" 2>&1 | grep -iE 'success|error' || true
fi

# ============================================================================
# 4. Smoke test HTTP
# ============================================================================
if [[ -z "$DRY_RUN" ]]; then
    echo ""
    echo "=== Smoke test HTTP staging ==="
    CRED_FILE="$REPO_ROOT/STAGING_CREDENTIALS.txt"
    if [[ -f "$CRED_FILE" ]]; then
        HTTP_USER=$(grep -oP 'Auth HTTP user\s*:\s*\K\S+' "$CRED_FILE" 2>/dev/null || echo "staging")
        HTTP_PASS=$(grep -oP 'Auth HTTP pass\s*:\s*\K\S+' "$CRED_FILE" 2>/dev/null || echo "")
    else
        HTTP_USER="staging"
        HTTP_PASS=""
    fi

    if [[ -n "$HTTP_PASS" ]]; then
        HTTP=$(curl -sI -o /dev/null -w "%{http_code}" \
            -u "$HTTP_USER:$HTTP_PASS" \
            https://staging.inaricom.com/ --insecure)
    else
        HTTP=$(curl -sI -o /dev/null -w "%{http_code}" \
            https://staging.inaricom.com/ --insecure)
    fi

    echo "   HTTP: $HTTP"
    if [[ "$HTTP" == "200" ]]; then
        echo "   => Staging OK"
    elif [[ "$HTTP" == "401" ]]; then
        echo "   => Staging protege par auth (credentials non lus, verification manuelle)"
    else
        echo "   !! ECHEC: HTTP $HTTP"
        exit 1
    fi
fi

echo ""
echo "================================================================"
if [[ -n "$DRY_RUN" ]]; then
    echo "DRY RUN termine."
else
    echo "Deploy local -> staging termine avec succes."
    [[ -z "$SKIP_GIT_CHECK" ]] && echo "Branche: $BRANCH @ $SHA"
fi
echo "================================================================"
