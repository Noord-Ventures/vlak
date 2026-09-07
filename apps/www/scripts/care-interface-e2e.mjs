import assert from "node:assert/strict";

/** Local application and patient journeys, using the runner's viewport and page. */
export async function checkCareInterfaces({ page, base, fail }) {
  const check = async (name, run) => {
    try { await run(); }
    catch (error) { fail(`care interface ${name}: ${error instanceof Error ? error.message : String(error)}`); }
  };
  const activate = async control => { await control.focus(); await control.press("Enter"); };
  const prepare = async slug => {
    await page.goto(`${base}/interfaces/${slug}/`, { waitUntil: "networkidle" });
    await page.evaluate(key => localStorage.removeItem(key), `vlak-${slug}-demo-v1`);
    await page.reload({ waitUntil: "networkidle" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width: 100%; }" });
    return page.locator(".if-specimen");
  };
  const choose = async (control, index) => {
    await activate(control);
    await control.press("Home");
    for (let i = 0; i < index; i++) await control.press("ArrowDown");
    await control.press("Enter");
    assert.equal(await control.getAttribute("aria-expanded"), "false");
  };
  const fit = async (frame, docks) => {
    const geometry = await frame.evaluate((element, selectors) => {
      const frameRect = element.getBoundingClientRect();
      const visible = target => target.getClientRects().length && getComputedStyle(target).visibility !== "hidden";
      return {
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        overflow: element.scrollWidth - element.clientWidth,
        escapedDocks: [...element.querySelectorAll(selectors)].filter(visible).filter(target => {
          const rect = target.getBoundingClientRect();
          return rect.bottom > frameRect.bottom + 1 || rect.top < frameRect.top - 1 || rect.left < frameRect.left - 1 || rect.right > frameRect.right + 1;
        }).map(target => target.className),
        shortControls: [...element.querySelectorAll("button,input:not([type=hidden]),textarea")].filter(visible).filter(target => !target.closest('[aria-hidden="true"]')).filter(target => {
          // Vlak Checkbox uses a clipped input and a full-size wrapping label.
          const rect = (target.matches('input[type="checkbox"]') ? target.closest("label") : target)?.getBoundingClientRect();
          return rect && (rect.width < 43.5 || rect.height < 43.5);
        }).map(target => target.getAttribute("aria-label") || target.textContent || target.name),
      };
    }, docks);
    assert(geometry.pageOverflow <= 1, `page overflows by ${geometry.pageOverflow}px`);
    assert(geometry.overflow <= 1, `specimen overflows by ${geometry.overflow}px`);
    assert.deepEqual(geometry.escapedDocks, [], "a pinned action or navigation area escapes its screen");
    assert.deepEqual(geometry.shortControls, [], "a visible control has less than 44px reach");
  };

  await check("identity applicant to receipt", async () => {
    const frame = await prepare("identity");
    const name = frame.getByRole("textbox", { name: "Full name", exact: true });
    await name.fill("   ");
    assert.equal(await name.evaluate(element => element.checkValidity()), false, "blank applicant name passes native validation");
    await activate(frame.getByRole("button", { name: "Continue to evidence", exact: true }));
    assert.equal(await frame.locator(".id-app").getAttribute("data-stage"), "0");
    await name.fill("Avery Morgan");
    await fit(frame, ".id-actions,.id-footer");
    await activate(frame.getByRole("button", { name: "Continue to evidence", exact: true }));
    assert.equal(await frame.getByRole("heading", { name: "A little supporting evidence", exact: true }).isVisible(), true);
    const review = frame.getByRole("button", { name: "Review application", exact: true });
    assert.equal(await review.isDisabled(), true, "review can start without the required sample evidence");
    await activate(frame.getByRole("button", { name: "Attach sample portrait: Portrait photograph", exact: true }));
    await activate(frame.getByRole("button", { name: "Attach sample address: Proof of address", exact: true }));
    assert.equal(await review.isEnabled(), true);
    await activate(frame.getByRole("button", { name: "Remove sample: Portrait photograph", exact: true }));
    assert.equal(await review.isDisabled(), true, "removing evidence fails to block review");
    await activate(frame.getByRole("button", { name: "Attach sample portrait: Portrait photograph", exact: true }));
    await activate(review);
    assert.equal(await frame.locator(".rs-identity-document-holder").textContent(), "Avery Morgan");
    await fit(frame, ".id-actions,.id-footer");
    await activate(frame.getByRole("button", { name: "Back", exact: true }));
    assert.equal(await frame.getByText("Sample attached · Not verified", { exact: true }).count(), 2, "Back loses attached sample records");
    await activate(review);
    const confirmation = frame.getByRole("checkbox", { name: "I understand this creates a local demo receipt.", exact: true });
    await confirmation.focus();
    await confirmation.press("Space");
    await activate(frame.getByRole("button", { name: "Create local receipt", exact: true }));
    assert.equal(await frame.getByRole("heading", { name: "Your local receipt is ready", exact: true }).isVisible(), true);
    assert.equal(await frame.getByText("No further action is scheduled. No government submission was made.", { exact: true }).isVisible(), true);
    await page.reload({ waitUntil: "networkidle" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width: 100%; }" });
    assert.equal(await frame.getByRole("heading", { name: "Your local receipt is ready", exact: true }).isVisible(), true, "the receipt is not restored after reload");
    assert.match(await frame.locator(".rs-application-status").textContent(), /Avery Morgan/);
    assert.equal(await frame.getByText("Saved in this browser", { exact: true }).count(), 1);
    await fit(frame, ".id-actions,.id-footer");
  });

  await check("patient readings, care, and visit note", async () => {
    const frame = await prepare("patient");
    const nav = () => frame.locator(".pt-rail nav:visible,.pt-mobile-nav:visible");
    await activate(nav().getByRole("button", { name: "Readings", exact: true }));
    assert.equal(await frame.getByRole("list", { name: "September sample laboratory results", exact: true }).isVisible(), true);
    await choose(frame.getByRole("combobox", { name: "Report", exact: true }), 1);
    assert.equal(await frame.getByRole("list", { name: "August sample laboratory results", exact: true }).isVisible(), true);
    assert.match(await frame.locator(".rs-lab-results").textContent(), /13\.8/);
    await activate(nav().getByRole("button", { name: "Care", exact: true }));
    const questions = frame.getByRole("checkbox", { name: "Write down your questions", exact: true });
    await questions.focus(); await questions.press("Space");
    assert.equal(await questions.isChecked(), true);
    await activate(frame.getByRole("button", { name: "Record sample as taken: Sample medication", exact: true }));
    assert.equal(await frame.getByText("Recorded as taken locally", { exact: true }).isVisible(), true);
    const edit = frame.getByRole("button", { name: "Edit visit note", exact: true });
    await activate(edit);
    assert.equal(await frame.getByRole("heading", { name: "What’s on your mind?", exact: true }).isVisible(), true);
    await frame.getByRole("textbox", { name: "Your visit note", exact: true }).fill("Ask about the sample sleep record and prepare questions for the visit.");
    await choose(frame.getByRole("combobox", { name: "Preferred conversation format", exact: true }), 2);
    await fit(frame, ".pt-detail-head,.pt-detail-actions,.pt-footer");
    await activate(frame.getByRole("button", { name: "Save note", exact: true }));
    assert.equal(await frame.getByText("Ask about the sample sleep record and prepare questions for the visit.", { exact: true }).isVisible(), true);
    assert.equal(await frame.getByText("Local preference: Video conversation", { exact: true }).isVisible(), true);
    assert.equal(await edit.evaluate(element => element === document.activeElement), true, "saving does not restore the invoking control");
    assert.equal(await frame.locator(".rs-appointment-card-status").textContent(), "Sample appointment", "a local preference rewrites the appointment's supplied status");
    await fit(frame, ".pt-mobile-nav,.pt-footer");
    await page.reload({ waitUntil: "networkidle" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width: 100%; }" });
    await activate(nav().getByRole("button", { name: "Care", exact: true }));
    assert.equal(await questions.isChecked(), true, "the care task does not survive reload");
    assert.equal(await frame.getByText("Recorded as taken locally", { exact: true }).isVisible(), true);
    assert.equal(await frame.getByText("Local preference: Video conversation", { exact: true }).isVisible(), true);
    assert.equal(await frame.getByText("Ask about the sample sleep record and prepare questions for the visit.", { exact: true }).isVisible(), true);
    await activate(frame.getByRole("button", { name: "Clear local dose record: Sample medication", exact: true }));
    assert.equal(await frame.getByText("No dose record supplied", { exact: true }).isVisible(), true);
  });
}
