// Real WebGL geometry and controls. No provider or renderer stubs.
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

export const webglArgs = ["--enable-webgl", "--ignore-gpu-blocklist", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
export const distance = (a, b) => Math.hypot(...a.map((value, index) => value - b[index]));
export const inspectModel = async page => page.locator(".rw-object-canvas").evaluate(canvas => ({
  ...canvas.dataset,
  position: canvas.dataset.camera.split(",").map(Number),
  target: canvas.dataset.target.split(",").map(Number),
}));
export async function openModel(page, base) {
  await page.goto(`${base.replace(/\/$/, "")}/interfaces/render/`, { waitUntil: "domcontentloaded" });
  await page.locator(".rw").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector(".rw-object-canvas")?.dataset.camera && document.querySelector(".rw")?.dataset.viewerStatus === "ready", undefined, { timeout: 45000 });
}
export async function checkModelControls({ page, base, artifacts, contextLoss = false }) {
  await openModel(page, base);
  const root = page.locator(".rw");
  const canvas = root.locator(".rw-object-canvas");
  const initial = await inspectModel(page);
  assert.equal(initial.renderer, "three");
  assert.equal(initial.modelUrl, "/interfaces/concepts/braun-t3-monochrome.glb");
  assert.equal(Number(initial.triangles), 32027, "The full licensed geometry must be loaded");
  assert.equal(Number(initial.vertices), 28180);
  assert.equal(Number(initial.meshes), 3);
  assert.equal(Number(initial.materials), 1);
  assert.equal(initial.surfaceColor, initial.paper, "Line surfaces must match the composited viewport paper");
  assert(Number(initial.renderedTriangles) >= 32027, "The renderer must actually draw the radio geometry");
  const pause = root.getByRole("button", { name: "Pause turntable", exact: true });
  if (await pause.isVisible()) await pause.click();
  await root.getByRole("button", { name: "Reset camera", exact: true }).click();
  await page.waitForFunction(() => { const canvas = document.querySelector(".rw-object-canvas"); return canvas?.dataset.camera === canvas?.dataset.home; });
  const home = await inspectModel(page);
  assert(home.homeFit.split(",").map(Number).every(value => Math.abs(value) <= .96), "All actual radio vertices must fit the home camera with a visible margin");
  const clay = await canvas.screenshot();
  const nav = root.getByRole("navigation", { name: "Model workspace", exact: true });
  const mobile = await nav.isVisible();
  if (mobile) {
    await nav.getByRole("button", { name: "Inspector", exact: true }).press("Enter");
    await page.waitForFunction(() => document.activeElement === document.querySelector(".rw-inspector-head h2"));
  }
  await root.getByRole("combobox", { name: "Line treatment", exact: true }).selectOption("graphite");
  if (mobile) {
    await root.getByRole("button", { name: "Back to viewport", exact: true }).press("Enter");
    await page.waitForFunction(() => document.activeElement === document.querySelector('.rw-mobile-nav button[aria-pressed="true"]'));
  }
  await page.waitForFunction(() => document.querySelector(".rw-object-canvas")?.dataset.lineInk === (document.documentElement.dataset.theme === "dark" ? "e0e0e0" : "252525"));
  const graphite = await canvas.screenshot();
  assert(!clay.equals(graphite), "The line treatment must alter rendered pixels");
  await root.getByRole("button", { name: "Show mesh", exact: true }).press("Enter");
  await page.waitForFunction(() => Number(document.querySelector(".rw-object-canvas")?.dataset.renderedLines) >= 32027 * 3);
  assert(Number((await inspectModel(page)).wireframeMaterials) >= 1);
  const mesh = await canvas.screenshot();
  assert(!mesh.equals(graphite), "Wireframe must alter rendered pixels");
  if (artifacts) await root.screenshot({ path: `${artifacts}/mesh-${page.viewportSize().width}.png` });
  await root.getByRole("button", { name: "Show mesh", exact: true }).press("Enter");
  await page.waitForFunction(() => document.querySelector(".rw-object-canvas")?.dataset.wireframeMaterials === "0");
  await root.locator(".rw-live-model").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(position => {
    const next = document.querySelector(".rw-object-canvas")?.dataset.camera.split(",").map(Number);
    return next && Math.hypot(...next.map((value, index) => value - position[index])) > .1;
  }, home.position);
  const orbit = await inspectModel(page);
  await page.keyboard.press("+");
  await page.waitForFunction(before => {
    const element = document.querySelector(".rw-object-canvas");
    const next = element?.dataset.camera.split(",").map(Number), target = element?.dataset.target.split(",").map(Number);
    return next && target && Math.hypot(...next.map((value, index) => value - target[index])) < before * .95;
  }, distance(orbit.position, orbit.target));
  await page.keyboard.press("Home");
  await page.waitForFunction(() => { const canvas = document.querySelector(".rw-object-canvas"); return canvas?.dataset.camera === canvas?.dataset.home; });
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5);
  await page.mouse.down(); await page.mouse.move(box.x + box.width * .65, box.y + box.height * .5, { steps: 8 }); await page.mouse.up();
  await page.waitForTimeout(100);
  assert(distance(home.position, (await inspectModel(page)).position) > .1, "Pointer drag must orbit the actual camera");
  await root.getByRole("button", { name: "Reset camera", exact: true }).click();
  await page.waitForFunction(() => { const canvas = document.querySelector(".rw-object-canvas"); return canvas?.dataset.camera === canvas?.dataset.home; });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => document.querySelector('.rw-tools [aria-label="Auto-rotate model"]')?.disabled);
  assert(await root.getByRole("button", { name: "Play turntable", exact: true }).isDisabled());
  const still = await inspectModel(page);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(250);
  assert(distance(still.position, (await inspectModel(page)).position) < .00001, "Reduced motion must keep the camera still");
  if (mobile) {
    await nav.getByRole("button", { name: "Inspector", exact: true }).press("Enter");
    await page.waitForFunction(() => document.activeElement === document.querySelector(".rw-inspector-head h2"));
  }
  await root.getByRole("treeitem", { name: "Viewport", exact: true }).press("Enter");
  const rotation = root.getByRole("switch", { name: "Auto-rotate", exact: true });
  assert(await rotation.isDisabled()); assert.equal(await rotation.isChecked(), false);
  if (mobile) await root.getByRole("button", { name: "Back to viewport", exact: true }).press("Enter");
  assert.equal(await canvas.count(), 1, "Inspector changes must preserve one live renderer");
  const small = await root.evaluate(element => [...element.querySelectorAll("button, select, [role=treeitem], [role=switch]")]
    .filter(control => control.getClientRects().length && !control.closest('[aria-hidden="true"]'))
    .filter(control => { const box = control.getBoundingClientRect(); return box.width < 43.9 || box.height < 43.9; })
    .map(control => control.getAttribute("aria-label") ?? control.textContent));
  assert.deepEqual(small, [], "Visible controls must be at least44px");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
  for (const theme of ["light", "dark"]) {
    await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
    await page.waitForFunction(value => document.querySelector(".rw-object-canvas")?.dataset.theme === value, theme);
    const themed = await inspectModel(page);
    assert.equal(themed.surfaceColor, themed.paper, "Theme changes must preserve paper-colored line surfaces");
    if (artifacts) await root.screenshot({ path: `${artifacts}/${theme}-${page.viewportSize().width}.png` });
  }
  if (contextLoss) {
    const oldCanvas = await canvas.elementHandle();
    await canvas.evaluate(element => element.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext());
    await root.locator('[data-viewer-status="error"]').waitFor();
    assert(await root.getByRole("button", { name: "Show mesh", exact: true }).isDisabled());
    await root.getByRole("button", { name: "Retry viewer", exact: true }).click();
    await page.waitForFunction(() => document.querySelector(".rw-object-canvas")?.dataset.lineInk === (document.documentElement.dataset.theme === "dark" ? "e0e0e0" : "252525") && document.querySelector(".rw")?.dataset.viewerStatus === "ready");
    assert.equal(await oldCanvas.evaluate(element => element.isConnected), false);
    assert.equal(await canvas.count(), 1, "Retry must dispose the old canvas");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const base = process.env.SITE_URL || "http://localhost:3016";
  const artifacts = process.env.VEHICLE_ARTIFACTS || "/tmp/vlak-render-controls";
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: webglArgs });
  try {
    for (const width of [320, 390, 1024, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const errors = []; page.on("pageerror", error => errors.push(error.message));
      await checkModelControls({ page, base, artifacts, contextLoss: width === 1440 });
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`${width}px: real radio geometry, paint, mesh, camera, touch, reduced motion and theme controls passed`);
    }
  } finally { await browser.close(); }
  console.log(`Screenshots: ${artifacts}`);
}

// Keep existing local automation imports working while the model becomes generic.
export { inspectModel as inspectVehicle, openModel as openVehicle, checkModelControls as checkVehicleControls };
