import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { AlarmPanel } from "../src/components/alarm-panel";
import type { AlarmRecord } from "../src/components/alarm-panel";
import { WorkOffsetPanel } from "../src/components/work-offset-panel";

afterEach(cleanup);
const alarms: AlarmRecord[] = [
  { id: "cleared", label: "Cooling flow", condition: "cleared", acknowledgement: "unacknowledged", shelving: "unshelved", actions: ["acknowledge"] },
  { id: "shelved", label: "Sensor connection", condition: "active", acknowledgement: "acknowledged", shelving: "shelved", actions: ["unshelve"] },
  { id: "unknown", label: "Unreported event", condition: "unknown", acknowledgement: "unknown", shelving: "unknown" },
];
const axes = [{ id: "x", label: "X", unit: "mm", machine: 125, work: 0 }, { id: "a", label: "A", unit: "°", machine: -30, work: -5 }];
const systems = [{ id: "g54", label: "G54" }, { id: "g55", label: "G55" }, { id: "locked", label: "Locked", disabled: true }];
const defaults = { systemId: "g54", offsets: { x: 125, a: -25 } };
const props = { label: "Fixture offsets", axes, systems, activeSystemId: "g54", defaultValue: defaults };

describe("AlarmPanel", () => {
  it("filters independent lifecycle fields, including cleared but unacknowledged events", async () => {
    const user = userEvent.setup();
    render(<AlarmPanel label="Events" alarms={alarms} />);
    await user.click(screen.getByRole("button", { name: "Unacknowledged" }));
    expect(screen.getByText("Cooling flow")).toBeTruthy();
    expect(screen.queryByText("Sensor connection")).toBeNull();
    expect(screen.getByText("Cleared")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Active" }));
    expect(screen.getByText("Sensor connection")).toBeTruthy();
    expect(screen.getByText("Shelving expiry unknown")).toBeTruthy();
    expect(screen.queryByText("Cooling flow")).toBeNull();
  });
  it("requests actions without mutating the supplied lifecycle and disables pending actions", async () => {
    const action = vi.fn(); const user = userEvent.setup();
    const view = render(<AlarmPanel label="Events" alarms={alarms} onAction={action} />);
    await user.click(screen.getByRole("button", { name: "Acknowledge: Cooling flow" }));
    expect(action).toHaveBeenCalledWith("cleared", "acknowledge");
    const row = screen.getByText("Cooling flow").closest("li")!;
    expect(within(row).getByText("Unacknowledged")).toBeTruthy();
    expect(within(row).getByText("Cleared")).toBeTruthy();
    view.rerender(<AlarmPanel label="Events" alarms={alarms.map(alarm => ({ ...alarm, pending: true }))} onAction={action} />);
    await user.click(screen.getByRole("button", { name: "Acknowledge: Cooling flow" }));
    expect(action).toHaveBeenCalledTimes(1);
  });
  it("keeps a controlled filter until the application accepts it and supports keyboard activation", async () => {
    const change = vi.fn(); const user = userEvent.setup();
    render(<AlarmPanel label="Events" alarms={alarms} filter="all" onFilterChange={change} />);
    screen.getByRole("button", { name: "Shelved" }).focus();
    await user.keyboard(" ");
    expect(change).toHaveBeenCalledWith("shelved");
    expect(screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("3 of 3 alarm records")).toBeTruthy();
  });
  it("reports an empty record set and has no axe violations", async () => {
    const { container } = render(<AlarmPanel label="Events" alarms={[]} />);
    expect(screen.getByText("No alarm records supplied")).toBeTruthy();
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe("WorkOffsetPanel", () => {
  it("preserves reported positions and the active system while editing and applying a draft", async () => {
    const user = userEvent.setup(); const apply = vi.fn();
    render(<WorkOffsetPanel {...props} onApply={apply} offsetState="suspended" />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}{Enter}");
    const input = screen.getByRole("spinbutton", { name: "X offset (mm)" });
    await user.clear(input); await user.type(input, "100.125");
    await user.click(screen.getByRole("button", { name: "Apply offsets" }));
    expect(apply).toHaveBeenCalledWith({ systemId: "g55", offsets: { x: 100.125, a: -25 } });
    expect(screen.getByText("Active system: G54 · Offsets suspended")).toBeTruthy();
    expect(screen.getByRole("cell", { name: "125" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "0" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "-5" })).toBeTruthy();
  });
  it("blocks offsets for unlisted axes instead of applying unseen values", () => {
    render(<WorkOffsetPanel {...props} value={{ ...defaults, offsets: { ...defaults.offsets, z: NaN } }} onApply={vi.fn()} />);
    expect((screen.getByRole("button", { name: "Apply offsets" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Draft contains offsets for unlisted axes")).toBeTruthy();
  });
  it("restores uncontrolled defaults through an external form reset and submits exact axis values", async () => {
    const user = userEvent.setup();
    const { container } = render(<><form id="offset-form" /><WorkOffsetPanel {...props} form="offset-form" name="fixture" /></>);
    const form = container.querySelector("form")!;
    await user.clear(screen.getByRole("spinbutton", { name: "X offset (mm)" }));
    await user.type(screen.getByRole("spinbutton", { name: "X offset (mm)" }), "0");
    expect(new FormData(form).get("fixture.x")).toBe("0");
    expect(new FormData(form).get("fixture.a")).toBe("-25");
    await act(async () => form.reset());
    expect(new FormData(form).get("fixture.x")).toBe("125");
    expect(new FormData(form).get("fixture.system")).toBe("g54");
  });
  it("keeps controlled values through rejected edits and form reset", async () => {
    const user = userEvent.setup(); const change = vi.fn();
    const { container } = render(<form><WorkOffsetPanel {...props} value={{ systemId: "g55", offsets: { x: 0, a: 12 } }} onValueChange={change} /></form>);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "G54" }));
    expect(change).toHaveBeenCalledWith({ systemId: "g54", offsets: { x: 0, a: 12 } });
    await act(async () => container.querySelector("form")!.reset());
    expect(screen.getByRole("combobox").textContent).toBe("G55");
    expect((screen.getByRole("spinbutton", { name: "X offset (mm)" }) as HTMLInputElement).value).toBe("0");
  });
  it.each([null, NaN, Infinity])("blocks incomplete or unavailable draft offset %s", value => {
    render(<WorkOffsetPanel {...props} value={{ systemId: "g54", offsets: { x: value, a: 0 } }} onApply={vi.fn()} />);
    expect((screen.getByRole("button", { name: "Apply offsets" }) as HTMLButtonElement).disabled).toBe(true);
  });
  it.each([null, "unknown", "locked"])("blocks apply for unselected, unknown or disabled system %s", systemId => {
    render(<WorkOffsetPanel {...props} value={{ ...defaults, systemId }} onApply={vi.fn()} />);
    expect((screen.getByRole("button", { name: "Apply offsets" }) as HTMLButtonElement).disabled).toBe(true);
  });
  it("keeps readonly values submittable while disabled and pending values are omitted", async () => {
    const { container, rerender } = render(<form><WorkOffsetPanel {...props} name="fixture" readOnly /></form>);
    expect(new FormData(container.querySelector("form")!).get("fixture.system")).toBe("g54");
    expect(new FormData(container.querySelector("form")!).get("fixture.x")).toBe("125");
    rerender(<form><WorkOffsetPanel {...props} name="fixture" readOnly disabled /></form>);
    expect([...new FormData(container.querySelector("form")!).entries()]).toEqual([]);
    rerender(<form><WorkOffsetPanel {...props} name="fixture" pending /></form>);
    expect([...new FormData(container.querySelector("form")!).entries()]).toEqual([]);
  });
  it("distinguishes unknown and nonfinite readings from zero and passes axe", async () => {
    const { container } = render(<WorkOffsetPanel {...props} axes={[{ id: "x", label: "X", unit: "mm", machine: null, work: Infinity }]} />);
    expect(screen.getByRole("cell", { name: "Unknown" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Unavailable" })).toBeTruthy();
    expect((await axe(container)).violations).toEqual([]);
  });
});
