# ADR-004: The header and the travelling title

## Status

Accepted

## Date

2026-11-16 (the row's minimum height: 2026-11-18; the title as a prop: 2026-11-21)

## Context

Every page has a top row of links and controls. Scrolled, it becomes a bar holding the page's
title. The owner wanted the motion continuous and tied to the scroll, as on tungv.com, and found
a discrete view-transition morph (the K-Studio way) less smooth.

## Decision

- **The top row (`.actions`) is `position: sticky`.** Scrolled, its buttons simply stay.
  `sticky-bar.tsx` only draws the strip behind the row and holds the title.
- **Every page's own `h1` becomes the bar's title.** The page passes the same words to `SiteNav`
  as `title`, so they are in the server's HTML and nothing is read from the DOM after hydration.
- **The big title travels; it is not swapped.** Three paths, chosen by measuring:
  - **land, two legs** (the résumé on a desk): UP while shrinking, then LEFT along the bar, so
    the name never crosses the photo on its left.
  - **land, one leg** (every other one-line title): across WHILE it rises. Going up first ran it
    straight over the menu button.
  - **fade** (a title that wraps, or that the bar must cut short): it shrinks towards the bar and
    cross-fades with the bar's title over the last stretch.
- **The component only measures** (`--head-end`, `-end2`, `-slide`, `-dx`, `-scale` on `<html>`)
  and flips `data-head-stuck`, `-collapsed`, `-travels`, `-direct`, `-fades`. The per-frame
  motion is a CSS scroll-driven animation, which runs off the main thread and keeps up during
  iOS momentum scrolling. Browsers without scroll timelines get the same motion from a
  `requestAnimationFrame` loop.
- **It measures again** when the fonts load, the text size changes, a tablet rotates or the
  window resizes, and on a reload half way down the page.
- **The title's box hugs its text**, as the bar's does, at the same line height (1.15), so the
  scaled heading lands exactly on the bar's.
- **A title that does not travel passes UNDER the bar**; only a travelling one is above it.
- **The bar is opaque, not blurred.** A backdrop blur re-reads the text scrolling under it every
  frame.
- **By width.** At 60rem and wider (a desk, a tablet on its side): the full row; scrolled, the
  links and the text size fade out and a menu button comes in at the left with the title beside
  it. Narrower: the row is a menu button and the page's action; scrolled, the title is CENTRED
  between them, as in an app's navigation bar, and on phones the pill reads "PDF" to make room.
- **The row is as tall as the bar's row whatever is in it** (`min-height`). On a page with no
  pill the row was shorter and the menu button sat 4px above the bar's title.
- **The menu button is nudged left** so the BARS, not the invisible round target, line up with
  the text column.

## Alternatives considered

- **Up-then-sideways for every title.** Right for the résumé, wrong elsewhere.
- **Reading the title from the `h1` in an effect.** It worked, but the bar's title was missing
  from the server's HTML and react-doctor flagged the state set after paint.

## Consequences

- Never tested by hand on a touch screen for feel; only headless and simulator pictures.
- Changing `--title-*` for one of its three users breaks the landing.
