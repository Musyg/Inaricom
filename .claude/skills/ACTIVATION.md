# Activation des skills - Inaricom

> Comment activer/desactiver les skills externes.
> Date : 17 avril 2026

## Skills actuellement actifs (7)

Ces skills sont presents directement sous `.claude/skills/<nom>/SKILL.md`
et sont donc automatiquement detectes et charges par Claude Code.

| Skill | Source | Ce que ca fait |
|-------|--------|----------------|
| `frontend-design` | anthropics-skills | Anti-AI slop, direction esthetique audacieuse |
| `web-artifacts-builder` | anthropics-skills | React + Tailwind + shadcn/ui multi-fichiers |
| `webapp-testing` | anthropics-skills | Playwright E2E + screenshots |
| `react-best-practices` | vercel-agent-skills | 62 rules perf React/Next.js |
| `web-design-guidelines` | vercel-agent-skills | 100+ rules design UX/accessibilite |
| `impeccable` | pbakaus-impeccable | 18 commandes design premium (/polish, /audit, /critique, /overdrive...) |
| `using-superpowers` | obra-superpowers | Bootstrap methodologie TDD + brainstorming + subagents |

Plus les 23 skills claudedesignskills deja presents (3D/animation).


## Bibliotheque disponible a la demande

Ces skills sont presents dans `.claude/skills/external/` mais **pas actives**.
Pour les activer, il suffit de copier leur dossier vers `.claude/skills/<nom>/`.

### Skills Anthropic restants (14)
Chemin source : `external/anthropics-skills/skills/<nom>/`

- `algorithmic-art` - p5.js generative art avec seeded randomness
- `brand-guidelines` - applique la charte Anthropic (utile pour creer la tienne)
- `canvas-design` - posters/art sur PDF/PNG avec philosophie design
- `claude-api` - construire apps via Claude API / Anthropic SDK
- `doc-coauthoring` - collaboration redaction 3-phases
- `docx` - generer/editer Word
- `internal-comms` - status reports, newsletters, FAQs
- `mcp-builder` - creer serveurs MCP haute qualite
- `pdf` - generer/fusionner/rotater PDFs
- `pptx` - generer/editer PowerPoint
- `skill-creator` - creer de nouveaux skills (**conflit potentiel** avec celui claudedesignskills)
- `slack-gif-creator` - GIFs animes optimises Slack
- `theme-factory` - 10 themes visuels pre-faits + theme a la volee
- `xlsx` - generer/editer Excel

### Skills Vercel restants (4)
Chemin source : `external/vercel-agent-skills/skills/<nom>/`

- `composition-patterns` - React compound components, evite prop drilling
- `deploy-to-vercel` - deploy direct depuis Claude
- `react-native-skills` - mobile perf + best practices
- `react-view-transitions` - transitions animees React View Transitions API
- `vercel-cli-with-tokens` - deploy CLI avec tokens


### Skills Superpowers restants (13)
Chemin source : `external/obra-superpowers/skills/<nom>/`

- `brainstorming` - dialog socratique avant code
- `dispatching-parallel-agents` - execute plusieurs agents en parallele
- `executing-plans` - batched execution avec checkpoints humains
- `finishing-a-development-branch` - workflow merge propre
- `receiving-code-review` - comment reagir aux reviews
- `requesting-code-review` - comment demander une review
- `subagent-driven-development` - fresh subagent par task (alternative a executing-plans)
- `systematic-debugging` - 4-phase root cause debugging
- `test-driven-development` - RED-GREEN-REFACTOR strict
- `using-git-worktrees` - workspaces isoles
- `verification-before-completion` - checkpoint avant de dire "fini"
- `writing-plans` - decoupe en micro-taches 2-5 min
- `writing-skills` - meta : creer tes propres skills

**Conseil** : `using-superpowers` (deja actif) bootstrap l'usage des autres automatiquement.
Si Claude Code bootstrappe Superpowers, il ira chercher les autres skills
dans `external/` si besoin - pas obligatoire de les tous activer.

### Skills Impeccable restants (16)
Chemin source : `external/pbakaus-impeccable/.claude/skills/<nom>/`

Chaque commande est un skill dedie :
- `adapt`, `animate`, `audit`, `bolder`, `clarify`, `colorize`, `critique`
- `delight`, `distill`, `harden`, `layout`, `optimize`, `overdrive`
- `polish`, `quieter`, `shape`, `typeset`

**Conseil** : impeccable (deja actif) joue le hub. Activer les sous-skills individuels
uniquement si Claude Code ne les trouve pas quand tu invoques la commande (ex: /polish).


### Skills gstack (Garry Tan) - 28 commandes
Chemin source : `external/garrytan-gstack/<nom>/`

gstack a une structure particuliere : chaque commande est au top-level du repo,
pas dans un sous-dossier `skills/`. Pour activer une commande spécifique :

```
xcopy /E /I external\garrytan-gstack\<commande> <commande>\
```

Commandes disponibles :
- `office-hours` - 6 questions YC avant code
- `plan-ceo-review`, `plan-eng-review`, `plan-design-review`
- `design-consultation`, `design-review`, `design-html`
- `review`, `devex-review`, `qa`, `qa-only`
- `ship`, `retro`, `learn`
- `cso` (security officer OWASP + STRIDE)
- `careful`, `freeze`, `guard`, `unfreeze` (safety guardrails)
- `investigate`, `autoplan`, `checkpoint`
- Plus une dizaine d'autres utilitaires

**Important** : gstack a besoin de Bun v1.0+ installe pour certaines commandes
(browse, open-gstack-browser). Verifier avant activation.

### Skills ui-ux-pro-max
Chemin source : `external/ui-ux-pro-max/.claude/skills/<nom>/`

7 skills : `banner-design`, `brand`, `design`, `design-system`, `slides`,
`ui-styling`, `ui-ux-pro-max` (hub principal)

### Shannon (pentester)
Chemin source : `external/shannon-pentest/SKILL.md`

**NE PAS activer par defaut**. Prerequis : Docker Desktop + WSL2 +
autorisation explicite de pentester la cible. A activer uniquement quand
une session de test est plannifiee.


## Comment activer un skill a la demande

Exemple : activer le skill Superpowers `brainstorming` parce que tu demarres
un nouveau chantier complexe et tu veux que Claude te challenge avant d'ecrire
du code.

### Methode 1 : commande simple CMD

```
cd C:\Users\gimu8\Desktop\Inaricom\.claude\skills
xcopy /E /I /Q /Y external\obra-superpowers\skills\brainstorming brainstorming\
```

### Methode 2 : demander a Claude Code

Tu peux aussi juste dire a Claude Code dans une session :
> "Active le skill brainstorming de superpowers dans le projet"

Et il fera la copie lui-meme.

### Apres activation

Le skill est immediatement disponible. Il te suffit de redemarrer la session
Claude Code (ou d'attendre la prochaine qui prendra en compte la nouvelle
structure).

## Comment desactiver un skill

Soit :
```
Remove-Item -Path .claude\skills\<nom> -Recurse -Force
```

Soit supprimer via Explorer. Le skill reste disponible dans `external/`.

## Pourquoi on ne les a pas tous actives

Chaque skill charge dans le contexte Claude Code consomme des tokens (metadata + triggers).
Activer 60+ skills polluerait le context window et degraderait la qualite des reponses.

La philosophie : activer le **strict minimum pertinent**, activer les autres a la demande
quand un cas de figure le justifie.

## Cas d'usage typiques

**Tu construis une landing page premium** :
→ `frontend-design`, `impeccable`, `web-design-guidelines` font deja le job.

**Tu debugges un bug vicieux** :
→ Active `external/obra-superpowers/skills/systematic-debugging`

**Tu veux structurer un gros chantier avec micro-taches** :
→ Active `external/obra-superpowers/skills/writing-plans` +
  `external/obra-superpowers/skills/subagent-driven-development`

**Tu fais un audit securite Inaricom** :
→ Active `external/garrytan-gstack/cso` pour l'audit OWASP + STRIDE

**Tu crees un PPTX pour un client** :
→ Active `external/anthropics-skills/skills/pptx`

**Tu transforms une image en icone SVG** :
→ Active `external/anthropics-skills/skills/canvas-design`

---

Date : 17 avril 2026
Par : Gilles Munier
Emplacement des sources : `.claude/skills/external/README.md` pour details complets
