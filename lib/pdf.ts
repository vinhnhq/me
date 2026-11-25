import "server-only";
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
    if (!res?.ok()) throw new Error(`pdf: ${origin} answered ${res?.status() ?? "nothing"}`);
    if ((await page.locator("[data-resume]").count()) === 0) throw new Error(`pdf: ${origin} has no résumé on it`);
    await page.evaluate((site) => {
      for (const a of document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')) {
        a.href = new URL(a.getAttribute("href")!, site).toString();
      }
    }, SITE_URL);
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
}
