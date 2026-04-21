"""Remplir la section STAGING du .env pour autonomie Claude Code."""
import pathlib

p = pathlib.Path(r'C:\Users\gimu8\Desktop\Inaricom\.env')
c = p.read_text(encoding='utf-8')

old = """# === STAGING (pas encore configure) ===
STAGING_URL=''
STAGING_SSH_HOST=''
STAGING_SSH_USER=''
STAGING_SSH_PORT=''
STAGING_SSH_KEY_PATH=''"""

new = """# === STAGING (Infomaniak clone prod, MEME serveur SSH que prod) ===
STAGING_URL='https://staging.inaricom.com'
STAGING_SSH_HOST='web24.swisscenter.com'
STAGING_SSH_USER='toriispo'
STAGING_SSH_PORT='22'
STAGING_SSH_KEY_PATH='C:/Users/gimu8/.ssh/inaricom_swisscenter'
# HTTP Basic Auth (applique par mu-plugin staging-hardening.php)
STAGING_BASIC_AUTH_USER='staging'
STAGING_BASIC_AUTH_PASS='InaStg-Kx7m9vR2@pL'
# URL avec credentials encoded pour curl/wget/playwright direct (no popup)
STAGING_URL_AUTH='https://staging:InaStg-Kx7m9vR2%40pL@staging.inaricom.com'
# Header Basic Auth precalcule (base64 de 'staging:InaStg-Kx7m9vR2@pL')
STAGING_BASIC_AUTH_HEADER='Basic c3RhZ2luZzpJbmFTdGctS3g3bTlyUjJAcEw='
# Path serveur staging (clone prod dans sous-dossier web-staging)
STAGING_WP_PATH='/home/toriispo/inaricom.com/web-staging'"""

if old not in c:
    print('[ERREUR] Section STAGING cible non trouvee')
    exit(1)

c = c.replace(old, new)
p.write_text(c, encoding='utf-8')
print('[OK] Section STAGING remplie dans .env')

# Verification base64
import base64
expected = base64.b64encode(b'staging:InaStg-Kx7m9vR2@pL').decode('ascii')
print(f'[VERIF] Base64 header = {expected}')
