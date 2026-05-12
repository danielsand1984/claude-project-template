# install-beads.ps1
#
# Downloads the latest Beads (`bd`) release for Windows and installs it to
# ~/.beads/bin/, adding that directory to the User PATH if not already there.
#
# Idempotent: re-running just overwrites the binaries with the latest release.
#
# Usage:
#   pwsh -ExecutionPolicy Bypass -File install-beads.ps1
#   .\install-beads.ps1 -Version v1.0.4     # pin to a specific version
#   .\install-beads.ps1 -NoPath             # skip PATH modification

[CmdletBinding()]
param(
    [string]$Version = "latest",
    [switch]$NoPath
)

$ErrorActionPreference = 'Stop'
$ProgressPreference    = 'SilentlyContinue'

$Repo = "gastownhall/beads"
$InstallDir = Join-Path $HOME ".beads\bin"

# Detect architecture
$arch = switch ($env:PROCESSOR_ARCHITECTURE) {
    "AMD64" { "amd64" }
    "ARM64" { "arm64" }
    default { throw "Unsupported architecture: $($env:PROCESSOR_ARCHITECTURE)" }
}

# Find the right release asset
Write-Host "→ Querying GitHub for $Version release of $Repo ($arch)..."
$apiUrl = if ($Version -eq "latest") {
    "https://api.github.com/repos/$Repo/releases/latest"
} else {
    "https://api.github.com/repos/$Repo/releases/tags/$Version"
}

$release = Invoke-RestMethod -Uri $apiUrl -Headers @{ 'User-Agent' = 'install-beads.ps1' }
$asset = $release.assets | Where-Object { $_.name -like "beads_*_windows_$arch.zip" } | Select-Object -First 1

if (-not $asset) {
    throw "No matching asset found for windows_$arch in release $($release.tag_name)"
}

Write-Host "→ Found $($asset.name) ($([math]::Round($asset.size / 1MB, 1)) MB)"

# Download
$zipPath = Join-Path $env:TEMP $asset.name
Write-Host "→ Downloading to $zipPath..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath

# Extract to ~/.beads/bin/
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
Write-Host "→ Extracting to $InstallDir..."
Expand-Archive -Path $zipPath -DestinationPath $InstallDir -Force
Remove-Item $zipPath -Force

# Verify the binary works
$bdPath = Join-Path $InstallDir "bd.exe"
if (-not (Test-Path $bdPath)) {
    throw "Extraction succeeded but $bdPath not found"
}

$bdVersion = & $bdPath --version 2>&1
Write-Host "→ Installed: $bdVersion" -ForegroundColor Green

# Add to User PATH if missing
if (-not $NoPath) {
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
    if ($userPath -notlike "*$InstallDir*") {
        $newPath = if ($userPath) { "$userPath;$InstallDir" } else { $InstallDir }
        [System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Host "→ Added $InstallDir to User PATH" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠ Open a new terminal for PATH changes to take effect."
        Write-Host "  Or run: `$env:Path += ';$InstallDir'   (current session only)"
    } else {
        Write-Host "→ $InstallDir already on User PATH" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "✓ Beads installed. Try: bd --version" -ForegroundColor Green
