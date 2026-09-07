/** Health specimens: real keyboard state changes, rendered targets, and both themes. */
export async function checkHealthCollection({ browser, base, components, axeSource, fail }) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  try {
    for (const colorScheme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme });
      for (const component of components.filter(item => item.category === "health")) {
        await page.goto(`${base}/components/${component.name}/`, { waitUntil: "networkidle" });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 1) fail(`health ${component.name} ${colorScheme}: ${overflow}px horizontal overflow`);
        const small = await page.locator(".preview-box button, .preview-box input:not([type=hidden]), .preview-box summary, .rs-scene button, .rs-scene input:not([type=hidden]), .rs-scene summary").evaluateAll(elements => elements
          .filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== "hidden")
          .map(element => {
            // Native checkbox/radio labels are clickable targets, including
            // controls whose input is visually hidden inside that label.
            const target = element instanceof HTMLInputElement && ["checkbox", "radio"].includes(element.type)
              ? element.labels?.[0] ?? element : element;
            const rect = target.getBoundingClientRect();
            return { name: element.getAttribute("aria-label") || target.textContent?.trim() || element.tagName, width: rect.width, height: rect.height };
          })
          .filter(rect => rect.width < 43.9 || rect.height < 43.9));
        for (const rect of small) fail(`health ${component.name} ${colorScheme}: target ${rect.name} is ${rect.width} × ${rect.height}`);
        await page.addScriptTag({ content: axeSource });
        const violations = await page.evaluate(async () => (await axe.run(document.querySelector("main"), {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
        })).violations.map(violation => ({ id: violation.id, targets: violation.nodes.map(node => node.target) })));
        for (const violation of violations) fail(`health ${component.name} ${colorScheme}: axe ${JSON.stringify(violation)}`);
      }
    }

    await page.goto(`${base}/components/check-in/`, { waitUntil: "networkidle" });
    const checkIn = page.locator(".preview-box");
    await checkIn.getByRole("radio", { name: "Low", exact: true }).focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowRight");
    if (!(await checkIn.getByRole("radio", { name: "Steady", exact: true }).isChecked())) fail("health check-in: native arrow keys do not update the answer");
    await checkIn.getByRole("button", { name: "Clear answer" }).click();
    if (await checkIn.locator("input:checked").count()) fail("health check-in: Clear answer retains a selected option");

    await page.goto(`${base}/components/habit-tracker/`, { waitUntil: "networkidle" });
    const day = page.locator(".preview-box").getByRole("button", { name: "Sunday: completion", exact: true });
    await day.focus();
    await page.keyboard.press("Space");
    if (await day.getAttribute("aria-pressed") !== "true") fail("health habit tracker: Space does not record completion");

    await page.goto(`${base}/components/medication-schedule/`, { waitUntil: "networkidle" });
    const record = page.locator(".preview-box").getByRole("button", { name: /Record as taken/ });
    await record.focus();
    await page.keyboard.press("Enter");
    if (!(await page.locator(".preview-box").getByText("Recorded as taken", { exact: true }).isVisible())) fail("health medication: demo does not display the recorded action");

    await page.goto(`${base}/components/care-plan/`, { waitUntil: "networkidle" });
    const task = page.locator(".preview-box").getByRole("checkbox", { name: "Complete the daily journal" });
    await task.focus();
    await page.keyboard.press("Space");
    if (!(await task.isChecked())) fail("health care plan: keyboard completion does not update the demo");

    await page.goto(`${base}/components/symptom-diary/`, { waitUntil: "networkidle" });
    await page.locator(".preview-box summary").focus();
    await page.keyboard.press("Enter");
    if (!(await page.locator(".preview-box details").evaluate(element => element.open))) fail("health symptom diary: Enter does not open the details");

    // A range's value, bounds, interval and marker must share a coherent axis.
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const name of ["reference-range", "lab-results"]) {
        await page.goto(`${base}/components/${name}/`, { waitUntil: "networkidle" });
        const layout = await page.locator(".preview-box").evaluate(box => {
          const style = getComputedStyle(box);
          const available = box.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight);
          const root = box.querySelector(".rs-lab-results, .rs-reference-range");
          return {
            available,
            width: root.getBoundingClientRect().width,
            ranges: [...box.querySelectorAll(".rs-reference-range")].map(range => {
              const track = range.querySelector(".rs-reference-range-track").getBoundingClientRect();
              const marker = range.querySelector(".rs-reference-range-marker")?.getBoundingClientRect();
              const interval = range.querySelector(".rs-reference-range-interval")?.getBoundingClientRect();
              const value = range.querySelector(".rs-reference-range-value").getBoundingClientRect();
              const bound = range.querySelector(".rs-reference-range-bound-value").getBoundingClientRect();
              return { center: track.y + track.height / 2, marker: marker && marker.y + marker.height / 2, interval: interval && interval.y + interval.height / 2, valueEnd: value.right, boundEnd: bound.right };
            }),
          };
        });
        if (Math.abs(layout.width - layout.available) > 2) fail(`health ${name} ${width}: specimen does not fill its available width`);
        for (const range of layout.ranges) {
          if (range.marker != null && Math.abs(range.marker - range.center) > 1) fail(`health ${name} ${width}: marker is off the range axis`);
          if (range.interval != null && Math.abs(range.interval - range.center) > 1) fail(`health ${name} ${width}: interval is off the range axis`);
          if (Math.abs(range.valueEnd - range.boundEnd) > 1) fail(`health ${name} ${width}: reading and reference bounds are misaligned`);
        }
      }
    }
    await page.goto(`${base}/components/activity-rings/`, { waitUntil: "networkidle" });
    const rings = page.locator(".preview-box");
    if (await rings.getByRole("progressbar").count() !== 3) fail("health activity rings: each personal goal needs named progress");
    if (await rings.locator("svg circle.rs-activity-rings-arc").count() !== 3) fail("health activity rings: the three recorded goals are not drawn");
  } finally {
    await page.close();
  }
}
