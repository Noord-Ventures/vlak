import assert from "node:assert/strict";

/** Local engineering flows, called with the runner's desktop or mobile page. */
export async function checkEngineeringInterfaces({ page, base, fail }) {
  const activate = async control => {
    await control.press("Enter");
    // Complete the board's intentional heading/composer focus before the next key.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  const open = async slug => {
    await page.goto(`${base.replace(/\/$/, "")}/interfaces/${slug}/`, { waitUntil: "networkidle" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width: 100%; }" });
  };
  const check = async (name, run) => {
    try { await run(); } catch (error) { fail(`engineering interface ${name}: ${error instanceof Error ? error.message : String(error)}`); }
  };

  await check("robotics telemetry and confirmed targets", async () => {
    await open("robotics");
    const board = page.locator(".rb");
    await board.waitFor();
    const pause = board.getByRole("button", { name: "Pause", exact: true });
    const resume = board.getByRole("button", { name: "Resume", exact: true });
    if (await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      // Resume appears only after the reduced-motion effect has hydrated the board.
      await resume.waitFor({ state: "visible" });
    } else {
      await page.waitForFunction(() => document.querySelector(".rb-number")?.textContent !== "Sample 000");
      await activate(pause);
      await resume.waitFor({ state: "visible" });
    }
    const previous = await board.locator(".rb-number").textContent();
    await activate(resume);
    await page.waitForFunction(before => document.querySelector(".rb-number")?.textContent !== before, previous);
    await activate(pause);
    const paused = await board.locator(".rb-number").textContent();
    await page.waitForTimeout(1150);
    assert.equal(await board.locator(".rb-number").textContent(), paused, "paused samples continue changing");
    await activate(board.locator(".rb-joint-row").filter({ hasText: "Elbow" }));
    const reported = await board.locator(".rs-joint-panel-reading").textContent();
    await board.getByRole("spinbutton", { name: "Elbow draft target (deg)", exact: true }).fill("-25");
    assert.equal(await board.locator(".rs-joint-panel-reading").textContent(), reported, "typing changed a reported joint position");
    await activate(board.getByRole("button", { name: "Request targets", exact: true }));
    assert.equal(await board.locator(".rs-joint-panel-reading").textContent(), reported, "requesting changed a reported joint position");
    assert.equal(await board.getByRole("button", { name: "Request targets", exact: true }).isDisabled(), true, "pending request remains enabled");
    await activate(board.getByRole("button", { name: "Confirm simulation", exact: true }));
    assert.equal(await board.locator(".rs-joint-panel-reading").textContent(), "Reported: -25 deg", "confirmation does not update the local simulator");
    assert.equal(await board.getByRole("button", { name: "Resume", exact: true }).isVisible(), true, "confirmation does not pause the stream");
    const back = board.getByRole("button", { name: "Back to monitor", exact: true });
    if (await back.isVisible()) await activate(back);
    await activate(board.locator(".rb-joint-row").filter({ hasText: "Shoulder" }));
    assert.equal(await board.getByText(/Host confirmation:/).count(), 0, "another joint inherits the previous joint's confirmation");
    await activate(board.getByRole("button", { name: "Debug", exact: true }));
    await activate(board.getByRole("button", { name: /Simulated target applied/ }));
    assert.match(await board.locator(".rb-event-detail").textContent(), /no motion command was sent/, "event omits the local-only operation");
    await activate(board.getByRole("button", { name: "All events", exact: true }));
    await page.waitForFunction(() => document.activeElement?.textContent?.includes("Simulated target applied"));
    await activate(board.getByRole("button", { name: "Mission", exact: true }));
    await activate(board.getByRole("button", { name: "Review step: step 1, Approach fixture", exact: true }));
    assert.equal(await board.getByText("Recorded: Reviewed locally", { exact: true }).count(), 1, "mission review does not update the supplied local record");
  });

  await check("circuitry proposal review and application", async () => {
    await open("circuitry");
    const board = page.locator(".cb");
    await board.waitFor();
    await activate(board.locator(".cb-pad-marker").nth(2));
    assert.equal(await board.locator(".cb-pad-marker").nth(2).getAttribute("aria-pressed"), "true", "pad selection does not reach the board");
    await activate(board.getByRole("button", { name: "Assistant", exact: true }));
    assert.equal(await board.getByText("Local prompt templates. No remote model.", { exact: true }).count(), 1, "local template model is not explained");
    await activate(board.getByRole("button", { name: "Prepare proposal", exact: true }));
    await board.getByRole("textbox", { name: "Proposed net name", exact: true }).fill("Main rail");
    assert.match(await board.locator(".cb-selection").textContent(), /Supply/, "draft proposal changed the current net");
    await board.getByRole("textbox", { name: "Change note", exact: true }).fill("Match the supplied connector naming.");
    await activate(board.getByRole("button", { name: "Apply proposal", exact: true }));
    assert.match(await board.locator(".cb-selection").textContent(), /Main rail/, "applied net label is missing");
    assert.match(await board.locator(".cb-notes").textContent(), /Match the supplied connector naming/, "change note was not recorded");
    assert.match(await board.locator(".cb-pad-marker").first().getAttribute("aria-label"), /Main rail/, "another pad on the same supplied net kept its old name");
    await activate(board.getByRole("button", { name: "Omit R3 from Pilot", exact: true }));
    await activate(board.getByRole("button", { name: "Prepare proposal", exact: true }));
    assert.equal(await board.locator(".cb-resistor[data-populated]").getAttribute("data-populated"), "true", "assembly proposal changed the board before review");
    await activate(board.getByRole("button", { name: "Apply proposal", exact: true }));
    assert.equal(await board.locator(".cb-resistor[data-populated]").getAttribute("data-populated"), "false", "applied population was not reflected in the board");
    assert.equal(await board.locator(".cb-history-row").count(), 2, "proposal history did not retain both accepted changes");
    await board.getByRole("textbox", { name: "Describe a board change", exact: true }).fill("Invent a new circuit");
    await activate(board.getByRole("button", { name: "Prepare proposal", exact: true }));
    assert.equal(await board.locator(".cb-proposal").count(), 0, "unsupported prompt invented a proposal");
    assert.match(await board.locator(".cb-feedback").textContent(), /No matching local template/, "unsupported prompt has no explanation");
    await activate(board.getByRole("button", { name: "Checks", exact: true }));
    assert.match(await board.locator(".cb-stale").textContent(), /2 local changes/, "checks do not explain the changed board revision");
    assert.match(await board.locator(".cb-stale").textContent(), /not been computed or rerun/, "sample checks imply a real rerun");
    assert.equal(await board.getByText("Open", { exact: true }).count(), 1, "applying proposals silently resolved the sample finding");
  });
}
