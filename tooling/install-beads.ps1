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
#
# ASCII-only by design to avoid encoding pitfalls on PS 5.1.

[CmdletBinding()]
param(
    [string]$Version = "latest",
    [switch]$NoPath
)

$ErrorActionPreference = 'Stop'
$ProgressPreference    = 'SilentlyContinue'

$Repo       = "gastownhall/beads"
$InstallDir = Join-Path $HOME ".beads\bin"

# Detect architecture
switch ($env:PROCESSOR_ARCHITECTURE) {
    "AMD64" { $arch = "amd64" }
    "ARM64" { $arch = "arm64" }
    default { throw "Unsupported architecture: $($env:PROCESSOR_ARCHITECTURE)" }
}

# Find the right release asset
Write-Host "Querying GitHub for $Version release of $Repo ($arch)..."
if ($Version -eq "latest") {
    $apiUrl = "https://api.github.com/repos/$Repo/releases/latest"
} else {
    $apiUrl = "https://api.github.com/repos/$Repo/releases/tags/$Version"
}

$release = Invoke-RestMethod -Uri $apiUrl -Headers @{ 'User-Agent' = 'install-beads.ps1' }
$asset = $release.assets | Where-Object { $_.name -like "beads_*_windows_$arch.zip" } | Select-Object -First 1

if (-not $asset) {
    throw "No matching asset found for windows_$arch in release $($release.tag_name)"
}

$sizeMB = [math]::Round($asset.size / 1MB, 1)
Write-Host "Found $($asset.name) ($sizeMB MB)"

# Download
$zipPath = Join-Path $env:TEMP $asset.name
Write-Host "Downloading to $zipPath..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath

# Extract to ~/.beads/bin/
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
Write-Host "Extracting to $InstallDir..."
Expand-Archive -Path $zipPath -DestinationPath $InstallDir -Force
Remove-Item $zipPath -Force

# Verify the binary works
$bdPath = Join-Path $InstallDir "bd.exe"
if (-not (Test-Path $bdPath)) {
    throw "Extraction succeeded but $bdPath not found"
}

$bdVersion = & $bdPath --version 2>&1
Write-Host "[OK] Installed: $bdVersion" -ForegroundColor Green

# Add to User PATH if missing
if (-not $NoPath) {
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
    if ($userPath -notlike "*$InstallDir*") {
        if ($userPath) {
            $newPath = $userPath + ";" + $InstallDir
        } else {
            $newPath = $InstallDir
        }
        [System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Host "[OK] Added $InstallDir to User PATH" -ForegroundColor Green
        Write-Host ''
        Write-Host 'Open a new terminal for PATH changes to take effect.'
        Write-Host "Or for the current session run: `$env:Path += ';$InstallDir'"
    } else {
        Write-Host "$InstallDir already on User PATH" -ForegroundColor DarkGray
    }
}

Write-Host ''
Write-Host '[OK] Beads installed. Try: bd --version' -ForegroundColor Green
