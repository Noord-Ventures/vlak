import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import { createExportServer } from "./serve-export.mjs";

const screenshots = await mkdtemp(join(tmpdir(), "vlak-layout-review-"));
const server = createExportServer();
server.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
  ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : undefined);
const errors = [];
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const duoReady = (page, theme) => page.waitForFunction(theme => {
  const images = [...document.querySelectorAll(".starter-duo img")].filter(image => image.getBoundingClientRect().width > 0);
  return images.length === 2 && images.every(image => image.dataset.previewTheme === theme && image.complete && image.naturalWidth > 0);
}, theme);

try {
  for (const mobile of [false, true]) {
    const label = mobile ? "mobile" : "desktop";
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      isMobile: mobile, hasTouch: mobile,
      colorScheme: mobile ? "dark" : "light", reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${base}/`);
    const tiles = page.locator(".specimen-start-tile");
    assert.equal(await tiles.count(), 3);
    const boxes = await tiles.evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }));
    assert(boxes.every(box => box.height >= (mobile ? 136 : 204)), `${label}: tile height`);
    const contentFits = await tiles.evaluateAll(elements => elements.every(element => {
      const tile = element.getBoundingClientRect();
      const description = element.querySelector(":scope > span")?.getBoundingClientRect();
      const title = element.querySelector(":scope > strong")?.getBoundingClientRect();
      return description && title && title.bottom <= description.top
        && Math.abs(description.top - title.bottom - 8) < 1
        && Math.abs(tile.bottom - description.bottom - 20) < 1
        && [description, title].every(rect => rect.width > 0 && rect.height > 0
          && Math.abs(rect.left - tile.left - 20) < 1 && rect.right <= tile.right
          && rect.top >= tile.top && rect.bottom <= tile.bottom);
    }));
    assert(contentFits, `${label}: title above description, grouped bottom-left with 20px insets and an 8px gap`);
    for (let index = 1; index < boxes.length; index++) {
      const previous = boxes[index - 1], current = boxes[index];
      assert(Math.abs((mobile ? current.x - previous.x : current.y - previous.y)) < 1, `${label}: tile alignment`);
      const gap = mobile ? current.y - previous.y - previous.height : current.x - previous.x - previous.width;
      assert(Math.abs(gap - 1) < 1, `${label}: one-pixel tile divider`);
    }
    assert.equal(await page.locator(".specimen-start").evaluate(element => getComputedStyle(element).backgroundColor), "rgba(0, 0, 0, 0)", `${label}: start dividers expose one shared field paint layer`);
    assert.deepEqual(await tiles.evaluateAll(elements => elements.map(element => element.dataset.startPath)), ["prototype", "agent", "install"]);
    await page.locator(".specimen-start").screenshot({ path: join(screenshots, `${label}-start.png`) });
    await page.evaluate(() => document.documentElement.dataset.grid = "off");
    assert.equal(await page.locator(".specimen-start").evaluate(element => getComputedStyle(element).gap), "0px", "Grid-off hides the new tile dividers too");
    await page.evaluate(() => document.documentElement.removeAttribute("data-grid"));

    const toggleTile = page.locator(".specimen-cell-kit-toggle-group");
    await toggleTile.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-preview="toggle-group"]')?.dataset.previewReady === "true");
    assert.equal(await toggleTile.getByRole("group").count(), 1, "Homepage exposes only the primary toggle group");
    await toggleTile.getByRole("button", { name: "Center", exact: true }).click();
    assert.equal(await toggleTile.getByRole("button", { name: "Center", exact: true }).getAttribute("aria-pressed"), "true");
    await toggleTile.getByRole("button", { name: "Right", exact: true }).focus();
    await page.keyboard.press("Space");
    assert.equal(await toggleTile.getByRole("button", { name: "Right", exact: true }).getAttribute("aria-pressed"), "true");
    await toggleTile.getByRole("button", { name: "Left", exact: true }).click();
    await toggleTile.screenshot({ path: join(screenshots, `${label}-toggle.png`) });
    assert(await noOverflow(page), `${label}: homepage fits viewport`);

    if (mobile) {
      const dimensions = await page.locator(".site-footer-link").evaluateAll(elements => elements.map(element => ({
        height: element.getBoundingClientRect().height,
        leading: Number.parseFloat(getComputedStyle(element).lineHeight) / Number.parseFloat(getComputedStyle(element).fontSize),
      })));
      assert(dimensions.every(link => link.height >= 24 && Math.abs(link.leading - 1.2) < 0.02), "Phone footer has compact but separate touch targets");
      assert.equal(dimensions[0].height, 28);
      await page.locator(".site-footer").screenshot({ path: join(screenshots, "mobile-footer.png") });
    }

    await page.goto(`${base}/starters/`);
    assert.equal(await page.locator(".starter-visual").count(), 5);
    assert.equal(await page.locator(".starter-card .starter-button-primary[download][data-vlak-starter]").count(), 5);
    assert.equal(await page.locator(".starter-card .starter-button").count(), 15);
    const buttonsFit = await page.locator(".starter-card .starter-button").evaluateAll(elements => elements.every(element => {
      const rect = element.getBoundingClientRect();
      return rect.width >= 44 && rect.height >= 44 && rect.left >= 0 && rect.right <= innerWidth;
    }));
    assert(buttonsFit, `${label}: starter actions are reachable and at least 44px`);
    await page.locator(".starter-duo").scrollIntoViewIfNeeded();
    await duoReady(page, mobile ? "dark" : "light");
    for (const card of await page.locator(".starter-card").all()) {
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({ path: join(screenshots, `${label}-starter-${await card.getAttribute("id")}.png`) });
    }
    await page.locator(".starter-duo").scrollIntoViewIfNeeded();
    for (const theme of ["dark", "light"]) {
      await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      await duoReady(page, theme);
      await page.locator(".starter-card#ios").screenshot({ path: join(screenshots, `${label}-duo-${theme}.png`) });
    }
    assert(await noOverflow(page), `${label}: starters fit viewport`);

    await page.goto(`${base}/interfaces/ios/`);
    const duoLinks = page.locator(".if-duo-start-actions a");
    assert.equal(await duoLinks.count(), 3);
    assert(await duoLinks.evaluateAll(elements => elements.every(element => getComputedStyle(element).columnGap === "8px")), "Duo arrows have 8px spacing");
    await page.locator(".if-duo-start-actions").screenshot({ path: join(screenshots, `${label}-duo-actions.png`) });
    for (const slug of ["ios", "calendar", "android"]) {
      if (slug !== "ios") await page.goto(`${base}/interfaces/${slug}/`);
      const seam = await page.locator(".if-duo-start").evaluate(strip => {
        const specimen = document.querySelector(".if-specimen");
        return { strip: getComputedStyle(strip).borderBottomWidth, specimen: getComputedStyle(specimen).borderTopWidth, gap: specimen.getBoundingClientRect().top - strip.getBoundingClientRect().bottom };
      });
      assert.deepEqual(seam, { strip: "0px", specimen: "1px", gap: 0 }, `${label}: ${slug} has one shared strip/specimen border`);
    }
    await context.close();
  }

  const page = await browser.newPage();
  await page.goto(`${base}/components/toggle-group/`);
  await page.waitForFunction(() => document.querySelector('[data-preview="toggle-group"]')?.dataset.previewReady === "true");
  assert.equal(await page.locator(".preview-box").getByRole("group").count(), 2, "Component page retains both toggle variants");
  await page.close();
  const plain = await browser.newContext({ javaScriptEnabled: false });
  const nojs = await plain.newPage();
  await nojs.goto(`${base}/`);
  assert.equal(await nojs.locator(".specimen-cell-kit-toggle-group").getByRole("group").count(), 1, "Server-rendered homepage also shows only the primary group");
  await nojs.goto(`${base}/starters/`);
  await nojs.locator(".starter-duo").scrollIntoViewIfNeeded();
  for (const theme of ["dark", "light"]) {
    await nojs.emulateMedia({ colorScheme: theme });
    await duoReady(nojs, theme);
  }
  await plain.close();
  assert.deepEqual(errors, [], "No runtime errors");
  console.log(`Growth layout passed on desktop and phone. Screenshots: ${screenshots}`);
} finally {
  await browser.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
