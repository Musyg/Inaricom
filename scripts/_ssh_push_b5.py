#!/usr/bin/env python3
"""Push 347-B5 to staging and cleanup logo PNGs"""
import subprocess
import sys

def ssh(cmd, timeout=60):
    """Run SSH command and return (stdout, stderr, rc)"""
    r = subprocess.run(
        ['ssh', '-T', 'inaricom', cmd],
        capture_output=True, text=True, timeout=timeout
    )
    if r.stdout:
        print(r.stdout, end='')
    if r.stderr:
        print(r.stderr, end='', file=sys.stderr)
    return r.returncode

def scp(local, remote, timeout=30):
    """SCP file to server"""
    r = subprocess.run(
        ['scp', local, f'inaricom:{remote}'],
        capture_output=True, text=True, timeout=timeout
    )
    if r.returncode != 0:
        print(f"SCP failed: {r.stderr}", file=sys.stderr)
    return r.returncode

print("=== Step 1: Upload files ===")
scp('C:/Users/gimu8/Desktop/Inaricom/audits/347-REFACTORED-B5.css', '/tmp/347-REFACTORED-B5.css')
scp('C:/Users/gimu8/Desktop/Inaricom/scripts/_push_b5_nokses.sh', '/tmp/_push_b5_nokses.sh')
scp('C:/Users/gimu8/Desktop/Inaricom/scripts/_force_resync.sh', '/tmp/_force_resync.sh')

print("\n=== Step 2: Push 347 to DB ===")
rc = ssh('chmod +x /tmp/_push_b5_nokses.sh /tmp/_force_resync.sh && bash /tmp/_push_b5_nokses.sh')
print(f"\nPush exit code: {rc}")

print("\n=== Step 3: Force resync ===")
rc = ssh('bash /tmp/_force_resync.sh')
print(f"\nResync exit code: {rc}")

print("\n=== Step 4: Delete obsolete logo PNGs ===")
rc = ssh(
    'cd ~/inaricom.com/web-staging && '
    'ls -la wp-content/uploads/2026/01/Design-sans-titre-1[3567]*.png 2>&1 && '
    'rm -f wp-content/uploads/2026/01/Design-sans-titre-13*.png '
    'wp-content/uploads/2026/01/Design-sans-titre-15*.png '
    'wp-content/uploads/2026/01/Design-sans-titre-16*.png '
    'wp-content/uploads/2026/01/Design-sans-titre-17*.png && '
    'echo "Deleted obsolete PNGs" && '
    'ls wp-content/uploads/2026/01/Design-sans-titre-1[3567]*.png 2>&1 || echo "Confirmed: no more variant PNGs"'
)
print(f"\nCleanup exit code: {rc}")

print("\n=== Step 5: Verify logo on homepage ===")
rc = ssh(
    "curl -s -u 'staging:InaStg-Kx7m9vR2@pL' https://staging.inaricom.com/ | grep -c 'cropped-LogoLong4White'"
)
print(f"Logo check exit code: {rc}")

print("\n=== DONE ===")
