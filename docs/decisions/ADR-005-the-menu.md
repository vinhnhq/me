# ADR-005: The menu is a native dialog

## Status

Accepted

## Date

2026-11-16

## Context

Phones and tablets have no room for the links, the theme and the text size in the top row. They
need a menu, and the header is driven by `scrollY` (ADR-004).

## Decision

- **A native `<dialog>` opened with `showModal()`.** The browser traps focus, closes on Escape
  and makes the page inert. Focus goes to the close button and returns to the menu button.
- **It fades in over the page; it does not slide.** Laid out like the page it covers: the same
  column, the places to go at the top in the title face, the settings at the foot where a thumb
  rests. No divider lines, no name. The menu is at the site's own sizes: not a louder place than
  the page.
- **The close button TRAVELS.** It starts exactly on the menu button (its pose is measured on
  open into `--from-x`, `--from-y`, `--from-scale`, with transitions off while it is placed) and
  moves to the top right corner while its two bars cross into an X. Closing sends it back. The
  eye follows ONE button from where the thumb pressed to where it will press next.
- **Escape leaves the same way as the button**, not in one frame: the dialog closes after the
  240ms fade, or at once under reduced motion.
- **The links arrive one after another**; on the way out everything leaves together.
- **Menu and close buttons are bare icons**, "like Apple": no ring, no fill. The round area is
  still the 44px target, shown on hover and on keyboard focus.
- **`overscroll-behavior: contain`**, so the page behind does not scroll under the sheet.
- **"Save as PDF" is a plain `<a>`**: a file to download, not a page to route to (ADR-006).

## Alternatives considered

- **Vaul (shadcn's Drawer).** On iOS it locks scrolling by pinning `<body>` with
  `position: fixed`, which zeroes `scrollY`. Opening the menu threw the header back to its
  top-of-page state; it looked like a jump to the top.
- **ui-sdk's Dialog** (2026-11-21). Not used: both guides in ADR-010 prefer the native element,
  and the native one already does everything asked.
- **A drawer from the left on a desk.** Discussed, not built.

## Consequences

- The travelling close button depends on measuring; a layout change near the menu button needs a
  look at the open menu.
