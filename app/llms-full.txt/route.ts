/**
 * `GET /llms-full.txt` — the résumé and every post in full, as one markdown
 * file: what an AI agent would otherwise have to dig out of the HTML.
 */
import { getResume, listPosts } from "@/lib/markdown";
import { SITE_URL, absoluteLinks } from "@/lib/site";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const [r, posts] = await Promise.all([getResume(), listPosts()]);
  const parts = [
    `# ${r.name}

${r.headline}

- Location: ${r.location}
- Email: ${r.email}
- Phone: ${r.phone}
- GitHub: https://github.com/${r.github}
- Values: ${r.values.join(", ")}
- Source: ${SITE_URL}/

${absoluteLinks(r.markdown)}`,
    ...posts.map(
      (p) => `# ${p.title}

- Published: ${p.date}
- Tags: ${p.tags.join(", ")}
- Source: ${SITE_URL}/blog/${p.slug}

${absoluteLinks(p.markdown)}`,
    ),
  ];
  return new Response(`${parts.join("\n\n---\n\n")}\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
