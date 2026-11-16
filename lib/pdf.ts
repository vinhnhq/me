import "server-only";
/**
 * The résumé page → an A4 PDF, drawn by a real Chromium (the K-Studio way).
 *
 * The same page a visitor reads is printed, so there is no second template to
 * drift from it: Chromium opens `/`, the print sheet in globals.css applies
 * (A4, light, the nav hidden) and `page.pdf` writes it.
 *
 * Chromium: `@sparticuz/chromium` on Vercel (Linux, the function's own
 * binary); this machine's Playwright Chromium anywhere else.
 */
import type { Browser } from "playwright-core";
import { SITE_URL } from "@/lib/site";

async function launch(): Promise<Browser> {
  const { chromium: pw } = await import("playwright-core");
  if (process.platform === "linux") {
    const chromium = (await import("@sparticuz/chromium")).default;
    return pw.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: true,
    });
  }
  return pw.launch({ headless: true });
}

export async function renderResumePdf(origin: string): Promise<Uint8Array> {
  const browser = await launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
    const page = await context.newPage();
    const res = await page.goto(origin, { waitUntil: "networkidle", timeout: 30_000 });
    // Only the résumé is printed: never an error page or a login wall in
    // front of a preview deployment, which the CDN would then keep.
    if (!res?.ok()) throw new Error(`pdf: ${origin} answered ${res?.status() ?? "nothing"}`);
    if ((await page.locator("[data-resume]").count()) === 0) throw new Error(`pdf: ${origin} has no résumé on it`);
    // A relative /blog/… means nothing on paper: point links at the public site.
    await page.evaluate((site) => {
      for (const a of document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')) {
        a.href = new URL(a.getAttribute("href")!, site).toString();
      }
    }, SITE_URL);
    await page.evaluate(() => document.fonts.ready);
    // margins come from @page in globals.css
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
}
