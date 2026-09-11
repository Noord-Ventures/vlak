import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, isAbsolute, join, resolve } from "node:path";
import { chromium } from "../apps/www/node_modules/playwright/index.mjs";
import { interfaceStarters } from "../apps/www/app/starters/catalog.ts";

const output = process.argv[2];
if (!output || !isAbsolute(output)) throw new Error("Pass the absolute export directory printed by verify-interface-starters.mjs");
const prefix = process.argv[3] ?? "/";
if (!prefix.startsWith("/") || !prefix.endsWith("/") || prefix.includes("..")) throw new Error("The optional hosting prefix must begin and end with a slash");
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2" };
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {});
try {
  for (const { slug } of interfaceStarters) {
    const directory = join(output, `vlak-${slug}`, "dist");
    const server = createServer(async (request, response) => {
      try {
        const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
        if (!pathname.startsWith(prefix)) throw new Error("Outside hosting prefix");
        const subpath = pathname.slice(prefix.length);
        const path = resolve(directory, subpath || "index.html");
        if (!path.startsWith(`${directory}/`) || !(await stat(path)).isFile()) throw new Error("Not found");
        response.writeHead(200, { "content-type": mime[extname(path)] ?? "application/octet-stream" });
        response.end(await readFile(path));
      } catch { response.writeHead(404); response.end("Not found"); }
    });
    await new Promise(done => server.listen(0, "127.0.0.1", done));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    const errors = [], failed = [], external = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("response", response => { if (response.status() >= 400) failed.push(response.url()); });
    page.on("request", request => { if (!request.url().startsWith(origin) && !request.url().startsWith("blob:")) external.push(request.url()); });
    try {
      await page.goto(`${origin}${prefix}`, { waitUntil: "networkidle" });
      if (slug === "ios") {
        await page.getByLabel("Device", { exact: true }).selectOption("iphone-duo");
        await page.getByRole("button", { name: "Open display", exact: true }).click();
        await page.locator('.mo-device[data-posture="expanded"]').waitFor();
        await page.getByRole("button", { name: "Open Control Center", exact: true }).click();
        await page.locator('.mo-phone[data-overlay="quick"]').waitFor();
        await page.getByRole("button", { name: "Home", exact: true }).click();
        await page.getByRole("button", { name: "Open Photos", exact: true }).click();
        await page.waitForFunction(() => Array.from(document.querySelectorAll('.mo-phone img')).some(image => image.complete && image.naturalWidth > 0));
      } else if (slug === "android") {
        await page.getByRole("button", { name: "Open Quick Settings", exact: true }).click();
        await page.locator('.mo-phone[data-overlay="quick"]').waitFor();
      } else if (slug === "calendar") {
        await page.getByRole("button", { name: "New event", exact: true }).click();
        await page.getByRole("dialog").waitFor();
      } else if (slug === "reconciliation") {
        await page.locator('.rc-source input[type="file"]').nth(0).setInputFiles({ name: "left.csv", mimeType: "text/csv", buffer: Buffer.from("id,name\n1,Alpha\n2,Beta\n") });
        await page.getByRole("heading", { name: "left.csv", exact: true }).waitFor();
        await page.locator('.rc-source input[type="file"]').nth(1).setInputFiles({ name: "right.csv", mimeType: "text/csv", buffer: Buffer.from("id,name\n1,Alpha\n2,Gamma\n") });
        await page.getByRole("heading", { name: "right.csv", exact: true }).waitFor();
        await page.getByRole("button", { name: "Compare exact keys", exact: true }).click();
        await page.getByText("Exact comparison complete. Review exception groups, then export a fixed result revision.", { exact: true }).waitFor();
      } else {
        await page.getByRole("button", { name: "New conversation", exact: true }).click();
        await page.getByRole("textbox", { name: "Message", exact: true }).fill("Plan a starter smoke test");
        await page.getByRole("button", { name: "Send", exact: true }).click();
        await page.getByText("Message added. A local template response is ready.", { exact: true }).waitFor();
      }
      assert.deepEqual(errors, [], `${slug}: runtime errors`);
      assert.deepEqual(failed, [], `${slug}: failed asset requests`);
      assert.deepEqual(external, [], `${slug}: unexpected external requests`);
      await page.screenshot({ path: join(output, `${slug}-smoke.png`) });
      console.log(`${slug}: interaction passed, no runtime errors or network dependencies`);
    } finally {
      await page.close();
      await new Promise(done => server.close(done));
    }
  }
} finally { await browser.close(); }
