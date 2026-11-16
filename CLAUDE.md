# CLAUDE.md

Vinh Nguyen's résumé site, for a job search (targets: Vietnam companies + remote international).
Built 2026-11-16 in a session started from `~/github.com/k-studio`.

## Shape

- `content/resume.md` — the CV, the single source. Home page `/` and the PDF render it. Its front
  matter (name, headline, email, phone, location, github, x) and the paragraphs before the first
  `##` feed the header (`components/resume-header.tsx`); the rest is the body.
- Reader controls in the top bar (`components/reader-controls.tsx`, `lib/themes.ts`): pill-shaped
  segmented buttons in the style of tungv.com — text size (S/M/L, hidden on phones) and theme
  (light / dark / follow the device) — plus a "Save as PDF" pill on the CV. Choices are kept in
  localStorage. Print and the PDF are always light at the default size.
- Accent is burgundy `#800020` (Vinh's lucky colour — keep it); on dark it is a lighter red,
  `oklch(0.66 0.18 18)`, because burgundy itself is unreadable on a dark page.
- Favicon: `app/icon.tsx` (white "VN" on a burgundy disc) and `app/apple-icon.tsx` (same, square).
- To check on a real iOS Safari: `xcrun simctl openurl booted http://localhost:<port>/` then
  `xcrun simctl io booted screenshot <file>` (Vinh keeps Device Hub open). Add a `?r=N` query if it
  shows stale CSS.
- Text size: medium (the default) is 17px, small 16px, large 19px (`html[data-size]`).
- A full-page Playwright screenshot drops touch emulation (k-studio's landmine, met again here):
  judge touch layouts from viewport screenshots or the simulators, never from `fullPage: true`.
- In `resume.md`, a job is `### Title` + an italic `*Org · Dates · Where*` line (read from the
  end, so the org may itself contain " · "). Bullets under a `<!-- more -->` line are folded on
  the web ("All N highlights") and printed in full in the PDF (`components/resume-body.tsx`).
  Jobs are ONE column on every screen (Vinh, 2026-11-16: no dates column, not even on desktop).
- `content/projects/<slug>.md` — case studies (`/projects/<slug>`), linked from CV bullets. Front
  matter: `title`, `summary`, `role`, `when`, `stack`, optional `link` + `linkLabel`.
  `bao-minh-portal.md` is thin: it holds only the facts below — Vinh should add detail.
- Phone rules (taken from k-studio's ui-review): no sideways overflow, 44px targets on any touch
  screen (`@media (pointer: coarse)`), `touch-action: manipulation`, text ≥ 12px, contrast ≥ 4.5:1.
  `bun run audit [baseUrl]` measures all of it on 320/390/820px × light/dark — run it after UI changes.
- `content/blog/<slug>.md` — blog posts (`/blog`, `/blog/<slug>`), web only. Front matter is
  `title`, `date`, `description` (plain `key: value`, parsed by hand in `lib/markdown.ts`).
  The first post, `how-i-build-with-ai-agents`, carries numbers from the k-studio repo (first
  commit 2026-09-10, 325 commits, ~120k LOC, 42 tables, 32 specs, 14 ADRs, 89 test files +
  18 Playwright suites, ~350 landmines). Refresh them from there if they drift. `/agents` redirects to it.
- `/api/pdf` — the CV as a 2-page A4 PDF, drawn by Chromium from the live `/` (`lib/pdf.ts`, the
  k-studio approach: `@sparticuz/chromium` on Vercel, local Playwright Chromium elsewhere).
  Cached by the CDN for a day. Keep the `outputFileTracingIncludes` in `next.config.ts`.
- Next.js 16 App Router, plain CSS (`app/globals.css`, light/dark, print = A4 light).
- Fonts (`next/font/google`): Manrope for text (Vinh's choice, 2026-11-16), Geist Mono for dates,
  the contact line, pills and code. Neither Google subset has ← → arrows: on Vercel's Linux
  Chromium a missing glyph has no fallback font, so keep such symbols out of `resume.md`.
- Sticky bar (`components/sticky-bar.tsx`): takes over as the page's `h1` reaches the top — name
  (link home), theme, the page's action. Built like k-studio's `collapsing-page-head.tsx`: a
  discrete flip at a scroll threshold (with hysteresis) drawn as a view transition; on the CV the
  big name morphs into the bar's name (`page-title`), the bar fades (`page-bar`), the page itself
  is opted out of capture. No CSS transition on the bar, no backdrop blur. Theme/size state lives
  on `<html>` and is shared between both bars through a `reader-settings` event.
- Values line under the summary comes from `values:` in `resume.md`'s front matter
  ("Ownership · Adaptability · Mentorship", chosen by Vinh 2026-11-16).
- Contact line: plain mono text, no icons except the X and GitHub marks (same handle on both).
- Wave footer on every page (`components/wave-footer.tsx` + `.waves` in globals.css): CSS-only,
  scroll-driven, modelled on Vinh's friend Tung's site (tungv.com). Hidden in print.
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
- GitHub `vinhnhq/me` (private) → Vercel project `vinhnguyen-projects/me`. A push to `main` deploys to production,
  so commit locally and push only on Vinh's go (2026-11-16: "don't need to deploy prod", changes are batched).

## Open

1. The Grab / Ninja Van / Dwarves years in `content/resume.md` are PLACEHOLDERS — Vinh replaces them.
2. Novorésumé (old CV) was partly updated (summary, headline, skills) before its free-plan gate
   blocked new entries; this site replaces it.
