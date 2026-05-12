#!/usr/bin/env bash
# install-agents.sh
#
# Downloads Claude Code subagents from github.com/msitarzewski/agency-agents
# into .claude/agents/ in the current project, based on project type.
#
# Reads tooling/agents-manifest.txt for the project-type → agent-path mapping.
# Always installs everything under "common" plus the type-specific list.
#
# Usage:
#   ./tooling/install-agents.sh --type web-app
#   ./tooling/install-agents.sh --type cli-python --force
#   ./tooling/install-agents.sh --type web-app --dry-run

set -euo pipefail

TYPE=""
MANIFEST="tooling/agents-manifest.txt"
TARGET_DIR=".claude/agents"
BASE_URL="https://raw.githubusercontent.com/msitarzewski/agency-agents/main"
FORCE=0
DRY_RUN=0

usage() {
  grep '^#' "$0" | head -15
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --type) TYPE="$2"; shift 2 ;;
    --manifest) MANIFEST="$2"; shift 2 ;;
    --target) TARGET_DIR="$2"; shift 2 ;;
    --force) FORCE=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "$TYPE" ]]; then
  echo "Missing --type. Choose from: web-app, cli-python, cli-node, api, library" >&2
  exit 1
fi

case "$TYPE" in
  web-app|cli-python|cli-node|api|library) ;;
  *) echo "Invalid type: $TYPE" >&2; exit 1 ;;
esac

if [[ ! -f "$MANIFEST" ]]; then
  echo "Manifest not found: $MANIFEST" >&2
  exit 1
fi

# Collect selected agent paths
SELECTED=()
while IFS= read -r line; do
  line="${line%%#*}"           # strip inline comments
  line="$(echo "$line" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
  [[ -z "$line" ]] && continue
  if [[ "$line" =~ ^([a-zA-Z0-9_-]+)[[:space:]]*:[[:space:]]*(.+)$ ]]; then
    key="${BASH_REMATCH[1]}"
    val="${BASH_REMATCH[2]}"
    if [[ "$key" == "common" || "$key" == "$TYPE" ]]; then
      SELECTED+=("$val")
    fi
  fi
done < "$MANIFEST"

if [[ ${#SELECTED[@]} -eq 0 ]]; then
  echo "No agents matched type '$TYPE' in manifest." >&2
  exit 1
fi

echo "→ Installing ${#SELECTED[@]} agents for type '$TYPE' into $TARGET_DIR"

[[ "$DRY_RUN" -eq 0 ]] && mkdir -p "$TARGET_DIR"

installed=0; skipped=0; failed=0

for agent in "${SELECTED[@]}"; do
  filename="$(basename "$agent").md"
  url="$BASE_URL/$agent.md"
  target="$TARGET_DIR/$filename"

  if [[ -f "$target" && "$FORCE" -eq 0 ]]; then
    echo "  ⊘ $filename (exists, use --force to overwrite)"
    skipped=$((skipped+1))
    continue
  fi

  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "  → would download $url"
    continue
  fi

  if curl -fsSL "$url" -o "$target"; then
    echo "  ✓ $filename"
    installed=$((installed+1))
  else
    echo "  ✗ $filename"
    failed=$((failed+1))
  fi
done

echo ""
echo "Installed: $installed   Skipped: $skipped   Failed: $failed"
[[ "$failed" -gt 0 ]] && exit 1 || exit 0
