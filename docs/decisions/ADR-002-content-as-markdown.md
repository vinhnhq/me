# ADR-002: Content is markdown, parsed by hand

## Status

Accepted

## Date

2026-11-16 (the first picture's priority: 2026-11-21)

## Context

The site is one person's résumé and a few posts. A CMS or a database would be more to run than
the content is worth, and the résumé must also print as a PDF from the same source.

## Decision

- **`content/resume.md` is the single source** for `/resume` and for the PDF. Posts are
  `content/blog/<slug>.md`.
- **Front matter is a `---` block of `key: value` lines, parsed by hand.** Nothing else is
  supported, so there is no YAML parser to carry. A missing required key fails the build.
- **Résumé**: `name`, `headline`, `email`, `phone`, `location`, `github`, `values`. The paragraphs
  before the first `##` are the summary and sit in the header beside the photo.
- **A job or degree** is `### Title` plus an italic `*Org · Dates · Where*` line. It is read from
  the END, so the organisation may itself hold a " · " (three employers in one entry).
- **Every bullet is shown**, on the page and in the PDF. An "All N highlights" fold existed and
  the owner had it removed (2026-11-16).
- **No arrows or other unusual symbols in `resume.md`.** Neither font's subset has them, and
  Vercel's Linux Chromium has no fallback glyph: they print as boxes in the PDF.
- **A post has exactly three tags.** Enough to place it, few enough to mean something. The build
  fails otherwise. Tags are labels, not links: there are no tag pages.
- **A case study is an ordinary post** with `role`, `when`, `stack` (and optional `link`,
  `linkLabel`) added; the post page shows them as a facts block and a button.
- **A picture on a line of its own becomes a `<figure>`**: the title is the caption, and the size
  in the file's NAME (`name-1600x1000.jpg`) becomes `width`/`height`, so the page keeps the
  picture's room before it loads (no layout shift). Pictures load lazily, except the first of a
  page, which is on screen at once and is fetched early (`fetchpriority="high"`).
- **A table gets its own sideways scroller**, so on a phone it never widens the page.
- **The HTML is not sanitised.** The markdown is the owner's own files in this repository, never
  a visitor's input.
- **Only the posts on disk exist** (`dynamicParams = false`); any other slug is a 404.

## Consequences

- A new kind of front matter means a change in `lib/markdown.ts`.
- `check:rules` holds the three-tags rule, the picture naming and the symbols rule.
