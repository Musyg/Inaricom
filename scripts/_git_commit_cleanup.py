#!/usr/bin/env python3
"""Git commit for logo cleanup"""
import subprocess
import os

os.chdir('C:/Users/gimu8/Desktop/Inaricom')

def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
    if r.stdout:
        print(r.stdout, end='')
    if r.stderr:
        print(r.stderr, end='')
    return r.returncode

print("=== Git status ===")
run('git status --short')

print("\n=== Git diff --stat ===")
run('git diff --stat')

print("\n=== Staging files ===")
run('git add audits/snippet-63-theme-neutre.css audits/347-REFACTORED-B4-PLUS-IREMAP.css audits/347-REFACTORED-B5.css')

print("\n=== Commit ===")
msg = """Phase 2.0 Etape 0: cleanup reliquats logo variants

- snippet-63: retrait comment logo argente, CSS swap deja nettoye
- 347 base (B4-PLUS-IREMAP): retrait 3 blocs content:url() logo swap (or/bleu/vert)
- 347 base: remplacement section 60e (background-image swap) par halo unique
- 347-B5 regenere via _build_347.py (102594 octets)
- Staging: 16 PNG variantes supprimees (Design-sans-titre-13/15/16/17 + thumbnails)
- Staging: verification logo rouge natif OK sur /, /shop/, /articles/, /contact/

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"""
run(f'git commit -m "{msg}"')

print("\n=== Post-commit status ===")
run('git status --short')
