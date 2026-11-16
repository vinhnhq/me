import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const CONTENT = path.join(process.cwd(), "content");

const toHtml = (source: string) => marked.parse(source, { async: false, gfm: true });

/** Reads a file from content/ and renders it to HTML. The content is ours, so no sanitising. */
export async function renderContent(name: string): Promise<string> {
  return toHtml(await readFile(path.join(CONTENT, name), "utf8"));
}

export type Post = {
  readonly slug: string;
  readonly title: string;
  /** ISO day, e.g. 2026-11-16 */
  readonly date: string;
  readonly description: string;
  readonly html: string;
};

/**
 * A post is `content/blog/<slug>.md` opening with a `---` block of
 * `key: value` lines (title, date, description). Nothing else is supported,
 * so there is no YAML parser to carry.
 */
function parsePost(slug: string, source: string): Post {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!m) throw new Error(`content/blog/${slug}.md has no front matter`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  for (const key of ["title", "date", "description"]) {
    if (!meta[key]) throw new Error(`content/blog/${slug}.md is missing "${key}"`);
  }
  return {
    slug,
    title: meta.title,
    date: meta.date,
    description: meta.description,
    html: toHtml(source.slice(m[0].length)),
  };
}

/** Every post, newest first. */
export async function listPosts(): Promise<Post[]> {
  const files = (await readdir(path.join(CONTENT, "blog"))).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (f) => parsePost(f.slice(0, -3), await readFile(path.join(CONTENT, "blog", f), "utf8"))),
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await listPosts()).find((p) => p.slug === slug);
}

export const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
