# ADR-003: Colour, type, themes and text size

## Status

Accepted

## Date

2026-11-16 (ui-sdk preferences and light-dark(): 2026-11-21)

## Context

The owner chose the look. The reader chooses light or dark and one of three text sizes, and the
choice must be right on the first paint, in every control on the page and in every open tab.

## Decision

- **The accent is burgundy `#800020`**, the owner's colour. On dark it is `oklch(0.66 0.18 18)`:
  burgundy itself is unreadable on a dark page. Light and dark only.
- **Manrope for reading; Geist Mono** for dates, the contact line, pills and code, and also for
  page titles, the name and the menu's links at weight 500. Bold Manrope titles were "too bold".
  `--title-*` is shared by the big title, the bar's title and the menu's links, so one scales
  exactly onto the other (ADR-004).
- **Every colour is a pair** (`--bg-light` / `--bg-dark`), and `light-dark()` picks the half that
  matches the scheme in use. Browsers without `light-dark()` (before 2024) get light, or dark
  when the device is dark, from a `prefers-color-scheme` fallback; they cannot override it.
- **`<meta name="color-scheme" content="light dark">`**, so the browser paints its own canvas and
  controls to match before the CSS arrives.
- **The two settings are ui-sdk preferences** (`lib/preferences.ts`): `data-color-scheme`
  (system, light, dark) and `data-size` (s, m, l) on `<html>`. `Preferences` renders an inline
  script that applies the saved values before the first paint, which is why `<html>` carries
  `suppressHydrationWarning`. They save to localStorage under the keys the site always used
  (`theme`, `size`), so a returning reader keeps their choice.
- **Nothing is marked in a control until the page has hydrated**: the server cannot see the
  browser's choice.
- **Text size**: medium (the default) is the browser's own 16px, small 15px, large 18px. The
  whole page is in `rem`, so it all follows. Until 2026-11-25 the steps were 16, 17 and 19px
  with 17 as the default; the owner chose 16px, the size nearly every site and tool assumes.
  Two labels that were 0.72rem (the "Values" label, the menu's setting names) became 0.75rem,
  so nothing is under 12px at the default size. On small text the smallest labels are 11.25px:
  the reader asked for smaller. The PDF did not change: paper was always 16px.
- **Changing theme opens as a circle** growing from the chosen button (View Transitions). The
  script draws the circle, so the browser's own cross-fade is switched off. Skipped when nothing
  would change colour, for reduced motion, and where View Transitions are missing.
- **Graph paper behind the top of every page**: a 28px grid drawn in CSS at 5% of the text
  colour, so one alpha reads in light and in dark, masked to fade before its edges.
- **Print and the PDF are always light**, at 16px whatever the reader chose.

## Alternatives considered

- **A hand-written boot script and an event to keep the controls in step.** That was the first
  build (2026-11-16); ui-sdk's preferences replaced it (ADR-010).
- **Three duplicated colour blocks** (light, dark, and dark under a media query). Replaced by the
  pairs.

## Consequences

- `theme-color` follows the device, not the reader's override.
- A new colour is a pair in `:root`, not a single value.
