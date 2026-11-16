---
title: K-Studio
date: 2026-11-16
description: The operating system for a ~20-person wedding photo studio: scheduling, cash books and payroll, shipped by one engineer in about 10 weeks with Claude Code.
tags: case-study, nextjs, ai-agents
role: Sole engineer: requirements, architecture, build, deploy and support
when: Sep 2026 – present
stack: Next.js (App Router), React 19, TypeScript, Postgres on Neon, Kysely, better-auth, Cloudflare R2, Vercel, Playwright, Vitest
link: https://k-studio-git-dev-vinhnguyen-projects.vercel.app
linkLabel: Open the live demo
---

K-Studio is a wedding photo studio in Nha Trang with about 20 people. Before this project it ran on three things kept by hand: an Excel cash book, a shoot schedule in a Zalo chat, and a payroll sheet computed at the end of each period. I replaced all three with one web app that the studio now uses every day.

The demo holds invented data and has one-tap sign-in, so you can try any role: admin, sales, photographer or couple.

## What it does

- **Contracts and invoices.** Each contract with its instalments, invoice and receipts, all available as server-rendered PDFs.
- **Scheduling and crew.** Shoots, who works on each one, and check-in on the day.
- **Two money books.** Cash and bank, closed daily. A cash deposit into the bank is a fund transfer, not revenue.
- **Payroll.** Crew pay derived from the work recorded, in periods that freeze once paid.
- **Photo proofing.** A gallery where couples pick and comment on their photos, stored on Cloudflare R2. It replaced a paid SaaS.
- **Four kinds of user.** Admins, sales, photographers and couples each see their own projection of the same contract, in Vietnamese or English.

## In numbers

| | |
|---|---|
| First commit → daily production use | about 10 weeks (Sep → Nov 2026) |
| Commits | 325 |
| TypeScript in `src/` | ~120,000 lines, 823 files |
| Database | Postgres, 42 tables, 19 migrations |
| Specs / ADRs | 32 versioned specs, 14 architecture decision records |
| Tests | 89 unit/integration test files, 18 Playwright suites |

## How it stays correct

An agent wrote most of the lines, so the design work went into making wrong code hard to ship.

- **Money rules are pure functions.** Every business rule lives in a domain layer, one function per rule, each with a unit test. A rule that isn't a pure function with a test is in the wrong place.
- **Decisions are written down.** Anything that settles a question for good becomes an architecture decision record, so neither a person nor an agent re-opens it by accident.
- **Every page is photographed.** The Playwright suite opens every page in light and dark themes, asserts it and saves a screenshot. Three blank pages once passed type-checking, lint and the build; they would not pass now.
- **Pitfalls are recorded.** About 350 "landmines", each with what broke, how it was found and what proves the fix. The agent reads an area's section before changing code in it.

The process behind this is in [How I build with AI agents](/blog/how-i-build-with-ai-agents).
