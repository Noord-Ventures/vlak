import assert from "node:assert/strict";
import { once } from "node:events";
import { chromium } from "playwright";
import { createExportServer } from "./serve-export.mjs";

const server = createExportServer();
server.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
  ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : undefined);
const ready = (page, name) => page.waitForFunction(name => document.querySelector(`[data-preview="${name}"]`)?.dataset.previewReady === "true", name);

try {
  const plain = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const nojs = await plain.newPage();
  await nojs.goto(`${base}/`);
  assert.equal(await nojs.locator(".specimen-kit-live [data-preview]").count(), 12);
  assert(await nojs.locator(".specimen-kit-live").first().innerText(), "The kit has server-rendered preview content");
  await nojs.goto(`${base}/components/`);
  assert(await nojs.locator('a[href^="/components/ios-switch"]').count(), "Catalogue links are available without JavaScript");
  for (const selector of [".rs-sheet", ".rs-drawer", ".rs-crumb-bar"]) {
    const top = await nojs.locator(`.gallery-demo ${selector}`).first().evaluate(element => element.getBoundingClientRect().top);
    assert(top > 900, `${selector}: a distant fixed-position specimen must not overlay the viewport`);
  }
  await plain.close();

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${base}/`);
  await page.locator(".specimen-cell-kit-switch").scrollIntoViewIfNeeded();
  await ready(page, "switch");
  const toggle = page.locator(".specimen-cell-kit-switch").getByRole("switch");
  const checked = await toggle.getAttribute("aria-checked");
  await toggle.click();
  assert.notEqual(await toggle.getAttribute("aria-checked"), checked, "A loaded homepage specimen keeps its interactive behavior");

  await page.goto(`${base}/components/`);
  await page.waitForFunction(() => document.querySelectorAll('[data-preview-ready="true"]').length > 0);
  assert.equal(await page.locator('[data-preview="ios-switch"]').getAttribute("data-preview-ready"), "false", "A distant category has not hydrated all its examples");
  await page.locator("#ios").scrollIntoViewIfNeeded();
  await ready(page, "ios-switch");
  assert(await page.locator("#ios .rs-ios-switch").count(), "Scrolling loads the correct preview group");

  await page.goto(`${base}/components/dialog/`);
  await ready(page, "dialog");
  await page.locator(".preview-box").getByRole("button", { name: "Remove item…", exact: true }).click();
  assert(await page.getByRole("dialog", { name: "Remove this item?" }).isVisible());
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog", { name: "Remove this item?" }).isVisible(), false);
  assert.deepEqual(errors, [], "Preview loading must not introduce runtime errors");
  await context.close();
  console.log("Preview loading passed: server HTML, deferred catalogue groups, homepage controls, and detail dialog keyboard behavior.");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
