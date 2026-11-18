/**
 * `GET /llms.txt` — the site's index for AI agents (llmstxt.org): who this is,
 * and where the full text is, in markdown. Written from `content/`, at build.
 */
import { getResume, listPosts } from "@/lib/markdown";
import { KOFI_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const [r, posts] = await Promise.all([getResume(), listPosts()]);
  const text = `# ${r.name}

> ${r.headline}. ${r.location}.

This is ${r.name}'s site: a blog at the root, and the résumé. Everything here may be read, quoted and summarised.

- Contact: ${r.email}
- GitHub: https://github.com/${r.github}
- Support: ${KOFI_URL}

## Résumé

- [Résumé](${SITE_URL}/resume): summary, technical skills, work experience, education
- [Résumé as a PDF](${SITE_URL}/api/pdf): the same, 2 pages, A4

## Blog

${posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`).join("\n")}

## Optional

- [Everything in one markdown file](${SITE_URL}/llms-full.txt): the résumé and every post in full
`;
  return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
