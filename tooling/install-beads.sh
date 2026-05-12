#!/usr/bin/env bash
# install-beads.sh
#
# Downloads the latest Beads (`bd`) release for the current platform and
# installs it to ~/.beads/bin/. Hints how to add it to PATH if missing.
#
# Idempotent: re-running just overwrites the binaries with the latest release.
#
# Usage:
#   ./install-beads.sh
#   ./install-beads.sh --version v1.0.4    # pin to a specific version
#   ./install-beads.sh --no-path-check     # skip the PATH check at the end

set -euo pipefail

REPO="gastownhall/beads"
VERSION="latest"
INSTALL_DIR="$HOME/.beads/bin"
SKIP_PATH_CHECK=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version) VERSION="$2"; shift 2 ;;
    --no-path-check) SKIP_PATH_CHECK=1; shift ;;
    -h|--help) grep '^#' "$0" | head -15; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# Detect OS + architecture
OS_RAW=$(uname -s | tr '[:upper:]' '[:lower:]')
case "$OS_RAW" in
  darwin|linux|freebsd) OS="$OS_RAW" ;;
  *) echo "Unsupported OS: $OS_RAW" >&2; exit 1 ;;
esac

case "$(uname -m)" in
  x86_64|amd64) ARCH="amd64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac

echo "→ Querying GitHub for $VERSION release of $REPO (${OS}_${ARCH})..."

API_URL="https://api.github.com/repos/$REPO/releases"
if [[ "$VERSION" == "latest" ]]; then
  API_URL="$API_URL/latest"
else
  API_URL="$API_URL/tags/$VERSION"
fi

# Extract matching asset URL (no jq dependency)
ASSET_URL=$(curl -fsSL "$API_URL" \
  | grep '"browser_download_url"' \
  | grep -oE 'https://[^"]+' \
  | grep -E "beads_.*_${OS}_${ARCH}\.tar\.gz$" \
  | head -1)

if [[ -z "$ASSET_URL" ]]; then
  echo "✗ No matching asset found for ${OS}_${ARCH}" >&2
  exit 1
fi

ASSET_NAME=$(basename "$ASSET_URL")
echo "→ Found $ASSET_NAME"

# Download + extract
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo "→ Downloading..."
curl -fsSL "$ASSET_URL" -o "$TMP/beads.tar.gz"

mkdir -p "$INSTALL_DIR"
echo "→ Extracting to $INSTALL_DIR..."
tar -xzf "$TMP/beads.tar.gz" -C "$INSTALL_DIR"

# Verify
if [[ ! -x "$INSTALL_DIR/bd" ]]; then
  echo "✗ Extraction succeeded but $INSTALL_DIR/bd not found or not executable" >&2
  exit 1
fi

BD_VERSION=$("$INSTALL_DIR/bd" --version 2>&1 || true)
echo "→ Installed: $BD_VERSION"

# Check PATH
if [[ "$SKIP_PATH_CHECK" -eq 0 ]]; then
  if command -v bd >/dev/null 2>&1; then
    echo ""
    echo "✓ Beads installed and on PATH."
  else
    echo ""
    echo "⚠ $INSTALL_DIR is not on your PATH. Add this to your shell rc:"
    echo ""
    echo "    export PATH=\"\$HOME/.beads/bin:\$PATH\""
    echo ""
    echo "  Common files: ~/.bashrc, ~/.zshrc, ~/.config/fish/config.fish"
    echo "  Then restart your terminal or 'source' the rc file."
  fi
fi
