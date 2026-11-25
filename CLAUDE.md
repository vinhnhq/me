# CLAUDE.md

Vinh Nguyen's site: a blog at the root and a résumé at `/resume`, live at https://vinhn.dev.
The repository is public.

`README.md` says how to run, write and check. `docs/decisions/README.md` indexes the reasons.
This file is a map and the traps a script cannot test. Do not repeat a decision here: link its
ADR.

## Working here

- **No comments in code** (ADR-001). A reason goes in an ADR, in the same change.
- **A change is a branch and a pull request.** Never push to `main`, never merge, never deploy:
  open the pull request and stop (ADR-014).
- **After editing code, run `bun run format`** (Biome, then Tailwind's canonical class names and
  order). The owner's editor formats on save; unformatted work comes back as noise in his next
  diff (ADR-016).
- **Before handing over: `bun run verify`, real devices included.** It drives Safari in the iOS
  simulators (Device Hub) and Chrome in the Android Studio emulator through `check:real`. Do not
  skip that step on this Mac; then look through `screens/real` and say what was not verified
  (ADR-012).
- **Before HTML or CSS work**, look the task up in Modern Web Guidance; before a control, check
  whether ui-sdk ships it (ADR-010).
- **Private facts stay out of this repository.** What the résumé claims (dates, titles, numbers,
  skills) is the owner's to write; never add a skill or a figure he has not given.

## Where things are

| Path | What | ADR |
|---|---|---|
| `content/resume.md`, `content/blog/` | The résumé and the posts | 002 |
| `lib/markdown.ts` | Reads and parses everything in `content/` | 002 |
| `components/markdown.tsx` | Renders markdown as components that carry their utilities | 002, 015 |
| `app/page.tsx` | The root: the blog list | 007 |
| `app/resume/page.tsx`, `components/resume-*.tsx` | The résumé | 007 |
| `app/blog/[slug]/page.tsx` | A post | 002, 013 |
| `app/api/pdf/route.ts`, `lib/pdf.ts` | The résumé as a PDF | 006 |
| `components/site-nav.tsx`, `components/sticky-bar.tsx` | The top row, and the bar it becomes | 004 |
| `components/site-menu.tsx` | The full-screen menu, on ui-sdk's Dialog | 005 |
| `components/reader-controls.tsx`, `lib/preferences.ts`, `components/app-preferences.tsx` | Theme and text size | 003, 010 |
| `components/support.tsx` | The Ko-fi cup | 011 |
| `components/wave-footer.tsx` | The wave lines at the foot of every page | 003 |
| `app/og.png/`, `app/og-photo.png/`, `lib/site.ts`, `app/llms*.txt/`, `app/robots.ts`, `app/sitemap.ts` | Share cards, crawlers, agents | 008 |
| `app/globals.css` | Tokens, state and motion (the travelling title, the bar, the menu, the waves), the print sheet | 003, 004, 005, 015 |
| `lib/styles.ts` | Class strings shared by the pages: the page shell, the page title, the focus ring | 015 |
| `scripts/` | The checks | 012 |
| `.github/workflows/` | The pull-request gate and the daily check | 014 |

## Traps a script cannot test

- **Read `components/sticky-bar.tsx` and ADR-004 before touching the header.** The title's three
  paths are chosen by measuring; a small CSS change near the top row can break a landing.
- **`--title-*` has three users** (the big title, the bar's title, the menu's links). Keep them
  identical (ADR-004).
- **A page passes `SiteNav` the same words as its `h1`** as `title` (ADR-004).
- **A page's `openGraph` replaces the layout's**; build it with `shareCard()` (ADR-008).
- **New styling is Tailwind utilities, not new rules in `globals.css`** (ADR-015). What is left
  there lives in `@layer components`; an unlayered rule would beat every utility, and
  `check:rules` fails on a rule for a bare content element.
- **A rule in `@layer components` loses to ANY utility.** An old rule that restyles an element
  from outside (`.box p { … }`) stops working the moment that element gets a utility for the
  same property; move the override onto the container as a utility (`[&_p]:m-0`).
- **Look in utilities; state and motion in CSS, keyed on hook classes** (`actions`, `links`,
  `controls`, `segmented`, `pill`, `page`, `menu`, `sticky-bar`, `sticky-name`, `menu-button`).
  Do not remove a hook class, and never put a utility on an element for a property a state rule
  sets on it (`display`, `opacity`, `visibility`, `pointer-events` in the header): the utility
  wins and the state is lost (ADR-015).
- **`.no-print` loses to a display utility** (`grid`, `flex`, `block`): on an element with
  utilities, hide it on paper with `print:hidden`.
- **Before deleting an old class rule, search for every element with that class name**, and for
  descendants its selector reaches by accident (`.intro` and `.posts li` both did, ADR-015).
- **A sentence with a link in it stays one text node.** The formatter breaks long JSX text around
  a link with `{" "}`, which shifts the link by a sub-pixel; put the words in a string constant
  (ADR-016).
- **The root font size is 17px**, so rem-based utilities are not the pixel sizes Tailwind's docs
  list. Keep a pixel value as pixels: `rounded-[4px]`.
- **A new colour is a pair** (`--x-light`, `--x-dark`) joined by `light-dark()` (ADR-003).
- **The baseline for `check:visual` comes from a local build of `main`, never from the live
  site**: Vercel's build differs from a local one by a few pixels in the text-size pill (ADR-012).
- **Do not poll or audit the live site in a loop from one machine.** On 2026-11-25, a burst of
  checks from this Mac made Vercel answer 403 with its security checkpoint to this address only;
  the site was fine. To check production, run the `daily` workflow (`gh workflow run daily`),
  which looks from GitHub's network.
- **If port 3100 is busy, find what holds it**: an old server once answered for a build that was
  not running (ADR-012).
- **In the simulators, open a fresh tab with a new `?r=N`** (ADR-012). Booting them:
  `xcrun simctl boot <id>`, `xcrun simctl openurl <id> <url>`, `xcrun simctl io <id> screenshot`;
  Android through `adb reverse tcp:3100 tcp:3100`. Taps can be sent to Android (`adb shell input
  tap`), not to iOS.
- **In `next dev`, `/llms-full.txt` once answered 500 on a stale module** while the build was
  fine; restart dev.
- **The K-Studio post's pictures follow ADR-013**: invented data only, names and photographs
  blurred, no link to the app's demo.

## Never checked

- A real screen reader.
- The feel of the scroll-linked title and the menu under a real finger on iOS.
