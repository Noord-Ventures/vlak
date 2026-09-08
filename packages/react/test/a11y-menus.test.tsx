import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Select } from "../src/components/select";
import { Combobox } from "../src/components/combobox";
import { Command } from "../src/components/command";
import { DropdownMenu } from "../src/components/dropdown-menu";
import { ContextMenu } from "../src/components/context-menu";
import { Menubar } from "../src/components/menubar";
import { Calendar } from "../src/components/calendar";
import { DatePicker } from "../src/components/date-picker";

afterEach(cleanup);

const cities = [
  { value: "alkmaar", label: "Alkmaar" },
  { value: "amsterdam", label: "Amsterdam" },
  { value: "delft", label: "Delft" },
  { value: "rotterdam", label: "Rotterdam" },
];

const active = (el: HTMLElement) => {
  const id = el.getAttribute("aria-activedescendant");
  return id ? document.getElementById(id) : null;
};

describe("Select (select-only combobox)", () => {
  it("keeps focus on the trigger and points at the active option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <Select aria-label="City" options={cities} onValueChange={onChange} />
        <button type="button">after</button>
      </>,
    );
    const trigger = screen.getByRole("combobox", { name: "City" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");

    trigger.focus();
    await user.keyboard("{ArrowDown}");
    const listbox = screen.getByRole("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(listbox.id);
    expect(document.activeElement).toBe(trigger);

    const options = screen.getAllByRole("option");
    expect(options.every((o) => o.tagName === "DIV" && o.getAttribute("tabindex") === "-1")).toBe(true);
    expect(active(trigger)).toBe(options[0]);

    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active(trigger)).toBe(options[2]);
    await user.keyboard("{Home}");
    expect(active(trigger)).toBe(options[0]);
    await user.keyboard("{End}");
    expect(active(trigger)).toBe(options[3]);
    await user.keyboard("{ArrowUp}");
    expect(active(trigger)).toBe(options[2]);
    await user.keyboard("{PageUp}");
    expect(active(trigger)).toBe(options[0]);

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("alkmaar");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.hasAttribute("aria-activedescendant")).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on Escape keeping focus, and on Tab moving on", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Select aria-label="City" options={cities} />
        <button type="button">after</button>
      </>,
    );
    const trigger = screen.getByRole("combobox", { name: "City" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(trigger);

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeTruthy();
    await user.keyboard("{Tab}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "after" }));
  });

  it("type-ahead opens on a letter and buffers a prefix", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="City" options={cities} />);
    const trigger = screen.getByRole("combobox", { name: "City" });
    trigger.focus();
    await user.keyboard("a");
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(active(trigger)?.textContent).toBe("Alkmaar");
    await user.keyboard("m");
    expect(active(trigger)?.textContent).toBe("Amsterdam");
  });

  it("type-ahead cycles on a repeated letter", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="City" options={cities} defaultValue="rotterdam" />);
    const trigger = screen.getByRole("combobox", { name: "City" });
    trigger.focus();
    await user.keyboard("a");
    expect(active(trigger)?.textContent).toBe("Alkmaar");
    await user.keyboard("a");
    expect(active(trigger)?.textContent).toBe("Amsterdam");
    await user.keyboard("a");
    expect(active(trigger)?.textContent).toBe("Alkmaar");
  });

  it("marks the selected option and resyncs the highlight when value changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Select aria-label="City" options={cities} value="delft" />);
    const trigger = screen.getByRole("combobox", { name: "City" });
    await user.click(trigger);
    expect(screen.getByRole("option", { name: "Delft" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("option", { name: "Alkmaar" }).getAttribute("aria-selected")).toBe("false");
    expect(active(trigger)?.textContent).toBe("Delft");
    await user.keyboard("{Escape}");

    rerender(<Select aria-label="City" options={cities} value="rotterdam" />);
    await user.keyboard("{ArrowDown}");
    expect(active(trigger)?.textContent).toBe("Rotterdam");
  });

  it("has no axe violations open", async () => {
    const user = userEvent.setup();
    const { container } = render(<Select aria-label="City" options={cities} defaultValue="delft" />);
    await user.click(screen.getByRole("combobox", { name: "City" }));
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Combobox (editable)", () => {
  const options = [
    { value: "alkmaar", label: "Alkmaar" },
    { value: "delft", label: <b>Delft</b>, searchText: "Delft" },
    { value: "haarlem", label: <i>Haarlem</i> },
  ];

  it("filters on text, not on [object Object], and picks with Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox aria-label="City" options={options} onValueChange={onChange} />);
    const input = screen.getByRole("combobox", { name: "City" }) as HTMLInputElement;
    expect(input.getAttribute("aria-expanded")).toBe("false");

    await user.click(input);
    expect(screen.getAllByRole("option")).toHaveLength(3);
    await user.keyboard("del");
    const listbox = screen.getByRole("listbox");
    expect(input.getAttribute("aria-controls")).toBe(listbox.id);
    const options1 = within(listbox).getAllByRole("option");
    expect(options1).toHaveLength(1);
    expect(active(input)).toBe(options1[0]);

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("delft");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(input.value).toBe("Delft");
    expect(document.activeElement).toBe(input);

    await user.keyboard("{ArrowDown}");
    await user.keyboard("haar");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option").getAttribute("aria-selected")).toBe("false");
  });

  it("moves with arrows and Home/End, closes on Escape and Tab", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Combobox aria-label="City" options={options} defaultValue="delft" />
        <button type="button">after</button>
      </>,
    );
    const input = screen.getByRole("combobox", { name: "City" }) as HTMLInputElement;
    expect(input.value).toBe("Delft");
    input.focus();
    await user.keyboard("{ArrowDown}");
    const options1 = screen.getAllByRole("option");
    expect(active(input)).toBe(options1[1]);
    expect(options1[1]?.getAttribute("aria-selected")).toBe("true");
    await user.keyboard("{ArrowDown}");
    expect(active(input)).toBe(options1[2]);
    await user.keyboard("{Home}");
    expect(active(input)).toBe(options1[0]);
    await user.keyboard("{End}");
    expect(active(input)).toBe(options1[2]);
    await user.keyboard("{ArrowUp}");
    expect(active(input)).toBe(options1[1]);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(input);

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeTruthy();
    await user.keyboard("{Tab}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "after" }));
  });

  it("has no axe violations open", async () => {
    const user = userEvent.setup();
    const { container } = render(<Combobox aria-label="City" options={options} />);
    await user.click(screen.getByRole("combobox", { name: "City" }));
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Command", () => {
  const groups = [
    { label: "Go to", items: [{ label: "Components", hint: "⌘1" }, { label: "Tokens", hint: "⌘2" }] },
    { label: "Actions", items: [{ label: "Toggle appearance" }] },
  ];

  it("keeps focus in the input and drives the list with aria-activedescendant", async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    const onSelect = vi.fn();
    render(
      <Command
        groups={[groups[0]!, { label: "Actions", items: [{ label: "Toggle appearance", onSelect }] }]}
        onDone={onDone}
      />,
    );
    const input = screen.getByRole("combobox", { name: "Command" });
    expect(document.activeElement).toBe(input);
    const listbox = screen.getByRole("listbox");
    expect(input.getAttribute("aria-controls")).toBe(listbox.id);
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(active(input)).toBe(options[0]);
    expect(options[0]?.getAttribute("aria-selected")).toBe("true");

    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active(input)).toBe(options[2]);
    await user.keyboard("{Home}");
    expect(active(input)).toBe(options[0]);
    await user.keyboard("{End}");
    expect(active(input)).toBe(options[2]);
    expect(document.activeElement).toBe(input);

    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);

    await user.keyboard("tok");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(active(input)?.textContent).toContain("Tokens");

    await user.keyboard("{Escape}");
    expect(onDone).toHaveBeenCalledTimes(2);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Command groups={groups} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("DropdownMenu", () => {
  const items = [
    { label: "Rename", onSelect: vi.fn() },
    { label: "Duplicate", onSelect: vi.fn() },
    { separator: true },
    { label: "Delete", onSelect: vi.fn() },
  ];

  it("moves focus into the menu, wraps, type-aheads, selects, and returns focus", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <DropdownMenu
        label="Actions"
        items={[items[0]!, items[1]!, items[2]!, { label: "Delete", onSelect: onDelete }]}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    await user.click(trigger);
    const menu = screen.getByRole("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(menu.id);
    const menuitems = screen.getAllByRole("menuitem");
    expect(menuitems).toHaveLength(3);
    expect(document.activeElement).toBe(menuitems[0]);
    expect(menuitems.map((m) => m.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);

    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(menuitems[1]);
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(menuitems[0]);
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(menuitems[2]);
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(menuitems[0]);
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(menuitems[2]);
    await user.keyboard("{Home}");
    await user.keyboard("d");
    expect(document.activeElement).toBe(menuitems[1]);
    await user.keyboard("d");
    expect(document.activeElement).toBe(menuitems[2]);

    await user.keyboard("{Enter}");
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens from the keyboard, closes on Escape and Tab", async () => {
    const user = userEvent.setup();
    render(
      <>
        <DropdownMenu label="Actions" items={items} />
        <button type="button">after</button>
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Actions" });
    trigger.focus();
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Delete" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);

    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Rename" }));
    await user.keyboard("{Tab}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "after" }));
  });

  it("skips disabled items", async () => {
    const user = userEvent.setup();
    render(<DropdownMenu label="Actions" items={[{ label: "A" }, { label: "B", disabled: true }, { label: "C" }]} />);
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.getByRole("menuitem", { name: "B" }).getAttribute("aria-disabled")).toBe("true");
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "C" }));
  });

  it("has no axe violations open", async () => {
    const user = userEvent.setup();
    const { container } = render(<DropdownMenu label="Actions" items={items} />);
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ContextMenu", () => {
  const items = [{ label: "Copy" }, { label: "Paste" }, { separator: true }, { label: "Inspect" }];

  it("opens on Shift+F10 from a tabbable trigger and restores focus", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(
      <ContextMenu data-testid="target" items={[{ label: "Copy", onSelect: onCopy }, ...items.slice(1)]}>
        <p>Right-click me</p>
      </ContextMenu>,
    );
    const target = screen.getByTestId("target");
    expect(target.getAttribute("tabindex")).toBe("0");
    target.focus();
    await user.keyboard("{Shift>}{F10}{/Shift}");
    const menuitems = screen.getAllByRole("menuitem");
    expect(document.activeElement).toBe(menuitems[0]);
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(menuitems[2]);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(target);

    await user.keyboard("{Shift>}{F10}{/Shift}");
    await user.keyboard("{Enter}");
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(target);
  });

  it("opens at the pointer on contextmenu and closes on outside click", async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu data-testid="target" items={items}>
        <p>Right-click me</p>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId("target"), { clientX: 10, clientY: 20 });
    const menu = screen.getByRole("menu");
    expect(menu.style.left).toBe("10px");
    expect(menu.style.top).toBe("20px");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Copy" }));
    await user.click(document.body);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("has no axe violations open", async () => {
    const { container } = render(
      <ContextMenu data-testid="target" items={items}>
        <p>Right-click me</p>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId("target"), { clientX: 10, clientY: 20 });
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Menubar", () => {
  const menus = [
    { label: "File", items: [{ label: "New" }, { label: "Open" }] },
    { label: "Edit", items: [{ label: "Undo" }, { label: "Redo" }] },
    { label: "View", items: [{ label: "Zoom in" }] },
  ];

  it("exposes menuitem triggers with one tab stop and moves with Left/Right", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Menubar menus={menus} />
        <button type="button">after</button>
      </>,
    );
    const triggers = screen.getAllByRole("menuitem");
    expect(triggers).toHaveLength(3);
    expect(triggers.every((t) => t.getAttribute("aria-haspopup") === "menu")).toBe(true);
    expect(triggers.map((t) => t.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);

    triggers[0]!.focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(triggers[1]);
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(triggers[2]);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(triggers[0]);
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(triggers[2]);
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(triggers[0]);

    await user.keyboard("{ArrowDown}");
    expect(triggers[0]!.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "New" }));
    await user.keyboard("{ArrowRight}");
    expect(triggers[0]!.getAttribute("aria-expanded")).toBe("false");
    expect(triggers[1]!.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Undo" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(triggers[1]);

    await user.keyboard("{Enter}");
    expect(screen.getByRole("menu")).toBeTruthy();
    await user.keyboard("{Tab}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "after" }));
  });

  it("has no axe violations open", async () => {
    const user = userEvent.setup();
    const { container } = render(<Menubar menus={menus} />);
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Calendar", () => {
  it("preserves a four-digit early year through month paging and date selection", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const early = new Date(0);
    early.setHours(0, 0, 0, 0);
    early.setFullYear(42, 0, 31);
    render(<Calendar defaultValue={early} min={early} onValueChange={changed} />);
    const grid = screen.getByRole("grid", { name: "January 42" });
    const selected = within(grid).getByRole("gridcell", { selected: true });
    expect(selected.textContent).toBe("31");
    selected.focus();
    await user.keyboard("{PageDown}{Enter}");
    expect(changed).toHaveBeenCalledTimes(1);
    const result = changed.mock.calls[0]![0] as Date;
    expect([result.getFullYear(), result.getMonth(), result.getDate()]).toEqual([42, 1, 28]);
  });
  it("is a grid of rows and gridcells with one roving tab stop", () => {
    render(<Calendar defaultValue={new Date(2026, 8, 3)} />);
    const grid = screen.getByRole("grid", { name: "September 2026" });
    expect(within(grid).getAllByRole("row")).toHaveLength(7);
    expect(within(grid).getAllByRole("columnheader")).toHaveLength(7);
    const cells = within(grid).getAllByRole("gridcell");
    expect(cells).toHaveLength(42);
    const tabbable = cells.filter((c) => c.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]!.getAttribute("aria-selected")).toBe("true");
    expect(tabbable[0]!.getAttribute("aria-label")).toMatch(/Thursday.*September 3, 2026/);
    expect(cells.every((c) => !c.hasAttribute("aria-pressed"))).toBe(true);
    expect(cells.filter((c) => c.className.includes("rs-cal-day-out")).every((c) => c.getAttribute("tabindex") === "-1")).toBe(true);
    const today = new Date();
    const todayCell = cells.find((c) => c.getAttribute("aria-current") === "date");
    if (todayCell) expect(todayCell.getAttribute("aria-label")).toContain(String(today.getDate()));
  });

  it("moves by day, week, week ends, and month from the keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Calendar defaultValue={new Date(2026, 8, 3)} onValueChange={onChange} />);
    const day = () => document.activeElement as HTMLElement;
    screen.getByRole("gridcell", { name: /September 3, 2026/ }).focus();

    await user.keyboard("{ArrowRight}");
    expect(day().textContent).toBe("4");
    await user.keyboard("{ArrowDown}");
    expect(day().textContent).toBe("11");
    await user.keyboard("{ArrowLeft}");
    expect(day().textContent).toBe("10");
    await user.keyboard("{ArrowUp}");
    expect(day().textContent).toBe("3");
    await user.keyboard("{Home}");
    expect(day().getAttribute("aria-label")).toMatch(/Monday.*August 31, 2026/);
    expect(screen.getByRole("grid", { name: "August 2026" })).toBeTruthy();
    await user.keyboard("{End}");
    expect(day().getAttribute("aria-label")).toMatch(/Sunday.*September 6, 2026/);
    expect(screen.getByRole("grid", { name: "September 2026" })).toBeTruthy();
    await user.keyboard("{PageDown}");
    expect(day().getAttribute("aria-label")).toMatch(/October 6, 2026/);
    await user.keyboard("{PageUp}");
    expect(day().getAttribute("aria-label")).toMatch(/September 6, 2026/);
    expect(day().getAttribute("tabindex")).toBe("0");

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0].getDate()).toBe(6);
    expect(day().getAttribute("aria-selected")).toBe("true");
  });

  it("follows a controlled value into its month", () => {
    const { rerender } = render(<Calendar value={new Date(2026, 8, 3)} />);
    rerender(<Calendar value={new Date(2026, 9, 15)} />);
    const grid = screen.getByRole("grid", { name: "October 2026" });
    const tabbable = within(grid).getAllByRole("gridcell").filter((c) => c.getAttribute("tabindex") === "0");
    expect(tabbable[0]!.getAttribute("aria-label")).toMatch(/October 15, 2026/);
    expect(tabbable[0]!.getAttribute("aria-selected")).toBe("true");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Calendar defaultValue={new Date(2026, 8, 3)} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("DatePicker", () => {
  it("opens a dialog, focuses the day, and returns focus on close", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <DatePicker defaultValue={new Date(2026, 8, 3)} onValueChange={onChange} />
        <button type="button">after</button>
      </>,
    );
    const trigger = screen.getByRole("button", { name: /September 3, 2026/ });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Choose a date" });
    expect(trigger.getAttribute("aria-controls")).toBe(dialog.id);
    expect(document.activeElement?.getAttribute("role")).toBe("gridcell");
    expect(document.activeElement?.getAttribute("aria-label")).toMatch(/September 3, 2026/);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("dialog")).toBeTruthy();
    await user.keyboard("{ArrowRight}{Enter}");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0].getDate()).toBe(4);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.textContent).toMatch(/September 4, 2026/);

    await user.click(trigger);
    await user.click(document.body);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("has no axe violations open", async () => {
    const user = userEvent.setup();
    const { container } = render(<DatePicker defaultValue={new Date(2026, 8, 3)} />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });
});
