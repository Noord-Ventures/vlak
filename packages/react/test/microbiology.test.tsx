import * as React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { ColonyPlate } from "../src/components/colony-plate";
import { CultureLog } from "../src/components/culture-log";
import type { CultureObservation } from "../src/components/culture-log";

afterEach(cleanup);
const markers = [
  { id: "first", label: "Colony 01", x: 0, y: 50, description: "Recorded at the plate edge" },
  { id: "second", label: "Colony 02", x: 50, y: 50 },
  { id: "third", label: "Colony 03", x: null, y: null },
];
const observations: readonly CultureObservation[] = [
  { id: "image", label: "Image attached", dateTime: "2026-09-07T10:00:00+02:00", status: "Recorded", notes: "Source image attached" },
  { id: "received", label: "Sample received", dateTime: "2026-09-07T06:00:00Z", status: "Recorded" },
  { id: "unknown", label: "Imported note", dateTime: null, notes: "No source timestamp" },
];
const culture = { label: "Culture observations", cultureId: "C-042", sampleId: "S-042", observations, medium: "Agar medium A", status: "Awaiting review" };
const observationLabels = () => [...document.querySelectorAll(".rs-culture-log-observation-label")].map(node => node.textContent);

describe("ColonyPlate", () => {
  it("keeps the source count separate from exact supplied and positioned marker counts", () => {
    const { container, rerender } = render(<ColonyPlate label="Plate" markers={markers} recordedCount={12} />);
    expect(screen.getByText("Source count: 12")).toBeTruthy();
    expect(screen.getByText("3 marker records supplied; 2 positioned")).toBeTruthy();
    expect(container.querySelectorAll(".rs-colony-plate-marker")).toHaveLength(2);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Position not supplied")).toBeTruthy();
    rerender(<ColonyPlate label="Plate" markers={markers} recordedCount={0} />);
    expect(screen.getByText("Source count: 0")).toBeTruthy();
    expect(screen.getByText("3 marker records supplied; 2 positioned")).toBeTruthy();
  });

  it("preserves zero coordinates and maps supplied normalized positions without invalid geometry", () => {
    const { container, rerender } = render(<ColonyPlate label="Plate" markers={markers} />);
    const circles = [...container.querySelectorAll(".rs-colony-plate-marker")];
    expect(circles.map(circle => [circle.getAttribute("cx"), circle.getAttribute("cy")])).toEqual([["12", "120"], ["120", "120"]]);
    expect(screen.getByText("x 0%, y 50%")).toBeTruthy();
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    rerender(<ColonyPlate label="Plate" markers={[{ id: "a", label: "Outside", x: 0, y: 0 }, { id: "b", label: "Invalid", x: Number.NaN, y: Infinity }, { id: "c", label: "Extreme", x: Number.MAX_VALUE, y: 50 }]} />);
    expect(container.querySelectorAll(".rs-colony-plate-marker")).toHaveLength(0);
    expect(screen.getAllByText("Position unavailable")).toHaveLength(3);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(container.querySelector("svg")?.outerHTML).not.toMatch(/NaN|Infinity/);
  });

  it.each([undefined, null, Number.NaN, Infinity, -1, Number.MAX_SAFE_INTEGER + 1])("does not infer a valid source count from %s", count => {
    render(<ColonyPlate label="Plate" markers={markers} recordedCount={count} />);
    expect(screen.getByText(`Source count: ${count == null ? "Not supplied" : "Unavailable"}`)).toBeTruthy();
    expect(screen.queryByText("Source count: 3")).toBeNull();
  });

  it("selects and clears records by native keyboard controls without submitting a form", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const submit = vi.fn(event => event.preventDefault());
    render(<form onSubmit={submit}><ColonyPlate label="Plate" markers={[markers[0]!, { ...markers[1]!, disabled: true }, markers[2]!]} onValueChange={change} /></form>);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Select 1. Colony 01" }));
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith("first");
    expect(screen.getByRole("button", { name: "Select 1. Colony 01" }).getAttribute("aria-pressed")).toBe("true");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Select 3. Colony 03" }));
    await user.keyboard(" ");
    expect(screen.getByRole("status").textContent).toBe("Selected record: Colony 03");
    await user.tab();
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole("status").textContent).toBe("No record selected");
    expect(submit).not.toHaveBeenCalled();
  });

  it("retains controlled selection until the host accepts a new marker", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(<ColonyPlate label="Plate" markers={markers} value="first" onValueChange={change} />);
    await user.click(screen.getByRole("button", { name: "Select 2. Colony 02" }));
    expect(change).toHaveBeenLastCalledWith("second");
    expect(screen.getByRole("button", { name: "Select 1. Colony 01" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("status").textContent).toBe("Selected record: Colony 01");
    rerender(<ColonyPlate label="Plate" markers={markers} value="second" onValueChange={change} />);
    expect(screen.getByRole("status").textContent).toBe("Selected record: Colony 02");
    rerender(<ColonyPlate label="Plate" markers={markers} value="unknown" onValueChange={change} />);
    expect(screen.getByRole("status").textContent).toBe("Selected record unavailable");
  });

  it("restores uncontrolled selection on native form reset and respects cancelled reset", async () => {
    const user = userEvent.setup();
    const { container } = render(<form><ColonyPlate label="Plate" markers={markers} defaultValue="first" /></form>);
    await user.click(screen.getByRole("button", { name: "Select 2. Colony 02" }));
    const form = container.querySelector("form")!;
    const cancel = (event: Event) => event.preventDefault();
    form.addEventListener("reset", cancel);
    await act(async () => { form.reset(); });
    expect(screen.getByRole("status").textContent).toBe("Selected record: Colony 02");
    form.removeEventListener("reset", cancel);
    await act(async () => { form.reset(); });
    expect(screen.getByRole("status").textContent).toBe("Selected record: Colony 01");
  });

  it("preserves a complete static record list and rejects ambiguous or oversized marker collections", () => {
    const { container, rerender } = render(<ColonyPlate label="Plate" markers={markers} defaultValue="first" readOnly />);
    expect(screen.getByText("1. Colony 01 (selected)")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    rerender(<ColonyPlate label="Plate" markers={[markers[0]!, markers[0]!]} />);
    expect(screen.getByText(/unique non-empty record identifiers/)).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull();
    rerender(<ColonyPlate label="Plate" markers={Array.from({ length: 257 }, (_, index) => ({ ...markers[0]!, id: String(index) }))} />);
    expect(screen.getByText("257 marker records supplied")).toBeTruthy();
    expect(screen.getByText(/at most 256 records/)).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
    rerender(<ColonyPlate label="Plate" markers={[]} />);
    expect(screen.getByText("No marker records supplied")).toBeTruthy();
    expect(screen.getByText("Source count: Not supplied")).toBeTruthy();
  });
});

describe("CultureLog", () => {
  it("orders actual timestamp instants without mutating the supplied observations", () => {
    const { rerender } = render(<CultureLog {...culture} />);
    expect(observationLabels()).toEqual(["Sample received", "Image attached", "Imported note"]);
    expect(observations.map(observation => observation.id)).toEqual(["image", "received", "unknown"]);
    expect(screen.getByText("2026-09-07T06:00:00Z").getAttribute("datetime")).toBe("2026-09-07T06:00:00Z");
    rerender(<CultureLog {...culture} order="newest" />);
    expect(observationLabels()).toEqual(["Image attached", "Sample received", "Imported note"]);
  });

  it("retains stable order for equal instants and keeps malformed, impossible and missing dates undated", () => {
    render(<CultureLog {...culture} observations={[
      { id: "invalid", label: "Impossible date", dateTime: "2026-02-30T10:00:00Z", timeLabel: "Misleading supplied label" },
      { id: "first", label: "First equal instant", dateTime: "2026-09-07T10:00:00+02:00" },
      { id: "second", label: "Second equal instant", dateTime: "2026-09-07T08:00:00Z" },
      { id: "local", label: "No offset", dateTime: "2026-09-07T09:00:00" },
      { id: "missing", label: "Missing time", dateTime: null },
    ]} />);
    expect(observationLabels()).toEqual(["First equal instant", "Second equal instant", "Impossible date", "No offset", "Missing time"]);
    expect(screen.getAllByText("Timestamp unavailable")).toHaveLength(2);
    expect(screen.getByText("Time not supplied")).toBeTruthy();
    expect(screen.queryByText("Misleading supplied label")).toBeNull();
    expect(document.querySelectorAll("time[datetime]")).toHaveLength(2);
  });

  it("keeps source identity, medium and zero conditions while naming missing metadata", () => {
    const { container } = render(<CultureLog {...culture} medium={null} conditions={[{ id: "zero", label: "Source count", value: 0 }, { id: "missing", label: "Station", value: null }, { id: "bad", label: "Reading", value: Number.NaN }]} />);
    expect(screen.getByText("C-042")).toBeTruthy();
    expect(screen.getByText("S-042")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getAllByText("Not supplied")).toHaveLength(2);
    expect(screen.getByText("Unavailable")).toBeTruthy();
    expect(container.innerHTML).not.toContain("NaN");
  });

  it("requests a recording action from the keyboard without inventing an observation or status", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const submit = vi.fn(event => event.preventDefault());
    const { rerender } = render(<form onSubmit={submit}><CultureLog {...culture} actions={[{ id: "review", label: "Record review" }]} onAction={action} /></form>);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Record review: C-042" }));
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenLastCalledWith("review");
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByText("Awaiting review")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    rerender(<CultureLog {...culture} pending actions={[{ id: "review", label: "Record review" }]} onAction={action} />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Record update pending; supplied status is unchanged")).toBeTruthy();
    expect(screen.getByText("Awaiting review")).toBeTruthy();
    await user.click(screen.getByRole("button"));
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("updates displayed records only from host props and suppresses unavailable actions", () => {
    const { rerender } = render(<CultureLog {...culture} actions={[{ id: "review", label: "Record review" }]} />);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<CultureLog {...culture} status="Review noted" observations={[...observations, { id: "review", label: "Review record attached", dateTime: "2026-09-07T11:00:00+02:00", status: "Recorded" }]} actions={[{ id: "review", label: "Record review", disabled: true }]} onAction={() => {}} />);
    expect(screen.getByText("Review noted")).toBeTruthy();
    expect(observationLabels()).toEqual(["Sample received", "Image attached", "Review record attached", "Imported note"]);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });

  it("keeps empty records explicit and rejects ambiguous or oversized collections without partial output", () => {
    const { rerender } = render(<CultureLog {...culture} observations={[]} status={null} />);
    expect(screen.getByText("No observations supplied")).toBeTruthy();
    expect(screen.getByText("Status not supplied")).toBeTruthy();
    rerender(<CultureLog {...culture} observations={[observations[0]!, observations[0]!]} />);
    expect(screen.getByText(/Culture records unavailable/)).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
    rerender(<CultureLog {...culture} observations={Array.from({ length: 257 }, (_, index) => ({ ...observations[0]!, id: String(index) }))} />);
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.getByText(/at most 256 observations/)).toBeTruthy();
  });
});

it.each([
  ["plate", <ColonyPlate key="plate" label="Plate" markers={markers} recordedCount={12} defaultValue="first" />],
  ["culture", <CultureLog key="culture" {...culture} actions={[{ id: "review", label: "Record review" }]} onAction={() => {}} />],
] as const)("%s has no axe violations", async (_, specimen) => {
  const { container } = render(specimen);
  expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
});

it.each([
  [ColonyPlate, { label: "Plate", markers }, "FIGURE"],
  [CultureLog, culture, "DIV"],
] as const)("forwards %s refs, attributes and consumer style overrides", (Component, props, tag) => {
  const ref = React.createRef<HTMLElement>();
  const Leaf = Component as unknown as React.ComponentType<Record<string, unknown> & React.RefAttributes<HTMLElement>>;
  render(<Leaf {...props} ref={ref} data-record="042" dir="rtl" className="consumer" style={{ marginTop: 17 }} />);
  expect(ref.current?.tagName).toBe(tag);
  expect(ref.current?.dataset.record).toBe("042");
  expect(ref.current?.dir).toBe("rtl");
  expect(ref.current?.className).toContain("consumer");
  expect(ref.current?.style.marginTop).toBe("17px");
});
