# Test Claude Code dans le projet Inaricom — 17 avril 2026

## Objectif

Valider que Claude Code démarre correctement dans `C:\Users\gimu8\Desktop\Inaricom\` et voit :
- Le `CLAUDE.md` (brief projet)
- Les 30 skills (7 ultimes + 23 claudedesignskills)
- Les 7 MCP servers déclarés dans `.mcp.json`
- Peut parler au site live via le MCP WooCommerce

## Pré-requis vérifiés

- ✅ Claude Code 2.1.45 installé (`C:\Users\gimu8\AppData\Roaming\npm\claude.cmd`)
- ✅ `.mcp.json` JSON valide avec 7 serveurs
- ✅ `.env` avec URLs REST API correctes (racine, pas /web/)
- ✅ `CLAUDE.md` 266 lignes / 10.5 KB
- ✅ 30 skills dans `.claude/skills/` (7 actifs racine + 23 claudedesignskills)
- ✅ PHP 8.5.4 + WordPress + WooCommerce MCP opérationnels

## Procédure de test

### 1. Ouvrir PowerShell dans le projet

```powershell
cd C:\Users\gimu8\Desktop\Inaricom
```

### 2. Lancer Claude Code

```powershell
claude
```

### 3. Claude Code va demander d'approuver les MCP servers du projet

À la première invocation, il détecte le `.mcp.json` et affiche :

```
This project has MCP servers configured in .mcp.json.
Do you approve these servers? [y/N]
```

**Réponds `y`** (tu as lu le fichier, tu sais ce qu'il contient).

### 4. Prompt de validation — copie-colle exactement

Dans l'interface Claude Code, colle ce prompt :

```
Check-up de démarrage projet Inaricom. Réponds dans cet ordre exact :

1. Confirme la version de Claude Code (/about ou équivalent)
2. Liste les MCP servers connectés (/mcp)
3. Liste tous les skills disponibles (/skills)
4. Lis CLAUDE.md et résume en 3 phrases le pivot stratégique
5. Via le MCP woocommerce-mcp, appelle l'outil tools/list et montre-moi
   les 5 premiers outils exposés par le serveur MCP WooCommerce
6. Via filesystem, liste le contenu de .claude/skills/ (juste les dossiers)

Ne fais rien d'autre. Ne commence aucun refactor. C'est juste un test de
démarrage pour valider que tout est en place.
```

### 5. Critères de succès

- ✅ Claude Code démarre sans erreur
- ✅ Voit les 7 MCP servers (filesystem, chrome-devtools, playwright,
  woocommerce-mcp, ssh-staging, ssh-prod-readonly, hermes-control)
- ✅ Voit au minimum les 7 skills ultimes (frontend-design, react-best-practices,
  web-design-guidelines, impeccable, using-superpowers, web-artifacts-builder,
  webapp-testing)
- ✅ Le MCP WooCommerce répond avec une liste d'outils (produits, commandes, etc.)
- ✅ Pas d'erreur d'auth sur woocommerce-mcp

### 6. Si erreur

**Erreur "MCP server failed to start"** pour un serveur donné :
- Vérifier que le binaire npm est installé (`npx -y <package>` télécharge à la demande)
- Vérifier les variables d'environnement (`.env` bien chargé)

**Erreur "Connection closed"** sous Windows :
- Tous les MCP stdio sous Windows doivent être wrappés en `cmd /c npx ...`
- Vérifier que la clé `command` dans `.mcp.json` est bien `"cmd"` et
  `args` commence par `"/c"` pour les servers concernés

**Pas d'appel au MCP woocommerce** :
- `claude mcp reset-project-choices` puis relance et re-approuve

### 7. Après le test

Pour sortir de Claude Code : `/quit` ou `Ctrl+C` deux fois.

Les logs sont dans `%APPDATA%\Claude\logs\` si besoin de debug.
