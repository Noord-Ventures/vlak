import assert from "node:assert/strict";

export async function checkSocialFood({ page, base, fail }) {
  const activate = async target => { await target.focus(); await target.press("Enter"); await page.waitForTimeout(40); };
  const choose = async (target, index) => { await activate(target); await target.press("Home"); for (let i = 0; i < index; i++) await target.press("ArrowDown"); await target.press("Enter"); await page.waitForTimeout(40); };
  const prepare = async (slug, selector) => {
    await page.goto(`${base}/interfaces/${slug}/`, { waitUntil: "networkidle" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width: 100%; }" });
    // Static content can be painted before React attaches its event handlers.
    await page.waitForFunction(root => {
      const control = document.querySelector(`${root} button`);
      return control && Object.keys(control).some(key => key.startsWith("__reactProps"));
    }, selector);
    return page.locator(selector);
  };
  const fit = async (root, docks) => {
    const result = await root.evaluate((element, selectors) => {
      const box = element.getBoundingClientRect();
      const visible = target => target.getClientRects().length && getComputedStyle(target).visibility !== "hidden" && !target.closest('[aria-hidden="true"]');
      return {
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        overflow: element.scrollWidth - element.clientWidth,
        legacy: element.querySelectorAll('[class*="sc-"]').length,
        escaped: [...element.querySelectorAll(selectors)].filter(visible).filter(target => {
          const rect = target.getBoundingClientRect(); return rect.top < box.top - 1 || rect.bottom > box.bottom + 1 || rect.left < box.left - 1 || rect.right > box.right + 1;
        }).map(target => target.className),
        short: [...element.querySelectorAll("button,input:not([type=hidden]),textarea")].filter(visible).filter(target => {
          const rect = (target.matches('input[type="checkbox"]') ? target.closest("label") : target)?.getBoundingClientRect(); return rect && (rect.width < 43.5 || rect.height < 43.5);
        }).map(target => target.getAttribute("aria-label") || target.textContent),
      };
    }, docks);
    assert(result.pageOverflow <= 1 && result.overflow <= 1, `overflow ${JSON.stringify(result)}`);
    assert.equal(result.legacy, 0);
    assert.deepEqual(result.escaped, [], "a pinned region escaped the frame");
    assert.deepEqual(result.short, [], "a control is smaller than 44px");
  };
  try {
    const root = await prepare("wall", ".sf");
    const docks = ".sf-header,.sf-main-header,.sf-detail-header,.sf-comment-dock,.sf-compose-actions,.sf-mobile-nav,.sf-footer";
    const post = root.locator('[data-post="m2"]');
    await activate(post.getByRole("button", { name: "Like Inez’s post", exact: true }));
    assert.equal(await post.getByRole("button", { name: "Like Inez’s post", exact: true }).getAttribute("aria-pressed"), "true");
    assert.match(await post.locator(".sf-post-actions").textContent(), /9/);
    const openComments = post.getByRole("button", { name: "Comments on Inez’s post", exact: true });
    await activate(openComments);
    await root.getByRole("textbox", { name: "Add a comment", exact: true }).fill("I will bring the smaller version for comparison."); await page.waitForTimeout(40);
    await activate(root.getByRole("button", { name: "Post comment", exact: true }));
    assert.match(await root.locator(".sf-comment").last().textContent(), /I will bring the smaller version for comparison\./);
    await fit(root, docks);
    await activate(root.locator(".sf-comment").first().getByRole("button", { name: "Tomas", exact: true }));
    assert.equal(await root.locator(".sf-profile h3").textContent(), "Tomas");
    await activate(root.getByRole("button", { name: "Follow Tomas", exact: true }));
    assert.equal(await root.getByRole("button", { name: "Follow Tomas", exact: true }).getAttribute("aria-pressed"), "true");
    await activate(root.getByRole("button", { name: "Back", exact: true }));
    assert.equal(await root.getAttribute("data-detail"), "post");
    assert.equal(await root.locator(".sf-comment").first().getByRole("button", { name: "Tomas", exact: true }).evaluate(element => element === document.activeElement), true);
    await activate(root.getByRole("button", { name: "Back", exact: true }));
    await choose(root.getByRole("combobox", { name: "Contributor", exact: true }), 1);
    assert.equal(await root.locator(".sf-post").count(), 1);
    await activate(root.getByRole("button", { name: "Photos", exact: true }));
    assert.equal(await root.locator(".sf-post-photo").count(), 1);
    await activate(root.getByRole("button", { name: "New post", exact: true }));
    await root.getByRole("textbox", { name: "Your update", exact: true }).fill("A new local proof is ready to review."); await page.waitForTimeout(40);
    await fit(root, docks);
    await activate(root.getByRole("button", { name: "Publish locally", exact: true }));
    assert.match(await root.locator(".sf-post").first().textContent(), /A new local proof is ready to review\./);
    assert.equal(await root.getAttribute("data-detail"), "none");
    assert.equal(await root.locator(".sf-post").count(), 8);
    await fit(root, docks);
  } catch (error) { fail(`Social feed rebuild: ${error instanceof Error ? error.message : String(error)}`); }
  try {
    const root = await prepare("evening", ".fo");
    const docks = ".fo-header,.fo-page-header,.fo-side-header,.fo-side-actions,.fo-filter-action,.fo-mobile-nav,.fo-footer";
    const mobile = await root.locator(".fo-mobile-nav").isVisible();
    assert.deepEqual(await root.locator(".fo-kitchen-title strong").allTextContents(), ["Joe's Kitchen", "Neder", "La Dune", "Jacky's"]);
    for (const [name, address, website, sample] of [
      ["Joe's Kitchen", "Berenkoog 35, 1822 BH Alkmaar", "https://www.joeskitchenalkmaar.nl/", false],
      ["Neder", "Laat 85, 1811 EC Alkmaar", "https://www.nederrestaurant.nl/", false],
      ["La Dune", "Ruïnelaan 7, 1861 LK Bergen", "https://ladunebergen.nl/", true],
      ["Jacky's", "Huiswaardersplein 1, 1823 CP Alkmaar", "https://jackyalkmaar.nl/", false],
    ]) {
      await activate(root.getByRole("button", { name: `Open ${name} menu`, exact: true }));
      const about = root.getByRole("region", { name: `About ${name}`, exact: true });
      assert.equal(await about.locator("address").textContent(), address);
      assert.equal(await about.getByRole("link", { name: "Official website", exact: true }).getAttribute("href"), website);
      assert.equal(await about.getByRole("link", { name: "Published menu", exact: true }).count(), sample ? 0 : 1);
      assert.equal(await root.locator(".fo-menu-item b").filter({ hasText: "Sample price" }).count(), sample ? 3 : 0);
      assert.match(await root.locator(".fo-menu-heading").textContent(), /timing, and fees are local examples/);
      await fit(root, docks);
      await activate(root.getByRole("button", { name: "Kitchens", exact: true }));
    }
    if (mobile) await activate(root.getByRole("button", { name: "Filters", exact: true }));
    await choose(root.getByRole("combobox", { name: "Kitchen type", exact: true }), 1);
    assert.match(await root.locator(".fo-filter-summary").textContent(), /1 kitchen matches/);
    await root.getByRole("searchbox", { name: "Search kitchens", exact: true }).fill("impossible kitchen"); await page.waitForTimeout(40);
    assert.match(await root.locator(".fo-filter-summary").textContent(), /0 kitchens match/);
    await activate(root.locator(".fo-filter-summary").getByRole("button", { name: "Clear filters", exact: true }));
    await root.getByRole("searchbox", { name: "Search kitchens", exact: true }).fill("Joe's Kitchen"); await page.waitForTimeout(40);
    if (mobile) await activate(root.getByRole("button", { name: "Show 1 kitchen", exact: true }));
    await fit(root, docks);
    await activate(root.getByRole("button", { name: "Open Joe's Kitchen menu", exact: true }));
    await activate(root.getByRole("button", { name: "View Grilled chicken filet large", exact: true }));
    await activate(root.getByRole("button", { name: "Increase quantity", exact: true }));
    assert.equal(await root.getByRole("spinbutton", { name: "Quantity", exact: true }).inputValue(), "2");
    await fit(root, docks);
    await activate(root.getByRole("button", { name: "Add to bag · €30.00", exact: true }));
    assert.equal(await root.locator(".fo-line-quantity").textContent(), "2");
    assert.match(await root.locator(".fo-total").textContent(), /€32\.40/);
    await activate(root.getByRole("button", { name: "Decrease Grilled chicken filet large quantity", exact: true }));
    assert.match(await root.locator(".fo-total").textContent(), /€17\.40/);
    await activate(root.getByRole("button", { name: "Back", exact: true }));
    await activate(root.getByRole("button", { name: "Add BBQ chicken wings with fries to bag", exact: true }));
    assert.match(await root.locator(".fo-total").textContent(), /€31\.40/);
    await activate(root.getByRole("button", { name: "Remove BBQ chicken wings with fries from bag", exact: true }));
    assert.match(await root.locator(".fo-total").textContent(), /€17\.40/);
    const checkout = root.getByRole("button", { name: "Complete demo checkout", exact: true });
    assert.equal(await checkout.isDisabled(), true);
    const confirm = root.getByRole("checkbox", { name: "I understand this is a local demo.", exact: true });
    await confirm.focus(); await confirm.press("Space");
    await fit(root, docks);
    await activate(checkout);
    assert.equal(await root.getAttribute("data-view"), "receipt");
    assert.equal(await root.getByText("No order was placed. No payment was taken.", { exact: true }).isVisible(), true);
    assert.match(await root.locator(".fo-receipt-lines").textContent(), /1 × Grilled chicken filet large/);
    assert.match(await root.locator(".fo-total").textContent(), /€17\.40/);
    await activate(root.getByRole("button", { name: "Start new bag", exact: true }));
    assert.equal(await root.getAttribute("data-view"), "browse");
    assert.equal(await root.locator(".fo-count").textContent(), "0");
    if (mobile) await activate(root.getByRole("button", { name: "Filters", exact: true }));
    await activate(root.getByRole("button", { name: "Pickup", exact: true }));
    if (mobile) await activate(root.getByRole("button", { name: "Show 4 kitchens", exact: true }));
    assert.equal(await root.locator(".fo-kitchen").count(), 4, "Demo collection does not claim restaurant availability");
    await activate(root.getByRole("button", { name: "Open Jacky's menu", exact: true }));
    await activate(root.getByRole("button", { name: "Add Fries to bag", exact: true }));
    assert.match(await root.locator(".fo-total").textContent(), /€4\.50/);
    assert.match(await root.locator(".fo-bag-line").textContent(), /Demo pickup/);
    await activate(root.getByRole("button", { name: "Back", exact: true }));
    await activate(root.getByRole("button", { name: "Kitchens", exact: true }));
    if (mobile) await activate(root.getByRole("button", { name: "Filters", exact: true }));
    await activate(root.getByRole("button", { name: "Delivery", exact: true }));
    if (mobile) await activate(root.getByRole("button", { name: "Show 4 kitchens", exact: true }));
    await activate(root.getByRole("button", { name: "Open Joe's Kitchen menu", exact: true }));
    await activate(root.getByRole("button", { name: "Add Grilled chicken filet large to bag", exact: true }));
    assert.match(await root.locator(".fo-total").textContent(), /€21\.90/, "Adding delivery preserves the existing pickup collection and fee");
    assert.match(await root.locator('.fo-bag-line[data-line="jackys-fries-pickup"]').textContent(), /Demo pickup/);
    await fit(root, docks);
  } catch (error) { fail(`Food ordering rebuild: ${error instanceof Error ? error.message : String(error)}`); }
}
