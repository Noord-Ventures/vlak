import * as React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CalendarPopover } from "../src/components/calendar-popover";
import { Dialog, DialogTitle } from "../src/components/dialog";

const openPopovers = new WeakSet<HTMLElement>();
const originalMatches = Element.prototype.matches;
const originalShowPopover = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "showPopover");
const originalHidePopover = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "hidePopover");
const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");

beforeAll(() => {
  // Mirror native open/close events only. Real top-layer placement, light dismissal,
  // and Escape dispatch into a containing modal are checked in the browser suite.
  const toggle = (element: HTMLElement, open: boolean) => {
    const wasOpen = openPopovers.has(element);
    if (wasOpen === open) return;
    if (open) openPopovers.add(element); else openPopovers.delete(element);
    const event = new Event("toggle");
    Object.assign(event, { oldState: wasOpen ? "open" : "closed", newState: open ? "open" : "closed" });
    element.dispatchEvent(event);
  };
  Object.defineProperty(HTMLElement.prototype, "showPopover", { configurable: true, value(this: HTMLElement) { toggle(this, true); } });
  Object.defineProperty(HTMLElement.prototype, "hidePopover", { configurable: true, value(this: HTMLElement) { toggle(this, false); } });
  Element.prototype.matches = function (selector: string) { return selector === ":popover-open" ? openPopovers.has(this as HTMLElement) : originalMatches.call(this, selector); };
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value(this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event("close")); } });
});

afterAll(() => {
  Element.prototype.matches = originalMatches;
  for (const [prototype, key, descriptor] of [
    [HTMLElement.prototype, "showPopover", originalShowPopover],
    [HTMLElement.prototype, "hidePopover", originalHidePopover],
    [HTMLDialogElement.prototype, "showModal", originalShowModal],
    [HTMLDialogElement.prototype, "close", originalClose],
  ] as const) {
    if (descriptor) Object.defineProperty(prototype, key, descriptor);
    else Reflect.deleteProperty(prototype, key);
  }
});

afterEach(cleanup);

const input = () => screen.getByRole("textbox", { name: "Starts" }) as HTMLInputElement;
const dayName = (year: number, month: number, day: number) => new Date(year, month - 1, day).toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

describe("CalendarPopover field", () => {
  it("forwards the editable input ref and submits canonical date-time through an associated form", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<><form id="schedule" /><CalendarPopover ref={ref} label="Starts" hint="Use the device’s local time" type="datetime-local" defaultValue="2024-02-29T09:35" name="starts" form="schedule" required autoComplete="off" data-record="local-event" /></>);
    const field = input();
    expect(ref.current).toBe(field);
    expect(field.type).toBe("text");
    expect(field.value).toBe("2024-02-29 09:35");
    expect(field.required).toBe(true);
    expect(field.autocomplete).toBe("off");
    expect(field.dataset.record).toBe("local-event");
    expect(field.form?.id).toBe("schedule");
    expect(field.getAttribute("aria-describedby")?.split(" ")).toContain(screen.getByText("Use the device’s local time").id);
    expect(new FormData(document.querySelector("form")!).getAll("starts")).toEqual(["2024-02-29T09:35"]);
  });

  it("keeps incomplete controlled text editable, emits canonical values, and allows clearing", async () => {
    const changes = vi.fn();
    function Demo() {
      const [value, setValue] = React.useState("2024-02-29T09:35");
      return <CalendarPopover label="Starts" type="datetime-local" value={value} onValueChange={next => { setValue(next); changes(next); }} />;
    }
    render(<Demo />);
    const user = userEvent.setup();
    await user.clear(input());
    expect(input().value).toBe("");
    expect(changes).toHaveBeenLastCalledWith("");
    await user.type(input(), "2024-02-");
    expect(input().value).toBe("2024-02-");
    expect(input().checkValidity()).toBe(false);
    fireEvent.change(input(), { target: { value: "2024-02-29 13:45" } });
    expect(changes).toHaveBeenLastCalledWith("2024-02-29T13:45");
    expect(input().value).toBe("2024-02-29 13:45");
    expect(input().checkValidity()).toBe(true);
  });

  it("follows external controlled updates including an empty value", () => {
    const { rerender } = render(<CalendarPopover label="Starts" value="2024-02-29" />);
    expect(input().value).toBe("2024-02-29");
    rerender(<CalendarPopover label="Starts" value="2025-01-03" />);
    expect(input().value).toBe("2025-01-03");
    rerender(<CalendarPopover label="Starts" value="" />);
    expect(input().value).toBe("");
    expect(input().checkValidity()).toBe(true);
  });

  it.each([
    ["2024-02-29", true],
    ["2000-02-29", true],
    ["0004-02-29", true],
    ["0001-01-01", true],
    ["0000-01-01", false],
    ["2023-02-29", false],
    ["1900-02-29", false],
    ["2024-04-31", false],
    ["2024-13-01", false],
    ["2024-00-10", false],
    ["2024-02-", false],
  ])("validates the real Gregorian date %s", (value, valid) => {
    render(<CalendarPopover label="Starts" defaultValue={value} />);
    expect(input().checkValidity()).toBe(valid);
  });

  it("requires a value and enforces inclusive date bounds after typed edits", () => {
    render(<CalendarPopover label="Starts" required min="2024-02-28" max="2024-03-01" />);
    expect(input().validity.valueMissing).toBe(true);
    for (const [value, valid] of [["2024-02-27", false], ["2024-02-28", true], ["2024-02-29", true], ["2024-03-01", true], ["2024-03-02", false]] as const) {
      fireEvent.change(input(), { target: { value } });
      expect(input().checkValidity(), value).toBe(valid);
    }
    fireEvent.change(input(), { target: { value: "" } });
    expect(input().validity.valueMissing).toBe(true);
  });

  it.each([
    ["2024-02-29 08:59", false],
    ["2024-02-29 09:00", true],
    ["2024-02-29 09:35", true],
    ["2024-02-29 10:30", true],
    ["2024-02-29 10:31", false],
    ["2024-02-29 24:00", false],
    ["2024-02-29 09:60", false],
  ])("validates clock values and inclusive date-time bounds for %s", (value, valid) => {
    render(<CalendarPopover label="Starts" type="datetime-local" defaultValue={value.replace(" ", "T")} min="2024-02-29T09:00" max="2024-02-29T10:30" />);
    expect(input().checkValidity()).toBe(valid);
  });

  it("keeps read-only and disabled fields unchanged and excludes disabled form values", async () => {
    const changes = vi.fn();
    const { rerender } = render(<form><CalendarPopover label="Starts" name="starts" defaultValue="2024-02-29" onValueChange={changes} readOnly /></form>);
    const user = userEvent.setup();
    await user.type(input(), "2025");
    expect(input().value).toBe("2024-02-29");
    expect(input().readOnly).toBe(true);
    expect(changes).not.toHaveBeenCalled();
    expect((screen.getByRole("button", { name: "Open calendar" }) as HTMLButtonElement).disabled).toBe(true);
    rerender(<form><CalendarPopover label="Starts" name="starts" defaultValue="2024-02-29" onValueChange={changes} disabled /></form>);
    expect(input().disabled).toBe(true);
    expect(new FormData(document.querySelector("form")!).has("starts")).toBe(false);
  });

  it("connects error feedback to its input and passes axe", async () => {
    const { container } = render(<CalendarPopover label="Starts" error="Choose a date within the booking period" defaultValue="2024-02-29" />);
    expect(input().getAttribute("aria-invalid")).toBe("true");
    expect(input().getAttribute("aria-describedby")?.split(" ")).toContain(screen.getByText("Choose a date within the booking period").id);
    // jsdom cannot measure contrast; the generated palette and browser checks cover it.
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });

  it("resets an uncontrolled field and its submitted value to the declared default", async () => {
    const changes = vi.fn();
    render(<form><CalendarPopover label="Starts" name="starts" defaultValue="2024-02-29" onValueChange={changes} /><button type="reset">Reset schedule</button></form>);
    fireEvent.change(input(), { target: { value: "2025-01-03" } });
    expect(input().value).toBe("2025-01-03");
    const count = changes.mock.calls.length;
    await userEvent.setup().click(screen.getByRole("button", { name: "Reset schedule" }));
    expect(input().value).toBe("2024-02-29");
    expect(new FormData(document.querySelector("form")!).get("starts")).toBe("2024-02-29");
    expect(changes).toHaveBeenCalledTimes(count);
  });
});

describe("CalendarPopover selection", () => {
  it("opens the selected month and commits a keyboard-selected date", async () => {
    const changes = vi.fn();
    render(<CalendarPopover label="Starts" defaultValue="2024-02-28" onValueChange={changes} />);
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: "Open calendar" });
    await user.click(trigger);
    const picker = screen.getByRole("dialog", { name: "Choose date" });
    expect(picker.getAttribute("popover")).toBe("auto");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const selected = within(picker).getByRole("gridcell", { name: dayName(2024, 2, 28) });
    expect(document.activeElement).toBe(selected);
    await user.keyboard("{ArrowRight}{Enter}");
    expect(changes).toHaveBeenLastCalledWith("2024-02-29");
    expect(input().value).toBe("2024-02-29");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("enforces string date bounds in the calendar grid", async () => {
    const changes = vi.fn();
    render(<CalendarPopover label="Starts" defaultValue="2024-02-29" min="2024-02-28" max="2024-03-01" onValueChange={changes} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Open calendar" }));
    const unavailable = screen.getByRole("gridcell", { name: dayName(2024, 2, 27) });
    expect(unavailable.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(unavailable);
    expect(changes).not.toHaveBeenCalled();
    expect(input().value).toBe("2024-02-29");
  });

  it("stages a date and time until Done and preserves the canonical submitted value", async () => {
    const changes = vi.fn();
    render(<form><CalendarPopover label="Starts" name="starts" type="datetime-local" defaultValue="2024-02-29T09:35" onValueChange={changes} /></form>);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    const picker = screen.getByRole("dialog", { name: "Choose date and time" });
    await user.click(within(picker).getByRole("gridcell", { name: dayName(2024, 3, 1) }));
    fireEvent.change(within(picker).getByRole("spinbutton", { name: "Hours" }), { target: { value: "14" } });
    fireEvent.change(within(picker).getByRole("spinbutton", { name: "Minutes" }), { target: { value: "5" } });
    expect(changes).not.toHaveBeenCalled();
    expect(input().value).toBe("2024-02-29 09:35");
    await user.click(within(picker).getByRole("button", { name: "Done" }));
    expect(changes).toHaveBeenLastCalledWith("2024-03-01T14:05");
    expect(input().value).toBe("2024-03-01 14:05");
    expect(new FormData(document.querySelector("form")!).getAll("starts")).toEqual(["2024-03-01T14:05"]);
  });

  it("discards a pending time on Escape and leaves the owning dialog open", async () => {
    const changes = vi.fn();
    const closeDialog = vi.fn();
    render(<Dialog open onClose={closeDialog}><DialogTitle>Event editor</DialogTitle><CalendarPopover label="Starts" type="datetime-local" defaultValue="2024-02-29T09:35" onValueChange={changes} /></Dialog>);
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: "Open calendar" });
    await user.click(trigger);
    const hours = screen.getByRole("spinbutton", { name: "Hours" });
    fireEvent.change(hours, { target: { value: "15" } });
    hours.focus();
    await user.keyboard("{Escape}");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(changes).not.toHaveBeenCalled();
    expect(input().value).toBe("2024-02-29 09:35");
    expect((screen.getByRole("dialog", { name: "Event editor" }) as HTMLDialogElement).open).toBe(true);
    expect(closeDialog).not.toHaveBeenCalled();
  });

  it("passes axe while the date-time controls and calendar are open", async () => {
    const { container } = render(<CalendarPopover label="Starts" type="datetime-local" defaultValue="2024-02-29T09:35" />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Open calendar" }));
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });

  it("clears an optional date through the picker without leaving a stale form value", async () => {
    const changes = vi.fn();
    render(<form><CalendarPopover label="Starts" name="starts" defaultValue="2024-02-29" onValueChange={changes} /></form>);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(changes).toHaveBeenLastCalledWith("");
    expect(input().value).toBe("");
    expect(new FormData(document.querySelector("form")!).get("starts")).toBe("");
  });

  it("rejects an out-of-range staged time and commits only after it is corrected", async () => {
    const changes = vi.fn();
    render(<CalendarPopover label="Starts" type="datetime-local" defaultValue="2024-02-29T09:35" min="2024-02-29T09:00" max="2024-02-29T10:30" onValueChange={changes} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Hours" }), { target: { value: "10" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Minutes" }), { target: { value: "31" } });
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(changes).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("10:30");
    expect(input().value).toBe("2024-02-29 09:35");
    fireEvent.change(screen.getByRole("spinbutton", { name: "Minutes" }), { target: { value: "30" } });
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(changes).toHaveBeenLastCalledWith("2024-02-29T10:30");
  });

  it("discards stale picker state when an external controlled value changes", async () => {
    const changes = vi.fn();
    const { rerender } = render(<CalendarPopover label="Starts" type="datetime-local" value="2024-02-29T09:35" onValueChange={changes} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Open calendar" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Hours" }), { target: { value: "16" } });
    rerender(<CalendarPopover label="Starts" type="datetime-local" value="2025-01-03T11:00" onValueChange={changes} />);
    expect(screen.getByRole("button", { name: "Open calendar" }).getAttribute("aria-expanded")).toBe("false");
    expect(input().value).toBe("2025-01-03 11:00");
    expect(changes).not.toHaveBeenCalled();
  });
});
