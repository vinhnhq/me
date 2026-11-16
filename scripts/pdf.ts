// Prints the résumé page to public/vinh-nguyen-resume.pdf.
// Needs the site running: `bun run dev` (or `bun run build && bun run start`).
// Usage: bun run pdf [baseUrl]
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3100";
const out = "public/vinh-nguyen-resume.pdf";

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print", colorScheme: "light" });
  // Absolute links in the PDF: a relative /agents means nothing on paper.
  const site = process.env.SITE_URL;
  if (site) {
    await page.evaluate((origin) => {
      for (const a of document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')) {
        a.href = new URL(a.getAttribute("href")!, origin).toString();
      }
    }, site);
  }
  await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
  console.log(`wrote ${out}`);
} finally {
  await browser.close();
}
