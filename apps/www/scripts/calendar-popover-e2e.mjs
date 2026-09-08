import assert from "node:assert/strict";

const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) <= 1, `${message}: ${actual} versus ${expected}`);

export async function checkCalendarPopover({ page, base, fail }) {
  const viewport = page.viewportSize();
  let rootFontSize = null;
  let stage = "opening the gallery picker";
  try {
    await page.goto(`${base}/components/calendar-popover/`, { waitUntil: "networkidle" });
    rootFontSize = await page.evaluate(() => ({ value: document.documentElement.style.getPropertyValue("font-size"), priority: document.documentElement.style.getPropertyPriority("font-size") }));
    const fieldFor = name => page.locator(".rs-calendar-popover").filter({ has: page.getByRole("textbox", { name, exact: true }) });
    const date = page.getByRole("textbox", { name: "Deadline", exact: true });
    const field = fieldFor("Deadline");
    const trigger = field.getByRole("button", { name: "Open calendar", exact: true });
    const panel = field.locator(".rs-calendar-popover-panel:popover-open");
    const placeField = async control => {
      await control.evaluate(element => {
        element.scrollIntoView({ block: "start", behavior: "instant" });
        window.scrollTo({ top: window.scrollY - 120, behavior: "instant" });
      });
    };
    const measure = async (root, popup, enlargedText = false) => {
      const anchor = await root.locator(".rs-calendar-popover-control").boundingBox();
      const geometry = await popup.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const header = element.querySelector(".rs-cal-head").getBoundingClientRect();
        const footer = element.querySelector(".rs-calendar-popover-actions").getBoundingClientRect();
        const paint = getComputedStyle(element);
        const dividers = [...element.querySelectorAll(".rs-calendar-popover-actions,.rs-calendar-popover-time")].map(section => {
          const box = section.getBoundingClientRect();
          return { left: box.left, right: box.right, stroke: Number.parseFloat(getComputedStyle(section).borderTopWidth) };
        });
        const targets = [...element.querySelectorAll("button,input")].filter(target => target.getClientRects().length).map(target => {
          const box = target.getBoundingClientRect();
          return { width: box.width, height: box.height, name: target.getAttribute("aria-label") || target.textContent || target.type };
        });
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height,
          overflow: element.scrollWidth - element.clientWidth, calendarOverflow: element.querySelector(".rs-cal").scrollWidth - element.querySelector(".rs-cal").clientWidth,
          borderLeft: Number.parseFloat(paint.borderLeftWidth), borderRight: Number.parseFloat(paint.borderRightWidth), dividers,
          weeks: element.querySelectorAll('[role="row"]').length - 1, weekHeight: element.querySelector('[role="row"]:nth-child(2)').getBoundingClientRect().height, headerHeight: header.height, footerHeight: footer.height, headerInset: header.left - rect.left, footerInset: footer.left - rect.left, targets };
      });
      const size = page.viewportSize();
      if (enlargedText) near(geometry.width, Math.min(642, size.width - 2), "The picker grows with enlarged text while fitting the viewport");
      else assert.ok(geometry.width <= 340.5, "The picker remains compact beside any input width");
      assert.ok(geometry.left >= 0 && geometry.right <= size.width + 1 && geometry.top >= 0 && geometry.bottom <= size.height + 1, "The popup stays inside the viewport");
      assert.ok(geometry.overflow <= 1 && geometry.calendarOverflow <= 1, "The complete week fits without horizontal scrolling");
      assert.ok(geometry.targets.every(target => target.width >= 43.5 && target.height >= 43.5), "Calendar controls preserve 44px targets");
      for (const divider of geometry.dividers) {
        assert.ok(divider.stroke > 0, "The time and footer sections retain their divider");
        near(divider.left, geometry.left + geometry.borderLeft, "The divider reaches the popup's left interior edge");
        near(divider.right, geometry.right - geometry.borderRight, "The divider reaches the popup's right interior edge");
      }
      if (anchor.x + geometry.width <= size.width - 1) near(geometry.left, anchor.x, "The popup aligns with the field's left edge");
      if (anchor.y + anchor.height + 12 + geometry.height <= size.height - 1) assert.ok(geometry.top >= anchor.y + anchor.height && geometry.top <= anchor.y + anchor.height + 12, "The popup opens just below the field when space is available");
      return { ...geometry, anchorWidth: anchor.width };
    };

    stage = "compact width and month height";
    const months = [["2021-02-15", 4], ["2026-04-15", 5], ["2026-03-15", 6]];
    const layouts = [];
    for (const [value, weeks] of months) {
      await date.fill(value);
      await placeField(date);
      await trigger.click();
      await panel.waitFor({ state: "visible" });
      const geometry = await measure(field, panel);
      assert.equal(geometry.weeks, weeks, "The popup renders the weeks needed by its selected month");
      assert.equal(await panel.getByRole("button", { name: "Done", exact: true }).count(), 0, "Date-only selection does not need a redundant Done action");
      layouts.push(geometry);
      await page.keyboard.press("Escape");
      await panel.waitFor({ state: "hidden" });
    }
    for (let index = 1; index < layouts.length; index++) {
      near(layouts[index].width, layouts[0].width, "Month changes keep the popup width stable");
      near(layouts[index].headerHeight, layouts[0].headerHeight, "Month changes keep the header height stable");
      near(layouts[index].footerHeight, layouts[0].footerHeight, "Month changes keep the footer height stable");
      near(layouts[index].headerInset, layouts[0].headerInset, "The header stays aligned across months");
      near(layouts[index].footerInset, layouts[0].footerInset, "The footer stays aligned across months");
      near(layouts[index].height - layouts[index - 1].height, layouts[index].weekHeight, "Only the additional week increases popup height");
    }
    if (viewport.width >= 1400) {
      assert.ok(layouts[0].anchorWidth >= 440, "The regression exercises a wide gallery field");
      assert.ok(layouts[0].anchorWidth - layouts[0].width >= 100, "Popup width is independent of the wide input");
      stage = "resizing without retaining a stretched width";
      await trigger.click();
      for (const width of [320, viewport.width]) {
        await page.setViewportSize({ width, height: viewport.height });
        await placeField(date);
        if (await trigger.getAttribute("aria-expanded") === "false") await trigger.click();
        await panel.waitFor({ state: "visible" });
        await page.waitForFunction(element => {
          const box = element.getBoundingClientRect();
          return box.width <= Math.min(340.5, innerWidth) && box.left >= 0 && box.right <= innerWidth + 1;
        }, await panel.elementHandle());
        const geometry = await measure(field, panel);
        if (width === viewport.width) near(geometry.width, layouts[0].width, "Returning to desktop restores the compact intrinsic width");
      }
      await page.keyboard.press("Escape");
      await panel.waitFor({ state: "hidden" });
    }

    stage = "date selection, Clear and Today";
    await date.fill("2024-02-28");
    await placeField(date);
    await trigger.click();
    await panel.waitFor({ state: "visible" });
    await panel.locator('[role="gridcell"][aria-selected="true"]').press("ArrowRight");
    await page.keyboard.press("Enter");
    await panel.waitFor({ state: "hidden" });
    assert.equal(await date.inputValue(), "2024-02-29", "Selecting a day commits it immediately");
    await trigger.click();
    await panel.getByRole("button", { name: "Clear", exact: true }).click();
    await panel.waitFor({ state: "hidden" });
    assert.equal(await date.inputValue(), "");
    await trigger.click();
    const today = await page.evaluate(() => { const value = new Date(); return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`; });
    await panel.getByRole("button", { name: "Today", exact: true }).click();
    await panel.waitFor({ state: "hidden" });
    assert.equal(await date.inputValue(), today, "Today commits the current local date");

    stage = "date-time confirmation";
    const review = page.getByRole("textbox", { name: "Proof review", exact: true });
    const reviewField = fieldFor("Proof review");
    const reviewPanel = reviewField.locator(".rs-calendar-popover-panel:popover-open");
    const initial = await review.inputValue();
    await placeField(review);
    await reviewField.getByRole("button", { name: "Open calendar", exact: true }).click();
    await reviewPanel.waitFor({ state: "visible" });
    await measure(reviewField, reviewPanel);
    await reviewPanel.getByRole("spinbutton", { name: "Hours", exact: true }).fill("14");
    await reviewPanel.getByRole("spinbutton", { name: "Minutes", exact: true }).fill("05");
    assert.equal(await review.inputValue(), initial, "Date-time edits stay pending until Done");
    await reviewPanel.getByRole("button", { name: "Done", exact: true }).click();
    await reviewPanel.waitFor({ state: "hidden" });
    assert.equal(await review.inputValue(), `${initial.slice(0, 10)} 14:05`);

    stage = "200% text geometry and actions";
    await page.evaluate(() => { document.documentElement.style.setProperty("font-size", "32px"); });
    assert.equal(await page.evaluate(() => Number.parseFloat(getComputedStyle(document.documentElement).fontSize)), 32, "The regression exercises 200% root text size");
    const readable = async popup => {
      const result = await popup.evaluate(element => {
        const box = item => { const rect = item.getBoundingClientRect(); return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }; };
        const overlaps = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
        const cells = [...element.querySelectorAll('[role="gridcell"]')].map(box);
        const title = element.querySelector(".rs-cal-title"), nav = element.querySelector(".rs-cal-nav"), header = box(element.querySelector(".rs-cal-head"));
        const headerBoxes = [box(title), box(nav)];
        const clippedLabels = [...element.querySelectorAll('.rs-cal-title,[role="columnheader"]')].filter(label => label.scrollWidth > label.clientWidth + 1 || label.scrollHeight > label.clientHeight + 1).map(label => label.textContent);
        return { dayOverlap: cells.some((cell, index) => cells.slice(index + 1).some(other => overlaps(cell, other))), headerOverlap: overlaps(...headerBoxes), clippedLabels,
          headerContainsControls: headerBoxes.every(rect => rect.left >= header.left - 1 && rect.right <= header.right + 1 && rect.top >= header.top - 1 && rect.bottom <= header.bottom + 1),
          weekdayNames: [...element.querySelectorAll('[role="columnheader"]')].map(label => label.getAttribute("aria-label")) };
      });
      assert.equal(result.dayOverlap, false, "Enlarged day targets stay separate rather than overlapping adjacent dates");
      assert.equal(result.headerOverlap, false, "The enlarged month heading does not overlap month navigation");
      assert.equal(result.headerContainsControls, true, "The header grows to contain its enlarged heading and controls");
      assert.deepEqual(result.clippedLabels, [], "Month and weekday labels remain readable at 200% text size");
      assert.deepEqual(result.weekdayNames, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "Compact visual weekday labels retain full accessible names");
    };
    await date.fill("2026-09-15");
    await placeField(date);
    await trigger.click();
    await panel.waitFor({ state: "visible" });
    await measure(field, panel, true);
    await readable(panel);
    if (viewport.width === 320 || viewport.width === 1440) await page.screenshot({ path: `/tmp/vlak-calendar-popover-text200-date-${viewport.width}.png` });
    await panel.getByRole("button", { name: "Today", exact: true }).click();
    await panel.waitFor({ state: "hidden" });
    assert.equal(await date.inputValue(), today, "Today remains usable with enlarged text");
    await trigger.click();
    await panel.getByRole("button", { name: "Clear", exact: true }).click();
    await panel.waitFor({ state: "hidden" });
    assert.equal(await date.inputValue(), "", "Clear remains usable with enlarged text");
    await review.fill("2026-09-15 14:05");
    await placeField(review);
    await reviewField.getByRole("button", { name: "Open calendar", exact: true }).click();
    await reviewPanel.waitFor({ state: "visible" });
    await measure(reviewField, reviewPanel, true);
    await readable(reviewPanel);
    if (viewport.width === 320 || viewport.width === 1440) await page.screenshot({ path: `/tmp/vlak-calendar-popover-text200-time-${viewport.width}.png` });
    await reviewPanel.getByRole("spinbutton", { name: "Hours", exact: true }).fill("17");
    await reviewPanel.getByRole("spinbutton", { name: "Minutes", exact: true }).fill("30");
    await reviewPanel.getByRole("button", { name: "Done", exact: true }).click();
    await reviewPanel.waitFor({ state: "hidden" });
    assert.equal(await review.inputValue(), "2026-09-15 17:30", "Date-time controls and Done remain usable with enlarged text");
    console.log(`${viewport.width}px CalendarPopover: compact geometry, month heights, anchoring, 44px targets, date actions, date-time confirmation and 200% text passed`);
  } catch (error) { fail(`CalendarPopover ${viewport.width}px ${stage}: ${error.message}`); }
  finally {
    if (rootFontSize) await page.evaluate(previous => { if (previous.value) document.documentElement.style.setProperty("font-size", previous.value, previous.priority); else document.documentElement.style.removeProperty("font-size"); }, rootFontSize);
    if (page.viewportSize().width !== viewport.width || page.viewportSize().height !== viewport.height) await page.setViewportSize(viewport);
  }
}
