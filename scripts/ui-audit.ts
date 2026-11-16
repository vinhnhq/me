// The phone audit, after K-Studio's `ui:audit`: measured on a touch screen, not eyeballed.
// Needs the site running. Usage: bun run audit [baseUrl]   (default http://localhost:3100)
//
//   overflow    the page is wider than the screen
//   touch-size  a stand-alone control's target is under 44×44 (links inside a sentence are exempt, WCAG 2.5.8)
//   small-text  text under 12px
//   contrast    text under 4.5:1 against the page colour (3:1 for large text)
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3100";
const PAGES = ["/", "/blog", "/blog/how-i-build-with-ai-agents", "/blog/k-studio", "/blog/bao-minh-portal"];
const SCREENS = [
  { name: "iPhone SE", width: 320, height: 568 },
  { name: "iPhone", width: 390, height: 844 },
  { name: "iPad", width: 820, height: 1180 },
];

const browser = await chromium.launch();
let failures = 0;
try {
  for (const screen of SCREENS) {
    for (const scheme of ["light", "dark"] as const) {
      const context = await browser.newContext({
        viewport: { width: screen.width, height: screen.height },
        hasTouch: true,
        isMobile: true,
        colorScheme: scheme,
      });
      const page = await context.newPage();
      for (const path of PAGES) {
        await page.goto(base + path, { waitUntil: "networkidle" });
        const problems = await page.evaluate((screenWidth) => {
          const out: string[] = [];
          const doc = document.documentElement;
          // against the SCREEN, not innerWidth: a phone browser widens its layout
          // viewport to fit an overflowing page, and innerWidth grows with it
          if (doc.scrollWidth > screenWidth) out.push(`overflow: page is ${doc.scrollWidth}px wide on a ${screenWidth}px screen`);

          const label = (e: Element) => `<${e.tagName.toLowerCase()}> "${(e.textContent ?? "").trim().slice(0, 30)}"`;

          for (const el of document.querySelectorAll<HTMLElement>("a, button, summary")) {
            const r = el.getBoundingClientRect();
            if (r.width === 0) continue;
            // a link in running text is exempt: its neighbours are words, not other targets
            const inline = el.tagName === "A" && getComputedStyle(el).display === "inline";
            if (!inline && (r.width < 44 || r.height < 44) && r.height < 44) {
              out.push(`touch-size: ${label(el)} is ${Math.round(r.width)}×${Math.round(r.height)}`);
            }
          }

          const lum = (c: number[]) => {
            const [r, g, b] = c.map((v) => {
              const s = v / 255;
              return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          // any CSS colour (oklch too) → sRGB bytes, by letting a canvas paint it
          const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
          const rgb = (css: string) => {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = css;
            ctx.fillRect(0, 0, 1, 1);
            return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
          };
          const bgOf = (el: Element | null): string => {
            for (let e = el; e; e = e.parentElement) {
              const bg = getComputedStyle(e).backgroundColor;
              if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
            }
            return getComputedStyle(document.body).backgroundColor;
          };
          const seen = new Set<string>();
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const el = n.parentElement!;
            if (!n.textContent?.trim() || el.closest("script, style, [aria-hidden]")) continue;
            const cs = getComputedStyle(el);
            if (cs.display === "none" || el.getClientRects().length === 0) continue;
            const size = parseFloat(cs.fontSize);
            if (size < 12 && !seen.has(`s${label(el)}`)) {
              seen.add(`s${label(el)}`);
              out.push(`small-text: ${label(el)} is ${size}px`);
            }
            const a = lum(rgb(cs.color));
            const b = lum(rgb(bgOf(el)));
            const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
            const key = `c${cs.color}${bgOf(el)}${large}`;
            if (ratio < (large ? 3 : 4.5) && !seen.has(key)) {
              seen.add(key);
              out.push(`contrast: ${label(el)} is ${ratio.toFixed(2)}:1 (${cs.color})`);
            }
          }
          return out;
        }, screen.width);
        for (const p of problems) {
          failures++;
          console.log(`✗ ${screen.name} ${scheme} ${path} — ${p}`);
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}
console.log(failures ? `\n${failures} problem(s)` : `✓ ${PAGES.length} pages × ${SCREENS.length} screens × light/dark: no problems`);
process.exit(failures ? 1 : 0);
