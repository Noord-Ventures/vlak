import assert from "node:assert/strict";

export async function checkFoodDishes({ page, base, fail }) {
  try {
    await page.goto(`${base}/interfaces/evening/`, { waitUntil: "domcontentloaded" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width:620px; max-width:100%; }" });
    const root = page.locator(".fo");
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const press = async control => { await control.focus(); await control.press("Enter"); await settle(); };
    await root.locator(".fo-kitchen-open").first().waitFor();
    const allSources = new Set();
    for (const [name, count] of [["Joe's Kitchen", 3], ["Neder", 3], ["La Dune", 3], ["Jacky's", 4]]) {
      await press(root.getByRole("button", { name: `Open ${name} menu`, exact: true }));
      await root.locator(".fo-menu-item").first().waitFor();
      assert.equal(await root.locator(".fo-menu-item").count(), count);
      await page.waitForFunction(() => [...document.querySelectorAll(".fo-item-open img")].every(image => image.complete && image.naturalWidth > 0));
      const rows = await root.locator(".fo-item-open").evaluateAll(elements => elements.map(element => { const image = element.querySelector("img"), text = element.querySelector(":scope > span"), rect = element.getBoundingClientRect(); return { imageX: image.getBoundingClientRect().x, textX: text.getBoundingClientRect().x, source: image.getAttribute("src"), overflow: element.scrollWidth - element.clientWidth, width: rect.width }; }));
      assert(rows.every(row => Math.abs(row.imageX - rows[0].imageX) < 1 && Math.abs(row.textX - rows[0].textX) < 1), `${name} image and text columns must align across every row`);
      assert(rows.every(row => row.overflow <= 1), `${name} text must fit its menu column`);
      rows.forEach(row => { assert(!allSources.has(row.source), `${name} reused a dish image`); allSources.add(row.source); assert.match(row.source, /-v1\.jpg$/); });
      const back = root.getByRole("button", { name: "Kitchens", exact: true });
      const padding = await back.evaluate(element => { const style = getComputedStyle(element); return [parseFloat(style.paddingInlineStart), parseFloat(style.paddingInlineEnd), element.getBoundingClientRect().height]; });
      assert(padding[0] >= 12 && padding[1] >= 12 && padding[2] >= 44, "Kitchens back control must retain insets and 44px reach");
      await root.locator(".fo-menu-item").first().scrollIntoViewIfNeeded();
      const firstSource = rows[0].source;
      await press(root.locator(".fo-item-open").first());
      assert.equal(await root.locator(".fo-dish > img").getAttribute("src"), firstSource, "Details must use the selected dish photograph");
      await press(root.locator(".fo-side-header").getByRole("button", { name: "Back", exact: true }));
      assert.equal(await root.locator(".fo-item-open").first().evaluate(element => element === document.activeElement), true, "Dish Back should restore the row focus");
      await press(back);
    }
    assert.equal(allSources.size, 13);
    assert(await root.evaluate(element => element.scrollWidth - element.clientWidth <= 1), "Food menu must fit the frame");
  } catch (error) { fail(`Food dish photography: ${error instanceof Error ? error.message : String(error)}`); }
}
