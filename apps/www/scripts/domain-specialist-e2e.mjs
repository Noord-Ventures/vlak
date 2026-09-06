import assert from "node:assert/strict";

/** Recorded-data and host-request behavior for robotics, electronics, and microbiology. */
export async function checkDomainSpecialists({ browser, base, fail }) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 900 }, reducedMotion: "reduce" });
  page.setDefaultTimeout(5000);
  const go = async name => {
    await page.goto(`${base}/components/${name}/`, { waitUntil: "networkidle" });
    return page.locator(".preview-box");
  };
  const check = async (name, run) => {
    try { await run(); } catch (error) { fail(`domain specialist ${name}: ${error instanceof Error ? error.message : String(error)}`); }
  };
  const activate = async control => {
    await control.focus();
    await page.keyboard.press("Enter");
  };
  const replace = async (control, value) => {
    await control.focus();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.type(value);
  };
  const choose = async (trigger, label) => {
    await activate(trigger);
    const options = await page.getByRole("option").evaluateAll(elements => elements.filter(element => element.getAttribute("aria-disabled") !== "true").map(element => element.textContent));
    const index = options.indexOf(label);
    assert.ok(index >= 0, `the open Vlak menu has no available ${label} option`);
    await page.keyboard.press("Home");
    for (let step = 0; step < index; step++) await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    assert.equal(await trigger.getAttribute("aria-expanded"), "false", "the keyboard selection leaves its menu open");
    assert.equal((await trigger.textContent()).trim(), label);
  };
  const reading = (root, term) => root.locator("dl > div").filter({ has: page.getByText(term, { exact: true }) }).locator("dd");

  try {
    await check("joint-panel targets", async () => {
      const preview = await go("joint-panel");
      const shoulder = preview.getByRole("spinbutton", { name: "Shoulder draft target (deg)", exact: true });
      const slide = preview.getByRole("spinbutton", { name: "Slide draft target (m)", exact: true });
      const reported = await preview.locator(".rs-joint-panel-reading").allTextContents();
      assert.deepEqual(reported, ["Reported: 12.5 deg", "Reported: 0 m"]);
      await replace(shoulder, "91");
      assert.equal(await shoulder.inputValue(), "91", "out-of-bounds draft is silently clamped");
      assert.equal(await shoulder.evaluate(element => element.checkValidity()), false);
      assert.equal(await preview.getByRole("button", { name: "Request targets", exact: true }).isDisabled(), true);
      await replace(shoulder, "0");
      assert.equal(await shoulder.inputValue(), "0");
      assert.equal(await slide.inputValue(), "0", "zero or an independent joint target is lost");
      await activate(preview.getByRole("button", { name: "Request targets", exact: true }));
      assert.equal(await preview.getByText("Host confirmation: Draft received locally; no motion executed", { exact: true }).isVisible(), true);
      assert.deepEqual(await preview.locator(".rs-joint-panel-reading").allTextContents(), reported, "a request rewrites reported robot positions");
    });

    await check("robot-pose records", async () => {
      const preview = await go("robot-pose");
      assert.equal(await reading(preview, "Frame").textContent(), "base");
      assert.deepEqual(await preview.locator(".rs-robot-pose-values").first().locator("dd").allTextContents(), ["0.125", "0", "0.25"]);
      assert.deepEqual(await preview.locator(".rs-robot-pose-values").last().locator("dd").allTextContents(), ["0", "0", "0", "1"]);
      await choose(preview.getByRole("combobox", { name: "Pose record", exact: true }), "Base in map");
      assert.equal(await reading(preview, "Frame").textContent(), "map");
      assert.deepEqual(await preview.locator(".rs-robot-pose-values").first().locator("dd").allTextContents(), ["1.25", "0", "0"]);
      assert.deepEqual(await preview.locator(".rs-robot-pose-values").last().locator("dd").allTextContents(), ["0", "0", "90"]);
      assert.equal(await preview.getByText("Representation: Euler, intrinsic x-y-z", { exact: true }).isVisible(), true);
      assert.equal(await reading(preview, "Recorded at").textContent(), "12:00:00.125", "record selection changes its supplied timestamp");
      assert.equal(await reading(preview, "Status").textContent(), "Recorded");
    });

    await check("robot-mission-queue requests", async () => {
      const preview = await go("robot-mission-queue");
      await activate(preview.getByRole("button", { name: "Record plan review: step 1, Inspect station", exact: true }));
      assert.equal(await preview.getByText("Host confirmation: Plan review recorded; mission has not run", { exact: true }).isVisible(), true);
      assert.equal(await preview.getByText("Recorded: Not started", { exact: true }).count(), 2, "plan review changes execution status");
      await activate(preview.getByRole("button", { name: "Move step 1, Inspect station down", exact: true }));
      assert.deepEqual(await preview.locator(".rs-robot-mission-queue-title").allTextContents(), ["Return to dock", "Inspect station"]);
      assert.equal(await preview.getByText("Recorded: Not started", { exact: true }).count(), 2);
      assert.equal(await preview.getByRole("button", { name: "Move step 2, Inspect station down", exact: true }).isDisabled(), true);
      assert.equal(await preview.getByText("Host confirmation: Plan review recorded; mission has not run", { exact: true }).isVisible(), true, "reordering detaches the host confirmation from its step");
    });

    await check("pad-inspector exact geometry", async () => {
      const preview = await go("pad-inspector");
      const pad = preview.getByRole("combobox", { name: "Pad", exact: true });
      assert.equal(await reading(preview, "Net").textContent(), "Supply");
      await choose(pad, "J1 / Pad 2 · pad-b");
      assert.equal(await reading(preview, "Net").textContent(), "Return");
      assert.equal(await reading(preview, "Shape").textContent(), "Oval");
      const width = preview.getByRole("row", { name: "Pad width 2.20 mm", exact: true });
      assert.equal(await width.isVisible(), true, "supplied decimal geometry loses precision or its unit");
      assert.equal(await preview.getByText("Selected pad: pad-b", { exact: true }).isVisible(), true);
      await choose(pad, "No pad selected");
      assert.equal(await preview.getByRole("table").count(), 0, "clearing selection retains stale pad geometry");
    });

    await check("design-rule-results filters and request state", async () => {
      const preview = await go("design-rule-results");
      const severity = preview.getByRole("combobox", { name: "Severity", exact: true });
      const status = preview.getByRole("combobox", { name: "Result status", exact: true });
      await choose(severity, "Warning");
      assert.equal(await preview.getByText("1 of 2 results", { exact: true }).isVisible(), true);
      assert.equal(await preview.getByText("Silkscreen overlap", { exact: true }).isVisible(), true);
      await choose(status, "Open");
      assert.equal(await preview.getByText("No results match these filters", { exact: true }).isVisible(), true, "independent filters fabricate an open warning");
      await choose(severity, "All severities");
      await choose(status, "All statuses");
      await activate(preview.getByRole("button", { name: "Select result clearance-1: Copper clearance", exact: true }));
      assert.equal(await preview.getByText("Copper clearance · Selected", { exact: true }).isVisible(), true);
      await activate(preview.getByRole("button", { name: "Request resolution for clearance-1: Copper clearance", exact: true }));
      const result = preview.locator(".rs-design-rule-results-item").filter({ hasText: "Copper clearance" });
      assert.equal(await result.getByText("Update pending", { exact: true }).isVisible(), true);
      assert.equal(await reading(result, "Confirmed status").textContent(), "Open", "resolution request prematurely confirms a resolved status");
      assert.equal(await result.getByRole("button", { name: "Request resolution for clearance-1: Copper clearance", exact: true }).isDisabled(), true);
      assert.equal(await preview.getByText("Synthetic check run 042", { exact: true }).isVisible(), true);
    });

    await check("colony-plate supplied count and missing position", async () => {
      const preview = await go("colony-plate");
      assert.equal(await preview.getByText("Source count: 12", { exact: true }).isVisible(), true);
      assert.equal(await preview.getByText("4 marker records supplied; 3 positioned", { exact: true }).isVisible(), true);
      const fourth = preview.getByRole("button", { name: "Select 4. Colony 04", exact: true });
      await activate(fourth);
      assert.equal(await fourth.getAttribute("aria-pressed"), "true");
      assert.equal(await preview.getByRole("button", { name: "Select 2. Colony 02", exact: true }).getAttribute("aria-pressed"), "false");
      assert.equal(await preview.getByRole("status").textContent(), "Selected record: Colony 04");
      assert.equal(await fourth.locator("..").getByText("Position not supplied", { exact: true }).isVisible(), true);
      assert.equal(await preview.locator(".rs-colony-plate-marker").count(), 3);
      assert.equal(await preview.locator(".rs-colony-plate-chosen").count(), 0, "an unpositioned record gets fabricated plot geometry");
      assert.equal(await preview.getByText("Source count: 12", { exact: true }).isVisible(), true, "record selection changes the independent source count");
      await activate(preview.getByRole("button", { name: "Clear selection", exact: true }));
      assert.equal(await preview.getByRole("status").textContent(), "No record selected");
    });

    await check("culture-log recorded review", async () => {
      const preview = await go("culture-log");
      const observations = await preview.getByRole("list", { name: "Culture observations, observations", exact: true }).getByRole("listitem").allTextContents();
      assert.equal(observations.length, 2);
      assert.match(observations[0], /Sample record received/);
      assert.match(observations[1], /Plate image attached/);
      await activate(preview.getByRole("button", { name: "Record review: C-042", exact: true }));
      assert.equal(await preview.getByText("Record review noted", { exact: true }).isVisible(), true);
      assert.equal(await preview.getByRole("button", { name: "Record review: C-042", exact: true }).count(), 0);
      assert.deepEqual(await preview.getByRole("list", { name: "Culture observations, observations", exact: true }).getByRole("listitem").allTextContents(), observations, "review rewrites the supplied observations");
      assert.equal(await reading(preview, "Sample").textContent(), "S-042");
      assert.equal(await reading(preview, "Medium").textContent(), "Agar medium A");
    });
  } finally {
    await page.close();
  }
}
