import * as React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { HealthMetric } from "../src/components/health-metric";
import { ReferenceRange } from "../src/components/reference-range";
import { LabResults } from "../src/components/lab-results";
import { SymptomDiary, type SymptomEntry } from "../src/components/symptom-diary";

afterEach(cleanup);

describe("health observations", () => {
  it("preserves zero, time and source, while explicitly naming missing readings", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(<HealthMetric ref={ref} data-testid="metric" className="consumer" style={{ marginTop: 17 }} label="Recorded events" value={0} unit="events" dateTime="2026-09-06T07:20:00+02:00" timeLabel="07:20 CEST" source="Diary" />);
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("events")).toBeTruthy();
    expect(screen.getByText("Diary")).toBeTruthy();
    expect(ref.current).toBe(screen.getByTestId("metric"));
    expect(ref.current?.className).toContain("consumer");
    expect(ref.current?.style.marginTop).toBe("17px");
    expect(screen.getByText("07:20 CEST").getAttribute("datetime")).toBe("2026-09-06T07:20:00+02:00");
    for (const value of [undefined, null, Number.NaN, Number.POSITIVE_INFINITY, " "]) {
      rerender(<HealthMetric label="Recorded events" value={value} />);
      expect(screen.getByText("Unavailable")).toBeTruthy();
      expect(document.querySelector(".rs-health-metric-value")).toBeNull();
    }
  });

  it("hides readings while pending or unavailable, and labels retained stale readings", () => {
    const { rerender } = render(<HealthMetric label="Reading" value={64} status="pending" />);
    expect(screen.getByText("Pending")).toBeTruthy();
    expect(screen.queryByText("64")).toBeNull();
    rerender(<HealthMetric label="Reading" value={64} status="unavailable" />);
    expect(screen.getByText("Unavailable")).toBeTruthy();
    expect(screen.queryByText("64")).toBeNull();
    rerender(<HealthMetric label="Reading" value={64} status="stale" />);
    expect(screen.getByText("64")).toBeTruthy();
    expect(screen.getByText("Last recorded, stale")).toBeTruthy();
    expect(document.querySelector("[data-status=stale]")).toBeTruthy();
  });

  it("positions zero and provides a text equivalent without a clinical status", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container, rerender } = render(<ReferenceRange ref={ref} label="Example" value={0} minimum={0} maximum={10} unit="units" data-testid="range" />);
    expect(ref.current).toBe(screen.getByTestId("range"));
    expect(screen.getByText("0 units")).toBeTruthy();
    expect(screen.getByText("0–10 units")).toBeTruthy();
    expect((container.querySelector(".rs-reference-range-marker") as HTMLElement).style.insetInlineStart).toBe("20%");
    expect(container.querySelector(".rs-reference-range-track")?.getAttribute("aria-hidden")).toBe("true");
    rerender(<ReferenceRange label="Example" value={1000} minimum={0} maximum={10} />);
    expect(screen.getByText("Above displayed interval")).toBeTruthy();
    expect((container.querySelector(".rs-reference-range-marker") as HTMLElement).style.insetInlineStart).toBe("100%");
    expect(container.textContent).not.toMatch(/normal|abnormal|critical/i);
  });

  it.each([
    [undefined, undefined, "Unavailable"],
    [0, undefined, "At least 0 units"],
    [undefined, 0, "Up to 0 units"],
    [10, 0, "Unavailable"],
    [0, 0, "Unavailable"],
    [Number.NaN, 10, "Unavailable"],
    [0, Number.POSITIVE_INFINITY, "Unavailable"],
  ])("keeps unusable or one-sided geometry stable for %s and %s", (minimum, maximum, text) => {
    const { container } = render(<ReferenceRange label="Example" value={0} minimum={minimum as number | undefined} maximum={maximum as number | undefined} unit="units" />);
    expect(screen.getByText(text as string)).toBeTruthy();
    expect(container.querySelector(".rs-reference-range-marker")).toBeNull();
    expect(container.querySelector(".rs-reference-range-track")).toBeNull();
  });

  it("avoids overflow with extreme finite bounds and does not position missing results", () => {
    const { container, rerender } = render(<ReferenceRange label="Extreme interval" value={0} minimum={-Number.MAX_VALUE} maximum={Number.MAX_VALUE} />);
    expect((container.querySelector(".rs-reference-range-marker") as HTMLElement).style.insetInlineStart).toBe("50%");
    rerender(<ReferenceRange label="Small interval" value={Number.MAX_VALUE} minimum={0} maximum={Number.MIN_VALUE} />);
    expect((container.querySelector(".rs-reference-range-marker") as HTMLElement).style.insetInlineStart).toBe("100%");
    rerender(<ReferenceRange label="Missing result" value={Number.NaN} minimum={0} maximum={10} />);
    expect(screen.getByText("No result")).toBeTruthy();
    expect(container.querySelector(".rs-reference-range-marker")).toBeNull();
  });

  it("anchors range geometry to the reading direction while preserving numeric text", () => {
    const { container, rerender } = render(<ReferenceRange dir="rtl" label="Example" value={2} minimum={0} maximum={10} />);
    const root = container.firstElementChild as HTMLElement;
    const marker = container.querySelector(".rs-reference-range-marker") as HTMLElement;
    expect(root.dir).toBe("rtl");
    expect(marker.style.insetInlineStart).toBe("32%");
    expect(marker.style.left).toBe("");
    expect(marker.style.right).toBe("");
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("0–10")).toBeTruthy();
    rerender(<ReferenceRange dir="ltr" label="Example" value={2} minimum={0} maximum={10} />);
    expect(root.dir).toBe("ltr");
    expect(marker.style.insetInlineStart).toBe("32%");
  });

  it("retains report states, qualitative results and zero without exposing pending data", () => {
    const ref = React.createRef<HTMLUListElement>();
    render(<LabResults ref={ref} label="Latest report" data-testid="report" results={[
      { id: "zero", name: "Events", value: 0, unit: "count" },
      { id: "qualitative", name: "Qualitative analysis", value: "Not detected" },
      { id: "pending", name: "Additional analysis", value: 999, status: "pending" },
      { id: "missing", name: "Missing analysis", value: Number.NaN },
      { id: "amended", name: "Revised analysis", value: 24, minimum: 20, maximum: 30, status: "amended", statusLabel: "Reviewed", note: "Replaces the previous result" },
      { id: "amended-missing", name: "Withdrawn analysis", status: "amended" },
    ]} />);
    expect(ref.current).toBe(screen.getByRole("list", { name: "Latest report" }));
    expect(ref.current?.getAttribute("data-testid")).toBe("report");
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("Not detected")).toBeTruthy();
    expect(screen.queryByText("999")).toBeNull();
    expect(screen.getByText("Pending")).toBeTruthy();
    expect(screen.getByText("Unavailable")).toBeTruthy();
    expect(screen.getByText("Amended · Reviewed")).toBeTruthy();
    expect(screen.getByText("Replaces the previous result")).toBeTruthy();
    expect(screen.getByText("Result unavailable")).toBeTruthy();
    expect(screen.getByText("20–30")).toBeTruthy();
  });

  it("sorts a copy of diary entries, preserves equal times, and puts undated entries last", () => {
    const entries: readonly SymptomEntry[] = Object.freeze([
      { id: "older", symptom: "Older", dateTime: "2026-09-05T09:00:00+02:00" },
      { id: "unknown", symptom: "Unknown time", dateTime: "invalid" },
      { id: "newer", symptom: "Newer", dateTime: "2026-09-06T09:00:00+02:00", intensity: "Self-reported 0 of 10" },
      { id: "same", symptom: "Same time", dateTime: "2026-09-06T09:00:00+02:00" },
    ]);
    const ref = React.createRef<HTMLOListElement>();
    const { rerender } = render(<SymptomDiary ref={ref} data-testid="diary" aria-label="Entries" entries={entries} />);
    expect(ref.current).toBe(screen.getByRole("list", { name: "Entries" }));
    expect(ref.current?.tagName).toBe("OL");
    const names = () => Array.from(document.querySelectorAll(".rs-symptom-diary-symptom"), node => node.textContent);
    expect(names()).toEqual(["Newer", "Same time", "Older", "Unknown time"]);
    expect(entries.map(entry => entry.id)).toEqual(["older", "unknown", "newer", "same"]);
    expect(screen.getByText("Self-reported 0 of 10")).toBeTruthy();
    expect(screen.getByText("Time not recorded").hasAttribute("datetime")).toBe(false);
    rerender(<SymptomDiary entries={entries} order="oldest" />);
    expect(names()).toEqual(["Older", "Newer", "Same time", "Unknown time"]);
  });

  it("exposes native disclosures in the tab order and activates supplied actions with the keyboard", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<SymptomDiary entries={[{ id: "entry", symptom: "Headache", dateTime: "2026-09-06T09:00:00+02:00", timeLabel: "Today, 09:00 CEST", details: "Recorded after breakfast", actions: <button type="button" onClick={onEdit}>Edit entry</button> }]} />);
    const summary = screen.getByLabelText("Details for Headache, Today, 09:00 CEST");
    await user.tab();
    expect(document.activeElement).toBe(summary);
    expect(summary.tagName).toBe("SUMMARY");
    const details = summary.closest("details")!;
    expect(details.open).toBe(false);
    // jsdom implements native click toggling, but not the browser's summary key activation.
    await user.click(summary);
    expect(details.open).toBe(true);
    expect(within(details).getByText("Recorded after breakfast")).toBeTruthy();
    await user.click(summary);
    expect(details.open).toBe(false);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit entry" }));
    await user.keyboard("{Enter}");
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it("names empty collections without fabricating records", () => {
    render(<><LabResults label="Report" results={[]} /><SymptomDiary entries={[]} /></>);
    expect(screen.getByText("No results available")).toBeTruthy();
    expect(screen.getByText("No symptoms recorded")).toBeTruthy();
  });

  const specimens = [
    <HealthMetric key="metric" label="Resting heart rate" value={64} unit="bpm" status="stale" source="Wrist sensor" />,
    <ReferenceRange key="range" label="Reported measurement" value={24} minimum={20} maximum={30} unit="units" />,
    <LabResults key="labs" label="Report" results={[{ id: "value", name: "Reported measurement", value: 24, minimum: 20, maximum: 30 }, { id: "pending", name: "Additional analysis", status: "pending" }]} />,
    <SymptomDiary key="diary" aria-label="Diary" entries={[{ id: "entry", symptom: "Headache", dateTime: "2026-09-06T09:00:00+02:00", intensity: "Mild", details: "Recorded after breakfast", actions: <button type="button">Edit entry</button> }]} />,
  ];
  it.each(specimens.map((specimen, index) => [index, specimen] as const))("has no axe violations in observation specimen %s", async (_, specimen) => {
    const { container } = render(specimen);
    expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });
});
