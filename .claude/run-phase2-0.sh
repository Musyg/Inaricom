#!/usr/bin/env bash
# Phase 2.0 Inaricom - Claude Code launcher (full auto)

set -e

cd "C:/Users/gimu8/Desktop/Inaricom"

echo "========================================"
echo "  PHASE 2.0 INARICOM - FULL AUTO MODE"
echo "========================================"
echo "Date    : $(date)"
echo "Dir     : $(pwd)"
echo "Claude  : $(claude --version)"
echo "Shell   : $SHELL $BASH_VERSION"
echo ""
echo "Chargement prompt Phase 2.0..."

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
echo "  LANCEMENT CLAUDE CODE"
echo "========================================"
echo ""

# Lancer Claude Code en mode print (headless) avec le prompt piped
# --dangerously-skip-permissions : full auto, pas d'approbations
# --output-format stream-json : streaming lisible
cat "$PROMPT_FILE" | claude --dangerously-skip-permissions --print 2>&1 | tee "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[1]}

echo ""
echo "========================================"
echo "  SESSION TERMINEE (exit code: $EXIT_CODE)"
echo "========================================"
echo "Log complet : $LOG_FILE"
echo ""

read -p "Press Enter to close this window..."
