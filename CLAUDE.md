# CLAUDE.md

Vinh Nguyen's résumé site, for a job search (targets: Vietnam companies + remote international).
Live at https://vinhn.dev. Built 2026-11-16 in a session started from `~/github.com/k-studio`.

## Where things are

The site is TWO places: the CV, and a blog that holds everything else.

| Path | What |
|---|---|
| `content/resume.md` | The CV: the single source for `/` and for the PDF |
| `content/blog/<slug>.md` | Posts and case studies (`/blog`, `/blog/<slug>`) |
| `app/page.tsx`, `components/resume-header.tsx`, `components/resume-body.tsx` | The CV page |
| `app/blog/` | Blog list and post page |
| `app/api/pdf/route.ts`, `lib/pdf.ts` | The CV as a PDF, drawn on the server |
| `components/site-nav.tsx` | The top row of every page |
| `components/sticky-bar.tsx` | The bar the top row becomes when scrolled, and the travelling title |
| `components/site-menu.tsx` | The full-screen menu |
| `components/reader-controls.tsx`, `lib/themes.ts` | Theme and text-size pills |
| `components/wave-footer.tsx` | The wave lines at the foot of every page |
| `app/favicon.ico`, `app/icon.png`, `app/apple-icon.tsx` | The icon: white "VN" on a burgundy disc. Static files, so `/favicon.ico` exists. (The icon on the Vercel DASHBOARD is unrelated: it is the project's Avatar, uploaded by hand in Settings → General; set 2026-11-16) |
| `app/globals.css` | ALL styling: plain CSS, no Tailwind |
| `lib/markdown.ts` | Reads and parses everything in `content/` |
| `scripts/ui-audit.ts` | `bun run audit`: the phone audit |

Stack: Next.js 16 App Router, React 19, plain CSS, `marked`, Bun. No database, no CMS.

## Content rules

### `content/resume.md`

- Front matter (plain `key: value`, parsed by hand, no YAML library): `name`, `headline`, `email`,
  `phone`, `location`, `github`, `values`. These feed the header.
- The paragraphs before the first `##` are the summary (two paragraphs: who and where; how I work).
- A job is `### Title` + an italic `*Org · Dates · Where*` line. It is read from the END, so the
  org may itself contain " · " (three employers in one entry).
- Every bullet is shown, on the web and in the PDF. There was a "All N highlights" fold
  (`<!-- more -->`); Vinh had it removed on 2026-11-16. Do not bring it back.
- Keep ← → arrows and other unusual symbols OUT of this file: neither font's Google subset has
  them, and on Vercel's Linux Chromium a missing glyph has no fallback, so it prints as a box.
- The PDF must stay 2 pages. Check after any content change (see Verifying).

### `content/blog/<slug>.md`

- Front matter: `title`, `date` (ISO day), `description`, `tags`.
- EXACTLY three comma-separated tags per post; the build fails otherwise.
- A case study is an ordinary post tagged `case-study`, with `role`, `when`, `stack` (and optional
  `link` + `linkLabel`) added; the post page shows those as a facts block and a button.
- `how-i-build-with-ai-agents` and `k-studio` carry numbers from the k-studio repo (first commit
  2026-09-10, 325 commits, ~120k LOC, 823 files, 42 tables, 19 migrations, 32 specs, 14 ADRs,
  89 test files + 18 Playwright suites, ~350 landmines). Refresh them from there if they drift.
- Redirects in `next.config.ts`: `/agents` → the agents post, `/projects/k-studio` →
  `/blog/k-studio`, `/vinh-nguyen-resume.pdf` → `/api/pdf`.

## Decisions Vinh made (do not undo without asking)

All dated 2026-11-16.

- **Accent is burgundy `#800020`**, his lucky colour. On dark it is `oklch(0.66 0.18 18)`, because
  burgundy itself is unreadable on a dark page. Light and dark themes only.
- **Fonts:** Manrope for text; Geist Mono for dates, the contact line, pills, code, AND page
  titles, the name and menu links at weight 500 (bold Manrope titles were "too bold").
- **Jobs are ONE column on every screen.** No dates column, not even on desktop.
- **Values:** "Ownership · Adaptability · Mentorship".
- **Contact line:** plain mono text; only GitHub has a mark; no X/Twitter. Location reads
  "Ho Chi Minh City, Viet Nam · Open to remote" (he is looking for a remote position).
- **Skills:** Saga, MobX, AntD, Styled Components, WebdriverIO, Percy, Webpack, Immer, EC2,
  Python and Pulumi were removed as dated or not defensible in an interview. Do not add skills
  he has not claimed.
- **No Bảo Minh case-study page.** He dropped it (too like K-Studio, and K-Studio is the better
  one). It lives only as a bullet on the CV. Do not re-create it.
- **Menu and close buttons are bare icons**, "like Apple": no ring, no fill. The round area is
  still the 44px target, shown only on hover and keyboard focus.
- **The menu is at the site's own sizes**, not larger than the page.
- **Blog description:** "Field notes and case studies from shipping real products."

## How the header works

This is the intricate part. Read `components/sticky-bar.tsx` before touching it.

- `.actions` (the top row) is `position: sticky`: scrolled, its buttons simply stay where they
  are. `sticky-bar.tsx` draws the strip behind the row and holds the page's title.
- EVERY page's own `h1` becomes the bar's title: "Vinh Nguyen" on the CV, "Blog", a post's title.
  The motion is CONTINUOUS and tied to the scroll, as on tungv.com. Vinh preferred this to
  k-studio's discrete view-transition morph, which he found less smooth.
- Three paths, chosen by measuring:
  - **land, two legs** (desktop CV only): UP while shrinking, then LEFT along the bar, so the name
    never crosses the photo.
  - **land, one leg** (every other one-line title): across WHILE it rises. Going up first ran it
    over the menu button.
  - **fade** (a title that wraps, or that the bar must cut short): shrinks towards the bar and
    cross-fades with the bar's title over the last stretch.
- The component only MEASURES (`--head-end/-end2/-slide/-dx/-scale` on `<html>`) and flips
  `data-head-stuck/-collapsed/-travels/-direct/-fades`. The per-frame motion is a CSS scroll-driven
  animation in `globals.css`, with a `requestAnimationFrame` fallback in the component.
- `--title-*` in `globals.css` is shared by the big title, the bar's title and the menu links.
  Keep them identical, or a travelling title will not land on the bar's.
- By width:
  - **≥60rem (desk, and a tablet on its side):** full row at the top (links, text size, theme,
    "Save as PDF"). Scrolled: the links and text size fade out, a menu button comes in at the
    left, and the title sits beside it.
  - **≤60rem (phones, iPad and iPad mini upright):** the row is only a menu button (left) and
    "Save as PDF" (right). Scrolled: the title is CENTRED between them. On phones the pill reads
    just "PDF" to make room.
- The menu (`site-menu.tsx`) is a native `<dialog>` that fades in over the page: Résumé, Blog,
  "Save as PDF", then a gap, then theme and text size at the foot. No divider lines, no name.
  Its close button is in the top right corner and TRAVELS there from the menu button (start pose
  measured on open as `--from-x/-y/-scale`) while the bars cross into an X.
- Theme and text size live on `<html>` (`data-theme`, `data-size`) and in localStorage. Controls
  re-read them on a `reader-settings` event, because the same control appears in the row and in
  the menu. Changing theme plays a circular reveal (View Transitions API) from the pressed button.
- Text size: medium (default) 17px, small 16px, large 19px.

## Things that were tried and broke

- **Vaul / shadcn's Drawer for the menu.** On iOS, Vaul locks scrolling by pinning `<body>` with
  `position: fixed`, which zeroes `scrollY`. The header is driven by `scrollY`, so opening the
  menu threw the header back to its top-of-page state (it looked like a jump to the top).
- **Up-then-sideways for every title.** Right for the CV (photo on the left), wrong elsewhere: the
  title ran over the menu button.
- **A full-page Playwright screenshot drops touch emulation** (k-studio's landmine, met again
  here). Judge touch layouts from viewport screenshots or the simulators, never `fullPage: true`.
- **Comparing page width with `innerWidth` in the audit.** A phone browser widens `innerWidth` to
  fit an overflowing page, so the check passed falsely. The audit compares with the SCREEN width.
- **Backdrop blur on the bar.** It re-reads the text scrolling under it every frame (k-studio's
  lesson). The bar is opaque.
- **Stale tabs in the simulators.** Safari there does not reliably pick up dev changes; several
  "it's not working" reports were old code. Open a fresh tab with a new `?r=N` query.

## Accessibility and search (checked 2026-11-16)

- Lighthouse on the live site: 100 for accessibility, best practices and SEO on all four pages,
  mobile and desktop; performance 99-100 (one mobile run of 82 was noise). Re-run with
  `bunx lighthouse https://vinhn.dev/ --chrome-flags="--headless=new"`.
- What Lighthouse cannot see, and the code now does:
  - "Skip to content" is the first Tab stop on every page (`site-nav.tsx`, `.skip`, `#content`).
  - What is INVISIBLE is `inert`: the bar's title before the bar is there, and on a desk the menu
    button until the page is scrolled (`sticky-bar.tsx`, `reach()`).
  - The page's `h1`, once it has become the bar's title, is hidden with `opacity`, NOT
    `visibility`: a screen reader must still find it.
  - Post titles in the blog list are `h2`s.
  - The menu is a native `<dialog>`: focus goes to its close button, stays inside, Escape closes,
    focus returns to the menu button.
- Sharing: every page sets its own `openGraph` through `shareCard()` in `lib/site.ts` (a page's
  `openGraph` replaces the layout's; Next does not merge them). The image is `/og.png`
  (`app/og.png/route.tsx`, 1200×630): solid burgundy, the photo SMALL and round, name and
  headline in words. Vinh did not want his photo filling the card (2026-11-16). Few elements, all
  large, plus a "Read my résumé" pill. LinkedIn is the exception: it shows a card as a ~200px
  thumbnail beside the title, so LinkedInBot is rewritten (`next.config.ts`) from `/og.png` to
  `/og-photo.png`, the photo alone on burgundy. Check with
  `curl -A LinkedInBot https://vinhn.dev/og.png`; opengraph.xyz cannot show it (it does not
  fetch as LinkedInBot), LinkedIn's Post Inspector can.
  `app/sitemap.ts` and `app/robots.ts` make `/sitemap.xml` and `/robots.txt`.
- For AI agents and crawlers: `/llms.txt` (index, llmstxt.org) and `/llms-full.txt` (the CV and
  every post as one markdown file), both written from `content/` at build; schema.org JSON-LD
  on the CV (`ProfilePage` + `Person`) and on each post (`BlogPosting`). `robots.txt` allows
  every crawler, AI ones included: for a job search, being read is the point. In `next dev`,
  `/llms-full.txt` once 500'd on a stale module while the build was fine; restart dev if so.
- Checkers used: opengraph.xyz, opengraph.to (92 before the theme colour, 32px icon and
  manifest were added), LinkedIn Post Inspector. Deliberately NOT done: opengraph.xyz's "no
  call-to-action" warning (its own detector; the pill is on the card).
- X: the handle (`X_HANDLE` in `lib/site.ts`) is in `twitter:site`/`twitter:creator` and the
  JSON-LD `sameAs` ONLY. Vinh does not want it listed on the résumé (2026-11-17), so it is not
  in the header, the PDF or the llms files.
- `app/icon2.svg` is the icon as a drawing (strokes, no font), matched by eye to `icon.png`.
- Never tested with a real screen reader (VoiceOver).

## PDF

- `/api/pdf` draws the CV as a 2-page A4 PDF with Chromium from the live `/` (`lib/pdf.ts`, the
  k-studio approach: `@sparticuz/chromium` on Vercel, local Playwright Chromium elsewhere).
- Cached by the CDN for a day; a new deployment starts with an empty cache.
- Keep `outputFileTracingIncludes` and `serverExternalPackages` in `next.config.ts`, or the
  function 500s on Vercel (`playwright-core` reads its own files at load).
- Print and the PDF are always light, at the default text size.

## Verifying

```bash
bun run dev                                  # port 3100 (the session used 3101; see below)
bun run audit [baseUrl]                      # overflow, 44px touch targets, text ≥ 12px, contrast ≥ 4.5:1
curl -s -o /tmp/cv.pdf <base>/api/pdf && pdfinfo /tmp/cv.pdf | grep Pages   # must say 2
```

- Phone rules come from k-studio's ui-review: no sideways overflow, 44px targets on any touch
  screen (`@media (pointer: coarse)`), `touch-action: manipulation`, text ≥ 12px, contrast ≥ 4.5:1.
- Real iOS Safari: Vinh keeps Device Hub open with an iPhone, an iPad Air and an iPad mini.
  `xcrun simctl openurl <device-id> "http://localhost:<port>/?r=N"` then
  `xcrun simctl io <device-id> screenshot <file>`. There is no way to tap or scroll them from the
  CLI; `#:~:text=...` in the URL jumps to a piece of text.
- On 2026-11-16 an old `bun run start` (PID 73661) still held port 3100 and the dev server ran on
  3101. If 3100 is busy, check what holds it before assuming the dev server is up.

## Deploy

- GitHub `vinhnhq/me` (private) → Vercel project `vinhnguyen-projects/me`. A push to `main`
  deploys to production.
- **Commit locally; push only on Vinh's go.** He batches changes while iterating.
- Domain `vinhn.dev` is registered at Cloudflare; one DNS-only CNAME points it at Vercel. There
  is no `www` record.
- The page publicly shows his phone number and email.

## Facts behind the CV

- Freelance Jun 2025 – present, paid. Two projects:
  - Bảo Minh Gia Định insurance sales portal, Jun 2025 – Apr 2026, ~50 sales staff + customers,
    same stack as K-Studio, built with Cursor (more hand-coding). Retired when the parent company
    moved subsidiaries onto its group-wide platform.
  - K-Studio, Sep 2026 – present, built with Claude Code. Public demo (invented data, one-tap
    sign-in): https://k-studio-git-dev-vinhnguyen-projects.vercel.app (the owner OK'd showing it).
- BodiData (Jun 2024 – May 2025) was full-time, remote.
- Grab / Ninja Van / Dwarves were three separate jobs, deliberately combined into one entry.
- Photo: `public/vinh-nguyen.jpg`, cropped from `~/Downloads/me/vinhn_square.jpg`.

## Open

1. The Grab / Ninja Van / Dwarves years in `content/resume.md` are PLACEHOLDERS. Vinh replaces them.
2. Tags are labels only. Vinh wants "click a tag to search/filter posts" LATER. Do not build it
   until he asks.
3. The "Before this: Cursor" section of the agents post still describes the Bảo Minh project
   (no link). Vinh has not said whether to keep it.
4. A desktop left-side drawer was discussed and not built; desktop uses the same full-screen menu.
5. Never checked by hand on a touch screen: the feel of the scroll-linked title, and tapping the
   menu. All checks so far were headless or static simulator screenshots.
6. Novorésumé (the old CV) was only partly updated; this site replaces it.
