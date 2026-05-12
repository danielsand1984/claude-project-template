# Beads (`bd`) setup

[Beads](https://github.com/gastownhall/beads) is an issue/dependency tracker that lives next to your code. It replaces TODO files, sticky notes, and GitHub issues for small/personal projects.

> **Optional.** If `bd` is not installed on this machine, the template's init flow automatically falls back to `docs/ACTIVE_TASKS.md` — a plain markdown checklist. You can install `bd` later and migrate the tasks manually with `bd create`.

## Why we use it

- **Issues with dependencies** — say "B blocks A" once, query "what can I work on right now?" forever.
- **Stays local** — `.beads/` is gitignored by default; no GitHub round-trip.
- **AI-friendly** — Claude can `bd list`, `bd show`, `bd create`, `bd close` without leaving the terminal.
- **Replaces TodoWrite** — Claude doesn't lose your task list when the conversation rotates.

## Init in a new project

```bash
bd init --stealth
```

`--stealth` configures per-repo git settings so the Beads files don't accidentally get committed.

## Seed the first issues

After init, create the first few issues from the project interview. Example:

```bash
bd create -t task -p high "Set up dev environment (Docker, env vars, seed data)"
bd create -t task -p high "Implement <core flow>"
bd create -t task -p medium "Add CI lint + test gates"
bd create -t task -p low "Write README quickstart"
```

## Daily workflow

```bash
bd list                              # what's open
bd show <id>                         # detail
bd update <id> -s in_progress        # start work
bd close <id>                        # done
bd create -t bug -p high "<title>"   # capture a bug as you discover it
```

## Conventions

- **Type**: `task`, `bug`, `feature`, `chore`, `epic`.
- **Priority**: `low`, `medium`, `high`, `critical`. Default to `medium`.
- **Title style**: Imperative, concise — "Fix auth redirect loop", not "Auth is broken".
- **Dependencies**: Use `bd update <id> --blocks <other-id>` when relationships matter.

## Pointer for Claude

When working on this project, **never** use TodoWrite or markdown TODO lists. Always use `bd`. The active tasks live in `bd list`, not in any file.
