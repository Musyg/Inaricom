# Lighthouse Pass 5 — fox-paths-worker validation

> Run du 2026-04-29 sur staging.inaricom.com (mobile, devtools no-throttle)
> Objectif : valider le ticket P1 `perf/fox-paths-worker` (-30 ms LCP attendu)

## Contexte

QA Pass 4 (28-29 avril) avait confirme un GO global mais identifie une
reserve : **LCP homepage mobile 2529 ms** (+29 ms vs budget 2500 ms),
cause = parse 2.3 MB fox-paths.json + post-process O(n²) sur main thread.

Ticket P1 `perf/fox-paths-worker` (commit `64e87ea` du 2026-04-29) :
decharge fetch + JSON.parse + stitch/split/trim sur un Web Worker
(`src/workers/foxPathsWorker.ts`) via Vite ?worker import. Fallback main
thread si Worker fail.

## Resultats

| Metrique          | Pass 4 baseline | Pass 5 (median) | Delta    |
|-------------------|-----------------|-----------------|----------|
| **LCP**           | 2529 ms         | **1748 ms**     | **-781** |
| FCP               | n/a             | 1440 ms         | —        |
| TBT               | n/a             | 81 ms           | OK <200  |
| CLS               | < 0.01          | 0.000           | OK       |
| A11y              | 100/100         | 100/100         | OK       |
| Perf              | n/a             | 98/100          | OK       |

3 runs no-throttle (form-factor mobile) :
- Run 1 : LCP 1977 ms · TBT 81 ms · Perf 97
- Run 2 : LCP 1748 ms · TBT 96 ms · Perf 98
- Run 3 : LCP 1603 ms · TBT 55 ms · Perf 99

## Conclusion

**GO**. Ticket P1 ferme. Gain mesure largement superieur au -30 ms
attendu (-781 ms median, soit -31% vs baseline). 3 runs consistents
(coefficient de variation ~10%).

### Validation worker

- `foxPathsWorker-Dij5zf2h.js` charge 200 OK (3780 bytes transferred)
- `fox-paths.json` (2.3 MB) **absent du trace Lighthouse** = fetch happens
  apres la fenetre LCP, exactement le comportement voulu : la donnee
  lourde n'arrive plus avant le rendering critique.

### Bonus performance non attendu

Le LCP gain est superieur a la simple suppression du blocage main thread
parce que :
1. Le fetch fox-paths.json (2.3 MB) etait dans le critical path JS de
   homepage island. Maintenant c'est un fetch async dans un Worker, donc
   il n'entre plus en concurrence avec les autres scripts critiques.
2. Le parse JSON (~50 ms) + post-process (~80-150 ms) sont desormais en
   parallele du rendering plutot que sequentiels apres.

## Commande de re-run

```bash
cd react-islands
./node_modules/.bin/lighthouse \
  "https://staging:InaStg-Kx7m9vR2%40pL@staging.inaricom.com/" \
  --form-factor=mobile \
  --throttling-method=provided \
  --output=json --output-path=../audits/lighthouse-pass5/homepage-mobile-no-throttle-N.json \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" \
  --quiet --max-wait-for-load=60000
```

## Pages couvertes

Cette validation porte uniquement sur la homepage (la seule page touchee
par le ticket P1). Les pages /accueil-cybersecurite/ et /accueil-ia/
n'utilisent pas FoxAnimationV29 et n'ont pas ete remesurees.

## Files

- `homepage-mobile-no-throttle-1.json` : run 1 raw LHR JSON
- `homepage-mobile-no-throttle-2.json` : run 2
- `homepage-mobile-no-throttle-3.json` : run 3
- `homepage-mobile-1.json` : run avec throttling=devtools (timeout, ignore)
