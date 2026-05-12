# Skills & Agents

Curated list of Claude Code skills (from [skills.sh](https://skills.sh) or `~/.claude/skills/`) and sub-agents (`~/.claude/agents/`) that pair well with this template.

> During project init, **ask the user before installing**. Don't dump everything — pick what matches the project type from the interview.

## Universal (almost every project)

| Skill / Agent | Why | Trigger |
|---|---|---|
| `code-reviewer` (agent) | Reviews diffs for correctness, security, perf | spawn before merge |
| `graphify` (skill) | Knowledge graph of any folder | `/graphify` |
| `init` (skill, built-in) | Initialize CLAUDE.md from existing code | `/init` |
| `simplify` (skill, built-in) | Review changed code for reuse/quality | `/simplify` |
| `security-review` (skill, built-in) | Security review of pending changes | `/security-review` |
| `review` (skill, built-in) | Review a PR | `/review` |

## Web app projects

| Skill / Agent | Why |
|---|---|
| `backend-architect` (agent) | API design, system scaling |
| `frontend-developer` (agent) | React/Next.js implementation |
| `database-optimizer` (agent) | Schema, indexes, query perf |
| `ux-architect` (agent) | UX foundations, CSS systems |
| `ui-designer` (agent) | Visual design, components |
| `accessibility-auditor` (agent) | WCAG audits |
| `security-engineer` (agent) | Threat modeling, auth/payment review |
| `api-tester` (agent) | API validation, contract testing |
| `performance-benchmarker` (agent) | Load / perf testing |
| `ux-design-review` (skill) | UX/UI review of a page |
| `marketing-review` (skill) | Copy/CTA/SEO review of landing pages |

## CLI tools

| Skill / Agent | Why |
|---|---|
| `code-reviewer` (agent) | Diff review |
| `senior-developer` (agent) | Implementation expertise |
| `software-architect` (agent) | Module boundaries, patterns |

## API / SDK / Library projects

| Skill / Agent | Why |
|---|---|
| `backend-architect` (agent) | Public interface design |
| `api-tester` (agent) | Contract tests |
| `claude-api` (skill) | Anthropic SDK / API integration |

## Marketing / public site

| Skill / Agent | Why |
|---|---|
| `seo-specialist` (agent) | Technical SEO, content strategy |
| `content-creator` (agent) | Copy, editorial |
| `marketing-review` (skill) | Landing page review |
| `ads*` (skills) | Paid ad audits + creative generation |

## Mobile

| Skill / Agent | Why |
|---|---|
| `ads-apple` (skill) | Apple Search Ads if launching on App Store |

## Install paths

- **Built-in skills** (anything listed at session start under "Available skills") — nothing to install; just invoke with `/skill-name`.
- **Custom skills** — drop in `~/.claude/skills/<name>/SKILL.md`.
- **Sub-agents** — drop in `~/.claude/agents/<name>.md`. Spawn via the `Agent` tool with `subagent_type`.
- **From skills.sh** — follow the install command shown on the skill's page.

## Pointer for Claude

When picking a skill/agent at runtime, prefer:
1. A built-in skill if it matches exactly.
2. A sub-agent if the task is open-ended or needs parallel exploration.
3. Direct tool use (Read/Grep/Edit) for narrow, well-defined tasks.

Don't spawn agents redundantly. If you already know the answer, write the code.
