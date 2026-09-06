import { chooseWithKeyboard } from "./specialist-e2e.mjs";

/** Chromium's real meter shadow styles; host pseudo queries can hide its native gradients. */
export async function checkAudioMeterPaint(page, context, fail) {
  const preview = page.locator(".preview-box");
  const meters = preview.getByRole("meter");
  const values = await meters.evaluateAll(elements => elements.map(element => ({ min: element.min, max: element.max, value: element.value, text: element.getAttribute("aria-valuetext") })));
  if (JSON.stringify(values) !== JSON.stringify([{ min: -60, max: 0, value: -12, text: "-12 dB" }, { min: -60, max: 0, value: -15, text: "-15 dB" }])) fail(`audio meter ${context}: native accessible values changed: ${JSON.stringify(values)}`);
  for (const name of ["Output Left", "Output Right"]) if (await preview.getByRole("meter", { name, exact: true }).count() !== 1) fail(`audio meter ${context}: the native meter lost its ${name} accessible name`);
  const colors = await meters.first().evaluate(element => ({ ink: getComputedStyle(element).color, paper: getComputedStyle(element).backgroundColor }));
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("DOM.enable");
    await session.send("CSS.enable");
    const { root } = await session.send("DOM.getDocument");
    const { nodeIds } = await session.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: ".preview-box meter" });
    for (const nodeId of nodeIds) {
      const { node } = await session.send("DOM.describeNode", { nodeId, depth: -1, pierce: true });
      const parts = [];
      const visit = child => {
        const attributes = child.attributes ?? [];
        const pseudo = attributes[attributes.indexOf("pseudo") + 1];
        if (["-webkit-meter-bar", "-webkit-meter-optimum-value"].includes(pseudo)) parts.push({ node: child, pseudo });
        for (const next of [...child.children ?? [], ...child.shadowRoots ?? []]) visit(next);
      };
      visit(node);
      if (parts.length !== 2) fail(`audio meter ${context}: expected the native track and value shadow parts, found ${parts.length}`);
      for (const part of parts) {
        // describeNode may expose a backend id without assigning a frontend id.
        const { nodeIds: ids } = await session.send("DOM.pushNodesByBackendIdsToFrontend", { backendNodeIds: [part.node.backendNodeId] });
        const { computedStyle } = await session.send("CSS.getComputedStyleForNode", { nodeId: ids[0] });
        const style = Object.fromEntries(computedStyle.map(property => [property.name, property.value]));
        if (style["background-image"] !== "none") fail(`audio meter ${context}: ${part.pseudo} retains ${style["background-image"]}`);
        const expected = part.pseudo === "-webkit-meter-optimum-value" ? colors.ink : colors.paper;
        if (style["background-color"] !== expected) fail(`audio meter ${context}: ${part.pseudo} uses ${style["background-color"]}, expected ${expected}`);
        const channels = style["background-color"].match(/[\d.]+/g)?.slice(0, 3).map(Number);
        if (channels?.length !== 3 || channels[0] !== channels[1] || channels[1] !== channels[2]) {
          // Paper can be warm; the value must remain the supplied monochrome ink.
          if (part.pseudo === "-webkit-meter-optimum-value") fail(`audio meter ${context}: native value paint is not monochrome: ${style["background-color"]}`);
        }
      }
    }
  } finally {
    await session.detach();
  }
}

/** Civic, science and creative specimens: mobile reach, both themes and real keyboard edits. */
export async function checkDomainCollections({ browser, base, components, axeSource, fail }) {
  const categories = ["civic", "science", "creative", "engineering", "geospatial", "robotics", "electronics", "microbiology"];
  const specimens = components.filter(component => categories.includes(component.category));
  for (const category of categories) if (!specimens.some(component => component.category === category)) fail(`${category}: no components are included in the domain checks`);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const go = async name => {
    await page.goto(`${base}/components/${name}/`, { waitUntil: "networkidle" });
    return page.locator(".preview-box");
  };
  const check = async (name, run) => {
    try { await run(); } catch (error) { fail(`${name}: ${error instanceof Error ? error.message : String(error)}`); }
  };
  const replaceWithKeyboard = async (field, value) => {
    await field.focus();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.type(value);
  };
  try {
    for (const colorScheme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme });
      for (const component of specimens) await check(`${component.category} ${component.name} ${colorScheme}`, async () => {
        await go(component.name);
        if (component.name === "audio-meter") await checkAudioMeterPaint(page, `${colorScheme} mobile`, fail);
        // Open the supplied numeric table as well, so its controls and table
        // semantics are checked in the same mobile themes as the chart.
        if (component.name === "spectrum-plot") {
          await page.locator(".preview-box summary").focus();
          await page.keyboard.press("Enter");
          if (!(await page.locator(".preview-box details").evaluate(element => element.open))) fail(`science spectrum-plot ${colorScheme}: keyboard cannot open the data table`);
        }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 1) fail(`${component.category} ${component.name} ${colorScheme}: ${overflow}px page overflow at 390px`);
        const small = await page.locator(".preview-box, .rs-scene").evaluateAll(roots => roots.flatMap(root => [...root.querySelectorAll('button, input:not([type="hidden"]), select, textarea, summary, a[href], [role="slider"], [role="switch"]')])
          .filter((element, index, all) => all.indexOf(element) === index && element.getClientRects().length && !element.closest('[aria-hidden="true"]') && getComputedStyle(element).visibility !== "hidden")
          .map(element => {
            // A visually hidden native choice still uses its complete label as
            // the clickable target. Number inputs and selects use their own box.
            const target = element instanceof HTMLInputElement && ["checkbox", "radio"].includes(element.type) ? element.labels?.[0] ?? element : element;
            const rect = target.getBoundingClientRect();
            return { name: element.getAttribute("aria-label") || target.textContent?.trim() || element.tagName, width: rect.width, height: rect.height };
          })
          .filter(rect => rect.width < 43.9 || rect.height < 43.9));
        for (const rect of small) fail(`${component.category} ${component.name} ${colorScheme}: target ${rect.name} is ${rect.width} × ${rect.height}, below 44px`);
        await page.addScriptTag({ content: axeSource });
        const violations = await page.evaluate(async () => (await axe.run(document.querySelector("main"), {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
        })).violations.map(violation => ({ id: violation.id, targets: violation.nodes.map(node => node.target) })));
        for (const violation of violations) fail(`${component.category} ${component.name} ${colorScheme}: axe ${JSON.stringify(violation)}`);
      });
    }

    await page.setViewportSize({ width: 1280, height: 900 });
    for (const colorScheme of ["light", "dark"]) await check(`creative audio-meter ${colorScheme} desktop paint`, async () => {
      await page.emulateMedia({ colorScheme });
      await go("audio-meter");
      await checkAudioMeterPaint(page, `${colorScheme} desktop`, fail);
    });
    await page.setViewportSize({ width: 390, height: 844 });

    await check("science quantity-field keyboard conversion", async () => {
      const preview = await go("quantity-field");
      const amount = preview.getByRole("spinbutton", { name: "Amount", exact: true });
      const unit = preview.getByRole("combobox", { name: "Unit", exact: true });
      if (await amount.inputValue() !== "250" || (await unit.textContent()).trim() !== "µL") fail("science quantity-field: the preview must begin with the supplied 250 µL quantity");
      await chooseWithKeyboard(page, unit, "mL");
      if ((await unit.textContent()).trim() !== "mL" || Number(await amount.inputValue()) !== 0.25) fail("science quantity-field: choosing mL by keyboard must preserve the volume as 0.25 mL in this preview");
      await replaceWithKeyboard(amount, "0.5");
      if (Number(await amount.inputValue()) !== 0.5 || (await unit.textContent()).trim() !== "mL") fail("science quantity-field: a keyboard amount edit loses the selected unit");
    });

    await check("microbiology well-plate keyboard selection", async () => {
      const preview = await go("well-plate");
      const first = preview.getByRole("button", { name: "Well A, 1, Control: Loaded", exact: true });
      await first.focus();
      await page.keyboard.press("ArrowRight");
      const next = preview.getByRole("button", { name: "Well A, 2, Sample 042: Loaded", exact: true });
      if (!(await next.evaluate(element => element === document.activeElement))) fail("microbiology well-plate: ArrowRight cannot reach the adjacent recorded sample");
      if (await first.locator("..").getAttribute("aria-selected") !== "true") fail("microbiology well-plate: moving focus unexpectedly changes selection");
      await page.keyboard.press("Space");
      if (await next.locator("..").getAttribute("aria-selected") !== "true" || await first.locator("..").getAttribute("aria-selected") !== "false") fail("microbiology well-plate: Space does not select the focused sample");
      await page.keyboard.press("Home");
      await page.keyboard.press("ArrowDown");
      const unrecorded = preview.getByRole("button", { name: "Well C, 1: Unrecorded", exact: true });
      if (!(await unrecorded.evaluate(element => element === document.activeElement))) fail("microbiology well-plate: vertical navigation does not skip reserved disabled B1");
    });

    await check("microbiology colony-plate source records", async () => {
      const preview = await go("colony-plate");
      const first = preview.getByRole("button", { name: "Select 1. Colony 01", exact: true });
      await first.focus();
      await page.keyboard.press("Enter");
      if (await first.getAttribute("aria-pressed") !== "true" || await preview.getByRole("status").textContent() !== "Selected record: Colony 01") fail("microbiology colony-plate: keyboard selection does not reach the supplied record");
      if (!(await preview.getByText("Source count: 12", { exact: true }).isVisible()) || !(await preview.getByText("4 marker records supplied; 3 positioned", { exact: true }).isVisible())) fail("microbiology colony-plate: selection changes source counts or confuses records with positioned markers");
      const missing = preview.getByRole("button", { name: "Select 4. Colony 04", exact: true });
      await missing.focus();
      await page.keyboard.press("Space");
      if (await preview.getByRole("status").textContent() !== "Selected record: Colony 04" || !(await preview.getByText("Position not supplied", { exact: true }).isVisible())) fail("microbiology colony-plate: an unpositioned record cannot be inspected");
    });

    await check("microbiology culture-log recording action", async () => {
      const preview = await go("culture-log");
      const observations = await preview.getByRole("listitem").allTextContents();
      await preview.getByRole("button", { name: "Record review: C-042", exact: true }).focus();
      await page.keyboard.press("Enter");
      if (!(await preview.getByText("Record review noted", { exact: true }).isVisible())) fail("microbiology culture-log: keyboard action does not reach the host record");
      if (JSON.stringify(await preview.getByRole("listitem").allTextContents()) !== JSON.stringify(observations)) fail("microbiology culture-log: record review changes supplied laboratory observations");
    });

    await check("creative parameter-knob keyboard adjustment", async () => {
      const preview = await go("parameter-knob");
      const knob = preview.getByRole("slider", { name: "Mix", exact: true });
      const before = Number(await knob.inputValue());
      await knob.focus();
      await page.keyboard.press("ArrowUp");
      const after = Number(await knob.inputValue());
      if (after !== before + 1 || await knob.getAttribute("aria-valuetext") !== `${after} %` || !(await preview.getByText(`${after} %`, { exact: true }).isVisible())) fail("creative parameter-knob: keyboard adjustment is not reflected in the numeric reading and accessible value");
    });

    await check("creative timecode-field keyboard validation", async () => {
      const preview = await go("timecode-field");
      const field = preview.getByRole("textbox", { name: "In point", exact: true });
      // This raw specimen declares 24 fps: frame 24 is invalid and frame 23 is valid.
      await replaceWithKeyboard(field, "00:00:00:24");
      if (await field.getAttribute("aria-invalid") !== "true" || await field.evaluate(element => element.checkValidity())) fail("creative timecode-field: frame 24 is accepted in the supplied 24 fps record");
      await replaceWithKeyboard(field, "00:00:00:23");
      if (await field.inputValue() !== "00:00:00:23" || await field.getAttribute("aria-invalid") === "true" || !(await field.evaluate(element => element.checkValidity()))) fail("creative timecode-field: a valid keyboard edit does not clear validation");
    });

    await check("creative layer-stack keyboard actions", async () => {
      const preview = await go("layer-stack");
      const background = preview.getByRole("button", { name: "Background", exact: true });
      await background.focus();
      await page.keyboard.press("Space");
      if (await background.getAttribute("aria-pressed") !== "true" || await preview.getByRole("button", { name: "Title", exact: true }).getAttribute("aria-pressed") !== "false") fail("creative layer-stack: keyboard selection does not move to Background");
      const visibility = preview.getByRole("button", { name: "Title visibility", exact: true });
      await visibility.focus();
      await page.keyboard.press("Space");
      if (await visibility.getAttribute("aria-pressed") !== "false" || !(await preview.getByText("Hidden · Unlocked", { exact: true }).isVisible())) fail("creative layer-stack: keyboard visibility toggle does not hide Title");
      await preview.getByRole("button", { name: "Move Title down", exact: true }).focus();
      await page.keyboard.press("Enter");
      const order = await preview.getByRole("button", { name: /^(Title|Background)$/ }).allTextContents();
      if (order.join(",") !== "Background,Title") fail(`creative layer-stack: Move Title down leaves the displayed order as ${order.join(", ")}`);
    });

    await check("creative spacing-control linked keyboard edits", async () => {
      const preview = await go("spacing-control");
      const link = preview.getByRole("button", { name: "Link sides", exact: true });
      await link.focus();
      await page.keyboard.press("Space");
      if (await link.getAttribute("aria-pressed") !== "true") fail("creative spacing-control: keyboard activation does not link the sides");
      await replaceWithKeyboard(preview.getByRole("spinbutton", { name: "Top (px)", exact: true }), "32");
      for (const side of ["Top", "Right", "Bottom", "Left"]) if (await preview.getByRole("spinbutton", { name: `${side} (px)`, exact: true }).inputValue() !== "32") fail(`creative spacing-control: a linked edit did not reach ${side}`);
      await link.focus();
      await page.keyboard.press("Space");
      await replaceWithKeyboard(preview.getByRole("spinbutton", { name: "Right (px)", exact: true }), "48");
      if (await preview.getByRole("spinbutton", { name: "Right (px)", exact: true }).inputValue() !== "48" || await preview.getByRole("spinbutton", { name: "Top (px)", exact: true }).inputValue() !== "32") fail("creative spacing-control: unlinked editing fails to preserve the other sides");
    });

    await check("civic evidence-checklist keyboard action", async () => {
      const preview = await go("evidence-checklist");
      const action = preview.getByRole("button", { name: "Mark for replacement: Proof of address", exact: true });
      await action.focus();
      await page.keyboard.press("Enter");
      if (!(await preview.getByText("Marked for replacement, in this example", { exact: true }).isVisible())) fail("civic evidence-checklist: the keyboard action does not update the supplied evidence record");
      if (await action.count()) fail("civic evidence-checklist: the consumed replacement action remains available");
      if (!(await preview.getByText("Not supplied", { exact: true }).isVisible())) fail("civic evidence-checklist: updating one item changes another item's missing state");
    });
  } finally {
    await page.close();
  }
}
