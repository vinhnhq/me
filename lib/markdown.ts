import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT = path.join(process.cwd(), "content");

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

export type Entry = {
  readonly title: string;
  readonly org: string;
  readonly when: string;
  readonly where?: string;
  readonly text: string;
};

export type Section = {
  readonly title: string;
  readonly entries?: readonly Entry[];
  readonly text?: string;
};

export type Resume = {
  readonly name: string;
  readonly headline: string;
  readonly email: string;
  readonly phone: string;
  readonly location: string;
  readonly github: string;
  readonly values: readonly string[];
  readonly summary: string;
  readonly sections: readonly Section[];
  readonly markdown: string;
};

function parseEntry(block: string): Entry {
  const [titleLine, ...rest] = block.split("\n");
  const title = titleLine.trim();
  const metaAt = rest.findIndex((l) => l.trim() !== "");
  const meta = /^([*_])(.+)\1$/.exec(rest[metaAt]?.trim() ?? "");
  if (!meta) throw new Error(`content/resume.md: "${title}" needs an *Org · Dates · Where* line under it`);
  const parts = meta[2].split(" · ");
  if (parts.length < 2) throw new Error(`content/resume.md: "${title}" needs at least *Org · Dates*`);
  const where = parts.length > 2 ? parts.pop() : undefined;
  const when = parts.pop() ?? "";
  const text = rest.slice(metaAt + 1).join("\n");
  return {
    title,
    org: parts.join(" · "),
    when,
    where,
    text,
  };
}

function parseSection(block: string): Section {
  const nl = block.indexOf("\n");
  const title = block.slice(0, nl).trim();
  const text = block.slice(nl + 1);
  if (!/^### /m.test(text)) return { title, text };
  const entries = text.split(/^### /m).slice(1).map(parseEntry);
  return { title, entries };
}

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
    values: (meta.values ?? "")
      .split("·")
      .map((v) => v.trim())
      .filter(Boolean),
    summary,
    sections: sections.map(parseSection),
    markdown: body.trim(),
  };
}

export type Post = {
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly role?: string;
  readonly when?: string;
  readonly stack?: string;
  readonly link?: string;
  readonly linkLabel?: string;
  readonly markdown: string;
};

function parsePost(slug: string, source: string): Post {
  const { meta, body } = parse(`blog/${slug}.md`, source, ["title", "date", "description", "tags"]);
  const tags = meta.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (tags.length !== 3) throw new Error(`content/blog/${slug}.md needs exactly 3 tags, has ${tags.length}`);
  return {
    slug,
    title: meta.title,
    date: meta.date,
    description: meta.description,
    tags,
    role: meta.role,
    when: meta.when,
    stack: meta.stack,
    link: meta.link,
    linkLabel: meta.linkLabel,
    markdown: body.trim(),
  };
}

export async function listPosts(): Promise<Post[]> {
  const files = (await readdir(path.join(CONTENT, "blog"))).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(files.map(async (f) => parsePost(f.slice(0, -3), await readFile(path.join(CONTENT, "blog", f), "utf8"))));
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
