import * as React from "react";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { StagePositionList } from "../src/components/stage-position-list";
import type { StagePosition, StagePositionListProps } from "../src/components/stage-position-list";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const positions: readonly StagePosition[] = Object.freeze([
  Object.freeze({ id: "p1", name: "Sample", x: 0, y: -12.5, z: null, enabled: true }),
  Object.freeze({ id: "p2", name: "Sample", x: 24, y: 10, z: 0, enabled: false }),
]);
const base = { label: "Stage positions", coordinateFrame: { id: "stage-01", label: "Recorded stage" }, units: { x: "µm", y: "µm", z: "nm" }, positions } satisfies StagePositionListProps;
function Editable({ readOnly = false }: { readOnly?: boolean }) {
  const [records, setRecords] = React.useState(positions);
  const [value, setValue] = React.useState<string | null>("p1");
  return <StagePositionList {...base} positions={records} value={value} onValueChange={setValue} readOnly={readOnly} onEnabledChange={(id, enabled) => setRecords(current => current.map(position => position.id === id ? { ...position, enabled } : position))} onOrderChange={ids => setRecords(current => ids.map(id => current.find(position => position.id === id)!))} onRemove={id => { setRecords(current => current.filter(position => position.id !== id)); if (value === id) setValue(null); }} />;
}

describe("StagePositionList", () => {
  it("keeps exact signed coordinates, zero, explicit units and frame identity", () => {
    render(<StagePositionList {...base} />);
    expect(screen.getByText("Coordinate frame: Recorded stage (stage-01)")).toBeTruthy();
    const first = within(screen.getByRole("listitem", { name: "Sample (p1)" }));
    expect(first.getByText("0")).toBeTruthy();
    expect(first.getByText("-12.5")).toBeTruthy();
    expect(first.getByText("Not supplied")).toBeTruthy();
    expect(first.getByText("X (µm)")).toBeTruthy();
    expect(first.getByText("Z (nm)")).toBeTruthy();
    expect(first.getByText("Included in plan")).toBeTruthy();
    expect(within(screen.getByRole("listitem", { name: "Sample (p2)" })).getByText("Excluded from plan")).toBeTruthy();
    expect(screen.getByText("No position selected")).toBeTruthy();
  });
  it("distinguishes missing frame and units, nonfinite coordinates and negative zero", () => {
    render(<StagePositionList {...base} coordinateFrame={null} units={{ x: null, y: "", z: "nm" }} positions={[{ ...positions[0]!, x: Number.NaN, y: Number.POSITIVE_INFINITY, z: -0 }]} />);
    expect(screen.getByText("Coordinate frame: Not supplied")).toBeTruthy();
    expect(screen.getByText("X (Unit not supplied)")).toBeTruthy();
    expect(screen.getByText("Y (Unit not supplied)")).toBeTruthy();
    expect(screen.getAllByText("Unavailable")).toHaveLength(2);
    expect(screen.getByText("-0")).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
  });
  it("never chooses a first row for an unknown selection and preserves finite extremes", () => {
    render(<StagePositionList {...base} value="absent" positions={[{ ...positions[0]!, x: Number.MAX_VALUE, y: -Number.MIN_VALUE }]} onValueChange={vi.fn()} />);
    expect(screen.getByText("Selected position unavailable")).toBeTruthy();
    expect((screen.getByRole("radio") as HTMLInputElement).checked).toBe(false);
    expect(screen.getByText(String(Number.MAX_VALUE))).toBeTruthy();
    expect(screen.getByText(String(-Number.MIN_VALUE))).toBeTruthy();
  });
  it("keeps tiny nonzero readings distinct from exact zero without rounding coordinates", () => {
    render(<StagePositionList {...base} positions={[{ ...positions[0]!, x: 0.0001, y: -1e-9, z: 0 }]} />);
    const readings = screen.getAllByRole("definition").map(reading => reading.textContent);
    expect(readings).toEqual(["0.0001", "-1e-9", "0"]);
  });
  it("supports native radio arrow selection and checkbox Space without conflating selection and inclusion", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("CSS", { escape: (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, character => `\\${character}`) });
    render(<Editable />);
    screen.getByRole("radio", { name: "Sample (p1)" }).focus();
    await user.keyboard("{ArrowDown}");
    expect((screen.getByRole("radio", { name: "Sample (p2)" }) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText("Selected: Sample (p2)")).toBeTruthy();
    const include = screen.getByRole("checkbox", { name: "Sample (p2): Include" });
    expect((include as HTMLInputElement).checked).toBe(false);
    include.focus(); await user.keyboard(" ");
    expect((include as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText("Selected: Sample (p2)")).toBeTruthy();
  });
  it("keeps rejected requests separate from supplied selection, inclusion, order and removal", async () => {
    const user = userEvent.setup(), select = vi.fn(), include = vi.fn(), order = vi.fn(), remove = vi.fn();
    render(<StagePositionList {...base} value="p1" onValueChange={select} onEnabledChange={include} onOrderChange={order} onRemove={remove} />);
    await user.click(screen.getByRole("radio", { name: "Sample (p2)" }));
    expect(select).toHaveBeenLastCalledWith("p2");
    expect((screen.getByRole("radio", { name: "Sample (p1)" }) as HTMLInputElement).checked).toBe(true);
    await user.click(screen.getByRole("checkbox", { name: "Sample (p2): Include" }));
    expect(include).toHaveBeenLastCalledWith("p2", true);
    expect((screen.getByRole("checkbox", { name: "Sample (p2): Include" }) as HTMLInputElement).checked).toBe(false);
    await user.click(screen.getByRole("button", { name: "Sample (p1): Move down" }));
    expect(order).toHaveBeenLastCalledWith(["p2", "p1"]);
    await user.click(screen.getByRole("button", { name: "Sample (p1): Remove" }));
    expect(remove).toHaveBeenLastCalledWith("p1");
    expect(screen.getAllByRole("listitem").map(row => row.getAttribute("aria-label"))).toEqual(["Sample (p1)", "Sample (p2)"]);
    expect(screen.getByRole("status").textContent).toBe("");
    expect(positions[1]!.enabled).toBe(false);
  });
  it("keeps selection identity and restores useful focus after accepted reorder and removal", async () => {
    const user = userEvent.setup();
    render(<Editable />);
    const down = screen.getByRole("button", { name: "Sample (p1): Move down" });
    down.focus(); await user.keyboard("{Enter}");
    expect(screen.getAllByRole("listitem").map(row => row.getAttribute("aria-label"))).toEqual(["Sample (p2)", "Sample (p1)"]);
    expect(screen.getByRole("radio", { name: "Sample (p1)" })).toBe(document.activeElement);
    expect(screen.getByRole("status").textContent).toBe("Sample (p1), position 2 of 2");
    await user.click(screen.getByRole("button", { name: "Sample (p1): Remove" }));
    expect(screen.getByRole("radio", { name: "Sample (p2)" })).toBe(document.activeElement);
    expect(screen.getByText("No position selected")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Sample (p2): Remove" }));
    expect(screen.getByRole("group", { name: "Stage positions" })).toBe(document.activeElement);
    expect(screen.getByText("No stage positions supplied")).toBeTruthy();
  });
  it("does not steal focus when delayed removal is accepted after the user leaves the list", async () => {
    const user = userEvent.setup(), remove = vi.fn();
    const view = (records: readonly StagePosition[]) => <><StagePositionList {...base} positions={records} onRemove={remove} onValueChange={vi.fn()} /><button type="button">Outside</button></>;
    const { rerender } = render(view(positions));
    await user.click(screen.getByRole("button", { name: "Sample (p1): Remove" }));
    screen.getByRole("button", { name: "Outside" }).focus();
    rerender(view([positions[1]!]));
    expect(screen.getByRole("button", { name: "Outside" })).toBe(document.activeElement);
  });
  it("locks pending edits and adjacent swaps while allowing inspection", async () => {
    const user = userEvent.setup(), select = vi.fn(), include = vi.fn(), order = vi.fn(), remove = vi.fn();
    render(<StagePositionList {...base} positions={[positions[0]!, { ...positions[1]!, pending: true }]} onValueChange={select} onEnabledChange={include} onOrderChange={order} onRemove={remove} />);
    expect((screen.getByRole("button", { name: "Sample (p1): Move down" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Sample (p2): Remove" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("checkbox", { name: "Sample (p2): Include" }) as HTMLInputElement).disabled).toBe(true);
    await user.click(screen.getByRole("radio", { name: "Sample (p2)" }));
    expect(select).toHaveBeenCalledWith("p2");
    expect(screen.getByText("Edit pending; supplied record remains unchanged")).toBeTruthy();
    expect(remove).not.toHaveBeenCalled(); expect(order).not.toHaveBeenCalled();
  });
  it("keeps read-only inspection separate from disabled or ancestor-disabled controls", async () => {
    const user = userEvent.setup();
    const select = vi.fn(), edit = vi.fn();
    const view = (disabled: boolean, ancestor = false) => <fieldset disabled={ancestor}><StagePositionList {...base} value="p1" disabled={disabled} readOnly onValueChange={select} onEnabledChange={edit} onOrderChange={edit} onRemove={edit} /></fieldset>;
    const { rerender } = render(view(false));
    await user.click(screen.getByRole("radio", { name: "Sample (p2)" })); expect(select).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("checkbox", { name: "Sample (p1): Include" }));
    await user.click(screen.getByRole("button", { name: "Sample (p1): Remove" })); expect(edit).not.toHaveBeenCalled();
    rerender(view(true)); await user.click(screen.getByRole("radio", { name: "Sample (p2)" }));
    rerender(view(false, true)); await user.click(screen.getByRole("radio", { name: "Sample (p2)" })); expect(select).toHaveBeenCalledTimes(1);
  });
  it("rejects duplicate/empty IDs and over-bound lists rather than silently filtering them", () => {
    const { rerender } = render(<StagePositionList {...base} positions={[positions[0]!, positions[0]!]} />);
    expect(screen.getByText(/Positions unavailable:/)).toBeTruthy(); expect(screen.queryByRole("radio")).toBeNull();
    rerender(<StagePositionList {...base} positions={[{ ...positions[0]!, id: " " }]} />);
    expect(screen.getByText(/Positions unavailable:/)).toBeTruthy();
    rerender(<StagePositionList {...base} positions={Array.from({ length: 129 }, (_, i) => ({ ...positions[0]!, id: String(i) }))} />);
    expect(screen.queryByRole("radio")).toBeNull(); expect(screen.getByText(/at most 128/)).toBeTruthy();
    rerender(<StagePositionList {...base} positions={[]} />); expect(screen.getByText("No stage positions supplied")).toBeTruthy();
  });
  it("keeps named controlled selection through external form reset and never submits action buttons", async () => {
    const user = userEvent.setup(), select = vi.fn(), include = vi.fn(), submit = vi.fn();
    const { container } = render(<><form id="plan" onSubmit={event => { event.preventDefault(); submit(); }} /><StagePositionList {...base} form="plan" name="position" value="p1" onValueChange={select} onEnabledChange={include} onRemove={vi.fn()} /></>);
    await user.click(screen.getByRole("radio", { name: "Sample (p2)" }));
    await user.click(screen.getByRole("checkbox", { name: "Sample (p2): Include" }));
    await user.click(screen.getByRole("button", { name: "Sample (p1): Remove" }));
    await act(async () => { container.querySelector("form")!.reset(); });
    expect(new FormData(container.querySelector("form")!).get("position")).toBe("p1");
    expect((screen.getByRole("radio", { name: "Sample (p1)" }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("checkbox", { name: "Sample (p2): Include" }) as HTMLInputElement).checked).toBe(false);
    expect(submit).not.toHaveBeenCalled();
    expect(select).toHaveBeenCalledTimes(1); expect(include).toHaveBeenCalledTimes(1);
  });
  it("forwards native attributes and refs, merges style, and has accessible names for duplicate labels", async () => {
    const ref = React.createRef<HTMLFieldSetElement>();
    const { container } = render(<StagePositionList {...base} ref={ref} title="Recorded stage positions" className="host-class" style={{ marginTop: 12 }} data-source="local" description="Supplied coordinates only" aria-describedby="host-help" onValueChange={vi.fn()} onEnabledChange={vi.fn()} onOrderChange={vi.fn()} onRemove={vi.fn()}><p id="host-help">Host review is separate</p></StagePositionList>);
    expect(ref.current?.tagName).toBe("FIELDSET"); expect(ref.current?.classList.contains("host-class")).toBe(true);
    expect(ref.current?.style.marginTop).toBe("12px"); expect(ref.current?.dataset.source).toBe("local");
    expect(ref.current?.getAttribute("aria-describedby")).toContain("host-help");
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});
