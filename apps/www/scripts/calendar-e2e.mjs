import assert from "node:assert/strict";

const focusReturns = async (page, locator) => {
  const element = await locator.elementHandle();
  await page.waitForFunction(target => document.activeElement === target, element);
  await element.dispose();
};

const setCheckbox = async (checkbox, checked) => {
  if (await checkbox.isChecked() !== checked) await checkbox.locator("..").click();
  assert.equal(await checkbox.isChecked(), checked, "Clicking the visible checkbox label updates its native checked state");
};

export async function checkCalendar({ page, base, fail }) {
  const width = page.viewportSize().width;
  let stage = "opening and keyboard focus";
  try {
    await page.goto(`${base}/interfaces/calendar/`, { waitUntil: "networkidle" });
    const board = page.locator(".cal-board");
    const newEvent = board.getByRole("button", { name: "New event", exact: true });
    const settingsTrigger = board.locator(".cal-settings-button");
    const settings = page.getByRole("dialog", { name: "Calendars", exact: true });
    const editDialog = page.getByRole("dialog", { name: "Edit event", exact: true });
    const createDialog = page.getByRole("dialog", { name: "New event", exact: true });
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem("vlak-calendar-v1")));
    const search = board.getByRole("searchbox", { name: "Search events" });
    const results = board.locator(".cal-search-results");
    const find = async (title, count) => {
      await search.fill(title);
      await results.getByRole("heading", { name: `${count} ${count === 1 ? "event" : "events"}`, exact: true }).waitFor();
      const matches = results.locator("li button").filter({ has: page.getByText(title, { exact: true }) });
      assert.equal(await matches.count(), count, "Search shows actual occurrences matching the saved title");
      return matches;
    };
    const openSettings = async () => { await settingsTrigger.click(); await settings.waitFor({ state: "visible" }); };
    const closeSettings = async () => { await page.keyboard.press("Escape"); await settings.waitFor({ state: "hidden" }); await focusReturns(page, settingsTrigger); };
    const saveEvent = async dialog => { await dialog.getByRole("button", { name: "Save event", exact: true }).click(); await dialog.waitFor({ state: "hidden" }); };

    assert.equal(await board.locator('input[type="date"],input[type="datetime-local"]').count(), 0, "Calendar date fields use the shared Vlak popover");
    await newEvent.focus();
    await newEvent.press("Enter");
    await createDialog.waitFor({ state: "visible" });
    assert.ok(await createDialog.evaluate(dialog => dialog.contains(document.activeElement)), "Opening the modal places keyboard focus inside it");
    await createDialog.getByRole("button", { name: "Close event editor", exact: true }).focus();
    await page.keyboard.press("Tab");
    await focusReturns(page, createDialog.getByRole("textbox", { name: "Title", exact: true }));
    stage = "calendar popover keyboard, dismissal and mobile reach";
    const startPicker = createDialog.locator(".rs-calendar-popover").filter({ has: page.getByRole("textbox", { name: "Starts", exact: true }) });
    const pickerTrigger = startPicker.getByRole("button", { name: "Open calendar", exact: true });
    const datePanel = startPicker.getByRole("dialog", { name: "Choose date and time", exact: true });
    const initialStart = await createDialog.getByLabel("Starts", { exact: true }).inputValue();
    await pickerTrigger.focus();
    await pickerTrigger.press("ArrowDown");
    await datePanel.waitFor({ state: "visible" });
    assert.ok(await datePanel.evaluate(panel => panel.matches(":popover-open")), "The date picker uses the browser top layer");
    assert.ok(await datePanel.evaluate(panel => panel.contains(document.activeElement)), "The calendar receives keyboard focus");
    const geometry = await datePanel.evaluate(panel => {
      const rect = panel.getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: innerWidth, overflow: panel.scrollWidth > panel.clientWidth + 1,
        targets: [...panel.querySelectorAll("button,input")].filter(el => el.getBoundingClientRect().width).map(el => ({ name: el.getAttribute("aria-label") || el.textContent, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })) };
    });
    assert.ok(geometry.left >= -1 && geometry.right <= geometry.width + 1 && !geometry.overflow, "The full calendar fits the phone viewport");
    assert.ok(geometry.targets.every(target => target.width >= 43.5 && target.height >= 43.5), "Picker controls retain 44px targets");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await datePanel.waitFor({ state: "hidden" });
    assert.ok(await createDialog.isVisible(), "Escape closes the popover before the enclosing event editor");
    await focusReturns(page, pickerTrigger);
    assert.equal(await createDialog.getByLabel("Starts", { exact: true }).inputValue(), initialStart, "Dismissing the picker preserves the saved field value");
    await pickerTrigger.click();
    await datePanel.waitFor({ state: "visible" });
    await createDialog.getByRole("textbox", { name: "Title", exact: true }).click();
    await datePanel.waitFor({ state: "hidden" });
    assert.ok(await createDialog.isVisible(), "Light dismissal stays within the event editor");
    await page.keyboard.press("Escape");
    await createDialog.waitFor({ state: "hidden" });
    await focusReturns(page, newEvent);

    stage = "calendar creation and recurring event";
    let calendarName = `Browser calendar ${width}`;
    const originalTitle = `Browser schedule ${width}`;
    const oneTitle = `Separate occurrence ${width}`;
    const seriesTitle = `Revised series ${width}`;
    await openSettings();
    await settings.getByRole("textbox", { name: "New calendar", exact: true }).fill(calendarName);
    await settings.getByRole("button", { name: "Add", exact: true }).click();
    await settings.getByRole("checkbox", { name: calendarName, exact: true }).waitFor();
    const calendarEditor = page.getByRole("dialog", { name: "Edit calendar", exact: true });
    const editCalendar = () => settings.getByRole("button", { name: `Edit ${calendarName} calendar`, exact: true });
    await editCalendar().click();
    await calendarEditor.waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    await calendarEditor.waitFor({ state: "hidden" });
    await focusReturns(page, editCalendar());
    assert.ok(await settings.isVisible(), "Dismissing a nested calendar editor preserves the settings dialog");
    await editCalendar().click();
    calendarName = `Renamed browser calendar ${width}`;
    await calendarEditor.getByRole("textbox", { name: "Calendar name", exact: true }).fill(calendarName);
    await calendarEditor.getByRole("button", { name: "Save calendar", exact: true }).click();
    await calendarEditor.waitFor({ state: "hidden" });
    await settings.getByRole("checkbox", { name: calendarName, exact: true }).waitFor();
    await settings.getByRole("combobox", { name: "Week starts on", exact: true }).selectOption("0");
    assert.equal((await saved()).weekStartsOn, 0, "Calendar preferences are persisted");
    await closeSettings();
    await newEvent.click();
    const date = (await createDialog.getByLabel("Starts", { exact: true }).inputValue()).slice(0, 10);
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/, "New events use a real selected date");
    await createDialog.getByRole("textbox", { name: "Title", exact: true }).fill(originalTitle);
    await createDialog.getByRole("combobox", { name: "Calendar", exact: true }).selectOption({ label: calendarName });
    await pickerTrigger.click();
    await datePanel.waitFor({ state: "visible" });
    assert.equal(await datePanel.getByRole("columnheader").first().getAttribute("aria-label"), "Sunday", "The date picker follows the calendar’s week-start preference");
    await datePanel.getByLabel("Hours", { exact: true }).fill("11");
    await datePanel.getByLabel("Minutes", { exact: true }).fill("00");
    await datePanel.getByRole("button", { name: "Done", exact: true }).click();
    await datePanel.waitFor({ state: "hidden" });
    assert.equal((await createDialog.getByLabel("Starts", { exact: true }).inputValue()).replace(" ", "T"), `${date}T11:00`, "Calendar time controls update the event start");
    const endsField = createDialog.getByRole("textbox", { name: "Ends", exact: true });
    await endsField.fill(`${date}T10:00`);
    assert.equal(await endsField.evaluate(input => input.checkValidity()), false, "An end before the start is rejected by native form validation");
    await endsField.fill(`${date}T12:30`);
    assert.equal(await endsField.evaluate(input => input.checkValidity()), true, "A corrected end time can be submitted");
    await createDialog.getByRole("combobox", { name: "Repeat", exact: true }).selectOption("daily");
    await createDialog.getByRole("combobox", { name: "Ends", exact: true }).selectOption("count");
    await createDialog.getByRole("spinbutton", { name: "Occurrences", exact: true }).fill("3");
    await createDialog.getByRole("textbox", { name: "Notes", exact: true }).fill("A saved note, with punctuation; and\na second line.");
    await saveEvent(createDialog);
    let matches = await find(originalTitle, 3);
    const original = (await saved()).events.find(event => event.title === originalTitle);
    assert.deepEqual(original.recurrence, { frequency: "daily", interval: 1, count: 3 });
    assert.equal(original.end, `${date}T12:30`);
    assert.equal((await saved()).calendars.find(calendar => calendar.id === original.calendarId).name, calendarName);

    stage = "editing one occurrence and its series";
    await matches.nth(1).click();
    assert.equal(await editDialog.getByRole("combobox", { name: "Apply changes to", exact: true }).inputValue(), "one");
    const occurrenceStart = (await editDialog.getByLabel("Starts", { exact: true }).inputValue()).replace(" ", "T");
    assert.notEqual(occurrenceStart, original.start, "Editing the second occurrence does not use the series start");
    await editDialog.getByRole("textbox", { name: "Title", exact: true }).fill(oneTitle);
    await saveEvent(editDialog);
    matches = await find(originalTitle, 2);
    const split = (await saved()).events.find(event => event.title === oneTitle);
    assert.equal(split.start, occurrenceStart);
    assert.equal(split.recurrence, undefined, "One occurrence becomes an independent event");
    assert.deepEqual((await saved()).events.find(event => event.id === original.id).exclusions, [occurrenceStart]);
    await matches.first().click();
    await editDialog.getByRole("combobox", { name: "Apply changes to", exact: true }).selectOption("series");
    assert.equal((await editDialog.getByLabel("Starts", { exact: true }).inputValue()).replace(" ", "T"), original.start, "Series editing restores the schedule's original start");
    await editDialog.getByRole("textbox", { name: "Title", exact: true }).fill(seriesTitle);
    await editDialog.getByRole("textbox", { name: "Location", exact: true }).fill("Studio 2");
    await saveEvent(editDialog);
    await find(seriesTitle, 2);
    assert.deepEqual((await saved()).events.find(event => event.id === original.id).exclusions, [occurrenceStart], "Series edits retain excluded occurrences");
    await find(oneTitle, 1);

    stage = "delete and Undo";
    await (await find(oneTitle, 1)).click();
    await editDialog.getByRole("button", { name: "Delete", exact: true }).click();
    await editDialog.getByRole("button", { name: "Confirm delete", exact: true }).click();
    await editDialog.waitFor({ state: "hidden" });
    await find(oneTitle, 0);
    assert.equal((await saved()).events.some(event => event.id === split.id), false, "Confirmed deletion removes the saved record");
    await board.getByRole("button", { name: "Undo", exact: true }).click();
    await find(oneTitle, 1);
    assert.deepEqual((await saved()).events.find(event => event.id === split.id), split, "Undo restores the complete event");

    stage = "visibility and reload persistence";
    await openSettings();
    await setCheckbox(settings.getByRole("checkbox", { name: calendarName, exact: true }), false);
    await closeSettings();
    await find(oneTitle, 0);
    await openSettings();
    await setCheckbox(settings.getByRole("checkbox", { name: calendarName, exact: true }), true);
    await closeSettings();
    await find(oneTitle, 1);
    await page.reload({ waitUntil: "networkidle" });
    await find(seriesTitle, 2);
    await find(oneTitle, 1);
    assert.equal((await saved()).weekStartsOn, 0);

    stage = "iCalendar export contents";
    await openSettings();
    const downloadReady = page.waitForEvent("download");
    await settings.getByRole("button", { name: "Export .ics", exact: true }).click();
    const download = await downloadReady;
    assert.equal(download.suggestedFilename(), "vlak-calendar.ics");
    const stream = await download.createReadStream();
    assert.ok(stream, "Export produces a readable calendar file");
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const exported = Buffer.concat(chunks).toString("utf8").replace(/\r?\n[ \t]/g, "");
    assert.ok(exported.startsWith("BEGIN:VCALENDAR\r\n"));
    assert.ok(exported.includes(`UID:${original.id}\r\n`) && exported.includes(`SUMMARY:${seriesTitle}\r\n`), "Export contains the actual revised series");
    assert.ok(exported.includes("RRULE:FREQ=DAILY;INTERVAL=1;COUNT=3\r\n"));
    assert.ok(exported.includes(`EXDATE:${occurrenceStart.replace(/[-:]/g, "")}00\r\n`), "Export preserves the detached occurrence exclusion");
    assert.ok(exported.includes(`SUMMARY:${oneTitle}\r\n`), "Export includes the independent occurrence");
    await closeSettings();

    stage = "iCalendar staged import and duplicate handling";
    const importedTitle = `Imported browser event ${width}`;
    const compactDate = date.replaceAll("-", "");
    const fixture = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Vlak browser test//EN", "BEGIN:VEVENT", `UID:browser-import-${width}`, `DTSTAMP:${compactDate}T080000Z`, `DTSTART:${compactDate}T140000`, `DTEND:${compactDate}T150000`, `SUMMARY:${importedTitle}`, "LOCATION:Reading room", "DESCRIPTION:Imported from a real file", "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
    const importDialog = page.getByRole("dialog", { name: "Import events", exact: true });
    const loadImport = async () => {
      await openSettings();
      const chooserReady = page.waitForEvent("filechooser");
      await settings.getByRole("button", { name: "Import .ics", exact: true }).click();
      await (await chooserReady).setFiles({ name: "browser-calendar.ics", mimeType: "text/calendar", buffer: Buffer.from(fixture) });
      await importDialog.waitFor({ state: "visible" });
      await importDialog.getByText(/^1 events? ready to import\.$/).waitFor();
      await importDialog.getByRole("combobox", { name: "Import into", exact: true }).selectOption({ label: calendarName });
    };
    const beforeImport = (await saved()).events.length;
    await loadImport();
    assert.equal((await saved()).events.length, beforeImport, "Reading a file stages events without changing saved data");
    await importDialog.getByRole("button", { name: "Import events", exact: true }).click();
    await importDialog.waitFor({ state: "hidden" });
    await find(importedTitle, 1);
    const imported = (await saved()).events.find(event => event.title === importedTitle);
    assert.equal(imported.start, `${date}T14:00`);
    assert.equal(imported.end, `${date}T15:00`);
    assert.equal(imported.description, "Imported from a real file");
    assert.equal(imported.calendarId, original.calendarId, "The import destination controls the saved calendar");
    await loadImport();
    await importDialog.getByRole("button", { name: "Import events", exact: true }).click();
    await importDialog.waitFor({ state: "hidden" });
    assert.equal((await saved()).events.length, beforeImport + 1, "Importing the same UID again does not duplicate an event");

    stage = "all-day creation, editing and discard";
    const allDayTitle = `All-day browser event ${width}`;
    const nextDate = new Date(`${date}T12:00:00Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    const tomorrow = nextDate.toISOString().slice(0, 10);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    const afterTomorrow = nextDate.toISOString().slice(0, 10);
    await newEvent.click();
    await createDialog.getByRole("textbox", { name: "Title", exact: true }).fill(allDayTitle);
    await createDialog.getByRole("combobox", { name: "Calendar", exact: true }).selectOption({ label: calendarName });
    await setCheckbox(createDialog.getByRole("checkbox", { name: "All day", exact: true }), true);
    assert.equal(await createDialog.getByLabel("Starts", { exact: true }).inputValue(), date);
    const lastDayPicker = createDialog.locator(".rs-calendar-popover").filter({ has: page.getByRole("textbox", { name: "Last day", exact: true }) });
    await lastDayPicker.getByRole("button", { name: "Open calendar", exact: true }).click();
    const dayPanel = lastDayPicker.getByRole("dialog", { name: "Choose date", exact: true });
    await dayPanel.waitFor({ state: "visible" });
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await dayPanel.waitFor({ state: "hidden" });
    assert.equal(await createDialog.getByLabel("Last day", { exact: true }).inputValue(), tomorrow, "Choosing a day updates the inclusive all-day end");
    await saveEvent(createDialog);
    await find(allDayTitle, 1);
    const allDay = (await saved()).events.find(event => event.title === allDayTitle);
    assert.equal(allDay.allDay, true);
    assert.equal(allDay.start, `${date}T00:00`);
    assert.equal(allDay.end, `${afterTomorrow}T00:00`, "A multi-day event includes its last day and stores an exclusive end");
    await (await find(allDayTitle, 1)).click();
    assert.equal(await editDialog.getByLabel("Last day", { exact: true }).inputValue(), tomorrow);
    await editDialog.getByRole("textbox", { name: "Title", exact: true }).fill("Unsaved calendar edit");
    await page.keyboard.press("Escape");
    await editDialog.getByRole("button", { name: "Keep editing", exact: true }).click();
    assert.equal(await editDialog.getByRole("textbox", { name: "Title", exact: true }).inputValue(), "Unsaved calendar edit");
    await editDialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await editDialog.getByRole("button", { name: "Discard changes", exact: true }).click();
    await editDialog.waitFor({ state: "hidden" });
    assert.deepEqual((await saved()).events.find(event => event.id === allDay.id), allDay, "Discarding edits leaves the saved all-day event intact");
    await (await find(allDayTitle, 1)).click();
    await editDialog.getByLabel("Last day", { exact: true }).fill(date);
    await saveEvent(editDialog);
    assert.equal((await saved()).events.find(event => event.id === allDay.id).end, `${tomorrow}T00:00`, "Editing the last day changes the saved event duration");

    stage = "views and desktop dragging";
    await search.fill("");
    const view = board.getByRole("combobox", { name: "Calendar view", exact: true });
    for (const value of ["month", "week", "agenda", "day"]) {
      await view.selectOption(value);
      await board.locator(`.cal-views[data-view="${value}"]`).waitFor();
    }
    const views = board.locator(".cal-views");
    if (await views.getAttribute("data-compact") === "true") {
      assert.ok(await views.locator(".cal-day-list").isVisible(), "Compact timed views present a readable day agenda");
      assert.equal(await views.locator(".cal-timeline-scroll").count(), 0, "Compact calendars do not shrink the desktop timeline");
    } else {
      const event = views.locator(".cal-timed-event").filter({ has: page.getByText(importedTitle, { exact: true }) });
      await event.dragTo(views.locator(".cal-time-slot").nth(16), { targetPosition: { x: 20, y: 5 } });
      await board.locator(".cal-status").getByRole("status").filter({ hasText: "Event moved." }).waitFor();
      const moved = (await saved()).events.find(item => item.id === imported.id);
      assert.equal(moved.start, `${date}T16:00`, "Dropping an event changes its saved start time");
      assert.equal(moved.end, `${date}T17:00`, "Dragging preserves event duration");
    }

    stage = "calendar deletion and Undo";
    const beforeDeleteCalendar = await saved();
    await openSettings();
    await editCalendar().click();
    await calendarEditor.getByRole("button", { name: "Delete calendar", exact: true }).click();
    const deleteCalendar = page.getByRole("dialog", { name: "Delete calendar?", exact: true });
    await deleteCalendar.getByRole("button", { name: "Confirm delete calendar", exact: true }).click();
    await deleteCalendar.waitFor({ state: "hidden" });
    assert.equal((await saved()).calendars.some(calendar => calendar.id === original.calendarId), false);
    assert.equal((await saved()).events.some(event => event.calendarId === original.calendarId), false, "Deleting a calendar removes its actual events");
    await closeSettings();
    await board.getByRole("button", { name: "Undo", exact: true }).click();
    assert.deepEqual(await saved(), beforeDeleteCalendar, "Undo restores a deleted calendar and all its events exactly");
    await find(allDayTitle, 1);

    stage = "storage failure preserves changes in the tab";
    const blockedTitle = `Unsaved browser-storage event ${width}`;
    const beforeBlockedSave = await saved();
    await page.evaluate(() => {
      window.__calendarOriginalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === "vlak-calendar-v1") throw new DOMException("Browser test storage limit", "QuotaExceededError");
        return window.__calendarOriginalSetItem.call(this, key, value);
      };
    });
    try {
      await newEvent.click();
      await createDialog.getByRole("textbox", { name: "Title", exact: true }).fill(blockedTitle);
      await saveEvent(createDialog);
      await board.getByRole("alert").filter({ hasText: "Changes are held in this tab" }).waitFor();
      await find(blockedTitle, 1);
      assert.deepEqual(await saved(), beforeBlockedSave, "A failed storage write leaves previously persisted data intact");
    } finally {
      await page.evaluate(() => { Storage.prototype.setItem = window.__calendarOriginalSetItem; delete window.__calendarOriginalSetItem; });
    }
    await (await find(blockedTitle, 1)).click();
    await saveEvent(editDialog);
    assert.ok((await saved()).events.some(event => event.title === blockedTitle), "Saving again after storage recovers persists the retained draft");
    assert.equal(await board.getByRole("alert").count(), 0);
    console.log(`${width}px Calendar: timed/all-day CRUD, recurrence scopes, calendar management, Undo, search, persistence/recovery, ICS interchange, views and keyboard focus passed`);
  } catch (error) { fail(`Calendar ${width}px ${stage}: ${error.message}`); }
}
