import assert from "node:assert/strict";

export async function checkOrbitStyle({ page, base, fail }) {
  try {
    await page.goto(`${base.replace(/\/$/, "")}/interfaces/orbit/`, { waitUntil: "networkidle" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width: 100%; }" });
    const board = page.locator(".so");
    await board.waitFor();
    const activate = async control => {
      await control.press("Enter");
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    };
    const nav = board.getByRole("navigation", { name: "Observation workspace", exact: true });
    const mobile = await nav.isVisible();
    const show = async name => { if (mobile) await activate(nav.getByRole("button", { name, exact: true })); };
    const reduced = await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (reduced) await board.getByRole("button", { name: "Pass animation disabled for reduced motion", exact: true }).waitFor();
    assert.equal(await board.locator(".so-visual img").count(), 0, "the map still contains photographic imagery");
    assert.equal(await board.locator(".so-map-art").getAttribute("role"), "img");
    await activate(board.getByRole("button", { name: "Moisture", exact: true }));
    assert.equal(await board.locator(".so-moisture-overlay").count(), 1, "the moisture layer has no distinct sample overlay");
    await activate(board.getByRole("button", { name: "Base map", exact: true }));
    assert.equal(await board.locator(".so-moisture-overlay, .so-thermal-overlay").count(), 0, "the base map retained a sample overlay");
    await activate(board.getByRole("button", { name: "Thermal", exact: true }));
    assert.equal(await board.locator(".so-thermal-overlay").count(), 1, "the thermal layer has no distinct contour overlay");
    assert.equal(await board.locator(".so-map").getAttribute("data-layer"), "thermal");
    await activate(board.getByRole("button", { name: "Zoom in", exact: true }));
    assert.equal(await board.getByLabel("Zoom level", { exact: true }).textContent(), "125%");
    await show("Assets");
    await activate(board.locator(".so-asset").filter({ hasText: "Helios-7" }));
    await page.waitForFunction(() => document.activeElement?.textContent === "Alpine corridor");
    assert.equal(await board.getByRole("progressbar", { name: "Helios-7 cloud cover" }).getAttribute("aria-valuenow"), "9");
    await activate(board.getByRole("button", { name: "Queue capture", exact: true }));
    assert(await board.getByRole("button", { name: "Capture queued", exact: true }).isDisabled());
    assert.match(await board.locator(".so-announcement").textContent(), /Helios-7 capture queued locally/);
    if (mobile) {
      await activate(board.getByRole("button", { name: "Back to assets", exact: true }));
      await page.waitForFunction(() => document.activeElement?.textContent?.includes("Helios-7"));
    }
    await activate(board.locator(".so-asset").filter({ hasText: "Asteria-3" }));
    assert(await board.getByRole("button", { name: "Queue capture", exact: true }).isEnabled(), "A different asset must keep its own capture state");
    await activate(board.getByRole("button", { name: "Queue capture", exact: true }));
    await show("Assets");
    await activate(board.locator(".so-asset").filter({ hasText: "Helios-7" }));
    assert(await board.getByRole("button", { name: "Capture queued", exact: true }).isDisabled(), "Returning to an asset must retain its queued capture");
    assert.match(await board.locator(".so-assets-foot").textContent(), /2 of 4 captures queued/);
    await show("Map");
    assert.match(await board.locator(".so-map-selection").textContent(), /Helios-7/);
    await activate(board.getByRole("button", { name: "Reset", exact: true }));
    assert.equal(await board.getByLabel("Zoom level", { exact: true }).textContent(), "100%");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await board.getByRole("button", { name: "Pause pass animation", exact: true }).waitFor();
    await activate(board.getByRole("button", { name: "Pause pass animation", exact: true }));
    assert.equal(await board.locator(".so-map").getAttribute("data-motion"), "paused");
    assert.equal(await board.locator(".so-sweep").evaluate(element => getComputedStyle(element).animationPlayState), "paused");
    await activate(board.getByRole("button", { name: "Resume pass animation", exact: true }));
    assert.equal(await board.locator(".so-map").getAttribute("data-motion"), "playing");
    const distance = await board.locator(".so-sweep").evaluate(element => getComputedStyle(element).offsetDistance);
    await page.waitForFunction(before => getComputedStyle(document.querySelector(".so-sweep")).offsetDistance !== before, distance);
    await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
    if (reduced) assert.equal(await board.locator(".so-sweep").evaluate(element => getComputedStyle(element).animationName), "none");
    console.log(`${page.viewportSize().width}px: satellite layers, zoom, asset details, independent capture queues and motion controls passed`);
  } catch (error) { fail(`Satellite operations: ${error.message}`); }
}
