import * as React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { CoordinateReferenceField } from "../src/components/coordinate-reference-field";
import { DatumTransformPicker } from "../src/components/datum-transform-picker";
import { RasterBandMixer } from "../src/components/raster-band-mixer";
import type { RasterBandConfiguration } from "../src/components/raster-band-mixer";

afterEach(cleanup);
async function choose(user: ReturnType<typeof userEvent.setup>, trigger: HTMLElement, label: string) {
  if (trigger.getAttribute("aria-expanded") !== "true") await user.click(trigger);
  await user.click(screen.getByRole("option", { name: label }));
}
function formValid(container: HTMLElement) { let valid = false; act(() => { valid = container.querySelector("form")!.checkValidity(); }); return valid; }

const references = [{ value: "survey-a", label: "Survey grid A" }, { value: "survey-b", label: "Survey grid B" }];
const axes = [{ id: "east", label: "Easting", unit: "m" }, { id: "north", label: "Northing", unit: "m" }];
const coordinate = { reference: "survey-a", coordinates: { east: 0, north: 20.125 } };
const transformations = [
  { id: "grid", label: "Grid correction", available: true, accuracy: "0.1 m", area: "Survey extent", grids: [{ id: "grid-a", label: "Correction grid", available: false }], unavailableReason: "Install the correction grid" },
  { id: "parameter", label: "Parameter transform", available: true, accuracy: "2 m", area: "Survey extent", grids: [] },
  { id: "unknown", label: "Unverified operation", available: null },
];
const datumProps = { label: "Coordinate operation", sourceReference: "Survey grid A", destinationReference: "Survey grid B", transformations };
const bands = [{ id: "b1", label: "Band 1", unit: "counts", noDataValue: 0 }, { id: "b2", label: "Band 2", noDataValue: null }, { id: "b3", label: "Band 3" }];
const configuration: RasterBandConfiguration = { mode: "rgb", stretch: "min-max", red: { bandId: "b1", minimum: 0, maximum: 255 }, green: { bandId: "b2", minimum: 0, maximum: 255 }, blue: { bandId: "b3", minimum: 0, maximum: 255 }, single: { bandId: "b2", minimum: 10, maximum: 40 } };

describe("CoordinateReferenceField", () => {
  it("edits numeric axes by keyboard and assigns a reference without reprojecting", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(<form><CoordinateReferenceField label="Survey point" axes={axes} references={references} name="point" defaultValue={coordinate} onValueChange={change} /></form>);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Coordinate reference" }));
    await choose(user, screen.getByRole("combobox"), "Survey grid B");
    expect(change).toHaveBeenLastCalledWith({ ...coordinate, reference: "survey-b" });
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("spinbutton", { name: "Easting (m)" }));
    await user.keyboard("{Control>}a{/Control}12.5");
    expect((screen.getByRole("spinbutton", { name: "Easting (m)" }) as HTMLInputElement).value).toBe("12.5");
    expect(new FormData(container.querySelector("form")!).get("point.coordinates.north")).toBe("20.125");
    expect(new FormData(container.querySelector("form")!).get("point.reference")).toBe("survey-b");
  });
  it("preserves controlled coordinates until accepted and through reset", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<form><CoordinateReferenceField label="Point" axes={axes} references={references} value={coordinate} onValueChange={change} /></form>);
    await choose(user, screen.getByRole("combobox"), "Survey grid B");
    expect(change).toHaveBeenCalledWith({ ...coordinate, reference: "survey-b" });
    expect(screen.getByRole("combobox").textContent).toBe("Survey grid A");
    await user.clear(screen.getByRole("spinbutton", { name: "Easting (m)" }));
    expect((screen.getByRole("spinbutton", { name: "Easting (m)" }) as HTMLInputElement).value).toBe("0");
    await act(async () => container.querySelector("form")!.reset());
    expect(screen.getByRole("combobox").textContent).toBe("Survey grid A");
  });
  it("resets an uncontrolled field in its external form without an extra change request", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<><form id="survey" /><CoordinateReferenceField form="survey" name="point" label="Point" axes={axes} references={references} defaultValue={coordinate} onValueChange={change} /></>);
    await choose(user, screen.getByRole("combobox"), "Survey grid B");
    await act(async () => container.querySelector("form")!.reset());
    expect(screen.getByRole("combobox").textContent).toBe("Survey grid A");
    expect(change).toHaveBeenCalledTimes(1);
  });
  it("distinguishes missing values, zero, invalid numbers and unknown references", () => {
    const { container, rerender } = render(<form><CoordinateReferenceField label="Point" axes={axes} references={references} value={{ reference: null, coordinates: { east: 0, north: null } }} /></form>);
    expect((screen.getByRole("spinbutton", { name: "Easting (m)" }) as HTMLInputElement).value).toBe("0");
    expect(screen.getByText("Not supplied")).toBeTruthy();
    rerender(<form><CoordinateReferenceField label="Point" axes={axes} references={references} value={{ reference: "missing", coordinates: { east: Number.NaN, north: 0 } }} /></form>);
    expect(screen.getByText("Reference unavailable: missing")).toBeTruthy();
    expect(screen.getByText("Coordinate unavailable")).toBeTruthy();
    expect(formValid(container)).toBe(false);
  });
  it("retains read-only form values, excludes disabled values and honors required axes", () => {
    const { container, rerender } = render(<form><CoordinateReferenceField label="Point" axes={axes} references={references} name="point" value={coordinate} readOnly /></form>);
    expect(new FormData(container.querySelector("form")!).get("point.reference")).toBe("survey-a");
    expect(new FormData(container.querySelector("form")!).get("point.coordinates.east")).toBe("0");
    rerender(<form><CoordinateReferenceField label="Point" axes={axes} references={references} name="point" value={coordinate} disabled /></form>);
    expect(Array.from(new FormData(container.querySelector("form")!).entries())).toEqual([]);
    rerender(<form><CoordinateReferenceField label="Point" axes={axes} references={references} required /></form>);
    expect(formValid(container)).toBe(false);
  });
});

describe("DatumTransformPicker", () => {
  it("keeps missing-grid and unknown alternatives visible and unselectable", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<DatumTransformPicker {...datumProps} onValueChange={change} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Transformation" }));
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Grid correction (Required grids unavailable)" }).getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByRole("option", { name: "Unverified operation (Availability unknown)" }).getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByText(/Install the correction grid/)).toBeTruthy();
    expect(screen.getByText("Support grids: Correction grid (missing)")).toBeTruthy();
    await choose(user, screen.getByRole("combobox"), "Grid correction (Required grids unavailable)");
    expect(change).not.toHaveBeenCalled();
    await choose(user, screen.getByRole("combobox"), "Parameter transform");
    expect(change).toHaveBeenLastCalledWith("parameter");
    await choose(user, screen.getByRole("combobox"), "No transformation selected");
    expect(change).toHaveBeenLastCalledWith(null);
  });
  it("preserves a rejected controlled selection and reports an unavailable current operation", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    const { container, rerender } = render(<form><DatumTransformPicker {...datumProps} value={null} onValueChange={change} /></form>);
    await choose(user, screen.getByRole("combobox"), "Parameter transform");
    expect(screen.getByRole("combobox").textContent).toBe("No transformation selected");
    rerender(<form><DatumTransformPicker {...datumProps} value="grid" /></form>);
    expect(screen.getByText("Selected transformation unavailable: Grid correction")).toBeTruthy();
    expect(formValid(container)).toBe(false);
    rerender(<DatumTransformPicker {...datumProps} sourceReference={null} destinationReference={null} value="missing" />);
    expect(screen.getByText("Unknown source reference")).toBeTruthy();
    expect(screen.getByText("Unknown destination reference")).toBeTruthy();
    expect(screen.getByText("Unknown transformation: missing")).toBeTruthy();
  });
  it("resets uncontrolled selection in an external form and preserves read-only submission", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<><form id="operation" /><DatumTransformPicker {...datumProps} name="transform" form="operation" defaultValue="parameter" /></>);
    await choose(user, screen.getByRole("combobox"), "No transformation selected");
    await act(async () => container.querySelector("form")!.reset());
    expect(new FormData(container.querySelector("form")!).get("transform")).toBe("parameter");
    rerender(<form><DatumTransformPicker {...datumProps} name="transform" value="parameter" readOnly /></form>);
    expect(new FormData(container.querySelector("form")!).get("transform")).toBe("parameter");
    rerender(<form><DatumTransformPicker {...datumProps} name="transform" value="parameter" readOnly disabled /></form>);
    expect(Array.from(new FormData(container.querySelector("form")!).entries())).toEqual([]);
  });
  it("reports empty and malformed candidate lists", () => {
    const { rerender } = render(<DatumTransformPicker {...datumProps} transformations={[]} />);
    expect(screen.getByText("No transformations supplied")).toBeTruthy();
    rerender(<DatumTransformPicker {...datumProps} transformations={[transformations[1]!, transformations[1]!]} />);
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByText("Transformation identifiers must be unique and non-empty.")).toBeTruthy();
  });
});

describe("RasterBandMixer", () => {
  it("switches active channels without discarding their mappings or submitting hidden settings", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(<form><RasterBandMixer label="Raster display" name="raster" bands={bands} defaultValue={configuration} onValueChange={change} /></form>);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Rendering mode" }));
    await choose(user, screen.getByRole("combobox", { name: "Rendering mode" }), "Single band");
    expect(change).toHaveBeenLastCalledWith({ ...configuration, mode: "single" });
    const data = new FormData(container.querySelector("form")!);
    expect(data.get("raster.single.band")).toBe("b2");
    expect(data.get("raster.red.band")).toBeNull();
    await choose(user, screen.getByRole("combobox", { name: "Rendering mode" }), "Three channels");
    expect((screen.getByRole("spinbutton", { name: "Red channel minimum" }) as HTMLInputElement).value).toBe("0");
  });
  it("keeps zero, none and unknown missing-data definitions distinct", () => {
    render(<RasterBandMixer label="Raster display" bands={bands} value={configuration} />);
    expect(screen.getByText("Missing-data value: 0. Unit: counts")).toBeTruthy();
    expect(screen.getByText("Missing-data value: None defined. Unit: Not supplied")).toBeTruthy();
    expect(screen.getByText("Missing-data value: Unknown. Unit: Not supplied")).toBeTruthy();
  });
  it("validates supplied stretch bounds without inventing a range and lets keyboard edits correct them", async () => {
    const user = userEvent.setup();
    const { container } = render(<form><RasterBandMixer label="Raster display" bands={bands} defaultValue={{ ...configuration, mode: "single", single: { bandId: "b1", minimum: 10, maximum: 0 } }} /></form>);
    expect(screen.getByText("Minimum must be less than maximum")).toBeTruthy();
    expect(formValid(container)).toBe(false);
    const maximum = screen.getByRole("spinbutton", { name: "Single band maximum" });
    await user.click(maximum);
    await user.keyboard("{Control>}a{/Control}20");
    expect(formValid(container)).toBe(true);
    expect(screen.getByText("Supplied range: 10 to 20")).toBeTruthy();
    await choose(user, screen.getByRole("combobox", { name: "Range treatment" }), "No enhancement");
    expect(screen.queryByRole("spinbutton")).toBeNull();
  });
  it("leaves controlled state with the host on changes and reset", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(<form><RasterBandMixer label="Raster display" bands={bands} value={configuration} onValueChange={change} /></form>);
    await choose(user, screen.getByRole("combobox", { name: "Rendering mode" }), "Single band");
    expect(change).toHaveBeenCalledWith({ ...configuration, mode: "single" });
    expect(screen.getByRole("combobox", { name: "Rendering mode" }).textContent).toBe("Three channels");
    await act(async () => container.querySelector("form")!.reset());
    expect(screen.getByRole("combobox", { name: "Red channel source" })).toBeTruthy();
  });
  it("resets an uncontrolled external form and submits valid read-only configuration", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<><form id="raster" /><RasterBandMixer label="Raster display" bands={bands} form="raster" name="display" defaultValue={configuration} /></>);
    await choose(user, screen.getByRole("combobox", { name: "Range treatment" }), "Clip to range");
    await act(async () => container.querySelector("form")!.reset());
    expect(new FormData(container.querySelector("form")!).get("display.stretch")).toBe("min-max");
    rerender(<form><RasterBandMixer label="Raster display" bands={bands} name="display" value={configuration} readOnly /></form>);
    const data = new FormData(container.querySelector("form")!);
    expect(data.get("display.mode")).toBe("rgb");
    expect(data.get("display.red.band")).toBe("b1");
    expect(data.get("display.red.minimum")).toBe("0");
    expect(data.get("display.single.band")).toBeNull();
    rerender(<form><RasterBandMixer label="Raster display" bands={bands} name="display" value={configuration} readOnly disabled /></form>);
    expect(Array.from(new FormData(container.querySelector("form")!).entries())).toEqual([]);
  });
  it("reports unavailable bands and missing range bounds with native invalidity", () => {
    const { container } = render(<form><RasterBandMixer label="Raster display" bands={bands} value={{ ...configuration, mode: "single", single: { bandId: "missing", minimum: null, maximum: Infinity } }} /></form>);
    expect(screen.getByText("Source band unavailable: missing")).toBeTruthy();
    expect(screen.getByText("Supply both range bounds as finite numbers")).toBeTruthy();
    expect(formValid(container)).toBe(false);
  });
});

const specimens = [
  <CoordinateReferenceField key="coordinate" label="Point" axes={axes} references={references} defaultValue={coordinate} />,
  <DatumTransformPicker key="datum" {...datumProps} defaultValue="parameter" />,
  <RasterBandMixer key="raster" label="Raster display" bands={bands} defaultValue={configuration} />,
];
it.each(specimens.map((specimen, index) => [index, specimen] as const))("geospatial specimen %s has no axe violations", async (_, specimen) => {
  const { container } = render(specimen);
  expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
});
const refCases = [
  [CoordinateReferenceField, { label: "Point", axes, references }],
  [DatumTransformPicker, datumProps],
  [RasterBandMixer, { label: "Raster display", bands }],
] as const;
it.each(refCases)("forwards %s native fieldset attributes and ref", (Component, props) => {
  const ref = React.createRef<HTMLFieldSetElement>();
  const Leaf = Component as unknown as React.ComponentType<Record<string, unknown> & React.RefAttributes<HTMLFieldSetElement>>;
  render(<Leaf {...props} ref={ref} data-record="042" className="consumer" style={{ marginTop: 17 }} />);
  expect(ref.current?.tagName).toBe("FIELDSET");
  expect(ref.current?.dataset.record).toBe("042");
  expect(ref.current?.className).toContain("consumer");
  expect(ref.current?.style.marginTop).toBe("17px");
});
