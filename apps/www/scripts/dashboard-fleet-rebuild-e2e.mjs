import assert from "node:assert/strict";

export async function checkDashboardFleet({ page, base, fail }) {
  const activate = async control => {
    await control.press("Enter");
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  const open = async slug => {
    await page.goto(`${base.replace(/\/$/, "")}/interfaces/${slug}/`, { waitUntil: "networkidle" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width: 100%; }" });
    await page.waitForFunction(root => {
      const control = document.querySelector(`${root} button`);
      return control && Object.keys(control).some(key => key.startsWith("__reactProps"));
    }, slug === "press" ? ".pd" : ".fm");
  };
  const choose = async (name, option) => {
    await activate(page.getByRole("combobox", { name, exact: true }));
    await page.getByRole("option", { name: option, exact: true }).click();
  };
  try {
    await open("press");
    const board = page.locator(".pd");
    await board.waitFor();
    const phoneNav = board.getByRole("navigation", { name: "Production sections", exact: true });
    const nav = await phoneNav.isVisible() ? phoneNav : board.getByRole("navigation", { name: "Production navigation", exact: true });
    const navigate = async name => activate(nav.getByRole("button", { name: new RegExp(`^${name}`) }));
    await activate(board.getByRole("button", { name: "Month", exact: true }));
    assert.equal(await board.locator(".pd-job").count(), 4);
    assert.equal(await board.locator(".pd-metric > strong").first().textContent(), "214");
    await activate(board.locator(".pd-job").filter({ hasText: "Exhibition guide" }));
    await page.waitForFunction(() => document.activeElement?.textContent === "Exhibition guide");
    await board.getByRole("textbox", { name: "Review note", exact: true }).fill("Address checked against the supplied copy.");
    await activate(board.getByRole("button", { name: "Mark reviewed", exact: true }));
    assert.match(await board.locator(".pd-detail-action").textContent(), /Reviewed locally/);
    assert.match(await board.locator(".pd-detail-scroll").textContent(), /Recorded note: Address checked/);
    await activate(board.getByRole("button", { name: "Back to work", exact: true }));
    await page.waitForFunction(() => document.activeElement?.textContent?.includes("Exhibition guide"));
    await navigate("Jobs");
    await choose("Job stage", "Proof");
    assert.equal(await board.locator(".pd-job").count(), 1);
    await board.getByRole("textbox", { name: "Search jobs", exact: true }).fill("No matching title");
    await board.getByRole("heading", { name: "No matching jobs", exact: true }).waitFor();
    await activate(board.getByRole("button", { name: "Clear search and stage", exact: true }));
    assert.equal(await board.locator(".pd-job").count(), 4);
    await activate(board.getByRole("button", { name: "Week", exact: true }));
    assert.equal(await board.locator(".pd-job").count(), 2, "Due-date filtering must change the actual job list");
    await activate(board.getByRole("button", { name: "Month", exact: true }));
    await navigate("Invoices");
    assert.equal(await board.locator(".pd-invoice").count(), 3);
    await activate(board.locator(".pd-invoice").filter({ hasText: "September invoice" }));
    assert.match(await board.locator(".pd-invoice-total").textContent(), /€2,400/);
    await activate(board.getByRole("button", { name: "Open linked job", exact: true }));
    assert.equal(await board.getByRole("textbox", { name: "Review note", exact: true }).inputValue(), "Address checked against the supplied copy.");
    await activate(board.getByRole("button", { name: "Undo review", exact: true }));
    assert.match(await board.locator(".pd-detail-action").textContent(), /Ready for review/);
    console.log(`${page.viewportSize().width}px: dashboard due-date/stage/search filters, review notes, invoices and focus return passed`);
  } catch (error) { fail(`Dashboard rebuild: ${error.message}`); }

  try {
    await open("night");
    const board = page.locator(".fm");
    await board.waitFor();
    const nav = board.getByRole("navigation", { name: "Dispatch sections", exact: true });
    const mobile = await nav.isVisible();
    const showVehicles = async () => { if (mobile) await activate(nav.getByRole("button", { name: "Vehicles", exact: true })); };
    await choose("Vehicle status", "Hold");
    assert.equal(await board.locator(".fm-vehicle").count(), 1);
    await activate(board.locator(".fm-vehicle").filter({ hasText: "Truck 19" }));
    assert.match(await board.locator(".fm-map-head h2").textContent(), /Truck 19/);
    await page.waitForFunction(() => ["preview", "ready", "error"].includes(document.querySelector(".fm-map-view")?.getAttribute("data-map-status")), undefined, { timeout: 25000 });
    assert.equal(await board.locator(".fm-map-marker").count(), 1, "The map and list must share the active filter");
    assert.match(await board.locator(".fm-map-caption").textContent(), /Dogpatch, San Francisco/);
    await activate(board.getByRole("button", { name: "View trip", exact: true }));
    await page.waitForFunction(() => document.activeElement?.textContent === "Illinois → Tennessee");
    assert.match(await board.locator(".fm-trip-copy").textContent(), /No revised arrival time/);
    await board.getByRole("textbox", { name: "Dispatch note", exact: true }).fill("Loading bay call recorded locally.");
    await activate(board.getByRole("button", { name: "Save note", exact: true }));
    assert.equal(await board.locator(".fm-note-status").textContent(), "Note saved locally");
    await activate(board.getByRole("button", { name: "Back to map", exact: true }));
    await page.waitForFunction(() => document.activeElement?.textContent?.includes("View trip"));
    await activate(board.getByRole("button", { name: "Zoom in", exact: true }));
    assert.equal(await board.getByLabel("Zoom level", { exact: true }).textContent(), "125%");
    assert.equal(Number(await board.locator(".fm-map-view").getAttribute("data-zoom")), 1.25);
    await activate(board.getByRole("button", { name: "Reset", exact: true }));
    assert.equal(Number(await board.locator(".fm-map-view").getAttribute("data-zoom")), 1);
    await showVehicles();
    await choose("Vehicle status", "All statuses");
    await board.getByRole("textbox", { name: "Search vehicles", exact: true }).fill("No matching vehicle");
    await board.getByRole("heading", { name: "No matching vehicles", exact: true }).waitFor();
    await activate(board.getByRole("button", { name: "Clear filters", exact: true }));
    assert.equal(await board.locator(".fm-vehicle").count(), 4);
    await activate(board.locator(".fm-vehicle").filter({ hasText: "Bicycle 11" }));
    await activate(board.getByRole("button", { name: "View trip", exact: true }));
    assert.equal(await board.getByRole("textbox", { name: "Dispatch note", exact: true }).inputValue(), "", "Dispatch notes must stay with their own vehicle");
    await activate(board.getByRole("button", { name: "Back to map", exact: true }));
    await activate(board.getByRole("button", { name: "Select Van 04 on map", exact: true }));
    assert.equal(await board.getAttribute("data-selected"), "04");
    await showVehicles();
    await activate(board.locator(".fm-vehicle").filter({ hasText: "Truck 19" }));
    await activate(board.getByRole("button", { name: "View trip", exact: true }));
    assert.equal(await board.getByRole("textbox", { name: "Dispatch note", exact: true }).inputValue(), "Loading bay call recorded locally.");
    console.log(`${page.viewportSize().width}px: fleet filters, map selection/zoom, trip data, independent notes and focus return passed`);
  } catch (error) { fail(`Fleet rebuild: ${error.message}`); }
}
