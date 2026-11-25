# ADR-005: The menu

## Status

Accepted. Amended 2026-11-25: the sheet is ui-sdk's Dialog, no longer a native `<dialog>`.

## Date

2026-11-16 (the move to ui-sdk: 2026-11-25)

## Context

Phones and tablets have no room for the links, the theme and the text size in the top row. They
need a menu, and the header is driven by `scrollY` (ADR-004), so whatever locks the page behind
the menu must not move the scroll position.

## Decision

- **The menu is ui-sdk's Dialog** (`@ui-sdk/react/dialog`): `DialogTrigger` is the menu button,
  `DialogContent` the sheet, `DialogClose` the corner button and every link. It renders in place
  as a `popover` element with `role="dialog"` and `aria-modal`, in the browser's top layer, makes
  the page inert, traps Tab and closes on Escape.
- **Focus**: a touch press focuses the sheet itself; a keyboard or script open focuses the close
  button; closing returns focus to the menu button.
- **It fades in over the page; it does not slide.** Laid out like the page it covers: the same
  column, the places to go at the top in the title face, the settings at the foot where a thumb
  rests. No divider lines, no name. The menu is at the site's own sizes: not a louder place than
  the page.
- **Opening and closing are CSS transitions from ui-sdk's state attributes.** The sheet has
  `data-starting-style` for its first frame and `data-ending-style` while it leaves, and stays
  mounted until the exit transition ends. That replaced a hand-written 240ms timer.
- **The close button TRAVELS.** It starts exactly on the menu button and moves to the top right
  corner while its two bars cross into an X; closing sends it back. The eye follows ONE button
  from where the thumb pressed to where it will press next. The menu button's centre is measured
  when the menu opens (`--from-cx`, `--from-cy`); the close button's own place is known from CSS
  (`--close-top`, `--close-right`, `--menu-size`), so nothing is measured after it mounts.
- **The links arrive one after another**; on the way out everything leaves together.
- **Menu and close buttons are bare icons**, "like Apple": no ring, no fill. The round area is
  still the 44px target, shown on hover and on keyboard focus.
- **`overscroll-behavior: contain`**, so the page behind does not scroll under the sheet.
- **A link in the menu is a `DialogClose` rendered as the link**, so pressing it closes the menu
  and navigates. "Save as PDF" stays a plain `<a>`: a file to download (ADR-006). The `type`
  attribute a Close part adds is dropped: on an `<a>` it would be a MIME type hint.

## Alternatives considered

- **A native `<dialog>` opened with `showModal()`.** The first build, in use until 2026-11-25. It
  did everything asked; the owner prefers one library for every control (ADR-015).
- **Vaul (shadcn's Drawer).** On iOS it locks scrolling by pinning `<body>` with
  `position: fixed`, which zeroes `scrollY`. Opening the menu threw the header back to its
  top-of-page state; it looked like a jump to the top.
- **Measuring the close button after it mounts**, as the native version did. With ui-sdk the
  content mounts and enters the top layer on its own schedule; computing the start pose in CSS
  from the two known corners needs no timing at all.
- **A drawer from the left on a desk.** Discussed, not built.

## Consequences

- **ui-sdk locks scrolling by setting `overflow: hidden` on `<html>`**, not by pinning the body:
  `scrollY` and the header stay where they were. Measured on 2026-11-25 with a real touch in
  Chromium, in Chrome on the Android emulator and in Safari on the iOS 18.6 simulators
  (`check:real`, "scroll-kept").
- **Playwright's `tap()` and `click()` scroll a sticky element into view first**, which moved the
  page from 600 to 171 in a test and looked like this very bug. A touch sent to coordinates
  (`page.touchscreen.tap`) does not.
- **Two things changed for a phone, both for the better.** A touch press no longer leaves a focus
  ring on the close button (focus goes to the sheet), and Android's Back button closes the menu
  and stays on the page (measured with a real tap on the emulator, 2026-11-25).
- ui-sdk is a beta; the four open-menu pictures in `check:visual` and `check:real` are the guard
  for an upgrade.
