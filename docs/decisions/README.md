# Decisions

Why the site is the way it is. There are no comments in the code (ADR-001); a decision is
recorded here, grouped by topic. To change a decision, edit its ADR in the same change, or add a
new ADR that supersedes it.

| ADR | What it records |
|---|---|
| [ADR-001](ADR-001-no-comments-in-code.md) | No comments in code; decisions live here; `check:comments` and `/delete-comment` |
| [ADR-002](ADR-002-content-as-markdown.md) | Markdown as the only source, hand-parsed front matter, three tags, pictures as figures |
| [ADR-003](ADR-003-colour-type-and-themes.md) | Burgundy, the two faces, `light-dark()` pairs, ui-sdk preferences, text size, the theme's circle |
| [ADR-004](ADR-004-the-header-and-the-travelling-title.md) | The sticky row, the bar, and the three paths a title takes into it |
| [ADR-005](ADR-005-the-menu.md) | The menu on ui-sdk's Dialog, the travelling close button, and why not Vaul |
| [ADR-006](ADR-006-the-pdf.md) | The résumé printed by Chromium from the live page; two pages; the tracing includes |
| [ADR-007](ADR-007-routes.md) | The blog at the root, the résumé at `/resume`, the redirects |
| [ADR-008](ADR-008-sharing-search-and-agents.md) | Share cards, LinkedIn's own card, `robots.txt`, `llms.txt`, JSON-LD, the X handle |
| [ADR-009](ADR-009-accessibility.md) | The skip link, `inert`, opacity not visibility, 44px targets |
| [ADR-010](ADR-010-ui-sdk-and-the-guides.md) | ui-sdk, the three guides, and react-doctor's five suppressions |
| [ADR-011](ADR-011-the-ko-fi-cup.md) | The cup at the end of a page, and the widget that lasted an hour |
| [ADR-012](ADR-012-the-checks.md) | The audit, axe-core, the rules, zero changed pixels, `verify` |
| [ADR-013](ADR-013-the-k-studio-post.md) | What the K-Studio post may show, and what is blurred or left out |
| [ADR-014](ADR-014-the-working-loop.md) | Pull requests, the gate, the daily check, `/daily` and `/work-issue` |
| [ADR-016](ADR-016-biome-and-canonical-classes.md) | Biome as formatter and linter; class names and their order checked by Tailwind's own API |
| [ADR-015](ADR-015-tailwind-and-ui-sdk-for-styling.md) | Tailwind v4 and ui-sdk in place of the single stylesheet; what stays as CSS; the steps |
