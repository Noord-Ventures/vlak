// Refresh the social-card asset from the real, unmodified live Home interface.
// PLAYWRIGHT_EXECUTABLE_PATH=/path/to/chromium node scripts/capture-ios-og.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const destination = new URL("../public/images/social/ios-home.png", import.meta.url);
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
  await page.getByRole("button", { name: "Open display", exact: true }).click();
  const device = page.locator('section.mo-device[data-platform="ios"][data-posture="expanded"]');
  const handset = device.locator(".mo-handset");
  await handset.waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const phone = document.querySelector('section.mo-device[data-posture="expanded"] .mo-phone');
    return phone?.getAttribute("data-app") === "home" && Math.abs(phone.getBoundingClientRect().width - 951) < 0.5;
  });
  await page.evaluate(() => document.fonts.ready);
  await handset.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const bounds = await handset.boundingBox();
  assert(bounds && bounds.width > 970 && bounds.height > 690, "Capture the complete, unscaled unfolded Duo");
  assert.deepEqual(errors, [], "The live interface must render without runtime errors");
  await mkdir(new URL("../public/images/social/", import.meta.url), { recursive: true });
  await page.screenshot({
    path: fileURLToPath(destination),
    clip: { x: bounds.x - 8, y: bounds.y - 8, width: bounds.width + 16, height: bounds.height + 16 },
    animations: "disabled",
  });
  console.log(`Captured live iOS Home: ${Math.round((bounds.width + 16) * 2)} × ${Math.round((bounds.height + 16) * 2)} → ${fileURLToPath(destination)}`);
} finally {
  await browser.close();
}
