# setup-claude-hint.ps1
#
# Adds a hint to ~/.claude/CLAUDE.md so Claude Code automatically suggests
# this template when you start a new project.
#
# Idempotent: re-running replaces the existing hint block in place.
#
# Usage:
#   .\setup-claude-hint.ps1                          # references the GitHub repo
#   .\setup-claude-hint.ps1 -LocalPath "D:\..."      # references a local clone path
#
# Compatible with Windows PowerShell 5.1 and PowerShell 7+. ASCII-only by
# design to avoid encoding pitfalls on PS 5.1 (which reads UTF-8 as
# Windows-1252 unless the file has a BOM).

[CmdletBinding()]
param(
    [string]$LocalPath = "",
    [string]$RepoSlug  = "danielsand1984/claude-project-template"
)

$ErrorActionPreference = 'Stop'

$ClaudeDir   = Join-Path $HOME ".claude"
$ClaudeFile  = Join-Path $ClaudeDir "CLAUDE.md"
$MarkerStart = '<!-- BEGIN claude-project-template hint -->'
$MarkerEnd   = '<!-- END claude-project-template hint -->'

# Source description + usage snippet
if ($LocalPath) {
    $SourceDesc = 'local clone at `' + $LocalPath + '`'
    $UsageLine1 = '   `Copy-Item "' + $LocalPath + '/*" "<target>" -Recurse -Force`'
    $UsageLine2 = ''
} else {
    $SourceDesc = 'GitHub repo `' + $RepoSlug + '`'
    $UsageLine1 = '   `gh repo create <project-name> --template ' + $RepoSlug + ' --public --clone` (creates a new repo)'
    $UsageLine2 = '   or `npx degit ' + $RepoSlug + ' <project-name>` (just downloads files, no git history)'
}

# One single string array — no `+=` operations, guaranteed flat.
$HintLines = New-Object System.Collections.Generic.List[string]
$HintLines.Add($MarkerStart)
$HintLines.Add('# Project template (claude-project-template)')
$HintLines.Add('')
$HintLines.Add('A pre-configured project starter is available (' + $SourceDesc + '). It contains:')
$HintLines.Add('- `START_HERE.md` -- an interview playbook for initializing a new project')
$HintLines.Add('- `CLAUDE.template.md`, `.gitignore`, `.editorconfig`, `.vscode/`, `.github/workflows/`')
$HintLines.Add('- `docs/coding-principles.md` + `docs/ai-instructions/` (RULES, PATTERNS, ARCHITECTURE, TECH_STACK)')
$HintLines.Add('- `tooling/` -- Beads (`bd`), Graphify, curated Claude Code skills/agents per project type')
$HintLines.Add('- `skeletons/` -- `web-app/`, `cli-python/`, `cli-node/`')
$HintLines.Add('')
$HintLines.Add('## When to mention it')
$HintLines.Add('')
$HintLines.Add('If the user starts a new project (says "new project", "ik wil X bouwen", "start a project", or is in an empty folder under a coding-projects directory), BEFORE asking your own clarifying questions, ask:')
$HintLines.Add('')
$HintLines.Add('> "Wil je van `claude-project-template` starten? Daar staan Beads, Graphify, coding principles en skeletons al klaar."')
$HintLines.Add('')
$HintLines.Add('If yes:')
$HintLines.Add('1. Get the template into the project folder:')
$HintLines.Add($UsageLine1)
if ($UsageLine2) { $HintLines.Add($UsageLine2) }
$HintLines.Add('2. Open `<target>/START_HERE.md` and follow it step-by-step. It contains the full interview script, scaffolding rules, tooling-init steps, and a cleanup checklist.')
$HintLines.Add('3. Use Beads (`bd init --stealth`) for task tracking -- never TodoWrite or markdown TODO files for projects scaffolded from this template.')
$HintLines.Add('')
$HintLines.Add('If no, proceed with your own approach but still default to: `bd` for tasks, small files (under 200 lines), structured logs, parameterized SQL, no untyped boundaries.')
$HintLines.Add('')
$HintLines.Add('## Do NOT')
$HintLines.Add('')
$HintLines.Add('- Do not silently scaffold without mentioning the template -- the user probably forgot it exists.')
$HintLines.Add('- Do not ignore `START_HERE.md` after copying -- it has specific cleanup steps (delete `skeletons/`, `START_HERE.md`, replace `{{PLACEHOLDERS}}`, rename `.template.*` files).')
$HintLines.Add($MarkerEnd)

$HintBody = [string]::Join("`r`n", $HintLines)

# Ensure the directory exists
if (-not (Test-Path $ClaudeDir)) {
    New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
}

# Read existing content (or start empty)
if (Test-Path $ClaudeFile) {
    $Existing = Get-Content $ClaudeFile -Raw
    if ($null -eq $Existing) { $Existing = '' }
} else {
    $Existing = ''
}

# Strip any previous block between markers (idempotent re-run)
$Pattern = [regex]::Escape($MarkerStart) + '[\s\S]*?' + [regex]::Escape($MarkerEnd)
$Cleaned = [regex]::Replace($Existing, $Pattern, '').TrimEnd()

# Compose new content
if ([string]::IsNullOrEmpty($Cleaned)) {
    $NewContent = $HintBody + "`r`n"
} else {
    $NewContent = $Cleaned + "`r`n`r`n" + $HintBody + "`r`n"
}

# Write with UTF-8
Set-Content -Path $ClaudeFile -Value $NewContent -NoNewline -Encoding UTF8

Write-Host ''
Write-Host "[OK] Hint installed in $ClaudeFile" -ForegroundColor Green
if ($LocalPath) {
    Write-Host "     Pointing to local path: $LocalPath" -ForegroundColor DarkGray
} else {
    Write-Host "     Pointing to GitHub repo: $RepoSlug" -ForegroundColor DarkGray
}
Write-Host ''
Write-Host 'Next time you start Claude Code in an empty project folder and say'
Write-Host "'I want to build X', Claude will suggest the template first."
