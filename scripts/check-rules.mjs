import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const read = file => readFileSync(file, "utf8");
const tracked = pattern => execSync(`git ls-files -co --exclude-standard ${pattern}`, { encoding: "utf8" }).split("\n").filter(Boolean);
const css = read("app/globals.css");
const config = read("next.config.ts");
const pkg = JSON.parse(read("package.json"));
const resume = read("content/resume.md");
const posts = tracked("content/blog").filter(file => file.endsWith(".md"));
const source = [...tracked("app"), ...tracked("components"), ...tracked("lib")].filter(file => /\.tsx?$/.test(file));
const blocks = text => [...text.matchAll(/([^{}]+){([^{}]*)}/g)].map(([, selector, body]) => [selector, body]);
const withText = (files, test) => files.filter(file => test(read(file)));

const RULES = [
  ["ADR-002", "resume.md holds no arrows, dingbats or emoji: the PDF's Chromium prints them as boxes", () => !/[←-⇿⌀-⏿☀-➿⬀-⯿\u{1f000}-\u{1faff}]/u.test(resume)],
  ["ADR-002", "every post has exactly three tags", () =>
    posts.every(file => (read(file).match(/^tags:\s*(.+)$/m)?.[1] ?? "").split(",").filter(tag => tag.trim()).length === 3)],
  ["ADR-002", "a picture in a post is named -WIDTHxHEIGHT and its file exists", () =>
    posts.every(file => [...read(file).matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].every(([, src]) => /-\d+x\d+\.[a-z]+$/.test(src) && existsSync(`public${src}`)))],
  ["ADR-003", "the settings keep their storage keys (theme, size), so a returning reader keeps a choice", () =>
    /createLocalStorage\("theme"\)/.test(read("lib/preferences.ts")) && /createLocalStorage\("size"\)/.test(read("lib/preferences.ts"))],
  ["ADR-004", "the bar is opaque: no backdrop-filter, which re-reads the text under it every frame", () => !/backdrop-filter/.test(css)],
  ["ADR-005", "the menu is a native dialog: Vaul pins the body and zeroes scrollY on iOS", () =>
    !("vaul" in { ...pkg.dependencies, ...pkg.devDependencies }) && /<dialog/.test(read("components/site-menu.tsx"))],
  ["ADR-006", "next.config.ts keeps Chromium external and traces playwright-core into /api/pdf", () =>
    /serverExternalPackages:\s*\[[^\]]*"@sparticuz\/chromium"[^\]]*"playwright-core"/.test(config) &&
    /outputFileTracingIncludes[\s\S]*"\/api\/pdf"[\s\S]*playwright-core\/\*\*/.test(config)],
  ["ADR-006", "every link to /api/pdf is rel=\"nofollow\": the PDF is a copy, not a page", () =>
    source.every(file => [...read(file).matchAll(/<a[^>]*href="\/api\/pdf"[^>]*>/g)].every(([tag]) => /rel="nofollow"/.test(tag)))],
  ["ADR-008", "the X handle is used in the layout and the résumé's JSON-LD only", () =>
    withText(source, text => /\bX_HANDLE\b/.test(text)).every(file => ["lib/site.ts", "app/layout.tsx", "app/resume/page.tsx"].includes(file)) &&
    !/twitter\.com|x\.com/.test(resume)],
  ["ADR-008", "JSON-LD escapes '<', so no value can close the script element", () => /JSON\.stringify\(data\)\.replace\(\/<\/g/.test(read("lib/site.ts"))],
  ["ADR-009", "a page's h1 is hidden with opacity, never visibility: a screen reader must still find it", () =>
    blocks(css).every(([selector, body]) => !(/\bh1\b/.test(selector) && /visibility\s*:\s*hidden/.test(body)))],
  ["ADR-011", "the Ko-fi cup is never on the résumé", () =>
    ["app/resume/page.tsx", "components/resume-header.tsx", "components/resume-body.tsx"].every(file => !/support|KOFI/i.test(read(file))) &&
    !/ko-fi/i.test(resume)],
  ["ADR-012", "the audit compares with the screen's width, not innerWidth, and no check takes a full-page picture", () =>
    !/innerWidth/.test(read("scripts/ui-audit.ts")) && withText(tracked("scripts"), text => /fullPage:\s*true/.test(text)).length === 0],
  ["ADR-012", "tools the gate runs are pinned, never @latest", () =>
    !/@latest/.test(JSON.stringify(pkg.scripts)) &&
    withText(tracked("scripts").filter(file => file !== "scripts/check-rules.mjs"), text => /@latest/.test(text)).length === 0 &&
    /^\d/.test(pkg.devDependencies["playwright-core"])],
  ["ADR-013", "nothing links to the K-Studio app's demo", () =>
    withText([...tracked("content"), ...source], text => /k-studio[a-z0-9-]*\.vercel\.app/.test(text)).length === 0],
];

let broken = 0;
for (const [adr, rule, holds] of RULES) {
  let ok = false;
  try {
    ok = holds();
  } catch (error) {
    console.log(`    could not check: ${error.message.split("\n")[0]}`);
  }
  if (!ok) broken++;
  console.log(`${ok ? "✓" : "✗"} ${adr}  ${rule}`);
}
console.log(broken ? `${broken} rule(s) broken — the reason is in docs/decisions` : `all ${RULES.length} rules hold`);
process.exit(broken ? 1 : 0);
