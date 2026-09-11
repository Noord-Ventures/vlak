// Refresh both social-card assets from the real, unmodified live Home interface.
// PLAYWRIGHT_EXECUTABLE_PATH=/path/to/chromium node scripts/capture-ios-og.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const directory = new URL("../public/images/social/", import.meta.url);
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
  ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
  : undefined);
try {
  const page = await browser.newPage({
    viewport: { width: 1680, height: 1200 }, deviceScaleFactor: 2,
    colorScheme: "light", reducedMotion: "reduce", locale: "en-US",
  });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("https://vlak.dev/interfaces/ios/", { waitUntil: "networkidle" });
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
    const corners = await device.evaluate(device => [".mo-hardware", ".mo-phone"].map(selector => {
      const style = getComputedStyle(device.querySelector(selector));
      return { selector, left: [style.borderTopLeftRadius, style.borderBottomLeftRadius].map(Number.parseFloat), right: [style.borderTopRightRadius, style.borderBottomRightRadius].map(Number.parseFloat) };
    }));
    for (const corner of corners) {
      assert(corner.right.every(value => value > 0), `${posture} ${corner.selector}: outer right corners remain rounded`);
      assert(corner.left.every(value => posture === "compact" ? value === 0 : value > 0), `${posture} ${corner.selector}: closed left hinge is straight, opened exterior corners are rounded`);
    }
    await handset.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const bounds = await handset.boundingBox();
    assert(bounds && Math.abs(bounds.width - width - 24) < 0.5 && Math.abs(bounds.height - height - 24) < 0.5, "Capture the complete, unscaled Duo hardware");
    assert.deepEqual(errors, [], "The live interface must render without runtime errors");
    const destination = fileURLToPath(new URL(filename, directory));
    await page.screenshot({
      path: destination,
      clip: { x: bounds.x - 8, y: bounds.y - 8, width: bounds.width + 16, height: bounds.height + 16 },
      animations: "disabled",
    });
    console.log(JSON.stringify({ posture, width: Math.round((bounds.width + 16) * 2), height: Math.round((bounds.height + 16) * 2), corners, destination }));
  }
  await capture("compact", 466, 678, "ios-home-closed.png");
  await page.getByRole("button", { name: "Open display", exact: true }).click();
  await capture("expanded", 951, 669, "ios-home.png");
} finally {
  await browser.close();
}
