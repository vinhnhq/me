# ADR-013: What the K-Studio post may show

## Status

Accepted

## Date

2026-11-17

## Context

The K-Studio case study describes a real studio's internal software. Its screens hold couples'
names, phone numbers, contracts and photographs.

## Decision

- **The post tells three parts by picture**: the public landing page, the internal app (behind
  sign-in, with no public address) and the couple's portal with the album review.
- **Screens come from the invented demo data, in English**, never from a database that holds real
  albums and couples.
- **Names, phone numbers and contract codes on the portal are blurred, and so are the album's
  photographs.**
- **Left out on purpose**: the studio's letterhead (address, phone, email), pay figures beside
  staff names, and couples' photographs.
- **No link to the app's demo**, in the posts or on the résumé: "a topic and photos are enough to
  explain". The post does link the public landing page, inline and as its button.
- **The numbers in the two posts come from the K-Studio repository** and are refreshed from there
  if they drift.

## Consequences

- The album pictures are blurred; sharp ones need the couple's permission first.
