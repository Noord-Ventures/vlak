import assert from "node:assert/strict";

const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1, `${message}: ${actual} ≠ ${expected}`);
const focusReturns = async (page, locator) => {
  const element = await locator.elementHandle();
  await page.waitForFunction(target => document.activeElement === target, element);
  await element.dispose();
};
const checkShortcutPlacement = async (desktop, mode) => {
  const placement = await desktop.locator(".dos-stage").evaluate(stage => {
    const group = stage.querySelector(".dos-desktop-icons");
    return {
      leftOffset: group.getBoundingClientRect().left - stage.getBoundingClientRect().left,
      icons: [...group.querySelectorAll(".dos-shortcut")].map(element => {
        const icon = element.querySelector("svg").getBoundingClientRect();
        const label = element.querySelector("span").getBoundingClientRect();
        const button = element.getBoundingClientRect();
        return { iconCenter: icon.left + icon.width / 2, textCenter: label.left + label.width / 2, tileCenter: button.left + button.width / 2, textAlign: getComputedStyle(element).textAlign, width: button.width, height: button.height };
      }),
    };
  });
  near(placement.leftOffset, 8, `${mode}: shortcut group stays at the desktop's left edge`);
  assert.ok(placement.icons.length >= 4, "Mac keeps working desktop shortcuts");
  for (const icon of placement.icons) {
    near(icon.iconCenter, icon.tileCenter, `${mode}: shortcut icon is centered within its tile`);
    near(icon.textCenter, icon.tileCenter, `${mode}: shortcut caption is centered within its tile`);
    assert.equal(icon.textAlign, "center");
    assert.ok(icon.width >= 44 && icon.height >= 44, "Shortcut retains a full touch target");
  }
};

export async function checkDesktopMacChrome({ page, base, fail }) {
  try {
    await page.goto(`${base}/interfaces/desktop-os/`, { waitUntil: "networkidle" });
    const desktop = page.locator('.dos[data-platform="mac"]');
    const compact = await desktop.getAttribute("data-compact") === "true";
    const dock = desktop.getByRole("group", { name: "Dock", exact: true });
    const terminal = desktop.locator('.dos-window[data-app="terminal"]');
    const terminalInput = terminal.getByRole("textbox", { name: "Terminal command" });
    const terminalDock = dock.locator('.dos-mac-dock-app[data-app="terminal"]');
    const systemTrigger = desktop.locator('.dos-mac-menu-trigger[data-menu="system"]');
    const marker = "Mac dock state survives restore";
    if (compact) {
      assert.equal(await dock.isVisible(), false, "Compact Mac hides the desktop dock");
      assert.equal(await desktop.locator(".dos-desktop-icons").isVisible(), false, "Compact Mac hides desktop shortcuts");
      const apps = desktop.locator(".dos-taskbar .dos-apps-trigger");
      const tasks = desktop.locator(".dos-mobile-tasks");
      assert.ok(await apps.isVisible() && await tasks.isVisible(), "Compact Mac keeps Apps and Tasks reachable");
      await systemTrigger.focus();
      await systemTrigger.press("ArrowDown");
      const systemMenu = desktop.getByRole("menu", { name: "Mac OS", exact: true });
      await systemMenu.waitFor({ state: "visible" });
      await page.keyboard.press("End");
      await focusReturns(page, systemMenu.getByRole("menuitem").last());
      await page.keyboard.press("Home");
      await focusReturns(page, systemMenu.getByRole("menuitem").first());
      await page.keyboard.press("c");
      await focusReturns(page, systemMenu.getByRole("menuitem", { name: "Control Panels", exact: true }));
      await page.keyboard.press("Enter");
      await systemMenu.waitFor({ state: "hidden" });
      await desktop.locator('.dos-window[data-app="settings"][data-front="true"]').waitFor({ state: "visible" });
      await apps.click();
      await desktop.getByRole("dialog").getByRole("button", { name: "Terminal", exact: true }).click();
    } else {
      await dock.waitFor({ state: "visible" });
      await checkShortcutPlacement(desktop, "Embedded view");
      assert.equal(await desktop.locator(".dos-taskbar").isVisible(), false, "Desktop Mac uses the dock below its workspace");
      await terminalDock.click();
      assert.equal(await terminalDock.getAttribute("data-running"), "true", "Dock marks a newly launched app as running");
      assert.equal(await terminalDock.getAttribute("aria-pressed"), "true", "Dock marks the front application");
    }
    await terminalInput.fill(`echo ${marker}`);
    await terminal.getByRole("button", { name: "Run", exact: true }).click();
    await terminal.getByRole("button", { name: "Minimize Terminal", exact: true }).click();
    await terminal.waitFor({ state: "hidden" });
    if (compact) {
      await desktop.locator(".dos-mobile-tasks").click();
      await desktop.getByRole("dialog").locator(".dos-running-app").filter({ hasText: "Terminal" }).click();
    } else {
      assert.equal(await terminalDock.getAttribute("data-running"), "true", "Minimized applications retain their running indicator");
      assert.equal(await terminalDock.getAttribute("aria-pressed"), "false", "Minimized application is not active");
      assert.equal(await terminalDock.getAttribute("aria-label"), "Restore Terminal");
      await terminalDock.click();
      assert.equal(await terminal.count(), 1, "Dock restores the existing window without launching a duplicate");
      assert.equal(await terminalDock.getAttribute("aria-pressed"), "true");
      await terminal.getByRole("button", { name: "Maximize Terminal", exact: true }).click();
      const [windowBox, dockBox, stageBox] = await Promise.all([terminal.boundingBox(), dock.boundingBox(), desktop.locator(".dos-stage").boundingBox()]);
      assert.ok(windowBox.y + windowBox.height <= dockBox.y + 1, "Maximized windows leave the dock reachable");
      near(windowBox.height, stageBox.height, "Maximized window fills the available stage");
      await terminal.getByRole("button", { name: "Restore size of Terminal", exact: true }).click();
    }
    assert.ok((await terminal.getByRole("log").innerText()).includes(marker), "Restored Terminal retains its actual application state");

    const fileTrigger = desktop.locator('.dos-mac-menu-trigger[data-menu="file"]');
    const fileMenu = desktop.getByRole("menu", { name: "File", exact: true });
    const windowMenu = desktop.getByRole("menu", { name: "Window", exact: true });
    if (!compact) {
      await fileTrigger.focus();
      await fileTrigger.press("ArrowDown");
      await fileMenu.waitFor({ state: "visible" });
      const [triggerBox, menuBox, desktopBox] = await Promise.all([fileTrigger.boundingBox(), fileMenu.boundingBox(), desktop.boundingBox()]);
      near(menuBox.x, triggerBox.x, "File menu is anchored to its trigger");
      near(menuBox.y, triggerBox.y + triggerBox.height, "File menu opens immediately below the menu bar");
      assert.ok(menuBox.width < desktopBox.width / 2, "Traditional menu remains a dropdown");
      assert.equal(await desktop.getByRole("dialog").count(), 0, "Menu-bar dropdowns do not open the application drawer");
      if (page.viewportSize().width === 1440) await desktop.screenshot({ path: "/tmp/vlak-desktop-mac-menu-1440.png" });
      const items = fileMenu.getByRole("menuitem");
      await focusReturns(page, items.first());
      await page.keyboard.press("End");
      await focusReturns(page, items.last());
      await page.keyboard.press("Home");
      await focusReturns(page, items.first());
      await page.keyboard.press("ArrowDown");
      await focusReturns(page, items.nth(1));
      await page.keyboard.press("ArrowRight");
      await windowMenu.waitFor({ state: "visible" });
      await fileMenu.waitFor({ state: "hidden" });
      await fileTrigger.hover();
      await fileMenu.waitFor({ state: "visible" });
      await windowMenu.waitFor({ state: "hidden" });
      await page.keyboard.press("Escape");
      await fileMenu.waitFor({ state: "hidden" });
      await focusReturns(page, fileTrigger);
      await fileTrigger.click();
      await fileMenu.getByRole("menuitem", { name: "Open Documents", exact: true }).click();
      await desktop.locator('.dos-window[data-app="files"][data-front="true"]').getByRole("group", { name: "Files in /Documents", exact: true }).waitFor();
      await fileTrigger.click();
      await desktop.locator(".dos-status").click();
      await fileMenu.waitFor({ state: "hidden" });
      assert.equal(await fileTrigger.getAttribute("aria-expanded"), "false", "Outside click dismisses the dropdown");
      await fileTrigger.focus();
      await fileTrigger.press("ArrowDown");
      await fileMenu.waitFor({ state: "visible" });
      await page.keyboard.press("Tab");
      await fileMenu.waitFor({ state: "hidden" });
      assert.equal(await fileTrigger.evaluate(element => document.activeElement === element), false, "Tab exits the menu instead of trapping focus on its trigger");
      await terminalDock.click();
    }

    // Fullscreen changes available space without replacing the live workspace.
    await terminalInput.fill("echo Preview keeps this command");
    const preview = page.getByRole("button", { name: "Preview fullscreen", exact: true });
    await preview.click();
    await page.locator('.if-preview-frame[data-preview-open="true"]').waitFor();
    assert.equal(await terminalInput.inputValue(), "echo Preview keeps this command");
    const previewCompact = await desktop.getAttribute("data-compact") === "true";
    if (!previewCompact) await checkShortcutPlacement(desktop, "Fullscreen preview");
    const previewMenuTrigger = previewCompact ? systemTrigger : fileTrigger;
    const previewMenu = desktop.getByRole("menu", { name: previewCompact ? "Mac OS" : "File", exact: true });
    await previewMenuTrigger.click();
    await previewMenu.waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    await previewMenu.waitFor({ state: "hidden" });
    assert.equal(await page.locator(".if-preview-frame").getAttribute("data-preview-open"), "true", "First Escape dismisses the Mac menu without exiting preview");
    await focusReturns(page, previewMenuTrigger);
    await page.getByRole("button", { name: "Exit fullscreen preview", exact: true }).click();
    await focusReturns(page, preview);
    assert.equal(await terminalInput.inputValue(), "echo Preview keeps this command", "Preview preserves the live app on exit");

    for (const [platform, tab] of [["windows", "Windows"], ["linux", "Linux"], ["beos", "BeOS"]]) {
      await page.getByRole("tab", { name: tab, exact: true }).click();
      const other = page.locator(`.dos[data-platform="${platform}"]`);
      assert.equal(await other.locator(".dos-mac-dock, .dos-mac-menus").count(), 0, `${tab} keeps its own desktop chrome`);
      assert.ok(await other.locator(".dos-taskbar").isVisible(), `${tab} retains its taskbar`);
      const opener = other.locator(".dos-apps-trigger:visible").first();
      await opener.click();
      await other.getByRole("dialog").waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
      await focusReturns(page, opener);
    }
    await page.getByRole("tab", { name: "Mac OS", exact: true }).click();
    assert.equal(await terminalInput.inputValue(), "echo Preview keeps this command", "OS tab changes retain Mac application state");
    console.log(`${page.viewportSize().width}px Mac chrome: shortcuts at the desktop's left edge with centered icons and captions, dock or compact tasks, launch/restore, traditional menu keyboard and dismissal, app state and preview preservation`);
  } catch (error) { fail(`Mac desktop chrome: ${error.message}`); }
}
