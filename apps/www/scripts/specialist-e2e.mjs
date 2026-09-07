import assert from "node:assert/strict";

/** Select an enabled, visibly labelled option using the public combobox keyboard interaction. */
export async function chooseWithKeyboard(page, control, label) {
  await control.focus();
  await page.keyboard.press("Home");
  assert.equal(await control.getAttribute("aria-expanded"), "true", "Home does not open the combobox");
  const option = page.getByRole("option", { name: label, exact: true });
  assert.notEqual(await option.getAttribute("aria-disabled"), "true", `Option ${label} is disabled`);
  const target = await option.getAttribute("id");
  const limit = await page.getByRole("option").count();
  for (let index = 0; index < limit; index++) {
    if (await control.getAttribute("aria-activedescendant") === target) {
      await page.keyboard.press("Enter");
      assert.equal(await control.getAttribute("aria-expanded"), "false", "selection leaves the option list open");
      return;
    }
    await page.keyboard.press("ArrowDown");
  }
  throw new Error(`Keyboard navigation cannot reach option ${label}`);
}

/** Keyboard behavior for the supplied specialist previews; domain-e2e covers themes and reach. */
export async function checkSpecialists({ browser, base, fail }) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 900 }, reducedMotion: "reduce" });
  page.setDefaultTimeout(5000);
  const go = async name => {
    await page.goto(`${base}/components/${name}/`, { waitUntil: "networkidle" });
    return page.locator(".preview-box");
  };
  const check = async (name, run) => {
    try { await run(); } catch (error) { fail(`specialist ${name}: ${error instanceof Error ? error.message : String(error)}`); }
  };
  const activate = async (control, key = "Enter") => {
    await control.focus();
    await page.keyboard.press(key);
  };
  const replace = async (field, value) => {
    await field.focus();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.type(value);
  };
  const choose = (select, label) => chooseWithKeyboard(page, select, label);
  const selectedText = async control => (await control.textContent()).trim();
  const focused = control => control.evaluate(element => element === document.activeElement);
  const reading = (root, term) => root.locator("dl > div").filter({ has: page.getByText(term, { exact: true }) }).locator("dd");

  try {
    await check("patchbay routes", async () => {
      const preview = await go("patchbay");
      const route = preview.getByRole("checkbox", { name: "Mix to Monitor", exact: true });
      const blocked = preview.getByRole("checkbox", { name: "Mix to Clock", exact: true });
      assert.equal(await route.isChecked(), true, "supplied monitor connection is missing");
      assert.equal(await blocked.isDisabled(), true, "incompatible control port is selectable");
      await activate(route, "Space");
      assert.equal(await route.isChecked(), false, "Space does not disconnect the route");
      await page.keyboard.press("ArrowRight");
      assert.equal(await focused(route), true, "navigation reaches a blocked cell");
      await page.keyboard.press("Space");
      assert.equal(await route.isChecked(), true, "Space does not restore the route");
      assert.equal(await blocked.isChecked(), false, "editing a route connects an incompatible port");
    });

    await check("kerning-pair-editor offset and undo", async () => {
      const preview = await go("kerning-pair-editor");
      const offset = preview.getByRole("spinbutton", { name: "Offset (font units)", exact: true });
      assert.equal(await offset.inputValue(), "-80");
      await offset.focus();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      assert.equal(await offset.inputValue(), "-69", "unit and modifier steps do not accumulate correctly");
      assert.equal(await preview.getByText("Baseline: -60 units", { exact: true }).isVisible(), true);
      const glyph = preview.getByRole("img", { name: "A followed by V, edited offset -69 units", exact: true });
      assert.equal(await glyph.locator("span").last().evaluate(element => element.style.marginInlineStart), "-0.069em", "paired preview does not reflect units per em");
      await activate(preview.getByRole("button", { name: "Reset to baseline", exact: true }));
      assert.equal(await offset.inputValue(), "-60");
      await activate(preview.getByRole("button", { name: "Undo last edit", exact: true }));
      assert.equal(await offset.inputValue(), "-69", "undo does not restore the preceding edit");
      await activate(preview.getByRole("button", { name: "Next pair", exact: true }));
      assert.equal(await offset.inputValue(), "-50", "pair navigation loses the supplied next offset");
      assert.equal(await preview.getByText("Baseline: -40 units", { exact: true }).isVisible(), true);
    });

    await check("assembly-variant-matrix independent flags", async () => {
      const preview = await go("assembly-variant-matrix");
      const production = preview.locator("summary").filter({ hasText: "Edit R1 in Production" });
      await activate(production);
      assert.equal(await production.locator("..").evaluate(element => element.open), true, "Enter does not expand the cell editor");
      const flag = name => preview.getByRole("combobox", { name: `${name}, R1 in Production`, exact: true });
      assert.equal(await selectedText(flag("Populated")), "No");
      await choose(flag("Populated"), "Yes");
      assert.equal(await selectedText(flag("Populated")), "Yes");
      assert.equal(await selectedText(flag("In bill of materials")), "Yes", "population edit changes bill inclusion");
      assert.equal(await selectedText(flag("In placement file")), "No", "population edit changes placement inclusion");
      await choose(flag("In placement file"), "Unspecified");
      assert.equal(await selectedText(flag("In placement file")), "Unspecified", "unspecified is collapsed into false");
      assert.equal(await selectedText(flag("Populated")), "Yes");
      assert.match(await production.textContent(), /Populated: Yes · Bill: Yes · Placement: Unspecified/);
      const pilot = preview.locator("summary").filter({ hasText: "Edit R1 in Pilot" });
      assert.match(await pilot.textContent(), /Populated: Yes · Bill: Yes · Placement: Yes/, "editing production changes the pilot variant");
    });

    await check("coordinate-reference-field coordinate identity", async () => {
      const preview = await go("coordinate-reference-field");
      const reference = preview.getByRole("combobox", { name: "Coordinate reference", exact: true });
      const east = preview.getByRole("spinbutton", { name: "Easting (m)", exact: true });
      const north = preview.getByRole("spinbutton", { name: "Northing (m)", exact: true });
      await choose(reference, "Project grid");
      assert.equal(await selectedText(reference), "Project grid");
      assert.equal(await east.inputValue(), "120.5", "reference selection silently transforms easting");
      assert.equal(await north.inputValue(), "48.25", "reference selection silently transforms northing");
      await replace(east, "0");
      assert.equal(await east.inputValue(), "0", "recorded zero is lost");
      assert.equal(await north.inputValue(), "48.25");
      assert.equal(await selectedText(reference), "Project grid");
    });

    await check("datum-transform-picker availability", async () => {
      const preview = await go("datum-transform-picker");
      const transform = preview.getByRole("combobox", { name: "Transformation", exact: true });
      assert.equal(await selectedText(transform), "Parameter transform");
      await activate(transform);
      const unavailable = preview.getByRole("option", { name: "Grid correction (Required grids unavailable)", exact: true });
      assert.equal(await unavailable.getAttribute("aria-disabled"), "true", "missing support grid leaves its operation selectable");
      await page.keyboard.press("Home");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      assert.equal(await selectedText(transform), "Parameter transform", "keyboard navigation selects an unavailable operation");
      await choose(transform, "No transformation selected");
      assert.equal(await selectedText(transform), "No transformation selected", "clearing the selection retains the former operation");
      await choose(transform, "Parameter transform");
      assert.equal(await selectedText(transform), "Parameter transform");
      assert.equal(await preview.getByText("Selected: Parameter transform", { exact: true }).isVisible(), true);
      assert.match(await preview.textContent(), /Correction grid \(missing\)/, "the missing resource is not explained");
    });

    await check("raster-band-mixer configuration", async () => {
      const preview = await go("raster-band-mixer");
      const mode = preview.getByRole("combobox", { name: "Rendering mode", exact: true });
      await choose(mode, "Single band");
      assert.equal(await selectedText(mode), "Single band");
      assert.equal(await selectedText(preview.getByRole("combobox", { name: "Single band source", exact: true })), "Band 4 · Near infrared");
      await choose(preview.getByRole("combobox", { name: "Range treatment", exact: true }), "Clip to range");
      const maximum = preview.getByRole("spinbutton", { name: "Single band maximum", exact: true });
      assert.equal(await preview.getByRole("spinbutton", { name: "Single band minimum", exact: true }).inputValue(), "0");
      assert.equal(await maximum.inputValue(), "4095");
      await replace(maximum, "8191");
      await choose(mode, "Three channels");
      assert.equal(await selectedText(mode), "Three channels");
      assert.equal(await selectedText(preview.getByRole("combobox", { name: "Red channel source", exact: true })), "Band 3 · Red");
      assert.equal(await preview.getByRole("spinbutton", { name: "Red channel maximum", exact: true }).inputValue(), "255", "single-band edit changes an independent channel range");
      assert.match(await preview.textContent(), /Missing-data value: 0/);
      await choose(mode, "Single band");
      assert.equal(await maximum.inputValue(), "8191", "mode changes discard the single-band configuration");
      assert.match(await preview.textContent(), /Missing-data value: None defined/);
    });

    await check("stack-navigator independent axes", async () => {
      const preview = await go("stack-navigator");
      const depth = preview.getByRole("combobox", { name: "Depth", exact: true });
      const time = preview.getByRole("combobox", { name: "Time", exact: true });
      assert.equal(await selectedText(depth), "2 / 3 · 0 µm");
      assert.equal(await preview.getByText("Position 2 of 3; 0 µm", { exact: true }).isVisible(), true, "physical zero is treated as missing");
      await activate(preview.getByRole("button", { name: "Next Depth position", exact: true }));
      assert.equal(await selectedText(depth), "3 / 3 · 1 µm");
      assert.equal(await selectedText(time), "1 / 3 · 0 s", "depth navigation changes the time axis");
      assert.equal(await preview.getByText("Position 3 of 3; 1 µm", { exact: true }).isVisible(), true);
      assert.equal(await preview.getByRole("button", { name: "Next Depth position", exact: true }).isDisabled(), true, "last depth can advance out of bounds");
      await activate(preview.getByRole("button", { name: "Previous Depth position", exact: true }));
      assert.equal(await selectedText(depth), "2 / 3 · 0 µm");
    });

    await check("acquisition-sequencer edits and recorded state", async () => {
      const preview = await go("acquisition-sequencer");
      const exposure = preview.getByRole("spinbutton", { name: "Exposure (ms): step 1, Baseline", exact: true });
      await replace(exposure, "0");
      assert.equal(await exposure.inputValue(), "0");
      assert.equal(await preview.getByRole("spinbutton", { name: "Depth (µm): step 1, Baseline", exact: true }).inputValue(), "-1");
      await activate(preview.getByRole("button", { name: "Record plan review: step 1, Baseline", exact: true }));
      assert.equal(await preview.getByText("Plan review recorded; capture has not run", { exact: true }).isVisible(), true);
      assert.equal(await preview.getByText("Not run", { exact: true }).count(), 2, "review changes the recorded acquisition state");
      await activate(preview.getByRole("button", { name: "Move step 1, Baseline, down", exact: true }));
      assert.deepEqual(await preview.locator(".rs-acquisition-sequencer-title").allTextContents(), ["Follow-up", "Baseline"]);
      assert.equal(await preview.getByRole("spinbutton", { name: "Exposure (ms): step 2, Baseline", exact: true }).inputValue(), "0", "reorder detaches edited values from the step");
      assert.equal(await preview.getByText("Not run", { exact: true }).count(), 2);
    });

    await check("sequence-alignment focus and gaps", async () => {
      const preview = await go("sequence-alignment");
      const first = preview.getByRole("button", { name: "Column 1, chr7 position 101, reference A", exact: true });
      const second = preview.getByRole("button", { name: "Column 2, chr7 position 102, reference C", exact: true });
      const gap = preview.getByRole("button", { name: "Column 3, reference gap, reference -", exact: true });
      await first.focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await focused(second), true);
      assert.equal(await first.getAttribute("aria-pressed"), "true", "moving focus changes selection");
      await page.keyboard.press("Enter");
      assert.equal(await first.getAttribute("aria-pressed"), "false");
      assert.equal(await second.getAttribute("aria-pressed"), "true");
      await page.keyboard.press("Shift+ArrowRight");
      assert.equal(await focused(gap), true);
      assert.equal(await gap.getAttribute("aria-pressed"), "true");
      assert.equal(await preview.getByRole("status").textContent(), "Selected columns 2–3; reference positions 102, gap", "selected gaps become fabricated reference positions");
      await activate(preview.getByRole("button", { name: "Clear selection", exact: true }));
      assert.equal(await preview.getByRole("status").textContent(), "No columns selected");
    });

    await check("coverage-inspector zero and missing", async () => {
      const preview = await go("coverage-inspector");
      const position = preview.getByRole("combobox", { name: "Inspect position", exact: true });
      assert.equal(await selectedText(position), "103 · Depth 24");
      await choose(position, "101 · Depth 0");
      assert.equal(await selectedText(position), "101 · Depth 0");
      assert.equal(await reading(preview, "Depth").textContent(), "0", "recorded zero becomes missing depth");
      assert.equal(await reading(preview, "Forward strand").textContent(), "0");
      await choose(position, "102 · Depth Not supplied");
      assert.equal(await selectedText(position), "102 · Depth Not supplied");
      assert.equal(await reading(preview, "Depth").textContent(), "Not supplied", "missing depth becomes recorded zero");
      await activate(preview.locator("summary").filter({ hasText: "Depth table, 5 positions" }));
      assert.equal(await preview.locator("details").evaluate(element => element.open), true);
      const row = value => preview.locator("tbody tr").filter({ has: page.getByRole("rowheader", { name: value, exact: true }) }).locator("td");
      assert.equal(await row("101").textContent(), "0");
      assert.equal(await row("102").textContent(), "Not supplied");
    });

    await check("genomic-region-field inclusive bounds", async () => {
      const preview = await go("genomic-region-field");
      const start = preview.getByRole("spinbutton", { name: "Start", exact: true });
      const end = preview.getByRole("spinbutton", { name: "End", exact: true });
      await replace(end, "101");
      assert.equal(await preview.getByText("1 positions, including both endpoints", { exact: true }).isVisible(), true, "inclusive equal endpoints do not describe one position");
      assert.equal(await start.evaluate(element => element.checkValidity()), true);
      await replace(start, "0");
      assert.equal(await start.inputValue(), "0", "invalid draft is silently rewritten");
      assert.equal(await start.getAttribute("aria-invalid"), "true");
      assert.equal(await start.evaluate(element => element.checkValidity()), false);
      assert.equal(await preview.getByText("Positions begin at 1", { exact: true }).isVisible(), true);
      await replace(start, "101");
      assert.equal(await start.evaluate(element => element.checkValidity()), true, "correcting the position leaves stale native validation");
      assert.equal(await selectedText(preview.getByRole("combobox", { name: "Contig", exact: true })), "chr7");
      assert.equal(await preview.getByText("Reference: Example reference", { exact: true }).isVisible(), true);
    });

    await check("alarm-panel independent state", async () => {
      const preview = await go("alarm-panel");
      const flow = preview.locator(".rs-alarm-panel-item").filter({ hasText: "Cooling flow" });
      await activate(preview.getByRole("button", { name: "Acknowledge: Cooling flow", exact: true }));
      assert.equal(await reading(flow, "Acknowledgement").textContent(), "Acknowledged");
      assert.equal(await reading(flow, "Condition").textContent(), "Cleared", "acknowledgement changes the condition");
      assert.equal(await reading(flow, "Shelving").textContent(), "Not shelved", "acknowledgement changes shelving");
      await activate(preview.getByRole("button", { name: "Shelve: Cooling flow", exact: true }));
      assert.equal(await reading(flow, "Shelving").textContent(), "Shelved");
      assert.equal(await reading(flow, "Condition").textContent(), "Cleared");
      assert.equal(await reading(flow, "Acknowledgement").textContent(), "Acknowledged");
      await activate(preview.getByRole("button", { name: "Active", exact: true }));
      assert.equal(await preview.getByRole("status").textContent(), "1 of 2 alarm records");
      assert.equal(await flow.count(), 0, "active filter includes a cleared alarm");
      assert.equal(await preview.getByText("Sensor connection", { exact: true }).isVisible(), true);
    });

    await check("work-offset-panel draft and apply", async () => {
      const preview = await go("work-offset-panel");
      const reported = () => preview.locator("tbody tr").evaluateAll(rows => rows.map(row => [...row.querySelectorAll("td")].slice(0, 2).map(cell => cell.textContent)));
      const before = await reported();
      assert.deepEqual(before, [["145", "20"], ["60", "10"], ["0", "0"]]);
      await choose(preview.getByRole("combobox", { name: "Draft coordinate system", exact: true }), "G55");
      assert.equal(await selectedText(preview.getByRole("combobox", { name: "Draft coordinate system", exact: true })), "G55");
      await replace(preview.getByRole("spinbutton", { name: "X offset (mm)", exact: true }), "0");
      assert.equal(await preview.getByRole("spinbutton", { name: "X offset (mm)", exact: true }).inputValue(), "0");
      assert.equal(await preview.getByRole("spinbutton", { name: "Y offset (mm)", exact: true }).inputValue(), "50");
      assert.equal(await preview.getByRole("spinbutton", { name: "Z offset (mm)", exact: true }).inputValue(), "0");
      await activate(preview.getByRole("button", { name: "Apply offsets", exact: true }));
      assert.equal(await preview.getByText("Draft received locally. Reported controller readings remain unchanged.", { exact: true }).isVisible(), true, "apply does not reach the host callback");
      assert.deepEqual(await reported(), before, "draft edits or apply rewrite the reported machine/work positions");
      assert.equal(await preview.getByText("Active system: G54 · Offsets active", { exact: true }).isVisible(), true, "draft selection claims a new active system");
    });

    for (const [size, width] of [["desktop", 1280], ["mobile", 390]]) {
      await page.setViewportSize({ width, height: 900 });
      for (const [slug, fieldClass] of [["acquisition-sequencer", ".rs-acquisition-sequencer-label"], ["genomic-region-field", ".rs-genomic-region-field-label"]]) {
        await check(`${slug} ${size} compound field sizing`, async () => {
          const preview = await go(slug);
          const controls = await preview.locator(fieldClass).evaluateAll(fields => fields.flatMap(field => {
            const control = field.querySelector('button[role="combobox"], input[type="number"]');
            if (!control?.getClientRects().length) return [];
            const parent = field.getBoundingClientRect();
            const box = control.getBoundingClientRect();
            return [{ name: control.getAttribute("aria-label") || field.textContent.trim(), kind: control.getAttribute("role") || "number", fieldLeft: parent.left, fieldRight: parent.right, left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height }];
          }));
          assert.ok(controls.some(control => control.kind === "combobox"), "the fixture has no visible Vlak selector");
          for (const control of controls) {
            assert.ok(control.left >= control.fieldLeft - 0.5 && control.right <= control.fieldRight + 0.5, `${control.name} extends outside its field: ${control.width}px control in ${control.fieldRight - control.fieldLeft}px column`);
            assert.ok(control.width >= 43.9 && control.height >= 43.9, `${control.name} is below the 44px target size`);
          }
          for (let index = 0; index < controls.length; index++) for (const sibling of controls.slice(index + 1)) {
            const control = controls[index];
            const horizontalOverlap = Math.min(control.right, sibling.right) - Math.max(control.left, sibling.left);
            const verticalOverlap = Math.min(control.bottom, sibling.bottom) - Math.max(control.top, sibling.top);
            assert.ok(horizontalOverlap <= 0.5 || verticalOverlap <= 0.5, `${control.name} overlaps ${sibling.name}`);
          }
        });
      }
    }
  } finally {
    await page.close();
  }
}
