---
name: delete-comment
description: Triage and delete code comments in this repository. Use when `bun run check:comments` fails, when the user types /delete-comment, or after work that left comments behind. Sorts each comment into tautology, stale, excuse or decision record; deletes it; files an issue for an excuse; moves a decision into docs/decisions.
---

# Delete comments

Code in this repository carries no comments (ADR-001). `bun run check:comments`
fails on any comment in `app/`, `components/`, `lib/`, `scripts/` and `next.config.ts`, except tool directives
(`react-doctor-disable-next-line`, `@ts-expect-error`, `@ts-ignore`, `eslint-disable`, `biome-ignore`).

## Steps

1. Run `bun run check:comments`. It prints every comment as `file:line  first line`. Read each one
   in its file, with the code around it.
2. Sort each comment into one category:

   | Category | What it is | Action |
   |---|---|---|
   | Tautology | Repeats what the code shows: a section divider, a prop described by its own name | Delete |
   | Stale | Describes code or behaviour that is no longer there | Delete |
   | Excuse | Lets a hack or unfinished work stand: "for now", "until", "not yet", "workaround", "TODO" | Delete, and file an issue: `gh issue create` with what is wrong, where, and what done looks like |
   | Decision record | A non-obvious choice: why this and not the obvious thing, what was tried first, a browser quirk, a measured number | Move into `docs/decisions/` |

3. For a decision record, look for the ADR that already covers the topic (`docs/decisions/README.md`
   is the index) and add to it. Write a new `ADR-NNN-title.md` only for a new topic, continuing the
   numbering, with the sections Status, Date, Context, Decision, Alternatives considered (only real
   ones), Consequences. Keep the numbers, dates, versions and the "tried X, failed because Y".
4. If a trap would catch an agent that has not read the ADR, add one line to the Traps list in
   `CLAUDE.md`, pointing at the ADR.
5. If a name can say what the comment said, rename instead (`DWELL` → `DWELL_MS`).
6. Run `node scripts/check-comments.mjs --strip` to remove what is left, then `bun run check:comments`
   and `bun run typecheck`. A directive must stay directly above the line it silences.
7. Report: how many comments in each category, the issues filed, the ADRs written or changed, and
   the lines removed (`git diff --shortstat`).

## Rules

- Never delete a decision without moving it. When unsure between tautology and decision, treat it
  as a decision.
- Never file an issue for something that is already done; check the code first.
- Do not strip before the triage: `--strip` is the last step, not the first.
