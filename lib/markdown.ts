import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const CONTENT = path.join(process.cwd(), "content");

/** Markdown → HTML. The content is ours, so no sanitising. A table gets its own
 *  sideways scroller, so on a phone it never pushes the page wider than the screen. */
const toHtml = (source: string) =>
  marked
    .parse(source, { async: false, gfm: true })
    .replaceAll("<table>", '<div class="table-scroll"><table>')
    .replaceAll("</table>", "</table></div>");

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

/** One job or degree: a `### Title` with an italic `*Org · Dates · Where*` line under it. */
export type Entry = {
  readonly title: string;
  readonly org: string;
  readonly when: string;
  /** "full-time, Ho Chi Minh City" — absent on a degree */
  readonly where?: string;
  /** what is always shown: the intro line and the bullets above `<!-- more -->` */
  readonly html: string;
  /** the bullets under `<!-- more -->`: folded on the web, printed in the PDF */
  readonly moreHtml?: string;
  /** every bullet, shown or folded */
  readonly count: number;
};

export type Section = {
  readonly title: string;
  /** set for a section of jobs or degrees */
  readonly entries?: readonly Entry[];
  /** set for a plain section, e.g. the skills list */
  readonly html?: string;
};

export type Resume = {
  readonly name: string;
  readonly headline: string;
  readonly email: string;
  readonly phone: string;
  readonly location: string;
  readonly github: string;
  /** "A · B · C": the three words under the summary; optional */
  readonly values: readonly string[];
  /** The paragraphs before the first `##`: they sit in the header, beside the photo. */
  readonly summaryHtml: string;
  readonly sections: readonly Section[];
};

const MORE = "<!-- more -->";

function parseEntry(block: string): Entry {
  const [titleLine, ...rest] = block.split("\n");
  const title = titleLine.trim();
  const metaAt = rest.findIndex((l) => l.trim() !== "");
  const meta = /^\*(.+)\*$/.exec(rest[metaAt]?.trim() ?? "");
  if (!meta) throw new Error(`content/resume.md: "${title}" needs an *Org · Dates · Where* line under it`);
  // read from the end: the organisation itself may hold a " · " (three employers in one entry)
  const parts = meta[1].split(" · ");
  if (parts.length < 2) throw new Error(`content/resume.md: "${title}" needs at least *Org · Dates*`);
  const where = parts.length > 2 ? parts.pop() : undefined;
  const when = parts.pop()!;
  const text = rest.slice(metaAt + 1).join("\n");
  const [shown, more] = text.split(MORE);
  return {
    title,
    org: parts.join(" · "),
    when,
    where,
    html: toHtml(shown),
    moreHtml: more?.trim() ? toHtml(more) : undefined,
    count: (text.match(/^- /gm) ?? []).length,
  };
}

function parseSection(block: string): Section {
  const nl = block.indexOf("\n");
  const title = block.slice(0, nl).trim();
  const text = block.slice(nl + 1);
  if (!/^### /m.test(text)) return { title, html: toHtml(text) };
  const entries = text
    .split(/^### /m)
    .slice(1)
    .map(parseEntry);
  return { title, entries };
}

/** `content/resume.md`: the header fields, the summary, then the sections. */
export async function getResume(): Promise<Resume> {
  const source = await readFile(path.join(CONTENT, "resume.md"), "utf8");
  const { meta, body } = parse("resume.md", source, ["name", "headline", "email", "phone", "location", "github"]);
  const [summary, ...sections] = body.split(/^## /m);
  if (sections.length === 0) throw new Error("content/resume.md has no sections");
  return {
    name: meta.name,
    headline: meta.headline,
    email: meta.email,
    phone: meta.phone,
    location: meta.location,
    github: meta.github,
    values: (meta.values ?? "").split("·").map((v) => v.trim()).filter(Boolean),
    summaryHtml: toHtml(summary),
    sections: sections.map(parseSection),
  };
}

/** A case study: `content/projects/<slug>.md`, linked from the CV. */
export type Project = {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly role: string;
  readonly when: string;
  readonly stack: string;
  /** a public address to try, when there is one */
  readonly link?: string;
  readonly linkLabel?: string;
  readonly html: string;
};

export async function listProjects(): Promise<Project[]> {
  const files = (await readdir(path.join(CONTENT, "projects"))).filter((f) => f.endsWith(".md"));
  return Promise.all(
    files.map(async (f) => {
      const slug = f.slice(0, -3);
      const source = await readFile(path.join(CONTENT, "projects", f), "utf8");
      const { meta, body } = parse(`projects/${f}`, source, ["title", "summary", "role", "when", "stack"]);
      return {
        slug,
        title: meta.title,
        summary: meta.summary,
        role: meta.role,
        when: meta.when,
        stack: meta.stack,
        link: meta.link,
        linkLabel: meta.linkLabel,
        html: toHtml(body),
      };
    }),
  );
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await listProjects()).find((p) => p.slug === slug);
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
