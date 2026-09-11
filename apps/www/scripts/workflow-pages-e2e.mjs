// Focused workflow landing, example, and manifest journeys.
// Run from apps/www against any built export with BASE_URL=http://127.0.0.1:3016.
import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = (process.env.BASE_URL ?? "http://127.0.0.1:3016").replace(/\/$/, "");
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
  ? { headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
  : { headless: true });

async function open(page, path) {
  const response = await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200, `${path} must return 200`);
  assert.equal(await page.locator("main").count(), 1, `${path} must expose one main landmark`);
}

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await open(page, "/workflows/");
  assert.equal(await page.locator(".workflow-card").count(), 3, "workflow landing must show all three kits");
  assert.equal(await page.locator(".workflow-card h2 a").count(), 0, "card titles must not duplicate the example action");
  assert.equal(await page.getByRole("link", { name: "Try example", exact: true }).count(), 3);
  assert.equal(await page.getByRole("link", { name: "Read manifest", exact: true }).count(), 3);

  for (const id of ["record-review", "action-approval", "schedule-editing"]) {
    await open(page, `/workflows/${id}/manifest/`);
    assert.equal(await page.getByRole("link", { name: "Try example", exact: true }).count(), 1, `${id} manifest must link to its example`);
    assert.ok(await page.getByRole("heading", { name: "Ownership", exact: true }).count(), `${id} manifest must state ownership`);
  }

  await open(page, "/workflows/action-approval/");
  assert.equal(await page.getByText("payload-v1-d8eafb66", { exact: true }).count(), 1, "approval must show the frozen payload version");
  await page.getByRole("button", { name: "Approve exact payload", exact: true }).click();
  await page.getByText("Approval recorded for this exact payload.", { exact: true }).waitFor();
  assert.equal(await page.getByText("approved", { exact: true }).count(), 1);
  await page.getByRole("button", { name: "Reset local example", exact: true }).click();
  await page.getByRole("button", { name: "Reject action", exact: true }).click();
  await page.getByText("Rejection recorded. The action remains unexecuted.", { exact: true }).waitFor();
  assert.equal(await page.getByText("rejected", { exact: true }).count(), 1);

  await open(page, "/workflows/schedule-editing/");
  const end = page.getByLabel("Ends at · UTC", { exact: true });
  await page.getByLabel("Title", { exact: true }).fill("Extended site walk");
  await end.fill("2026-09-14 08:30");
  await page.getByRole("button", { name: "Review edit", exact: true }).click();
  await page.getByText("End must be after start.", { exact: true }).waitFor();
  await end.fill("2026-09-14 10:45");
  await page.getByRole("button", { name: "Review edit", exact: true }).click();
  assert.equal(await page.locator(".workflow-schedule-change").count(), 2, "schedule review must show every changed field");
  await page.getByText("Extended site walk", { exact: true }).waitFor();
  await page.getByText("2026-09-14T10:45:00Z", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Apply local edit", exact: true }).click();
  await page.getByText("Event edit recorded as revision 2. No calendar provider was contacted.", { exact: true }).waitFor();
  assert.equal(await page.locator(".workflow-example-header").getByText("confirmed", { exact: true }).count(), 1);
  await page.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const path of ["/workflows/", "/workflows/record-review/", "/workflows/action-approval/", "/workflows/schedule-editing/"]) {
    await open(mobile, path);
    assert.equal(await mobile.getByRole("button", { name: "Workflow kits", exact: true }).count(), 1, `${path} must use the workflow mobile navigation label`);
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${path} must not overflow at 390px`);
    const short = await mobile.locator("main a[href], main button:not(:disabled), main input:not(:disabled)").evaluateAll(elements => elements.filter(element => element.getClientRects().length && element.getBoundingClientRect().height < 44).map(element => `${element.tagName}.${element.className}: ${element.getBoundingClientRect().height}px`));
    assert.deepEqual(short, [], `${path} has controls under 44px: ${short.join(", ")}`);
  }
  await mobile.close();
  console.log("workflow-pages-e2e: all checks passed");
} finally {
  await browser.close();
}
