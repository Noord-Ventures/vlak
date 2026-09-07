import assert from "node:assert/strict";

/** The decorative portrait turns slowly, remains still for reduced motion, and falls back to the same model. */
export async function checkAthena({ page, base, fail }) {
  try {
    await page.goto(`${base.replace(/\/$/, "")}/interfaces/frontier/`, { waitUntil: "networkidle" });
    const board = page.locator(".cx-frontier"), portrait = board.locator(".athena-portrait"), canvas = portrait.locator("canvas");
    await page.waitForFunction(() => document.querySelector(".athena-portrait")?.getAttribute("data-ready") === "true");
    await portrait.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !!document.querySelector(".athena-canvas canvas")?.getAttribute("data-angle"));
    const reduced = await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (reduced) {
      const angle = await canvas.getAttribute("data-angle"); await page.waitForTimeout(220);
      assert.equal(await canvas.getAttribute("data-angle"), angle, "Athena turns under reduced motion");
      assert.equal(await canvas.getAttribute("data-playing"), "false");
    } else {
      const before = await canvas.getAttribute("data-angle"); await page.waitForTimeout(220);
      assert.notEqual(await canvas.getAttribute("data-angle"), before, "Athena does not turn");
      const angle = Number(await canvas.getAttribute("data-angle"));
      assert.ok(angle >= -.401 && angle <= -.059, "portrait rotation is outside its restrained range");
    }
    assert.equal(await portrait.locator("button").count(), 0, "The removed portrait pause button returned");
    assert.equal(Number(await canvas.getAttribute("data-view-height")), 2.28, "Portrait framing is no longer the close helmet-and-shoulders crop");
    const overlapping = await board.evaluate(element => {
      const graphic = element.querySelector(".cx-frontier-graphic").getBoundingClientRect();
      const heading = element.querySelector(".cx-workspace > h2").getBoundingClientRect();
      return graphic.left < heading.right - 1 && graphic.right > heading.left + 1 && graphic.top < heading.bottom - 1 && graphic.bottom > heading.top + 1;
    });
    assert.equal(overlapping, false, "portrait overlaps the headline field");
    const lost = await canvas.evaluate(element => { const extension = element.getContext("webgl2")?.getExtension("WEBGL_lose_context"); if (!extension) return false; extension.loseContext(); return true; });
    if (lost) {
      await page.waitForFunction(() => document.querySelector(".athena-portrait")?.getAttribute("data-failed") === "true");
      assert.equal(await portrait.locator(".athena-fallback").isVisible(), true, "context loss removed the portrait");
      assert.equal(await portrait.getByRole("button").count(), 0, "fallback retains a dead motion control");
    }
    assert.equal(await board.locator(".cx-frontier-ring,.cx-frontier-core").count(), 0, "old cube artwork remains");
  } catch (error) { fail(`Athena line portrait: ${error instanceof Error ? error.message : String(error)}`); }
}
