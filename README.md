# me

Vinh Nguyen's résumé site — https://vinhn.dev. Content is markdown; the site renders it.

- `content/resume.md` — the CV (`/`, and the PDF)
- `content/blog/<slug>.md` — blog posts and case studies (`/blog`), each opening with `title`, `date`, `description` and three `tags` as front matter
- `public/vinh-nguyen.jpg` — the photo beside the name
- `/api/pdf` — the CV as a PDF, drawn by Chromium on the server from the live page

```bash
bun run dev                      # localhost:3100
bun run build && bun run start   # production build on :3100
bun run audit                    # phone audit: overflow, touch targets, small text, contrast (site must be running)
```

A push to `main` deploys to production on Vercel. The PDF is drawn from the deployed page, so there is nothing to re-export.
