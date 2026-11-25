# ADR-006: The PDF is the page, printed by Chromium

## Status

Accepted

## Date

2026-11-16 (drawn from /resume: 2026-11-18)

## Context

A recruiter wants a file. A second template for the PDF would drift from the page.

## Decision

- **`/api/pdf` prints the live `/resume`** with a real Chromium (`lib/pdf.ts`): the print sheet in
  `globals.css` applies (A4, light, the navigation hidden, margins from `@page`) and `page.pdf`
  writes it. There is no stored file to re-export after an edit.
- **Chromium**: `@sparticuz/chromium` on Vercel, this machine's Playwright Chromium elsewhere.
- **`serverExternalPackages` and `outputFileTracingIncludes` must stay** in `next.config.ts`.
  Tracing follows imports, not file reads: `playwright-core` reads its own `browsers.json` at
  load, and without the include the function answers 500 on Vercel.
- **It prints only a résumé.** The route refuses a page that did not answer 200 or that has no
  `[data-resume]`, so an error page or a preview deployment's login wall is never kept by the CDN.
- **Relative links are made absolute** against the public address: `/blog/x` means nothing on
  paper.
- **The CDN keeps the answer for a day**, so Chromium runs about once per deployment and then
  once a day.
- **The PDF must stay 2 pages.**
- **The route is a copy, not a page**: `x-robots-tag: noindex, nofollow`, `/api/` disallowed in
  `robots.txt`, and its links are `rel="nofollow"`.

## Consequences

- Any content or print-style change can push the résumé to a third page; `verify` checks it.
- A cold start takes a few seconds.
