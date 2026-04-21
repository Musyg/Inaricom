"""Ajouter cleanup logo variants en tete de Phase 2.0."""
import pathlib

p = pathlib.Path('docs/BRIEF_CLAUDE_CODE_PHASE_2.0.md')
c = p.read_text(encoding='utf-8')

# Inserer une sous-section "Etape 0 : cleanup reliquats logo" avant "Commandes a executer"
old_section = """## Commandes a executer (dans l'ordre)

### 1. Creer le dossier et initialiser Vite"""

new_section = """## Commandes a executer (dans l'ordre)

### 0. Cleanup reliquats logo (a faire AVANT setup React)

Le logo est desormais unifie. Ces 4 fichiers PNG et les regles CSS associees sont obsoletes :

**a. Retirer du snippet 63 (theme-neutre)** — editer `audits/snippet-63-theme-neutre.css` :

Supprimer ces blocs :

```css
/* Logo : version argentee (Design-sans-titre-17.png) via content: url(...) */
[data-theme="neutre"] .site-logo img,
[data-theme="neutre"] .custom-logo {
  content: url('https://staging.inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-17.png');
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.55));
}

.theme-neutre img.custom-logo {
  opacity: 0;
}

.theme-neutre .site-branding .brand.has-logo-image {
  background-image: url('https://staging.inaricom.com/wp-content/uploads/2026/01/Design-sans-titre-17.png');
  ...
}
```

Remplacer par (un seul halo commun) :

```css
/* Logo : le logo rouge natif reste sur theme-neutre, avec halo renforce */
body.theme-neutre .site-logo img,
body.theme-neutre .custom-logo {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.55));
}
```

**b. Retirer aussi les swaps logo des autres themes** (si presents dans le 347) :

Chercher `[data-theme="or"] .site-logo img`, `[data-theme="bleu"] ...`, `[data-theme="vert"] ...` dans le 347 et supprimer les regles `content: url(...)` + les `.theme-X img.custom-logo { opacity: 0 }` + les background-image sur `.site-branding`. Garder uniquement le logo natif rouge avec drop-shadow standard.

**c. Rebuild + push 347** :

```bash
cd ~/Desktop/Inaricom
python scripts/_build_347.py
scp audits/347-REFACTORED-B5.css inaricom:/tmp/
ssh inaricom 'bash /tmp/_push_b5_nokses.sh && bash /tmp/_force_resync.sh'
```

**d. Supprimer les PNG obsoletes sur le serveur** :

```bash
ssh inaricom 'rm /home/toriispo/inaricom.com/web-staging/wp-content/uploads/2026/01/Design-sans-titre-13*.png /home/toriispo/inaricom.com/web-staging/wp-content/uploads/2026/01/Design-sans-titre-15*.png /home/toriispo/inaricom.com/web-staging/wp-content/uploads/2026/01/Design-sans-titre-16*.png /home/toriispo/inaricom.com/web-staging/wp-content/uploads/2026/01/Design-sans-titre-17*.png'
```

**e. Verification** :

```bash
# Visiter / , /shop/ , /articles/ , /contact/ sur staging
# Le logo rouge doit apparaitre partout, identique, avec halo blanc
curl -s -u 'staging:InaStg-Kx7m9vR2@pL' https://staging.inaricom.com/ | grep -c 'cropped-LogoLong4White'
# Doit retourner >= 1
```

**f. Commit cleanup** :

```bash
git add audits/snippet-63-theme-neutre.css audits/347-REFACTORED-B5.css
git commit -m "Cleanup reliquats logo variants (theme-neutre + 4 PNG obsoletes)"
git push origin main
```

Une fois ces etapes faites, on peut passer au setup Vite.

---

### 1. Creer le dossier et initialiser Vite"""

assert old_section in c, 'OLD section not found'
c = c.replace(old_section, new_section)
print('[OK] Etape 0 cleanup logo ajoutee au brief')

p.write_text(c, encoding='utf-8')
print('[SUCCESS] BRIEF_CLAUDE_CODE_PHASE_2.0.md mis a jour avec cleanup logo')
