import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const CONTENT = path.join(process.cwd(), "content");

const toHtml = (source: string) => marked.parse(source, { async: false, gfm: true });

/**
 * Content files open with a `---` block of `key: value` lines. Nothing else
 * is supported, so there is no YAML parser to carry.
 */
function parse(file: string, source: string, required: readonly string[]) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!m) throw new Error(`content/${file} has no front matter`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  for (const key of required) {
    if (!meta[key]) throw new Error(`content/${file} is missing "${key}"`);
  }
  return { meta, body: source.slice(m[0].length) };
}

export type Resume = {
  readonly name: string;
  readonly headline: string;
  readonly email: string;
  readonly phone: string;
  readonly location: string;
  readonly github: string;
  readonly x: string;
  /** The paragraphs before the first `##`: they sit in the header, beside the photo. */
  readonly summaryHtml: string;
  readonly bodyHtml: string;
};

/** `content/resume.md`: the header fields, the summary, then the sections. */
export async function getResume(): Promise<Resume> {
  const source = await readFile(path.join(CONTENT, "resume.md"), "utf8");
  const { meta, body } = parse("resume.md", source, ["name", "headline", "email", "phone", "location", "github", "x"]);
  const cut = body.search(/^## /m);
  if (cut < 0) throw new Error("content/resume.md has no sections");
  return {
    name: meta.name,
    headline: meta.headline,
    email: meta.email,
    phone: meta.phone,
    location: meta.location,
    github: meta.github,
    x: meta.x,
    summaryHtml: toHtml(body.slice(0, cut)),
    bodyHtml: toHtml(body.slice(cut)),
  };
}

export type Post = {
  readonly slug: string;
  readonly title: string;
  /** ISO day, e.g. 2026-11-16 */
  readonly date: string;
  readonly description: string;
  readonly html: string;
};

/** A post is `content/blog/<slug>.md`: title, date, description, then the text. */
function parsePost(slug: string, source: string): Post {
  const { meta, body } = parse(`blog/${slug}.md`, source, ["title", "date", "description"]);
  return { slug, title: meta.title, date: meta.date, description: meta.description, html: toHtml(body) };
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
