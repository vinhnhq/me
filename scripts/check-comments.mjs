import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseSync } from "oxc-parser";

const DIRECTIVE = /^\**\s*(react-doctor-disable|@ts-(expect-error|ignore|nocheck)|eslint-disable|biome-ignore)/;
const STRIP = process.argv.includes("--strip");
const MARK = "\u0000";

const files = execSync("git ls-files -co --exclude-standard app components lib scripts next.config.ts", { encoding: "utf8" })
  .split("\n")
  .filter((file) => /\.(tsx?|mjs|css)$/.test(file) && existsSync(file));

function comments(file, text) {
  const found = file.endsWith(".css")
    ? [...text.matchAll(/\/\*[\s\S]*?\*\//g)].map((m) => ({ start: m.index, end: m.index + m[0].length, value: m[0].slice(2, -2) }))
    : parseSync(file, text).comments;
  return found.filter((comment) => !DIRECTIVE.test(comment.value));
}

function strip(file, text, found) {
  let out = text;
  for (const comment of [...found].reverse()) {
    const before = out.slice(0, comment.start).trimEnd();
    const after = out.slice(comment.end).trimStart();
    const inJsx = file.endsWith(".tsx") && before.endsWith("{") && after.startsWith("}");
    const start = inJsx ? before.length - 1 : comment.start;
    const end = inJsx ? out.length - after.length + 1 : comment.end;
    out = out.slice(0, start) + MARK + out.slice(end);
  }
  return out
    .split("\n")
    .flatMap((line) => {
      if (!line.includes(MARK)) return [line];
      const rest = line.replaceAll(MARK, "").trimEnd();
      return rest.trim() ? [rest] : [];
    })
    .join("\n")
    .replace(/^\n+/, "")
    .replace(/\n{3,}/g, "\n\n");
}

let total = 0;
let lines = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const found = comments(file, text);
  if (!found.length) continue;
  total += found.length;
  if (STRIP) {
    const stripped = strip(file, text, found);
    if (!file.endsWith(".css") && parseSync(file, stripped).errors.length) {
      console.log(`✗ ${file}: stripping would break it — remove its comments by hand`);
      process.exitCode = 1;
      continue;
    }
    lines += text.split("\n").length - stripped.split("\n").length;
    writeFileSync(file, stripped);
    continue;
  }
  for (const comment of found) {
    const line = text.slice(0, comment.start).split("\n").length;
    console.log(`✗ ${file}:${line}  ${comment.value.trim().split("\n")[0].slice(0, 90)}`);
  }
}

if (STRIP) console.log(`removed ${total} comments, ${lines} lines`);
else console.log(total ? `${total} comment(s): a decision belongs in docs/decisions, the rest is deleted` : "no comments in the code");
if (total && !STRIP) process.exitCode = 1;
