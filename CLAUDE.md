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
  `title`, `date`, `description`, `tags` (plain `key: value`, parsed by hand in `lib/markdown.ts`).
  Every post needs EXACTLY three comma-separated tags; the build fails otherwise.
  The first post, `how-i-build-with-ai-agents`, carries numbers from the k-studio repo (first
  commit 2026-09-10, 325 commits, ~120k LOC, 42 tables, 32 specs, 14 ADRs, 89 test files +
  18 Playwright suites, ~350 landmines). Refresh them from there if they drift. `/agents` redirects to it.
- `/api/pdf` — the CV as a 2-page A4 PDF, drawn by Chromium from the live `/` (`lib/pdf.ts`, the
  k-studio approach: `@sparticuz/chromium` on Vercel, local Playwright Chromium elsewhere).
  Cached by the CDN for a day. Keep the `outputFileTracingIncludes` in `next.config.ts`.
- Next.js 16 App Router, plain CSS (`app/globals.css`, light/dark, print = A4 light).
- Fonts (`next/font/google`): Manrope for text (Vinh's choice, 2026-11-16), Geist Mono for dates,
  the contact line, pills and code, AND for page titles, the name and the menu links at weight
  500 (bold Manrope titles were "too bold"). `--title-*` in globals.css is shared by the big name,
  the bar's name and the menu's: keep them identical or the travelling name will not land. Neither Google subset has ← → arrows: on Vercel's Linux
  Chromium a missing glyph has no fallback font, so keep such symbols out of `resume.md`.
- Sticky top row: `.actions` (the page's top bar) is `position: sticky`, so the theme pill and
  "Save as PDF" simply stay where they are; the links and the text-size pill fade out (on phones
  "Save as PDF" too). `components/sticky-bar.tsx` draws the strip behind the row and holds the
  name on its left. The hand-over is CONTINUOUS and tied to the scroll, as on tungv.com (Vinh
  preferred it to k-studio's discrete view-transition morph). On the CV the big name travels in
  two legs so it never crosses the photo: UP while shrinking (scroll 0 → end), then LEFT along
  the bar (end → end + slide), landing exactly on the bar's name; then the two swap. The component
  measures `--head-end/-end2/-slide/-dx/-scale` and sets `data-head-stuck/-collapsed/-travels` on
  `<html>`; the motion is a CSS scroll-driven animation, with a requestAnimationFrame fallback.
- Phone and tablet header (≤60rem, so iPad and iPad mini upright; Vinh, 2026-11-16) is a menu button on the left and "Save as PDF" on the right, nothing
  else; scrolled, the name lands beside the button. The button (`components/site-menu.tsx`) opens
  a full-screen menu: Résumé, Blog, case studies, "Save as PDF", then a gap, then theme and text
  size; no divider lines. A project with `menu: no` in its front matter (Bảo Minh) is left out of
  the menu but keeps its page. Desk-wide screens (≥60rem, a tablet on its side included) keep
  the full row at the top of the page; once scrolled, the links fade out and the same menu
  button comes in over them (Vinh asked for the menu on desktop too, 2026-11-16).
- The menu is a native `<dialog>` that FADES IN IN PLACE: its top row is laid exactly over the
  page's (button position measured on open), and both buttons share one `open` state, so the bars
  are seen to cross into an X where they stand. Do not swap it for Vaul / shadcn's Drawer: on iOS
  Vaul pins `<body>` with `position: fixed`, which zeroes `scrollY`, and the header is driven by
  `scrollY` (the page looked like it jumped to the top when the menu opened; tried 2026-11-16).
- On phones the Values label is centred with the three words under it, and phone + email share a line.
- `bun run audit` compares page width with the SCREEN width: a phone browser widens `innerWidth`
  to fit an overflowing page, so comparing against `innerWidth` passes falsely.
- Values line under the summary comes from `values:` in `resume.md`'s front matter
  ("Ownership · Adaptability · Mentorship", chosen by Vinh 2026-11-16).
- Contact line: plain mono text; only GitHub has a mark. No X/Twitter (removed 2026-11-16). The
  location reads "Ho Chi Minh City, Viet Nam · Open to remote": Vinh is looking for a remote position.
- Background: faint graph paper behind the top of every page (`body::before`, k-studio's
  `.paper-grid` recipe: 28px grid at 5% of `--fg`, radial mask). Not printed.
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

0. Tags are labels only. Vinh wants "click a tag to search/filter posts" LATER (said 2026-11-16) —
   do not build it until he asks.

1. The Grab / Ninja Van / Dwarves years in `content/resume.md` are PLACEHOLDERS — Vinh replaces them.
2. Novorésumé (old CV) was partly updated (summary, headline, skills) before its free-plan gate
   blocked new entries; this site replaces it.
