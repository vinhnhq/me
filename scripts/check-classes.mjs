import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { parseSync } from "oxc-parser";
import { __unstable__loadDesignSystem } from "tailwindcss";

const WRITE = process.argv.includes("--write");
const STYLESHEET = "app/globals.css";
const require = createRequire(path.resolve("package.json"));

const design = await __unstable__loadDesignSystem(readFileSync(STYLESHEET, "utf8"), {
  base: path.resolve(path.dirname(STYLESHEET)),
  loadStylesheet: async (id, base) => {
    const file = require.resolve(id === "tailwindcss" ? "tailwindcss/index.css" : id, { paths: [base] });
    return { path: file, base: path.dirname(file), content: readFileSync(file, "utf8") };
  },
});

const known = new Map();
const isUtility = (token) => {
  if (!known.has(token)) known.set(token, design.candidatesToCss([token])[0] !== null);
  return known.get(token);
};

function strings(node, text, found = []) {
  if (!node || typeof node !== "object") return found;
  if (Array.isArray(node)) {
    for (const child of node) strings(child, text, found);
    return found;
  }
  if (node.type === "Literal" && typeof node.value === "string") found.push({ start: node.start + 1, end: node.end - 1 });
  if (node.type === "TemplateElement") {
    const start = text.indexOf(node.value.raw, node.start);
    if (start !== -1 && start + node.value.raw.length <= node.end) found.push({ start, end: start + node.value.raw.length });
  }
  for (const key in node) if (key !== "type") strings(node[key], text, found);
  return found;
}

function tidy(chunk) {
  const tokens = chunk.split(/\s+/).filter(Boolean);
  const utilities = tokens.filter(isUtility);
  const classList =
    utilities.length === tokens.length ? tokens.length > 0 : utilities.length >= 2 && utilities.length / tokens.length >= 0.6;
  if (!classList || chunk.includes("\\")) return null;
  const canonical = tokens.map((token) => (isUtility(token) ? design.canonicalizeCandidates([token])[0] : token));
  const order = new Map(design.getClassOrder(canonical));
  const sorted = [
    ...canonical.filter((token) => order.get(token) == null),
    ...canonical
      .filter((token) => order.get(token) != null)
      .map((token, index) => ({ token, index }))
      .sort((a, b) => (order.get(a.token) < order.get(b.token) ? -1 : order.get(a.token) > order.get(b.token) ? 1 : a.index - b.index))
      .map(({ token }) => token),
  ];
  const renamed = tokens.flatMap((token, index) => (token === canonical[index] ? [] : [`${token} → ${canonical[index]}`]));
  const reordered = canonical.join(" ") !== sorted.join(" ");
  if (!renamed.length && !reordered) return null;
  const lead = /^\s*/.exec(chunk)[0];
  const tail = /\s*$/.exec(chunk)[0];
  return { text: `${lead}${sorted.join(" ")}${tokens.length ? tail : ""}`, renamed, reordered };
}

const files = execSync("git ls-files -co --exclude-standard app components lib", { encoding: "utf8" })
  .split("\n")
  .filter((file) => /\.tsx?$/.test(file));

let problems = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const edits = [];
  for (const { start, end } of strings(parseSync(file, text).program, text)) {
    const fix = tidy(text.slice(start, end));
    if (!fix) continue;
    problems++;
    edits.push({ start, end, text: fix.text });
    if (WRITE) continue;
    const line = text.slice(0, start).split("\n").length;
    for (const change of fix.renamed) console.log(`✗ ${file}:${line}  ${change}`);
    if (fix.reordered) console.log(`✗ ${file}:${line}  the classes are not in Tailwind's order`);
  }
  if (WRITE && edits.length) {
    let next = text;
    for (const edit of edits.sort((a, b) => b.start - a.start)) next = next.slice(0, edit.start) + edit.text + next.slice(edit.end);
    if (parseSync(file, next).errors.length) {
      console.log(`✗ ${file}: rewriting would break it — fix its classes by hand`);
      process.exitCode = 1;
      continue;
    }
    writeFileSync(file, next);
  }
}

if (WRITE) console.log(`rewrote ${problems} class list(s)`);
else console.log(problems ? `${problems} class list(s) to fix — run bun run format` : "every class is canonical and in Tailwind's order");
process.exit(problems && !WRITE ? 1 : 0);
