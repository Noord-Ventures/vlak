import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const base = process.env.SITE_URL || "http://localhost:3016";
const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
});
const near = (actual, expected, message) => assert(Math.abs(actual - expected) < 1, `${message}: ${actual} ≠ ${expected}`);
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
try {
  for (const width of [320, 390, 640, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto(`${base}/interfaces/`, { waitUntil: "networkidle" });
    const marks = await page.evaluate(() => {
      const ink = selector => {
        const svg = document.querySelector(selector);
        const box = svg.getBBox(), transform = svg.getScreenCTM();
        const left = new DOMPoint(box.x, box.y).matrixTransform(transform);
        const right = new DOMPoint(box.x + box.width, box.y + box.height).matrixTransform(transform);
        return { left: left.x, right: right.x };
      };
      const logo = document.querySelector(".site-logo").getBoundingClientRect();
      const appearance = document.querySelector(".theme-toggle").getBoundingClientRect();
      return {
        pad: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pad")),
        logoInk: ink(".site-logo-mark"), logoWidth: logo.width, logoHeight: logo.height,
        appearanceInk: appearance.width ? ink(".theme-toggle svg") : null,
        appearanceWidth: appearance.width, appearanceHeight: appearance.height,
      };
    });
    near(marks.logoInk.left, marks.pad, "Logo ink meets page grid");
    assert(marks.logoWidth >= 44 && marks.logoHeight >= 44, "Logo retains a full touch target");
    if (marks.appearanceInk) {
      near(marks.appearanceInk.right, width - marks.pad, "Appearance ink meets right gutter");
      assert(marks.appearanceWidth >= 44 && marks.appearanceHeight >= 44, "Appearance retains a full touch target");
      const toggle = page.locator(".theme-toggle");
      await toggle.click({ position: { x: 2, y: 2 } });
      await page.locator("#appearanceMenu").waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
      assert(await toggle.evaluate(element => document.activeElement === element), "Appearance restores keyboard focus");
    }
    await page.close();
  }
  console.log("320–1440px: logo and appearance glyphs align to the grid inside 44px targets");
  for (const width of [320, 390, 640, 899]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const panel = page.locator("body > .toc-mobile-open");
    const trigger = page.locator(".toc-mobile:not(.toc-mobile-open) > .toc-mobile-trigger");
    const open = async () => {
      const box = await trigger.boundingBox();
      assert(box && box.y >= 0 && box.y + box.height <= 844, "Section trigger is visible without scrolling");
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await panel.waitFor({ state: "visible" });
      await settle(page);
    };
    const closed = async () => {
      await panel.waitFor({ state: "detached" });
      assert.equal(await page.locator("main").evaluate(element => element.closest("[inert]")), null);
    };
    for (const theme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(`${base}/interfaces/`, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo({ top: 200, behavior: "instant" }));
      await settle(page);
      const scroll = await page.evaluate(() => window.scrollY);
      await open();
      const geometry = await panel.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const sheet = element.querySelector(".toc-mobile-sheet");
        const header = document.querySelector(".site-crumb-bar");
        const headerRect = header.getBoundingClientRect();
        const row = element.querySelector(".toc-mobile-trigger").getBoundingClientRect();
        const listRect = sheet.getBoundingClientRect();
        return {
          left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
          chromeBottom: headerRect.bottom, listTop: listRect.top, rowBottom: row.bottom,
          background: getComputedStyle(element).backgroundColor, chromeBackground: getComputedStyle(header).backgroundColor,
          overflow: document.documentElement.scrollWidth - innerWidth,
          rows: [...sheet.querySelectorAll("a")].map(link => {
            const box = link.getBoundingClientRect();
            return { left: box.left, right: box.right, height: box.height, border: getComputedStyle(link).borderBottomWidth };
          }),
        };
      });
      near(geometry.left, 0, "Menu left edge");
      near(geometry.right, width, "Menu right edge");
      near(geometry.bottom, 844, "Menu reaches viewport bottom");
      near(geometry.top, geometry.chromeBottom, "Menu meets global header");
      near(geometry.listTop, geometry.rowBottom, "List meets section header");
      assert.equal(geometry.background, geometry.chromeBackground, "Both bars use the same opaque paper");
      assert.notEqual(geometry.background, "rgba(0, 0, 0, 0)");
      assert(geometry.overflow <= 1, "Full-width menu does not create horizontal overflow");
      for (const row of geometry.rows) {
        near(row.left, 0, "Divider starts at screen edge");
        near(row.right, width, "Divider ends at screen edge");
        assert(row.height >= 44 && row.border === "1px", "Every route has a 44px target and flush divider");
      }
      if (theme === "light") {
        await page.addScriptTag({ content: axe });
        const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })).violations.map(item => `${item.id}: ${item.nodes.map(node => node.target).join(", ")}`));
        assert.deepEqual(violations, [], "Open menu is accessible");
      }
      await panel.locator(".toc-mobile-sheet").hover();
      await page.mouse.wheel(0, 2400);
      await page.waitForFunction(() => document.querySelector("body > .toc-mobile-open .toc-mobile-sheet").scrollTop > 100);
      near(await page.evaluate(() => window.scrollY), scroll, "Scrolling the menu preserves page position");
      const last = panel.getByRole("link").last();
      await last.focus();
      await page.keyboard.press("Tab");
      assert(await page.evaluate(() => !!document.activeElement.closest(".toc-mobile-open, .logo-wrap, .corner-nav, .settings, .nav-toggle, .site-crumb-bar")), "Keyboard focus stays in the menu and visible chrome");
      await page.keyboard.press("Escape");
      await closed();
      await settle(page);
      assert(await trigger.evaluate(element => element === document.activeElement), "Escape restores the section trigger");
      near(await page.evaluate(() => window.scrollY), scroll, "Closing preserves page position");
      await open();
      const destination = panel.getByRole("link", { name: "Video Player", exact: true });
      await destination.tap();
      await page.waitForURL(/\/interfaces\/video-player\/?$/);
      await closed();
      console.log(`${theme} ${width}px: full-screen navigation, scroll, keyboard, and route dismissal passed`);
    }
    await page.goto(`${base}/components/`, { waitUntil: "networkidle" });
    await open();
    const categoryToggle = panel.locator(".toc-mobile-more").first();
    if (await categoryToggle.getAttribute("aria-expanded") === "true") await categoryToggle.tap();
    await panel.getByRole("button", { name: "Show Actions", exact: true }).tap();
    const group = panel.locator(".toc-mobile-group").first();
    const box = await group.boundingBox();
    near(box.x, 0, "Expanded category divider left edge");
    near(box.x + box.width, width, "Expanded category divider right edge");
    assert(await group.locator(".toc-mobile-sub").count() > 0, "Category expands into component links");
    await page.keyboard.press("Escape");
    await closed();
    await open();
    if (width <= 640) {
      await page.getByRole("button", { name: "Open menu", exact: true }).tap();
      await closed();
      assert.equal(await page.locator("#navPanel").getAttribute("data-open"), "true");
      await page.getByRole("button", { name: "Close menu", exact: true }).tap();
    } else {
      await page.locator(".theme-toggle").tap();
      await closed();
      await page.locator("#appearanceMenu").waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
    }
    if (width === 390) {
      await open();
      await page.evaluate(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        document.querySelector(".nav-toggle").click();
      });
      await closed();
      await settle(page);
      assert.equal(await page.locator("#navPanel").getAttribute("data-open"), "true");
      assert(await page.locator("#navPanel").evaluate(element => element.contains(document.activeElement)), "Opening the site menu cancels queued section focus restoration");
      await page.getByRole("button", { name: "Close menu", exact: true }).tap();
    }
    await open();
    await page.setViewportSize({ width: 1024, height: 844 });
    await closed();
    const overflow = await page.evaluate(() => ({
      html: getComputedStyle(document.documentElement).overflowY,
      body: getComputedStyle(document.body).overflowY,
    }));
    for (const [element, value] of Object.entries(overflow)) {
      assert(!["hidden", "clip"].includes(value), `Desktop resize releases ${element} vertical scroll lock`);
    }
    // Programmatic scrolling can bypass overflow:hidden, and auto inherits the
    // site's smooth scrolling. Verify native wheel input produces actual movement.
    assert(await page.evaluate(() => !!document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest("main")), "Wheel targets the page content");
    await page.mouse.move(512, 422);
    const beforeScroll = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 100);
    await page.waitForFunction(previous => window.scrollY > previous, beforeScroll, { timeout: 5000 });
    assert(await page.evaluate(() => window.scrollY) > beforeScroll, "Desktop resize releases scroll lock");
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await trigger.getAttribute("aria-expanded"), "false");
    await page.goto(`${base}/docs/`, { waitUntil: "networkidle" });
    await open();
    await panel.getByRole("link", { name: "Tokens", exact: true }).tap();
    await page.waitForURL(/\/docs\/tokens\/?$/);
    await closed();
    assert.deepEqual(errors, [], "No page errors");
    console.log(`${width}px: component expansion, chrome coordination, resize and Docs navigation passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
