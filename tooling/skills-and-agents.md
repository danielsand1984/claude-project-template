# Agents & Skills

## Agents

Agents in this template come from [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents). They install into `.claude/agents/` in your project, making them spawnable via Claude's `Agent` tool.

### Install

Pick **one** project type and run the matching script:

```powershell
# Windows
pwsh -ExecutionPolicy Bypass -File tooling/install-agents.ps1 -Type web-app
```

```bash
# macOS / Linux
bash tooling/install-agents.sh --type web-app
```

Valid types: `web-app`, `cli-python`, `cli-node`, `api`, `library`.

### What gets installed

`tooling/agents-manifest.txt` is the source of truth. It maps each project type to its agent list. All types also get the `common` set (code-reviewer, reality-checker, onboarding-engineer, git-workflow-master, minimal-change-engineer, product-manager).

| Type | Adds (on top of common) |
|------|------------------------|
| `web-app` | backend-architect, frontend-developer, database-optimizer, devops-automator, ui-designer, ux-architect, accessibility-auditor, api-tester, performance-benchmarker |
| `cli-python` / `cli-node` | backend-architect, rapid-prototyper |
| `api` | backend-architect, database-optimizer, api-tester |
| `library` | backend-architect, minimal-change-engineer, api-tester |

To add more agents later: edit `agents-manifest.txt` and re-run with `--force`. The repo has many more agents under `marketing/`, `product/`, `specialized/`, `support/`, `paid-media/` etc. — install on demand.

### Using agents (this is the important part)

Installing agents is useless if you don't actually spawn them. The project `CLAUDE.md` has a **"Team Lead Mode"** section that mandates when Claude must consult which agent. Keep that section accurate: when a new pattern emerges in this project (e.g. "always consult X for Y"), add a rule there.

Default behavior: **before** doing non-trivial work, Claude spawns relevant agents in parallel, asks each for max 5 concrete points, then synthesizes.

## Skills

Built-in Claude Code skills (always available, no install) that pair well with this template:

| Skill | Trigger | When to use |
|-------|---------|-------------|
| `/init` | user-typed | Generate `CLAUDE.md` from an existing codebase |
| `/review` | user-typed | Review a pending PR |
| `/security-review` | user-typed | Security audit of current branch changes |
| `/graphify` | user-typed | Knowledge graph of any folder — run before architecture questions |
| `/simplify` | user-typed | Review changed code for reuse/quality |

Plus skills from [skills.sh](https://skills.sh) and your own custom skills at `~/.claude/skills/` — install on demand.

## Pointer for Claude

1. Prefer **spawning an agent** over doing specialist work yourself — agents have focused context and proven processes.
2. Spawn agents **in parallel** when their work is independent.
3. Brief each agent with file paths, the specific change, what to evaluate, and a max-5-points cap.
4. After agents report, **synthesize** — don't dump their output as-is.
