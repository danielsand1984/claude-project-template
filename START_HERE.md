# START HERE — Project Initialization Playbook

> **You are Claude Code.** The user just copied `_template/` to a new folder and asked you to initialize the project. Follow this playbook step-by-step. **Do not skip steps. Do not assume — ask.**

The goal of this playbook is **not** to dump a generic skeleton. The goal is to **understand this specific project**, then assemble exactly the right scaffold from what the template offers.

---

## Phase 1 — Interview (always)

Ask the user the following in batches via the `AskUserQuestion` tool. Match tone to the user (Dutch if they wrote Dutch, English if they wrote English). Don't ask everything at once — group related questions.

### Round 1 — What & why
1. **What does this project do?** (one paragraph in their own words)
2. **Who is the user?** (themselves, internal team, customers, public)
3. **What's the deliverable type?**
   - Web app (frontend + backend)
   - CLI tool
   - API only (no frontend)
   - Library / SDK
   - Background worker / service
   - Hybrid (multiple of the above)

### Round 2 — Stack & constraints
4. **Language preference per part?** (TypeScript, Python, Go, mixed)
5. **Hosting/runtime target?** (local only, Azure, Vercel, Docker, serverless, mobile)
6. **Persistence?** (none, SQLite, Postgres, blob storage, only-files)
7. **Multi-user/multi-tenant?** (single-user/desktop OR multi-user with auth OR multi-tenant SaaS)

### Round 3 — Working style
8. **Project name / package slug?** (kebab-case; will be used as folder + npm/pip name)
9. **Git remote already exist?** (GitHub URL or "create later")
10. **Use Beads (`bd`) for task tracking?** (recommended yes — far better than TODO files)
11. **Run Graphify on the codebase?** (recommended yes for non-trivial projects)

Adapt the questions if the answer to #3 is obvious — e.g. for a "Library" you don't need to ask about hosting.

After the interview, **summarize what you understood in 5 lines** and ask "klopt dit?" / "is this right?" before scaffolding.

---

## Phase 2 — Scaffold

Based on the interview, pick **one** primary skeleton from `skeletons/`:

| Project type from interview | Skeleton to use |
|---|---|
| Web app, API, or SaaS | `skeletons/web-app/` |
| CLI tool in TypeScript / Node | `skeletons/cli-node/` |
| CLI tool in Python | `skeletons/cli-python/` |
| Library / SDK | Pick `cli-*` matching language, strip the `bin/` entry |
| Background worker only | `skeletons/web-app/` minus frontend |
| Hybrid | `skeletons/web-app/` as the spine, mix in CLI as needed |

### Scaffold steps

1. **Copy the chosen skeleton contents** into the project root (not into a subfolder). Use `Copy-Item` / `cp -r`.
2. **Delete** the `skeletons/` folder and any unused skeleton — the project should have **no leftover unused code**.
3. **Rename placeholders** throughout the codebase:
   - `{{PROJECT_NAME}}` → kebab-case project name
   - `{{PROJECT_TITLE}}` → human-readable title
   - `{{PROJECT_DESCRIPTION}}` → one-sentence description
   - `{{AUTHOR_NAME}}` → from `git config user.name`
   - `{{AUTHOR_EMAIL}}` → from `git config user.email` or the user's email in memory
   - `{{YEAR}}` → current year
4. **Copy `CLAUDE.template.md` → `CLAUDE.md`** at project root and fill in placeholders based on the interview. Keep sections that apply; **delete sections that don't** (don't leave empty stubs).
5. **Rename template config files**: `package.template.json` → `package.json`, `pyproject.template.toml` → `pyproject.toml`, `ci.template.yml` → `ci.yml`.
6. **Update `docs/`**:
   - Customize `docs/coding-principles.md` if any rule doesn't apply (e.g. drop the `org_id` rule for a single-user CLI).
   - Initialize `docs/ACTIVE_TASKS.md` from the template.

---

## Phase 3 — Tooling install

### 3a — Init git
```bash
git init -b main
git add -A
git commit -m "chore: initial scaffold from _template"
```
If the user provided a remote URL, add it and push.

### 3b — Init Beads (auto-install if missing, fall back to ACTIVE_TASKS.md as last resort)

**Step 1 — Check whether `bd` is already installed:**

```bash
bd --version
```

**If `bd` is available** (exit code 0) → jump to "Step 3 — Init" below.

**Step 2 — If `bd` is NOT installed, offer auto-install:**

Ask the user:
> "Beads (`bd`) is niet geïnstalleerd. Wil je dat ik het nu automatisch installeer? (~37 MB download, gaat naar `~/.beads/bin/`)"

If **yes**, run the bundled install script:
- **Windows**: `pwsh -ExecutionPolicy Bypass -File tooling/install-beads.ps1`
- **macOS / Linux**: `bash tooling/install-beads.sh`

After it finishes, verify with `bd --version` again. On Windows the PATH update only applies to **new** terminals — Claude may need to use the full path `~/.beads/bin/bd.exe` for the current session.

If install **succeeds** → go to Step 3.

If install **fails** OR the user said **no** → go to Step 4 (fallback).

**Step 3 — Init (when `bd` is available):**

- Run `bd init --stealth`.
- `.beads/` is already gitignored.
- Read `tooling/beads-setup.md` for context, then **delete** `tooling/beads-setup.md`, `tooling/install-beads.ps1`, `tooling/install-beads.sh`.
- Create 3 seed issues from the interview — typically "Set up dev environment", "Implement core flow X", "Add CI gate". Use `bd create -t task -p high "..."`.
- Delete `docs/ACTIVE_TASKS.template.md` — Beads is the task tracker now.

**Step 4 — Fallback (when `bd` is unavailable):**

- Rename `docs/ACTIVE_TASKS.template.md` → `docs/ACTIVE_TASKS.md` and write the 3 seed tasks there as a markdown checklist.
- Keep `tooling/beads-setup.md` and `tooling/install-beads.{ps1,sh}` — the user might install `bd` later.
- Tell the user clearly:
  > "Beads is niet geïnstalleerd en auto-install lukte niet (of je koos ervoor over te slaan). Ik gebruik nu `docs/ACTIVE_TASKS.md` als fallback. Wil je later alsnog `bd` installeren, draai `tooling/install-beads.ps1` (Windows) of `tooling/install-beads.sh` (macOS/Linux)."
- In `CLAUDE.md`, replace any "use `bd`" references with "track tasks in `docs/ACTIVE_TASKS.md` (or migrate to `bd` later)".

### 3c — Install Claude Code skills / agents
Read `tooling/skills-and-agents.md`. Based on the project type, install or symlink the relevant skills. For example:
- Web app → `code-reviewer`, `security-engineer`, `accessibility-auditor`, `ux-architect`
- API → `backend-architect`, `api-tester`
- Python CLI → `code-reviewer`, `python-formatter` if available
- Public/marketing site → `seo-specialist`

**Ask** before installing — don't dump everything.

After install, **delete `tooling/skills-and-agents.md`**.

### 3d — Optional: run Graphify
If the user said yes:
```
/graphify .
```
This produces `graphify-out/` — already gitignored.

---

## Phase 4 — Verify

1. Run the formatter/linter that ships with the skeleton — must pass on the empty scaffold.
2. **If `bd` was installed**: run `bd status` — must show your seed issues. **If not**: open `docs/ACTIVE_TASKS.md` and confirm the seed tasks are listed.
3. Run `git status` — must be clean.
4. Open the project's `README.md` and confirm placeholders are gone.

Report back to the user with:
- What was set up
- What was deleted
- Whether Beads is active or whether you fell back to `ACTIVE_TASKS.md`
- The first task they should pick up

---

## Things NOT to do

- ❌ Don't keep `skeletons/` after scaffolding — it's noise.
- ❌ Don't leave `{{PLACEHOLDER}}` strings in any file you generated.
- ❌ Don't keep `START_HERE.md` after init — it's done its job. **Delete it on the final commit.**
- ❌ Don't keep sections in `CLAUDE.md` that don't apply to this project.
- ❌ Don't introduce dependencies that weren't agreed in the interview.
- ❌ Don't create TODO files — use `bd`.
- ❌ Don't run `npm install` / `pip install` without asking first.

## Things to ALWAYS do

- ✅ Translate placeholder strings.
- ✅ Use `bd` for task tracking.
- ✅ Keep `CLAUDE.md` short and project-specific — long generic docs get ignored.
- ✅ Commit the initial scaffold as one commit so the user can `git diff HEAD~1` to see what was added.
- ✅ Save anything you learned about the user / their conventions to **auto-memory**.
