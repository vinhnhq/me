# ADR-001: No comments in code; decisions live here

## Status

Accepted

## Date

2026-11-23

## Context

The code held 226 comments in 32 files. Most were decisions: why the menu is a native `<dialog>`,
why the audit compares with the screen's width, why a title takes one path into the bar and not
another. The same decisions were also written in `CLAUDE.md`, in other words, and the two copies
had begun to drift: a comment in `sticky-bar.tsx` still said the blog's title was "Blog" after the
home page's `h1` became the owner's name.

The sister project (K-Studio's landing page) made this move the same day, after Lauren Tan's talk
"All Code Is Slop (Except Mine)": a comment is either a rule a tool should enforce, a decision
that belongs in a record, or noise.

## Decision

- **No comments in code.** Every comment was deleted on 2026-11-23.
- **A decision is an ADR** in this folder, grouped by topic, with its numbers, dates, browser
  quirks and the "tried X first, it failed because Y" history.
- **Usage goes in the README.** Pending work is a GitHub issue.
- **`bun run check:comments`** (`scripts/check-comments.mjs`) fails on any comment in `app/`,
  `components/`, `lib/`, `scripts/` and `next.config.ts`. Tool directives are not comments:
  `react-doctor-disable-next-line`, `@ts-expect-error`, `@ts-ignore`, `eslint-disable`,
  `biome-ignore`.
- **The `/delete-comment` skill** repeats the triage: tautology, stale, excuse or decision.
- **Each fact has one home.** The README says how to run the site. `CLAUDE.md` is a map and a
  short list of traps a script cannot test. The reasoning is here only.

## Consequences

- A reader who wonders "why" looks here; `README.md` in this folder is the index.
- A directive that silences a tool no longer explains itself in place. The reasons are in
  ADR-010 (react-doctor) and ADR-008 (the plain `<img>` in the share cards).
- A new decision costs an ADR edit in the same change.
