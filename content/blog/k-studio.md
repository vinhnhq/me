---
title: K-Studio
date: 2026-11-17
description: The operating system for a ~20-person wedding photo studio: scheduling, cash books and payroll, shipped by one engineer in about 10 weeks with Claude Code.
tags: case-study, nextjs, ai-agents
role: Sole engineer: requirements, architecture, build, deploy and support
when: Sep 2026 – present
stack: Next.js (App Router), React 19, TypeScript, Postgres on Neon, Kysely, better-auth, Cloudflare R2, Vercel, Playwright, Vitest
link: https://k-studio-git-dev-vinhnguyen-projects.vercel.app
linkLabel: Open the live demo
---

K-Studio is a wedding photo studio in Nha Trang with about 20 people. Before this project it ran on three things kept by hand: an Excel cash book, a shoot schedule in a Zalo chat, and a payroll sheet computed at the end of each period. I replaced all three with one web app that the studio now uses every day.

This page is how it was built, in the order it happened: understand the business, show a working prototype within days, agree the screens with the owner, and only then build the real system underneath. An AI agent (Claude Code) wrote most of the lines. I owned the scope, the decisions, the review and what reached production.

The demo holds invented data and has one-tap sign-in, so you can try any role: admin, sales, photographer or couple. Every screen on this page is from that demo.

![The K-Studio home screen on a desktop: a greeting, check-in and the morning checklist, a list of contracts that need crew assigned, and the week's calendar.](/blog/k-studio/home-1600x1000.jpg "The home screen. It opens on what needs doing today, not on a dashboard of totals.")

## In numbers

| | |
|---|---|
| First commit to daily production use | about 10 weeks (Sep to Nov 2026) |
| First commit to a prototype the owner could click | the same day |
| Commits | 325 |
| TypeScript in `src/` | ~120,000 lines, 823 files |
| Database | Postgres, 42 tables, 19 migrations |
| Specs / ADRs | 32 versioned specs, 14 architecture decision records |
| Tests | 89 unit/integration test files, 18 Playwright suites |
| Screens | phone, tablet and desktop, each in light and dark, in Vietnamese and English |

## 1. Start with the business, not the screens

I began by talking to the owner and reading what the studio already used: the real payroll sheet, the real cash book, the real price list and the shared schedule. Later, before restructuring the data model, I went back to the two live sheets and counted them by script instead of skimming them.

That reading produced a short scope document: the four lines of business (photography, video, gown rental and make-up), the life of one contract from enquiry to delivered photos, and twelve areas to build. It also produced a glossary. In this studio *show* means a paid shoot, *chốt sổ* means closing the day's cash book, and *ca* means a shift. Pinning those words down early stopped a whole class of plausible-looking mistakes, by me and by the agent.

Reading the source documents first is the reason the screens survived contact with real data. A layout that looks good on invented data is the most common trap when the screens come first.

## 2. The wireframe was a working prototype

There was no separate wireframe file. With an agent, a clickable prototype costs about what a drawing used to, so the first commit was the prototype: the real screens on invented data, deployed to a preview address the owner could open on his own phone.

- **A catalogue page came before the pages.** One page that shows every part the app is built from. Each new screen had a home the same day, and the catalogue caught a sideways overflow at phone width that a desktop check never would.
- **The owner reviewed in rounds, on his phone.** Two bugs existed only on his iPhone and were invisible in a desktop browser's device mode. A round on a real device before each preview became a rule.
- **A correction made twice became a rule.** "Reduce the bold" came three times before it became "weight 400 everywhere" in a decision record, applied across the whole product. The second time a correction repeats, write the rule; it is cheaper than a third round.
- **One wedding, start to finish.** A week in, the owner could click through a whole contract. He walked through one wedding and came back with eleven asks. None was large, and all of them arrived before the real backend was built.

## 3. Then the real system, under the screens the owner agreed

Because the prototype kept honest in-memory state, the first database was a transcription, not a design: the stores became tables almost column for column, and the invented data became the seed.

The real backend was then built one slice at a time, while the screens kept reading the same shapes:

- **Rules are pure functions.** Every business rule lives in a domain layer, one function per rule, each with a unit test. A rule that isn't a pure function with a test is in the wrong place.
- **Repositories come in two kinds.** An in-memory one for fast tests, and a Postgres one that is tested against a real database.
- **Server actions decide nothing.** They set up the request, call the rule and map the outcome.

![The income and spending report for a month: cash and bank funds side by side with opening balance, income, spending, transfers and closing balance, then summary cards and a table of every line.](/blog/k-studio/books-1600x1000.jpg "The books for a month: cash and bank side by side. A cash deposit into the bank is a fund transfer, not revenue.")

What it covers now:

- **Contracts and invoices.** Each contract with its instalments, invoice and receipts, all available as server-rendered PDFs.
- **Scheduling and crew.** Shoots, who works on each one, and check-in on the day.
- **Two money books.** Cash and bank, closed daily.
- **Payroll.** Crew pay derived from the work recorded, in periods that freeze once paid.
- **Photo proofing.** A gallery where couples pick and comment on their photos, stored on Cloudflare R2. It replaced a paid SaaS.
- **Four kinds of user.** Admins, sales, photographers and couples each see their own projection of the same contract.

![A service contract as the customer sees it: name and contract number, a table of services with quantity, unit price and amount, and buttons for the contract, invoice, receipts and PDF download.](/blog/k-studio/contract-paper-1730x1330.jpg "The contract as paper, in English. The same page prints the invoice and every receipt, and the PDF is drawn on the server.")

## 4. The loop that keeps speed from costing quality

Speed is easy with an agent. The work is making sure fast doesn't mean wrong. Every change goes through the same six steps: spec, plan, build, test, review, release.

- **The gates are passed, not just run.** Type-aware lint, `tsc`, unit tests on the in-memory repositories, a Postgres suite on a scratch database, and a Playwright suite.
- **Every page is photographed.** The Playwright suite opens every page in light and dark, asserts it and saves a screenshot. Three blank pages once passed type-checking, lint and the build; they would not pass now.
- **Pitfalls are recorded.** About 350 "landmines", each with what broke, how it was found and what proves the fix. The agent reads an area's section before changing code in it.
- **Decisions are written down.** Anything that settles a question for good becomes an architecture decision record, so neither a person nor an agent re-opens it by accident.
- **The studio sees it before production does.** Work moves from a feature branch to a `dev` copy with its own database and storage, where the staff click through it on invented data, and only then to `main`. Production migrations are a deliberate manual step, never something the agent runs on its own.

The process in full is in [How I build with AI agents](/blog/how-i-build-with-ai-agents).

## 5. Phone, tablet and desktop, checked by a script

The studio uses it on phones, tablets and desktop computers. The app supports exactly those three, each in a light and a dark theme, and a review covers all six.

![Three phone screens side by side: the home screen with tasks that need action, the cash book with the cash and bank funds for the day, and the weekly schedule with shift registration.](/blog/k-studio/phones-1600x1040.jpg "On a phone: home, the cash book and the schedule. The bar at the foot replaces the desktop's side menu.")

An audit script opens each page on its own platform and fails the run when:

- text contrast is below 4.5:1 against what is really behind it;
- a control's touch target is under 44×44 pixels on any touch screen;
- a form field is under 16px on touch (iOS would zoom the page);
- visible text is under 12px;
- the page scrolls sideways, or the browser console shows an error.

The audit tests itself first. Two texts that must fail are put on a real page, and if the audit does not catch both it stops and reports itself blind. That is not decoration: a checker that cannot read a colour passes everything.

![Three tablet screens side by side: the home screen, the list of contracts as cards in two columns, and the income and spending report.](/blog/k-studio/tablets-1600x900.jpg "On a tablet: the same parts, laid out for the width. An iPad is a touch screen, so the 44-pixel rule applies there too.")

![The income and spending report in the dark theme, on true black with cards one step lighter.](/blog/k-studio/books-dark-1600x1000.jpg "The same report in the dark theme. Colours come from tokens, so a fix to one theme is one line, not one per component.")

## What it taught me

- **Read the source documents before designing.** The real sheets are the specification.
- **Build one detail page early.** A list page is cheap. A detail page is where the data model shows its shape: the contract page forced a source, notes and a history into the model.
- **Hidden is not blocked.** A photographer who typed the address of the overview page still saw revenue. Hiding a link in the menu is half the job; the page and the action must refuse too.
- **The expensive bugs are silent.** Three of the four worst ones did not crash and turned no test red. One was a date that slipped back a day at UTC+7, wrong only in Vietnam. That class of bug is what the landmines file exists to stop.
- **Run it for real after every step.** Those bugs only showed up in the browser, never while reading the code.
