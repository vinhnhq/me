import { chromium } from "playwright-core";
import { PNG } from "pngjs";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3100";
const UPDATE = process.argv.includes("--update");
const OUT = UPDATE ? "visual/baseline" : "visual/current";
const SIZES = { phone: [390, 844, true], tablet: [820, 1180, true], desk: [1440, 900, false] };
const PAGES = { home: "/", resume: "/resume", post: "/blog/k-studio", agents: "/blog/how-i-build-with-ai-agents" };
const CHANNEL = 2;

rmSync(OUT, { recursive: true, force: true });
if (!UPDATE) rmSync("visual/diff", { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync("visual/diff", { recursive: true });

const browser = await chromium.launch();
const shots = [];

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const limit = new Promise(done => setTimeout(done, 4000));
    await Promise.all([...document.images].map(img => Promise.race([img.decode().catch(() => {}), limit])));
  });
  await page.waitForTimeout(250);
}

async function take(page, name) {
  await settle(page);
  writeFileSync(`${OUT}/${name}.png`, await page.screenshot());
  shots.push(name);
}

for (const [size, [width, height, touch]] of Object.entries(SIZES)) {
  for (const scheme of ["light", "dark"]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
      colorScheme: scheme,
      hasTouch: touch,
      isMobile: touch,
    });
    const page = await context.newPage();
    for (const [name, path] of Object.entries(PAGES)) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      await page.addStyleTag({ content: "* { caret-color: transparent !important; }" });
      await take(page, `${size}-${scheme}-${name}-top`);
      await page.evaluate(top => window.scrollTo(0, top), height * 1.5);
      await take(page, `${size}-${scheme}-${name}-scrolled`);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await take(page, `${size}-${scheme}-${name}-end`);
    }
    if (size !== "desk") {
      await page.goto(`${BASE}/resume`, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: "Menu" }).click();
      await page.waitForTimeout(600);
      await take(page, `${size}-${scheme}-menu`);
    } else {
      await page.goto(`${BASE}/resume`, { waitUntil: "networkidle" });
      await page.keyboard.press("Tab");
      await take(page, `${size}-${scheme}-focus-skip`);
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await take(page, `${size}-${scheme}-focus-pill`);
    }
    await context.close();
  }
}
await browser.close();

if (UPDATE) {
  console.log(`saved ${shots.length} baseline pictures in visual/baseline`);
  process.exit(0);
}

let changed = 0;
for (const name of shots) {
  const baseline = `visual/baseline/${name}.png`;
  if (!existsSync(baseline)) {
    changed++;
    console.log(`✗ ${name}: no baseline — run bun run shots:baseline on a known-good build`);
    continue;
  }
  const a = PNG.sync.read(readFileSync(baseline));
  const b = PNG.sync.read(readFileSync(`${OUT}/${name}.png`));
  if (a.width !== b.width || a.height !== b.height) {
    changed++;
    console.log(`✗ ${name}: ${b.width}×${b.height}, the baseline is ${a.width}×${a.height}`);
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  let pixels = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const differs = [0, 1, 2].some(c => Math.abs(a.data[i + c] - b.data[i + c]) > CHANNEL);
    if (differs) pixels++;
    diff.data[i] = differs ? 255 : a.data[i] >> 2;
    diff.data[i + 1] = differs ? 0 : a.data[i + 1] >> 2;
    diff.data[i + 2] = differs ? 0 : a.data[i + 2] >> 2;
    diff.data[i + 3] = 255;
  }
  if (pixels) {
    changed++;
    writeFileSync(`visual/diff/${name}.png`, PNG.sync.write(diff));
    console.log(`✗ ${name}: ${pixels} pixel(s) changed — see visual/diff/${name}.png`);
  }
}
console.log(changed ? `${changed} of ${shots.length} pictures changed` : `✓ ${shots.length}/${shots.length} pictures: no pixel changed`);
process.exit(changed ? 1 : 0);
