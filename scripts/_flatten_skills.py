"""Corriger la sous-structure imbriquee pour les 3 skills secondsky."""
import pathlib
import shutil

base = pathlib.Path(r"C:\Users\gimu8\Desktop\Inaricom\.claude\skills")

skills_a_aplatir = [
    "wordpress-plugin-core",
    "design-system-creation",
    "interaction-design",
]

for skill in skills_a_aplatir:
    outer = base / skill
    inner = outer / skill
    if not inner.exists():
        print(f"[SKIP] {skill} : pas de sous-dossier imbrique")
        continue
    
    # Copier tout le contenu de inner vers outer (aplatir)
    moved = 0
    for item in inner.iterdir():
        dest = outer / item.name
        if dest.exists():
            print(f"  [WARN] {skill}/{item.name} existe deja, skip")
            continue
        shutil.move(str(item), str(dest))
        moved += 1
    
    # Supprimer le sous-dossier vide
    try:
        inner.rmdir()
        print(f"[OK] {skill} aplati ({moved} items deplaces)")
    except Exception as e:
        print(f"[ERR] {skill} : {e}")

print()
print("=== VERIFICATION POST-FIX ===")
for skill in skills_a_aplatir:
    p = base / skill / "SKILL.md"
    if p.exists():
        print(f"[OK] {skill}/SKILL.md = {p.stat().st_size} octets")
    else:
        print(f"[KO] {skill}/SKILL.md toujours absent")
        contents = list((base / skill).iterdir())
        print(f"     contenu : {[c.name for c in contents]}")
