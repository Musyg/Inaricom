#!/usr/bin/env pwsh
# install-skills.ps1
# Installation idempotente des 7 skills "ultimes" Claude Code pour Inaricom
# Usage : .\scripts\install-skills.ps1
# Doc complete : .claude\skills\external\README.md
#
# Ce script :
# - Cree .claude\skills\external si absent
# - Clone les 7 skills (ignore si deja present)
# - Supprime les .git internes (evite sous-repos git)
# - Reste safe en relance (pas d'ecrasement)

$ErrorActionPreference = 'SilentlyContinue'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host ""
Write-Host "=== Installation skills Claude Code - Inaricom ===" -ForegroundColor Cyan
Write-Host ""

$SkillsDir = ".claude\skills\external"
if (-not (Test-Path $SkillsDir)) {
    New-Item -ItemType Directory -Path $SkillsDir -Force | Out-Null
    Write-Host "[OK] Dossier $SkillsDir cree" -ForegroundColor Green
}

# Liste des skills a installer : nom-court -> url
$Skills = @(
    @{ Name = "anthropics-skills";    Url = "https://github.com/anthropics/skills.git" },
    @{ Name = "vercel-agent-skills";  Url = "https://github.com/vercel-labs/agent-skills.git" },
    @{ Name = "obra-superpowers";     Url = "https://github.com/obra/superpowers.git" },
    @{ Name = "pbakaus-impeccable";   Url = "https://github.com/pbakaus/impeccable.git" },
    @{ Name = "garrytan-gstack";      Url = "https://github.com/garrytan/gstack.git" },
    @{ Name = "ui-ux-pro-max";        Url = "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git" },
    @{ Name = "shannon-pentest";      Url = "https://github.com/unicodeveloper/shannon.git" }
)

$installed = 0
$skipped = 0
$failed = 0

foreach ($skill in $Skills) {
    $targetPath = Join-Path $SkillsDir $skill.Name
    if (Test-Path $targetPath) {
        Write-Host "[SKIP] $($skill.Name) deja present" -ForegroundColor Yellow
        $skipped++
        continue
    }
    Write-Host "[CLONE] $($skill.Name)..." -ForegroundColor White -NoNewline
    git clone --depth 1 $skill.Url $targetPath 2>$null
    if (Test-Path $targetPath) {
        # Supprime .git interne
        $gitPath = Join-Path $targetPath ".git"
        if (Test-Path $gitPath) { Remove-Item -Path $gitPath -Recurse -Force }
        Write-Host " OK" -ForegroundColor Green
        $installed++
    } else {
        Write-Host " ECHEC" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "=== Resume ===" -ForegroundColor Cyan
Write-Host "Installes : $installed" -ForegroundColor Green
Write-Host "Deja presents : $skipped" -ForegroundColor Yellow
Write-Host "Echecs : $failed" -ForegroundColor Red
Write-Host ""
Write-Host "Voir la documentation complete :" -ForegroundColor White
Write-Host "  .claude\skills\external\README.md" -ForegroundColor Gray
Write-Host ""

if ($failed -gt 0) { exit 1 } else { exit 0 }
