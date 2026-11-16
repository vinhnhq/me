# CLAUDE.md

Vinh Nguyen's résumé site, for a job search (targets: Vietnam companies + remote international).
Built 2026-11-16 in a session started from `~/github.com/k-studio`.

## Shape

- `content/resume.md` — the CV, the single source. Home page `/` and the PDF render it. Its front
  matter (name, headline, email, phone, location, github, x) and the paragraphs before the first
  `##` feed the header (`components/resume-header.tsx`); the rest is the body.
- Themes: light and dark only (`lib/themes.ts` + `[data-theme]` blocks in `app/globals.css`), one
  toggle button. The accent is K-Studio's `--primary` (wine on light, rose on dark) — Vinh's lucky
  colour, keep it. The choice is kept in localStorage; with none the page follows the system.
  Print and the PDF are always light.
- `content/blog/<slug>.md` — blog posts (`/blog`, `/blog/<slug>`), web only. Front matter is
  `title`, `date`, `description` (plain `key: value`, parsed by hand in `lib/markdown.ts`).
  The first post, `how-i-build-with-ai-agents`, carries numbers from the k-studio repo (first
  commit 2026-09-10, 325 commits, ~120k LOC, 42 tables, 32 specs, 14 ADRs, 89 test files +
  18 Playwright suites, ~350 landmines). Refresh them from there if they drift. `/agents` redirects to it.
- `/api/pdf` — the CV as a 2-page A4 PDF, drawn by Chromium from the live `/` (`lib/pdf.ts`, the
  k-studio approach: `@sparticuz/chromium` on Vercel, local Playwright Chromium elsewhere).
  Cached by the CDN for a day. Keep the `outputFileTracingIncludes` in `next.config.ts`.
- Next.js 16 App Router, plain CSS (`app/globals.css`, light/dark, print = A4 light).
- Font is Geist via `next/font/google`. Its Google subsets have no ← → arrows: on Vercel's Linux
  Chromium a missing glyph has no fallback font, so keep such symbols out of `resume.md`.
- Photo: `public/vinh-nguyen.jpg`, cropped from `~/Downloads/me/vinhn_square.jpg`.

## Facts behind the CV

- Freelance Jun 2025 – present, paid. Two projects:
  - Bảo Minh Gia Định insurance sales portal, Jun 2025 – Apr 2026, ~50 sales staff + customers,
    same stack as K-Studio, built with Cursor (more hand-coding). Retired when the parent company
    moved subsidiaries onto its group-wide platform.
  - K-Studio, Sep 2026 – present, built with Claude Code. Public demo (invented data, one-tap
    sign-in): https://k-studio-git-dev-vinhnguyen-projects.vercel.app — owner OK'd showing it.
- Grab / Ninja Van / Dwarves were three separate jobs, deliberately combined into one entry.

## Deploy

- Live at https://vinhn.dev (domain registered at Cloudflare, DNS-only CNAME to Vercel).
- GitHub `vinhnhq/me` (private) → Vercel project `vinhnguyen-projects/me`. A push to `main` deploys to production.

## Open

1. The Grab / Ninja Van / Dwarves years in `content/resume.md` are PLACEHOLDERS — Vinh replaces them.
2. Novorésumé (old CV) was partly updated (summary, headline, skills) before its free-plan gate
   blocked new entries; this site replaces it.
