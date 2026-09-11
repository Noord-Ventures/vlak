// Real dark-mode counterparts of capture-ios-og.mjs, with identical framing.
// Run against a built local export; no source styling or image filters are applied.
// node scripts/capture-starter-duo-dark.mjs [http://127.0.0.1:4186]
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const base = new URL(process.argv[2] ?? "http://127.0.0.1:4186");
assert(["127.0.0.1", "localhost"].includes(base.hostname), "Capture a local export, not the live production site");
const directory = new URL("../public/images/starters/", import.meta.url);
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
  ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : undefined);
try {
  const page = await browser.newPage({
    viewport: { width: 1680, height: 1200 }, deviceScaleFactor: 2,
    colorScheme: "dark", reducedMotion: "reduce", locale: "en-US",
  });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(new URL("/interfaces/ios/", base).href, { waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark", "Capture the real system dark theme");
  await page.getByRole("button", { name: "Preview fullscreen", exact: true }).click();
  await page.getByRole("combobox", { name: "Device", exact: true }).selectOption("iphone-duo");
  await page.evaluate(() => document.fonts.ready);
  await mkdir(directory, { recursive: true });
  async function capture(posture, width, height, filename) {
    const device = page.locator(`section.mo-device[data-platform="ios"][data-device="iphone-duo"][data-posture="${posture}"][data-orientation="portrait"]`);
    const handset = device.locator(".mo-handset");
    await handset.waitFor({ state: "visible" });
    await page.waitForFunction(({ posture, width, height }) => {
      const device = document.querySelector(`section.mo-device[data-posture="${posture}"]`);
      const phone = device?.querySelector(".mo-phone");
      const bounds = phone?.getBoundingClientRect();
      return device?.querySelector('.mo-device-fit[data-live="false"]') && phone?.getAttribute("data-app") === "home" && bounds && Math.abs(bounds.width - width) < 0.5 && Math.abs(bounds.height - height) < 0.5;
    }, { posture, width, height });
    const paint = await device.locator(".mo-phone").evaluate(phone => {
      const style = getComputedStyle(phone);
      return { paper: style.getPropertyValue("--bg").trim(), ink: style.getPropertyValue("--text").trim() };
    });
    assert.equal(paint.paper.toLowerCase(), "#0e0c0a", "The device inherits the dark paper token");
    assert.equal(paint.ink.toLowerCase(), "#e8e8e8", "The device inherits the light ink token");
    const corners = await device.evaluate(device => [".mo-hardware", ".mo-phone"].map(selector => {
      const style = getComputedStyle(device.querySelector(selector));
      return { selector, left: [style.borderTopLeftRadius, style.borderBottomLeftRadius].map(Number.parseFloat), right: [style.borderTopRightRadius, style.borderBottomRightRadius].map(Number.parseFloat) };
    }));
    for (const corner of corners) {
      assert(corner.right.every(value => value > 0), `${posture}: outer right corners remain rounded`);
      assert(corner.left.every(value => posture === "compact" ? value === 0 : value > 0), `${posture}: hinge and exterior corners match the light captures`);
    }
    await handset.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const bounds = await handset.boundingBox();
    assert(bounds && Math.abs(bounds.width - width - 24) < 0.5 && Math.abs(bounds.height - height - 24) < 0.5, "Capture the complete, unscaled Duo hardware");
    assert.deepEqual(errors, [], "The interface must render without runtime errors");
    const destination = fileURLToPath(new URL(filename, directory));
    await page.screenshot({ path: destination, clip: { x: bounds.x - 8, y: bounds.y - 8, width: bounds.width + 16, height: bounds.height + 16 }, animations: "disabled" });
    console.log(JSON.stringify({ posture, width: Math.round((bounds.width + 16) * 2), height: Math.round((bounds.height + 16) * 2), paint, destination }));
  }
  await capture("compact", 466, 678, "ios-home-closed-dark.png");
  await page.getByRole("button", { name: "Open display", exact: true }).click();
  await capture("expanded", 951, 669, "ios-home-dark.png");
} finally {
  await browser.close();
}
