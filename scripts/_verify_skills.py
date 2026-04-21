"""Verification post-installation : tous les skills ont-ils un SKILL.md ?"""
import pathlib

base = pathlib.Path(r"C:\Users\gimu8\Desktop\Inaricom\.claude\skills")

skills_cibles = [
    "taste-skill",
    "motion-dev",
    "design-motion-principles",
    "r3f-best-practices",
    "three-best-practices",
    "webgpu-threejs-tsl",
    "tailwind-v4-shadcn",
    "woocommerce-backend-dev",
    "wordpress-plugin-core",
    "design-system-creation",
    "interaction-design",
    "web-design-guidelines",
    "react-best-practices",
]

ok = 0
ko = []
for skill in skills_cibles:
    p = base / skill / "SKILL.md"
    if p.exists():
        size = p.stat().st_size
        print(f"[OK]    {skill:30s} ({size} octets)")
        ok += 1
    else:
        # Chercher tout fichier .md en racine du skill
        skill_dir = base / skill
        if skill_dir.exists():
            mds = list(skill_dir.glob("*.md"))
            subdirs = [d.name for d in skill_dir.iterdir() if d.is_dir()]
            print(f"[KO]    {skill:30s} : pas de SKILL.md direct")
            if mds:
                print(f"        .md en racine : {[m.name for m in mds]}")
            if subdirs:
                print(f"        sous-dossiers : {subdirs}")
            ko.append(skill)
        else:
            print(f"[ABSENT] {skill:30s} : dossier inexistant")
            ko.append(skill)

print()
print(f"=== RESULTAT : {ok}/{len(skills_cibles)} OK ===")
if ko:
    print(f"A corriger : {ko}")
