import assert from "node:assert/strict";

/** Keep real rendering time for the sweep; use the browser clock for ten-second copy changes. */
export async function checkActivityRingDelight({ browser, base, fail }) {
  const rootSelector = ".preview-box .rs-activity-rings";
  const arcSelector = `${rootSelector} .rs-activity-rings-arc`;
  const targets = [40, 37.5, 30];
  const check = async (name, options, run) => {
    const page = await browser.newPage(options);
    page.setDefaultTimeout(5000);
    try { await run(page); } catch (error) { fail(`activity rings ${name}: ${error instanceof Error ? error.message : String(error)}`); }
    finally { await page.close(); }
  };
  const open = async page => {
    await page.goto(`${base}/components/activity-rings/`, { waitUntil: "networkidle" });
    return page.locator(rootSelector);
  };
  const activate = async (page, name) => {
    await page.locator(rootSelector).getByRole("button", { name, exact: true }).focus();
    await page.keyboard.press("Enter");
  };
  const numericRecords = root => root.locator("progress").evaluateAll(elements => elements.map(element => ({ value: element.value, max: element.max, text: element.getAttribute("aria-valuetext") })));
  const expectedRecords = [
    { value: 18, max: 30, text: "18 of 30 minutes" },
    { value: 5, max: 8, text: "5 of 8 breaks" },
    { value: 7, max: 10, text: "7 of 10 hours" },
  ];
  const offsets = page => page.locator(arcSelector).evaluateAll(elements => elements.map(element => Number.parseFloat(getComputedStyle(element).strokeDashoffset)));
  const finalOffsets = values => {
    assert.equal(values.length, targets.length, "all recorded goals must retain their arcs");
    values.forEach((value, index) => { assert.ok(Math.abs(value - targets[index]) < 0.001, `ring ${index + 1} ends at ${value}, expected ${targets[index]}`); });
  };

  await check("first-view sweep", { viewport: { width: 1024, height: 200 }, reducedMotion: "no-preference" }, async page => {
    const root = await open(page);
    const box = await root.boundingBox();
    assert.ok(box && box.y >= 200, "the specimen must begin below the small viewport to exercise first entry");
    assert.deepEqual(await numericRecords(root), expectedRecords, "numeric records are delayed by the visual animation");
    assert.deepEqual(await root.locator(".rs-activity-rings-value").allTextContents(), ["18 of 30 minutes", "5 of 8 breaks", "7 of 10 hours"]);
    const before = await page.locator(arcSelector).evaluateAll(elements => elements.map(element => {
      const style = getComputedStyle(element);
      return { offset: Number.parseFloat(style.strokeDashoffset), playState: style.animationPlayState, delay: Number.parseFloat(style.animationDelay), duration: Number.parseFloat(style.animationDuration), name: style.animationName };
    }));
    assert.equal(before.length, 3);
    before.forEach((arc, index) => {
      assert.equal(arc.playState, "paused", "a ring animates before entering the viewport");
      assert.equal(arc.offset, 100, "the waiting arc is already at its completed amount");
      assert.equal(arc.delay, index / 10, "ring delays do not preserve the stagger");
      assert.equal(arc.duration, 1);
      assert.notEqual(arc.name, "none");
    });
    // Sampling in the page observes actual CSS interpolation, without setting its
    // animation time or replacing IntersectionObserver with a test double.
    const samples = await root.evaluate(element => new Promise(resolve => {
      const arcs = [...element.querySelectorAll(".rs-activity-rings-arc")];
      const readings = [];
      const began = performance.now();
      let done = false;
      const deadline = setTimeout(() => { done = true; resolve(readings); }, 3000);
      element.scrollIntoView({ block: "start", behavior: "instant" });
      const sample = () => {
        if (done) return;
        readings.push(arcs.map(arc => Number.parseFloat(getComputedStyle(arc).strokeDashoffset)));
        if (performance.now() - began >= 1350) { done = true; clearTimeout(deadline); resolve(readings); }
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }));
    targets.forEach((target, index) => { assert.ok(samples.some(sample => sample[index] < 99.9 && sample[index] > target + 0.1), `ring ${index + 1} does not sweep through intermediate amounts`); });
    finalOffsets(samples.at(-1));
    assert.deepEqual(await numericRecords(root), expectedRecords, "the sweep changes reported progress values");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(100);
    await root.evaluate(element => element.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.waitForTimeout(100);
    finalOffsets(await offsets(page));
    assert.equal(await root.locator(".rs-activity-rings-waiting").count(), 0, "a subsequent view restarts the entry animation");
  });

  await check("encouragement timing and pause", { viewport: { width: 1024, height: 900 }, reducedMotion: "no-preference" }, async page => {
    await page.clock.install({ time: new Date("2026-01-01T12:00:00Z") });
    const root = await open(page);
    await root.scrollIntoViewIfNeeded();
    const line = root.locator(".rs-activity-rings-encouragement-text");
    assert.equal(await line.textContent(), "Small steps still count.");
    assert.equal(await line.getAttribute("aria-live"), "off", "rotating copy repeatedly interrupts assistive technology");
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    // Restart the interval at a known browser-clock instant through the actual
    // pause control, then verify both sides of its ten-second boundary.
    await activate(page, "Pause encouragement");
    const initial = await line.textContent();
    await page.clock.fastForward(20000);
    assert.equal(await line.textContent(), initial, "copy rotates while paused");
    await activate(page, "Resume encouragement");
    await page.clock.fastForward(9999);
    assert.equal(await line.textContent(), initial, "copy rotates before ten seconds");
    await page.clock.fastForward(1);
    let previous = await line.textContent();
    assert.ok(previous?.trim() && previous !== initial, "copy does not rotate at ten seconds");
    for (let turn = 0; turn < 3; turn++) {
      await page.clock.fastForward(10000);
      const next = await line.textContent();
      assert.ok(next?.trim() && next !== previous, "consecutive encouragement lines repeat");
      previous = next;
    }
    await activate(page, "Pause encouragement");
    await page.clock.fastForward(30000);
    assert.equal(await line.textContent(), previous, "pausing after rotation leaves a timer running");
    await activate(page, "Resume encouragement");
    await page.clock.fastForward(10000);
    assert.notEqual(await line.textContent(), previous, "resuming does not restart the rotation");
    assert.deepEqual(await numericRecords(root), expectedRecords, "encouragement changes the activity record");
  });

  await check("reduced motion", { viewport: { width: 1024, height: 900 }, reducedMotion: "reduce" }, async page => {
    await page.clock.install({ time: new Date("2026-01-01T12:00:00Z") });
    const root = await open(page);
    await root.scrollIntoViewIfNeeded();
    finalOffsets(await offsets(page));
    const motion = await page.locator(arcSelector).evaluateAll(elements => elements.map(element => ({ name: getComputedStyle(element).animationName, transition: getComputedStyle(element).transitionDuration })));
    for (const arc of motion) {
      assert.equal(arc.name, "none", "reduced motion still sweeps the rings");
      assert.equal(arc.transition, "0s", "reduced motion retains the amount transition");
    }
    const line = root.locator(".rs-activity-rings-encouragement-text");
    const initial = await line.textContent();
    assert.ok(initial?.trim());
    assert.equal(await line.evaluate(element => getComputedStyle(element).animationName), "none");
    assert.equal(await root.getByRole("button", { name: /^(Pause|Resume) encouragement$/ }).count(), 0);
    await page.clock.fastForward(30000);
    assert.equal(await line.textContent(), initial, "reduced motion still rotates the text");
    finalOffsets(await offsets(page));
    assert.deepEqual(await numericRecords(root), expectedRecords);
  });
}
