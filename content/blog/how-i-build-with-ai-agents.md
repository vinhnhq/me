---
title: How I build with AI agents
date: 2026-11-16
description: The workflow, guardrails and numbers behind K-Studio, built with Claude Code.
---

I build production software with AI coding agents, mostly Claude Code. The agent writes most of the lines. I own the scope, the decisions, the review and what reaches production. This page explains how that works, using one real project you can open and click through.

**[Open the K-Studio demo →](https://k-studio-git-dev-vinhnguyen-projects.vercel.app)** It has invented data and one-tap sign-in, so you can try any role: admin, sales, photographer or couple.

## The project

[K-Studio](/projects/k-studio) is the operating system for a ~20-person wedding photo studio in Nha Trang. It replaced three things the studio ran by hand: an Excel cash book, a shoot schedule kept in Zalo, and a payroll sheet computed by hand. It covers contracts and invoices, shoot scheduling and crew, two money books (cash and bank), payroll, a photo-proofing gallery for couples, and server-rendered PDFs, in Vietnamese and English.

| | |
|---|---|
| First commit → daily production use | about 10 weeks (Sep → Nov 2026) |
| Commits | 325 |
| TypeScript in `src/` | ~120,000 lines, 823 files |
| Database | Postgres, 42 tables, 19 migrations |
| Specs / ADRs | 32 versioned specs, 14 architecture decision records |
| Tests | 89 unit/integration test files, 18 Playwright suites |
| Recorded pitfalls ("landmines") | ~350, each with what broke and what proves the fix |

Stack: Next.js (App Router), React 19, TypeScript, Postgres on Neon, Kysely, better-auth, Cloudflare R2, Vercel, Playwright, Vitest.

## The loop

Every change goes through the same six steps. I wrote them down once as a small package I reuse across projects (`@vinhnnn/dev-workflow`).

1. **Spec.** I talk to the studio owner and write what changes and why, in their own words, before any code. The agent drafts and I correct it.
2. **Plan.** The spec is broken into small tasks with acceptance criteria. Anything that settles a question for good becomes an ADR.
3. **Build.** The agent implements one task at a time. Business rules go in a pure domain layer (`src/domain/**`), one function per rule, each with a test. A rule that isn't a pure function with a test is in the wrong place.
4. **Test.** Gates the agent has to pass, not just run: type-aware lint, `tsc`, Vitest on in-memory repositories, a Postgres suite on a scratch database, and a Playwright suite that opens every page in light and dark themes, asserts it, and saves a screenshot.
5. **Review.** A review pass reads the diff as an adversary (a `ship-review` skill), and CI runs the same gates again. I read what matters: the money rules, permissions and migrations.
6. **Release.** `feature → dev → main`. Every service has a dev copy: Vercel preview, a Neon branch and an R2 bucket. Production migrations are a deliberate manual step, never something the agent runs on its own.

## What keeps the agent honest

Speed is easy with an agent. The work is making sure fast doesn't mean wrong. These are the parts that made the difference:

- **A map, not a manual.** `CLAUDE.md` points at the authoritative source for each area (scope, specs, decisions, vocabulary) instead of repeating them, so the agent reads the real source and not a stale copy.
- **A landmines file.** Every time something broke in a way that could happen again, it got a one-line title in `CLAUDE.md` and a full write-up: what broke, how it was found, and what proves the fix. The agent reads an area's section before touching it. Example: *"A cash deposit into the bank is a fund transfer, not revenue."*
- **A glossary for overloaded words.** In this studio, *show* means a paid shoot, *chốt sổ* means closing the day's cash book, and *ca* means a shift. Pinning those down stopped a whole class of plausible-looking mistakes.
- **Hooks.** A pre-tool guard runs before every shell command or file edit the agent makes. At the end of each session, a summary is written into the pull request, so every PR records what was done and why.
- **Screenshots as a gate.** Three blank pages once got past `tsc`, lint and the build. Now the e2e suite photographs every page, and a page that renders nothing fails.
- **Rules that read the code.** Some guards are tests over the source itself. For example, a test fails if a Vietnamese string appears outside a translation file.
- **No destructive shortcuts.** Seeds and resets ask before wiping a database someone is testing on. Production data is never touched by an agent's command.

## Before this: Cursor

The insurance sales portal for Bảo Minh Gia Định (Jun 2025 – Apr 2026, ~50 users) used the same stack, but was built with Cursor as an assistant rather than an agent. I wrote much more of the code by hand. The jump from that to K-Studio is the point: with a good harness, one engineer can deliver what used to take a small team, and still keep the tests, the records and the review.

## What I'd bring to a team

- Setting up the harness: repo instructions, skills, hooks and CI gates, so agents produce code a team can trust and review.
- Writing specs and ADRs that people and agents can both work from.
- Pairing that with 12 years of frontend and fullstack work, including leading teams of up to 8 and mentoring.
