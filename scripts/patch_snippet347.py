"""
Patch snippet 347 : restauration des regles de swap logo par theme
Context : Claude Code precedent a remplace le bloc logo par "rouge unique partout"
          suite a une regle fausse. On restaure les 5 variantes thematiques.
"""
import sys

src = r'C:\Users\gimu8\Desktop\Inaricom\scripts\snippet347_current.css'
dst = r'C:\Users\gimu8\Desktop\Inaricom\scripts\snippet347_patched.css'

with open(src, 'r', encoding='utf-8') as f:
    content = f.read()

orig_len = len(content)
patches_applied = 0

# ========== PATCH 1 : section 60e - remplacer bloc "logo rouge unique" ==========
old_60e = """/* ============================================================
   60e. LOGO — logo rouge natif unique partout

   Variantes thematiques supprimees (decision Kevin 21/04/2026).
   Seul effet autorise : halo blanc via drop-shadow.
   ============================================================ */

/* Logo natif unique : halo blanc sur tous les themes */
.custom-logo,
.site-logo img {
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.6));
}

/* FIN SECTION 60 */"""

new_60e = """/* ============================================================
   60e. LOGO - 5 variantes thematiques (restauration 22/04/2026)

   5 logos dedies par theme :
   - default (rouge) : logo natif cropped-LogoLong4White-1.png (section securite)
   - or              : Design-sans-titre-16.png (section IA)
   - vert            : Design-sans-titre-15.png (section blog)
   - bleu            : Design-sans-titre-13.png (section institutionnel)
   - neutre          : Design-sans-titre-17.png (homepage argent)

   Swap via content:url() sur [data-theme=X] (attribut html), double par
   background-image sur .theme-X (classe body) pour battre le srcset
   natif de Kadence sur .custom-logo.

   Voir .claude/rules/logo-immutable.md (source de verite).
   ============================================================ */

/* 1. content:url() sur l'<img.custom-logo> via [data-theme=X] sur <html> */

[data-theme="or"] .site-logo img,
[data-theme="or"] .custom-logo {
  content: url('https://staging.inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-16.png');
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.6));
}

[data-theme="bleu"] .site-logo img,
[data-theme="bleu"] .custom-logo {
  content: url('https://staging.inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-13.png');
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.6));
}

[data-theme="vert"] .site-logo img,
[data-theme="vert"] .custom-logo {
  content: url('https://staging.inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-15.png');
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.6));
}

[data-theme="neutre"] .site-logo img,
[data-theme="neutre"] .custom-logo {
  content: url('https://staging.inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-17.png');
  filter: drop-shadow(0 0 3px rgba(255,255,255,0.55));
}

/* 2. Hack srcset : masquer l'<img> natif pour tous les themes non-rouge */

.theme-or img.custom-logo,
.theme-bleu img.custom-logo,
.theme-vert img.custom-logo,
.theme-neutre img.custom-logo {
  opacity: 0;
}

/* 3. Re-afficher le bon logo en background-image sur le parent .brand */

.theme-or .site-branding .brand.has-logo-image {
  background-image: url('https://staging.inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-16.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: left center;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.6));
}

.theme-bleu .site-branding .brand.has-logo-image {
  background-image: url('https://staging.inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-13.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: left center;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.6));
}

.theme-vert .site-branding .brand.has-logo-image {
  background-image: url('https://staging.inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-15.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: left center;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.6));
}

.theme-neutre .site-branding .brand.has-logo-image {
  background-image: url('https://staging.inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-17.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: drop-shadow(0 0 3px rgba(255,255,255,0.55));
}

/* 4. Theme rouge (defaut) : garder le logo natif visible avec halo */

.theme-rouge .site-branding .brand.has-logo-image img.custom-logo {
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.6));
}

/* FIN SECTION 60 */"""

if old_60e in content:
    content = content.replace(old_60e, new_60e)
    patches_applied += 1
    print("PATCH 1 OK : section 60e remplacee (logo unique rouge -> 5 variantes)")
else:
    print("PATCH 1 FAILED : marker 60e non trouve - STOP")
    sys.exit(1)

# ========== PATCH 2 : section 63 - retirer bloc neutre redondant ==========
# Le bloc "Logo : le logo rouge natif reste sur theme-neutre, avec halo renforce"
# dans la section 63 est maintenant redondant avec la section 60e qui gere tout.
# On le retire pour eviter un override parasite (la section 63 est plus bas donc prioritaire).

old_63_logo = """/* Logo : le logo rouge natif reste sur theme-neutre, avec halo renforce */
body.theme-neutre .site-logo img,
body.theme-neutre .custom-logo {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.55));
}

/* Boutons primary sur theme-neutre : fond blanc, texte noir */"""

new_63_logo = """/* Boutons primary sur theme-neutre : fond blanc, texte noir */"""

if old_63_logo in content:
    content = content.replace(old_63_logo, new_63_logo)
    patches_applied += 1
    print("PATCH 2 OK : bloc neutre redondant retire de section 63")
else:
    print("PATCH 2 WARN : bloc neutre section 63 non trouve (peut-etre deja absent)")

# ========== ECRITURE ==========
with open(dst, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print(f"\n=== RESULT ===")
print(f"Patches appliques: {patches_applied}/2")
print(f"Taille avant:  {orig_len} chars")
print(f"Taille apres:  {len(content)} chars")
print(f"Delta:         {len(content) - orig_len:+d} chars")
print(f"Fichier sortie: {dst}")
