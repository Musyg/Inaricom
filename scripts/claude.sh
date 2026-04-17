#!/usr/bin/env bash
# ============================================
# Wrapper Claude Code — charge .env avant lancement
# ============================================
# Usage : ./scripts/claude.sh [args claude...]
# Ou : alias claude-inaricom='~/Desktop/Inaricom/scripts/claude.sh'
#
# Charge les variables d'env du .env projet pour que les MCP
# servers (woocommerce-mcp notamment) puissent les lire via ${VAR}.

set -euo pipefail

# Racine projet = dossier parent du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[ERREUR] .env introuvable : $ENV_FILE" >&2
  exit 1
fi

# Charge .env en exportant toutes les variables
# set -a : exporte automatiquement toutes les variables assignees
# set +a : desactive l'export auto
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

echo "[OK] .env charge : $(grep -c '^[A-Z]' "$ENV_FILE") variables"
echo "[OK] WC_MCP_HEADERS disponible : $([ -n "${WC_MCP_HEADERS:-}" ] && echo OUI || echo NON)"
echo ""

# Lance Claude Code avec tous les args passes
cd "$PROJECT_ROOT"
exec claude.cmd "$@"
