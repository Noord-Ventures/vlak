// BASE_URL=http://127.0.0.1:3016 node apps/www/scripts/docs-examples-e2e.mjs
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { domainCollections } from "@noorddev/vlak";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const docsRoot = fileURLToPath(new URL("../app/docs", import.meta.url));
const staticGuides = readdirSync(docsRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && entry.name !== "ai" && !entry.name.includes("[") && existsSync(`${docsRoot}/${entry.name}/page.tsx`))
  .map(entry => entry.name);
const docsRoutes = [
  "/docs/",
  ...staticGuides.map(name => `/docs/${name}/`),
  ...domainCollections.map(collection => `/docs/${collection.name}/`),
].sort();
const darkRoutes = [
  "/docs/",
  "/docs/accessibility/",
  "/docs/agents/",
  "/docs/choosing-vlak/",
  "/docs/frameworks/",
  "/docs/layers/",
  "/docs/projects/",
  "/docs/stylex/",
  "/docs/theming/",
  "/docs/tokens/",
  "/docs/updates/",
];

assert.equal(new Set(docsRoutes).size, docsRoutes.length, "Canonical documentation routes must be unique");
assert(!docsRoutes.includes("/docs/ai/"), "The compatibility redirect is not a canonical documentation page");

async function chooseOption(page, combobox, label) {
  await combobox.click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

async function exerciseExample(page, path) {
  const example = page.locator("[data-docs-example]").first();
  if (path === "/docs/agents/") {
    await chooseOption(page, example.getByRole("combobox", { name: "Documentation surface", exact: true }), "CLI command");
    assert.match(await example.locator("[data-docs-request]").innerText(), /^npx /, `${path}: documentation surface must update its request`);
    await chooseOption(page, example.getByRole("combobox", { name: "Example city", exact: true }), "Amsterdam");
    await example.getByText("value: amsterdam", { exact: true }).waitFor();
  } else if (path === "/docs/projects/") {
    const note = example.getByRole("textbox", { name: "Working note", exact: true });
    const original = await note.inputValue();
    await example.getByRole("button", { name: "Save a copy", exact: true }).click();
    const savedNote = example.locator("[data-docs-saved-note]");
    await savedNote.filter({ hasText: original }).waitFor();
    assert.equal(await savedNote.innerText(), original, `${path}: saved project must retain the current note`);
    await note.fill("A later unsaved edit");
    await example.getByRole("button", { name: "Reopen copy", exact: true }).click();
    assert.equal(await note.inputValue(), original, `${path}: reopening must restore the saved note`);
  } else if (path === "/docs/updates/") {
    await chooseOption(page, example.getByRole("combobox", { name: "Source changes", exact: true }), "Both changed");
    await example.getByRole("status").getByText("Review required", { exact: true }).waitFor();
  } else if (path === "/docs/choosing-vlak/") {
    await chooseOption(page, example.getByRole("combobox", { name: "Product layout", exact: true }), "Review a queue");
    await example.getByText("Warehouse door", { exact: true }).waitFor();
  } else if (path === "/docs/accessibility/") {
    const input = example.getByRole("textbox", { name: "Reviewer name", exact: true });
    await example.getByRole("button", { name: "Save", exact: true }).click();
    await example.getByRole("alert").getByText("Enter a name before saving.", { exact: true }).waitFor();
    assert.equal(await input.getAttribute("aria-invalid"), "true", `${path}: invalid submission must mark the field`);
    await page.waitForFunction(element => element === document.activeElement, await input.elementHandle());
    await input.fill("Ada");
    await example.getByRole("button", { name: "Save", exact: true }).click();
    await example.getByRole("status").getByText("Saved for Ada.", { exact: true }).waitFor();
  } else if (path === "/docs/frameworks/") {
    await example.getByRole("button", { name: "Save with Button", exact: true }).click();
    await example.getByRole("button", { name: "Save with a class", exact: true }).click();
    await example.getByRole("status").getByText("HTML class activated. Total activations: 2.", { exact: true }).waitFor();
  } else if (path === "/docs/layers/") {
    const target = example.getByText("The later active layer wins", { exact: true });
    const before = await target.evaluate(element => ({ background: getComputedStyle(element).backgroundColor, radius: getComputedStyle(element).borderRadius }));
    const toggle = example.getByRole("button", { name: "Remove app layer", exact: true });
    await toggle.click();
    await example.getByRole("button", { name: "Add app layer", exact: true }).waitFor();
    await example.getByRole("status").getByText(/Component layer active\./).waitFor();
    const after = await target.evaluate(element => ({ background: getComputedStyle(element).backgroundColor, radius: getComputedStyle(element).borderRadius }));
    assert.notDeepEqual(after, before, `${path}: toggling the later layer must change computed paint`);
  } else if (path === "/docs/stylex/") {
    const output = example.getByRole("button", { name: "Simplified output", exact: true });
    await output.click();
    assert.equal(await output.getAttribute("aria-pressed"), "true", `${path}: output view must expose its selected state`);
    assert.match(await example.locator("pre").innerText(), /Simplified output: one representative rule per value/, `${path}: view switch must expose simplified output`);
    await example.getByRole("button", { name: "Source leaf", exact: true }).click();
    assert.match(await example.locator("pre").innerText(), /stylex\.create/, `${path}: source view must be restorable`);
  } else if (path === "/docs/theming/") {
    const rootTheme = await page.locator("html").getAttribute("data-theme");
    await example.getByRole("button", { name: "Dark", exact: true }).click();
    await example.locator('[data-local-theme="dark"]').waitFor();
    await example.getByText("Scoped preview · dark · 14px control type", { exact: true }).waitFor();
    assert.equal(await page.locator("html").getAttribute("data-theme"), rootTheme, `${path}: scoped example must not change the page theme`);
    await example.getByRole("button", { name: "16px controls", exact: true }).click();
    await example.getByText("Scoped preview · dark · 16px control type", { exact: true }).waitFor();
    assert.equal(await example.getByRole("textbox", { name: "Project name", exact: true }).evaluate(element => getComputedStyle(element).fontSize), "16px", `${path}: local control scale must update computed type`);
  } else if (path === "/docs/tokens/") {
    const diagram = example.getByRole("img", { name: "Two Vlak columns separated by a gutter", exact: true });
    assert.equal(await diagram.getByText("184px column", { exact: true }).count(), 2, `${path}: initial diagram must show both column dimensions`);
    await example.getByRole("button", { name: "Hide dimensions", exact: true }).click();
    await example.getByRole("button", { name: "Show dimensions", exact: true }).waitFor();
    assert.equal(await diagram.getAttribute("data-dimensions"), null, `${path}: dimension toggle must update the diagram`);
    assert.equal(await diagram.getByText("184px column", { exact: true }).count(), 0, `${path}: hidden dimensions must leave the diagram content-only`);
    await example.getByRole("button", { name: "Show dimensions", exact: true }).click();
    assert.equal(await diagram.getByText("184px column", { exact: true }).count(), 2, `${path}: dimensions must be restorable`);
  } else if (path === "/docs/health/") {
    const choice = example.getByRole("radio", { name: "Steady", exact: true });
    await choice.check();
    assert(await choice.isChecked(), `${path}: check-in choice must be operable`);
  } else if (path === "/docs/science/") {
    await example.getByRole("button", { name: /Record review/ }).click();
    await example.getByText("Review recorded", { exact: true }).waitFor();
  } else if (path === "/docs/engineering/") {
    await example.getByRole("button", { name: "Acknowledge: Cooling flow", exact: true }).click();
    assert.equal(await example.getByRole("button", { name: "Acknowledge: Cooling flow", exact: true }).count(), 0, `${path}: acknowledged alarm action must clear`);
  } else if (path === "/docs/geospatial/") {
    const east = example.getByRole("spinbutton", { name: /Easting/ });
    await east.fill("121.5");
    assert.equal(await east.inputValue(), "121.5", `${path}: coordinate draft must update`);
  } else if (path === "/docs/robotics/") {
    await example.getByRole("button", { name: "Request targets", exact: true }).click();
    await example.getByText("Host confirmation: Draft received locally; no motion executed", { exact: true }).waitFor();
  } else if (path === "/docs/electronics/") {
    await chooseOption(page, example.getByRole("combobox"), "J1 / Pad 2 · pad-b");
    await example.getByText("Selected pad: pad-b", { exact: true }).waitFor();
  } else if (path === "/docs/microbiology/") {
    await example.getByRole("button", { name: "Record review: C-042", exact: true }).click();
    await example.getByText("Record review noted", { exact: true }).waitFor();
  }
}

async function loadMarkedMedia(page, path) {
  const videos = page.locator("[data-docs-example] video, video[data-docs-example]");
  for (let index = 0; index < await videos.count(); index++) {
    const video = videos.nth(index);
    await video.evaluate(element => { if (element.readyState < 1) element.load(); });
    await page.waitForFunction(element => element.readyState >= 1 || Boolean(element.error), await video.elementHandle());
  }
  const media = await page.locator("[data-docs-example]").evaluateAll(examples => examples.map((example, index) => {
    const style = getComputedStyle(example);
    const rect = example.getBoundingClientRect();
    const images = example.matches("img") ? [example] : [...example.querySelectorAll("img")];
    const videos = example.matches("video") ? [example] : [...example.querySelectorAll("video")];
    const canvases = example.matches("canvas") ? [example] : [...example.querySelectorAll("canvas")];
    return {
      index,
      visible: example.getClientRects().length > 0 && style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0,
      images: images.map(image => ({ complete: image.complete, width: image.naturalWidth, height: image.naturalHeight })),
      videos: videos.map(video => ({ ready: video.readyState, width: video.videoWidth, height: video.videoHeight, duration: video.duration, error: video.error?.message ?? null })),
      canvases: canvases.map(canvas => ({ width: canvas.width, height: canvas.height })),
      buttons: [...example.querySelectorAll("button")].filter(button => button.getClientRects().length > 0).map(button => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height, name: button.getAttribute("aria-label") || button.textContent?.trim() })),
    };
  }));
  assert(media.length > 0, `${path}: expected a marked documentation example or video`);
  assert(media.every(item => item.visible), `${path}: every marked documentation example must render visibly`);
  for (const item of media) {
    assert(item.images.every(image => image.complete && image.width > 0 && image.height > 0), `${path}: example ${item.index + 1} has an image that did not load`);
    assert(item.videos.every(video => !video.error && video.ready >= 1 && video.width > 0 && video.height > 0 && Number.isFinite(video.duration) && video.duration > 0), `${path}: example ${item.index + 1} has a video without loaded metadata`);
    assert(item.canvases.every(canvas => canvas.width > 0 && canvas.height > 0), `${path}: example ${item.index + 1} has an empty canvas`);
    assert(item.buttons.every(button => button.width >= 43.5 && button.height >= 43.5), `${path}: example ${item.index + 1} has a button smaller than 44px: ${JSON.stringify(item.buttons)}`);
  }
  return media.length;
}

async function auditRoute(context, base, path, viewportLabel) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  try {
    const response = await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    assert(response?.ok(), `${path}: expected a successful HTML response, received ${response?.status()}`);
    assert.equal(await page.locator("main").count(), 1, `${path}: expected exactly one main landmark`);
    const canonical = page.locator('link[rel="canonical"]');
    assert.equal(await canonical.count(), 1, `${path}: expected one canonical link`);
    assert.equal(new URL(await canonical.getAttribute("href"), base).pathname, path, `${path}: canonical link must name the current documentation route`);
    const examples = await loadMarkedMedia(page, path);
    await exerciseExample(page, path);
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
    })).violations.map(item => `${item.id}: ${item.nodes.slice(0, 4).map(node => node.target.join(" ")).join(", ")}`));
    assert.deepEqual(violations, [], `${path}: full-page axe violations`);
    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    assert(overflow.document <= 1 && overflow.body <= 1, `${path}: ${viewportLabel} horizontal overflow ${JSON.stringify(overflow)}`);
    assert.deepEqual(errors, [], `${path}: JavaScript runtime errors`);
    return examples;
  } finally {
    await page.close();
  }
}

export async function checkDocsExamples({ browser, base, widths = [390, 1280] }) {
  const failures = [];
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, reducedMotion: "reduce", colorScheme: "light" });
    let next = 0;
    let passed = 0;
    try {
      await Promise.all(Array.from({ length: 3 }, async () => {
        while (next < docsRoutes.length) {
          const path = docsRoutes[next++];
          try {
            const examples = await auditRoute(context, base, path, `${width}px light`);
            passed++;
            console.log(`${width}px ${path}: ${examples} marked example${examples === 1 ? "" : "s"}, media, axe, runtime, and overflow passed`);
          } catch (error) {
            failures.push(`${width}px ${path}: ${error instanceof Error ? error.stack : String(error)}`);
            console.error(failures.at(-1));
          }
        }
      }));
    } finally {
      await context.close();
    }
    console.log(`${width}px documentation: ${passed}/${docsRoutes.length} canonical routes passed`);
  }
  const darkContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce", colorScheme: "dark" });
  let nextDark = 0;
  let passedDark = 0;
  try {
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (nextDark < darkRoutes.length) {
        const path = darkRoutes[nextDark++];
        try {
          const examples = await auditRoute(darkContext, base, path, "1280px dark");
          passedDark++;
          console.log(`1280px dark ${path}: ${examples} marked example${examples === 1 ? "" : "s"}, media, axe, runtime, and overflow passed`);
        } catch (error) {
          failures.push(`1280px dark ${path}: ${error instanceof Error ? error.stack : String(error)}`);
          console.error(failures.at(-1));
        }
      }
    }));
  } finally {
    await darkContext.close();
  }
  console.log(`1280px dark documentation: ${passedDark}/${darkRoutes.length} root and foundation routes passed`);
  assert.deepEqual(failures, [], "Documentation example audit failures");
  console.log(`Documentation examples: ${docsRoutes.length} canonical routes passed at ${widths.join(" and ")}px light; ${darkRoutes.length} root and foundation routes passed at 1280px dark`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const base = (process.env.BASE_URL || process.env.SITE_URL || "http://127.0.0.1:3016").replace(/\/$/, "");
  const browser = await chromium.launch({
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
    args: ["--enable-unsafe-swiftshader"],
  });
  try {
    await checkDocsExamples({ browser, base });
  } finally {
    await browser.close();
  }
}
