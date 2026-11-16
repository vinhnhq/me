---
title: K-Studio
date: 2026-11-17
description: The operating system for a ~20-person wedding photo studio: scheduling, cash books and payroll, shipped by one engineer in about 10 weeks with Claude Code.
tags: case-study, nextjs, ai-agents
role: Sole engineer: requirements, architecture, build, deploy and support
when: Sep 2026 – present
stack: Next.js (App Router), React 19, TypeScript, Postgres on Neon, Kysely, better-auth, Cloudflare R2, Vercel, Playwright, Vitest
---

K-Studio is a wedding photo studio in Nha Trang with about 20 people. Before this project it ran on three things kept by hand: an Excel cash book, a shoot schedule in a Zalo chat, and a payroll sheet computed at the end of each period. I replaced all three with one web app that the studio now uses every day. It went from first commit to daily use in about 10 weeks, with an AI agent (Claude Code) writing most of the lines.

It has two sides: an internal app for the staff, and a portal for each couple. The internal app is behind sign-in, so there is nothing public to open. The screens below stand in for it, and every one shows invented data.

![The K-Studio sign-in page: the studio's mark, fields for email or phone and a password, and switches for Vietnamese or English and for the light or dark theme.](/blog/k-studio/sign-in-1600x700.jpg "The front door. Staff sign in with an email or phone number; language and theme can be changed before signing in.")

## In numbers

- **About 10 weeks** from first commit to daily production use (Sep to Nov 2026).
- **The same day** from first commit to a prototype the owner could click.
- **325 commits**, ~120,000 lines of TypeScript in 823 files.
- **42 tables and 19 migrations** in Postgres.
- **32 versioned specs and 14 architecture decision records.**
- **89 unit and integration test files and 18 Playwright suites.**
- **Three platforms, two themes, two languages:** phone, tablet and desktop, in light and dark, in Vietnamese and English.

## The internal app

One contract runs through the whole studio: sales sign it, the shoot is scheduled and the crew assigned, photographers check in on the day, and the books and the payroll are derived from what was recorded. Admins, sales and photographers each see their own projection of that contract.

![The K-Studio home screen on a desktop: a greeting, check-in and the morning checklist, a list of contracts that need crew assigned, and the week's calendar.](/blog/k-studio/home-1600x1000.jpg "The home screen. It opens on what needs doing today, not on a dashboard of totals.")

- **Contracts and invoices.** Each contract with its instalments, invoice and receipts, all drawn as PDFs on the server.
- **Scheduling and crew.** Shoots, who works on each one, and check-in on the day.
- **Two money books.** Cash and bank, closed daily. A cash deposit into the bank is a fund transfer, not revenue.
- **Payroll.** Crew pay derived from the work recorded, in periods that freeze once paid.

![The income and spending report for a month: cash and bank funds side by side with opening balance, income, spending, transfers and closing balance, then summary cards and a table of every line.](/blog/k-studio/books-1600x1000.jpg "The books for a month, cash and bank side by side.")

![A service contract as paper: name and contract number, a table of services with quantity, unit price and amount, and buttons for the contract, invoice, receipts and PDF download.](/blog/k-studio/contract-paper-1730x1330.jpg "The contract as paper. The same page prints the invoice and every receipt.")

## The customer portal

Each couple gets a private link, with no account to create. It shows where their contract stands in their own words (deposit, shoot, photo selection, retouching, delivery), their shoot days and their contact at the studio. They send wishes and references before the shoot, pick and comment on their photos after it, and decide whether the studio may show their photos to other couples. They never see the studio's internal notes.

![Three phone screens of the couple's portal: the progress of the contract from deposit to delivery, the shoot days and the studio contact with a brief to fill in, and the photo selection with a consent switch and a feedback box.](/blog/k-studio/portal-1600x1040.jpg "The couple's portal on a phone: progress, details and brief, then photo selection and feedback.")

The photo proofing gallery stores its files on Cloudflare R2 and replaced a paid SaaS.

## How it was built

1. **Business first.** I talked to the owner and read what the studio already used: the real payroll sheet, cash book and price list. That gave a short scope (four lines of business, the life of one contract, twelve areas to build) and a glossary. In this studio *show* means a paid shoot and *chốt sổ* means closing the day's cash book; pinning those words down stopped a whole class of plausible-looking mistakes, by me and by the agent.
2. **The wireframe was a working prototype.** With an agent, a clickable prototype costs about what a drawing used to. The first commit was the real screens on invented data, at an address the owner could open on his own phone. A week later he clicked through one whole wedding and came back with eleven asks, all before the real backend was built.
3. **Then the real system, under the screens he had agreed.** The prototype kept honest in-memory state, so the first database was a transcription, not a design. Every business rule became a pure function with a unit test; repositories come in an in-memory kind for fast tests and a Postgres kind tested against a real database; server actions decide nothing.

## The loop that keeps speed from costing quality

Speed is easy with an agent. The work is making sure fast doesn't mean wrong. Every change goes through the same six steps (spec, plan, build, test, review, release), and machines do most of the checking:

- **Gates the agent has to pass, not just run.** Type-aware lint, `tsc`, unit tests, a Postgres suite on a scratch database, and Playwright.
- **Every page is photographed.** The Playwright suite opens every page in light and dark, asserts it and saves a screenshot. Three blank pages once passed type-checking, lint and the build; they would not pass now.
- **An accessibility audit that fails the run.** Text contrast below 4.5:1, a touch target under 44×44 pixels, a form field under 16px on touch, text under 12px, a page that scrolls sideways, or any console error. The audit tests itself first: if it misses two texts planted to fail, it reports itself blind.
- **Pitfalls are recorded.** About 350 "landmines", each with what broke and what proves the fix. The agent reads an area's section before changing code in it.
- **The studio sees it before production does.** Work moves from a feature branch to a `dev` copy with its own database and storage, where the staff click through it, and only then to `main`.

![Three phone screens side by side: the home screen with tasks that need action, the cash book with the cash and bank funds for the day, and the weekly schedule with shift registration.](/blog/k-studio/phones-1600x1040.jpg "The internal app on a phone: home, the cash book and the schedule.")

![Three tablet screens side by side: the home screen, the list of contracts as cards in two columns, and the income and spending report.](/blog/k-studio/tablets-1600x900.jpg "On a tablet. An iPad is a touch screen, so the 44-pixel rule applies there too.")

![The income and spending report in the dark theme, on true black with cards one step lighter.](/blog/k-studio/books-dark-1600x1000.jpg "The same report in the dark theme.")

The process in full is in [How I build with AI agents](/blog/how-i-build-with-ai-agents).

## What it taught me

- **Read the source documents before designing.** A layout that looks good on invented data is the most common trap when the screens come first. The real sheets are the specification.
- **Clicking beats reading.** The owner's eleven asks came from clicking through a wedding on his phone, not from reading a document.
- **A correction made twice is a rule.** "Reduce the bold" came three times before it became "weight 400 everywhere" in a decision record. Write the rule the second time.
- **Hidden is not blocked.** A photographer who typed the address of the overview page still saw revenue. Hiding a link is half the job; the page and the action must refuse too.
- **The expensive bugs are silent.** Three of the four worst ones did not crash and turned no test red. One was a date that slipped back a day at UTC+7, wrong only in Vietnam.
