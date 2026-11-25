# ADR-016: Biome formats and lints; Tailwind itself checks the class names

## Status

Accepted

## Date

2026-11-25

## Context

The code had no formatter and no linter. The owner's editor formats on save, so a file an agent
had just written changed again the moment it was opened, and the next diff mixed real changes
with reformatting. His editor also underlined `z-[9]`: "can be written as `z-9`", from the
Tailwind extension. He asked (2026-11-25) for Biome, so that neither happens after a piece of
work is finished.

## Decision

- **Biome** (`@biomejs/biome`, pinned to an exact version) formats and lints the TypeScript, the
  scripts and the stylesheet. `bun run lint` checks; `bun run format` fixes. Line width 140,
  double quotes, semicolons, trailing commas.
- **The whole code base was formatted once**, in one commit, so later diffs hold only real changes.
- **Left out of Biome**: markdown (it would re-align every table in the records), SVG files,
  `tsconfig.json` (Next.js rewrites it in its own format), the agent skills, `content/` and
  `public/`.
- **Two CSS rules are off.** `noDescendingSpecificity` and `noImportantStyles` do not fit a
  stylesheet that is mostly state rules: the print sheet needs `!important` to beat a running
  animation, and the state rules are ordered by state, not by specificity.
- **Class names are checked by Tailwind, not by Biome**, which has no rule for it.
  `bun run check:classes` (`scripts/check-classes.mjs`) loads the design system from
  `app/globals.css` and asks it two things about every class list in `app/`, `components/` and
  `lib/`: the canonical spelling of each class (`canonicalizeCandidates`) and the order
  (`getClassOrder`, the order the official Prettier plugin uses). `bun run format` rewrites both.
- **No pixel-to-rem conversion.** The root font size is 17px (ADR-003), so `pl-[40px]` is not
  `pl-10`. The check passes no `rem` option, which keeps every pixel value as written, and
  `.vscode/settings.json` sets `tailwindCSS.rootFontSize` to 17 so the editor does not suggest
  the wrong class either.
- **Both are steps of `bun run verify` and of the pull-request gate.**
- **The reason for a suppression is on its line**: `biome-ignore lint/<group>/<rule>: reason`,
  which `check:comments` accepts as a directive (ADR-001). There are five: three plain `<img>`
  (the share cards, a post's pictures, the résumé's photo) and the two JSON-LD scripts.

## What the first run changed

- Seven kinds of class became canonical, among them `z-[9]` to `z-9`, `duration-[240ms]` to
  `duration-240`, `max-w-[50rem]` to `max-w-200` and `[font-weight:var(--x)]` to `font-(--x)`.
  17 class lists were reordered.
- **The bar's title is a `<button>`**: it scrolls to the top, which is an action, and Biome's
  `useValidAnchor` said so. It was an `<a href="#top">` with the default prevented.
- Six non-null assertions (`!`) became real checks.
- The Ko-fi cup has its name as hidden text as well as `aria-label`.
- **The formatter split a sentence around a link** into two text nodes, which moved the link by
  a sub-pixel (the same trap as in ADR-015). The home page's introduction is one string constant.
- After all of it: 83 of 83 pictures with no pixel changed.

## Alternatives considered

- **Biome's own class sorter** (`useSortedClasses`). Not in this version's rule set, and it would
  not know this site's `phone:`, `narrow:` and `tablet:` variants; Tailwind's own order does.
- **Prettier with its Tailwind plugin.** A second tool to do one thing Tailwind's API already
  answers.
- **ESLint.** Biome covers the rules that matter here, and react-doctor covers React (ADR-010).

## Consequences

- **Line counts of the stylesheet are no longer comparable**: Biome writes one declaration per
  line. In rules, the move to Tailwind went from 231 rules and 677 declarations to 109 and 324.
- `check:classes` uses `__unstable__loadDesignSystem`, an API Tailwind marks unstable. It is
  pinned with Tailwind's version; an upgrade may need the script changed.
- The check finds class lists by looking at string literals whose words are mostly Tailwind
  classes. A class list hidden in some other shape would be missed.
- The editor setting is for VS Code and its relatives. Another editor needs its own way to set
  the Tailwind extension's root font size.
