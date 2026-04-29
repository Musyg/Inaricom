# Skills externes Inaricom

> 7 skills Claude Code de niveau "ultime" installes le 17 avril 2026.
> Ces skills enrichissent Claude Code automatiquement des que leur contexte est detecte.
> Aucune action requise de l'utilisateur pour les activer.

## Comment ca marche

Quand vous travaillez sur le projet Inaricom via Claude Code, le moteur :
1. Analyse votre demande
2. Charge automatiquement les skills pertinents depuis ce dossier
3. Applique leurs regles et workflows dans sa reponse

Pas besoin de se souvenir de commandes. Claude Code fait le matching.

## Pour Emre (ou quiconque clone le repo)

Rien a faire. Ces skills sont versionnes dans Git.
`git pull` suffit pour avoir le meme setup que Gilles.

---

## 1. anthropics-skills (officiel Anthropic)

**Source** : https://github.com/anthropics/skills
**Taille** : 9.9 MB, 17 skills
**Licence** : MIT / Anthropic source-available

**Skills inclus** :
- `frontend-design` - anti-AI slop, bold aesthetic direction (277k installs)
- `web-artifacts-builder` - React + Tailwind + shadcn/ui artifacts multi-fichiers
- `webapp-testing` - Playwright E2E + visual regression
- `brand-guidelines` - design system + typographie
- `skill-creator` - creer de nouveaux skills
- `mcp-builder` - creer des serveurs MCP
- `canvas-design`, `algorithmic-art`, `theme-factory` - creatif visuel
- `docx`, `pdf`, `pptx`, `xlsx` - generation documents
- `internal-comms`, `doc-coauthoring` - redaction pro
- `slack-gif-creator`, `claude-api`

**Declenchement automatique** : toute demande de creation frontend, composant,
landing page, dashboard, artifact, ou document.

---

## 2. vercel-agent-skills (Vercel Labs officiel)

**Source** : https://github.com/vercel-labs/agent-skills
**Taille** : 0.8 MB
**Licence** : MIT
**Stars GitHub** : 21k+, 150k installs/semaine

**Skills inclus** :
- `vercel-react-best-practices` - 62 rules perf React/Next.js, 8 categories
- `vercel-web-design-guidelines` - 100+ rules (Apple HIG + Material 3 + WCAG 2.2)
- `vercel-nextjs-app-router-patterns` - Server vs Client Components
- `vercel-react-composition-patterns` - compound components
- `vercel-deploy` - deploy direct depuis Claude

**Declenchement automatique** : toute demande React, Next.js, optimisation perf,
Core Web Vitals, bundle size.

---

## 3. obra-superpowers (Jesse Vincent / Prime Radiant)

**Source** : https://github.com/obra/superpowers
**Taille** : 0.7 MB, 143 files
**Licence** : MIT
**Stars GitHub** : 89k

**Philosophie** : Framework methodologique qui transforme Claude Code
d'"autocomplete intelligent" en "senior developer discipline".
Utilise la methodologie comme iron law (pas de suggestion, mais enforcement).

**Skills cles** :
- `brainstorming` - dialog socratique avant de coder, refine requirements
- `writing-plans` - decoupe en micro-taches 2-5 min avec paths + verifications
- `subagent-driven-development` - un subagent frais par tache, review 2 etages
- `test-driven-development` - enforce RED-GREEN-REFACTOR strict
- `using-git-worktrees` - workspace isole, baseline verte obligatoire
- `systematic-debugging` - 4 phases root-cause (pas de patch symptome)
- `writing-skills` - meta-skill pour creer tes propres skills

**Declenchement automatique** : toute demande impliquant "build X", "fix bug",
"implement feature", "debug", "design".

---

## 4. pbakaus-impeccable (Paul Bakaus)

**Source** : https://github.com/pbakaus/impeccable
**Taille** : 9.8 MB, 638 files
**Licence** : MIT
**Stars GitHub** : 10k en 3 semaines (explosion mars 2026)

**Extension** du `frontend-design` Anthropic avec deeper expertise + anti-patterns.

**18 commandes design** :
- `/audit` - accessibility + perf + responsive
- `/polish` - final pass avant ship
- `/critique` - UX review hierarchie/clarte/emotion
- `/distill` - strip to essence, retire le superflu
- `/normalize` - aligne sur design system
- `/animate` - motion purposeful (pas decoratif)
- `/colorize` - strategic color sur monochrome
- `/bolder` - amplifie safe & boring
- `/quieter` - calme les designs agressifs
- `/delight` - moments de joie memorables
- `/typeset` - fix fonts, hierarchy, sizing
- `/layout` - fix spacing + visual rhythm
- `/harden` - error handling + i18n + edge cases
- `/optimize` - perf improvements
- `/extract` - pull reusable components + design tokens
- `/adapt` - adapte breakpoints
- `/overdrive` - **mode extreme, push maximal design**
- `/impeccable teach` - setup context design du projet

**Declenchement automatique** : frontend, UI, design, polish, audit.

---

## 5. garrytan-gstack (Garry Tan, CEO Y Combinator)

**Source** : https://github.com/garrytan/gstack
**Taille** : 7.9 MB, 430 files
**Licence** : MIT
**Stars GitHub** : 66k

**Philosophie** : "Virtual engineering team" - 28 slash commands qui activent
des roles specialises (CEO, Designer, Eng Manager, Release Manager, QA, CSO).

**Claim validable** : Garry Tan a shipe 600k+ lignes de code production en 60 jours
avec ce setup, part-time, pendant qu'il dirige YC full-time.

**Commandes principales (extrait)** :
- `/office-hours` - 6 questions forcees YC qui challengent ton scope avant code
- `/autoplan` - chaine CEO review + design + eng review en une commande
- `/plan-ceo-review` - product review : Expand/Selective/Hold/Reduce
- `/plan-eng-review` - lock architecture, data flow, edge cases
- `/plan-design-review` - senior designer : note 0-10, detecte AI slop
- `/design-consultation` - build complete design system from scratch
- `/design-review` - designer-engineer hybrid, fix atomique
- `/review` - staff engineer, auto-fix + flag race conditions
- `/qa` - QA lead, ouvre un VRAI navigateur, teste ton app
- `/cso` - Security Officer : OWASP + STRIDE audits
- `/ship` - release engineer : sync main, tests, ouvre PR
- `/retro` - engineering retrospective
- `/learn` - memoire persistante cross-session
- `/careful`, `/freeze`, `/guard` - safety guardrails

**Attention** : gstack a des hooks auto-update qui tournent a chaque session.
Pour les desactiver, voir `garrytan-gstack/README.md` section telemetry/updates.

**Declenchement automatique** : planification, review, QA, release, securite.

---

## 6. ui-ux-pro-max (NextLevelBuilder)

**Source** : https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
**Taille** : 10.6 MB, 326 files
**Licence** : MIT
**Stars GitHub** : 29k

**Contenu** : searchable design database unique au monde :
- 50+ UI styles
- 97 color palettes
- 57 font pairings
- 99 UX guidelines
- 25 chart types
- 9 tech stacks supportes

**Workflow** : Claude query la database via Python CLI (scripts/search.py).
- Step 1 : Analyse requirements (product type, keywords, industry, stack)
- Step 2 : Generate design system (avec reasoning)
- Step 3 : Propose composants cibles
- Step 4 : Implement avec tokens coherents

**Declenchement automatique** : design system, palette couleurs, font pairing,
chart selection, UX rules.

---

## 7. shannon-pentest (Keygraph, wrapper par unicodeveloper)

**Source** : https://github.com/unicodeveloper/shannon
**Taille** : 0.04 MB (wrapper), Shannon Lite installe via Docker a l'activation
**Licence** : AGPL-3.0 (Shannon Lite core)
**Benchmark XBOW** : 96.15% exploit success rate (100/104)

**Ce que c'est** : autonomous AI pentester qui execute de vrais exploits
pour prouver les vulnerabilites (white-box, source-aware).

**Couverture** : 50+ types de vulnerabilites, 5 categories OWASP (injection,
XSS, auth bypass, authz, SSRF). Rapport CVSS 3.1 + CWE + MITRE ATT&CK + PoC.

**Cout d'un run complet** : ~$50 en tokens + 1h30 compute
**Comparaison** : pentest humain equivalent = $10k-$50k + 1-2 semaines

**IMPORTANT - PREREQUIS** :
Shannon ne s'active pas automatiquement. Il faut :
1. Docker Desktop installe + WSL2 sur Windows
2. Autorisation explicite de pentester la cible (loi suisse : art. 143 CP)
3. Environnement isole (staging, pas production)
4. API key Anthropic configuree

**Declenchement** : manuel uniquement via `/shannon` ou prompt explicite
du type "run a pentest against..."

**Use case Inaricom** : peut devenir une offre commerciale "pentest continuous"
pour les clients PME - ton USP cybersec vs pentests annuels concurrents.

---

## Maintenance

### Mise a jour manuelle d'un skill

Pour mettre a jour un skill individuel :
```
cd .claude\skills\external
Remove-Item -Path <skill-name> -Recurse -Force
git clone --depth 1 <repo-url> <skill-name>
Remove-Item -Path <skill-name>\.git -Recurse -Force
```

### Mise a jour de tous les skills

```
scripts\update-skills.ps1
```
(Script a creer si besoin futur)

### Ajouter un nouveau skill

```
cd .claude\skills\external
git clone --depth 1 <repo-url> <nom-court>
Remove-Item <nom-court>\.git -Recurse -Force
# Puis documenter ici
```

### Desinstaller un skill

```
Remove-Item -Path .claude\skills\external\<nom> -Recurse -Force
```

---

## Desactivation temporaire

Si un skill pollue le contexte ou n'est pas pertinent, Claude Code peut etre
configure pour whitelister/blacklister via `.claude/settings.json`.

Voir : https://docs.claude.com/claude-code/settings

---

Date d'installation : 17 avril 2026
Par : Gilles Musy (Phoenix2)
Versions clones : HEAD au 2026-04-17
