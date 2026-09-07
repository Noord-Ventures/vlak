import * as React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { PadInspector } from "../src/components/pad-inspector";
import { DesignRuleResults } from "../src/components/design-rule-results";
import type { DesignRuleViolation } from "../src/components/design-rule-results";

afterEach(cleanup);
const pads = [
  { id: "pad-a", reference: "J1", number: "1", net: "Supply", layers: ["Front copper"], type: "Surface mount", shape: "Rectangle", geometry: [{ id: "width", label: "Width", value: "1.80", unit: "mm" }, { id: "rotation", label: "Rotation", value: 0, unit: "degrees" }] },
  { id: "pad-b", reference: "J1", number: "1", net: null, layers: null, disabled: true },
  { id: "pad-c", reference: "J1", number: "2", net: "Return", layers: [] },
];
const violations: DesignRuleViolation[] = [
  { id: "a", title: "Copper clearance", severity: "error", status: "open", layer: "Front copper", net: "Supply", location: { x: 0, y: 18, unit: "mm" }, objects: ["J1 pad 1", "Track 17"] },
  { id: "b", title: "Copper clearance", severity: "warning", status: "excluded", layer: "Back copper" },
  { id: "c", title: "Imported check", severity: null, status: null },
];
async function choose(user: ReturnType<typeof userEvent.setup>, trigger: HTMLElement, label: string) {
  if (trigger.getAttribute("aria-expanded") !== "true") await user.click(trigger);
  await user.click(screen.getByRole("option", { name: label }));
}

describe("PadInspector", () => {
  it("uses the shared selector, skips disabled pads by keyboard and submits the selected id", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(<form><PadInspector label="Connector" name="pad" pads={pads} defaultValue="pad-a" onValueChange={change} /></form>);
    expect(container.querySelector(".rs-select")).toBeTruthy();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Pad" }));
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(change).toHaveBeenLastCalledWith("pad-c");
    expect(new FormData(container.querySelector("form")!).get("pad")).toBe("pad-c");
    expect(screen.getByText("None recorded")).toBeTruthy();
    expect(screen.getByText("Geometry not supplied")).toBeTruthy();
  });
  it("distinguishes repeated pad numbers and preserves precision, zero and unknown records", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<PadInspector label="Connector" pads={pads} value="pad-a" />);
    expect(screen.getByRole("cell", { name: "1.80" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "0" })).toBeTruthy();
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "J1 / Pad 1 · pad-a" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "J1 / Pad 1 · pad-b" }).getAttribute("aria-disabled")).toBe("true");
    await user.keyboard("{Escape}");
    rerender(<PadInspector label="Connector" pads={pads} value="pad-b" />);
    expect(screen.getByText("Selected pad unavailable: pad-b")).toBeTruthy();
    expect(screen.getAllByText("Not supplied").length).toBeGreaterThan(0);
    expect(screen.queryByText("Unconnected")).toBeNull();
    rerender(<PadInspector label="Connector" pads={pads} value="missing" />);
    expect(screen.getByText("Selected pad unavailable: missing")).toBeTruthy();
  });
  it("keeps controlled selection through a rejected request and reset", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(<form><PadInspector label="Connector" pads={pads} value="pad-a" onValueChange={change} /></form>);
    await choose(user, screen.getByRole("combobox"), "J1 / Pad 2 · pad-c");
    expect(change).toHaveBeenLastCalledWith("pad-c");
    expect(screen.getByRole("combobox").textContent).toBe("J1 / Pad 1 · pad-a");
    await act(async () => container.querySelector("form")!.reset());
    expect(screen.getByRole("combobox").textContent).toBe("J1 / Pad 1 · pad-a");
  });
  it("restores defaults in an external form and preserves read-only submission", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<><form id="board" /><PadInspector label="Connector" pads={pads} name="pad" form="board" defaultValue="pad-a" /></>);
    await choose(user, screen.getByRole("combobox"), "J1 / Pad 2 · pad-c");
    await act(async () => container.querySelector("form")!.reset());
    expect(new FormData(container.querySelector("form")!).get("pad")).toBe("pad-a");
    rerender(<form><PadInspector label="Connector" pads={pads} name="pad" value="pad-a" readOnly /></form>);
    expect(new FormData(container.querySelector("form")!).get("pad")).toBe("pad-a");
    expect((screen.getByRole("combobox") as HTMLButtonElement).disabled).toBe(true);
    rerender(<form><PadInspector label="Connector" pads={pads} name="pad" value="pad-a" disabled /></form>);
    expect(Array.from(new FormData(container.querySelector("form")!).entries())).toEqual([]);
  });
  it("reports empty and duplicate records without guessing a pad", () => {
    const { rerender } = render(<PadInspector label="Connector" pads={[]} />);
    expect(screen.getByText("No pad records supplied")).toBeTruthy();
    rerender(<PadInspector label="Connector" pads={[pads[0]!, pads[0]!]} />);
    expect(screen.getByText("Pad and measurement identifiers must be unique and non-empty.")).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});

describe("DesignRuleResults", () => {
  it("uses shared filters with keyboard selection and keeps confirmed statuses distinct", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<DesignRuleResults label="Board check" violations={violations} onFilterChange={change} />);
    expect(screen.getByText("3 of 3 results")).toBeTruthy();
    await user.tab();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(change).toHaveBeenLastCalledWith({ severity: "error", status: "all" });
    expect(screen.getByText("1 of 3 results")).toBeTruthy();
    await choose(user, screen.getByRole("combobox", { name: "Result status" }), "Excluded");
    expect(screen.getByText("No results match these filters")).toBeTruthy();
    await choose(user, screen.getByRole("combobox", { name: "Severity" }), "All severities");
    expect(screen.getByText("Back copper")).toBeTruthy();
    expect(screen.queryByText("Front copper")).toBeNull();
  });
  it("requests selection and resolution without claiming either was confirmed", async () => {
    const user = userEvent.setup();
    const select = vi.fn();
    const resolve = vi.fn();
    const { container } = render(<DesignRuleResults label="Board check" violations={violations} onSelect={select} onResolve={resolve} />);
    const action = screen.getByRole("button", { name: "Select result a: Copper clearance" });
    expect(action.className).toContain("rs-btn-ghost");
    await user.click(action);
    expect(select).toHaveBeenLastCalledWith("a");
    expect(container.querySelector(".rs-design-rule-results-selected")).toBeNull();
    await screen.getByRole("button", { name: "Request resolution for a: Copper clearance" }).focus();
    await user.keyboard("{Enter}");
    expect(resolve).toHaveBeenLastCalledWith("a");
    expect(screen.getByText("Open", { selector: "dd" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Request resolution for b: Copper clearance" })).toBeNull();
    expect(screen.getByText("X: 0, Y: 18; unit: mm")).toBeTruthy();
  });
  it("blocks pending and disabled actions while retaining the confirmed open result", async () => {
    const user = userEvent.setup();
    const resolve = vi.fn();
    const { rerender } = render(<DesignRuleResults label="Board check" violations={[{ ...violations[0]!, pending: true }]} selectedId="a" onResolve={resolve} />);
    expect(screen.getByText("Copper clearance · Selected")).toBeTruthy();
    expect(screen.getByText("Update pending")).toBeTruthy();
    expect(screen.getByText("Open", { selector: "dd" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Request resolution/ }));
    expect(resolve).not.toHaveBeenCalled();
    rerender(<DesignRuleResults label="Board check" violations={[{ ...violations[0]!, canResolve: false }]} onResolve={resolve} />);
    expect(screen.queryByRole("button", { name: /Request resolution/ })).toBeNull();
    rerender(<DesignRuleResults label="Board check" violations={[{ ...violations[0]!, disabled: true }]} onResolve={resolve} />);
    expect((screen.getByRole("button", { name: /Request resolution/ }) as HTMLButtonElement).disabled).toBe(true);
  });
  it("restores uncontrolled filters on external reset and keeps controlled filters with the host", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container, rerender } = render(<><form id="rules" /><DesignRuleResults label="Board check" name="filter" form="rules" violations={violations} /></>);
    await choose(user, screen.getByRole("combobox", { name: "Severity" }), "Warning");
    expect(new FormData(container.querySelector("form")!).get("filter.severity")).toBe("warning");
    await act(async () => container.querySelector("form")!.reset());
    expect(new FormData(container.querySelector("form")!).get("filter.severity")).toBe("all");
    rerender(<form><DesignRuleResults label="Board check" name="filter" violations={violations} filter={{ severity: "all", status: "all" }} onFilterChange={change} /></form>);
    await choose(user, screen.getByRole("combobox", { name: "Severity" }), "Warning");
    expect(change).toHaveBeenLastCalledWith({ severity: "warning", status: "all" });
    expect(screen.getByText("3 of 3 results")).toBeTruthy();
    rerender(<form><DesignRuleResults label="Board check" name="filter" violations={violations} disabled /></form>);
    expect(Array.from(new FormData(container.querySelector("form")!).entries())).toEqual([]);
  });
  it("distinguishes unknown values from an empty check and reports duplicate ids", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DesignRuleResults label="Board check" violations={violations} />);
    await choose(user, screen.getByRole("combobox", { name: "Severity" }), "Unknown severity");
    expect(screen.getByText("Imported check")).toBeTruthy();
    expect(screen.getAllByText("Unknown", { selector: "dd" })).toHaveLength(2);
    rerender(<DesignRuleResults label="Board check" violations={[]} />);
    expect(screen.getByText("No rule-check results supplied")).toBeTruthy();
    expect(screen.queryByText("Passed")).toBeNull();
    rerender(<DesignRuleResults label="Board check" violations={[violations[0]!, violations[0]!]} />);
    expect(screen.getByText("Result identifiers must be unique and non-empty.")).toBeTruthy();
  });
});

const cases = [
  [PadInspector, { label: "Connector", pads, defaultValue: "pad-a" }],
  [DesignRuleResults, { label: "Board check", violations, onSelect: () => {} }],
] as const;
it.each(cases)("forwards %s root attributes and ref and has no axe violations", async (Component, props) => {
  const ref = React.createRef<HTMLFieldSetElement>();
  const Leaf = Component as unknown as React.ComponentType<Record<string, unknown> & React.RefAttributes<HTMLFieldSetElement>>;
  const { container } = render(<Leaf {...props} ref={ref} data-board="042" className="consumer" style={{ marginTop: 17 }} />);
  expect(ref.current?.tagName).toBe("FIELDSET");
  expect(ref.current?.dataset.board).toBe("042");
  expect(ref.current?.className).toContain("consumer");
  expect(ref.current?.style.marginTop).toBe("17px");
  expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
});
