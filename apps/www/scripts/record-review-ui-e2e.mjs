import assert from "node:assert/strict";
import { createServer } from "node:http";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { build } from "../../../packages/core/node_modules/esbuild/lib/main.js";

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? chromium.executablePath();
const repository = fileURLToPath(new URL("../../../", import.meta.url));
const temporary = await mkdtemp(join(tmpdir(), "vlak-record-review-ui-"));
await cp(join(repository, "examples/workflows/record-review"), join(temporary, "record-review"), { recursive: true });
await build({
  absWorkingDir: repository,
  bundle: true,
  define: { "process.env.NODE_ENV": '"production"' },
  entryNames: "app",
  entryPoints: [join(temporary, "record-review/ui/src/main.tsx")],
  format: "esm",
  jsx: "automatic",
  loader: { ".woff2": "file" },
  logLevel: "error",
  nodePaths: [join(repository, "apps/www/node_modules")],
  outdir: temporary,
  platform: "browser",
});
await writeFile(join(temporary, "index.html"), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');

const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url ?? "/", "http://localhost").pathname;
    const filename = path === "/" ? "index.html" : path.slice(1);
    const content = await readFile(join(temporary, filename));
    response.setHeader("content-type", filename.endsWith(".css") ? "text/css" : filename.endsWith(".js") ? "text/javascript" : "text/html");
    response.end(content);
  } catch {
    response.statusCode = 404;
    response.end("Not found");
  }
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const address = server.address();
if (!address || typeof address === "string") throw new Error("The record-review test server did not start.");
const base = `http://127.0.0.1:${address.port}`;
test.after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await rm(temporary, { recursive: true, force: true });
});
const records = [
  { id: "slow-record", revision: 1, title: "Slow record", reference: "REF-1", summary: "Original slow summary", status: "ready-for-review", updatedAt: "2026-09-11T10:00:00.000Z" },
  { id: "fast-record", revision: 1, title: "Fast record", reference: "REF-2", summary: "Original fast summary", status: "needs-information", updatedAt: "2026-09-11T10:00:00.000Z" },
];

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function browser() {
  return chromium.launch({ headless: true, executablePath });
}

async function mockApi(page, options = {}) {
  const started = options.started;
  await page.route("**/api/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/records") {
      const query = url.searchParams.get("query") ?? "";
      if (query === "slow") { started?.list(); await delay(250); }
      if (query === "fast") await delay(10);
      const selected = query === "slow" ? [records[0]] : query === "fast" ? [records[1]] : records;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ records: selected }) });
      return;
    }
    const id = decodeURIComponent(url.pathname.slice("/api/records/".length));
    const record = records.find(item => item.id === id);
    if (!record) return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ kind: "not-found" }) });
    if (id === "slow-record" && options.delayDetail) { started?.detail(); await delay(250); }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record, history: [] }) });
  });
}

test("record navigation retains a draft until the user explicitly discards it", async () => {
  const instance = await browser();
  const page = await instance.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await mockApi(page);
    await page.goto(base, { waitUntil: "networkidle" });
    const navigation = page.getByRole("navigation", { name: "Records" });
    await navigation.getByRole("button", { name: /Slow record/ }).click();
    await page.getByRole("button", { name: "Edit record" }).click();
    await page.getByLabel("Summary").fill("Unsaved draft that must survive");

    await page.getByLabel("Search").fill("Fast");
    await navigation.getByRole("button", { name: /Fast record/ }).waitFor();
    assert.equal(await page.getByLabel("Summary").inputValue(), "Unsaved draft that must survive");

    await navigation.getByRole("button", { name: /Fast record/ }).click();
    const confirmation = page.getByRole("dialog", { name: "Discard this draft?" });
    await confirmation.getByRole("button", { name: "Keep editing" }).click();
    assert.equal(await page.getByLabel("Summary").inputValue(), "Unsaved draft that must survive");

    await navigation.getByRole("button", { name: /Fast record/ }).click();
    await page.getByRole("dialog", { name: "Discard this draft?" }).getByRole("button", { name: "Discard draft and continue" }).click();
    await page.getByRole("heading", { name: "Fast record" }).waitFor();
    assert.equal(await page.locator(".workflow-description dd").filter({ hasText: "Original fast summary" }).count(), 1);

    await page.getByLabel("Search").fill("");
    await navigation.getByRole("button", { name: /Slow record/ }).click();
    await page.getByRole("button", { name: "Edit record" }).click();
    assert.equal(await page.getByLabel("Summary").inputValue(), "Original slow summary");
  } finally {
    await page.close();
    await instance.close();
  }
});

test("only the latest list and detail requests may update the interface", async () => {
  const instance = await browser();
  const page = await instance.newPage({ viewport: { width: 1280, height: 900 } });
  let listStartedResolve;
  let detailStartedResolve;
  const listStarted = new Promise(resolve => { listStartedResolve = resolve; });
  const detailStarted = new Promise(resolve => { detailStartedResolve = resolve; });
  try {
    await mockApi(page, { delayDetail: true, started: { list: () => listStartedResolve(), detail: () => detailStartedResolve() } });
    await page.goto(base, { waitUntil: "networkidle" });
    const search = page.getByLabel("Search");
    await search.fill("slow");
    await listStarted;
    await search.fill("fast");
    await page.getByRole("navigation", { name: "Records" }).getByRole("button", { name: /Fast record/ }).waitFor();
    await page.waitForTimeout(300);
    assert.equal(await page.getByRole("navigation", { name: "Records" }).getByRole("button", { name: /Slow record/ }).count(), 0);

    await search.fill("");
    const navigation = page.getByRole("navigation", { name: "Records" });
    await navigation.getByRole("button", { name: /Slow record/ }).click();
    await detailStarted;
    await navigation.getByRole("button", { name: /Fast record/ }).click();
    await page.getByRole("heading", { name: "Fast record" }).waitFor();
    await page.waitForTimeout(300);
    assert.equal(await page.getByRole("heading", { name: "Fast record" }).count(), 1);
    assert.equal(await page.getByText("Original slow summary").count(), 0);
  } finally {
    await page.close();
    await instance.close();
  }
});
