import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.SITE_URL || "http://localhost:3016";
const hydrated = (page, selector) => page.waitForFunction(selector => {
  const element = document.querySelector(selector);
  return element && Object.keys(element).some(key => key.startsWith("__reactProps"));
}, selector);
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : undefined);
try {
  for (const width of [320, 390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    for (const theme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(`${base}/interfaces/patient/`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await hydrated(page, ".toc-mobile-trigger");
      for (const selector of [".if-rail", ".toc-mobile-sheet"]) {
        const labels = await page.locator(`${selector} a`).allTextContents();
        assert.equal(labels[0]?.trim(), "Index");
        const names = labels.slice(1).map(label => label.trim());
        assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" })), "Interface index is alphabetical by visible label");
        assert(names.includes("Website") && !names.includes("Frontier Model Company"));
      }
      const geometry = await page.locator(".pt-overview-grid").evaluate(element => {
        const box = element.getBoundingClientRect();
        const panel = element.closest(".pt-content").getBoundingClientRect();
        return { left: box.left - panel.left, right: panel.right - box.right };
      });
      assert(Math.abs(geometry.left) <= 1 && Math.abs(geometry.right) <= 1, "Patient overview dividers reach the panel edges");
      const arrow = await page.locator(".if-next-arrow").evaluate(element => {
        const icon = element.getBoundingClientRect();
        const title = element.parentElement.getBoundingClientRect();
        const pane = element.closest(".if-detail-content").getBoundingClientRect();
        return { start: icon.left - title.right, titleEnd: pane.right - title.right, gutter: icon.width, overflow: document.documentElement.scrollWidth - innerWidth };
      });
      assert(Math.abs(arrow.start) <= 1 && Math.abs(arrow.titleEnd) <= 1 && arrow.gutter === 20, `Next-study arrow hangs in the gutter: ${JSON.stringify(arrow)}`);
      assert(arrow.overflow <= 1);
      if (width < 900) {
        const toc = page.locator(".toc-mobile");
        await page.waitForFunction(() => document.querySelector(".toc-mobile")?.dataset.scrolled === "false");
        assert.equal(await toc.evaluate(el => getComputedStyle(el).backgroundColor), "rgba(0, 0, 0, 0)");
        assert.equal(await toc.locator(".toc-mobile-mark svg").count(), 1, "Section picker has a chevron");
        await toc.locator(".toc-mobile-trigger").click();
        await toc.locator(".toc-mobile-sheet").waitFor({ state: "visible" });
        assert(await toc.getByRole("link", { name: "Patient Dashboard", exact: true }).isVisible(), "Sidebar labels use title case");
        await page.keyboard.press("Escape");
        await toc.locator(".toc-mobile-sheet").waitFor({ state: "hidden" });
        assert(await toc.locator(".toc-mobile-trigger").evaluate(el => el === document.activeElement));
        await page.evaluate(() => window.scrollTo(0, 260));
        await page.waitForFunction(() => document.querySelector(".toc-mobile")?.dataset.scrolled === "true");
        assert.notEqual(await toc.evaluate(el => getComputedStyle(el).backgroundColor), "rgba(0, 0, 0, 0)");
        const bars = await page.locator(".nav-toggle-icon path").evaluateAll(paths => paths.map(path => { const box = path.getBBox(); return { width: box.width, height: box.height, stroke: getComputedStyle(path).strokeWidth }; }));
        assert.deepEqual(bars, [{ width: 16, height: 0, stroke: "1.5px" }, { width: 16, height: 0, stroke: "1.5px" }]);
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
        await page.locator("#navPanel").waitFor({ state: "visible" });
        await page.keyboard.press("Escape");
        assert.equal(await page.getByRole("button", { name: "Open menu", exact: true }).getAttribute("aria-expanded"), "false");
      }
    }
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(`${base}/interfaces/music/`, { waitUntil: "networkidle" });
    await hydrated(page, '.mu-controls button[aria-label="Play session"]');
    const nav = page.getByRole("navigation", { name: "Music workspace", exact: true });
    if (await nav.isVisible()) await nav.getByRole("button", { name: "Mixer", exact: true }).click();
    const baseline = await page.locator(".mu-mixer .rs-audio-meter-channel").evaluateAll(elements => elements.map(el => el.getBoundingClientRect().height));
    await page.getByRole("button", { name: "Play session", exact: true }).click();
    await page.waitForFunction(() => [...document.querySelectorAll(".mu-mixer meter")].some(meter => meter.value > -55), null, { timeout: 15000 });
    const samples = await page.locator(".mu-mixer .rs-audio-meter").evaluate(async meter => {
      const result = [];
      for (let i = 0; i < 24; i++) {
        result.push([...meter.querySelectorAll(".rs-audio-meter-channel")].map(el => ({ height: el.getBoundingClientRect().height, text: el.querySelector(".rs-audio-meter-text > span:last-child").textContent })));
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      return result;
    });
    for (const sample of samples) sample.forEach((row, index) => {
      assert(Math.abs(row.height - baseline[index]) < 1, `Channel ${index} height changed during playback`);
      assert(/^(−∞|-?\d+(\.\d)?) dB$/.test(row.text), `Reading has at most one decimal: ${row.text}`);
    });
    assert(new Set(samples.map(sample => sample.map(row => row.text).join())).size > 2, "Measured actual changing audio levels");
    await page.getByRole("button", { name: "Stop playback", exact: true }).click();
    await page.close();
    console.log(`${width}px: flush patient dividers, gutter arrow, mobile chrome and stable live music readouts passed`);
  }
} finally { await browser.close(); }
