# 0001. Record architecture decisions

Date: {{TODAY}}
Status: Accepted

## Context

As the project grows we will make decisions that constrain future work — database choice, auth provider, deployment target, language conventions. Without a record we lose the "why" within months, and new contributors (human or AI) re-litigate settled questions or, worse, silently undo them.

## Decision

We will capture architecturally significant decisions as ADRs in [`docs/adr/`](.) using the [Michael Nygard format](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/locales/en/templates/decision-record-template-by-michael-nygard/index.md). One Markdown file per decision, sequentially numbered.

Threshold for an ADR: the decision is **irreversible or expensive to reverse** AND would prompt "why did we pick this?" if someone re-encountered it in six months.

## Consequences

**Easier:**
- Onboarding (humans and AI agents) has authoritative answers for "why is X this way?"
- Reviewing a change against ADRs gives a quick "does this violate a recorded decision?" check.
- We catch ourselves before silently reversing prior choices.

**Harder:**
- Every meaningful decision now costs ~20 minutes of writing.
- We have to maintain ADR discipline — a stale or unread ADR is worse than none.

**Risks:**
- ADRs become aspirational rather than descriptive ("we should use X" when we actually use Y).
- The bar drifts down and we write ADRs for trivia, diluting the signal.

## Alternatives considered

- **No formal record.** Rejected: we already see the cost when re-discussing settled topics.
- **Long-form docs in `docs/`.** Rejected: they bit-rot without the explicit "this is a decision, not a how-to" framing.
- **GitHub Discussions / issues.** Rejected: not searchable from inside the repo, easy to lose.
- **Wiki.** Rejected: drift between code and wiki is the rule, not the exception.
