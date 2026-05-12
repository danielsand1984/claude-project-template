#!/usr/bin/env bash
# setup-claude-hint.sh
#
# Adds a hint to ~/.claude/CLAUDE.md so Claude Code automatically suggests
# this template when you start a new project.
#
# Idempotent: re-running replaces the existing hint block in place.
#
# Usage:
#   ./setup-claude-hint.sh                                  # references the GitHub repo
#   ./setup-claude-hint.sh --local-path /path/to/template   # references a local clone

set -euo pipefail

REPO_SLUG="danielsand1984/claude-project-template"
LOCAL_PATH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --local-path) LOCAL_PATH="$2"; shift 2 ;;
    --repo) REPO_SLUG="$2"; shift 2 ;;
    -h|--help)
      grep '^#' "$0" | head -20
      exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

CLAUDE_DIR="$HOME/.claude"
CLAUDE_FILE="$CLAUDE_DIR/CLAUDE.md"
MARKER_START="<!-- BEGIN claude-project-template hint -->"
MARKER_END="<!-- END claude-project-template hint -->"

mkdir -p "$CLAUDE_DIR"
touch "$CLAUDE_FILE"

# Strip any previous hint block (idempotent re-run)
TMP="$(mktemp)"
awk -v s="$MARKER_START" -v e="$MARKER_END" '
  $0==s { inblock=1; next }
  $0==e { inblock=0; next }
  !inblock { print }
' "$CLAUDE_FILE" > "$TMP"

# Trim trailing blanks
sed -i.bak -e :a -e '/^\n*$/{$d;N;ba' -e '}' "$TMP" 2>/dev/null || true
rm -f "${TMP}.bak"

# Build usage snippet
if [[ -n "$LOCAL_PATH" ]]; then
  SOURCE_DESC="local clone at \`$LOCAL_PATH\`"
  USAGE_COPY="   \`cp -r \"$LOCAL_PATH\"/* <target>/\`"
else
  SOURCE_DESC="GitHub repo \`$REPO_SLUG\`"
  USAGE_COPY="   \`gh repo create <project-name> --template $REPO_SLUG --public --clone\` (creates a new repo)
   or \`npx degit $REPO_SLUG <project-name>\` (just downloads files, no git history)"
fi

# Append fresh hint block
{
  if [[ -s "$TMP" ]]; then
    cat "$TMP"
    echo ""
  fi
  cat <<EOF
$MARKER_START
# Project template (claude-project-template)

A pre-configured project starter is available ($SOURCE_DESC). It contains:
- \`START_HERE.md\` — an interview playbook for initializing a new project
- \`CLAUDE.template.md\`, \`.gitignore\`, \`.editorconfig\`, \`.vscode/\`, \`.github/workflows/\`
- \`docs/coding-principles.md\` + \`docs/ai-instructions/\` (RULES, PATTERNS, ARCHITECTURE, TECH_STACK)
- \`tooling/\` — Beads (\`bd\`), Graphify, curated Claude Code skills/agents per project type
- \`skeletons/\` — \`web-app/\`, \`cli-python/\`, \`cli-node/\`

## When to mention it

If the user starts a new project (says "new project", "ik wil X bouwen", "start a project", or is in an empty folder under a coding-projects directory), **before** asking your own clarifying questions, ask:

> "Wil je van \`claude-project-template\` starten? Daar staan Beads, Graphify, coding principles en skeletons al klaar."

If yes:
1. Get the template into the project folder:
$USAGE_COPY
2. Open \`<target>/START_HERE.md\` and **follow it step-by-step**. It contains the full interview script, scaffolding rules, tooling-init steps, and a cleanup checklist.
3. Use Beads (\`bd init --stealth\`) for task tracking — never TodoWrite or markdown TODO files for projects scaffolded from this template.

If no, proceed with your own approach but still default to: \`bd\` for tasks, small files (<200 lines), structured logs, parameterized SQL, no untyped boundaries.

## Do NOT

- Don't silently scaffold without mentioning the template — the user probably forgot it exists.
- Don't ignore \`START_HERE.md\` after copying — it has specific cleanup steps (delete \`skeletons/\`, \`START_HERE.md\`, replace \`{{PLACEHOLDERS}}\`, rename \`.template.*\` files).
$MARKER_END
EOF
} > "$CLAUDE_FILE"

rm -f "$TMP"

echo ""
echo "✓ Hint installed in $CLAUDE_FILE"
if [[ -n "$LOCAL_PATH" ]]; then
  echo "  Pointing to local path: $LOCAL_PATH"
else
  echo "  Pointing to GitHub repo: $REPO_SLUG"
fi
echo ""
echo "Next time you start Claude Code in an empty project folder and say"
echo "'I want to build X', Claude will suggest the template first."
