# ADR-009: Accessibility beyond what a scanner sees

## Status

Accepted

## Date

2026-11-16 (axe-core in the audit: 2026-11-21)

## Context

Lighthouse scored 100 for accessibility on every page, and a scanner still cannot see whether a
hidden thing is reachable or whether a moving title is still a heading.

## Decision

- **"Skip to content" is the first Tab stop on every page**, out of sight until focused. It lands
  on `#content`, which has `scroll-margin-top`.
- **What is invisible is `inert`**: the bar's title before the bar is there, on a desk the menu
  button until the page is scrolled, and the Ko-fi cup until it shows.
- **A page's `h1`, once it has become the bar's title, is hidden with `opacity`, not
  `visibility`**: a screen reader must still find it.
- **Post titles in the blog list are `h2`s** that look like the links they hold.
- **Every stand-alone control is at least 44×44 on any touch screen** (`@media (pointer:
  coarse)`), at any width. The target is grown, not the drawing. A link inside a sentence is
  exempt (WCAG 2.5.8). The size is one token, `--spacing-touch: max(2.75rem, 44px)` (`size-touch`,
  `min-h-touch`): it grows with large text and never drops under 44px on small text, where
  2.75rem alone would be 41px (2026-11-25).
- **`touch-action: manipulation`** on links and buttons: without it iOS waits about 300ms for a
  double-tap.
- **Nothing pushes the page wider than the screen**: long words and addresses wrap.
- **Text is at least 12px and 4.5:1** against the page (3:1 for large text).
- **`scroll-padding-top`**, so keyboard focus never lands under the sticky bar.
- **The dot between the three values is seen, not read**: a `<span aria-hidden="true">`. It was
  CSS generated content with an empty spoken text (`content: "·" / ""`) until 2026-11-25; a real
  element does the same in every browser, with no fallback to carry.
- **Reduced motion** gets the settled state of the waves, the title and the menu.

## Consequences

- Never tested with a real screen reader.
- `bun run audit` measures the numeric rules and runs axe-core for WCAG 2.2 A and AA (ADR-012).
