import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright";

const base = (process.env.BASE_URL ?? "http://127.0.0.1:3016").replace(/\/$/, "");
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? chromium.executablePath();

async function openBrowser() {
  return chromium.launch({ headless: true, executablePath });
}

async function openService(page) {
  await page.goto(`${base}/services/`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Local brief worksheet" }).waitFor();
  return page.getByRole("region", { name: "Project files" });
}

async function waitForProjectNotice(tools, pattern) {
  await tools.locator(":scope > p").filter({ hasText: pattern }).waitFor({ timeout: 8_000 });
}

async function waitForAutosave(tools) {
  await waitForProjectNotice(tools, "Unsaved changes");
  await waitForProjectNotice(tools, "Saved in this browser");
}

async function assertDialogFocus(page) {
  const dialog = page.locator("dialog[open]");
  await dialog.waitFor();
  assert.equal(await dialog.evaluate(element => element.contains(document.activeElement)), true, "open dialog must contain focus");
}

function projectUpload(project, name = "project.json") {
  return { name, mimeType: "application/json", buffer: Buffer.from(JSON.stringify(project)) };
}

test("project lifecycle preserves work through imports, conflicts, history, recovery, and deletion", async () => {
  const browser = await openBrowser();
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  try {
    const tools = await openService(page);
    const problem = page.getByLabel("Named problem");
    await problem.fill("Original saved brief");

    const wrongKind = {
      schema: "vlak.project", envelopeVersion: 1, kind: "calendar", documentVersion: 1,
      projectId: "wrong-kind-project", title: "Wrong kind", revision: "wrong-kind-revision",
      createdAt: "2026-09-11T10:00:00.000Z", updatedAt: "2026-09-11T10:00:00.000Z", appVersion: "0.4.0", payload: {},
    };
    await tools.locator('input[type="file"]').setInputFiles(projectUpload(wrongKind, "wrong-kind.json"));
    await waitForProjectNotice(tools, "Open a modernization-brief project");
    assert.equal(await problem.inputValue(), "Original saved brief");

    await tools.getByRole("button", { name: "Save in browser" }).click();
    await waitForProjectNotice(tools, "Saved in this browser");

    const downloadEvent = page.waitForEvent("download");
    await tools.getByRole("button", { name: "Save project file" }).click();
    const download = await downloadEvent;
    const savedPath = await download.path();
    assert(savedPath);
    const exported = JSON.parse(await (await import("node:fs/promises")).readFile(savedPath, "utf8"));
    assert.equal(exported.payload.namedProblem, "Original saved brief");
    assert.match(download.suggestedFilename(), /\.modernization-brief\.json$/);

    const second = await context.newPage();
    const secondTools = await openService(second);
    await secondTools.getByRole("button", { name: "Recent projects" }).click();
    const recent = second.locator("dialog[open]");
    await assertDialogFocus(second);
    await recent.getByRole("button", { name: "Open", exact: true }).click();
    assert.equal(await second.locator("dialog[open]").count(), 1, "opening a saved project must close the browser dialog");
    await assertDialogFocus(second);
    await second.locator("dialog[open]").getByRole("button", { name: "Open project" }).click();
    await second.locator("dialog[open]").waitFor({ state: "hidden" });
    await second.getByLabel("Named problem").waitFor();
    assert.equal(await second.getByLabel("Named problem").inputValue(), "Original saved brief");

    await problem.fill("Saved from tab one");
    await waitForAutosave(tools);
    await second.getByLabel("Named problem").fill("Unsaved work in tab two");
    await waitForProjectNotice(secondTools, "changed in another tab");
    assert.equal(await second.getByLabel("Named problem").inputValue(), "Unsaved work in tab two");
    await secondTools.getByRole("button", { name: "Save a new copy" }).click();
    await waitForAutosave(secondTools);

    await problem.fill("Keep this while inspecting a file");
    await waitForAutosave(tools);
    await tools.locator('input[type="file"]').setInputFiles(projectUpload(exported));
    const confirm = page.locator("dialog[open]");
    await confirm.getByRole("heading", { name: /Open Modernization brief/ }).waitFor();
    await assertDialogFocus(page);
    await confirm.getByRole("button", { name: "Cancel" }).click();
    assert.equal(await problem.inputValue(), "Keep this while inspecting a file");

    await tools.getByRole("button", { name: "Recent projects" }).click();
    const browserDialog = page.locator("dialog[open]");
    const rows = browserDialog.locator(".project-tools-list").first().locator("li");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 3, "opening in tab two preserves its outgoing work as a recovery copy");
    await rows.first().getByRole("button", { name: "History" }).click();
    await browserDialog.getByRole("heading", { name: "Previous revisions" }).waitFor();
    assert(await browserDialog.getByRole("button", { name: "Open copy" }).count() >= 1);

    const recoveryDownload = page.waitForEvent("download");
    await browserDialog.getByRole("button", { name: "Download recovery data" }).click();
    const recoveryPath = await (await recoveryDownload).path();
    assert(recoveryPath);
    const recovery = JSON.parse(await (await import("node:fs/promises")).readFile(recoveryPath, "utf8"));
    assert.equal(recovery.schema, "vlak.project-recovery");
    assert.equal(recovery.projects.length, 3);
    await browserDialog.getByRole("button", { name: "Done" }).click();

    const recoveryWithIssue = { ...recovery, projects: [recovery.projects[0], { broken: true }] };
    await tools.locator('input[type="file"]').setInputFiles(projectUpload(recoveryWithIssue, "recovery.json"));
    const recoveryDialog = page.locator("dialog[open]");
    await recoveryDialog.getByRole("heading", { name: "Recovery projects" }).waitFor();
    await assertDialogFocus(page);
    await recoveryDialog.getByText(/Entry 2:/).waitFor();
    assert.equal(await recoveryDialog.getByRole("button", { name: "Open copy" }).count(), 1);
    await recoveryDialog.getByRole("button", { name: "Done" }).click();
    assert.deepEqual(recoveryWithIssue.projects[1], { broken: true }, "invalid raw recovery entries remain in the caller-owned file data");

    await secondTools.getByRole("button", { name: "Recent projects" }).click();
    const secondBrowser = second.locator("dialog[open]");
    const secondRows = secondBrowser.locator(".project-tools-list").first().locator("li");
    await secondRows.nth(1).waitFor();
    await secondRows.filter({ hasNotText: "(before opening)" }).last().getByRole("button", { name: "Remove" }).click();
    assert.equal(await second.locator("dialog[open]").count(), 1, "remove confirmation must replace the browser dialog");
    await assertDialogFocus(second);
    await second.locator("dialog[open]").getByRole("button", { name: "Remove browser copy" }).click();
    await waitForProjectNotice(secondTools, "Browser copy removed");
    assert.equal(await second.getByLabel("Named problem").inputValue(), "Unsaved work in tab two");

    await secondTools.getByRole("button", { name: "Recent projects" }).click();
    assert.equal(await second.locator("dialog[open] .project-tools-list").first().locator("li").count(), 2);
    await second.locator("dialog[open]").getByRole("button", { name: "Done" }).click();

    await secondTools.locator('input[type="file"]').setInputFiles(projectUpload(exported));
    await assertDialogFocus(second);
    await second.locator("dialog[open]").getByRole("button", { name: "Open project" }).click();
    await second.locator("dialog[open]").waitFor({ state: "hidden" });
    assert.equal(await second.getByLabel("Named problem").inputValue(), "Original saved brief");
    await waitForAutosave(secondTools);
    await second.close();
  } finally {
    await context.close();
    await browser.close();
  }
});

test("replacement requires durable recovery and retains unsaved work when storage fails", async () => {
  const browser = await openBrowser();
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  try {
    const tools = await openService(page);
    const problem = page.getByLabel("Named problem");
    await problem.fill("Unsaved original, never stored in this browser");
    const downloadEvent = page.waitForEvent("download");
    await tools.getByRole("button", { name: "Save project file" }).click();
    const savedPath = await (await downloadEvent).path();
    const project = JSON.parse(await (await import("node:fs/promises")).readFile(savedPath, "utf8"));
    project.title = "Imported brief";
    project.payload.namedProblem = "Replacement from a file";
    await tools.locator('input[type="file"]').setInputFiles(projectUpload(project));
    const dialog = page.locator("dialog[open]");
    await dialog.waitFor();
    await page.evaluate(() => {
      const original = window.indexedDB;
      Object.defineProperty(window, "indexedDB", { value: undefined, configurable: true });
      window.__restoreProjectStorage = () => Object.defineProperty(window, "indexedDB", { value: original, configurable: true });
    });
    await dialog.getByRole("button", { name: "Open project", exact: true }).click();
    await dialog.getByText(/Current work is unchanged/).waitFor();
    assert.equal(await problem.inputValue(), "Unsaved original, never stored in this browser");
    assert.equal(await dialog.isVisible(), true);

    await page.evaluate(() => { window.__restoreProjectStorage(); delete window.__restoreProjectStorage; });
    await dialog.getByRole("button", { name: "Open project", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(await problem.inputValue(), "Replacement from a file");
    await waitForProjectNotice(tools, "Saved in this browser");
    await page.reload({ waitUntil: "networkidle" });
    await tools.getByRole("button", { name: "Recent projects" }).click();
    const saved = page.locator("dialog[open]");
    const recoveryRow = saved.locator(".project-tools-list li").filter({ hasText: "(before opening)" });
    await recoveryRow.getByRole("button", { name: "Open", exact: true }).click();
    await page.locator("dialog[open]").getByRole("button", { name: "Open project", exact: true }).click();
    await page.locator("dialog[open]").waitFor({ state: "hidden" });
    assert.equal(await problem.inputValue(), "Unsaved original, never stored in this browser", "the recovery copy survives a reload and restores all outgoing work");
  } finally {
    await context.close();
    await browser.close();
  }
});

test("project controls fit every wired interface at desktop and 390px", async () => {
  const browser = await openBrowser();
  const routes = ["/interfaces/music/", "/interfaces/graphics/", "/interfaces/calendar/", "/interfaces/microscopy/", "/interfaces/reconciliation/", "/services/"];
  try {
    for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      for (const route of routes) {
        await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
        const tools = page.getByRole("region", { name: "Project files" });
        await tools.getByRole("button", { name: "Open project" }).waitFor();
        const geometry = await tools.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const controls = [...element.querySelectorAll("button")].map(button => button.getBoundingClientRect());
          return {
            left: rect.left, right: rect.right,
            controls: controls.map(control => ({ left: control.left, right: control.right, top: control.top, bottom: control.bottom })),
            viewport: document.documentElement.clientWidth,
          };
        });
        assert(geometry.left >= -1 && geometry.right <= geometry.viewport + 1, `${route} project tools overflow at ${viewport.width}px`);
        for (const control of geometry.controls) assert(control.left >= -1 && control.right <= geometry.viewport + 1, `${route} project button overflows at ${viewport.width}px`);
      }
      await context.close();
    }
  } finally { await browser.close(); }
});
