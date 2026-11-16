# me

Vinh Nguyen's résumé site — https://vinhn.dev. Content is markdown; the site renders it.

- `content/resume.md` — the CV (`/`, and the PDF)
- `content/blog/<slug>.md` — blog posts (`/blog`), each opening with `title`, `date`, `description` front matter
- `public/vinh-nguyen.jpg` — the photo beside the name
- `/api/pdf` — the CV as a PDF, drawn by Chromium on the server from the live page

```bash
bun run dev                      # localhost:3100
bun run build && bun run start   # production build on :3100
```

A push to `main` deploys to production on Vercel. The PDF is drawn from the deployed page, so there is nothing to re-export.
