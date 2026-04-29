#!/usr/bin/env python3
"""
patch_347_prod_cyan_to_royalblue.py
-----------------------------------
Patch snippet 347 (Custom CSS) en prod :
- Remplace #00d4ff (cyan) -> #0081f2 (royal blue)
- Remplace #00A8CC (cyan dark) -> #1b61a6 (royal blue dark)
- Remplace #4DE8FF (cyan light) -> #1a93fe (royal blue light)
- Remplace rgba(0, 212, 255, X) -> rgba(0, 129, 242, X)
- Remplace color: #0A0A0F (texte noir sur fond cyan) -> color: #FFFFFF (texte blanc sur fond royal blue)
  uniquement dans les 2 blocs identifies par commentaire (lignes ~3482 et ~3759).
- Met a jour les commentaires "cyan" -> "royal blue" pour coherence.

Le script lit le snippet via wp post get, applique les remplacements en
memoire, puis le pousse via wp post update + regenere le static cache file
uploads/custom-css-js/347.css.

Usage : python patch_347_prod_cyan_to_royalblue.py
"""

import subprocess
import sys
import re
from pathlib import Path

SSH_HOST = "inaricom"
PROD_PATH = "/home/toriispo/inaricom.com/web"
SNIPPET_ID = 347

LOCAL_TMP = Path("tmp/snippet-347-prod.css")
LOCAL_BACKUP = Path(f"tmp/snippet-347-prod.css.cyan-backup")
LOCAL_PATCHED = Path("tmp/snippet-347-prod-patched.css")


def run(cmd, capture=True):
    print(f"$ {cmd[:120]}{'...' if len(cmd) > 120 else ''}")
    r = subprocess.run(cmd, shell=True, capture_output=capture)
    if r.returncode != 0:
        stderr = r.stderr.decode("utf-8", errors="replace") if r.stderr else ""
        print(f"  STDERR: {stderr}")
        sys.exit(1)
    if not capture:
        return ""
    return r.stdout.decode("utf-8", errors="replace") if r.stdout else ""


def main():
    # 1. Pull snippet from prod
    print("=== 1. Pull snippet 347 depuis prod ===")
    out = run(
        f'ssh {SSH_HOST} "cd {PROD_PATH} && /usr/local/bin/wp post get {SNIPPET_ID} --field=post_content 2>/dev/null"'
    )
    LOCAL_TMP.parent.mkdir(parents=True, exist_ok=True)
    LOCAL_TMP.write_text(out, encoding="utf-8")
    LOCAL_BACKUP.write_text(out, encoding="utf-8")
    print(f"   Backup local : {LOCAL_BACKUP} ({len(out)} chars)")

    # 2. Apply patches
    print("\n=== 2. Patch en memoire ===")
    content = out

    # 2a. Cyan -> royal blue (color codes)
    replacements = [
        ("#00d4ff", "#0081f2"),
        ("#00D4FF", "#0081f2"),
        ("#00A8CC", "#1b61a6"),
        ("#00a8cc", "#1b61a6"),
        ("#4DE8FF", "#1a93fe"),
        ("#4de8ff", "#1a93fe"),
    ]
    for old, new in replacements:
        cnt = content.count(old)
        if cnt:
            content = content.replace(old, new)
            print(f"   {old} -> {new} : {cnt} replacements")

    # 2b. RGB tuple
    rgb_old = "0, 212, 255"
    rgb_new = "0, 129, 242"
    cnt_rgb = content.count(rgb_old)
    if cnt_rgb:
        content = content.replace(rgb_old, rgb_new)
        print(f"   RGB '{rgb_old}' -> '{rgb_new}' : {cnt_rgb} replacements")

    # 2c. Black text -> white text on bleu buttons (2 specific blocks)
    # Bloc 1 : ligne ~3482 dans le bloc THEME BLEU BOUTONS PRIMAIRES
    pattern_1 = "color: #0A0A0F !important; /* Texte sombre sur fond cyan */"
    replacement_1 = "color: #FFFFFF !important; /* Texte blanc sur fond royal blue */"
    if pattern_1 in content:
        content = content.replace(pattern_1, replacement_1)
        print(f"   Bloc 1 (boutons primaires) : noir -> blanc OK")
    else:
        print(f"   ATTENTION: pattern 1 introuvable")

    # Bloc 2 : ligne ~3752 dans le bloc dedie texte noir
    # On change le commentaire + transfere la regle vers blanc
    pattern_2 = (
        "/* Thème BLEU — Texte noir sur boutons cyan */\n"
        "[data-theme=\"bleu\"] .btn-primary-large,\n"
        "[data-theme=\"bleu\"] .btn-primary,\n"
        "[data-theme=\"bleu\"] .btn-submit,\n"
        "[data-theme=\"bleu\"] .btn-product:hover,\n"
        "[data-theme=\"bleu\"] .inari-hero-cta .btn-primary,\n"
        "[data-theme=\"bleu\"] .shop-cta .btn-primary-large {\n"
        "  color: #0A0A0F !important;\n"
        "}"
    )
    replacement_2 = (
        "/* Thème BLEU — Texte blanc sur boutons royal blue */\n"
        "[data-theme=\"bleu\"] .btn-primary-large,\n"
        "[data-theme=\"bleu\"] .btn-primary,\n"
        "[data-theme=\"bleu\"] .btn-submit,\n"
        "[data-theme=\"bleu\"] .btn-product:hover,\n"
        "[data-theme=\"bleu\"] .inari-hero-cta .btn-primary,\n"
        "[data-theme=\"bleu\"] .shop-cta .btn-primary-large {\n"
        "  color: #FFFFFF !important;\n"
        "}"
    )
    if pattern_2 in content:
        content = content.replace(pattern_2, replacement_2)
        print(f"   Bloc 2 (selectors dedies) : noir -> blanc OK")
    else:
        print(f"   ATTENTION: pattern 2 introuvable (skip ou format different)")

    # 2d. Comments cyan -> royal blue (cosmetique)
    comment_replacements = [
        ("/* Glow cyan */", "/* Glow royal blue */"),
        ("/* Bordures cyan */", "/* Bordures royal blue */"),
        ("/* Gradient cyan */", "/* Gradient royal blue */"),
    ]
    for old, new in comment_replacements:
        if old in content:
            content = content.replace(old, new)
            print(f"   commentaire {old.strip()} -> {new.strip()}")

    # Save patched
    LOCAL_PATCHED.write_text(content, encoding="utf-8")
    print(f"\n   Patched local : {LOCAL_PATCHED} ({len(content)} chars)")

    # 3. Verification : aucun cyan ne doit subsister dans les selectors bleu
    print("\n=== 3. Verification post-patch ===")
    remaining_cyan = re.findall(r"#00[dD]4[fF][fF]|#00[aA]8[cC][cC]|0,\s*212,\s*255", content)
    if remaining_cyan:
        print(f"   ECHEC: {len(remaining_cyan)} traces cyan restantes : {set(remaining_cyan)}")
        sys.exit(1)
    print(f"   Zero trace cyan restante OK")

    # 4. Push patched content to prod
    print("\n=== 4. Push patched -> prod (DB + cache file) ===")
    # Upload CSS via scp (binaire, evite tout probleme d'escape shell)
    tmp_css_remote = "/tmp/snippet-347-patched.css"
    run(f'scp "{LOCAL_PATCHED}" {SSH_HOST}:{tmp_css_remote}')

    # Script PHP autonome qui : (a) lit le fichier, (b) update post 347, (c) regenere static cache
    php_local = Path("tmp/patch-347.php")
    php_local.write_text(
        "<?php\n"
        "define('WP_USE_THEMES', false);\n"
        "require_once '/home/toriispo/inaricom.com/web/wp-load.php';\n"
        "$css = file_get_contents('/tmp/snippet-347-patched.css');\n"
        "if ($css === false) { echo 'FAIL: cannot read CSS file'; exit(1); }\n"
        "$res = wp_update_post(['ID' => 347, 'post_content' => $css], true);\n"
        "if (is_wp_error($res)) { echo 'FAIL DB: ' . $res->get_error_message(); exit(1); }\n"
        "echo \"DB update OK (post {$res})\\n\";\n"
        "$wrapped = \"<!-- start Simple Custom CSS and JS -->\\n<style>\\n\" . $css . \"\\n</style>\\n<!-- end Simple Custom CSS and JS -->\\n\";\n"
        "$cache_path = WP_CONTENT_DIR . '/uploads/custom-css-js/347.css';\n"
        "$bytes = file_put_contents($cache_path, $wrapped);\n"
        "if ($bytes === false) { echo 'FAIL: cannot write cache file'; exit(1); }\n"
        "echo \"Static cache regenere ({$bytes} bytes)\\n\";\n"
        "echo \"OK\";\n",
        encoding="utf-8",
    )
    php_remote = "/tmp/patch-347.php"
    run(f'scp "{php_local}" {SSH_HOST}:{php_remote}')
    out = run(f'ssh {SSH_HOST} "/usr/local/bin/php85 {php_remote} 2>&1; rm {php_remote}; rm {tmp_css_remote}"')
    print(f"   Output: {out.strip()}")
    if "OK" not in out:
        print(f"   ECHEC update : {out}")
        sys.exit(1)
    print(f"   DB update + static cache regenere OK")

    # 5. Cache flush + opcache reset
    print("\n=== 5. Cache flush + OPcache reset ===")
    run(f'ssh {SSH_HOST} "cd {PROD_PATH} && /usr/local/bin/wp cache flush 2>&1 | tail -1"')
    run(f'ssh {SSH_HOST} "echo \\"<?php opcache_reset();\\" > {PROD_PATH}/_op.php"')
    run('curl -s "https://inaricom.com/_op.php" --insecure -o /dev/null')
    run(f'ssh {SSH_HOST} "rm {PROD_PATH}/_op.php"')
    print("   OPcache reset OK")

    # 6. Verification static file content
    print("\n=== 6. Verification fichier static prod ===")
    sample = run(
        f'ssh {SSH_HOST} "head -c 500 {PROD_PATH}/wp-content/uploads/custom-css-js/347.css"'
    )
    print(f"   Premiers 500 chars du fichier prod :\n{sample}")

    # 7. Verification CSS live via curl
    print("\n=== 7. Verification CSS live via Cloudflare ===")
    css_live = run('curl -s "https://inaricom.com/web/wp-content/uploads/custom-css-js/347.css?ver=1" --insecure | head -c 200')
    print(f"   Premiers 200 chars CSS live :\n{css_live}")

    # 8. Cleanup local tmp PHP
    Path("tmp/patch-347.php").unlink(missing_ok=True)

    print("\n================================================================")
    print("  PATCH 347 TERMINE avec succes.")
    print(f"  Backup CSS cyan : {LOCAL_BACKUP}")
    print(f"  Patched local   : {LOCAL_PATCHED}")
    print("================================================================")


if __name__ == "__main__":
    main()
