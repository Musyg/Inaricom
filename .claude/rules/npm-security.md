# Regle : securite supply chain npm/pnpm

> Source d'autorite : attaques Axios 31 mars 2026, Shai-Hulud worm sept 2025, CISA advisory 20 avril 2026  
> Applicable : **TOUTE commande d'install de package** sur tout projet Inaricom  
> Date creation : 2026-04-21

## Contexte

L'ecosysteme npm subit des attaques supply chain actives :
- **31 mars 2026** : Axios compromis (v1.14.1 + v0.30.4) par Sapphire Sleet (acteur etatique Coree du Nord). Dependance malveillante `plain-crypto-js@4.2.1` avec postinstall hook deployant un RAT cross-platform. 100M downloads/semaine exposes pendant 4h.
- **Septembre 2025** : Shai-Hulud worm auto-propagant, 500+ packages compromis (chalk, debug, strip-ansi, crowdstrike packages).
- **Mars 2026** : 20 packages populaires compromis (campagne "popular packages").

**Vecteur #1 d'attaque** : `postinstall` scripts dans `package.json` executes automatiquement pendant `npm install`.

## Regle absolue — Package manager

**Sur tout projet Inaricom, utiliser EXCLUSIVEMENT `pnpm` (v10+).**

### Pourquoi pnpm v10 et pas npm

| Protection | npm 11 | **pnpm 10** | Bun | Yarn 4 |
|------------|--------|-------------|-----|--------|
| Lifecycle scripts bloques par defaut | ❌ | ✅ | ✅ | ❌ |
| `strictDepBuilds` | ❌ | ✅ | ❌ | ❌ |
| `minimumReleaseAge` | ✅ v11.10+ | ✅ v10.16+ | ✅ v1.3+ | ✅ v4.10+ |
| `trustPolicy` (anti-downgrade) | ❌ | ✅ v10.21+ | ❌ | ❌ |
| Compat Node 100% | ✅ | ✅ | ⚠️ 95% | ✅ |

pnpm v10 est utilise par Vercel, Vue core team, Prisma depuis 2025-2026.

## Configuration obligatoire

### Globale (deja en place sur Phoenix2)

```bash
pnpm config set ignore-scripts true --global
pnpm config set minimum-release-age 10080 --global  # 7j en minutes
pnpm config set strict-dep-builds true --global
pnpm config set resolution-mode highest --global
```

Verifier avec `pnpm config list --global`.

### Projet-level (obligatoire dans chaque nouveau projet)

Creer `.npmrc` a la racine du projet :

```
ignore-scripts=true
min-release-age=10080
audit-level=moderate
```

## Regles de nommage versions

**Obligatoire** : versions EXACTES dans `package.json`.

```json
// ❌ INTERDIT
"dependencies": {
  "react": "^19.1.0",
  "vite": "~6.0.0"
}

// ✅ OBLIGATOIRE
"dependencies": {
  "react": "19.1.0",
  "vite": "6.0.12"
}
```

Utiliser `pnpm add --save-exact` ou editer `package.json` apres install.

## Commandes autorisees / interdites

### ✅ Commandes autorisees

```bash
pnpm install              # Install depuis package.json + lockfile
pnpm add <pkg>            # Ajoute un package
pnpm add -D <pkg>         # Ajoute en devDependencies
pnpm dlx <cmd>            # Execution one-shot (equivalent pnpm de npx)
pnpm dev                  # Scripts package.json
pnpm build
pnpm audit --prod         # Audit securite
pnpm audit fix            # Fix automatique si possible
pnpm why <pkg>            # Pourquoi ce package est installe
pnpm update               # Update selon package.json (respecte pinning)
```

### ❌ Commandes interdites

```bash
npm install               # Utilise npm cli (moins secure)
npm i                     # Idem
npx <cmd>                 # Peut pull un package frais malveillant
yarn add                  # Un autre package manager sur le meme projet
pnpm add <pkg>@latest     # Saute le min-release-age implicite
pnpm install --ignore-min-release-age    # Force install packages frais
pnpm install --unsafe-perm                # Force execution scripts
pnpm install --allow-scripts              # Idem
```

## Workflow d'install d'un nouveau package

1. **Verifier l'existence et la reputation** :
   ```bash
   pnpm view <pkg> versions    # Liste les versions
   pnpm view <pkg> time        # Dates de publication
   pnpm view <pkg> maintainers # Qui publie
   ```

2. **Check si compromis connu** :
   - Axios v1.14.1 ou 0.30.4 : COMPROMIS
   - `plain-crypto-js` : COMPROMIS (toute version)
   - Liste CISA : https://www.cisa.gov/news-events/alerts/2026/04/20/

3. **Install version pinee** :
   ```bash
   pnpm add <pkg>@<exact-version> --save-exact
   ```

4. **Audit post-install** :
   ```bash
   pnpm audit --prod --audit-level=moderate
   ```

5. **Check manuel dans le lockfile** :
   ```bash
   grep -E "axios@1\.14\.1|axios@0\.30\.4|plain-crypto-js" pnpm-lock.yaml
   # Doit retourner rien (exit 1)
   ```

6. **Commit le lockfile** :
   ```bash
   git add pnpm-lock.yaml package.json
   git commit -m "deps: add <pkg>@<version> (audit clean)"
   ```

## En cas de probleme

### Le min-release-age bloque un package

Si pnpm refuse car version trop recente :
- **NE PAS override** avec `--ignore-min-release-age`
- Prendre version N-1 stable
- Logger dans `.claude/logs/deps-issues.md` (package, version voulue, version retenue, date)

### L'audit trouve une vulnerabilite

| Severity | Action |
|----------|--------|
| **CRITICAL / HIGH** | STOP, rollback install, alerter dans rapport |
| **MODERATE** | Logger, continuer uniquement si pas d'impact prod |
| **LOW** | Logger, continuer |

### Suspect activity pendant install

Signaux d'alerte :
- Install qui dure anormalement longtemps (>30 min pour <1000 deps)
- Connexions sortantes suspectes (monitorer si possible)
- Messages d'erreur mentionnant des domaines inconnus
- `node_modules` qui contient des packages non listes dans `package.json`

Reaction : STOP immediat, kill process, `rm -rf node_modules`, `rm pnpm-lock.yaml`, refaire propre.

## Domaines a blocker au firewall (en prod)

Si firewall outbound disponible :
- `sfrclak[.]com` (C2 Axios attack)
- `142.11.206[.]72` port 8000 (C2 Axios attack)
- `webhook.site` domains (Shai-Hulud exfil)

## Escape hatches (exceptions justifiees uniquement)

Si un package critique DOIT etre installe malgre `min-release-age` (ex: patch securite urgent) :

```bash
# Override ponctuel, justifier dans le commit message
pnpm add <pkg>@<version> --ignore-min-release-age
# Ajouter note dans .claude/logs/deps-exceptions.md
```

Jamais pour un package qu'on ne connait pas deja.

## Packages Anthropic / Claude Code

Les skills et plugins `@anthropic-ai/*` sont une exception :
- Publies par Anthropic (compte verifie)
- Trusted par la doc Claude Code officielle
- **Mais quand meme soumis aux regles ci-dessus** (pinned, audited)

## Resume visuel

```
Developer
    │
    ├─> pnpm config global (.pnpm/config/rc)
    │     ├─ ignore-scripts=true      ← bloque postinstall (vecteur #1)
    │     ├─ min-release-age=10080    ← filtre packages <7j (fenetre d'attaque)
    │     ├─ strict-dep-builds=true   ← fail si script non autorise
    │     └─ resolution-mode=highest  ← versions stables
    │
    ├─> .npmrc projet (defense en profondeur)
    │     └─ meme chose
    │
    ├─> package.json
    │     └─ versions EXACTES (pas de ^ ou ~)
    │
    ├─> pnpm install
    │     └─> pnpm audit --prod obligatoire
    │
    └─> commit pnpm-lock.yaml
          └─ reproductibilite + trace
```

## References

- CISA Axios advisory : https://www.cisa.gov/news-events/alerts/2026/04/20/supply-chain-compromise-impacts-axios-node-package-manager
- Microsoft Defender blog : https://www.microsoft.com/en-us/security/blog/2026/04/01/mitigating-the-axios-npm-supply-chain-compromise/
- pnpm build script security : https://pnpm.io/configuration (ignore-scripts, strictDepBuilds)
- npm-security-best-practices : https://github.com/lirantal/npm-security-best-practices
- Elastic Labs Axios analysis : https://www.elastic.co/security-labs/axios-one-rat-to-rule-them-all
