import axe from "axe-core";
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3100";
const PAGES = ["/", "/resume", "/blog/how-i-build-with-ai-agents", "/blog/k-studio"];
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
          if (doc.scrollWidth > screenWidth) out.push(`overflow: page is ${doc.scrollWidth}px wide on a ${screenWidth}px screen`);

          const label = (e: Element) => `<${e.tagName.toLowerCase()}> "${(e.textContent ?? "").trim().slice(0, 30)}"`;

          for (const el of document.querySelectorAll<HTMLElement>("a, button, summary")) {
            const r = el.getBoundingClientRect();
            if (r.width === 0) continue;
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
          const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
          if (!ctx) return ["contrast: this browser gave no canvas to measure colours with"];
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
            const el = n.parentElement;
            if (!el || !n.textContent?.trim() || el.closest("script, style, [aria-hidden]")) continue;
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
        await page.evaluate(axe.source);
        const violations = await page.evaluate(async () => {
          const { violations } = await (window as unknown as { axe: typeof axe }).axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
          });
          return violations.map(
            (v) =>
              `wcag: ${v.id} (${v.impact}) ${v.help}: ${v.nodes
                .map((n) => n.target.join(" "))
                .slice(0, 3)
                .join(", ")}`,
          );
        });
        problems.push(...violations);
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
