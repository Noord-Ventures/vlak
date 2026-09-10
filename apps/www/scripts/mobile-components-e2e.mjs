import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { catalogComponents } from "@noorddev/vlak";

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const base = process.env.SITE_URL || "http://localhost:3016";
const components = catalogComponents.filter(component => ["ios", "android"].includes(component.category));
assert(components.some(component => component.category === "ios") && components.some(component => component.category === "android"), "Both native component families are published");
const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
const failures = [];
try {
  for (const [width, colorScheme] of [[320, "light"], [1440, "dark"]]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme, reducedMotion: "reduce" });
    const page = await context.newPage();
    page.on("pageerror", error => failures.push(error.message));
    for (const { name, title } of components) {
      try {
      await page.goto(`${base}/components/${name}/`, { waitUntil: "networkidle" });
      await page.getByRole("heading", { name: title, level: 1, exact: true }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      const preview = page.locator(".preview-box");
      const layout = await preview.evaluate(box => ({
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        overflow: box.scrollWidth - box.clientWidth,
        small: [...box.querySelectorAll("button,input:not([type=hidden]),a[href],select,textarea")].filter(element => element.getClientRects().length).filter(element => { const rect = element.getBoundingClientRect(); return rect.width < 43.5 || rect.height < 43.5; }).map(element => element.getAttribute("aria-label") || element.textContent),
      }));
      assert(layout.pageOverflow <= 1 && layout.overflow <= 1, `${width}px ${name}: overflow ${JSON.stringify(layout)}`);
      assert.deepEqual(layout.small, [], `${width}px ${name}:44px hit areas`);
      await page.addScriptTag({ content: axe });
      const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] }, rules: { region: { enabled: false } } })).violations.map(row => ({ id: row.id, nodes: row.nodes.map(node => node.target) })));
      assert.deepEqual(violations, [], `${width}px ${name}: accessibility`);
      if (name.endsWith("search-field") || name.endsWith("search-bar")) {
        const input = preview.getByRole("searchbox");
        await input.fill("Avery");
        await preview.getByRole("button", { name: /clear/i }).press("Enter");
        assert.equal(await input.inputValue(), "");
        assert(await input.evaluate(element => element === document.activeElement), "Clear restores native input focus");
      } else if (name.endsWith("switch") || name.endsWith("list")) {
        const control = preview.getByRole("switch");
        const before = await control.isChecked();
        await control.press("Space");
        assert.equal(await control.isChecked(), !before);
        if (name.endsWith("list")) assert.match(await preview.textContent(), /Not connected/);
      } else if (name === "ios-tab-bar") {
        await preview.getByRole("tab", { name: "Library", exact: true }).press("ArrowRight");
        assert.equal(await preview.getByRole("tab", { name: "Search", exact: true }).getAttribute("aria-selected"), "true");
      } else if (name === "ios-segmented-control") {
        await preview.getByRole("radio", { name: "Week", exact: true }).press("ArrowRight");
        assert.equal(await preview.getByRole("radio", { name: "Month", exact: true }).getAttribute("aria-checked"), "true");
      } else if (name === "ios-slider") {
        const slider = preview.getByRole("slider");
        const before = Number(await slider.inputValue());
        await slider.press("ArrowRight");
        assert(Number(await slider.inputValue()) > before);
      } else if (name === "android-navigation") {
        await preview.getByRole("button", { name: "Library", exact: true }).press("ArrowRight");
        await page.keyboard.press("Enter");
        assert.equal(await preview.getByRole("button", { name: "Search", exact: true }).getAttribute("aria-current"), "page");
      } else if (name === "android-chip") {
        const chip = preview.getByRole("button", { name: "Downloaded", exact: true });
        await chip.press("Space");
        assert.equal(await chip.getAttribute("aria-pressed"), "false");
      } else if (name === "android-fab") {
        await preview.getByRole("button", { name: "New note", exact: true }).press("Enter");
        await preview.getByRole("button", { name: "Note added", exact: true }).waitFor();
      } else if (name === "ios-navigation-bar") {
        await preview.getByRole("button", { name: "New message", exact: true }).press("Enter");
        assert.match(await preview.textContent(), /New message/);
      } else if (name === "android-app-bar") {
        await preview.getByRole("button", { name: "Back to inbox", exact: true }).press("Enter");
        assert.match(await preview.textContent(), /Inbox/);
      } else if (name.endsWith("sheet")) {
        const trigger = preview.getByRole("button", { name: "Open preferences", exact: true });
        await trigger.press("Enter");
        const dialog = preview.getByRole("dialog", { name: "Preferences", exact: true });
        await dialog.waitFor();
        const modalViolations = await dialog.evaluate(async element => (await window.axe.run(element, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] }, rules: { region: { enabled: false } } })).violations.map(row => ({ id: row.id, nodes: row.nodes.map(node => node.target) })));
        assert.deepEqual(modalViolations, [], `${width}px ${name}: open sheet accessibility`);
        await dialog.screenshot({ path: `/tmp/vlak-${name}-open-${width}.png` });
        assert(await dialog.evaluate(element => element.matches(":modal")), "Sheet uses the browser modal layer");
        const bounds = await dialog.boundingBox();
        assert(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width + 1, "Sheet fits the viewport");
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        assert(await trigger.evaluate(element => element === document.activeElement), "Sheet restores its opening control");
      }
      await preview.screenshot({ path: `/tmp/vlak-${name}-${width}.png` });
      console.log(`${width}px ${colorScheme}: ${name} layout, axe and keyboard passed`);
      } catch (error) { failures.push(`${width}px ${colorScheme} ${name}: ${error.stack}`); console.error(`${width}px ${colorScheme} ${name}: ${error.message}`); }
    }
    await context.close();
  }
  assert.deepEqual(failures, [], "Native catalog layout, accessibility, keyboard and runtime checks");
  console.log(`Native component catalog: ${components.length} controls verified on phone and desktop.`);
} finally { await browser.close(); }
