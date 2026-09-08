import assert from "node:assert/strict";

export async function checkDesktopOS({ page, base, fail }) {
  try {
    await page.goto(`${base}/interfaces/desktop-os/`, { waitUntil: "networkidle" });
    const names = {
      mac: { tab: "Mac OS", editor: "SimpleText", terminal: "Terminal", files: "Finder", browser: "Browser", calculator: "Calculator", paint: "Sketch", settings: "Control Panels" },
      windows: { tab: "Windows", editor: "Notepad", terminal: "Command Prompt", files: "My Computer", calculator: "Calculator" },
      linux: { tab: "Linux", editor: "Text Editor", terminal: "Terminal", files: "Files", calculator: "Calculator" },
      beos: { tab: "BeOS", editor: "StyledEdit", terminal: "Terminal", files: "Tracker", calculator: "DeskCalc" },
    };
    const getDesktop = platform => page.locator(`.dos[data-platform="${platform}"]`);
    const launch = async (desktop, name) => {
      await desktop.locator('.dos-apps-trigger:visible').first().click();
      const menu = desktop.getByRole("dialog");
      await menu.getByRole("button", { name, exact: true }).click();
      await menu.waitFor({ state: "hidden" });
    };
    for (const [platform, labels] of Object.entries(names)) {
      await page.getByRole("tab", { name: labels.tab, exact: true }).click();
      const desktop = getDesktop(platform);
      await desktop.waitFor({ state: "visible" });
      const filename = `/Documents/Check-${platform}.txt`;
      const content = `A saved note from ${labels.tab}`;
      const editor = desktop.locator('.dos-window[data-app="editor"][data-front="true"]');
      await editor.getByRole("textbox", { name: "Save file path" }).fill(filename);
      await editor.getByRole("textbox", { name: "Document text" }).fill(content);
      await editor.getByRole("button", { name: "Save", exact: true }).click();
      await launch(desktop, labels.terminal);
      const terminal = desktop.locator('.dos-window[data-app="terminal"][data-front="true"]');
      const run = async command => { await terminal.getByRole("textbox", { name: "Terminal command" }).fill(command); await terminal.getByRole("button", { name: "Run", exact: true }).click(); };
      await run(`cat ${filename}`);
      assert.ok((await terminal.getByRole("log").innerText()).includes(content), `${labels.tab}: terminal reads the editor's saved file`);
      await run('echo "Written in Terminal" > /Documents/From-terminal.txt');
      await terminal.getByRole("button", { name: `Minimize ${labels.terminal}`, exact: true }).click();
      assert.equal(await terminal.isVisible(), false, "minimized window leaves the active workspace");
      await launch(desktop, labels.terminal);
      assert.ok((await terminal.getByRole("log").innerText()).includes(content), "restored app retains its output");
      await launch(desktop, labels.files);
      const finder = desktop.locator('.dos-window[data-app="files"][data-front="true"]');
      const row = finder.locator('.dos-file-row').filter({ hasText: /^Documents/ });
      await row.click(); await finder.getByRole("button", { name: "Open", exact: true }).click();
      const file = finder.locator('.dos-file-row').filter({ hasText: /^From-terminal.txt/ });
      await file.click(); await finder.getByRole("button", { name: "Open", exact: true }).click();
      const opened = desktop.locator('.dos-window[data-app="editor"][data-front="true"]');
      assert.equal(await opened.getByRole("textbox", { name: "Document text" }).inputValue(), "Written in Terminal\n", "file manager opens terminal output in editor");
      await launch(desktop, labels.calculator);
      const calculator = desktop.locator('.dos-window[data-app="calculator"][data-front="true"]');
      await calculator.getByRole("textbox", { name: "Calculation" }).fill("(24 + 6) / 3");
      await calculator.getByRole("textbox", { name: "Calculation" }).press("Enter");
      assert.equal(await calculator.locator("output").innerText(), "10");
      if (await desktop.getAttribute("data-compact") === "true") {
        assert.equal(await desktop.locator('.dos-window:visible').count(), 1, "compact desktop shows one focused application");
        const [stage, window] = await Promise.all([desktop.locator('.dos-stage').boundingBox(), calculator.boundingBox()]);
        assert.ok(Math.abs(stage.width - window.width) < 2, "compact app uses full stage width");
      } else {
        const title = calculator.getByRole("button", { name: `Move ${labels.calculator}`, exact: true });
        await title.focus();
        const before = await calculator.boundingBox();
        await title.press("ArrowLeft");
        const after = await calculator.boundingBox();
        assert.ok(after.x < before.x, "window moves using the keyboard");
        await calculator.getByRole("button", { name: `Maximize ${labels.calculator}`, exact: true }).click();
        assert.equal(await calculator.getAttribute("data-maximized"), "true");
        await calculator.getByRole("button", { name: `Restore size of ${labels.calculator}`, exact: true }).click();
      }
      await calculator.getByRole("button", { name: `Close ${labels.calculator}`, exact: true }).click();
    }
    await page.reload({ waitUntil: "networkidle" });
    for (const [platform, labels] of Object.entries(names)) {
      await page.getByRole("tab", { name: labels.tab, exact: true }).click();
      const desktop = getDesktop(platform);
      await launch(desktop, labels.terminal);
      const terminal = desktop.locator('.dos-window[data-app="terminal"][data-front="true"]');
      await terminal.getByRole("textbox", { name: "Terminal command" }).fill(`cat /Documents/Check-${platform}.txt`);
      await terminal.getByRole("button", { name: "Run", exact: true }).click();
      assert.ok((await terminal.getByRole("log").innerText()).includes(`A saved note from ${labels.tab}`), `${labels.tab}: file persists through reload`);
    }
    const stored = await page.evaluate(() => Object.fromEntries(["mac","windows","linux","beos"].map(platform => [platform, JSON.parse(localStorage.getItem(`vlak-desktop-os-${platform}-v1`)).files])));
    for (const platform of Object.keys(stored)) {
      assert.equal(stored[platform].filter(file => file.path.startsWith('/Documents/Check-')).length, 1, "platform files stay independent");
    }
    await page.getByRole("tab", { name: "Mac OS", exact: true }).click();
    const mac = getDesktop("mac");
    await launch(mac, "Browser");
    const browser = mac.locator('.dos-window[data-app="browser"][data-front="true"]');
    await browser.getByRole("button", { name: "Getting started", exact: true }).first().click();
    await browser.locator('article pre').filter({ hasText: "Vlak" }).waitFor();
    await browser.getByRole("button", { name: "Back", exact: true }).click();
    await browser.getByRole("heading", { name: "Room to make things." }).waitFor();
    // App drawer keyboard handling and focus return remain usable after many window changes.
    const trigger = mac.locator('.dos-apps-trigger:visible').first();
    await trigger.click();
    await mac.getByRole("dialog").getByRole("searchbox", { name: "Find an app" }).fill("nothing matches");
    assert.ok((await mac.getByRole("dialog").innerText()).includes("No apps match"));
    await page.keyboard.press("Escape");
    const opener = await trigger.elementHandle();
    await page.waitForFunction(element => element === document.activeElement, opener);
    await opener.dispose();
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true, "Escape restores the application menu opener after its closing render");
    console.log(`${page.viewportSize().width}px Desktop OS: four platforms share working app files, preserve independent storage, and support window controls`);
  } catch (error) { fail(`Desktop OS: ${error.message}`); }
}
