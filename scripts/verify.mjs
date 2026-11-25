import { execSync, spawn, spawnSync } from "node:child_process";

const SKIP = (process.env.SKIP ?? "").split(",").filter(Boolean);
const PORT = 3100;
const results = [];

function step(name, command) {
  if (SKIP.includes(name)) return results.push([name, "skipped", ""]);
  const started = Date.now();
  const done = spawnSync(command, { shell: true, encoding: "utf8", maxBuffer: 1 << 28, timeout: 20 * 60 * 1000 });
  const output = `${done.stderr}${done.stdout}`.trim();
  const ok = done.status === 0;
  results.push([name, ok ? "pass" : "FAIL", output.split("\n").at(-1).slice(0, 90)]);
  console.log(`${ok ? "✓" : "✗"} ${name} (${Math.round((Date.now() - started) / 1000)}s)`);
  if (!ok) console.log(output.split("\n").slice(-25).join("\n"));
  return ok;
}

const stopServer = () => {
  try {
    execSync(`lsof -ti :${PORT} | xargs kill`, { stdio: "ignore" });
  } catch {}
};

step("typecheck", "bun run typecheck");
step("comments", "bun run check:comments");
step("rules", "bun run check:rules");
step("react-doctor", "bun run doctor 2>&1 | tee /dev/stderr | grep -q '100 / 100'");
stopServer();
const built = step("build", "bun run build");
const server = built && spawn("./node_modules/.bin/next", ["start", "-p", String(PORT)], { stdio: "ignore" });
const answers =
  server &&
  spawnSync(`for i in $(seq 1 60); do curl -sf -o /dev/null http://localhost:${PORT}/ && exit 0; sleep 0.5; done; exit 1`, { shell: true, stdio: "ignore" }).status === 0;
if (server && !answers) results.push(["server", "FAIL", `the build did not answer on :${PORT}`]);
try {
  if (answers) {
    step("audit", "bun run audit");
    step("pdf", "bun run check:pdf");
    step("visual", "bun run check:visual");
    step("real", "bun run check:real");
  }
} finally {
  if (server) server.kill();
  stopServer();
}

console.log("\n" + results.map(([name, state, last]) => `${state.padEnd(8)} ${name.padEnd(13)} ${last}`).join("\n"));
const failed = results.filter(([, state]) => state === "FAIL");
const skipped = results.filter(([, state]) => state === "skipped").map(([name]) => name);
console.log(
  failed.length
    ? `\n${failed.length} step(s) failed — not ready to hand over`
    : skipped.length
      ? `\nwhat ran passed, but this is NOT a full verification — skipped: ${skipped.join(", ")}`
      : "\nevery step passed — look through screens/real, then hand over",
);
process.exit(failed.length ? 1 : 0);
