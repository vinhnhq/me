---
name: daily
description: The daily loop for this repository. Use when the user types /daily, asks "what is today's status" or "start the day", or when a scheduled run starts it. Checks the live site and the repository, then works at most one agent-ready issue to a pull request and waits for the owner.
---

# Daily

One pass, then stop. It never merges and never deploys.

## 1. Check

Run these and keep the last lines of each:

```bash
git fetch -q origin && git status -sb | head -1
gh run list --workflow daily --limit 1          # the scheduled check of the live site
gh run list --workflow checks --branch main --limit 1
gh pr list
gh issue list --label daily-check
gh issue list --label agent-ready
bun run audit https://vinhn.dev
bun run check:pdf https://vinhn.dev
```

`bun run check:rules` and `bun run check:comments` on `main` take seconds; run them too.

## 2. Decide

Take the first that applies, and only one:

1. **The live site fails** (a `daily-check` issue is open, or a check above failed): that is today's
   work. Use `/work-issue` on it.
2. **A pull request of yours is waiting for the owner**: do not start another. Report it and stop.
3. **An open pull request has failing checks or review comments**: fix those on its branch.
4. **An `agent-ready` issue is open**: work the oldest with `/work-issue`.
5. **Nothing**: say so. Do not invent work.

Issues labelled `needs-owner` are never started; list them in the report as waiting.

## 3. Report

Short, in this order: the live site (pass or what failed), what was worked and its pull request
link, what waits on the owner, what was not run. Then stop and wait.
