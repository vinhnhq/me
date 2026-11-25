# ADR-012: The checks, and how they measure

## Status

Accepted

## Date

2026-11-16 (axe-core: 2026-11-21; rules, visual and verify: 2026-11-23)

## Context

"It looks fine" is not a result. Each check here answers pass or fail, and each has been shown
able to fail.

## Decision

- **All of them open the production build on :3100**, or a deployed site given as an argument or
  `BASE=`. If the port is busy, find what holds it first: an old server once answered for a build
  that was not running.
- **`bun run audit`** (`scripts/ui-audit.ts`), on 4 pages, 3 touch screens and both themes:
  - the page is no wider than the SCREEN. Not `innerWidth`: a phone browser widens its layout
    viewport to fit an overflowing page, and `innerWidth` grows with it, so that check passed
    falsely;
  - stand-alone controls are 44×44; text is 12px or more and 4.5:1 (any CSS colour, `oklch`
    included, is turned into sRGB by letting a canvas paint it);
  - axe-core, the engine behind Lighthouse's accessibility score, with every WCAG 2.2 A and AA
    rule on.
- **`bun run check:rules`** (`scripts/check-rules.mjs`): the traps a script can test, each tied to
  its ADR.
- **`bun run check:comments`** (ADR-001).
- **`bun run check:visual`**: viewport pictures of every page, at a phone and a desk, light and
  dark, with reduced motion on. A pixel counts as changed past 2 levels on a channel, and ONE
  changed pixel fails the picture. The baseline (`visual/`) is this machine's rendering of a
  local build and is not in git; `bun run shots:baseline` saves it. A baseline taken from the
  live site does not work: Vercel's build of the same commit differed from a local one by 12
  pixels in the text-size pill (2026-11-23), while two local builds match exactly.
- **Viewport pictures, never full-page ones.** A full-page Playwright screenshot drops touch
  emulation and re-lays the page.
- **`bun run verify`** runs everything in order and prints pass, FAIL or skipped per step:
  typecheck, comments, rules, react-doctor at 100, the build, the audit, the PDF's page count,
  the visual check.
- **In the simulators, open a fresh tab with a new `?r=N`.** Safari there does not reliably pick
  up a change; several "it is not working" reports were old code.

## Consequences

- Real Safari and real Chrome on Android are checked by hand in the simulators, not by a script.
- The gate's tools are pinned; `check:rules` fails on `@latest`.
