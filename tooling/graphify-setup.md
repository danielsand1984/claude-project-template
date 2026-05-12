# Graphify setup

[Graphify](https://github.com/danielsanders1984/graphify) (custom Claude Code skill at `~/.claude/skills/graphify/`) turns any folder into a navigable knowledge graph.

## When to run it

- **On a new codebase you didn't write** — before touching anything.
- **After a refactor** — to see whether the new structure tells a clean story.
- **Periodically on a research corpus** — papers, notes, screenshots in `/raw/`.

## Run

In Claude Code, invoke the skill:

```
/graphify
```

This produces `graphify-out/` with:
- `graph.json` — the graph, persistent across sessions
- `GRAPH_REPORT.md` — plain-language audit of what was found
- Interactive HTML viewer
- Optional Obsidian vault

`graphify-out/` is gitignored by default.

## Query later

```
/graphify query "How is auth wired up?"
/graphify path "AuthMiddleware" "UserModel"
/graphify explain "RetentionPolicy"
```

## Modes

- `/graphify <path> --mode deep` — thorough extraction, richer INFERRED edges
- `/graphify <path> --update` — incremental, re-extract only changed files
- `/graphify <path> --watch` — auto-rebuild on file changes (no LLM needed)

## Pointer for Claude

For non-trivial architecture questions on this codebase, **consult `graphify-out/GRAPH_REPORT.md` and `graphify-out/graph.json` before grepping**. The graph already answers most "where is X" / "how does Y connect to Z" questions.

If `graphify-out/` is missing, ask the user whether you should run `/graphify` once before answering.
