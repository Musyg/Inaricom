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

**Cause racine identifiee** : `FoxAnimationV29` charge `fox-paths.json`
(**2.3 MB non chunked**) et execute `stitchSegments` en O(n²) sur le main
thread. Resultat :

- Fetch JSON 2.3 MB sans gzip optimal contribue au TTFB
- `JSON.parse` synchrone bloque ~200-400 ms sur mobile
- `stitchSegments` quadratique sur le tableau de paths bloque ~300-500 ms

Pre-existant (avant Pass 1), pas une regression introduite par les commits
Phase 2.X. Mais maintenant que tous les autres bottlenecks sont resolus, c'est
le dernier obstacle au LCP < 2.5 s mobile.

**Solution recommandee** :

1. **Chunker `fox-paths.json`** en plusieurs fichiers paresseux (ex : par phase
   d'animation — 4-6 fichiers de ~400 KB chacun, charges en sequence pendant
   l'animation). Reduit le fetch initial a ~400 KB.
2. **Web Worker pour `JSON.parse` + `stitchSegments`** : deplacer dans un
   `fox-paths.worker.ts` (Vite + Rolldown supportent `?worker` import suffix).
   Le main thread reste libre, le canvas commence a animer des que le 1er
   chunk est parse cote worker.
3. **Compression assets** : verifier que le serveur sert `fox-paths.json` en
   `Content-Encoding: gzip` ou `br` (audit Pass 1 indiquait absence du header).

**Impact attendu** : LCP homepage mobile **2.5 s -> ~1.8-2.0 s**. Bonus : TBT
mobile post-LCP qui etait ~9 s tombe aussi (parsing + stitching off-main).

**Effort** : ~1-1.5 jour (chunking + worker + compression server check).

**Liens** :

- Composant : `react-islands/src/components/hero/FoxAnimationV29.tsx`
- Asset : `fox-animation/fox-paths.json` (~2.3 MB)
- Audit Pass 4 : staging.inaricom.com - 29 avril 2026 (LCP mobile 2529 ms)
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
