#!/usr/bin/env bash
# Phase 2.0 Inaricom - Claude Code launcher (full auto + streaming visible)

set -e

cd "C:/Users/gimu8/Desktop/Inaricom"

echo "========================================"
echo "  PHASE 2.0 INARICOM - FULL AUTO MODE"
echo "========================================"
echo "Date    : $(date)"
echo "Dir     : $(pwd)"
echo "Claude  : $(claude --version)"
echo "Shell   : $SHELL $BASH_VERSION"
echo "pnpm    : $(pnpm --version 2>/dev/null || echo 'MANQUE')"
echo ""
echo "Git status (doit etre clean apres commit a5469a6) :"
git status --short
echo ""

PROMPT_FILE=".claude/phase2-0-prompt.txt"
LOG_FILE=".claude/logs/phase2-0-run.log"

if [ ! -f "$PROMPT_FILE" ]; then
    echo "ERREUR: Prompt file not found at $PROMPT_FILE"
    exit 1
fi

mkdir -p .claude/logs

echo "Prompt OK ($(wc -c < "$PROMPT_FILE") bytes)"
echo "Log    : $LOG_FILE"
echo ""
echo "========================================"
echo "  LANCEMENT CLAUDE CODE (streaming)"
echo "========================================"
echo "Mode: --dangerously-skip-permissions (full auto)"
echo "Output: streaming visible + log"
echo ""

# --dangerously-skip-permissions : full auto, pas d'approbations
# Mode streaming: sortie visible en live (pas de --print qui bufferise)
# Le prompt est injecte en 1er message via stdin
cat "$PROMPT_FILE" | claude --dangerously-skip-permissions 2>&1 | tee "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[1]}

echo ""
echo "========================================"
echo "  SESSION TERMINEE (exit code: $EXIT_CODE)"
echo "========================================"
echo "Log complet : $LOG_FILE"
echo ""

# Check rapide post-session
if [ -d "react-islands/node_modules" ]; then
    echo "node_modules present"
    ls react-islands/node_modules | head -5
fi
if [ -f "react-islands/pnpm-lock.yaml" ]; then
    echo "pnpm-lock.yaml present ($(wc -l < react-islands/pnpm-lock.yaml) lignes)"
else
    echo "pnpm-lock.yaml MANQUANT"
fi

echo ""
echo "Git status final :"
git status --short

echo ""
read -p "Press Enter to close this window..."
