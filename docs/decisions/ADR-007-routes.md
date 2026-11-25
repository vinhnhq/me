# ADR-007: The blog is the root; the résumé is at /resume

## Status

Accepted

## Date

2026-11-18

## Context

The site began as a résumé at `/` with a blog beside it. The owner wanted visitors to meet the
writing first and to hand out the résumé's address himself.

## Decision

- **`/` is the blog list.** Its `h1` is the owner's name, then one line of introduction with a
  link to the résumé, then the posts. `/blog` redirects to `/`; posts keep `/blog/<slug>`.
- **The résumé is `/resume`**, and the PDF is drawn from it (ADR-006).
- **Two places only**: the blog (case studies included) and the résumé.
- **Old addresses redirect**: `/agents` to the agents post, `/projects/k-studio` to the K-Studio
  post, `/vinh-nguyen-resume.pdf` to `/api/pdf`.
- **The résumé link is not pushed everywhere.** The owner gives `/resume` to whoever asks.

## Consequences

- A link to the bare domain shows the blog, not the résumé.
- Each page sets its own canonical address and share card; the layout's are only a fallback.
