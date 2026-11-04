# Installs four vetted graphic and frontend agent skills in the CURRENT Wingking project.
# Run from any path: powershell -ExecutionPolicy Bypass -File .\scripts\install-design-skills.ps1
$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path (Join-Path $PSScriptRoot ".."))
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  throw "Node.js / npx not found. Install Node.js 22.20+ first."
}
$env:DISABLE_TELEMETRY = "1"
$skills = @(
  @{ repo="anthropics/skills"; name="canvas-design" },
  @{ repo="ArnavPuri/designskills"; name="poster-design" },
  @{ repo="nimadorostkar/Claude-Skills-collection"; name="visual-design" },
  @{ repo="Leonxlnx/taste-skill"; name="design-taste-frontend" }
)
foreach ($skill in $skills) {
  Write-Host "Installing $($skill.name) from $($skill.repo)..." -ForegroundColor Cyan
  & npx --yes skills@1.7.6 add $skill.repo --skill $skill.name --agent codex --copy --yes
  if ($LASTEXITCODE -ne 0) { throw "Install failed: $($skill.name)" }
}
foreach ($skill in $skills) {
  $path = ".agents/skills/$($skill.name)/SKILL.md"
  if (-not (Test-Path $path)) { throw "Skill missing after install: $path" }
}
Write-Host "Four Wingking design skills installed in .agents/skills/" -ForegroundColor Green
Write-Host "Start a new coding-agent session so the new skills are loaded."
