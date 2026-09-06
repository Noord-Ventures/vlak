// Independent browser checks for the interactive inspiration prototype.
// INSPIRATION_URL=http://localhost:3100/inspiration/ node scripts/e2e-inspiration.mjs
import assert from "node:assert/strict";
import { readFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { studies } from "../app/inspiration/collection.ts";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const url = process.env.INSPIRATION_URL ?? "http://localhost:3100/inspiration/";
const screenshots = process.env.INSPIRATION_SCREENSHOTS ?? "/tmp/vlak-inspiration-qa";
const last = studies.length - 1;
mkdirSync(screenshots, { recursive: true });
const failures = [];
const passed = [];
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : { channel: "chrome" }),
  args: ["--enable-unsafe-swiftshader"],
});
async function check(name, fn) {
  if (process.env.INSPIRATION_CHECK && !name.includes(process.env.INSPIRATION_CHECK)) return;
  try { await fn(); passed.push(name); console.log(`PASS ${name}`); }
  catch (error) { failures.push(`${name}: ${error.message}`); console.error(`FAIL ${name}: ${error.message}`); }
}
const pause = (page, ms = 1100) => page.waitForTimeout(ms);
const selected = (page) => page.locator(".inspiration-thumbnail[aria-pressed='true']");
async function stageControls(page) {
  const stage = page.locator(".inspiration-stage");
  const controls = stage.getByRole("group", { name: "Object controls", exact: true });
  assert.equal(await controls.count(), 1, "the entire object controls group belongs inside the scene");
  assert.equal(await page.getByRole("group", { name: "Object controls", exact: true }).count(), 1);
  for (const name of ["Rotate object left", "Rotate object right", "Reset"]) {
    assert.equal(await controls.getByRole("button", { name, exact: true }).isVisible(), true);
  }
  assert.equal(await controls.getByRole("slider", { name: "Object scale", exact: true }).isVisible(), true);
  assert.equal(await controls.locator("label[for='inspiration-scale']").innerText(), "Scale");
  assert.equal(await controls.locator("output[for='inspiration-scale']").isVisible(), true);
  const outside = await stage.locator(".inspiration-controls, .inspiration-controls button, .inspiration-controls input, .inspiration-controls label, .inspiration-controls output").evaluateAll((elements) => elements.filter((element) => {
    const box = element.getBoundingClientRect();
    const scene = element.closest(".inspiration-stage").getBoundingClientRect();
    return !box.width || !box.height || box.left < scene.left - 1 || box.top < scene.top - 1 || box.right > scene.right + 1 || box.bottom > scene.bottom + 1;
  }).map((element) => element.getAttribute("aria-label") ?? element.textContent));
  assert.deepEqual(outside, [], "rotation, reset, scale and its value stay within the scene bounds");
  return controls;
}
async function ready(page) {
  await page.locator(".inspiration-stage[data-ready='true']").waitFor({ timeout: 30000 });
  await pause(page);
}
async function open(page) {
  await page.goto(url, { waitUntil: "networkidle" });
  await ready(page);
}
async function axe(page) {
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  })).violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })) })));
  assert.deepEqual(violations, []);
}
const desktop = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
const modelLoads = new Set();
desktop.on("pageerror", (error) => errors.push(error.message));
desktop.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
desktop.on("response", (response) => {
  if (response.url().endsWith(".glb") && response.ok()) modelLoads.add(new URL(response.url()).pathname);
});
try {
  await check("desktop starts with all local assets ready", async () => {
    await open(desktop);
    assert.equal(await desktop.locator(".inspiration-thumbnail").count(), studies.length);
    assert.equal(await desktop.locator(".inspiration-caption").count(), 0, "work metadata belongs in the tiles, not a separate caption row");
    assert.equal(await desktop.locator(".inspiration-notes").count(), 0, "relations and sources belong in their own tiles");
    assert.equal(await desktop.locator(".inspiration-collection-nav").count(), 0, "the extra work-count and jump-selector row is redundant");
    assert.equal(await desktop.getByRole("combobox", { name: "Jump to a work", exact: true }).count(), 0);
    await stageControls(desktop);
    for (let i = 0; i < studies.length; i++) {
      await desktop.locator(`#study-select-${i}`).click();
      await ready(desktop);
      assert.equal(await selected(desktop).getAttribute("id"), `study-select-${i}`);
      assert.equal(await desktop.locator(".inspiration-fallback").count(), 0);
      assert.equal(await desktop.locator(".inspiration-stage").getAttribute("data-work-id"), studies[i].id);
      const tile = desktop.locator(`#study-select-${i}`);
      assert.equal(await tile.getAttribute("data-work-id"), studies[i].id);
      assert.equal(await tile.locator(".reference-tile-artist").innerText(), studies[i].artist);
      const work = await tile.locator(".reference-tile-work").innerText();
      assert.ok(work.includes(studies[i].title) && work.includes(studies[i].year));
      assert.equal(await tile.locator(".reference-tile-description").innerText(), studies[i].description);
      assert.equal(await tile.locator(".reference-tile-kind").innerText(), studies[i].model ? "Spatial study" : "From the archive");
      assert.equal(await tile.locator(".reference-tile-material").innerText(), studies[i].material);
      assert.ok((await tile.locator(".reference-tile-relation").innerText()).includes(studies[i].relation));
      const source = tile.locator("..").locator("a.reference-tile-source");
      assert.equal(await source.count(), 1);
      assert.equal(await source.innerText(), studies[i].sourceLabel);
      assert.equal(await source.getAttribute("href"), studies[i].source);
      assert.equal(await tile.locator("a").count(), 0, "a source link must not be inside a selection button");
      if (["bruynzeel-kitchen", "gertrud-kurz", "schiphol-signage", "vught-memorial", "sdap-nvv"].includes(studies[i].id)) {
        await desktop.locator(".inspiration-canvas canvas").screenshot({ path: `${screenshots}/${studies[i].id}.png` });
      }
    }
    assert.deepEqual([...modelLoads].sort(), studies.flatMap((study) => study.model ? [study.model] : []).sort());
    await desktop.locator("#study-select-0").click();
    await ready(desktop);
    await desktop.screenshot({ path: `${screenshots}/desktop-daylight.png`, fullPage: true });
  });
  await check("previous and next loop and retain keyboard focus", async () => {
    const previous = desktop.getByRole("button", { name: "Previous work", exact: true });
    const next = desktop.getByRole("button", { name: "Next work", exact: true });
    await previous.focus(); await desktop.keyboard.press("Enter");
    assert.equal(await selected(desktop).getAttribute("id"), `study-select-${last}`);
    assert.equal(await previous.evaluate((el) => document.activeElement === el), true);
    await next.focus(); await desktop.keyboard.press("Enter");
    assert.equal(await selected(desktop).getAttribute("id"), "study-select-0");
    assert.equal(await next.evaluate((el) => document.activeElement === el), true);
  });
  await check("filmstrip supports arrows, Home and End with visible focus", async () => {
    await desktop.locator("#study-select-0").focus();
    for (const [key, index] of [["ArrowRight", 1], ["ArrowLeft", 0], ["ArrowLeft", last], ["Home", 0], ["End", last], ["Home", 0]]) {
      await desktop.keyboard.press(key);
      assert.equal(await selected(desktop).getAttribute("id"), `study-select-${index}`);
      assert.equal(await desktop.locator(`#study-select-${index}`).evaluate((el) => document.activeElement === el), true);
    }
    assert.notEqual(await selected(desktop).evaluate((el) => getComputedStyle(el).outlineStyle), "none");
  });
  await check("tile keyboard activation reaches the full kitchen without a duplicate selector", async () => {
    const kitchen = studies.findIndex((study) => study.id === "bruynzeel-kitchen");
    await desktop.locator(`#study-select-${kitchen}`).focus();
    await desktop.keyboard.press("Enter");
    await ready(desktop);
    assert.equal(await selected(desktop).getAttribute("id"), `study-select-${kitchen}`);
    await desktop.locator("#study-select-0").click();
    await ready(desktop);
  });
  await check("source links activate independently and retain native keyboard behavior", async () => {
    const tile = desktop.locator("#study-select-1");
    const source = tile.locator("..").locator("a.reference-tile-source");
    await source.evaluate((element) => element.addEventListener("click", (event) => event.preventDefault()));
    await tile.focus();
    await desktop.keyboard.press("Tab");
    assert.equal(await source.evaluate((element) => document.activeElement === element), true);
    await desktop.keyboard.press("Enter");
    await source.click();
    for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) {
      await desktop.keyboard.press(key);
      assert.equal(await source.evaluate((element) => document.activeElement === element), true, `${key} must not be intercepted on a source link`);
      assert.equal(await selected(desktop).getAttribute("id"), "study-select-0", "activating a source never selects its work");
    }
    await desktop.keyboard.press("Tab");
    assert.equal(await desktop.locator("#study-select-2").evaluate((element) => document.activeElement === element), true);
    await desktop.locator("#study-select-0").focus();
    await desktop.keyboard.press("Home");
    await ready(desktop);
  });
  await check("drag browsing changes the selected work", async () => {
    const turn = desktop.getByRole("button", { name: "Turn object", exact: true });
    if (await turn.getAttribute("aria-pressed") === "true") await turn.click();
    assert.equal(await desktop.getByRole("button", { name: "Browse", exact: true }).count(), 0);
    assert.equal(await desktop.locator(".inspiration-stage").getAttribute("data-interaction"), "browse");
    await ready(desktop);
    await desktop.locator(".inspiration-stage").scrollIntoViewIfNeeded();
    const box = await desktop.locator(".inspiration-canvas").boundingBox();
    await desktop.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.55);
    await desktop.mouse.down();
    await desktop.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.55, { steps: 20 });
    await pause(desktop, 140);
    await desktop.mouse.up();
    await pause(desktop);
    assert.notEqual(await selected(desktop).getAttribute("id"), "study-select-0");
  });
  await check("turn, rotation buttons, scale and reset alter the render", async () => {
    await desktop.locator("#study-select-0").click(); await ready(desktop);
    const controls = await stageControls(desktop);
    await desktop.getByRole("button", { name: "Turn object", exact: true }).click();
    assert.equal(await desktop.locator(".inspiration-stage").getAttribute("data-interaction"), "turn");
    await desktop.locator(".inspiration-stage").scrollIntoViewIfNeeded();
    const canvas = desktop.locator(".inspiration-canvas canvas");
    const before = await canvas.screenshot();
    await controls.getByRole("button", { name: "Rotate object right", exact: true }).click();
    await pause(desktop, 1600);
    assert.equal((await canvas.screenshot()).equals(before), false);
    const box = await canvas.boundingBox();
    const afterButton = await canvas.screenshot();
    await desktop.mouse.move(box.x + box.width * 0.47, box.y + box.height * 0.5);
    await desktop.mouse.down();
    await desktop.mouse.move(box.x + box.width * 0.61, box.y + box.height * 0.53, { steps: 16 });
    await pause(desktop, 140); await desktop.mouse.up(); await pause(desktop, 1600);
    assert.equal((await canvas.screenshot()).equals(afterButton), false);
    assert.equal(await selected(desktop).getAttribute("id"), "study-select-0");
    const scale = controls.getByRole("slider", { name: "Object scale", exact: true });
    const scaleOutput = controls.locator("output[for='inspiration-scale']");
    await scale.focus(); await desktop.keyboard.press("ArrowRight");
    assert.equal(await scale.inputValue(), "1.01");
    assert.equal(await scaleOutput.innerText(), "101%");
    await controls.getByRole("button", { name: "Reset", exact: true }).click();
    assert.equal(await scale.inputValue(), "1");
    assert.equal(await scaleOutput.innerText(), "100%");
    await pause(desktop, 1600);
    await desktop.getByRole("button", { name: "Auto rotate", exact: true }).click();
    const rotating = await canvas.screenshot(); await pause(desktop, 600);
    assert.equal((await canvas.screenshot()).equals(rotating), false);
    await desktop.getByRole("button", { name: "Stop rotation", exact: true }).click();
    const stopped = await canvas.screenshot(); await pause(desktop, 400);
    assert.equal((await canvas.screenshot()).equals(stopped), true);
  });
  await check("gallery lighting updates controls and the rendered scene", async () => {
    const canvas = desktop.locator(".inspiration-canvas canvas");
    const before = await canvas.screenshot();
    assert.equal(await desktop.getByRole("button", { name: /^(Daylight|Gallery)$/ }).count(), 0);
    await desktop.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
    await pause(desktop, 1500);
    assert.equal(await desktop.locator(".inspiration-page").getAttribute("data-lighting"), "gallery");
    assert.equal((await canvas.screenshot()).equals(before), false);
    await desktop.screenshot({ path: `${screenshots}/desktop-gallery.png`, fullPage: true });
  });
  await check("desktop gallery lighting passes axe", () => axe(desktop));
  await check("desktop daylight passes axe", async () => {
    await desktop.evaluate(() => { document.documentElement.dataset.theme = "light"; });
    await pause(desktop); await axe(desktop);
  });
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await check("phone has no document overflow and 44px interaction targets", async () => {
    await open(phone);
    await stageControls(phone);
    assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const clippedMetadata = await phone.locator(".inspiration-thumbnail-cell [class*='reference-tile-']").evaluateAll((elements) => elements.filter((element) => {
      const style = getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden" || style.textOverflow === "ellipsis" || (element.clientHeight > 0 && element.scrollHeight > element.clientHeight + 1 && style.overflowY === "hidden");
    }).map((element) => element.textContent));
    assert.deepEqual(clippedMetadata, [], "phone tiles keep the work metadata visible without truncation");
    await phone.screenshot({ path: `${screenshots}/phone-daylight.png`, fullPage: true });
    const small = await phone.locator(".inspiration-page button, .inspiration-page a, .inspiration-page input").evaluateAll((elements) => elements
      .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden")
      .map((el) => ({ name: el.getAttribute("aria-label") || el.textContent.trim(), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }))
      .filter(({ width, height }) => width < 44 || height < 44));
    assert.deepEqual(small, []);
  });
  await check("phone passes axe", () => axe(phone));
  await phone.close();
  const reduced = await browser.newPage({ viewport: { width: 1200, height: 1000 }, reducedMotion: "reduce" });
  await check("reduced motion keeps the object still and disables automatic rotation", async () => {
    await open(reduced);
    const canvas = reduced.locator(".inspiration-canvas canvas");
    const still = await canvas.screenshot(); await pause(reduced, 450);
    assert.equal((await canvas.screenshot()).equals(still), true);
    assert.equal(await reduced.getByRole("button", { name: "Automatic rotation disabled by reduced motion preference", exact: true }).isDisabled(), true);
    await reduced.locator(".inspiration-stage .inspiration-controls").getByRole("button", { name: "Rotate object right", exact: true }).click();
    const requested = await canvas.screenshot(); await pause(reduced, 600);
    assert.equal((await canvas.screenshot()).equals(requested), true);
    await reduced.screenshot({ path: `${screenshots}/reduced-motion.png`, fullPage: true });
  });
  await reduced.close();
  const fallback = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    let blocked = true;
    window.enableWebGLForVerification = () => { blocked = false; };
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (blocked && /^(webgl|webgl2|experimental-webgl)$/.test(type)) return null;
      return original.call(this, type, ...args);
    };
  });
  await check("WebGL unavailable shows a useful still; retry restores the scene", async () => {
    await fallback.goto(url, { waitUntil: "networkidle" });
    await fallback.getByRole("button", { name: "Retry 3D", exact: true }).waitFor();
    assert.match(await fallback.locator(".inspiration-fallback").textContent(), /Still view/);
    assert.equal(await fallback.locator(".inspiration-fallback img").evaluate((el) => el.complete && el.naturalWidth > 0), true);
    await fallback.getByRole("button", { name: "Next work", exact: true }).click();
    assert.equal(await selected(fallback).getAttribute("id"), "study-select-1");
    await fallback.screenshot({ path: `${screenshots}/webgl-fallback.png`, fullPage: true });
    await fallback.evaluate(() => window.enableWebGLForVerification());
    await fallback.getByRole("button", { name: "Retry 3D", exact: true }).click();
    await ready(fallback);
    assert.equal(await fallback.locator(".inspiration-fallback").count(), 0);
    assert.equal(await selected(fallback).getAttribute("id"), "study-select-1");
  });
  await fallback.close();
  await check("normal interaction has no browser errors", async () => assert.deepEqual([...new Set(errors)], []));
} finally { await browser.close(); }
console.log(JSON.stringify({ passed: passed.length, failures, screenshots }, null, 2));
if (failures.length) process.exitCode = 1;
