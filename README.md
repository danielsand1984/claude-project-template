# claude-project-template

A pre-configured starting point for new coding projects with [Claude Code](https://claude.com/claude-code). Battle-tested conventions, ready-to-use tooling, no opinionated boilerplate dump.

What's inside:
- **Beads (`bd`)** — issue/task tracker, replaces TODO files (auto-installed during init if missing)
- **Agents** — curated set of [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) Claude Code subagents, auto-installed per project type, with mandatory "when to spawn which agent" rules in the project `CLAUDE.md`
- **Graphify** — `/graphify` skill turns any folder into a navigable knowledge graph
- **Coding principles** — distilled from a production multi-tenant SaaS platform
- **CLAUDE.md template** — project-level instructions for Claude Code, including a Team Lead Mode that mandates agent enrichment before non-trivial work
- **Skeletons** — minimal scaffolds for Web App, Python CLI, and Node CLI projects
- **Container / K8s-ready out of the box** — every service ships a multi-stage `Dockerfile`, `/healthz` + `/readyz` endpoints, graceful SIGTERM handling, full-stack `docker-compose.yml`, and Kubernetes manifest stubs with probes, resource limits, and non-root securityContext
- **CI / lint / format** — GitHub Actions, EditorConfig, VSCode settings

## Quickstart for non-developers (zero-tech path)

If you just want to "vibe code" a web app and don't know what Node or Postgres are: this is your route. You only need two things installed:

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — handles all the backend stuff (Postgres, Redis, the api, the web frontend) in containers. One install, no version conflicts.
2. **[Claude Code](https://claude.com/claude-code)** — your AI collaborator.

Then:

```bash
# Download the template (no git knowledge needed)
npx degit danielsand1984/claude-project-template my-app
cd my-app
```

Then **double-click `start.cmd`** (Windows) or **`start.command`** (macOS). It will:
- Check Docker is running
- Copy `.env.example` → `.env`
- Build + start all containers (3-5 min on first run)
- Open `http://localhost:3002` in your browser

That's it. No Node install, no Postgres install, no terminal commands beyond the one `degit` line. Edit code in the `src/` folder — changes hot-reload in your browser.

Open Claude Code in the folder and say "Initialiseer dit project — volg `START_HERE.md`" to start building real features.

---

## Prerequisites (for the developer-friendly path)

**Required:**

| Tool | For | Install |
|---|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Runs the full stack via `docker compose up` | one-click installer |
| [Claude Code](https://claude.com/claude-code) | The interview-driven init flow | follow Anthropic install docs |
| `git` | Version control | system package manager |

**Optional — only needed if you want to run things outside Docker:**

| Tool | What you gain |
|---|---|
| Node 20+ | Run `npm install` / `npm run dev` directly on the host |
| Python 3.11+ | Run Python workers directly on the host (CLI skeletons) |
| **Beads (`bd`)** | First-class task tracker; the template falls back to `docs/ACTIVE_TASKS.md` when absent |
| `gh` (GitHub CLI) | One-command repo creation from template |
| `npx` | `degit` for clean downloads without git history |

Graphify is bundled with Claude Code as a custom skill — no separate install needed.

### Installing Beads (handled automatically)

`bd` is a standalone CLI from [gastownhall/beads](https://github.com/gastownhall/beads). **You don't have to install it manually** — when you run `START_HERE.md`, Claude will detect that `bd` is missing and offer to install it automatically using the bundled scripts:

- **Windows**: `tooling/install-beads.ps1`
- **macOS / Linux**: `tooling/install-beads.sh`

The script downloads the latest release tarball for your OS + architecture, extracts to `~/.beads/bin/`, and (on Windows) adds it to your User PATH.

You can also run it manually before opening Claude:
```powershell
pwsh -ExecutionPolicy Bypass -File tooling/install-beads.ps1     # Windows
```
```bash
bash tooling/install-beads.sh                                     # macOS / Linux
```

If you **don't** want `bd` (or auto-install fails), the init flow falls back to `docs/ACTIVE_TASKS.md` — a plain markdown checklist — and finishes without crashing.

## How to use

### Option A — GitHub Template (recommended for collaborators)

Click the green **"Use this template"** button on GitHub, or:

```bash
gh repo create my-new-project --template danielsand1984/claude-project-template --public --clone
cd my-new-project
claude
# In Claude: "Initialiseer dit project — volg START_HERE.md"
```

You get your own repo, with the template's files but **no** template git history.

### Option B — degit (no GitHub account needed)

```bash
npx degit danielsand1984/claude-project-template my-new-project
cd my-new-project
git init -b main
claude
# In Claude: "Initialiseer dit project — volg START_HERE.md"
```

Downloads the files only, no git history, no `.git/` folder.

### Option C — Plain clone

```bash
git clone --depth=1 https://github.com/danielsand1984/claude-project-template.git my-new-project
cd my-new-project
rm -rf .git
git init -b main
claude
```

### Option D — Local copy (if you maintain a local clone)

Useful if you tweak the template often and want changes available immediately:

```powershell
Copy-Item "D:\path\to\claude-project-template\*" "D:\path\to\my-new-project" -Recurse -Force
```

```bash
cp -r ~/projects/claude-project-template/. ~/projects/my-new-project/
```

## What happens after `claude` opens

Claude reads `START_HERE.md` and runs a **3-round interview**:

1. **What & why** — what does the project do, who uses it, what type (web app / CLI / library / worker / hybrid)
2. **Stack & constraints** — language preference, hosting target, persistence, multi-tenant or not
3. **Working style** — project name, git remote, use `bd`, run `/graphify`

Then Claude:
- Picks the right skeleton (`web-app/`, `cli-python/`, or `cli-node/`)
- Copies it to the project root, deletes unused skeletons
- Replaces `{{PROJECT_NAME}}`, `{{PROJECT_TITLE}}`, etc.
- Customizes `CLAUDE.md` to your project
- Initializes `git`, `bd init --stealth`, and optionally `/graphify`
- Seeds the first 3 issues in `bd`
- **Deletes `START_HERE.md` itself** — it's done its job

## One-time setup: enable auto-discovery

If you want Claude Code to **automatically** suggest this template whenever you start a new project in an empty folder, run **once**:

```powershell
# Windows
.\setup-claude-hint.ps1
```

```bash
# macOS / Linux
./setup-claude-hint.sh
```

This appends a hint to `~/.claude/CLAUDE.md` (your user-global Claude instructions). After this, when you start Claude in an empty folder and say *"ik wil een CLI bouwen"* / *"I want to build a web app"*, Claude will first ask:

> "Wil je van `claude-project-template` starten?"

Re-run the script any time to update the hint — it replaces the previous block in place.

## Files & folders

```
.
├── README.md                        ← this file
├── START_HERE.md                    ← interview playbook Claude follows on init
├── CLAUDE.template.md               ← project-level CLAUDE.md to copy + fill in
├── LICENSE                          ← MIT
├── setup-claude-hint.ps1            ← one-time install for global Claude hint (Windows)
├── setup-claude-hint.sh             ← one-time install for global Claude hint (macOS/Linux)
├── .gitignore                       ← combined Node + Python + Windows
├── .editorconfig
├── .vscode/                         ← format-on-save, recommended extensions
├── .github/workflows/ci.template.yml
├── docs/
│   ├── coding-principles.md         ← required reading for every project
│   ├── ACTIVE_TASKS.template.md
│   ├── IMPLEMENTATION_HISTORY.template.md
│   └── ai-instructions/             ← detailed AI reference (RULES, PATTERNS, ARCHITECTURE)
├── tooling/
│   ├── beads-setup.md
│   ├── graphify-setup.md
│   └── skills-and-agents.md
└── skeletons/
    ├── web-app/                     ← Next.js 16 + Express 5 + optional Python workers
    ├── cli-python/                  ← Typer-based CLI
    └── cli-node/                    ← Commander-based CLI
```

## Why "copy + interview" instead of `init` script?

An init script ages badly: it has to keep up with every new opinion, hides what it does, and produces the same boilerplate every time. A copy + a structured Claude interview produces a **customized scaffold per project** while keeping the template itself dead-simple to read and update.

You always know exactly what you start with: whatever is in this repo.

## Updating the template

When a pattern in a real project earns its keep:

1. Update it here in the template (not just in the live project).
2. Note the change in `CHANGELOG.md` if it's user-visible.
3. Don't add stack-specific things to the generic core — put them under `skeletons/` instead.

Collaborators using **Option A (GitHub Template)** can pull updates by manually copying changed files. Collaborators using **Option D (local copy)** can `git pull` the template repo and re-run their copy.

## Contributing

Issues + PRs welcome. The bar for adding something to the generic core (`docs/`, `tooling/`, root configs) is: **does this apply to ≥80% of new projects?** If no, put it in a skeleton.

## License

MIT — see [`LICENSE`](LICENSE).
