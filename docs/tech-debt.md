# Dette technique Inaricom

> Format : `[P1/P2/P3] titre — impact — effort — ticket`
> Budget : 20% du temps hebdo sur P1/P2. Review avant chaque release majeure.

Derniere MAJ : 29 avril 2026

---

## P1 — Critique (a traiter sous 2 semaines)

### `perf/fox-paths-worker` — LCP homepage mobile borderline

**Source** : QA Lighthouse Pass 4 du 29 avril 2026 — staging.inaricom.com.

**Probleme** : LCP homepage mobile = **2529 ms** (+29 ms au-dessus du seuil
2500 ms). Les 5 autres configs (homepage desktop, IA mobile/desktop, cybersec
mobile/desktop) sont GO avec LCP entre 1.5 s et 2.5 s. Impact CWV : "Needs
Improvement" sur la page la plus exposee aux nouveaux visiteurs mobile.

#### Diagnostic precis (corrige vs estimation initiale)

`fox-paths.json` fait **84 KB sur disque** (`Content-Length: 84242` verifie
sur staging — pas 2.3 MB comme l'agent QA Pass 4 l'a initialement reporte).
Le 2.3 MB etait la taille **memoire** apres parse (chaque `[x, y]` JSON
devient un objet `{x: ..., y: ...}` JS, expansion ~10x).

Donc le bottleneck **n'est pas le reseau** (84 KB / ~20 KB gz = <100 ms en 4G
simule). Les vrais blockers main thread :

1. `JSON.parse(82 KB)` : ~30-80 ms sur mobile mid-range
2. **Transformation `paths[].subpaths[][x, y]` → `Segment[]`** dans
   `FoxAnimationV29.tsx:896-905` : iteration sur ~3000-5000 points, allocations
   d'objets {x, y} : 80-150 ms
3. **`stitchSegments(segments, threshold)` O(n²)** dans
   `FoxAnimationV29.tsx:227-272` : double boucle sur les segments avec calcul
   `Math.hypot` × 4 par paire. Avec ~80 segments c'est ~6400 hypot/iteration ×
   plusieurs iterations (while changed) = **300-500 ms sur mobile**
4. `splitSegments` + `trySplitRoundtrip` qui suivent : ~50-100 ms

**Total main-thread block** : ~500-800 ms apres LCP, ce qui pousse la fenetre
"largest contentful element stable" au-dela de 2.5 s.

#### Solution : Web Worker pour parse + transform + stitch

**Pas besoin de chunker** (84 KB est negligeable cote reseau). Un seul
`fox-paths.worker.ts` qui fait tout off-main :

```
[Worker]                              [Main thread]
fetch fox-paths.json                  postMessage 'init' → worker
JSON.parse                            (continue rendering hero,
transform paths → Segment[]            CTAs, sections — non bloque)
stitchSegments O(n²)                  
filter minSegmentLength               
trySplitRoundtrip + trim              
postMessage 'ready' → main ──────►    worker.onmessage : segments prets
                                      → calculatePathLength sur main (rapide)
                                      → start RAF animation
```

#### Plan d'action detaille (8h estimees)

**Step 1 — Extraction types + helpers purs (1h)**
- Creer `react-islands/src/components/hero/fox-paths.types.ts` :
  - `type Pt = { x: number; y: number }`
  - `type Segment = { points: Pt[]; color: string; parentId: string; length?: number }`
  - `type FoxPathsData = { canvas: [number, number]; paths: Array<{...}> }`
  - `type WorkerMsgIn = { type: 'init'; jsonUrl: string; stitchThreshold: number; minSegmentLength: number; trimRatio: number }`
  - `type WorkerMsgOut = { type: 'ready'; canvas: [number, number]; segments: Segment[] } | { type: 'error'; message: string }`

**Step 2 — Creer le worker (3h)**
- Creer `react-islands/src/components/hero/fox-paths.worker.ts`
- Importer types depuis fox-paths.types.ts
- Implementer `onmessage` qui :
  1. fetch + json.parse
  2. transform paths → segments (copie du code FoxAnimationV29.tsx:896-905)
  3. stitchSegments (copie de FoxAnimationV29.tsx:227-272)
  4. calculatePathLength + filter
  5. trySplitRoundtrip + trim cusps (copie de FoxAnimationV29.tsx:911-...)
  6. postMessage ready
- Ne PAS importer React ni rien lie au DOM (worker context)

**Step 3 — Refactor FoxAnimationV29.tsx (2h)**
- Remplacer la chaine `loadJson = fetch(...).then(...)` (L890) par :
  ```ts
  const Worker = new Worker(
    new URL('./fox-paths.worker.ts', import.meta.url),
    { type: 'module' },
  )
  Worker.postMessage({ type: 'init', jsonUrl: CONFIG.jsonUrl, ... })
  Worker.onmessage = (e) => {
    if (e.data.type === 'error') { /* fallback main thread */ return }
    originalWidth = e.data.canvas[0]
    originalHeight = e.data.canvas[1]
    segments = e.data.segments
    // continue : calculatePathLength, RAF setup, etc.
  }
  ```
- Garder un **fallback main-thread** si Worker echoue (CSP strict, browser
  vieux, etc.) : on importe la meme logique pure depuis fox-paths.types.ts
  helpers et on l'execute en async chunks via `requestIdleCallback`.

**Step 4 — Tests (1h)**
- Visuel : fox doit etre identique (frame par frame) — capture animation 5 s
  avant/apres et compare.
- Network : verifier que le worker fait bien le fetch (pas 2× le main thread).
- Lighthouse : staging mobile homepage avant/apres. Cible LCP < 2.3 s.

**Step 5 — Cleanup + commit + deploy staging (1h)**
- Supprimer le code transform/stitch redondant de FoxAnimationV29.tsx (sauf
  fallback)
- Commit avec message detaille
- Deploy staging + test
- Re-run Lighthouse Pass 5

#### Acceptance criteria

- [ ] `fox-paths.worker.ts` existe et fait fetch + parse + stitch + filter
- [ ] FoxAnimationV29.tsx utilise le worker via postMessage
- [ ] Fallback main-thread present (try/catch + branche alternative)
- [ ] Visuel fox identique (pas de regression animation)
- [ ] Lighthouse staging mobile homepage : LCP **< 2.3 s** (gain >= 200 ms)
- [ ] TBT post-LCP < 200 ms (etait ~500-800 ms)
- [ ] Bundle worker < 5 KB gzipped (le code est compact)
- [ ] Aucune regression cybersec / IA (FoxAnimationV29 reste homepage-only)

#### Rollback

Si regression visuelle ou perf en prod : revert le commit. Le code
`FoxAnimationV29.tsx` original (Phase 2.0-2.4) est preserve en `git log` jusqu'au
commit precedent ce ticket.

#### Bonus (post-merge si fenetre)

- Compression `fox-paths.json` cote serveur : verifier `Content-Encoding: gzip`
  ou `br`. Si absent, ajouter dans `.htaccess` ou `staging-hardening.php`.
  Gain : 84 KB → ~20 KB gz (~75% economisses).
- Generer un fox-paths.bin (binary protocol au lieu de JSON) : skipper le
  parse JSON entierement. Gain : ~30-50 ms supplementaires sur mobile.
  Effort : 0.5-1 j supplementaire. **Pas necessaire si Worker suffit**.

#### Liens

- Composant : `react-islands/src/components/hero/FoxAnimationV29.tsx`
  - L227-272 : stitchSegments (a deplacer dans worker)
  - L890-907 : fetch + parse + transform + stitch chain (a refactorer)
- Asset : `kadence-child/assets/data/fox-paths.json` (84 KB sur disque)
- Audit Pass 4 : staging.inaricom.com - 29 avril 2026 (LCP mobile 2529 ms)
- Vite Worker docs : https://vite.dev/guide/features.html#web-workers
- A synchroniser comme issue GitHub quand `gh` sera installe

---

## P2 — Important (a traiter ce trimestre)

- **[P2] Fox animation Canvas 2D v20 — 10-20 fps mobile documente** — Migration OGL + glow additif HDR prevue (voir Recherche 4). Impact : perf mobile + Lighthouse. Effort : 6-8 jours.
- **[P2] Hex couleurs hardcodes dans certains fichiers historiques** — Audit `grep -r "#E31E24\|#FFD700\|#10B981\|#00D4FF"` puis remplacement par `var(--inari-red)` etc. Effort : 2-4h.
- **[P2] Formulaire WPForms homepage sans automation email** — Lead magnets non envoyes automatiquement. Impact : leads perdus. Effort : 1-2h.
- **[P2] Passerelle paiement Stripe pas configuree** — Blocant pour ecommerce. Effort : 2-4h.
- **[P2] Pas de backup automatique configure** — Risque perte donnees. Effort : 2h (UpdraftPlus + chiffrement + test restore).
- **[P2] Aucun headers securite active** — CSP, HSTS, X-Frame-Options absents. Impact : securite + credibilite cybersec. Effort : 1 jour (Report-Only 2 semaines + enforce).
- **[P2] Cles API pas encore chiffrees au repos** — deplacees hors Desktop mais en clair. Upgrade recommande : 7-Zip password OU Bitwarden/1Password. Effort : 30min-2h selon option.
- **[P2] Cles API potentiellement exposees historiquement** — certaines cles (GitHub, Cloudflare, etc.) peuvent avoir ete visibles dans des screenshots/chats passes. **Rotation recommandee** sur les critiques. Effort : 1-2h.

## P3 — Nice to have (a traiter quand fenetre ouvre)

- **[P3] 23 skills claudedesignskills inclus mais non audites** — Sous-ensemble probablement utile (threejs, gsap, r3f), autres inutilisables pour Kadence. Effort : 1h review + cleanup.
- **[P3] `inaricom-digikey` plugin non versionne dans repo principal** — Isole dans `/inaricom-digikey/` — faire choix : monorepo ou sub-repo. Effort : decision + action.
- **[P3] Scripts `regenerate-json.js`, `convert-full-to-clean.js` dans `fox-animation/`** — Orphelins. Effort : doc + decision keep/move.
- **[P3] Pas de `phpcs.xml.dist` ni `.editorconfig`** — Incoherence code entre sessions. Effort : 30 min.

---

## Archive (traite)

### 2026-04-17
- **[P1] Cles API en clair sur Desktop** — RESOLU : deplacees vers `C:\Users\gimu8\.secrets\API KEYS\` (dossier hidden, hors Desktop, hors OneDrive). README.md ajoute avec liste cles + plan upgrade chiffrement. **Note** : le niveau de securite est passe de 0/3 a 1/3 (basique). Upgrade a `7-Zip password` ou `Bitwarden` trace en P2.
- **[P1] CLAUDE.md v1 references** — RESOLU : audit grep effectue, seules references legitimes trouvees (session-log trace l'archivage + PLAN_REFONTE annonce remplacer v1 + tech-debt ticket qui se resolvait lui-meme). Aucune pollution reelle. P1 degradese en non-issue.
- **[P1] .gitignore + audit git** — RESOLU : `.gitignore` verifie fonctionnel (pattern `.env` actif). Historique git propre (1 commit "Add fox animation assets", aucun secret track). Repo pret a committer.
