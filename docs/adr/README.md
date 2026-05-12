# Architecture Decision Records (ADRs)

We capture significant architectural decisions here, one Markdown file per decision, numbered sequentially. Format: [Michael Nygard's lightweight ADR template](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/locales/en/templates/decision-record-template-by-michael-nygard/index.md).

## When to write one

- An irreversible / expensive-to-reverse choice (DB engine, auth provider, deployment target, framework upgrade).
- A choice between two genuinely defensible options where future-you will ask "why did we pick this?".
- A pattern that constrains future work (e.g. "all timestamps are UTC", "soft delete only").

## When NOT to write one

- Style preferences (use linter rules instead).
- Reversible tactical choices (commit message is enough).
- Anything you'll regret 6 months from now if it's frozen in writing.

## Convention

- Filename: `NNNN-short-kebab-case-title.md` (4-digit, e.g. `0001-record-architecture-decisions.md`).
- First ADR is **always** `0001-record-architecture-decisions.md` — bootstraps the practice.
- Status moves through: `Proposed` → `Accepted` → (optionally) `Superseded by ADR-NNNN`.
- Never edit an ADR after acceptance. Supersede it with a new one and update the old one's `Status`.

## Template

```markdown
# NNNN. <Short title>

Date: YYYY-MM-DD
Status: Proposed | Accepted | Deprecated | Superseded by ADR-NNNN

## Context
What is the issue we are seeing? What is forcing a decision?

## Decision
What we decided and why, in one or two paragraphs.

## Consequences
What becomes easier? What becomes harder? What new risks does this introduce?

## Alternatives considered
- Option A: brief, why rejected
- Option B: brief, why rejected
```
