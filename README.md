# me

Vinh Nguyen's résumé site. Content is markdown; the site renders it.

- `content/resume.md` — the CV (also the PDF)
- `content/agents.md` — "How I build with AI agents", web only, linked from the CV

```bash
bun run dev                                   # localhost:3100
bun run build && bun run start                # production build on :3100
SITE_URL=https://<deployed-url> bun run pdf   # → public/vinh-nguyen-resume.pdf (needs the site running)
```

Set `SITE_URL` when exporting the PDF so its "How I build with agents" link points at the live site.
