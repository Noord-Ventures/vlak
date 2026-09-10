import assert from "node:assert/strict";

/** Real pointer paths across the category rail, including crossings that exceed a fixed hover delay. */
export async function checkDocsNavPointer({ page, base, fail }) {
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  try {
    // Hold scripts while the server-rendered links are already usable. A single
    // early entry must survive hydration without requiring another user event.
    for (const entry of ["pointer", "focus"]) {
      let release;
      const scripts = new Promise(resolve => { release = resolve; });
      const holdScripts = async route => {
        if (route.request().resourceType() === "script") await scripts;
        await route.continue();
      };
      await page.mouse.move(page.viewportSize().width - 8, 80);
      await page.route("**/_next/static/chunks/**", holdScripts);
      try {
        await page.goto(`${base}/components/`, { waitUntil: "commit" });
        const earlyCharts = page.locator('[data-toc="groups"]').getByRole("link", { name: "Charts", exact: true });
        await earlyCharts.waitFor({ state: "visible" });
        assert(await earlyCharts.evaluate(element => !Object.keys(element).some(key => key.startsWith("__reactProps"))), "The early entry must occur before hydration");
        if (entry === "pointer") {
          const bounds = await earlyCharts.boundingBox();
          await page.mouse.move(bounds.x + 30, bounds.y + bounds.height / 2);
        } else await earlyCharts.focus();
        release();
        await page.waitForFunction(() => document.querySelector('[data-toc="items"]')?.getAttribute("aria-label") === "Charts");
        await page.waitForLoadState("networkidle");
        assert.equal(await page.locator('[data-toc="items"]').getAttribute("aria-label"), "Charts", `Hydration must retain the early ${entry} selection`);
        assert(await earlyCharts.evaluate((element, kind) => kind === "pointer" ? element.matches(":hover") : element === document.activeElement, entry), `Hydration must preserve the original ${entry} target`);
      } finally {
        release();
        await page.unroute("**/_next/static/chunks/**", holdScripts);
      }
    }
    await page.goto(`${base}/components/`, { waitUntil: "networkidle" });
    const groups = page.locator('[data-toc="groups"]');
    const items = page.locator('[data-toc="items"]');
    const charts = groups.getByRole("link", { name: "Charts", exact: true });
    const chartBox = await charts.boundingBox();
    assert(chartBox, "The desktop category rail must be visible");
    const origin = { x: chartBox.x + 30, y: chartBox.y + chartBox.height / 2 };
    await page.mouse.move(origin.x, origin.y);
    // React can attach props before the containing boundary commits. Wait for
    // the first visible response, then test the pointer corridor without delays.
    await page.locator('[data-toc="items"][aria-label="Charts"]').waitFor({ state: "visible" });
    assert.equal(await items.getAttribute("aria-label"), "Charts");
    const firstItem = await items.getByRole("link").first().boundingBox();
    const destination = { x: firstItem.x + 20, y: firstItem.y + firstItem.height / 2 };
    const crossed = new Set();
    for (let step = 1; step <= 20; step++) {
      const x = origin.x + (destination.x - origin.x) * step / 20;
      const y = origin.y + (destination.y - origin.y) * step / 20;
      await page.mouse.move(x, y);
      const category = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("[data-category]")?.dataset.category, { x, y });
      if (category && category !== "charts") crossed.add(category);
      await page.waitForTimeout(35);
      assert.equal(await items.getAttribute("aria-label"), "Charts", "Moving diagonally to the upper submenu must retain Charts across other rows");
    }
    assert(crossed.size >= 2, "The diagonal must cross multiple other categories");
    await page.waitForTimeout(350);
    assert.equal(await items.getAttribute("aria-label"), "Charts", "Entering the submenu cancels any pending category change");

    const forms = groups.getByRole("link", { name: "Forms", exact: true });
    const formBox = await forms.boundingBox();
    await page.mouse.move(formBox.x + 30, formBox.y + formBox.height / 2, { steps: 12 });
    await settle();
    assert.equal(await items.getAttribute("aria-label"), "Forms", "A deliberate move left and up selects the new category immediately");

    await page.mouse.move(origin.x, origin.y);
    await settle();
    const icons = groups.getByRole("link", { name: "Icons", exact: true });
    const iconBox = await icons.boundingBox();
    await page.mouse.move(iconBox.x + iconBox.width - 2, iconBox.y + iconBox.height / 2, { steps: 6 });
    await settle();
    assert.equal(await items.getAttribute("aria-label"), "Charts", "The safe corridor initially protects the current submenu");
    await page.waitForFunction(() => document.querySelector('[data-toc="items"]')?.getAttribute("aria-label") === "Icons");

    await forms.focus();
    assert.equal(await items.getAttribute("aria-label"), "Forms", "Keyboard focus bypasses pointer intent");
    await forms.press("Tab");
    assert.equal(await items.getAttribute("aria-label"), "Navigation");
    await groups.getByRole("link").last().focus();
    await page.keyboard.press("Tab");
    assert(await page.evaluate(() => !!document.activeElement?.closest('[data-toc="items"]')), "Tab reaches the selected category's component links");
    const href = await page.evaluate(() => document.activeElement?.getAttribute("href"));
    assert(href?.startsWith("/components/"));
    await Promise.all([page.waitForURL(url => url.pathname.replace(/\/$/, "") === new URL(href, base).pathname.replace(/\/$/, "")), page.keyboard.press("Enter")]);
    console.log(`${page.viewportSize().width}px: category pointer intent passed (early hover/focus hydration, slow diagonal across ${crossed.size} categories, leftward selection, stopped hover, keyboard navigation)`);
  } catch (error) { fail(`category pointer intent ${page.viewportSize().width}px: ${error.message}`); }
}
