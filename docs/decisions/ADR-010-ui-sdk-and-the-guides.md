# ADR-010: ui-sdk, the guides, and react-doctor's suppressions

## Status

Accepted

## Date

2026-11-21 (the suppressions: 2026-11-23)

## Context

The theme and text-size pills were a hand-written radio group with no arrow keys, kept in step by
a custom event. On 2026-11-21 the owner asked for ui-sdk, Chrome's Modern Web Guidance and
react-doctor to be set up and the site refactored against them, with the look unchanged.

## Decision

- **ui-sdk** (`@ui-sdk/react`, `@ui-sdk/core`, 0.1.0-beta.13, every API marked experimental)
  provides the two things it ships that the site had hand-rolled: the pills are its
  `SegmentedControl` (one Tab stop, arrow keys move the choice) and the settings are its
  preferences (ADR-003). Do not hand-roll a `role=` it ships.
- **Three guides are installed as agent skills**: `ui-sdk`, Chrome's `modern-web-guidance`
  (`npx modern-web-guidance search "<task>"`, then `retrieve <id>`, before HTML or CSS work) and
  Vercel's `web-design-guidelines`.
- **react-doctor must score 100** (`bun run doctor`). Two findings are silenced in place, each a
  judged false positive (there were five until 2026-11-25, when rendering markdown as components
  removed the three `dangerous-html-sink` ones, ADR-002):
  - `nextjs-no-a-element`, twice: "Save as PDF" downloads a file and must not be a router link.
- **The refactor changed no pixels on a phone**; on a desk only line endings, from `text-wrap`.

## Alternatives considered

- **Third-party WCAG skills.** Many exist; none could be vouched for. axe-core in the audit does
  the measurable part (ADR-012).
- **react-doctor's own GitHub workflow and commit hook**, which its installer adds. Removed; the
  pull-request gate runs it instead (ADR-014).
- **Curly quotes in the content, `translate="no"` on brand names, `theme-color` following the
  reader's override.** In the guidelines; not done.

## Consequences

- ui-sdk is a beta. `check:visual` (zero changed pixels) is the guard for an upgrade.
- The Modern Web Guidance skill brings about 200 guide files into the repository.
