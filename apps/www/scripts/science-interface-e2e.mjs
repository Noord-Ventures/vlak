import assert from "node:assert/strict";

/** Run against the caller's viewport and browser; each study starts from a fresh route. */
export async function checkScienceInterfaces({ page, base, fail }) {
  const run = async (name, check) => {
    try { await check(); } catch (error) { fail(`science interface ${name}: ${error instanceof Error ? error.message : String(error)}`); }
  };
  const open = async (slug, selector) => {
    await page.goto(`${base}/interfaces/${slug}/`, { waitUntil: "networkidle" });
    const board = page.locator(selector);
    await board.waitFor({ state: "visible" });
    // Network idle covers the route scripts; settle the hydrated screen's first paint.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))));
    return board;
  };
  const activate = async control => {
    await control.press("Enter");
    // Screen changes schedule focus in a frame; finish it before starting the next action.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => resolve(null))));
  };
  const focused = async control => {
    const handle = await control.elementHandle();
    await page.waitForFunction(element => document.activeElement === element, handle);
    return true;
  };
  const choose = async (control, label) => {
    await control.focus(); await control.press("Home");
    const option = page.getByRole("option", { name: label, exact: true });
    await option.waitFor({ state: "visible" });
    assert.notEqual(await option.getAttribute("aria-disabled"), "true");
    const target = await option.getAttribute("id");
    const options = await page.getByRole("option").evaluateAll(elements => elements.filter(element => element.getAttribute("aria-disabled") !== "true").map(element => element.id));
    const handle = await control.elementHandle();
    for (let index = 0; index < options.length; index++) {
      const active = await control.getAttribute("aria-activedescendant");
      if (active === target) {
        await control.press("Enter");
        await page.waitForFunction(element => element?.getAttribute("aria-expanded") === "false", handle);
        return;
      }
      const next = options[(options.indexOf(active) + 1) % options.length];
      await control.press("ArrowDown");
      await page.waitForFunction(({ element, expected }) => element?.getAttribute("aria-activedescendant") === expected, { element: handle, expected: next });
    }
    throw new Error(`Keyboard cannot reach ${label}`);
  };
  const fit = async board => {
    const problems = await board.evaluate(root => {
      const visible = element => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden" && !element.closest('[aria-hidden="true"]');
      return Array.from(root.querySelectorAll("header, footer, nav, .mi-detail-head, .ge-evidence-head, .pr-sequence-head")).filter(visible).flatMap(region => {
        const box = region.getBoundingClientRect();
        return Array.from(region.querySelectorAll("button")).filter(visible).filter(button => {
          const target = button.getBoundingClientRect();
          return target.width < 43.5 || target.height < 43.5 || target.left < box.left - 1 || target.right > box.right + 1;
        }).map(button => button.getAttribute("aria-label") || button.textContent.trim());
      });
    });
    assert.deepEqual(problems, [], "screen header or pinned action controls are clipped or below44px");
  };

  await run("microbiology records and notebook", async () => {
    const board = await open("microbiology", ".mi");
    await activate(board.getByRole("button", { name: /C-042.*Courtyard collection/ }));
    assert(await board.getByText("Source count: 12", { exact: true }).isVisible());
    assert(await board.getByText("4 marker records supplied; 3 positioned", { exact: true }).isVisible());
    const marker = board.getByRole("button", { name: "Select 2. Record 02", exact: true });
    await activate(marker);
    const notebook = board.getByRole("region", { name: "Observation notebook", exact: true });
    await notebook.getByText("Position x 62%, y 28%", { exact: true }).waitFor({ state: "visible" });
    await fit(board);
    await notebook.getByRole("textbox", { name: "Observation note", exact: true }).fill("Revisit the source image before adding a position note.");
    await activate(notebook.getByRole("button", { name: "Save note", exact: true }));
    assert(await notebook.getByText("Revisit the source image before adding a position note.", { exact: true }).isVisible());
    assert.equal(await notebook.getByRole("textbox", { name: "Observation note", exact: true }).inputValue(), "");
    await activate(notebook.getByRole("button", { name: "Mark culture reviewed", exact: true }));
    assert(await notebook.getByRole("button", { name: "Reviewed locally", exact: true }).isDisabled());
    await activate(notebook.getByRole("button", { name: "Back to plate", exact: true }));
    assert(await focused(marker), "Back should return to the selected marker");
    assert(await board.getByText("Source count: 12", { exact: true }).isVisible(), "local notes must not change the source count");
    await activate(board.getByRole("button", { name: "Select 4. Record 04", exact: true }));
    assert(await notebook.getByText("Position not supplied", { exact: true }).isVisible(), "missing marker coordinates became a fabricated position");
    assert.equal(await notebook.getByRole("textbox", { name: "Observation note", exact: true }).inputValue(), "", "draft leaked between marker records");
    const nav = board.getByRole("navigation", { name: "Microbiology screens", exact: true });
    if (await nav.isVisible()) await activate(nav.getByRole("button", { name: "Cultures", exact: true }));
    await activate(board.getByRole("button", { name: /C-044.*Blank record/ }));
    assert(await board.getByText("Source count: 0", { exact: true }).isVisible(), "recorded zero was treated as absent");
    assert(await board.getByText("No marker records supplied", { exact: true }).isVisible());
  });

  await run("genome region, evidence and annotation export", async () => {
    const board = await open("genome", ".ge");
    const navigation = board.getByRole("navigation", { name: "Genome screens", exact: true });
    if (await navigation.isVisible()) await activate(navigation.getByRole("button", { name: "Evidence", exact: true }));
    await activate(board.getByRole("button", { name: "Aligned reads", exact: true }));
    assert.equal(await board.getByRole("button", { name: "Column 13, demo-01 position 13, reference A", exact: true }).getAttribute("aria-pressed"), "true", "the initial locus is missing from alignment selection");
    await activate(board.getByRole("button", { name: "Coverage", exact: true }));
    if (await navigation.isVisible()) await activate(navigation.getByRole("button", { name: "Region", exact: true }));
    const region = board.getByRole("group", { name: "Open a region", exact: true });
    await choose(region.getByRole("combobox", { name: "Contig", exact: true }), "Demo contig 02");
    await region.getByRole("spinbutton", { name: "Start", exact: true }).fill("17");
    await region.getByRole("spinbutton", { name: "End", exact: true }).fill("24");
    await activate(board.getByRole("button", { name: "Open region", exact: true }));
    assert(await board.getByText("1-based inclusive · 8 positions", { exact: true }).isVisible());
    const selection = board.locator(".ge-selection-card");
    assert.match(await selection.textContent(), /demo-02:17/);
    assert.equal((await selection.locator("strong").last().textContent()).trim(), "0", "recorded depth zero was lost");
    await activate(board.getByRole("button", { name: "Aligned reads", exact: true }));
    assert.equal(await board.getByRole("button", { name: "Column 1, demo-02 position 17, reference T", exact: true }).getAttribute("aria-pressed"), "true", "opening a region did not synchronize its selected locus with alignment");
    await activate(board.getByRole("button", { name: "Coverage", exact: true }));
    await choose(board.getByRole("combobox", { name: "Inspect position", exact: true }), "21 · Depth Not supplied");
    assert.equal((await selection.locator("strong").last().textContent()).trim(), "Missing", "missing depth became zero");
    await activate(board.getByRole("button", { name: "Aligned reads", exact: true }));
    const baseControl = board.getByRole("button", { name: "Column 1, demo-02 position 17, reference T", exact: true });
    await baseControl.focus(); await page.keyboard.press("ArrowRight"); await page.keyboard.press("Enter");
    assert.match(await selection.textContent(), /demo-02:18/, "aligned-column selection did not update the selected reference locus");
    await activate(board.getByRole("button", { name: "Annotate locus", exact: true }));
    const notebook = board.getByRole("region", { name: "Locus annotations", exact: true });
    const note = notebook.getByRole("textbox", { name: "Locus annotation", exact: true });
    await note.waitFor({ state: "visible" });
    await fit(board);
    await note.fill("Check this supplied read against the original record.");
    await activate(notebook.getByRole("button", { name: "Save annotation", exact: true }));
    assert(await notebook.getByText("Check this supplied read against the original record.", { exact: true }).isVisible());
    await note.fill("Unsaved text must stay out of the exported records.");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      activate(notebook.getByRole("button", { name: "Export all notes", exact: true })),
    ]);
    assert.equal(download.suggestedFilename(), "vlak-locus-annotations.json");
    const stream = await download.createReadStream();
    assert(stream, "download did not expose its actual exported data");
    const chunks = []; for await (const chunk of stream) chunks.push(chunk);
    const exported = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    assert.equal(exported.coordinateConvention, "1-based-inclusive");
    assert.equal(exported.fictional, true);
    assert.deepEqual(exported.region, { contig: "demo-02", start: 17, end: 24 });
    assert.equal(exported.annotations.length, 1);
    assert.deepEqual({ contig: exported.annotations[0].contig, position: exported.annotations[0].position, text: exported.annotations[0].text }, { contig: "demo-02", position: 18, text: "Check this supplied read against the original record." });
    assert.equal(await note.inputValue(), "Unsaved text must stay out of the exported records.");
  });

  await run("protein residue editing, exact diff and constraint review", async () => {
    const board = await open("protein", ".pr");
    const residue = board.getByRole("button", { name: "Residue 6, G", exact: true });
    await residue.focus(); await page.keyboard.press("ArrowLeft");
    assert(await focused(board.getByRole("button", { name: "Residue 5, A", exact: true })));
    await page.keyboard.press("ArrowRight"); await page.keyboard.press("Enter");
    const editor = board.getByRole("region", { name: "Sequence editor", exact: true });
    await choose(editor.getByRole("combobox", { name: "Replace residue 6", exact: true }), "A · Alanine");
    const sequence = editor.getByRole("textbox", { name: "Residue sequence", exact: true });
    assert.equal(await sequence.inputValue(), "GASGAAGASGAGGASGAG");
    await editor.getByRole("textbox", { name: "Variant name", exact: true }).fill("Review draft");
    await activate(editor.getByRole("button", { name: "Save variant", exact: true }));
    const comparison = board.getByRole("region", { name: "Variant comparison", exact: true });
    await comparison.getByRole("heading", { name: "Review draft", exact: true }).waitFor({ state: "visible" });
    await fit(board);
    assert.equal((await comparison.locator(".pr-difference-count strong").textContent()).trim(), "01");
    const row = comparison.getByRole("table", { name: "Changed positions", exact: true }).getByRole("row").nth(1);
    assert.deepEqual(await row.locator("th,td").allTextContents(), ["6", "G", "A"]);
    await activate(comparison.getByRole("button", { name: "Constraints", exact: true }));
    assert(await comparison.getByText("Needs attention", { exact: true }).isVisible(), "changing the fixed residue silently passed its constraint");
    assert(await comparison.getByText("Matches rule", { exact: true }).isVisible(), "a substitution changed the reported sequence length");
    await activate(comparison.getByRole("button", { name: "Record local review", exact: true }));
    assert(await comparison.getByRole("button", { name: "Review recorded locally", exact: true }).isDisabled());
    await activate(comparison.getByRole("button", { name: "Edit a copy", exact: true }));
    await fit(board);
    await editor.getByRole("textbox", { name: "Residue sequence", exact: true }).fill("*");
    assert(await editor.getByRole("button", { name: "Save variant", exact: true }).isDisabled(), "invalid residue symbols remained saveable");
    assert(await editor.getByText("Use standard one-letter amino-acid symbols, with at most 48 residues.", { exact: true }).isVisible());
  });
}
