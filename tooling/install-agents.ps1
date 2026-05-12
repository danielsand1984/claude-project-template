# install-agents.ps1
#
# Downloads Claude Code subagents from github.com/msitarzewski/agency-agents
# into .claude/agents/ in the current project, based on project type.
#
# Reads tooling/agents-manifest.txt for the project-type → agent-path mapping.
# Always installs everything under "common" plus the type-specific list.
#
# Usage:
#   pwsh -ExecutionPolicy Bypass -File tooling/install-agents.ps1 -Type web-app
#   .\tooling\install-agents.ps1 -Type cli-python
#   .\tooling\install-agents.ps1 -Type web-app -Force         # overwrite existing
#   .\tooling\install-agents.ps1 -Type web-app -DryRun        # show what would happen

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('web-app','cli-python','cli-node','api','library')]
    [string]$Type,

    [string]$Manifest = "tooling/agents-manifest.txt",
    [string]$TargetDir = ".claude/agents",
    [string]$BaseUrl = "https://raw.githubusercontent.com/msitarzewski/agency-agents/main",
    [switch]$Force,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$ProgressPreference    = 'SilentlyContinue'

if (-not (Test-Path $Manifest)) {
    throw "Manifest not found: $Manifest"
}

# Parse manifest: pick all 'common :' lines + the requested type
$selected = @()
Get-Content $Manifest | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq '' -or $line.StartsWith('#')) { return }
    $parts = $line -split '\s*:\s*', 2
    if ($parts.Count -ne 2) { return }
    if ($parts[0] -eq 'common' -or $parts[0] -eq $Type) {
        $selected += $parts[1]
    }
}

if ($selected.Count -eq 0) {
    throw "No agents matched type '$Type' in manifest."
}

Write-Host "→ Installing $($selected.Count) agents for type '$Type' into $TargetDir" -ForegroundColor Cyan

if (-not $DryRun) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
}

$installed = 0; $skipped = 0; $failed = 0

foreach ($agent in $selected) {
    $fileName = (Split-Path $agent -Leaf) + ".md"
    $url      = "$BaseUrl/$agent.md"
    $target   = Join-Path $TargetDir $fileName

    if ((Test-Path $target) -and -not $Force) {
        Write-Host "  ⊘ $fileName (exists, use -Force to overwrite)" -ForegroundColor DarkGray
        $skipped++
        continue
    }

    if ($DryRun) {
        Write-Host "  → would download $url"
        continue
    }

    try {
        Invoke-WebRequest -Uri $url -OutFile $target -ErrorAction Stop
        Write-Host "  ✓ $fileName" -ForegroundColor Green
        $installed++
    } catch {
        Write-Host "  ✗ $fileName ($($_.Exception.Message))" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "Installed: $installed   Skipped: $skipped   Failed: $failed"
if ($failed -gt 0) { exit 1 }
