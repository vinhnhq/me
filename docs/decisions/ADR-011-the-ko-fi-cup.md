# ADR-011: The Ko-fi cup

## Status

Accepted

## Date

2026-11-18

## Context

The owner wanted his Ko-fi page (https://ko-fi.com/vinhn) on the site.

## Decision

- **One small round cup button**, 44px, bottom right, on the blog list and on each post
  (`components/support.tsx`), and a line in `/llms.txt`.
- **It shows only when the reader reaches the END of the page**, and leaves when they scroll back
  up. The component sits at the end of the page's text and watches its own place.
- **Never on the résumé or the PDF.** A tip line does not belong on a job application.
- **Its accent ring is always there**, not a hover state: a phone has no hover.

## Alternatives considered

- **A line of text with a link.** The first version, replaced the same day.
- **Ko-fi's own floating widget.** Live for about an hour. The owner found it too big and
  annoying, always on screen; it also loaded a third-party script on every page.

## Consequences

- On a desk the home page is short enough that its end is on screen from the start, so the cup
  shows at once there.
