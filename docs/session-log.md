# Session log Inaricom

> Journal des sessions de travail. Format : 3-5 bullets par jour max.
> But : reprise rapide `/resume` le lendemain.

---

## 2026-04-29 — Refonte cybersec + perf optim + QA Pass 4 GO

- **Refonte page `/accueil-cybersecurite/`** (commit `3f5dce3`) : 7 sections (Hero + StatsBar 4 chiffres choc + 6 vecteurs d'attaque + 4 tarifs publics audits + Methodology stepper + Comparator vs SaaS + CTA). Inspiration trustsec.xyz + stats Verizon DBIR / Astra / Mastercard / OFCS Suisse 2026.
- **VolumetricFog universel** (commit `25e3efc` du 28/04) : composant Canvas 2D theme-aware avec 7 orbes drift 38-70s + parallax centree. Integre dans les 3 islands. Suppression orbe argent central de MeshGradientNeutral (remplace par VolumetricFog silver).
- **Cards opacite 0.10 site-wide** (commit `61b4cde`) + **icones filled gold tint** au lieu de bordered (alignement homogene les 3 pages).
- **Particles tuning final** : taille 1×1 (anti-spermatozoide), trail decay 0.03, alpha 0.62±0.22, halo prop×10, dispersion DIE_RANGE 16, MAX_DRIFT_PX 70.
- **Vite manualChunks** (commit `4151ac4`) : extract react-vendor (60 KB gz cache stable) + three + tanstack-query → bundle homepage entry -29% (17 → 12 KB gz).
- **Retrait CTAs verbaux** site-wide (commit `ba37fde`) : decision Gilles "communication par ecrit pour l'instant" — "Parler a un expert" → "Ecrire a un expert", "Parlons-en →" → "Ecrivez-nous →".
- **QA Lighthouse 4 passes** sur staging (auth Apanel) :
  - Pass 1 : NO-GO, 5 bloquants identifies
  - Pass 2 : NO-GO, regression LCP (cause : eval JS bundle 5s)
  - Pass 3 : LCP -87% grace au lazy backgrounds (homepage 19.4s → 2.5s)
  - Pass 4 : **GO** — A11y 100/100 sur 6/6, TBT < 200ms (mode devtools), 0 axe critical/serious
- **Snippet 443 (fox v28) desactivee** : `wp post meta update 443 _active no` + `post_status draft`. Deprecated par FoxAnimationV29 React. Cause des erreurs `arc()` radius negatif sur IA + cybersec.
- **Merge dans `main`** (commit `884c106`) : 12 commits fast-forward `6bd4cd8..884c106 HEAD -> main`.

**Next session** :
- Bascule prod via `bash scripts/deploy-prod.sh` (code main pret, WP pages 1064/1078/985 attendent les nouveaux bundles)
- Ticket P1 `perf/fox-paths-worker` (1-1.5j) — chunker fox-paths.json 2.3 MB + Web Worker pour parsing
- Phase 3 — silos contenu cybersec (4 piliers SEO + clusters)

---

## 2026-04-17 — Refonte cadrage Phase 0

- Prompt systeme projet Claude.ai finalise v1 (pivot securite-first, 4 themes verrouilles)
- CSS verrouille : rouge #E31E24 (secu), or #FFD700 (IA), vert #10B981 (blog), bleu #00D4FF (institutionnel)
- 5 deep searches completees et integrees dans Project Knowledge : benchmark visuel, archi technique, workflow Claude Code, animation fox, contenu SEO/GEO
- Fondations `.claude/` creees : 5 sous-agents (frontend-kadence, woo-backend, seo-content, qa-visual, security-redteam), settings.json, .mcp.json
- CLAUDE.md v2 actualise (pivot secu + hex corrects + fonts Geist + Instrument Serif)
- Docs crees : architecture.md, backlog.md consolide, tech-debt.md
- Archive v1 : CLAUDE.v1.md + PLAN_REFONTE_INARICOM.v1.md

**Next session (18 avril)** :
- Deplacer les cles API hors Desktop (P1 securite)
- Enrichir `kadence-child/style.css` avec design tokens complets + 4 themes
- Creer `inaricom-core` plugin scaffold
- Audit Chrome MCP du site actuel

---
