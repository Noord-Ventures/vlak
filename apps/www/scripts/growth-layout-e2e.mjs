import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import { createExportServer } from "./serve-export.mjs";
import { interfaceStarters } from "../app/starters/catalog.ts";

const screenshots = await mkdtemp(join(tmpdir(), "vlak-layout-review-"));
const server = createExportServer();
server.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
  ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : undefined);
const errors = [];
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const cropReady = (page, slug) => page.waitForFunction(slug => [...document.getElementById(slug).querySelectorAll("img")]
  .filter(image => image.getBoundingClientRect().width > 0 && new URL(image.src).origin === location.origin)
  .every(image => image.complete && image.naturalWidth > 0), slug);

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

    await page.goto(`${base}/interfaces/`);
    assert.equal(await page.locator("article.if-tile").count(), interfaceStarters.length);
    assert.equal(await page.locator(".if-tile .if-crop").count(), interfaceStarters.length);
    assert.equal(await page.locator(".if-tile a[download][data-vlak-starter]").count(), interfaceStarters.length);
    assert.equal(await page.locator(".if-tile-actions a").count(), interfaceStarters.length * 3);
    assert.equal(await page.locator(".if-tile a a, a.if-tile, .if-tile a button, .if-tile a input").count(), 0, "Gallery actions are independent links, not nested controls");
    for (const starter of interfaceStarters) {
      const card = page.locator(`article.if-tile#${starter.slug}`);
      assert.equal(await card.locator("[download]").getAttribute("href"), starter.download);
      assert.equal(await card.locator("[download]").getAttribute("data-vlak-starter"), starter.slug);
      const actions = card.locator(".if-tile-actions a");
      assert.deepEqual(await actions.evaluateAll(links => links.map(link => link.textContent.replace(/[→↗↓]/g, "").trim())), ["Try", "Download", "View source"]);
      assert.equal(await actions.nth(0).getAttribute("href"), starter.preview);
      assert.equal(await actions.nth(2).getAttribute("href"), starter.source);
      assert.equal(await card.getByRole("heading", { level: 2 }).count(), 1, `${starter.slug}: named article`);
    }
    const buttonsFit = await page.locator(".if-tile-actions a").evaluateAll(elements => elements.every(element => {
      const rect = element.getBoundingClientRect();
      return rect.width >= 44 && rect.height >= 44 && rect.left >= 0 && rect.right <= innerWidth;
    }));
    assert(buttonsFit, `${label}: interface actions are reachable and at least 44px`);
    for (const card of await page.locator("article.if-tile").all()) {
      await card.scrollIntoViewIfNeeded();
      await cropReady(page, await card.getAttribute("id"));
      await card.screenshot({ path: join(screenshots, `${label}-interface-${await card.getAttribute("id")}.png`) });
    }
    for (const theme of ["dark", "light"]) {
      await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      for (const slug of ["ios", "render", "drive"]) {
        const card = page.locator(`article.if-tile#${slug}`); await card.scrollIntoViewIfNeeded(); await cropReady(page, slug);
        await card.screenshot({ path: join(screenshots, `${label}-${slug}-${theme}.png`) });
      }
    }
    assert(await noOverflow(page), `${label}: interfaces fit viewport`);

    const campaign = "?utm_source=linkedin&utm_campaign=gallery-launch#ios";
    await page.goto(`${base}/starters/${campaign}`);
    await page.waitForURL(`${base}/interfaces/${campaign}`);
    assert.equal(new URL(page.url()).hash, "#ios", "Legacy deep links reach the same interface tile");

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
      const download = page.locator(".if-duo-start a[download]");
      assert.equal(await download.getAttribute("href"), interfaceStarters.find(starter => starter.slug === slug).download);
      assert.match(await download.innerText(), /Download starter/);
      const box = await download.boundingBox(); assert(box && box.height >= 44 && box.width >= 44, `${slug}: direct download is a touch target`);
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
  assert.equal(new URL(nojs.url()).pathname, "/starters/", "Static-host fallback remains readable without JavaScript");
  const fallback = nojs.locator('main a[href="/interfaces/"]').first();
  assert(await fallback.isVisible(), "Redirect has an ordinary no-JavaScript link");
  assert.equal(await nojs.locator('main a[href="/interfaces/#ios"]').count(), 1, "Old fragment has a usable no-JavaScript destination");
  await fallback.click();
  assert.equal(await nojs.locator("article.if-tile a[download]").count(), interfaceStarters.length, "Every download is present before hydration");
  assert.equal(await nojs.locator(".if-tile-actions a").count(), interfaceStarters.length * 3);
  for (const theme of ["dark", "light"]) {
    await nojs.emulateMedia({ colorScheme: theme });
    await nojs.locator(".if-tile#render").scrollIntoViewIfNeeded(); await cropReady(nojs, "render");
  }
  await plain.close();
  assert.deepEqual(errors, [], "No runtime errors");
  console.log(`Growth layout passed on desktop and phone. Screenshots: ${screenshots}`);
} finally {
  await browser.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
