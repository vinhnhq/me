# vinhn.dev

Vinh Nguyen's site: a blog at [vinhn.dev](https://vinhn.dev) and a résumé at
[vinhn.dev/resume](https://vinhn.dev/resume), which also prints itself as a two-page PDF.

It is a small, real product built with an AI coding agent (Claude Code): the agent writes most
of the lines, and the checks below decide whether a change is done. Every decision is written
down in [`docs/decisions`](docs/decisions/README.md); the code itself carries no comments.

## How it is made

- **Next.js 16** (App Router), **React 19**, **Tailwind v4**, **Bun**. No database, no CMS. The
  look is utility classes; scroll-driven motion and the print sheet are plain CSS
  ([ADR-015](docs/decisions/ADR-015-tailwind-and-ui-sdk-for-styling.md)).
- **Content is markdown**: `content/resume.md` and `content/blog/<slug>.md`, read at build and
  rendered as React components, never as raw HTML.
- **The PDF is the page**: `/api/pdf` opens `/resume` in Chromium on the server and prints it.
- **The interactive controls** (the menu, theme and text size) use [ui-sdk](https://ui-sdk.dev).
- **For agents and crawlers**: `/llms.txt`, `/llms-full.txt`, JSON-LD, a sitemap.

## Run it

```bash
bun install
bun run dev                      # http://localhost:3100
bun run build && bun run start   # the production build, on :3100
```

## Write

| To change | Edit |
|---|---|
| The résumé | `content/resume.md`: front matter (`name`, `headline`, `email`, `phone`, `location`, `github`, `values`), a summary, then `##` sections. A job is `### Title` and an italic `*Org · Dates · Where*` line |
| A post | `content/blog/<slug>.md`: `title`, `date`, `description` and exactly three `tags` |
| A case study | A post with `role`, `when`, `stack` and optionally `link`, `linkLabel` |
| A picture | `![what it shows](/blog/<slug>/name-1600x1000.jpg "Caption")` on its own line; the file goes in `public/blog/<slug>/`, and the size in its name becomes the picture's width and height |

## Checks

Each one answers pass or fail. The ones that open the site need it running (`bun run start`), or
take another address as an argument.

| Command | What it proves |
|---|---|
| `bun run typecheck` | The types hold |
| `bun run check:comments` | There is no comment in the code; a reason belongs in `docs/decisions` |
| `bun run check:rules` | Nineteen rules, each tied to its decision record: the menu never uses a scroll-pinning drawer, the PDF route stays out of search results, the résumé has no symbol the PDF cannot print, and so on |
| `bun run doctor` | react-doctor scores 100 |
| `bun run audit [url]` | On 4 pages, 3 touch screens and both themes: the page is no wider than the screen, controls are 44×44, text is at least 12px and 4.5:1, and no WCAG 2.2 A or AA rule that axe-core can test is broken |
| `bun run check:pdf [url]` | The résumé's PDF answers, has exactly 2 pages and is marked `noindex` |
| `bun run check:visual` | 83 pictures (4 pages, 3 sizes, both themes, the menu, keyboard focus, the résumé under print styles) match the baseline with zero changed pixels. `bun run shots:baseline` saves the baseline from a build you trust, on the same machine |
| `bun run check:real` | In real Safari (iPhone and iPad simulators) and real Chrome (Android emulator): no overflow, 44px targets, the accessibility rules, the title reaching the bar, the menu, the scroll position kept under the menu, the dark theme and large text. Needs Xcode and Android Studio |
| `bun run verify` | All of the above, in order, on a fresh build. `SKIP=real` leaves a step out and says so |

## The loop

1. A change is a branch and a pull request. Nobody pushes to `main`.
2. Every pull request runs the fast gate in GitHub Actions: comments, rules, react-doctor, the
   build, the types, the audit and the PDF.
3. The owner reads the pull request and merges it. A merge to `main` deploys production on
   Vercel; any other branch gets a preview.
4. Every day at 08:00 in Vietnam a workflow checks the live site. A failure opens an issue.
5. Issues carry the queue: `agent-ready` for work an agent can finish against the checks,
   `needs-owner` for what waits on a person.

An agent works one issue at a time, has one other agent review its diff, opens the pull request
and stops. It never merges and never deploys. The reasoning is in
[ADR-014](docs/decisions/ADR-014-the-working-loop.md).

## Where things are

| Path | What |
|---|---|
| `content/` | The résumé and the posts |
| `app/` | Pages and routes; `app/globals.css` holds the tokens, the motion and the print sheet |
| `components/` | The header, the menu, the controls, the résumé's parts |
| `lib/` | Reading the markdown, drawing the PDF, the site's constants |
| `scripts/` | The checks |
| `docs/decisions/` | Why each thing is the way it is |
| `.claude/skills/` | The guides and commands the agent works from |

## Licence

The code is under the [MIT licence](LICENSE). The files in `content/` and `public/` (the résumé,
the posts, the photograph and the screenshots) are Vinh Nguyen's own and are not for reuse.
