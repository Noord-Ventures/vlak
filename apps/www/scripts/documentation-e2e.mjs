import assert from "node:assert/strict";

export async function checkDocumentation({ page, base, fail }) {
  try {
    await page.goto(`${base}/interfaces/documentation/`, { waitUntil: "networkidle" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width: 100%; }" });
    const root = page.locator(".dc"), scroll = root.locator(".dc-scroll");
    await page.waitForFunction(() => Object.keys(document.querySelector(".dc-home") ?? {}).some(key => key.startsWith("__reactProps")));
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const activate = async control => { await control.focus(); await control.press("Enter"); await settle(); };
    const narrow = await root.getByRole("button", { name: "Open reading menu", exact: true }).isVisible();
    assert.equal(await root.locator(".dc-guide-list > li").count(), 6);
    assert.equal(await root.getAttribute("data-grid"), null);
    assert.equal(await root.locator(".dc-workspace").evaluate(element => getComputedStyle(element).backgroundImage), "none");
    if (!narrow) {
      const alignment = await root.evaluate(element => {
        const eyebrow = element.querySelector(".dc-eyebrow").getBoundingClientRect();
        const first = element.querySelector('.dc-rail button').getBoundingClientRect();
        return Math.abs(eyebrow.top + eyebrow.height / 2 - (first.top + first.height / 2));
      });
      assert(alignment < 1, "Documentation eyebrow must align with All guides");
      const columnAlignment = await root.evaluate(element => Math.abs(element.querySelector('.dc-eyebrow').getBoundingClientRect().left - element.querySelector('.dc-reader-path').getBoundingClientRect().left));
      assert(columnAlignment < 1, "Header breadcrumb must align with the article content column");
    }
    const guide = root.getByRole("button", { name: "Write the state you know", exact: true });
    await guide.focus();
    const previousPosition = await scroll.evaluate(element => element.scrollTop);
    await guide.press("Enter"); await settle();
    assert.equal(await root.getAttribute("data-view"), "article");
    assert.equal(await root.getByRole("heading", { name: "Write the state you know", exact: true }).evaluate(element => element === document.activeElement), true);
    if (!narrow) {
      const contents = root.locator(".dc-rail .dc-contents");
      const marks = contents.locator(".dc-outline-marks");
      assert.equal(await contents.locator(".dc-document-map").count(), 0, "The outline uses headings rather than miniature body text");
      assert.equal(await marks.locator("span").count(), 5);
      assert.equal(await marks.locator('[data-depth="0"]').count(), 1);
      assert.equal(await marks.locator('[data-depth="1"]').count(), 4);
      assert((await marks.boundingBox()).height < 80, "The resting outline stays compact");
      assert.equal(await marks.locator('[data-current="true"]').getAttribute("data-depth"), "0", "The document title is current before the first section");
      assert.equal(await contents.getAttribute("data-expanded"), "false");
      const rail = await root.locator(".dc-rail").boundingBox();
      await page.mouse.move(rail.x + rail.width + 20, rail.y + 150);
      assert.equal(await contents.getAttribute("data-expanded"), "true", "Pointer proximity must reveal readable contents");
      const firstSection = contents.getByRole("button", { name: "Separate zero from missing", exact: true });
      await firstSection.focus();
      await page.mouse.move(rail.x + rail.width + 200, rail.y + 150);
      assert.equal(await contents.getAttribute("data-expanded"), "true", "Keyboard focus must preserve readable contents");
      await root.getByRole("heading", { name: "Write the state you know", exact: true }).focus(); await settle();
      assert.equal(await contents.getAttribute("data-expanded"), "false");
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await contents.locator(".dc-outline-reveal").evaluate(element => getComputedStyle(element).transitionDuration), "0s");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const paragraphSize = await root.locator(".dc-article-section p").first().evaluate(element => parseFloat(getComputedStyle(element).fontSize));
      await activate(root.getByRole("button", { name: "Reader settings", exact: true }));
      await activate(root.locator(".dc-settings").getByRole("button", { name: "Increase text size", exact: true }));
      assert(await root.locator(".dc-article-section p").first().evaluate(element => parseFloat(getComputedStyle(element).fontSize)) > paragraphSize);
      assert.equal(await marks.locator("span").count(), 5, "Changing body text size preserves the heading outline");
      await activate(root.locator(".dc-settings").getByRole("button", { name: "Decrease text size", exact: true }));
      await page.keyboard.press("Escape"); await settle();
    }
    if (narrow) await activate(root.getByRole("button", { name: "Open reading menu", exact: true }));
    else await activate(root.getByRole("button", { name: "Keep guide contents open", exact: true }));
    await activate(root.getByRole("navigation", { name: "Guide contents", exact: true }).getByRole("button", { name: "Avoid an invented conclusion", exact: true }));
    const section = root.getByRole("heading", { name: "Avoid an invented conclusion", exact: true });
    assert.equal(await section.evaluate(element => element === document.activeElement), true);
    const targetPosition = await section.evaluate(heading => { const container = heading.closest(".dc-scroll"); return Math.min(container.scrollHeight - container.clientHeight, container.scrollTop + heading.getBoundingClientRect().top - container.getBoundingClientRect().top - 24); });
    await page.waitForFunction(target => Math.abs(document.querySelector(".dc-scroll").scrollTop - target) < 2, targetPosition);
    assert(await scroll.evaluate(element => element.scrollTop > 150));
    assert.equal(await root.locator(".dc-article-section p").first().evaluate(element => getComputedStyle(element).fontWeight), "350", "Body text uses the slightly heavier intermediate Inter weight");
    assert.equal(await section.evaluate(element => getComputedStyle(element).fontWeight), "600", "Heading emphasis remains unchanged");
    if (!narrow) {
      const contents = root.locator(".dc-rail .dc-contents");
      await page.mouse.move((await root.boundingBox()).x + 700, 200);
      assert.equal(await contents.getAttribute("data-pinned"), "true", "Selecting a heading keeps the outline visible");
      const outlineAlignment = await contents.evaluate(element => {
        const left = element.querySelector('.dc-outline-toggle span').getBoundingClientRect().left;
        return [...element.querySelectorAll('.dc-section-label,.dc-outline-marks > span')].map(item => Math.abs(item.getBoundingClientRect().left - left));
      });
      assert(outlineAlignment.every(offset => offset < 1), "Outline labels and collapsed marks align with Contents");
      assert.equal(await contents.locator('.dc-outline-toggle svg').count(), 0, "Contents has no pin icon");
      assert.equal(await contents.getByRole("button", { name: "Avoid an invented conclusion", exact: true }).getAttribute("aria-current"), "location");
      await scroll.evaluate(element => { element.scrollTop = 0; });
      await page.waitForFunction(() => document.querySelector('.dc-rail .dc-outline-links [aria-current="location"]')?.textContent === "Write the state you know");
      await contents.getByRole("button", { name: "Hide guide contents", exact: true }).focus();
      await page.keyboard.press("Escape"); await settle();
      assert.equal(await contents.getAttribute("data-expanded"), "false", "Escape collapses the outline");
      assert.equal(await contents.locator(".dc-outline-toggle").evaluate(element => element === document.activeElement), true);
    }
    await activate(root.locator(".dc-chrome").getByRole("button", { name: "Back to all guides", exact: true }));
    assert.equal(await root.getAttribute("data-view"), "index");
    assert.equal(await guide.evaluate(element => element === document.activeElement), true);
    assert(Math.abs(await scroll.evaluate(element => element.scrollTop) - previousPosition) <= 1, "Back should restore the index reading position");

    await activate(root.getByRole("button", { name: "Reader settings", exact: true }));
    const settings = root.locator(".dc-settings");
    await activate(settings.getByRole("button", { name: "Increase text size", exact: true }));
    await activate(settings.getByRole("button", { name: "Increase text size", exact: true }));
    assert.equal(await settings.getByLabel("Text size percentage").textContent(), "120%");
    assert.equal(await root.evaluate(element => element.style.getPropertyValue("--dc-scale")), "1.2");
    await activate(settings.getByRole("button", { name: "Dark", exact: true }));
    assert.equal(await root.getAttribute("data-appearance"), "dark");
    assert.equal(await settings.getByRole("switch", { name: "Layout grid", exact: true }).count(), 0);
    await page.keyboard.press("Escape"); await settle();
    assert.equal(await settings.isVisible(), false);

    if (narrow) {
      await activate(root.getByRole("button", { name: "Open reading menu", exact: true }));
      await page.keyboard.press("Escape"); await settle();
      assert.equal(await root.getByRole("button", { name: "Open reading menu", exact: true }).evaluate(element => element === document.activeElement), true);
      await activate(root.getByRole("button", { name: "Open reading menu", exact: true }));
    }
    await activate(root.getByRole("navigation", { name: "Guide categories", exact: true }).getByRole("button", { name: "Patterns", exact: true }));
    assert.equal(await root.locator(".dc-guide-list > li").count(), 2);
    await activate(root.getByRole("button", { name: "Make a small screen complete", exact: true }));
    await activate(root.locator(".dc-more").getByRole("button"));
    assert.equal(await root.getByRole("heading", { name: "Give actions an honest ending", exact: true }).isVisible(), true);
    assert.equal(await scroll.evaluate(element => element.scrollTop), 0);
    const fit = await root.evaluate(element => ({
      overflow: element.scrollWidth - element.clientWidth,
      page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      short: [...element.querySelectorAll("button")].filter(button => button.getClientRects().length && !button.closest("[inert]") && getComputedStyle(button).visibility !== "hidden").filter(button => { const rect = button.getBoundingClientRect(); return rect.width < 43.5 || rect.height < 43.5; }).map(button => button.getAttribute("aria-label") || button.textContent),
    }));
    assert(fit.overflow <= 1 && fit.page <= 1, `Documentation overflow: ${JSON.stringify(fit)}`);
    assert.deepEqual(fit.short, [], "Documentation controls must have 44px reach");
  } catch (error) { fail(`Documentation: ${error instanceof Error ? error.message : String(error)}`); }
}
