# Phase 2.0 — Downgrades / issues log

> Date : 2026-04-21
> Contexte : min-release-age=10080 (7j) bloque plusieurs packages frais publies pendant la fenetre d'install.

## Packages downgrades vs derniere version

| Package | Version voulue (latest) | Version retenue | Raison | Age version retenue |
|---------|--------------------------|-----------------|--------|---------------------|
| `@tanstack/react-query` | 5.99.2 (2026-04-19) | **5.95.0** | min-release-age | ~7-10j OK |
| `@tailwindcss/vite` | 4.2.4 (2026-04-21) | **4.2.2** (2026-03-18) | min-release-age | 34j |
| `tailwindcss` | 4.2.4 (2026-04-21) | **4.2.2** (2026-03-18) | min-release-age | 34j |
| `eslint-plugin-react-hooks` | 7.1.1 (2026-04-17) | **7.0.1** (2025-10-24) | min-release-age | ~6 mois |
| `typescript` | 6.0.3 (2026-04-17) | **6.0.2** (2026-03-23) | min-release-age | 29j |
| `vite` | 8.0.9 (2026-04-20) | **8.0.8** (2026-04-09) | min-release-age | 12j |

## Regle appliquee

Conforme a `.claude/rules/npm-security.md` :
- AUCUN `--ignore-min-release-age`
- Prise de la version N-1 (ou N-2 si N-1 encore trop fresh)
- Logge ici pour trace

## Audit post-install

```
pnpm audit --prod --audit-level=moderate
→ No known vulnerabilities found
```

## Check compromised packages

```
grep -E "axios@1\.14\.1|axios@0\.30\.4|plain-crypto-js" pnpm-lock.yaml
→ 0 matches (clean)
```

## Packages a re-tester dans ~7j

Apres le 28.04.2026, retester si `@tanstack/react-query@5.99.2`, `tailwindcss@4.2.4`, `vite@8.0.9`, `typescript@6.0.3`, `eslint-plugin-react-hooks@7.1.1` sont matures et stables → bump manuel via `pnpm up <pkg>@<version>` + audit + commit.
