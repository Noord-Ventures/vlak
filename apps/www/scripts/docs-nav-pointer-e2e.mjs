import assert from "node:assert/strict";

/** Real pointer paths across the category rail, including crossings that exceed a fixed hover delay. */
export async function checkDocsNavPointer({ page, base, fail }) {
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  try {
    await page.goto(`${base}/components/`, { waitUntil: "networkidle" });
    const groups = page.locator('[data-toc="groups"]');
    const items = page.locator('[data-toc="items"]');
    await page.waitForFunction(() => Object.keys(document.querySelector('[data-toc="groups"] a') ?? {}).some(key => key.startsWith("__reactProps")));
    const charts = groups.getByRole("link", { name: "Charts", exact: true });
    const chartBox = await charts.boundingBox();
    assert(chartBox, "The desktop category rail must be visible");
    const origin = { x: chartBox.x + 30, y: chartBox.y + chartBox.height / 2 };
    await page.mouse.move(origin.x, origin.y);
    await settle();
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
    console.log(`${page.viewportSize().width}px: category pointer intent passed (slow diagonal across ${crossed.size} categories, leftward selection, stopped hover, keyboard navigation)`);
  } catch (error) { fail(`category pointer intent ${page.viewportSize().width}px: ${error.message}`); }
}
