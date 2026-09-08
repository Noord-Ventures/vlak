// SITE_URL=http://localhost:3016 node apps/www/scripts/interface-preview-e2e.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const openFrame = '.if-preview-frame[data-preview-open="true"]';
const settle = page => page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));

async function assertViewport(page, label) {
  await settle(page);
  const layout = await page.locator(openFrame).evaluate(frame => {
    const rect = frame.getBoundingClientRect(), bar = frame.querySelector(".if-preview-bar"), content = frame.querySelector(".if-preview-content");
    const barRect = bar.getBoundingClientRect(), contentRect = content.getBoundingClientRect();
    const visible = element => element.getClientRects().length && getComputedStyle(element).visibility !== "hidden";
    return {
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      overflow: frame.scrollWidth - frame.clientWidth,
      contentOverflow: content.scrollWidth - content.clientWidth,
      bar: { top: barRect.top, bottom: barRect.bottom, left: barRect.left, right: barRect.right },
      content: { top: contentRect.top, bottom: contentRect.bottom, overflowY: getComputedStyle(content).overflowY },
      shortControls: [...bar.querySelectorAll('button, a[href], input:not([type="hidden"])')].filter(visible).filter(element => {
        const box = element.getBoundingClientRect(); return box.width < 43.5 || box.height < 43.5;
      }).map(element => element.getAttribute("aria-label") || element.textContent?.trim()),
      outsideControls: [...bar.querySelectorAll('button, a[href], input:not([type="hidden"])')].filter(visible).filter(element => {
        const box = element.getBoundingClientRect(); return box.left < -1 || box.right > window.innerWidth + 1 || box.top < -1 || box.bottom > window.innerHeight + 1;
      }).map(element => element.getAttribute("aria-label") || element.textContent?.trim()),
      focusedInside: frame.contains(document.activeElement),
    };
  });
  assert.ok(Math.abs(layout.x) <= 1 && Math.abs(layout.y) <= 1, `${label}: preview starts at the viewport origin`);
  assert.ok(Math.abs(layout.width - layout.viewport.width) <= 1 && Math.abs(layout.height - layout.viewport.height) <= 1, `${label}: preview covers the complete viewport`);
  assert.ok(layout.overflow <= 1 && layout.contentOverflow <= 1, `${label}: preview has no sideways overflow (${JSON.stringify(layout)})`);
  assert.ok(layout.bar.top >= -1 && layout.bar.bottom <= layout.viewport.height, `${label}: share bar remains on screen`);
  assert.ok(layout.content.top >= layout.bar.bottom - 1 && layout.content.bottom <= layout.viewport.height + 1, `${label}: app scroll region fits beneath the share bar`);
  assert.ok(["auto", "scroll"].includes(layout.content.overflowY), `${label}: app can scroll independently of the page`);
  assert.deepEqual(layout.shortControls, [], `${label}: share bar controls are at least 44px`);
  assert.deepEqual(layout.outsideControls, [], `${label}: share bar controls stay reachable`);
  assert.equal(layout.focusedInside, true, `${label}: focus enters the open preview`);
}

async function assertAxe(page, label) {
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
    rules: { region: { enabled: false } },
  })).violations.map(item => `${item.id}: ${item.nodes.slice(0, 4).map(node => node.target).join(", ")}`));
  assert.deepEqual(violations, [], `${label}: fullscreen preview passes axe`);
}

async function assertCopy(page, url) {
  await page.locator(".if-preview-bar").getByRole("button", { name: "Copy preview link", exact: true }).click();
  await page.waitForFunction(async expected => await navigator.clipboard.readText() === expected, url);
  await page.locator(".if-preview-status").filter({ hasText: "Preview link copied" }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), url, "copy writes the canonical short preview URL");
}

async function assertSelectedFallback(page, url, message) {
  const fallback = page.getByRole("textbox", { name: "Preview link", exact: true });
  await fallback.waitFor({ state: "visible" });
  assert.equal(await fallback.inputValue(), url, message);
  await settle(page);
  assert.equal(await fallback.evaluate(element => document.activeElement === element && element.selectionStart === 0 && element.selectionEnd === element.value.length), true, `${message}: the complete URL is selected and focused`);
  return fallback;
}

async function assertSharing(page, url) {
  const bar = page.locator(".if-preview-bar");
  await bar.getByRole("button", { name: "Share", exact: true }).click();
  const panel = page.locator(".if-preview-share");
  await panel.waitFor({ state: "visible" });
  const destinations = {
    X: { host: "twitter.com", path: "/intent/tweet", query: "url" },
    LinkedIn: { host: "www.linkedin.com", path: "/sharing/share-offsite/", query: "url" },
    Bluesky: { host: "bsky.app", path: "/intent/compose", query: "text" },
  };
  for (const [name, destination] of Object.entries(destinations)) {
    const link = panel.getByRole("link", { name, exact: true }), href = new URL(await link.getAttribute("href"));
    assert.equal(href.protocol, "https:", `${name}: sharing link uses HTTPS`);
    assert.ok(href.hostname === destination.host || (name === "X" && href.hostname === "x.com"), `${name}: sharing link targets the provider`);
    assert.equal(href.pathname, destination.path, `${name}: sharing link opens the provider composer`);
    assert.ok(href.searchParams.get(destination.query)?.includes(url), `${name}: sharing link includes the short preview URL`);
    assert.equal(await link.getAttribute("target"), "_blank", `${name}: composer opens separately`);
    assert.match(await link.getAttribute("rel") || "", /noopener|noreferrer/, `${name}: separate composer cannot access the opener`);
  }
  await panel.getByRole("button", { name: "More sharing options", exact: true }).click();
  await page.waitForFunction(() => window.__previewTestShares.length === 1);
  assert.equal(await page.evaluate(() => window.__previewTestShares[0].url), url, "native share receives the short URL without sending externally");
  // The native sharing success may leave or close its options panel.
  if (await panel.isVisible()) await page.keyboard.press("Escape");
  assert.equal(await page.locator(openFrame).count(), 1, "closing sharing options preserves fullscreen preview");

  await page.evaluate(() => { window.__previewTestShareMode = "cancel"; });
  await bar.getByRole("button", { name: "Share", exact: true }).click();
  await panel.getByRole("button", { name: "More sharing options", exact: true }).click();
  await page.waitForFunction(() => window.__previewTestShares.length === 2);
  await settle(page);
  assert.equal(await page.getByRole("textbox", { name: "Preview link", exact: true }).count(), 0, "cancelling native share does not report a failure");
  if (await panel.isVisible()) await page.keyboard.press("Escape");

  await page.evaluate(() => { window.__previewTestShareMode = "reject"; });
  await bar.getByRole("button", { name: "Share", exact: true }).click();
  await panel.getByRole("button", { name: "More sharing options", exact: true }).click();
  await assertSelectedFallback(page, url, "native share rejection exposes the same usable URL");
  if (await panel.isVisible()) await page.keyboard.press("Escape");
  await page.evaluate(() => { window.__previewTestShareMode = "success"; });
  // Successful copying clears the error before testing clipboard denial itself.
  await assertCopy(page, url);

  await page.evaluate(() => { window.__previewTestCopyFailure = true; });
  try {
    await bar.getByRole("button", { name: "Copy preview link", exact: true }).click();
    const fallback = await assertSelectedFallback(page, url, "clipboard rejection exposes a usable URL");
    await assertViewport(page, "clipboard fallback");

    // A retry must refocus the existing field too, rather than depending on the
    // error UI mounting for the first time. Collapse its selection like a user.
    await fallback.press("ArrowLeft");
    await bar.getByRole("button", { name: "Copy preview link", exact: true }).click();
    await assertSelectedFallback(page, url, "repeated clipboard denial restores the existing fallback");

    await page.evaluate(() => { window.__previewTestShareMode = "reject"; });
    await fallback.press("ArrowLeft");
    await bar.getByRole("button", { name: "Share", exact: true }).click();
    await panel.getByRole("button", { name: "More sharing options", exact: true }).click();
    await panel.waitFor({ state: "hidden" });
    await assertSelectedFallback(page, url, "native share denial while fallback exists closes its popover and restores selection");
    assert.equal(await page.locator(openFrame).count(), 1, "sharing failures preserve the fullscreen app");
    await assertAxe(page, "sharing fallback");
  } finally { await page.evaluate(() => { window.__previewTestCopyFailure = false; window.__previewTestShareMode = "success"; }); }
}

async function assertNestedControls(page, slug) {
  if (slug === "documentation") {
    const trigger = page.locator(".dc").getByRole("button", { name: "Reader settings", exact: true });
    await trigger.click();
    const settings = page.locator(".dc-settings");
    await settings.waitFor({ state: "visible" });
    const size = settings.locator('output[aria-label="Text size percentage"]');
    const before = await size.innerText();
    await settings.getByRole("button", { name: "Increase text size", exact: true }).click();
    assert.notEqual(await size.innerText(), before, "reader settings remain interactive inside the preview");
    await page.keyboard.press("Escape"); await settle(page);
    assert.equal(await settings.isVisible(), false, "Escape closes the app's native popover first");
    assert.equal(await page.locator(openFrame).count(), 1, "app popover Escape keeps the preview open");
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true, "app popover returns focus to its trigger");
  }
  if (slug === "desktop-os") {
    const desktop = page.locator('.dos[data-platform="mac"]');
    const trigger = desktop.locator(".dos-apps-trigger:visible").first();
    await trigger.click();
    const menu = desktop.getByRole("dialog");
    await menu.getByRole("searchbox", { name: "Find an app" }).fill("Calculator");
    await menu.getByRole("button", { name: "Calculator", exact: true }).click();
    const calculator = desktop.locator('.dos-window[data-app="calculator"][data-front="true"]');
    await calculator.getByRole("textbox", { name: "Calculation" }).fill("6 * 7");
    await calculator.getByRole("textbox", { name: "Calculation" }).press("Enter");
    assert.equal(await calculator.locator("output").innerText(), "42", "desktop dialog can open a functioning app in fullscreen");
    await trigger.click(); await menu.waitFor({ state: "visible" });
    await page.keyboard.press("Escape"); await settle(page);
    assert.equal(await menu.isVisible(), false, "Escape closes the app dialog first");
    assert.equal(await page.locator(openFrame).count(), 1, "app dialog Escape keeps the preview open");
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true, "app dialog restores its own trigger focus");
    await calculator.getByRole("button", { name: "Close Calculator", exact: true }).click();
  }
}

export async function checkInterfacePreviews({ browser, base, fail, widths = [390, 1440], only = [] }) {
  const origin = new URL(base).origin;
  const index = await browser.newPage();
  let studies;
  try {
    await index.goto(`${base}/interfaces/`, { waitUntil: "domcontentloaded" });
    await index.locator(".if-tile").first().waitFor();
    studies = await index.locator(".if-tile").evaluateAll(tiles => tiles.map(tile => ({
      slug: new URL(tile.href).pathname.split("/").filter(Boolean).at(-1), title: tile.querySelector("h2").textContent.trim(),
    })));
    assert.ok(studies.length > 0, "gallery exposes its catalog of studies");
    assert.equal(new Set(studies.map(study => study.slug)).size, studies.length, "catalog contains no duplicate preview slugs");
    if (only.length) {
      for (const slug of only) assert.ok(studies.some(study => study.slug === slug), `requested study ${slug} exists in the catalog`);
      studies = studies.filter(study => only.includes(study.slug));
    }
  } finally { await index.close(); }
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 1000 }, colorScheme: "light", reducedMotion: "reduce", acceptDownloads: true });
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin });
    await context.addInitScript(() => {
      if (window.top !== window) return;
      window.__previewTestShares = [];
      window.__previewTestCopyFailure = false;
      window.__previewTestShareMode = "success";
      const write = navigator.clipboard.writeText.bind(navigator.clipboard);
      Object.defineProperty(navigator.clipboard, "writeText", { configurable: true, value: async text => {
        if (window.__previewTestCopyFailure) throw new DOMException("Clipboard rejected for the fallback test", "NotAllowedError");
        return write(text);
      } });
      Object.defineProperty(navigator, "share", { configurable: true, value: async data => {
        window.__previewTestShares.push(data);
        if (window.__previewTestShareMode === "cancel") throw new DOMException("Share cancelled", "AbortError");
        if (window.__previewTestShareMode === "reject") throw new DOMException("Share denied", "NotAllowedError");
      } });
    });
    try {
      for (const [studyIndex, study] of studies.entries()) {
        // Each study owns a fresh page. Its ordinary/short route and all preview
        // transitions share that page, without a failed renderer poisoning peers.
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        const errors = [], onError = error => errors.push(error.message);
        page.on("pageerror", onError);
        const { slug, title } = study, label = `${width}px ${slug}`, url = `${origin}/i/${slug}/`;
        let phase = "normal route";
        try {
          const response = await page.goto(`${base}/interfaces/${slug}/`, { waitUntil: "networkidle" });
          assert.ok(response.ok(), `${label}: ordinary study route responds successfully`);
          const trigger = page.getByRole("button", { name: "Preview fullscreen", exact: true });
          await trigger.waitFor({ state: "visible" });
          const specimen = await page.locator(".if-specimen").elementHandle();
          const appRoots = await specimen.evaluateHandle(element => [...element.children]);
          let vehicleCanvas;
          if (slug === "drive") {
            await page.locator('.ev-scene canvas[data-engine="three"]').waitFor({ timeout: 30000 });
            vehicleCanvas = await page.locator('.ev-scene canvas[data-engine="three"]').elementHandle();
          }
          const draft = `Unsent preview draft at ${width}px`;
          if (slug === "desktop-os") {
            await page.getByRole("tab", { name: "Mac OS", exact: true }).click();
            await page.locator('.dos[data-platform="mac"] .dos-window[data-app="editor"][data-front="true"]').getByRole("textbox", { name: "Document text" }).fill(draft);
          }
          await trigger.evaluate(element => element.scrollIntoView({ block: "center" }));
          await trigger.focus(); await settle(page);
          const previousScroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
          await trigger.press("Enter");
          await page.locator(openFrame).waitFor({ state: "visible" });
          phase = "opened preview";
          assert.equal(await page.locator(openFrame).getAttribute("aria-label"), `${title} fullscreen preview`);
          assert.equal(await specimen.evaluate(element => element === document.querySelector(".if-specimen") && element.isConnected), true, `${label}: opening preserves the mounted specimen`);
          assert.equal(await appRoots.evaluate(elements => elements.every((element, index) => element.isConnected && element === document.querySelector(".if-specimen").children[index])), true, `${label}: opening preserves each mounted app root`);
          if (vehicleCanvas) assert.equal(await vehicleCanvas.evaluate(element => element === document.querySelector('.ev-scene canvas[data-engine="three"]') && element.isConnected), true, "EV keeps the same WebGL canvas on opening");
          if (slug === "desktop-os") assert.equal(await page.locator('.dos[data-platform="mac"] .dos-window[data-app="editor"]').getByRole("textbox", { name: "Document text" }).inputValue(), draft, "opening preview preserves the unsaved desktop draft");
          await assertViewport(page, label);
          if (slug === "agents") await page.locator('.am-task:not([aria-current="true"])').first().hover();
          await assertAxe(page, label);
          await assertCopy(page, url);
          if (studyIndex === 0) await assertSharing(page, url);
          await assertNestedControls(page, slug);
          await page.keyboard.press("Escape");
          await page.locator(openFrame).waitFor({ state: "hidden" });
          await settle(page);
          phase = "restored study";
          assert.equal(await specimen.evaluate(element => element === document.querySelector(".if-specimen") && element.isConnected), true, `${label}: closing preserves the mounted specimen`);
          assert.equal(await appRoots.evaluate(elements => elements.every((element, index) => element.isConnected && element === document.querySelector(".if-specimen").children[index])), true, `${label}: closing preserves each mounted app root`);
          if (vehicleCanvas) assert.equal(await vehicleCanvas.evaluate(element => element === document.querySelector('.ev-scene canvas[data-engine="three"]') && element.isConnected), true, "EV keeps the same WebGL canvas on closing");
          if (slug === "desktop-os") assert.equal(await page.locator('.dos[data-platform="mac"] .dos-window[data-app="editor"]').getByRole("textbox", { name: "Document text" }).inputValue(), draft, "closing preview preserves the unsaved desktop draft");
          assert.equal(await trigger.evaluate(element => document.activeElement === element), true, `${label}: Escape restores the opening button's focus`);
          const restoredScroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
          assert.ok(Math.abs(restoredScroll.x - previousScroll.x) <= 2 && Math.abs(restoredScroll.y - previousScroll.y) <= 2, `${label}: Escape restores study scroll (${JSON.stringify({ previousScroll, restoredScroll })})`);
          assert.equal(await trigger.evaluate(element => Boolean(element.closest("[inert]"))), false, `${label}: exiting removes background inertness`);
          await specimen.dispose(); await appRoots.dispose(); await vehicleCanvas?.dispose();

          phase = "direct short route";
          const shortResponse = await page.goto(url, { waitUntil: "networkidle" });
          assert.ok(shortResponse.ok(), `${label}: short route responds successfully`);
          await page.locator(openFrame).waitFor({ state: "visible" });
          await assertViewport(page, `${label} short route`);
          await assertAxe(page, `${label} short route`);
          await assertCopy(page, url);
          await page.locator(".if-preview-bar").getByRole("button", { name: "Exit fullscreen preview", exact: true }).click();
          await page.locator(openFrame).waitFor({ state: "hidden" });
          await trigger.waitFor({ state: "visible" });
          await trigger.click();
          await page.locator(openFrame).waitFor({ state: "visible" });
          await page.keyboard.press("Escape");
          await page.locator(openFrame).waitFor({ state: "hidden" });
          assert.deepEqual(errors, [], `${label}: preview changes have no uncaught browser errors`);
          console.log(`${label}: ordinary/short routes, mounted state, share URL, keyboard, layout and axe passed`);
        } catch (error) { fail(`${label} ${phase}: ${error.message}`); }
        finally { page.off("pageerror", onError); await page.close(); }
      }
    } finally { await context.close(); }
  }
  console.log(`Interface previews: checked ${studies.length} catalog studies at ${widths.join(" and ")}px`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const failures = [], base = (process.env.SITE_URL || "http://localhost:3016").replace(/\/$/, "");
  const browser = await chromium.launch({
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
    args: ["--enable-unsafe-swiftshader"],
  });
  try {
    await checkInterfacePreviews({ browser, base, fail: message => { failures.push(message); console.error(message); },
      ...(process.env.PREVIEW_WIDTHS ? { widths: process.env.PREVIEW_WIDTHS.split(",").map(Number) } : {}),
      ...(process.env.INTERFACES ? { only: process.env.INTERFACES.split(",") } : {}),
    });
  } finally { await browser.close(); }
  if (failures.length) process.exitCode = 1;
}
