#!/usr/bin/env bash
# Launcher Claude Code pour Inaricom
# Source .env puis lance claude avec toutes les variables d'environnement disponibles
#
# Usage : ./claude.sh [args...]
# Exemples :
#   ./claude.sh                          # session interactive
#   ./claude.sh -p "Hello"               # mode one-shot

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Verifier que .env existe
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "ERREUR : .env introuvable dans $SCRIPT_DIR" >&2
    exit 1
fi

# Charger .env (set -a = export automatique, ignore lignes de commentaire et vides)
set -a
# shellcheck disable=SC1091
source "$SCRIPT_DIR/.env"
set +a

# Lancer Claude Code (.cmd obligatoire sous Windows / Git Bash)
exec claude.cmd "$@"
