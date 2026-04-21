#!/usr/bin/env python3
"""Verify logo presence on all staging pages"""
import subprocess

AUTH = 'staging:InaStg-Kx7m9vR2@pL'
BASE = 'https://staging.inaricom.com'
pages = ['/', '/shop/', '/articles/', '/contact/']

for page in pages:
    url = BASE + page
    r = subprocess.run(
        ['ssh', '-T', 'inaricom',
         f"curl -s -u '{AUTH}' '{url}' | grep -c 'cropped-LogoLong4White'"],
        capture_output=True, text=True, timeout=20
    )
    count = r.stdout.strip()
    status = 'OK' if count and int(count) > 0 else 'FAIL'
    print(f"  {page:15s} -> logo count={count} [{status}]")

# Also check no Design-sans-titre references remain in rendered HTML
print("\nChecking for obsolete logo references in homepage HTML...")
r = subprocess.run(
    ['ssh', '-T', 'inaricom',
     f"curl -s -u '{AUTH}' '{BASE}/' | grep -c 'Design-sans-titre'"],
    capture_output=True, text=True, timeout=20
)
count = r.stdout.strip()
print(f"  Design-sans-titre references: {count} {'[OK - clean]' if count == '0' else '[WARNING - still present]'}")
