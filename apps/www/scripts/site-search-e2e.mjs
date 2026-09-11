// SITE_URL=http://localhost:3210 node apps/www/scripts/site-search-e2e.mjs
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const base = (process.env.SITE_URL || "http://localhost:3210").replace(/\/$/, "");
const artifacts = process.env.VLAK_SITE_SEARCH_ARTIFACT_DIR || "/tmp";
mkdirSync(artifacts, { recursive: true });
// Use the Chromium installed for this repository's Playwright version.
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || chromium.executablePath() });
const failures = [];
const pathOf = url => new URL(url).pathname.replace(/\/$/, "") || "/";
const searchDialog = page => page.getByRole("dialog", { name: "Search Vlak", exact: true });
const searchInput = page => searchDialog(page).getByRole("combobox", { name: "Search Vlak", exact: true });
const searchTrigger = page => page.getByRole("button", { name: "Search Vlak", exact: true });
const settled = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

async function activate(page, target) {
  await target.waitFor({ state: "visible" });
  const rect = await target.boundingBox();
  const viewport = page.viewportSize();
  assert(rect && rect.width >= 44 && rect.height >= 44, "The activated control needs a 44px target");
  assert(rect.x >= -1 && rect.y >= -1 && rect.x + rect.width <= viewport.width + 1 && rect.y + rect.height <= viewport.height + 1, "The activated control must be visible without an automatic scroll");
  if (viewport.width <= 640) await page.touchscreen.tap(rect.x + rect.width / 2, rect.y + rect.height / 2);
  else await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
}

async function waitOpen(page) {
  const dialog = searchDialog(page);
  await dialog.waitFor({ state: "visible" });
  assert(await dialog.evaluate(element => element.tagName === "DIALOG" && element.open && element.matches(":modal")), "Search must use a native modal dialog");
  await searchInput(page).waitFor({ state: "visible" });
  await page.waitForFunction(() => document.activeElement?.getAttribute("role") === "combobox" && document.activeElement?.getAttribute("aria-label") === "Search Vlak");
  assert.equal(new URL(page.url()).search, "", "Opening search must not put a query in the URL");
}

async function openSearch(page) {
  await page.locator('button[aria-label="Search Vlak"]:enabled').waitFor({ state: "visible" });
  assert.equal(await searchTrigger(page).count(), 1, "Exactly one visible global search trigger is available");
  await activate(page, searchTrigger(page));
  await waitOpen(page);
}

async function closeSearch(page, method = "escape", focus = searchTrigger(page)) {
  if (method === "button") await activate(page, searchDialog(page).getByRole("button", { name: "Close search", exact: true }));
  else if (method === "backdrop") {
    const bounds = await searchDialog(page).boundingBox();
    assert(bounds.x > 2 || bounds.y > 2, "The backdrop point must be outside the dialog");
    if (page.viewportSize().width <= 640) await page.touchscreen.tap(2, 2);
    else await page.mouse.click(2, 2);
  } else await page.keyboard.press("Escape");
  await searchDialog(page).waitFor({ state: "hidden" });
  await settled(page);
  assert(await focus.evaluate(element => document.activeElement === element), `${method} dismissal must restore the invoking control's focus`);
}

async function headerGeometry(page) {
  const banner = page.getByRole("banner");
  assert.equal(await banner.count(), 1, "The global logo has one banner landmark");
  assert.equal(await banner.locator(".site-logo").count(), 1, "The home link belongs to the global banner");
  assert.equal(await searchTrigger(page).count(), 1, "The navbar must not duplicate its visible search control");
  const result = await page.evaluate(() => {
    const visible = element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== "hidden";
    };
    const buttons = [...document.querySelectorAll('.site-logo, .corner-nav > a, .theme-toggle, .nav-toggle, button[aria-label="Search Vlak"]')].filter(visible);
    const rows = buttons.map(element => {
      const rect = element.getBoundingClientRect();
      return { name: element.getAttribute("aria-label") || element.textContent.trim(), x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
    const overlaps = [];
    for (let first = 0; first < rows.length; first++) for (let second = first + 1; second < rows.length; second++) {
      const a = rows[first], b = rows[second];
      if (Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 1 && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 1) overlaps.push([a.name, b.name]);
    }
    return { rows, overlaps, overflow: document.documentElement.scrollWidth - innerWidth };
  });
  assert.deepEqual(result.overlaps, [], `Navbar controls overlap: ${JSON.stringify(result.rows)}`);
  assert(result.overflow <= 1, "Search must not introduce horizontal page overflow");
  const trigger = result.rows.find(item => item.name === "Search Vlak");
  assert(trigger && trigger.width >= 44 && trigger.height >= 44 && trigger.x >= -1 && trigger.x + trigger.width <= page.viewportSize().width + 1, "Search retains an unobstructed 44px navbar target");
}

async function dialogGeometry(page, theme) {
  const dialog = searchDialog(page);
  const rect = await dialog.boundingBox();
  const { width, height } = page.viewportSize();
  assert(rect.x >= -1 && rect.y >= -1 && rect.x + rect.width <= width + 1 && rect.y + rect.height <= height + 1, "Search dialog fits its viewport");
  const geometry = await dialog.evaluate(element => ({
    overflow: element.scrollWidth - element.clientWidth,
    color: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor,
    controls: [...element.querySelectorAll('input, button, [role="option"]')].filter(control => control.getClientRects().length).map(control => ({ label: control.getAttribute("aria-label") || control.textContent, height: control.getBoundingClientRect().height })),
  }));
  assert(geometry.overflow <= 1, "The search surface must not scroll horizontally");
  assert.notEqual(geometry.background, "rgba(0, 0, 0, 0)", "Search needs an opaque surface");
  assert.notEqual(geometry.color, geometry.background, "Search text remains visible in both schemes");
  assert(geometry.controls.every(control => control.height >= 44), `Search controls need 44px targets: ${JSON.stringify(geometry.controls)}`);
  await page.addScriptTag({ content: axe });
  const violations = await dialog.evaluate(async element => (await window.axe.run(element, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })).violations.map(item => `${item.id}: ${item.nodes.map(node => node.target).join(", ")}`));
  try { assert.deepEqual(violations, [], `${theme} search dialog accessibility`); }
  catch (error) {
    failures.push(`${width}px ${error.message}`);
    console.error(failures.at(-1));
  }
  await page.screenshot({ path: join(artifacts, `vlak-search-${width}-${theme}.png`), animations: "disabled" });
}

async function find(page, query, title) {
  const before = page.url();
  await searchInput(page).fill(query);
  const option = searchDialog(page).getByRole("option", { name: new RegExp(`^${title}(?:\\b|$)`) }).first();
  await option.waitFor({ state: "visible" });
  assert.equal(page.url(), before, "Typing a search must not change the route or URL query");
  assert((await searchDialog(page).getByRole("option").first().textContent()).startsWith(title), `${query} ranks its canonical result first`);
  return option;
}

async function navigateResult(page, query, title, pathname, method = "keyboard") {
  const option = await find(page, query, title);
  const navigation = page.waitForURL(url => pathOf(url) === pathname.replace(/\/$/, ""));
  if (method === "pointer") {
    await option.scrollIntoViewIfNeeded();
    await activate(page, option);
  } else {
    await searchInput(page).press("Home");
    await searchInput(page).press("Enter");
  }
  await navigation;
  await searchDialog(page).waitFor({ state: "hidden" });
  assert.equal(new URL(page.url()).search, "", "Selected results navigate without leaking the search query");
}

async function currentSection(page, label) {
  const desktop = page.getByRole("navigation", { name: "Site", exact: true });
  if (await desktop.isVisible()) assert.equal(await desktop.getByRole("link", { name: label, exact: true }).getAttribute("aria-current"), "page");
  else {
    await activate(page, page.getByRole("button", { name: "Open menu", exact: true }));
    const menu = page.getByRole("navigation", { name: "Site menu", exact: true });
    await menu.waitFor({ state: "visible" });
    assert.equal(await menu.getByRole("link", { name: label, exact: true }).getAttribute("aria-current"), "page");
    assert.equal(await searchTrigger(page).count(), 1, "The open mobile menu must not duplicate global search");
    await activate(page, page.getByRole("button", { name: "Close menu", exact: true }));
  }
}

async function check(name, width, run) {
  const failuresBefore = failures.length;
  const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width <= 640, colorScheme: "light", reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  const errors = [], apiCalls = [];
  page.on("pageerror", error => errors.push(error.message));
  await context.route("**/api/**", route => { apiCalls.push(route.request().url()); return route.abort(); });
  try {
    await run(page);
    assert.deepEqual(errors, [], "Search must not produce page errors");
    assert.deepEqual(apiCalls, [], "The search regression must not make API or model requests");
    if (failures.length === failuresBefore) console.log(`${width}px: ${name} passed`);
  } catch (error) {
    failures.push(`${width}px ${name}: ${error.message}`);
    console.error(failures.at(-1));
    await page.screenshot({ path: join(artifacts, `vlak-search-failure-${width}-${name.replace(/\W+/g, "-")}.png`), animations: "disabled" }).catch(() => {});
  } finally { await context.close(); }
}

try {
  for (const width of [320, 768, 1024]) await check("navbar geometry and first activation", width, async page => {
    await page.goto(`${base}/ai/workflow-canvas/`, { waitUntil: "domcontentloaded" });
    await headerGeometry(page);
    await openSearch(page);
    await closeSearch(page, "button");
    await page.screenshot({ path: join(artifacts, `vlak-search-navbar-${width}.png`), animations: "disabled" });
  });

  for (const width of [390, 1440]) await check("search navigation and focus", width, async page => {
    await page.goto(`${base}/ai/`, { waitUntil: "domcontentloaded" });
    await headerGeometry(page);
    await page.screenshot({ path: join(artifacts, `vlak-search-navbar-${width}.png`), animations: "disabled" });
    await openSearch(page);
    await find(page, "PromptInput", "Message composer");
    await dialogGeometry(page, "light");
    const input = searchInput(page), dialog = searchDialog(page);
    await input.fill("response");
    await page.waitForFunction(() => document.querySelectorAll('dialog[open] [role="option"]').length >= 2);
    const initial = await input.getAttribute("aria-activedescendant");
    await input.press("ArrowDown");
    const next = await input.getAttribute("aria-activedescendant");
    assert(initial && next && next !== initial, "ArrowDown changes the active result");
    assert.equal(await page.locator(`[id="${next}"]`).getAttribute("aria-selected"), "true");
    await input.press("ArrowUp");
    assert.equal(await input.getAttribute("aria-activedescendant"), initial, "ArrowUp returns to the preceding result");
    assert(await input.evaluate(element => element === document.activeElement), "Result arrows retain combobox focus");
    const tabStops = new Set();
    for (const key of ["Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
      await page.keyboard.press(key);
      const focus = await dialog.evaluate(element => ({
        inside: element.contains(document.activeElement),
        // Chromium may expose unfocused BODY while tabbing into browser chrome.
        // hasFocus() differs by browsing context; no page element may match :focus.
        browserChrome: document.activeElement === document.body && document.querySelector(":focus") === null,
        modal: element.matches(":modal"),
        label: document.activeElement?.getAttribute("aria-label"),
      }));
      assert(focus.inside || focus.browserChrome, "Native Tab navigation must never focus background page controls");
      assert(focus.modal, "Search remains a native modal throughout the Tab sequence");
      if (focus.inside) tabStops.add(focus.label);
    }
    assert(tabStops.has("Search Vlak") && tabStops.has("Close search"), "Forward and reverse Tab reach both search controls");
    await searchTrigger(page).evaluate(element => element.focus());
    assert(await dialog.evaluate(element => element.contains(document.activeElement)), "The native modal blocks programmatic focus on its background trigger");
    await input.fill("no-such-vlak-result-349281");
    await dialog.locator(".rs-command-empty").waitFor({ state: "visible" });
    assert.equal(await dialog.getByRole("option").count(), 0);
    assert.equal(await input.getAttribute("aria-activedescendant"), null);
    const emptyUrl = page.url();
    await input.press("Enter");
    assert.equal(page.url(), emptyUrl, "Enter with no results must not navigate");
    await closeSearch(page);

    for (const shortcut of ["Control+k", "Meta+k"]) {
      await searchTrigger(page).focus();
      await page.keyboard.press(shortcut);
      await waitOpen(page);
      await page.keyboard.press(shortcut);
      await searchDialog(page).waitFor({ state: "hidden" });
      await settled(page);
      assert(await searchTrigger(page).evaluate(element => element === document.activeElement), "Closing by shortcut restores focus");
    }
    await searchTrigger(page).focus();
    await page.keyboard.press("/");
    await waitOpen(page);
    await input.fill("slash");
    await input.press("/");
    assert.equal(await input.inputValue(), "slash/", "Typing slash in search must not toggle or clear it");
    await closeSearch(page, "backdrop");
    const catalogInput = page.getByRole("searchbox", { name: "Find a component", exact: true });
    await catalogInput.fill("Button");
    await catalogInput.press("/");
    assert.equal(await catalogInput.inputValue(), "Button/", "Slash in another input remains normal text");
    assert.equal(await searchDialog(page).count(), 0, "Editing another field must not open global search");

    if (width <= 640) {
      await activate(page, page.getByRole("button", { name: "Open menu", exact: true }));
      await openSearch(page);
      assert.equal(await page.locator("#navPanel").getAttribute("data-open"), "false", "Search closes the mobile site menu");
      await closeSearch(page);
      const toc = page.locator(".toc-mobile:not(.toc-mobile-open) > .toc-mobile-trigger");
      await activate(page, toc);
      await page.locator("body > .toc-mobile-open").waitFor({ state: "visible" });
      await openSearch(page);
      await page.locator("body > .toc-mobile-open").waitFor({ state: "detached" });
      await closeSearch(page);
    } else {
      await activate(page, page.getByRole("button", { name: "Appearance", exact: true }));
      await page.getByRole("dialog", { name: "Appearance", exact: true }).waitFor({ state: "visible" });
      await openSearch(page);
      await page.getByRole("dialog", { name: "Appearance", exact: true }).waitFor({ state: "hidden" });
      await closeSearch(page);
    }

    for (const [query, title, pathname, section] of [
      ["PromptInput", "Message composer", "/components/message-composer/", "Components"],
      ["AI workflow", "Workflow canvas", "/ai/workflow-canvas/", "AI"],
      ["theming", "Theming", "/docs/theming/", "Docs"],
      ["microscopy", "Microscopy", "/interfaces/microscopy/", "Interfaces"],
    ]) {
      await openSearch(page);
      await navigateResult(page, query, title, pathname, query === "theming" ? "pointer" : "keyboard");
      await currentSection(page, section);
    }
    await openSearch(page);
    for (const query of ["Calendar", "calendar ", "Calendar"]) {
      await input.fill(query);
      await page.waitForFunction(() => [...document.querySelectorAll('dialog[open] [role="option"]')].filter(element => document.getElementById(element.getAttribute("aria-labelledby"))?.textContent === "Calendar").length === 2);
      const calendars = dialog.getByRole("option", { name: "Calendar", exact: true });
      assert.equal(await calendars.count(), 2, "Calendar component and interface remain separate search results");
      assert.equal(new Set(await calendars.evaluateAll(elements => elements.map(element => element.id))).size, 2, "Duplicate titles retain distinct option identities");
    }
    const calendarInterface = dialog.getByRole("option", { name: "Calendar", exact: true }).filter({ has: page.getByText("Interfaces", { exact: true }) });
    const calendarNavigation = page.waitForURL(url => pathOf(url) === "/interfaces/calendar");
    await calendarInterface.scrollIntoViewIfNeeded();
    await activate(page, calendarInterface);
    await calendarNavigation;
    await dialog.waitFor({ state: "hidden" });
    assert.equal(new URL(page.url()).search, "", "Duplicate-title selection navigates to its own canonical route");
    await currentSection(page, "Interfaces");
    await page.emulateMedia({ colorScheme: "dark" });
    await openSearch(page);
    await find(page, "AI workflow", "Workflow canvas");
    await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");
    await dialogGeometry(page, "dark");
    await closeSearch(page, "button");

    // These existing demos are fixtures for shortcut isolation; wait for their
    // independently loaded example chunks before activating their controls.
    await page.goto(`${base}/components/dialog/`, { waitUntil: "networkidle" });
    await page.getByRole("article").getByRole("button", { name: "Remove item…", exact: true }).click();
    const other = page.getByRole("dialog", { name: "Remove this item?", exact: true });
    await other.waitFor({ state: "visible" });
    await other.getByRole("button", { name: "Keep it", exact: true }).focus();
    for (const shortcut of ["/", "Control+k", "Meta+k"]) {
      await page.keyboard.press(shortcut);
      assert(await other.isVisible(), "A global shortcut must not dismiss another native dialog");
      assert.equal(await searchDialog(page).count(), 0, "Global search must not open over another native dialog");
    }
    await page.keyboard.press("Escape");
    await other.waitFor({ state: "hidden" });

    await page.goto(`${base}/interfaces/documentation/`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Preview fullscreen", exact: true }).click();
    const preview = page.locator('.if-preview-frame[data-preview-open="true"]');
    await preview.waitFor({ state: "visible" });
    const exitPreview = preview.getByRole("button", { name: "Exit fullscreen preview", exact: true });
    await exitPreview.focus();
    for (const shortcut of ["Control+k", "Meta+k", "/"]) {
      await page.keyboard.press(shortcut);
      assert(await preview.isVisible(), "Global shortcuts must preserve the fullscreen interface preview");
      assert.equal(await searchDialog(page).count(), 0, "An inert global search trigger must not open over fullscreen content");
      assert(await preview.evaluate(element => element.contains(document.activeElement)), "Fullscreen content retains keyboard focus");
    }
    await exitPreview.click();
    await preview.waitFor({ state: "hidden" });
  });

  for (const width of [390, 1440]) await check("query round-trip resets active result", width, async page => {
    await page.goto(`${base}/ai/`, { waitUntil: "domcontentloaded" });
    await openSearch(page);
    await find(page, "response", "Response");
    const input = searchInput(page), dialog = searchDialog(page);
    const first = dialog.getByRole("option").first();
    const firstId = await first.getAttribute("id");
    assert.equal(await first.getAttribute("aria-labelledby").then(id => page.locator(`[id="${id}"]`).textContent()), "Response", "The exact Response match is first");
    await input.press("ArrowDown");
    assert.notEqual(await input.getAttribute("aria-activedescendant"), firstId, "A lower result is selected before changing the query");
    await input.press("End");
    await page.keyboard.insertText("zzz");
    await dialog.locator(".rs-command-empty").waitFor({ state: "visible" });
    assert.equal(await dialog.getByRole("option").count(), 0);
    assert.equal(await input.getAttribute("aria-activedescendant"), null);
    for (let index = 0; index < 3; index++) await input.press("Backspace");
    await first.waitFor({ state: "visible" });
    assert.equal(await input.inputValue(), "response");
    assert.equal(await input.getAttribute("aria-activedescendant"), await first.getAttribute("id"), "Returning to an earlier query selects its first ranked result, not the stale lower selection");
    assert.equal(await first.getAttribute("aria-selected"), "true");
    const navigation = page.waitForURL(url => pathOf(url) === "/ai/response");
    await input.press("Enter");
    await navigation;
    await dialog.waitFor({ state: "hidden" });
    assert.equal(new URL(page.url()).search, "", "The round-trip selection opens the canonical result without a query parameter");
  });

  for (const method of ["pointer", "keyboard"]) await check(`index loading failure and ${method} retry`, 390, async page => {
    let release, releaseRetry;
    const gate = new Promise(resolve => { release = resolve; });
    const retryGate = new Promise(resolve => { releaseRetry = resolve; });
    let requests = 0;
    const holdIndex = async route => {
      requests++;
      if (requests === 1) {
        await gate;
        await route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"Search fixture unavailable"}' });
      } else {
        await retryGate;
        await route.continue();
      }
    };
    await page.route("**/search-index.json", holdIndex);
    try {
      await page.goto(`${base}/ai/`, { waitUntil: "domcontentloaded" });
      const requested = page.waitForRequest("**/search-index.json");
      void requested.catch(() => {});
      await openSearch(page);
      await requested;
      await searchDialog(page).getByText(/loading/i).first().waitFor({ state: "visible" });
      assert(await searchDialog(page).getByRole("button", { name: "Close search", exact: true }).isEnabled(), "Loading search remains dismissible");
      release();
      const retry = searchDialog(page).getByRole("button", { name: /retry/i });
      await retry.waitFor({ state: "visible" });
      assert.equal(await searchDialog(page).getByRole("option").count(), 0, "A failed index must not present stale search results");
      const retryRequested = page.waitForRequest("**/search-index.json");
      void retryRequested.catch(() => {});
      if (method === "keyboard") {
        await retry.focus();
        await page.keyboard.press("Enter");
      } else await activate(page, retry);
      await retryRequested;
      await retry.waitFor({ state: "detached" });
      assert(await searchInput(page).evaluate(element => element === document.activeElement), "Retry returns focus to the combobox before its focused button disappears");
      await page.keyboard.type("PromptInput");
      assert.equal(await searchInput(page).inputValue(), "PromptInput", "Typing after Retry reaches the search input while the index is loading");
      releaseRetry();
      await searchDialog(page).getByRole("option", { name: "Message composer", exact: true }).waitFor({ state: "visible" });
      assert(await searchInput(page).evaluate(element => element === document.activeElement), "Successful index recovery preserves combobox focus");
      assert.equal(await searchInput(page).inputValue(), "PromptInput", "Index recovery preserves the draft search query");
      assert(requests >= 2, "Retry requests the index again");
      await closeSearch(page, "button");
    } finally {
      release();
      releaseRetry();
      await page.unroute("**/search-index.json", holdIndex);
    }
  });
} finally { await browser.close(); }

if (failures.length) {
  console.error(`${failures.length} site search failure(s). Screenshots: ${artifacts}`);
  process.exitCode = 1;
} else console.log(`Site search passes native input, keyboard, navigation, focus, responsive geometry, both themes, and index recovery. Screenshots: ${artifacts}`);
