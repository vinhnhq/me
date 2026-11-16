import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

/** Reads a file from content/ and renders it to HTML. The content is ours, so no sanitising. */
export async function renderContent(name: string): Promise<string> {
  const source = await readFile(path.join(process.cwd(), "content", name), "utf8");
  return marked.parse(source, { async: false, gfm: true });
}
