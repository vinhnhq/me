# ADR-015: Tailwind v4 and ui-sdk replace the single stylesheet

## Status

Accepted. Supersedes "all styling is plain CSS" (the first build, 2026-11-16) and amends ADR-003,
ADR-005 and ADR-010.

## Date

2026-11-25

## Context

All styling lived in one hand-written file, `app/globals.css`: 647 lines, 231 rules, 44 class
names. The owner asked (2026-11-25) for Tailwind v4 and ui-sdk across the whole site, the stack
his other projects use, and accepted that the file would shrink but not disappear.

## Decision

- **Tailwind v4** styles components through utility classes in the markup. Colours are tokens
  (`bg-bg`, `text-fg`, `text-muted`, `text-accent`, `border-rule`, `bg-chip`) that point at the
  `light-dark()` pairs of ADR-003.
- **ui-sdk** provides every interactive control it ships. The menu moves from the native
  `<dialog>` to ui-sdk's Dialog (the owner's choice; it amends ADR-005), and buttons to its
  Button.
- **Markdown is rendered to React components** with `react-markdown`: each element maps to a
  component that carries utilities. It replaces the raw HTML and its three react-doctor
  suppressions (ADR-010).
- **What stays as CSS, on purpose**: the keyframes and scroll-driven timelines of the travelling
  title and the waves (ADR-004), the print sheet that draws the PDF (ADR-006), and the colour
  pairs themselves.
- **The move is made in steps, each with zero changed pixels** (`check:visual`, ADR-012). The
  plan is issue #10.

### Step one: Tailwind under the existing styles (2026-11-25)

- **`@layer ui-sdk;` comes first, then `@import "tailwindcss";`**, so ui-sdk's few behavioural
  rules lose to everything else.
- **The whole old stylesheet sits in `@layer components`.** Unlayered rules would beat every
  utility; in that layer they beat Tailwind's reset and lose to utilities, which is the order a
  step-by-step move needs. `@page` stays outside the layer.
- **Tailwind's reset changed what the old rules had left to the browser.** Comparing the computed
  style of every element with `main` found 1,148 differences in 66 groups; seven rules at the top
  of the layer restore those defaults (list markers, the `ol`'s margin and indent, underlined
  links, a button's font, the baseline of pictures and icons, an image's width, a header cell's
  padding). They are written with `:where()`, so any real rule wins, and each is deleted when the
  part that needs it is converted.
- After those seven rules: 80 of 80 pictures with no pixel changed, and the PDF at 2 pages.

## Alternatives considered

- **Importing Tailwind without its reset.** Zero risk today, but utilities such as `border`
  assume the reset, so every later step would fight it.
- **Tailwind's typography plugin (`prose`)** for the markdown. It brings its own look; matching
  this design would mean overriding most of it.
- **One scoped block of element rules for the markdown.** Least work, most hand-written CSS left.
- **Keeping the native `<dialog>`** (ADR-005's first decision). The owner prefers ui-sdk.

## Consequences

- Until the last step, two systems live side by side: utilities and the old class rules.
- ui-sdk's Dialog locks scrolling in a way its docs do not describe. Vaul broke the header on
  iOS by doing that badly (ADR-005), so the menu's move starts with a check on real iOS Safari
  that `scrollY` does not change.
- A fair guess for the end state is 250 to 350 lines of CSS, down from 647.
