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
- **The move was made in six steps, each with zero changed pixels** (`check:visual`, ADR-012),
  from 2026-11-25. The plan was issue #10.

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

### Step two: markdown as components (2026-11-25)

- `components/markdown.tsx` maps every markdown element to a component with utilities; `marked`
  and the six raw-HTML sinks are gone (ADR-002).
- **A rule in `@layer components` loses to any utility, whatever its specificity.** So the
  context overrides the old CSS made from outside (`.summary p`, `.entry-text > :first-child`,
  their print versions) had to become utilities on the containers; left as rules they would
  have silently stopped working.
- **The next/font variables were renamed** to `--font-manrope` and `--font-geist-mono`, so
  Tailwind's own `--font-sans` and `--font-mono` (and the `font-sans`, `font-mono` utilities)
  can point at them with the same fallbacks as before.
- **`phone:` and `narrow:` are custom variants** for `max-width: 40rem` and `60rem`: Tailwind's
  `max-sm:` means "below 40rem", one pixel different from the old query.
- **Sizes in pixels stay in pixels** (`rounded-[4px]`, `after:h-[2px]`): the root font size is
  17px here, so Tailwind's rem-based `rounded-sm` would be 4.25px.
- **Proof that the utilities stand alone**: with the old element rules switched off inside the
  markdown (`all: revert-layer`, injected for the test only), the pictures still matched, 83 of
  83. The old global element rules stay until the other components no longer need them.

### Step three, first half: the blog's components (2026-11-25)

The tags, the Ko-fi cup, the home page's introduction and list, and a post's date, facts and
button now carry utilities; their rules are deleted. The wave footer stays as CSS: it is motion.
What the zero-pixel check caught on the way:

- **One rule was styling two things.** `.intro` was written for the home page's first paragraph,
  and the résumé's header block has the same class name, so it had been taking its margin and
  font size from there. Deleting the rule moved the résumé and the PDF.
- **A rule reached further than meant.** `.posts li` also matched the tags' items nested in each
  post, which is where the short line above every tag on the home page comes from. It is kept,
  now written on purpose (`item="border-t border-rule py-4"`).
- **`.no-print` cannot hide an element that has a display utility**: `grid` beats it. Such an
  element uses `print:hidden`.
- **Splitting a sentence around a link moved the link by 1/64 of a pixel.** `my{" "}` and a
  line break made two text nodes where there had been one, and the shaping changed. The sentence
  stays on one line in the source.
- **Tailwind's `ease-out` is not the CSS keyword** (`cubic-bezier(0, 0, 0.2, 1)` against
  `cubic-bezier(0, 0, 0.58, 1)`); the cup uses `ease-[ease-out]`. `rounded-full` is not `50%`
  either, though on a square they draw the same.

### Step three, second half: the résumé's header and body (2026-11-25)

The photo, the headline, the values, the contact line, each job's title, organisation and dates,
and the section headings now carry utilities, their phone, touch and print variants included.
The stylesheet is 554 lines.

- **The contact links stay underlined on paper.** The print sheet said `a { text-decoration:
  none }`, but `.contact a` was more specific, so those four links kept their underline in the
  PDF. The first conversion removed it (`print:no-underline`), and the print picture showed one
  changed row of pixels.
- **The two pills are not in this step.** Their rules are tied to the top row
  (`.actions > .controls > .segmented`), so they move with the header.
- **Proof that the utilities stand alone**: with the old rules switched off for every converted
  element of the résumé, 83 of 83 pictures matched.

### Step four: the menu on ui-sdk's Dialog (2026-11-25)

The behaviour moved to ui-sdk (ADR-005); the menu's look is unchanged, pixel for pixel, and its
rules are still classes in the stylesheet. They become utilities with the header.

### Step five: the header's look (2026-11-25)

The page shell, the page titles, the top row, the skip link, the two pills, the "Save as PDF"
pill and the bar's inner row carry utilities. The stylesheet is 476 lines.

- **The line between the two systems: look in utilities, state and motion in CSS.** What an
  element always looks like is a utility. What changes with the scroll, the menu or a measured
  number stays a rule, keyed on a hook class (`actions`, `links`, `controls`, `segmented`,
  `pill`, `page`, `menu`, `sticky-bar`, `sticky-name`, `menu-button`): the title's keyframes and
  timelines, `html[data-head-*]`, the menu's transitions, the bar's measured widths.
- **A property that a state rule sets must not also be a utility on that element**, or the
  utility wins and the state is lost. So the top row keeps `pointer-events` in CSS (the menu
  button is switched off there until the page is scrolled), and nothing sets `display`,
  `opacity` or `visibility` on the menu button or the bar.
- **Hiding a child from its parent**: the pills sit in the top row and in the menu, and only the
  row hides them on a narrow screen. The old rule (`.actions > .controls > .segmented`) would
  lose to the pill's own `inline-flex`, so the row says it as a utility:
  `narrow:[&>.segmented]:hidden`.
- **`tablet:` is a screen-only variant.** An A4 page is 794px wide, inside the tablet range; the
  old print sheet came later in the file and overrode the tablet padding, but among utilities
  the tablet one won and moved every line of the PDF.
- The menu's own rules stay as they are: nearly all of them are state and motion.

### Step six: the old global rules are gone (2026-11-25)

- The rules for bare elements (`p`, `h2`, `h3`, `ul`, `li`, `a`, `strong`, `code`, the table) and
  the seven `:where()` defaults from step one are deleted. Every element that needed them carries
  utilities. A rule in `check:rules` fails if a bare content element is styled again.
- **One global rule stays, in `@layer base`**: `a, button, summary { touch-action: manipulation }`.
  It is behaviour, not look (ADR-009), and the menu's and the bar's own controls rely on it.
- Comparing every element's computed style with `main` after the deletion left only differences
  that cannot be seen (the baseline of icons inside grid buttons, the underline offset of links
  that have no underline). 83 of 83 pictures matched, and so did the newest post, compared
  separately.

### Where it ended

`app/globals.css` went from 231 rules and 677 declarations to 109 and 324 (647 lines to about
420, before Biome put one declaration on each line, ADR-016): the colour pairs, the base (the body, the
graph paper, the text size), state and motion (the travelling title, the bar, the menu, the
waves) and the print sheet. Everything else is utilities in the markup.

## Alternatives considered

- **Importing Tailwind without its reset.** Zero risk today, but utilities such as `border`
  assume the reset, so every later step would fight it.
- **Tailwind's typography plugin (`prose`)** for the markdown. It brings its own look; matching
  this design would mean overriding most of it.
- **One scoped block of element rules for the markdown.** Least work, most hand-written CSS left.
- **Keeping the native `<dialog>`** (ADR-005's first decision). The owner prefers ui-sdk.

## Consequences

- Two systems live side by side for good, with a line between them: look in utilities, state and
  motion in CSS.
- ui-sdk's Dialog locks scrolling in a way its docs do not describe. Vaul broke the header on
  iOS by doing that badly (ADR-005), so the menu's move starts with a check on real iOS Safari
  that `scrollY` does not change.
- The first guess for the end state was 250 to 350 lines. It ended near 420: the header's and
  the menu's state rules are more of the file than expected.
