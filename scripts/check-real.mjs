import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "http://localhost:3100";
const PORT = new URL(BASE).port || "80";
const ONLY = process.env.ONLY?.toLowerCase();
const PAGES = { home: "/", resume: "/resume", post: "/blog/k-studio" };
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const OUT = "screens/real";
const SDK = process.env.ANDROID_HOME ?? `${homedir()}/Library/Android/sdk`;
const ADB = `${SDK}/platform-tools/adb`;
const DRIVER = "http://localhost:4723";
const NEWEST_PHONE = process.env.IOS_PHONE ?? "iPhone 17";
const NEWEST_TABLET = process.env.IOS_TABLET ?? "iPad Air 11-inch (M4)";

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const run = (file, args, options = {}) => execFileSync(file, args, { encoding: "utf8", ...options });
const quiet = (file, args) => {
  try {
    return run(file, args, { stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
};
const wanted = (name) => !ONLY || name.includes(ONLY);
const axe = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
let failures = 0;
let ran = 0;
const fail = (message) => {
  failures++;
  console.log(`✗ ${message}`);
};

const MEASURE = `(() => {
  const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  const small = [...document.querySelectorAll("a, button")]
    .filter(el => el.getClientRects().length && !el.closest("[inert]") && getComputedStyle(el).display !== "inline")
    .map(el => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.width > 0 && r.height < 43.5)
    .map(({ el, r }) => (el.getAttribute("aria-label") || el.textContent.trim().slice(0, 24)) + " " + Math.round(r.width) + "×" + Math.round(r.height));
  return { overflow, small, width: innerWidth };
})()`;
const AXE = `axe.run(document, { runOnly: { type: "tag", values: ${JSON.stringify(TAGS)} } }).then(r => r.violations.map(v => v.id + " (" + v.impact + "): " + v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")))`;
const MENU_BUTTON = `document.querySelector('button[aria-label="Menu"]')`;
const MENU_OPEN = `!!document.querySelector('dialog[open], [data-slot="dialog-content"][data-open]')`;
const STATE = `({ y: Math.round(scrollY), room: document.documentElement.scrollHeight - innerHeight, end: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--head-end")), usable: ${MENU_BUTTON}.getClientRects().length > 0 && !${MENU_BUTTON}.inert, stuck: document.documentElement.hasAttribute("data-head-stuck"), scheme: document.documentElement.dataset.colorScheme, size: document.documentElement.dataset.size, font: getComputedStyle(document.documentElement).fontSize, dark: getComputedStyle(document.body).backgroundColor })`;
const PRESS = (label) =>
  `([...document.querySelectorAll('[role="radio"]')].filter(el => el.getAttribute("aria-label") === ${JSON.stringify(label)} && el.getClientRects().length)[0]?.click(), true)`;

async function settled(js, done) {
  let state = await js(STATE);
  for (let waited = 0; waited < 4000 && !done(state); waited += 250) {
    await sleep(250);
    state = await js(STATE);
  }
  return state;
}

const DARK_PAGE = "rgb(17, 18, 20)";

async function behaviour(js) {
  await js("(scrollTo(0, 600), true)");
  const before = await settled(js, (state) => state.room < 600 || (state.y > 0 && state.stuck === state.y >= state.end));
  const scrolls = before.room >= before.y && before.y > 0;
  const title = ["title-in-bar", !scrolls || before.stuck === before.y >= before.end];
  if (!before.usable) return { opened: false, states: { before }, checks: [title] };
  await js(`(${MENU_BUTTON}.click(), true)`);
  await sleep(900);
  const opened = await js(MENU_OPEN);
  const during = await settled(js, (state) => !scrolls || (state.y === before.y && state.stuck));
  await js(PRESS("Dark theme"));
  const dark = await settled(js, (state) => state.scheme === "dark" && state.dark === DARK_PAGE);
  await js(PRESS("Large text"));
  const large = await settled(js, (state) => state.size === "l" && state.font === "18px");
  await js(PRESS("Follow the device"));
  await js(PRESS("Medium text"));
  await sleep(700);
  return {
    opened,
    states: { before, during, dark, large },
    checks: [
      title,
      ["menu-opens", opened],
      ["scroll-kept", !scrolls || (during.y === before.y && during.stuck)],
      ["dark", dark.scheme === "dark" && dark.dark === DARK_PAGE],
      ["large-text", large.size === "l" && large.font === "18px"],
    ],
  };
}

function verdict(name, page, report, violations, checks, states) {
  const wrong = checks.filter(([, ok]) => !ok).length;
  const bad = report.overflow > 0 || report.small.length || violations.length || wrong;
  if (bad) failures++;
  ran++;
  console.log(
    `${bad ? "✗" : "✓"} ${name.padEnd(40)} ${page.padEnd(6)} width=${report.width} overflow=${report.overflow} axe=${violations.length} ` +
      checks.map(([what, ok]) => `${what}=${ok ? "ok" : "FAILED"}`).join(" ") +
      (wrong ? `\n    states: ${JSON.stringify(states)}` : "") +
      (report.small.length ? `\n    small: ${report.small.join(" | ")}` : "") +
      violations.map((v) => `\n    axe ${v}`).join(""),
  );
}

async function android() {
  const name = "android-chrome";
  if (!wanted(name)) return;
  if (!quiet(ADB, ["devices"]).includes("\tdevice")) {
    const avd = quiet(`${SDK}/emulator/emulator`, ["-list-avds"]).trim().split("\n")[0];
    if (!avd) return fail(`${name}: no adb or no emulator set up in Android Studio (${SDK})`);
    spawn(`${SDK}/emulator/emulator`, ["-avd", avd, "-no-snapshot-save", "-no-boot-anim", "-no-audio"], {
      detached: true,
      stdio: "ignore",
    }).unref();
    let up = false;
    for (let waited = 0; waited < 240 && !up; waited += 2) {
      await sleep(2000);
      up = quiet(ADB, ["shell", "getprop", "sys.boot_completed"]).trim() === "1";
    }
    if (!up) return fail(`${name}: the emulator did not boot in four minutes`);
  }
  run(ADB, ["reverse", `tcp:${PORT}`, `tcp:${PORT}`]);
  run(ADB, ["shell", 'echo "chrome --disable-fre --no-default-browser-check --no-first-run" > /data/local/tmp/chrome-command-line']);
  run(ADB, ["shell", "am", "set-debug-app", "--persistent", "com.android.chrome"]);
  run(ADB, ["shell", "am", "force-stop", "com.android.chrome"]);
  run(ADB, ["shell", "am", "start", "-n", "com.android.chrome/com.google.android.apps.chrome.Main", "-d", `${BASE}/`]);
  run(ADB, ["forward", "tcp:9222", "localabstract:chrome_devtools_remote"]);
  let browser;
  for (let attempt = 0; attempt < 20 && !browser; attempt++) {
    browser = await chromium.connectOverCDP("http://localhost:9222").catch(() => null);
    if (!browser) await sleep(1500);
  }
  if (!browser) return fail(`${name}: Chrome on the emulator did not answer`);
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().startsWith(BASE)) ?? (await context.newPage());
  const js = (script) => page.evaluate(script);
  const picture = (file) => writeFileSync(file, run(ADB, ["exec-out", "screencap", "-p"], { encoding: "buffer", maxBuffer: 1 << 28 }));
  mkdirSync(`${OUT}/${name}`, { recursive: true });
  for (const [key, path] of Object.entries(PAGES)) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await sleep(1500);
    picture(`${OUT}/${name}/${key}-top.png`);
    const report = await js(MEASURE);
    await page.addScriptTag({ content: axe });
    const violations = await js(AXE);
    const { opened, checks, states } = await behaviour(js);
    if (opened) picture(`${OUT}/${name}/${key}-menu.png`);
    await page.keyboard.press("Escape");
    await sleep(700);
    if (opened) checks.push(["menu-closes", !(await js(MENU_OPEN))]);
    picture(`${OUT}/${name}/${key}-scrolled.png`);
    verdict(name, key, report, violations, checks, states);
  }
  await browser.close();
  quiet(ADB, ["forward", "--remove", "tcp:9222"]);
  quiet(ADB, ["reverse", "--remove", `tcp:${PORT}`]);
  quiet(ADB, ["shell", "am", "clear-debug-app"]);
}

async function driver(method, path, body) {
  const answer = await fetch(`${DRIVER}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(300000),
  });
  const { value } = await answer.json();
  if (value?.error) throw new Error(`${value.error}: ${value.message}`);
  return value;
}

const booted = () =>
  Object.entries(JSON.parse(run("xcrun", ["simctl", "list", "devices", "booted", "-j"])).devices).flatMap(([runtime, list]) =>
    list.map((device) => ({ ...device, runtime })),
  );

async function safari(type) {
  const name = `ios-safari-${type.toLowerCase()}`;
  if (!wanted(name)) return;
  const open = () =>
    driver("POST", "/session", {
      capabilities: { alwaysMatch: { browserName: "safari", platformName: "iOS", "safari:useSimulator": true, "safari:deviceType": type } },
    });
  const session = await open()
    .catch(open)
    .catch((error) => fail(`${name}: no simulator Safari answered — ${error.message.slice(0, 120)}`));
  if (!session) return;
  const at = `/session/${session.sessionId}`;
  const js = (script) => driver("POST", `${at}/execute/sync`, { script: `return ${script}`, args: [] });
  const caps = session.capabilities;
  const version = String(caps["safari:platformVersion"]).replaceAll(".", "-");
  const udid = booted().find((d) => d.name === caps["safari:deviceName"] && d.runtime.includes(version))?.udid;
  const label = `${name} (${caps["safari:deviceName"]}, iOS ${caps["safari:platformVersion"]})`;
  if (!udid) fail(`${label}: its simulator was not found among the booted ones, so no pictures`);
  const picture = (file) => udid && quiet("xcrun", ["simctl", "io", udid, "screenshot", file]);
  mkdirSync(`${OUT}/${name}`, { recursive: true });
  try {
    for (const [key, path] of Object.entries(PAGES)) {
      await driver("POST", `${at}/url`, { url: `${BASE}${path}` });
      await sleep(3000);
      picture(`${OUT}/${name}/${key}-top.png`);
      const report = await js(MEASURE);
      const violations = await driver("POST", `${at}/execute/async`, {
        script: `const done = arguments[0]; ${axe}; ${AXE}.then(done)`,
        args: [],
      });
      const { opened, checks, states } = await behaviour(js);
      if (opened) picture(`${OUT}/${name}/${key}-menu.png`);
      verdict(label, key, report, violations, checks, states);
    }
  } finally {
    await driver("DELETE", at).catch(() => {});
  }
}

async function newestSafari(device) {
  const name = `ios-newest-${device
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-$/, "")}`;
  if (!wanted(name)) return;
  const runtimes = JSON.parse(run("xcrun", ["simctl", "list", "devices", "available", "-j"])).devices;
  const newest = Object.keys(runtimes)
    .filter((key) => key.includes("iOS"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .at(-1);
  const udid = runtimes[newest]?.find((d) => d.name === device)?.udid;
  if (!udid) return fail(`${name}: no "${device}" on the newest iOS runtime (${newest})`);
  quiet("xcrun", ["simctl", "boot", udid]);
  try {
    run("xcrun", ["simctl", "bootstatus", udid, "-b"], { stdio: "ignore", timeout: 300000 });
  } catch {
    return fail(`${name}: the simulator did not boot in five minutes`);
  }
  quiet("xcrun", ["simctl", "terminate", udid, "com.apple.mobilesafari"]);
  quiet("xcrun", ["simctl", "launch", udid, "com.apple.mobilesafari"]);
  await sleep(8000);
  mkdirSync(`${OUT}/${name}`, { recursive: true });
  let taken = 0;
  for (const [key, path] of Object.entries(PAGES)) {
    let opened = false;
    for (let attempt = 0; attempt < 6 && !opened; attempt++) {
      try {
        run("xcrun", ["simctl", "openurl", udid, `${BASE}${path}?r=${Date.now()}`], { stdio: "ignore", timeout: 120000 });
        opened = true;
      } catch {
        await sleep(10000);
      }
    }
    if (!opened) {
      fail(`${name} ${key}: Safari did not open the page`);
      continue;
    }
    await sleep(taken ? 7000 : 14000);
    run("xcrun", ["simctl", "io", udid, "screenshot", `${OUT}/${name}/${key}-first-screen.png`], { stdio: "ignore" });
    taken++;
  }
  ran++;
  console.log(
    `• ${name.padEnd(40)} ${newest.split(".").at(-1)}: ${taken} first-screen pictures to look at (this Safari takes no WebDriver, so nothing is measured)`,
  );
}

if (!ONLY) rmSync(OUT, { recursive: true, force: true });
const safaridriver = spawn("safaridriver", ["-p", "4723"], { stdio: "ignore" });
process.on("exit", () => safaridriver.kill());
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => process.exit(1));
await sleep(1500);
try {
  await android();
  await safari("iPhone");
  await safari("iPad");
  await newestSafari(NEWEST_PHONE);
  await newestSafari(NEWEST_TABLET);
} finally {
  safaridriver.kill();
}
if (!ran && !failures) fail(`nothing ran${ONLY ? ` — ONLY=${ONLY} matches no target` : ""}`);
console.log(failures ? `${failures} failure(s)` : `real Safari and real Chrome passed (${ran} runs) — pictures in ${OUT}`);
process.exit(failures ? 1 : 0);
