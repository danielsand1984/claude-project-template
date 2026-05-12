# setup-claude-hint.ps1
#
# Adds a hint to ~/.claude/CLAUDE.md so Claude Code automatically suggests
# this template when you start a new project.
#
# Idempotent: re-running replaces the existing hint block in place.
#
# Usage:
#   .\setup-claude-hint.ps1                          # references the GitHub repo
#   .\setup-claude-hint.ps1 -LocalPath "D:\..."     # references a local clone path

[CmdletBinding()]
param(
    [string]$LocalPath = "",
    [string]$RepoSlug = "danielsand1984/claude-project-template"
)

$ErrorActionPreference = 'Stop'

$ClaudeDir  = Join-Path $HOME ".claude"
$ClaudeFile = Join-Path $ClaudeDir "CLAUDE.md"
$MarkerStart = '<!-- BEGIN claude-project-template hint -->'
$MarkerEnd   = '<!-- END claude-project-template hint -->'

# Build the hint body
if ($LocalPath) {
    $Source = "local clone at ``$LocalPath``"
    $UsageCopy = @"
   ``Copy-Item ""$LocalPath/*"" ""<target>"" -Recurse -Force``
"@
} else {
    $Source = "GitHub repo ``$RepoSlug``"
    $UsageCopy = @"
   ``gh repo create <project-name> --template $RepoSlug --public --clone`` (creates a new repo)
   or ``npx degit $RepoSlug <project-name>`` (just downloads files, no git history)
"@
}

$HintBody = @"
$MarkerStart
# Project template (claude-project-template)

A pre-configured project starter is available ($Source). It contains:
- ``START_HERE.md`` — an interview playbook for initializing a new project
- ``CLAUDE.template.md``, ``.gitignore``, ``.editorconfig``, ``.vscode/``, ``.github/workflows/``
- ``docs/coding-principles.md`` + ``docs/ai-instructions/`` (RULES, PATTERNS, ARCHITECTURE, TECH_STACK)
- ``tooling/`` — Beads (``bd``), Graphify, curated Claude Code skills/agents per project type
- ``skeletons/`` — ``web-app/``, ``cli-python/``, ``cli-node/``

## When to mention it

If the user starts a new project (says "new project", "ik wil X bouwen", "start a project", or is in an empty folder under a coding-projects directory), **before** asking your own clarifying questions, ask:

> "Wil je van ``claude-project-template`` starten? Daar staan Beads, Graphify, coding principles en skeletons al klaar."

If yes:
1. Get the template into the project folder:
$UsageCopy
2. Open ``<target>/START_HERE.md`` and **follow it step-by-step**. It contains the full interview script, scaffolding rules, tooling-init steps, and a cleanup checklist.
3. Use Beads (``bd init --stealth``) for task tracking — never TodoWrite or markdown TODO files for projects scaffolded from this template.

If no, proceed with your own approach but still default to: ``bd`` for tasks, small files (<200 lines), structured logs, parameterized SQL, no untyped boundaries.

## Do NOT

- Don't silently scaffold without mentioning the template — the user probably forgot it exists.
- Don't ignore ``START_HERE.md`` after copying — it has specific cleanup steps (delete ``skeletons/``, ``START_HERE.md``, replace ``{{PLACEHOLDERS}}``, rename ``.template.*`` files).
$MarkerEnd
"@

# Ensure the directory exists
if (-not (Test-Path $ClaudeDir)) {
    New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
}

# Read existing content (or start empty)
if (Test-Path $ClaudeFile) {
    $Existing = Get-Content $ClaudeFile -Raw
} else {
    $Existing = ""
}

# Strip any previous block between markers (idempotent re-run)
$Pattern = [regex]::Escape($MarkerStart) + '[\s\S]*?' + [regex]::Escape($MarkerEnd)
$Cleaned = [regex]::Replace($Existing, $Pattern, '').TrimEnd()

# Append fresh block
$NewContent = if ($Cleaned) { $Cleaned + "`n`n" + $HintBody + "`n" } else { $HintBody + "`n" }

Set-Content -Path $ClaudeFile -Value $NewContent -NoNewline -Encoding UTF8

Write-Host ""
Write-Host "✓ Hint installed in $ClaudeFile" -ForegroundColor Green
if ($LocalPath) {
    Write-Host "  Pointing to local path: $LocalPath" -ForegroundColor DarkGray
} else {
    Write-Host "  Pointing to GitHub repo: $RepoSlug" -ForegroundColor DarkGray
}
Write-Host ""
Write-Host "Next time you start Claude Code in an empty project folder and say"
Write-Host "'I want to build X', Claude will suggest the template first."
