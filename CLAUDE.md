# CLAUDE.md

Vinh Nguyen's résumé site, for a job search (targets: Vietnam companies + remote international).
Built 2026-11-16 in a session started from `~/github.com/k-studio`.

## Shape

- `content/resume.md` — the CV, the single source. Home page `/` and the PDF render it.
- `content/agents.md` — "How I build with AI agents" (`/agents`), web only. Numbers come from
  the k-studio repo (first commit 2026-09-10, 325 commits, ~120k LOC, 42 tables, 32 specs,
  14 ADRs, 89 test files + 18 Playwright suites, ~350 landmines). Refresh them from there if they drift.
- Next.js 16 App Router, static, plain CSS (`app/globals.css`, light/dark, print = A4 light).
- `bun run pdf` (site must be running on :3100) → `public/vinh-nguyen-resume.pdf`, 2 pages.

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
- After a CV change, re-export the PDF before pushing: `SITE_URL=https://vinhn.dev bun run pdf`
  (site running on :3100, or pass another base URL as the first argument).

## Open

1. The Grab / Ninja Van / Dwarves years in `content/resume.md` are PLACEHOLDERS — Vinh replaces them.
2. Novorésumé (old CV) was partly updated (summary, headline, skills) before its free-plan gate
   blocked new entries; this site replaces it.
