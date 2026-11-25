const base = process.argv[2] ?? process.env.BASE ?? "http://localhost:3100";
const response = await fetch(`${base}/api/pdf`);
const bytes = Buffer.from(await response.arrayBuffer());
const text = bytes.toString("latin1");
const pages = Math.max(0, ...[...text.matchAll(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/g)].map(match => Number(match[1])));
const robots = response.headers.get("x-robots-tag") ?? "";
const problems = [
  response.ok ? null : `answered ${response.status}`,
  text.startsWith("%PDF-") ? null : "is not a PDF",
  pages === 2 ? null : `has ${pages} page(s), not 2`,
  /noindex/.test(robots) ? null : "is missing x-robots-tag: noindex",
].filter(Boolean);
for (const problem of problems) console.log(`✗ ${base}/api/pdf ${problem}`);
if (!problems.length) console.log(`✓ the PDF: 2 pages, ${Math.round(bytes.length / 1024)} KB, not indexed`);
process.exit(problems.length ? 1 : 0);
