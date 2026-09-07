import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export async function checkWallpaper({ page, base, fail }) {
  try {
    await page.goto(`${base}/interfaces/graphics/`, { waitUntil: "networkidle" });
    const nav = page.getByRole("navigation", { name: "Wallpaper workspace" });
    const mobile = await nav.isVisible();
    const firstArt = await page.locator(".wg-stage svg").innerHTML();
    if (mobile) await nav.getByRole("button", { name: "Direction", exact: true }).click();
    await page.getByLabel("Variation seed", { exact: true }).fill("Architectural blocks and a quiet signal");
    await page.getByLabel("Variation", { exact: true }).fill("67");
    await page.getByLabel("Canvas format", { exact: true }).selectOption("desktop");
    await page.getByRole("button", { name: "Generate set", exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.wg-footer [role="status"]')?.textContent === "Three new wallpapers ready.");
    assert.notEqual(await page.locator(".wg-stage svg").innerHTML(), firstArt, "Generating changes the artwork");
    assert(await page.locator(".wg-stage").isVisible(), "Generating returns to the preview");
    const choices = page.getByRole("group", { name: "Choose composition" });
    await choices.getByRole("button", { name: "Open structure", exact: true }).focus();
    await page.keyboard.press("Space");
    assert.equal(await choices.getByRole("button", { name: "Open structure", exact: true }).getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator(".wg-stage svg").getAttribute("aria-label"), "Open structure");
    for (const [format, width, height] of [["desktop", 6144, 3840], ["phone", 3456, 6144], ["widescreen", 6144, 3456]]) {
      if (mobile) await nav.getByRole("button", { name: "Direction", exact: true }).click();
      await page.getByLabel("Canvas format", { exact: true }).selectOption(format);
      if (mobile) await nav.getByRole("button", { name: "Preview", exact: true }).click();
      const downloaded = page.waitForEvent("download");
      await page.getByRole("button", { name: "Export 6K", exact: true }).click();
      const download = await downloaded;
      const png = readFileSync(await download.path());
      assert.equal(png.subarray(1, 4).toString(), "PNG");
      assert.equal(png.readUInt32BE(16), width);
      assert.equal(png.readUInt32BE(20), height);
      assert(png.length > 100000, "Export contains raster artwork");
      assert.match(download.suggestedFilename(), new RegExp(`wallpaper-${format}-2-6k`));
    }
    console.log(`${page.viewportSize().width}px: wallpaper generation, selection and all three actual 6K PNG exports passed`);
  } catch (error) { fail(`Wallpaper: ${error.message}`); }
}
