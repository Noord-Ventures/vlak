// Integration checks for the actual local licensed model and WebGL renderer.
// Build and serve the site first, then set SITE_URL and PLAYWRIGHT_EXECUTABLE_PATH.
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import { webglArgs, distance, inspectVehicle, checkVehicleControls } from "./e2e-render-controls.mjs";

const base = (process.env.SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");
const artifacts = await mkdtemp(join(tmpdir(), "vlak-vehicle-"));
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: webglArgs });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await checkVehicleControls({ page, base, artifacts });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(() => !document.querySelector('.rw-tools button[aria-label="Auto-rotate model"]')?.disabled);
  const before = await inspectVehicle(page);
  await page.getByRole("button", { name: "Play turntable", exact: true }).click();
  await page.mouse.move(0, 0);
  await page.waitForFunction(position => {
    const next = document.querySelector(".rw-vehicle-canvas")?.dataset.camera.split(",").map(Number);
    return next && Math.hypot(...next.map((value, index) => value - position[index])) > .05;
  }, before.position);
  await page.locator(".rw-live-model").focus();
  const focused = await inspectVehicle(page);
  await page.waitForTimeout(250);
  assert(distance(focused.position, (await inspectVehicle(page)).position) < .00001, "Focus must pause the turntable");
  await page.getByRole("button", { name: "Pause turntable", exact: true }).click();
  await page.getByRole("button", { name: "Reset camera", exact: true }).click();
  await page.waitForFunction(() => { const canvas = document.querySelector(".rw-vehicle-canvas"); return canvas?.dataset.camera === canvas?.dataset.home; });
  const home = await inspectVehicle(page);
  await page.waitForTimeout(200);
  assert(distance(home.position, (await inspectVehicle(page)).position) < .00001, "Paused camera must stay still");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".rw").scrollIntoViewIfNeeded();
  await page.waitForFunction(before => { const canvas = document.querySelector(".rw-vehicle-canvas"); return canvas?.dataset.camera === canvas?.dataset.home && canvas?.dataset.camera !== before; }, home.camera);
  const phone = await inspectVehicle(page);
  assert(distance(phone.position, phone.target) > distance(home.position, home.target), "Portrait camera must refit the whole asset");
  await page.locator(".rw").screenshot({ path: join(artifacts, "phone-dark.png") });
  assert.deepEqual(errors, []);
  await page.close();

  const unavailable = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  await unavailable.route("**/evoque-monochrome.glb", route => route.abort("internetdisconnected"));
  await unavailable.goto(`${base}/interfaces/render/`, { waitUntil: "domcontentloaded" });
  await unavailable.locator('.rw-vehicle-viewport[data-viewer-status="error"]').waitFor({ timeout: 15000 });
  assert.match(await unavailable.locator(".rw-vehicle-status").innerText(), /connection and WebGL/);
  assert(await unavailable.getByRole("button", { name: "Show mesh", exact: true }).isDisabled());
  await unavailable.locator(".rw").screenshot({ path: join(artifacts, "unavailable-phone.png") });
  await unavailable.unroute("**/evoque-monochrome.glb");
  await unavailable.getByRole("button", { name: "Retry viewer", exact: true }).click();
  await unavailable.waitForFunction(() => document.querySelector(".rw")?.dataset.viewerStatus === "ready" && Number(document.querySelector(".rw-vehicle-canvas")?.dataset.renderedTriangles) >= 204453);
  assert(await unavailable.getByRole("button", { name: "Show mesh", exact: true }).isEnabled());
  assert.equal(await unavailable.locator(".rw-vehicle-canvas").count(), 1);
  // A source harness may expose its React root to verify unmount disposal directly.
  if (await unavailable.evaluate(() => !!window.renderRoot)) {
    const canvas = await unavailable.locator(".rw-vehicle-canvas").elementHandle();
    await unavailable.evaluate(() => window.renderRoot.unmount());
    assert.equal(await canvas.evaluate(element => element.isConnected), false);
    assert.equal(await canvas.evaluate(element => element.getContext("webgl2").isContextLost()), true, "Unmount must release the graphics context");
  }
  await unavailable.close();
  console.log("Vehicle integration passed: real mesh, paint and camera; turntable, focus pause, responsive fit, reduced motion, asset failure, retry and renderer cleanup");
  console.log(`Screenshots: ${artifacts}`);
} finally { await browser.close(); }
