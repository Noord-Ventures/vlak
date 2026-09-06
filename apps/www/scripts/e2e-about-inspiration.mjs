import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { studies } from "../app/inspiration/collection.ts";

const require = createRequire(import.meta.url);
const url = process.env.ABOUT_URL ?? "http://localhost:3101/about/";
const output = process.env.ABOUT_SCREENSHOTS ?? "/tmp/vlak-about-inspiration-qa";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "chrome", args: ["--enable-unsafe-swiftshader"] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.setDefaultTimeout(30000);
  page.on("pageerror", (error) => errors.push(error.message));
  const loadedModels = new Set();
  page.on("response", (response) => { if (response.url().endsWith(".glb")) loadedModels.add(response.url()); });
  await page.goto(url, { waitUntil: "networkidle" });
  assert.equal(await page.locator("main").count(), 1);
  assert.equal(await page.locator("h1").innerText(), "Vlak");
  assert.equal(await page.locator(".inspiration-header, .inspiration-intro").count(), 0);
  assert.equal(loadedModels.size, 0, "3D assets must wait until the field approaches the viewport");
  assert.equal(await page.locator(".logo-wrap").evaluate((el) => getComputedStyle(el).visibility), "visible");
  assert.equal(await page.locator(".corner-nav").isVisible(), true);
  assert.equal(await page.locator(".site-footer").isVisible(), true);
  const facts = readFileSync(new URL("../app/about/facts.ts", import.meta.url), "utf8");
  const referenceImages = Array.from(facts.matchAll(/src: "([^"]+)"/g), (match) => match[1]).sort();
  assert.deepEqual(referenceImages, studies.map((study) => study.image).sort(), "every About reference must have a 3D entry");
  assert.equal(await page.locator(".field-work img").count(), 0, "static reference gallery has been replaced");
  assert.equal(await page.locator(".inspiration-thumbnail").count(), studies.length);
  assert.equal(await page.getByRole("button", { name: /^(Daylight|Gallery)$/ }).count(), 0);
  const customControls = await page.locator(".inspiration-embed button, .inspiration-embed input, .inspiration-embed a").evaluateAll((elements) => elements.filter((el) => !Array.from(el.classList).some((name) => name.startsWith("rs-"))).map((el) => el.outerHTML));
  assert.deepEqual(customControls, [], "gallery controls must use Vlak components");
  assert.equal(await page.locator(".inspiration-caption h3").innerText(), "Paul Schuitema");
  assert.equal(await page.locator(".inspiration-caption .field-kicker").innerText(), "1897–1973 · Rotterdam");
  console.log("PASS existing About shell and lazy scene loading");

  const cell = page.locator("#reference-collection");
  await cell.scrollIntoViewIfNeeded();
  await page.locator(".inspiration-stage[data-ready='true']").waitFor();
  await page.waitForTimeout(900);
  assert.ok(loadedModels.size >= 1);
  const bounds = await cell.boundingBox();
  assert.ok(bounds.width >= 1435, "carousel field must span the About grid");
  const strip = await page.locator(".inspiration-filmstrip").boundingBox();
  assert.ok(Math.abs(strip.x - bounds.x) < 1 && Math.abs(strip.width - bounds.width) < 1, "thumbnail strip must meet the About field edges");
  assert.equal(await page.locator(".inspiration-filmstrip").evaluate((el) => getComputedStyle(el).columnGap), "1px");
  assert.equal(await page.locator("#study-select-0").evaluate((el) => getComputedStyle(el).borderRadius), "0px");
  assert.equal(await page.locator(".inspiration-caption h3").evaluate((el) => getComputedStyle(el).fontSize), "40px");
  await page.getByRole("button", { name: "Next work", exact: true }).click();
  await page.waitForTimeout(900);
  assert.equal(await page.locator(".inspiration-thumbnail[aria-pressed='true']").getAttribute("id"), "study-select-1");
  await page.locator("#study-select-0").focus();
  await page.keyboard.press("End");
  assert.equal(await page.locator(".inspiration-thumbnail[aria-pressed='true']").getAttribute("id"), `study-select-${studies.length - 1}`);
  await page.keyboard.press("Home");
  await page.waitForTimeout(900);
  const isSelectedVisible = () => page.locator(".inspiration-thumbnail[aria-pressed='true']").evaluate((el) => { const item = el.getBoundingClientRect(); const rail = el.closest(".inspiration-filmstrip").getBoundingClientRect(); return item.left >= rail.left - 1 && item.right <= rail.right + 1; });
  assert.equal(await isSelectedVisible(), true, "rapid End/Home must reveal the current work");
  await cell.screenshot({ path: `${output}/about-gallery-daylight.png` });
  console.log("PASS full-width field, carousel navigation and keyboard focus");

  const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  await page.addScriptTag({ content: axeSource });
  const scan = () => page.evaluate(async () => (await window.axe.run(document.querySelector("#reference-collection"), {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  })).violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })));
  assert.deepEqual(await scan(), []);
  await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
  await page.waitForTimeout(1000);
  assert.equal(await page.locator(".inspiration-embed").getAttribute("data-lighting"), "gallery");
  const colors = await page.locator(".inspiration-embed").evaluate((el) => ({ gallery: getComputedStyle(el).backgroundColor, field: getComputedStyle(el.closest(".field-cell")).backgroundColor }));
  assert.equal(colors.gallery, colors.field);
  assert.deepEqual(await scan(), []);
  await cell.screenshot({ path: `${output}/about-gallery-dark.png` });
  console.log("PASS inherited About appearance and accessibility in both themes");

  for (const width of [390, 640, 900, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await cell.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.waitForFunction(() => { const item = document.querySelector(".inspiration-thumbnail[aria-pressed='true']").getBoundingClientRect(); const rail = document.querySelector(".inspiration-filmstrip").getBoundingClientRect(); return item.left >= rail.left - 1 && item.right <= rail.right + 1; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `overflow at ${width}px`);
    const small = await page.locator(".inspiration-embed button, .inspiration-embed input").evaluateAll((elements) => elements.filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 43.9 || r.height < 43.9); }).map((el) => ({ label: el.getAttribute("aria-label") ?? el.textContent, rect: el.getBoundingClientRect().toJSON() })));
    assert.deepEqual(small, [], `targets at ${width}px`);
    if (width === 390) {
      await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
      await page.waitForTimeout(700);
      assert.deepEqual(await scan(), []);
      await cell.screenshot({ path: `${output}/about-gallery-phone.png` });
    }
  }
  console.log("PASS responsive grid and 44px controls across four widths");
  assert.deepEqual(errors, []);
  console.log("PASS no browser errors");
} finally {
  await browser.close();
}
