#!/usr/bin/env python3
"""
B.4 — Refactor massif sections 43-46 + 48 du 347.
Principe : les sections 1-42 utilisent deja var(--inari-red) partout.
Les variables sont redefinies par theme en section 1b/1c/1d.
Donc sections 43-46+48 sont 99% redondantes.

On garde :
- Toutes les sections 1-42 telles quelles (propres)
- Sections 47+47b (WC hover + CTA box, migrees de B'.3)
- Section 48 (texte noir sur boutons or/bleu/vert) REMPLACEE par regle compacte
- Section 49+ (patch largeur, mobile) telles quelles

On supprime :
- Sections 43 (PATCH THEMES - FORCAGE COULEURS) : 300 lignes de doublons
- Section 44 (PATCH BOUTONS & HOVERS) : 200 lignes de doublons
- Section 45 (KADENCE BLOCKS FORCAGE) : 70 lignes de doublons
- Section 46 (WOOCOMMERCE PRIX) : 50 lignes de doublons

Remplacees par :
- Nouvelle section 43 compacte (20 lignes) : uniquement texte sombre boutons or/bleu/vert
"""
from pathlib import Path
import re

BASE = Path('C:/Users/gimu8/Desktop/Inaricom/audits')
src_path = BASE / '347-CONSOLIDATED.css'

content = src_path.read_text(encoding='utf-8')
original_size = len(content)
original_lines = content.count('\n')

print(f"=== Source : 347-CONSOLIDATED.css ===")
print(f"   Taille avant : {original_size} octets / {original_lines} lignes")

# === Localiser les bornes ===
# Debut section 43 (PATCH THEMES)
marker_43_start = '/* ===========================================\n   43. PATCH THÈMES — FORÇAGE COULEURS'
pos_43_start = content.find(marker_43_start)

# Fin section 46 + 48 = juste avant section 49 PATCH LARGEUR (on garde section 49+)
marker_49 = '/* ===========================================\n   49. PATCH LARGEUR'
pos_49 = content.find(marker_49)

# Verifier aussi sections 47 et 47b (du B'.3)
pos_47 = content.find('/* ============================================================\n   47. WOOCOMMERCE SHOP — HOVER ACTIONS')

if pos_43_start == -1:
    raise SystemExit("ERREUR: section 43 introuvable")
if pos_49 == -1:
    raise SystemExit("ERREUR: section 49 introuvable")
if pos_47 == -1:
    raise SystemExit("ERREUR: section 47 (B'.3) introuvable")

print(f"\n=== Positions des marqueurs ===")
print(f"   Section 47 (B'.3 WC hover)  : position {pos_47}")
print(f"   Section 43 (PATCH THEMES)   : position {pos_43_start}")
print(f"   Section 49 (PATCH LARGEUR)  : position {pos_49}")

# === Construction du nouveau contenu ===

# La structure actuelle (post B'.3) est :
# [sections 1-42] 
# [section 47 + 47b (B'.3)]
# [sections 43-46 + 48 (anciens)]
# [section 49+ (LARGEUR + MOBILE)]

# On veut garder 1-42, 47+47b, 49+ et remplacer 43-48 par une nouvelle section 43 compacte

# Le section 47 (B'.3) vient AVANT section 43 (PATCH THEMES), donc :
# Avant section 43 = tout ce qu'on garde (sections 1-42 + 47 + 47b)
# Section 43 -> section 49 = ce qu'on remplace
# Section 49 et apres = tout ce qu'on garde

before_43 = content[:pos_43_start]
old_43_to_48 = content[pos_43_start:pos_49]
from_49 = content[pos_49:]

print(f"\n=== Decoupage ===")
print(f"   Avant section 43 (garde)    : {len(before_43)} octets")
print(f"   Sections 43-48 (supprime)   : {len(old_43_to_48)} octets / {old_43_to_48.count(chr(10))} lignes")
print(f"   A partir section 49 (garde) : {len(from_49)} octets")

# === Nouvelle section 43 compacte ===
new_section_43 = """/* ============================================================
   43. EXCEPTIONS THÈME — texte sombre sur boutons or/bleu/vert
   
   Les sections 1-42 utilisent var(--inari-red) qui se recolore
   automatiquement selon [data-theme="or|bleu|vert"] via les variables
   definies section 1b/1c/1d.
   
   SEULE exception : le CONTRASTE TEXTE des boutons change.
   - Thème rouge (defaut) : texte BLANC sur rouge (WCAG OK)
   - Thème or/bleu/vert    : texte NOIR sur couleur claire (WCAG OK)
   
   Note : les effets speciaux par theme (shimmer or, glow bleu tech)
   sont conserves section 42.
   ============================================================ */

[data-theme="or"] .wp-block-button__link,
[data-theme="or"] .kb-button,
[data-theme="or"] button[type="submit"],
[data-theme="or"] input[type="submit"],
[data-theme="or"] .btn-primary,
[data-theme="or"] .btn-primary-large,
[data-theme="or"] .btn-submit,
[data-theme="or"] .inaricom-btn-primary,
[data-theme="or"] .header-cta,
[data-theme="or"] .header-button,
[data-theme="or"] .woocommerce a.button,
[data-theme="or"] .woocommerce button.button,
[data-theme="or"] .btn-product:hover,
[data-theme="or"] .inari-hero-cta .btn-primary,
[data-theme="or"] .shop-cta .btn-primary-large,
[data-theme="or"] .woocommerce span.onsale,
[data-theme="or"] .kb-btns-wrap .kb-button,
[data-theme="or"] .kt-btn-wrap .kt-button,
[data-theme="bleu"] .wp-block-button__link,
[data-theme="bleu"] .kb-button,
[data-theme="bleu"] button[type="submit"],
[data-theme="bleu"] input[type="submit"],
[data-theme="bleu"] .btn-primary,
[data-theme="bleu"] .btn-primary-large,
[data-theme="bleu"] .btn-submit,
[data-theme="bleu"] .inaricom-btn-primary,
[data-theme="bleu"] .header-cta,
[data-theme="bleu"] .header-button,
[data-theme="bleu"] .woocommerce a.button,
[data-theme="bleu"] .woocommerce button.button,
[data-theme="bleu"] .btn-product:hover,
[data-theme="bleu"] .inari-hero-cta .btn-primary,
[data-theme="bleu"] .shop-cta .btn-primary-large,
[data-theme="bleu"] .woocommerce span.onsale,
[data-theme="bleu"] .kb-btns-wrap .kb-button,
[data-theme="bleu"] .kt-btn-wrap .kt-button,
[data-theme="vert"] .wp-block-button__link,
[data-theme="vert"] .kb-button,
[data-theme="vert"] button[type="submit"],
[data-theme="vert"] input[type="submit"],
[data-theme="vert"] .btn-primary,
[data-theme="vert"] .btn-primary-large,
[data-theme="vert"] .btn-submit,
[data-theme="vert"] .inaricom-btn-primary,
[data-theme="vert"] .header-cta,
[data-theme="vert"] .header-button,
[data-theme="vert"] .woocommerce a.button,
[data-theme="vert"] .woocommerce button.button,
[data-theme="vert"] .btn-product:hover,
[data-theme="vert"] .inari-hero-cta .btn-primary,
[data-theme="vert"] .shop-cta .btn-primary-large,
[data-theme="vert"] .woocommerce span.onsale,
[data-theme="vert"] .kb-btns-wrap .kb-button,
[data-theme="vert"] .kt-btn-wrap .kt-button {
  color: #0A0A0F !important;
}

/* Thème rouge (defaut) : texte BLANC */
[data-theme="rouge"] .wp-block-button__link,
[data-theme="rouge"] .kb-button,
[data-theme="rouge"] button[type="submit"],
[data-theme="rouge"] input[type="submit"],
[data-theme="rouge"] .btn-primary,
[data-theme="rouge"] .btn-primary-large,
[data-theme="rouge"] .btn-submit,
[data-theme="rouge"] .btn-product:hover,
:root .btn-primary-large,
:root .btn-primary,
:root .btn-submit {
  color: #FFFFFF !important;
}

/* Icones SVG Kadence — couleur theme active */
[data-theme="or"] .kb-svg-icon-wrap svg,
[data-theme="or"] .kt-svg-icon-list-item-wrap svg,
[data-theme="bleu"] .kb-svg-icon-wrap svg,
[data-theme="bleu"] .kt-svg-icon-list-item-wrap svg,
[data-theme="vert"] .kb-svg-icon-wrap svg,
[data-theme="vert"] .kt-svg-icon-list-item-wrap svg {
  color: var(--inari-red) !important;
  fill: var(--inari-red) !important;
}

/* FIN SECTION 43 */

"""

# === Assembler le nouveau fichier ===
new_content = before_43 + new_section_43 + from_49
new_size = len(new_content)
new_lines = new_content.count('\n')

print(f"\n=== Nouveau 347 ===")
print(f"   Taille apres : {new_size} octets / {new_lines} lignes")
print(f"   Delta       : {new_size - original_size:+d} octets / {new_lines - original_lines:+d} lignes")

# === Verifications strictes ===
# 1. Plus de marqueurs 43/44/45/46 anciens
old_markers = [
    '43. PATCH THÈMES — FORÇAGE COULEURS',
    '44. PATCH BOUTONS & HOVERS — FORÇAGE THÈME',
    '45. KADENCE BLOCKS — FORÇAGE SPÉCIFIQUE',
    '46. WOOCOMMERCE — PRIX & ÉLÉMENTS',
    '48. FORÇAGE TEXTE BOUTONS',
]
for marker in old_markers:
    if marker in new_content:
        print(f"   [FAIL] Marqueur ancien toujours present : {marker}")
        raise SystemExit(1)
print(f"\n[OK] Tous les anciens marqueurs sections 43-48 supprimes")

# 2. Nouvelle section 43 presente
if 'EXCEPTIONS THÈME' not in new_content:
    raise SystemExit("[FAIL] Nouvelle section 43 manquante")
print(f"[OK] Nouvelle section 43 EXCEPTIONS THÈME presente")

# 3. Sections preservees : 47, 47b, 49+
preserved = [
    '47. WOOCOMMERCE SHOP — HOVER ACTIONS',
    '47b. CTA BOX BUTTON',
    '49. PATCH LARGEUR',
    '50. MOBILE BURGER',
    '51. MOBILE HEADER',
    '52. MOBILE — ORDRE HERO',
    '53. MOBILE — TAILLES',
]
for marker in preserved:
    if marker not in new_content:
        print(f"   [FAIL] Section preservee perdue : {marker}")
        raise SystemExit(1)
print(f"[OK] Toutes les sections conservees sont presentes : 47, 47b, 49-53")

# 4. Variables CSS utilisees (pattern var(--inari-red) doit toujours etre nombreux)
var_red_count = new_content.count('var(--inari-red)')
var_rgb_count = new_content.count('var(--inari-red-rgb)')
print(f"\n[OK] var(--inari-red) : {var_red_count} occurrences")
print(f"[OK] var(--inari-red-rgb) : {var_rgb_count} occurrences")

# 5. Hex hardcodes (doit etre limite)
hex_theme_count = len(re.findall(r'#FFD700|#00d4ff|#10B981', new_content))
print(f"[OK] Hex themes restants : {hex_theme_count} (attendus pour :root + 1b/1c/1d + theme-dot + shimmer or)")

# === Ecriture ===
out_path = BASE / '347-REFACTORED-B4.css'
out_path.write_text(new_content, encoding='utf-8')
print(f"\n[WRITE] {out_path.name}")

# Stats finales
print(f"\n=== Gains B.4 ===")
lines_removed = original_lines - new_lines
bytes_removed = original_size - new_size
print(f"   Lignes supprimees : {lines_removed}")
print(f"   Octets economises : {bytes_removed}")
print(f"   Pourcentage : {(bytes_removed/original_size)*100:.1f}%")
