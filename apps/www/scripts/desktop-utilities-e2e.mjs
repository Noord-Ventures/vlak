import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Exercise actual controls, canvas pixels, downloads and persisted files. The
// deterministic mine board is learned from a lost game, without reading state.
export async function checkDesktopUtilities({ page, base, fail }) {
  const width = page.viewportSize().width;
  if (![320, 390, 1440].includes(width)) return;
  let stage = "launch", restoreRandom = false;
  const errors = [], onError = error => errors.push(error.message);
  page.on("pageerror", onError);
  try {
    await page.goto(`${base}/interfaces/desktop-os/`, { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: "Mac OS", exact: true }).click();
    const desktop = page.locator('.dos[data-platform="mac"]');
    const launch = async (name, app) => {
      await desktop.locator(".dos-apps-trigger:visible").first().click();
      const menu = desktop.getByRole("dialog");
      await menu.getByRole("button", { name, exact: true }).click();
      await menu.waitFor({ state: "hidden" });
      const window = desktop.locator(`.dos-window[data-app="${app}"][data-front="true"]`);
      await window.waitFor({ state: "visible" });
      return window;
    };
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem("vlak-desktop-os-mac-v1")));

    if (width === 320) {
      await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
      for (const [name, app] of [["Sketch", "paint"], ["Calendar", "calendar"], ["Control Panels", "settings"], ["Process Viewer", "monitor"], ["Mines", "mines"]]) {
        stage = `${name} compact accessibility`;
        const window = await launch(name, app);
        const violations = await window.evaluate(async element => (await window.axe.run(element, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
          rules: { region: { enabled: false } },
        })).violations.map(item => `${item.id}: ${item.nodes.map(node => node.target).join(", ")}`));
        assert.deepEqual(violations, [], `${name}: compact app passes axe`);
        const overflow = await window.evaluate(element => ({ scroll: element.scrollWidth, client: element.clientWidth }));
        assert.ok(overflow.scroll <= overflow.client + 1, `${name}: no sideways app overflow`);
        if (app === "calendar") assert.equal(await window.locator(".dos-calendar-month").evaluate(element => getComputedStyle(element).display), "flex", "compact calendar uses a readable agenda");
        if (app === "mines") {
          const sizes = await window.locator(".dos-mine-cell").evaluateAll(elements => elements.map(element => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })));
          assert.ok(sizes.every(size => size.width >= 44 && size.height >= 44), "compact mine targets are at least 44px");
        }
      }
      assert.deepEqual(errors, [], "utilities have no uncaught browser errors");
      console.log("320px Desktop utilities: all five apps pass axe and compact layout checks");
      return;
    }

    stage = "Paint";
    let paint = await launch("Sketch", "paint"), canvas = paint.locator("canvas");
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    const pixel = (x, y) => canvas.evaluate((element, coordinates) => Array.from(element.getContext("2d").getImageData(...coordinates, 1, 1).data), [x, y]);
    assert.deepEqual(await pixel(140, 140), [250, 250, 250, 255], "drawing starts as empty paper");
    await page.mouse.move(box.x + box.width * 100 / 720, box.y + box.height * 140 / 480);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 200 / 720, box.y + box.height * 140 / 480, { steps: 8 });
    await page.mouse.up();
    assert.equal((await pixel(140, 140))[0], 32, "pointer movement draws actual ink");
    await paint.getByRole("button", { name: "Undo", exact: true }).click();
    assert.equal((await pixel(140, 140))[0], 250, "undo restores pixels");
    await canvas.focus(); await canvas.press("Space");
    assert.equal((await pixel(200, 140))[0], 32, "keyboard Space makes a mark");
    await paint.getByRole("button", { name: "Clear", exact: true }).click();
    assert.equal((await pixel(200, 140))[0], 250, "clear empties the drawing");
    await paint.getByRole("button", { name: "Undo", exact: true }).click();
    assert.equal((await pixel(200, 140))[0], 32, "clear can be undone");
    await paint.getByRole("button", { name: "Eraser", exact: true }).click();
    await canvas.focus(); await canvas.press("Space");
    assert.equal((await pixel(200, 140))[0], 250, "eraser removes ink");
    await paint.getByRole("button", { name: "Undo", exact: true }).click();
    await paint.getByRole("textbox", { name: "Drawing file name" }).fill("Utility-check.png");
    await paint.getByRole("button", { name: "Save", exact: true }).click();
    assert.ok((await saved()).files.find(file => file.path === "/Pictures/Utility-check.png").content.startsWith("data:image/png;base64,"), "save stores a PNG in Pictures");
    const downloadReady = page.waitForEvent("download");
    await paint.getByRole("button", { name: "Export PNG", exact: true }).click();
    assert.equal((await downloadReady).suggestedFilename(), "Utility-check.png", "export downloads the named PNG");
    const finder = await launch("Finder", "files");
    await finder.locator(".dos-file-row").filter({ hasText: /^Pictures/ }).click();
    await finder.getByRole("button", { name: "Open", exact: true }).click();
    await finder.locator(".dos-file-row").filter({ hasText: /^Utility-check.png/ }).click();
    await finder.getByRole("button", { name: "Open", exact: true }).click();
    paint = desktop.locator('.dos-window[data-app="paint"][data-front="true"]'); canvas = paint.locator("canvas");
    await paint.getByRole("status").filter({ hasText: "Opened Utility-check.png" }).waitFor();
    assert.equal((await pixel(200, 140))[0], 32, "opening the saved drawing restores its actual pixels");

    stage = "Calendar";
    const calendar = await launch("Calendar", "calendar");
    await calendar.getByRole("textbox", { name: "Day note" }).fill("A real calendar note");
    await calendar.getByRole("button", { name: "Save note", exact: true }).click();
    assert.ok((await saved()).files.some(file => /^\/Documents\/Calendar\/\d{4}-\d{2}-\d{2}\.txt$/.test(file.path) && file.content === "A real calendar note"), "calendar saves a real date-named text file");
    await calendar.getByRole("button", { name: "Next month", exact: true }).click();
    await calendar.getByRole("button", { name: "Today", exact: true }).click();
    assert.equal(await calendar.getByRole("textbox", { name: "Day note" }).inputValue(), "A real calendar note", "returning to the day restores its saved note");
    assert.equal(await calendar.locator(".dos-calendar-month").evaluate(element => getComputedStyle(element).display), width < 400 ? "flex" : "grid", "calendar switches between agenda and month grid");

    stage = "Settings";
    const settings = await launch("Control Panels", "settings");
    await settings.getByRole("button", { name: "Stripes", exact: true }).click();
    assert.equal((await saved()).preferences.wallpaper, "stripes", "wallpaper changes shared preferences");
    const sound = settings.getByRole("switch", { name: "Desktop sounds" });
    if (await sound.getAttribute("aria-checked") !== "true") await sound.click();
    const slider = settings.getByRole("slider", { name: "Volume" });
    await slider.focus(); await slider.press("Home"); await slider.press("ArrowRight");
    assert.equal((await saved()).preferences.volume, 1, "keyboard volume changes shared preferences");
    await settings.getByRole("button", { name: "Play test tone", exact: true }).click();
    await settings.getByRole("status").filter({ hasText: "Test tone played" }).waitFor();

    stage = "Monitor";
    const monitor = await launch("Process Viewer", "monitor"), rows = monitor.locator(".dos-task-row");
    const before = await rows.count();
    assert.equal(before, await desktop.locator(".dos-window").count(), "monitor lists the actual open windows");
    await rows.filter({ hasText: "Calendar" }).getByRole("button", { name: "Close Calendar", exact: true }).click();
    assert.equal(await rows.count(), before - 1, "end task removes the real window and its process row");
    assert.equal(await desktop.locator('.dos-window[data-app="calendar"]').count(), 0);

    stage = "Mines";
    const mines = await launch("Mines", "mines"), squares = mines.locator(".dos-mine-cell");
    await page.evaluate(() => { window.__desktopUtilityRandom = Math.random; Math.random = () => .37; });
    restoreRandom = true;
    await squares.first().click();
    assert.equal(await mines.locator('.dos-mine-cell[data-state="mine"]').count(), 0, "first move never loses");
    assert.ok(await mines.locator('.dos-mine-cell[data-state="open"]').count() > 1, "empty cells flood open");
    await mines.getByRole("button", { name: "Flag mode", exact: true }).click();
    await mines.locator('.dos-mine-cell[data-state="covered"]').first().click();
    assert.equal(await mines.locator('.dos-mine-cell[data-state="flag"]').count(), 1, "flag mode marks a covered square");
    await mines.locator('.dos-mine-cell[data-state="flag"]').press("f");
    assert.equal(await mines.locator('.dos-mine-cell[data-state="flag"]').count(), 0, "F removes a flag");
    await mines.getByRole("button", { name: "Flag mode", exact: true }).click();
    for (let index = 0; index < 25; index++) {
      if (await squares.nth(index).getAttribute("data-state") === "covered") await squares.nth(index).click();
      if ((await mines.getByRole("status").innerText()).includes("A mine was uncovered")) break;
    }
    assert.ok((await mines.getByRole("status").innerText()).includes("A mine was uncovered"), "uncovering a mine ends the game");
    const planted = await squares.evaluateAll(elements => elements.flatMap((element, index) => element.dataset.state === "mine" ? [index] : []));
    assert.equal(planted.length, 5, "losing exposes exactly five mines");
    await mines.getByRole("button", { name: "New game", exact: true }).click();
    assert.equal(await mines.locator('.dos-mine-cell[data-state="covered"]').count(), 25, "restart resets every square");
    await squares.first().click();
    for (let index = 0; index < 25; index++) if (!planted.includes(index) && await squares.nth(index).getAttribute("data-state") === "covered") await squares.nth(index).click();
    assert.ok((await mines.getByRole("status").innerText()).includes("Field cleared"), "revealing every safe square wins");
    assert.equal(await mines.locator('.dos-mine-cell[data-state="flag"]').count(), 5, "winning flags the remaining mines");
    assert.deepEqual(errors, [], "utilities have no uncaught browser errors");
    console.log(`${width}px Desktop utilities: drawing, files, calendar, shared preferences, process controls and mine game pass`);
  } catch (error) {
    fail(`Desktop utilities ${width}px ${stage}: ${error.message}`);
  } finally {
    page.off("pageerror", onError);
    if (restoreRandom) await page.evaluate(() => { Math.random = window.__desktopUtilityRandom; delete window.__desktopUtilityRandom; }).catch(() => {});
  }
}
