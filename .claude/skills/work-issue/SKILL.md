---
name: work-issue
description: Work one GitHub issue to a verified pull request and stop for the owner. Use when the user types /work-issue <number>, says "work on issue N", or when /daily picks an issue. A bounded goal loop — the checks are the stop condition, five tries is the limit, and it never merges.
---

# Work an issue

One issue, one branch, one pull request. The owner verifies and merges; you never do.

## The goal

> Issue #N is fixed, `bun run verify` passes, and the page looks the same unless the issue asks
> for a change. Stop after 5 tries.

## Steps

1. **Read.** `gh issue view N`. Read the ADRs it touches (`docs/decisions/README.md` is the index)
   and `CLAUDE.md`. If the issue is labelled `needs-owner`, or done cannot be stated as something
   a check can show, stop and say what is missing. Do not guess the owner's taste.
2. **Say what done is** in one or two lines: the behaviour that changes and the check that proves
   it. If no existing check can prove it, the first change is the check (a rule in
   `scripts/check-rules.mjs`, or a step in a `check-*.mjs`).
3. **Branch** from an up-to-date `main`: `fix/N-short-name` or `feat/N-short-name`.
4. **Make the smallest change** that satisfies the issue. No comments in code; a decision goes
   into its ADR in the same change.
5. **Verify, in this order, and fix what fails:**
   - `bun run typecheck && bun run check:comments && bun run check:rules` — seconds.
   - `bun run verify` — everything (a few minutes). `SKIP=real,visual` on a
     machine with no baseline pictures, and say so in the pull request.
   - `check:visual` must stay at 80/80 unless the issue changes the look. If it does, look at
     every picture in `visual/diff`, and re-save the baseline only for changes the issue asked for.
6. **Have it checked by another agent.** Spawn one reviewer (`agent-skills:code-reviewer`) with the
   diff and the issue, not your conclusion. Fix what it finds that is real; rerun the checks it
   touches. One maker, one checker: no more agents than that.
7. **Open the pull request** (`gh pr create`), with `Closes #N`, what changed, each check with its
   result, and what was NOT verified. Conventional commit messages.
8. **Stop.** Report the pull request link and the preview URL. Do not merge, do not deploy.

## When to stop early

- **Five tries** at step 5 without a pass.
- **The third try changes nothing** the second did not: the same failure, the same output.
- **A check must be weakened to pass** — a floor lowered, a rule removed, an exemption added, a
  baseline re-saved for a change nobody asked for. That is the owner's decision.
- The change touches what the résumé claims (a date, a title, a number, a skill): the owner writes those.

In each case: leave the branch, write on the issue what was tried and what failed, and stop.
