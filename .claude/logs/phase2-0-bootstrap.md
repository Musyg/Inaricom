# Phase 2.0 — Bootstrap log

Date : 2026-04-21
Agent : Claude Code Opus 4.7 (session autonome)

## Probleme BLOQUANT detecte au bootstrap

### RTK hook rewrite + PATH shell incomplet

Le hook `PreToolUse` Bash configure dans `.claude/settings.json` :

```json
"hooks": {
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        { "type": "command", "command": "C:\\Users\\gimu8\\.rtk\\bin\\rtk.exe hook claude --ultra-compact" }
      ]
    }
  ]
}
```

reecrit systematiquement les commandes en `rtk <cmd>`. Exemple valide observe :

Input : `git status`
Output hook : `{"permissionDecision":"allow","updatedInput":{"command":"rtk git status"}}`

MAIS le shell `bash` spawn par le Bash tool de Claude Code n'a PAS `C:\Users\gimu8\.rtk\bin\` dans son `$PATH`. Resultat : toutes les commandes non-triviales (git status, pnpm install, ls, echo $PATH, ssh, etc.) reviennent avec exit code 127 (command not found).

### Commandes testees

| Commande | Exit | Output |
|----------|------|--------|
| `git --version` | 0 | OK (pas reecrit car pas de sous-cmd) |
| `git status` | 127 | reecrite `rtk git status`, rtk absent PATH |
| `git -C <path> status --short` | 127 | idem |
| `echo test` | 1 | reecrit probablement |
| `ls` | 127 | idem |
| `rtk --version` | 127 | rtk pas dans PATH |
| `"C:\Users\gimu8\.rtk\bin\rtk.exe" --version` | 0 | renvoie `rtk 0.37.2` (binaire OK) |

### Impact sur Phase 2.0

Blocage TOTAL des operations shell necessaires :
- git status / log / add / commit / push
- pnpm install / add / audit / build / dev
- ssh inaricom (cleanup serveur + rebuild 347)
- scp push snippets staging
- mkdir/cp/mv pour structure react-islands

Impossible d'executer Etape 0 (cleanup logo serveur) ni Etapes 1-15 (setup Vite) en l'etat.

### Causes possibles

1. **PATH shell incomplet** : Claude Code spawn un bash MINGW64 qui n'herite pas du PATH utilisateur Windows (ou alors herite sans `.rtk/bin`)
2. **RTK attend une installation PATH-registered** qui n'a pas ete faite sur cette session
3. **Hook trop agressif** : le rewrite s'applique sur `echo`, `ls`, `git --version` (qui marchent sans rewrite en realite — un rewrite `rtk echo test` casse par manque de rtk)

### Solutions possibles (action utilisateur requise)

Option A — **ajouter `C:\Users\gimu8\.rtk\bin\` au PATH du shell Claude** :
- Soit via `env.PATH` dans `.claude/settings.json`
- Soit en creant un alias shim dans un dossier deja dans PATH
- Soit via `~/.bashrc` ou equivalent

Option B — **desactiver temporairement le hook RTK pour cette session** :
- Commenter le bloc `PreToolUse` dans `.claude/settings.json`
- Ou changer le matcher pour exclure les commandes de base

Option C — **reinstaller rtk globalement** : `pnpm add -g rtk` ou equivalent, pour que `rtk` soit dans PATH standard.

### Decision

**Impossible de brute-forcer** conformement aux guardrails projet ("si approche bloquee, ne pas retenter"). Remontee utilisateur obligatoire avant toute action Phase 2.0.

## Autres verifications bootstrap (partielles)

| Outil | Etat | Source |
|-------|------|--------|
| RTK binary | present a `C:\Users\gimu8\.rtk\bin\rtk.exe`, version 0.37.2 | verifie via full-path exec |
| Hook PreToolUse Bash | actif, rewrite `git status` -> `rtk git status` | verifie manuellement |
| token-optimizer plugin | impossible a verifier sans `/plugin list` (Bash KO) | NA |
| context-mode MCP | impossible a verifier sans Bash/MCP tool | NA |
| caveman skill | pas verifie (lecture skill frontmatter non bloquante mais pas encore faite) | NA |

## Recommandation immediate

1. Utilisateur fixe le PATH (Option A recommandee) via :
   ```json
   "env": {
     "PATH": "${PATH};C:\\Users\\gimu8\\.rtk\\bin"
   }
   ```
2. Relance la session Claude Code
3. Session suivante reprend sur l'etat cible Phase 2.0 (idempotent)

Aucune action destructive n'a ete entreprise. Aucun fichier modifie. Aucun commit.
