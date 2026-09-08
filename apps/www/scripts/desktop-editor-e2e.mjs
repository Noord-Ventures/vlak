import assert from "node:assert/strict";

export async function checkDesktopEditor({ page, base, fail }) {
  try {
    await page.goto(`${base}/interfaces/desktop-os/`, { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: "Mac OS", exact: true }).click();
    const desktop = page.locator('.dos[data-platform="mac"]');
    const copyPath = "/Documents/Editor-copy-regression.txt";
    const copyName = "Editor-copy-regression.txt";
    const launch = async name => {
      await desktop.locator(".dos-apps-trigger:visible").first().click();
      await desktop.getByRole("dialog").getByRole("button", { name, exact: true }).click();
    };
    const switchTo = async name => {
      if (await desktop.getAttribute("data-compact") === "true") {
        await desktop.locator(".dos-mobile-tasks").click();
        await desktop.getByRole("dialog").locator(".dos-running-app").filter({ hasText: name }).click();
      } else await desktop.getByRole("button", { name: `Switch to ${name}`, exact: true }).click();
    };
    const editor = desktop.locator('.dos-window[data-app="editor"][data-front="true"]');
    await editor.getByRole("textbox", { name: "Save file path" }).fill(copyPath);
    await editor.getByRole("button", { name: "Save", exact: true }).click();
    await editor.getByRole("button", { name: `Close ${copyName}`, exact: true }).waitFor();
    await launch("Terminal");
    const terminal = desktop.locator('.dos-window[data-app="terminal"][data-front="true"]');
    const run = async command => {
      await terminal.getByRole("textbox", { name: "Terminal command" }).fill(command);
      await terminal.getByRole("button", { name: "Run", exact: true }).click();
    };
    await run(`echo updated-copy > ${copyPath}`);
    await switchTo(copyName);
    assert.equal(await editor.getByRole("textbox", { name: "Document text" }).inputValue(), "updated-copy\n", "Save As follows external edits to the copied file");
    assert.equal(await editor.getByRole("textbox", { name: "Save file path" }).inputValue(), copyPath, "Save As updates the document identity");
    await switchTo("Terminal");
    await run("echo changed-original > /Documents/Welcome.txt");
    await switchTo(copyName);
    assert.equal(await editor.getByRole("textbox", { name: "Document text" }).inputValue(), "updated-copy\n", "editing the original does not replace the copied document");
    await editor.getByRole("textbox", { name: "Document text" }).fill("A draft belonging to the copy");
    await editor.getByRole("button", { name: `Close ${copyName}`, exact: true }).click();
    await launch("Finder");
    const finder = desktop.locator('.dos-window[data-app="files"][data-front="true"]');
    await finder.locator(".dos-file-row").filter({ hasText: /^Documents/ }).click();
    await finder.getByRole("button", { name: "Open", exact: true }).click();
    await finder.locator(".dos-file-row").filter({ hasText: copyName }).click();
    await finder.getByRole("button", { name: "Open", exact: true }).click();
    assert.equal(await editor.getByRole("textbox", { name: "Document text" }).inputValue(), "A draft belonging to the copy", "reopening the copied file restores its own draft");
    assert.equal(await editor.getByRole("textbox", { name: "Save file path" }).inputValue(), copyPath);
    const previewTrigger = page.getByRole("button", { name: "Preview fullscreen", exact: true });
    await previewTrigger.click();
    await page.locator('.if-preview-frame[data-preview-open="true"]').waitFor();
    // Two actions in one frame reproduce the app's late focus overriding preview exit.
    await page.evaluate(name => {
      document.querySelector(`.dos-mac button[aria-label="Close ${name}"]`).click();
      document.querySelector('button[aria-label="Exit fullscreen preview"]').click();
    }, copyName);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.locator('.if-preview-frame').getAttribute("data-preview-open"), "false");
    assert.equal(await previewTrigger.evaluate(element => document.activeElement === element), true, "late app focus must not replace preview exit focus");
    await previewTrigger.click();
    await desktop.locator(".dos-apps-trigger:visible").first().click();
    await page.evaluate(() => {
      document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      document.querySelector('button[aria-label="Exit fullscreen preview"]').click();
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await previewTrigger.evaluate(element => document.activeElement === element), true, "late menu focus must not replace preview exit focus");
    console.log(`${page.viewportSize().width}px Desktop editor: Save As identity, terminal sync, original independence, draft recovery and preview focus`);
  } catch (error) { fail(`Desktop editor: ${error.message}`); }
}
