#!/usr/bin/env python3
"""Test SSH connectivity to inaricom"""
import subprocess
r = subprocess.run(
    ['ssh', '-T', '-o', 'ConnectTimeout=10', 'inaricom', 'echo CONNECTED'],
    capture_output=True, text=True, timeout=20
)
print(f"stdout: {repr(r.stdout)}")
print(f"stderr: {repr(r.stderr)}")
print(f"rc: {r.returncode}")
