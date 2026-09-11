// Focused browser checks for the reconciliation workspace and distribution pages.
// Run from apps/www with: node scripts/reconciliation-e2e.mjs
// BASE_URL may point at an exported deployment as well as the local dev server.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const base = (process.env.BASE_URL ?? "http://localhost:3016").replace(/\/$/, "");
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
  ? { headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
  : { headless: true });

const csvA = Buffer.from("id,name,status\n1,Alpha,ready\n2,Beta,hold\n3,Gamma,ready\n4,,blank\n5,Dup,one\n5,Dup,two\n");
const csvB = Buffer.from("id,name,status\n1,Alpha,ready\n2,Beta,changed\n4,,blank\n5,Dup,one\n5,Dup,two\n6,Delta,new\n");
const file = (name, buffer) => ({ name, mimeType: "text/csv", buffer });
const downloadBuffer = async (download) => {
  const stream = await download.createReadStream();
  if (stream) {
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
  }
  const path = await download.path();
  assert.ok(path, "download must have readable content");
  return readFileSync(path);
};
const waitForComparison = async (page) => {
  await page.getByText(/Exact comparison complete|comparison complete/i).waitFor({ state: "visible", timeout: 10_000 });
};
async function chooseOption(page, combo, label) {
  const current = await combo.getAttribute("aria-valuetext");
  if (current === label) return;
  await combo.click();
  const option = page.getByRole("option", { name: label, exact: true });
  await option.waitFor({ state: "visible" });
  await option.click();
}

async function checkReconciliation() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${base}/interfaces/reconciliation/`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("main").count(), 1, "reconciliation must render one main landmark");
  assert.equal(errors.length, 0, `reconciliation console errors: ${errors.join("; ")}`);

  const sourceInputs = page.locator(".rc-source input[type=file]");
  assert.equal(await sourceInputs.count(), 2, "each source card must own one CSV input");
  await sourceInputs.nth(0).setInputFiles(file("source-a.csv", csvA));
  await page.getByText(/parsed locally/i).first().waitFor({ state: "visible", timeout: 10_000 });
  await sourceInputs.nth(1).setInputFiles(file("source-b.csv", csvB));
  await page.getByText(/parsed locally/i).last().waitFor({ state: "visible", timeout: 10_000 });

  const combos = page.getByRole("combobox");
  assert.ok(await combos.count() >= 2, "source key selectors must be accessible comboboxes");
  await chooseOption(page, combos.nth(0), "id");
  await chooseOption(page, combos.nth(1), "id");
  await page.getByRole("button", { name: "Compare exact keys", exact: true }).click();
  await waitForComparison(page);
  for (const category of ["Matched", "Missing", "Conflicting", "Ambiguous"]) {
    assert.ok(await page.getByRole("button", { name: new RegExp(category, "i") }).count(), `${category} worklist is missing`);
  }

  await page.getByRole("button", { name: /Conflicting/i }).first().click();
  const firstGroup = page.locator(".rc-worklist li button").first();
  if (await firstGroup.count()) await firstGroup.click();
  const reviewed = page.getByRole("button", { name: /Mark reviewed/i });
  assert.equal(await reviewed.count(), 1, "conflict detail must offer a reviewed decision");
  await reviewed.click();
  assert.ok(await page.getByText(/reviewed/i).count(), "decision should be visible after marking reviewed");
  await page.getByRole("button", { name: "Back to worklist", exact: true }).click();

  await page.getByText("Choose comparison columns", { exact: true }).click();
  const statusColumn = page.locator(".rc-columns").getByText("status", { exact: true });
  await statusColumn.click();
  await page.getByText(/1 of 2 same-header non-key columns are selected/).waitFor();
  await page.getByRole("heading", { name: "Ready for two sources", exact: true }).waitFor();
  await page.getByRole("button", { name: "Compare exact keys", exact: true }).click();
  await waitForComparison(page);
  assert.match(await page.getByRole("button", { name: /Conflicting/i }).first().innerText(), /^0\s+Conflicting$/i, "excluded status must not create a conflict");
  await statusColumn.click();
  await page.getByText(/2 of 2 same-header non-key columns are selected/).waitFor();
  await page.getByRole("button", { name: "Compare exact keys", exact: true }).click();
  await waitForComparison(page);
  await page.getByRole("button", { name: /Conflicting/i }).first().click();
  assert.match(await page.locator(".rc-worklist li").first().innerText(), /unreviewed/i, "column changes must invalidate prior decisions");

  for (const label of ["Data-preserving CSV", "Spreadsheet-oriented CSV", "Recipe JSON"]) {
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: new RegExp(label, "i") }).click();
    const download = await downloadPromise;
    assert.ok((await downloadBuffer(download)).length > 0, `${label} should produce a non-empty download`);
  }

  // ProjectTools round trip: the saved project is reopened through its visible file input.
  const save = page.getByRole("button", { name: /Save project file/i });
  assert.equal(await save.count(), 1, "ProjectTools save action is required");
  const savedPromise = page.waitForEvent("download");
  await save.click();
  const saved = await savedPromise;
  const savedBuffer = await downloadBuffer(saved);
  const open = page.getByRole("button", { name: /Open project/i });
  assert.equal(await open.count(), 1, "ProjectTools open action is required");
  await open.click();
  const projectInput = page.locator('.project-tools input[type="file"]');
  await projectInput.setInputFiles({ name: "reconciliation-project.json", mimeType: "application/json", buffer: savedBuffer });
  const confirm = page.locator("dialog[open]").last().getByRole("button", { name: "Open project", exact: true });
  await confirm.waitFor({ state: "visible", timeout: 8_000 });
  assert.equal(await confirm.count(), 1, "valid ProjectTools file should open a confirmation dialog");
  await confirm.click();
  await page.getByRole("heading", { name: /exception groups/i }).waitFor({ state: "visible", timeout: 10_000 });
  await page.screenshot({ path: "/tmp/reconciliation-desktop.png", fullPage: true });
  await page.close();
}

async function checkMobile() {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto(`${base}/interfaces/reconciliation/`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(overflow, false, "reconciliation must not overflow at 390px");
  const choose = page.getByRole("button", { name: "Choose file", exact: true });
  assert.ok(await choose.count() >= 2, "both mobile source controls must be tappable");
  await page.screenshot({ path: "/tmp/reconciliation-mobile.png", fullPage: true });
  await page.close();
}

async function checkContentRoutes() {
  for (const route of ["/services/", "/workflows/", "/workflows/record-review/", "/docs/projects/", "/docs/updates/"]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200, `${route} must return 200`);
    assert.equal(await page.locator("main").count(), 1, `${route} must have one main landmark`);
    assert.equal(await page.locator('link[rel="canonical"]').count(), 1, `${route} needs one canonical link`);
    assert.equal(errors.length, 0, `${route} console errors: ${errors.join("; ")}`);
    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(() => axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }));
    const serious = result.violations.filter(v => v.impact === "serious" || v.impact === "critical");
    assert.equal(serious.length, 0, `${route} serious axe violations: ${serious.map(v => v.id).join(", ")}`);
    await page.close();
  }
  const registry = await fetch(`${base}/r/workflows/index.json`);
  assert.equal(registry.status, 200, "workflow machine registry must return 200");
  const json = await registry.json();
  assert.equal(json.schemaVersion, 1, "workflow registry schema version");
  assert.ok(Array.isArray(json.items) && json.items.length > 0, "workflow registry must be populated");
}

async function checkRecordReview() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${base}/workflows/record-review/`, { waitUntil: "networkidle" });
  const record = page.locator("main").getByRole("button").filter({ hasText: /FIELD-/ }).first();
  assert.equal(await record.count(), 1, "record-review must expose fixture records");
  await record.click();
  await page.getByRole("button", { name: "Edit record", exact: true }).click();
  const title = page.getByRole("textbox", { name: "Title", exact: true });
  const originalTitle = await title.inputValue();
  const editedTitle = `${originalTitle} · browser check`;
  await title.fill(editedTitle);
  await page.getByRole("button", { name: "Review change", exact: true }).click();
  await page.getByRole("button", { name: "Commit change", exact: true }).click();
  await page.locator(".workflow-detail").getByText("The record was committed.", { exact: true }).waitFor({ state: "visible", timeout: 10_000 });
  await page.getByRole("heading", { name: editedTitle, exact: true }).waitFor({ state: "visible" });
  const history = page.locator(".workflow-history li");
  assert.equal(await history.count(), 1, "commit must add one history entry");
  assert.match(await history.first().innerText(), /Record committed[\s\S]*Revision 2: title/, "commit history must identify the changed field and revision");
  const undo = page.getByRole("button", { name: "Undo latest change", exact: true });
  assert.equal(await undo.count(), 1, "a fresh commit must expose its undo action");
  await undo.click();
  await page.locator(".workflow-detail").getByText("The change was undone in a new revision.", { exact: true }).waitFor({ state: "visible", timeout: 10_000 });
  await page.getByRole("heading", { name: originalTitle, exact: true }).waitFor({ state: "visible" });
  assert.equal(await history.count(), 2, "undo must append history rather than removing the commit");
  assert.match(await history.first().innerText(), /Change undone[\s\S]*Revision 3: title/, "undo history must identify the reverted field and revision");
  await page.close();
}

try {
  await checkReconciliation();
  await checkMobile();
  await checkContentRoutes();
  await checkRecordReview();
  console.log("reconciliation-e2e: all checks passed");
} finally {
  await browser.close();
}
