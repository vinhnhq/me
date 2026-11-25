# ADR-008: Share cards, search engines and AI agents

## Status

Accepted

## Date

2026-11-16 (the X handle: 2026-11-17)

## Context

The site exists to be read during a job search: by people who paste its link, by search engines
and by AI agents.

## Decision

- **Every page builds its own `openGraph` from `shareCard()`** (`lib/site.ts`). A page's
  `openGraph` REPLACES the layout's; Next does not merge them.
- **The card is `/og.png`**, 1200×630: solid burgundy, the photo SMALL and round, the name and
  headline in words, a "Read my résumé" pill. The owner did not want his photo filling the card.
  Few things, all large.
- **LinkedIn gets a different card.** It shows a link as a thumbnail about 200px wide beside the
  title, where words inside the image are specks. `next.config.ts` rewrites `/og.png` to
  `/og-photo.png` (the photo alone on burgundy) when the user agent is LinkedInBot. Check with
  `curl -A LinkedInBot https://vinhn.dev/og.png`.
- **The share cards draw a plain `<img>`**: an `ImageResponse` cannot use `next/image`. The photo
  is read once, when the module loads.
- **`robots.txt` allows every crawler**, AI ones included; only `/api/` is disallowed.
- **`/llms.txt`** is the index for agents (llmstxt.org) and **`/llms-full.txt`** the résumé and
  every post as one markdown file, both written from `content/` at build.
- **JSON-LD**: `ProfilePage` and `Person` on the résumé, `BlogPosting` on each post. `<` is
  escaped, so no text can close the script element.
- **`<meta name="author">` on every page**; LinkedIn reads it.
- **The X handle is in `twitter:site`, `twitter:creator` and the JSON-LD `sameAs` only.** The
  owner does not want it listed on the résumé, the PDF or the llms files.
- **Icons**: white "VN" on a burgundy disc, as static files so `/favicon.ico` exists; `icon2.svg`
  is the same drawn in strokes, with no font.

## Alternatives considered

- **opengraph.xyz's "no call-to-action" warning.** Left alone: the pill is on the card, and the
  warning is that tool's own detector.

## Consequences

- opengraph.xyz cannot show the LinkedIn card (it does not fetch as LinkedInBot); LinkedIn's Post
  Inspector can.
