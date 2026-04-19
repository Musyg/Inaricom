#!/usr/bin/env python3
"""
B'.3 — Consolidation Customizer CSS vers snippet 347
Migre les blocs légitimes, supprime les doublons, vide le Customizer.

Inputs :
  audits/347-REFACTORED.css (post-B.0/B.1, dans la DB staging)
  audits/additional-css-362.css (9KB Customizer brut)

Outputs :
  audits/347-CONSOLIDATED.css (nouveau 347, à pousser en DB)
  audits/362-CLEARED.css (vide, à pousser en DB pour #362)
"""

import re
from pathlib import Path

BASE = Path('C:/Users/gimu8/Desktop/Inaricom/audits')

# === 1. Charger le 347 actuel ===
current_347 = (BASE / '347-REFACTORED.css').read_text(encoding='utf-8')

# === 2. Charger le 362 ===
current_362 = (BASE / 'additional-css-362.css').read_text(encoding='utf-8')

# === 3. Extraire les 3 blocs du 362 par découpage ===

# Bloc 1 : Fix WooCommerce hover (lignes 1-25 environ)
# Delimite par le premier commentaire avec === THEME ROUGE
match = re.search(r'^(.+?)(?=/\*\s*=+\s*\n\s*THÈME ROUGE)', current_362, re.DOTALL)
if not match:
    raise SystemExit("ERREUR: bloc WooCommerce hover introuvable")
block_wc_hover = match.group(1).strip()
print(f"[OK] Bloc 1 (WC hover) : {len(block_wc_hover)} octets")

# Bloc 2 : THÈME ROUGE (à supprimer, duplicats avec section 43-46 du 347)
# Delimite par "=== Bouton Nous contacter"
match = re.search(
    r'(/\*\s*=+\s*\n\s*THÈME ROUGE.+?)(?=/\*\s*=+\s*Bouton )',
    current_362, re.DOTALL
)
if not match:
    raise SystemExit("ERREUR: bloc [data-theme='rouge'] introuvable")
block_theme_rouge = match.group(1).strip()
print(f"[SUPPR] Bloc 2 (data-theme rouge) : {len(block_theme_rouge)} octets — à supprimer")

# Bloc 3 : Bouton .i-cta-box__btn (or/bleu/vert/rouge)
match = re.search(
    r'(/\*\s*=+\s*Bouton .+)',
    current_362, re.DOTALL
)
if not match:
    raise SystemExit("ERREUR: bloc .i-cta-box__btn introuvable")
block_cta_btn = match.group(1).strip()
print(f"[OK] Bloc 3 (.i-cta-box__btn) : {len(block_cta_btn)} octets")

# === 4. Construire la nouvelle section 47 à insérer dans 347 ===
# On l'insère juste avant section 43 (PATCH THÈMES)

new_section_47 = f"""/* ============================================================
   47. WOOCOMMERCE SHOP — HOVER ACTIONS (migré du Customizer #362)
   Fix de repositionnement du bouton action au hover dans la grille produits
   Source : ex-Customizer Additional CSS, 2026-04-19
   ============================================================ */

{block_wc_hover}

/* ============================================================
   47b. CTA BOX BUTTON (.i-cta-box__btn) — par thème
   Migré du Customizer #362
   ============================================================ */

{block_cta_btn}

"""

# === 5. Insérer section 47 juste avant section 43 ===
# Le marqueur précis dans 347-REFACTORED.css
marker = '/* ===========================================\n   43. PATCH THÈMES — FORÇAGE COULEURS'
if marker not in current_347:
    raise SystemExit(f"ERREUR: marqueur section 43 introuvable dans 347-REFACTORED.css")

new_347 = current_347.replace(marker, new_section_47 + marker, 1)

# === 6. Stats ===
old_size = len(current_347)
new_size = len(new_347)
print(f"\n[STATS] 347 taille :")
print(f"   Avant : {old_size:>7} octets")
print(f"   Après : {new_size:>7} octets")
print(f"   Delta : {new_size - old_size:+d} octets")

# === 7. Sauvegarder ===
out_347 = BASE / '347-CONSOLIDATED.css'
out_347.write_text(new_347, encoding='utf-8')
print(f"\n[WRITE] {out_347.name}")

# Vider #362 : on laisse juste un commentaire traçable
cleared_362 = """/* ============================================================
   KADENCE CUSTOMIZER → ADDITIONAL CSS
   Vidé 2026-04-19 : contenu migré vers snippet custom-css-js #347
   (sections 47 WooCommerce hover + 47b .i-cta-box__btn par thème).
   Les 200 lignes [data-theme="rouge"] du Customizer ont été supprimées :
   elles dupliquaient les sections 43-46 du 347 via variables CSS.
   Ne plus rien mettre ici : ajouter dans #347 à la place.
   ============================================================ */
"""
out_362 = BASE / '362-CLEARED.css'
out_362.write_text(cleared_362, encoding='utf-8')
print(f"[WRITE] {out_362.name}")

print("\n[DONE] Prêt pour push DB staging")
