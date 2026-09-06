import * as React from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { CheckIn } from "../src/components/check-in";
import { HabitTracker, type HabitDay } from "../src/components/habit-tracker";
import { SleepTimeline, type SleepInterval } from "../src/components/sleep-timeline";
import { ActivityGoal } from "../src/components/activity-goal";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const options = [{ value: "low", label: "Low" }, { value: "steady", label: "Steady" }, { value: "high", label: "High" }, { value: "unavailable", label: "Unavailable", disabled: true }];
const days: HabitDay[] = [
  { date: "2026-09-07", label: "Mon 7 Sep", status: "complete" },
  { date: "2026-09-08", label: "Tue 8 Sep", status: "missed" },
  { date: "2026-09-09", label: "Wed 9 Sep", status: "skipped" },
  { date: "2026-09-10", label: "Thu 10 Sep", status: "unrecorded" },
];
const intervals: SleepInterval[] = [
  { id: "a", start: 0, end: 180, startLabel: "22:00", endLabel: "01:00", state: "asleep" },
  { id: "b", start: 180, end: 195, startLabel: "01:00", endLabel: "01:15", state: "awake" },
  { id: "c", start: 210, end: 240, startLabel: "01:30", endLabel: "02:00", state: "unknown" },
  { id: "d", start: 240, end: 480, startLabel: "02:00", endLabel: "06:00", state: "asleep" },
];
const sleepWindow = { label: "Last night", start: 0, end: 480, startLabel: "22:00", endLabel: "06:00" };

describe("CheckIn", () => {
  it("uses named native radios, keyboard selection, null clearing, required validity and form submission", async () => {
    vi.stubGlobal("CSS", { escape: (text: string) => text.replace(/["\\]/g, "\\$&") });
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = React.createRef<HTMLFieldSetElement>();
    const { container } = render(<form><CheckIn ref={ref} label="Energy" options={options} name="energy" required defaultValue="low" onValueChange={change} description="Right now" /></form>);
    const form = container.querySelector("form")!;
    expect(ref.current).toBe(screen.getByRole("group", { name: "Energy" }));
    screen.getByRole("radio", { name: "Low" }).focus();
    await user.keyboard("{ArrowRight}");
    expect((screen.getByRole("radio", { name: "Steady" }) as HTMLInputElement).checked).toBe(true);
    expect(new FormData(form).get("energy")).toBe("steady");
    expect(change).toHaveBeenLastCalledWith("steady");
    await user.click(screen.getByRole("button", { name: "Clear answer" }));
    expect(change).toHaveBeenLastCalledWith(null);
    expect(new FormData(form).has("energy")).toBe(false);
    expect(form.checkValidity()).toBe(false);
    expect((screen.getByRole("radio", { name: "Unavailable" }) as HTMLInputElement).disabled).toBe(true);
  });

  it("resets uncontrolled answers to their default and supports an external form", async () => {
    const user = userEvent.setup();
    const { container } = render(<><form id="check-in-form" /><CheckIn label="Energy" options={options} name="energy" form="check-in-form" defaultValue="steady" /></>);
    const form = container.querySelector("form")!;
    await user.click(screen.getByRole("radio", { name: "High" }));
    expect(new FormData(form).get("energy")).toBe("high");
    act(() => form.reset());
    await waitFor(() => expect(new FormData(form).get("energy")).toBe("steady"));
  });

  it("keeps controlled values through clicks and native resets, including controlled null", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container, rerender } = render(<form><CheckIn label="Energy" options={options} name="energy" value="steady" onValueChange={change} /></form>);
    await user.click(screen.getByRole("radio", { name: "High" }));
    expect(change).toHaveBeenLastCalledWith("high");
    expect(new FormData(container.querySelector("form")!).get("energy")).toBe("steady");
    act(() => container.querySelector("form")!.reset());
    await waitFor(() => expect(new FormData(container.querySelector("form")!).get("energy")).toBe("steady"));
    rerender(<form><CheckIn label="Energy" options={options} name="energy" value={null} onValueChange={change} /></form>);
    expect(new FormData(container.querySelector("form")!).has("energy")).toBe(false);
  });

  it("preserves read-only values, prevents keyboard changes, and excludes disabled values from forms", async () => {
    vi.stubGlobal("CSS", { escape: (text: string) => text });
    const user = userEvent.setup();
    const change = vi.fn();
    const { container, rerender } = render(<form><CheckIn label="Energy" options={options} name="energy" defaultValue="low" onValueChange={change} readOnly /></form>);
    await user.click(screen.getByRole("radio", { name: "High" }));
    screen.getByRole("radio", { name: "Low" }).focus();
    await user.keyboard("{ArrowRight}{Space}");
    expect(change).not.toHaveBeenCalled();
    expect(new FormData(container.querySelector("form")!).get("energy")).toBe("low");
    expect(screen.getByText("Read only")).toBeTruthy();
    rerender(<form><CheckIn label="Energy" options={options} name="energy" defaultValue="low" disabled /></form>);
    expect(new FormData(container.querySelector("form")!).has("energy")).toBe(false);
  });

  it("respects canceled resets and displays an empty answer set", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<form onReset={(event) => event.preventDefault()}><CheckIn label="Energy" options={options} defaultValue="low" name="energy" /></form>);
    await user.click(screen.getByRole("radio", { name: "High" }));
    act(() => container.querySelector("form")!.reset());
    await act(async () => { await Promise.resolve(); });
    expect(new FormData(container.querySelector("form")!).get("energy")).toBe("high");
    rerender(<CheckIn label="Energy" options={[]} />);
    expect(screen.getByText("No answers available")).toBeTruthy();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });
});

describe("HabitTracker", () => {
  it("keeps all supplied statuses distinct and requests controlled changes from keyboard", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = React.createRef<HTMLDivElement>();
    render(<HabitTracker ref={ref} data-record="week" label="Evening walk" days={days} onDayChange={change} />);
    expect(ref.current?.dataset.record).toBe("week");
    for (const status of ["Complete", "Missed", "Skipped", "Unrecorded"]) expect(screen.getByText(status)).toBeTruthy();
    const complete = screen.getByRole("button", { name: "Mon 7 Sep: completion" });
    complete.focus();
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith("2026-09-07", "unrecorded");
    expect(complete.getAttribute("aria-pressed")).toBe("true");
    await user.tab();
    await user.keyboard(" ");
    expect(change).toHaveBeenLastCalledWith("2026-09-08", "complete");
    expect(screen.getByText("Missed")).toBeTruthy();
  });

  it("supports caller updates, read-only records, per-day disabling, and empty data", async () => {
    const user = userEvent.setup();
    function Example() {
      const [records, setRecords] = React.useState(days);
      return <HabitTracker label="Evening walk" days={records} onDayChange={(date, status) => setRecords((current) => current.map((day) => day.date === date ? { ...day, status } : day))} />;
    }
    const { rerender } = render(<Example />);
    const button = screen.getByRole("button", { name: "Tue 8 Sep: completion" });
    await user.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    const change = vi.fn();
    rerender(<HabitTracker label="Evening walk" days={days.map((day) => ({ ...day, disabled: true }))} onDayChange={change} />);
    await user.click(screen.getByRole("button", { name: "Mon 7 Sep: completion" }));
    expect(change).not.toHaveBeenCalled();
    rerender(<HabitTracker label="Evening walk" days={days} onDayChange={change} readOnly />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByText("Skipped")).toBeTruthy();
    rerender(<HabitTracker label="Evening walk" days={[]} />);
    expect(screen.getByText("No days recorded")).toBeTruthy();
  });
});

describe("SleepTimeline", () => {
  it("keeps subpixel intervals proportional without horizontal borders or padding imposing a minimum width", () => {
    const shortIntervals: SleepInterval[] = Array.from({ length: 480 }, (_, minute) => ({ id: `minute-${minute}`, start: minute, end: minute + 1, startLabel: `Minute ${minute}`, endLabel: `Minute ${minute + 1}`, state: minute % 2 === 0 ? "asleep" : "awake" }));
    const { container } = render(<SleepTimeline {...sleepWindow} intervals={shortIntervals} style={{ width: 300 }} />);
    const segments = Array.from(container.querySelectorAll<HTMLElement>(".rs-sleep-timeline-segment"));
    expect(segments).toHaveLength(480);
    expect(segments.reduce((total, segment) => total + Number.parseFloat(segment.style.width), 0)).toBeCloseTo(100, 8);
    for (const segment of [segments[0]!, segments[239]!, segments[479]!]) {
      const computed = getComputedStyle(segment);
      expect(Number.parseFloat(segment.style.width) * 3).toBeCloseTo(0.625, 8);
      for (const property of ["borderLeftWidth", "borderRightWidth", "borderInlineStartWidth", "borderInlineEndWidth", "paddingLeft", "paddingRight", "paddingInlineStart", "paddingInlineEnd"] as const) expect(["", "0", "0px"]).toContain(computed[property]);
      expect(["0", "0px"]).toContain(computed.minWidth);
    }
  });

  it("exposes every supplied interval and gap as text without inferring stage or score", () => {
    const ref = React.createRef<HTMLElement>();
    const { container } = render(<SleepTimeline ref={ref} {...sleepWindow} intervals={intervals} data-source="record" />);
    expect(ref.current?.tagName).toBe("FIGURE");
    expect(ref.current?.dataset.source).toBe("record");
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByText("01:15 to 01:30")).toBeTruthy();
    expect(screen.getByText("Unrecorded")).toBeTruthy();
    expect(screen.getByText("Unknown")).toBeTruthy();
    expect(container.querySelector(".rs-sleep-timeline-chart")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelectorAll(".rs-sleep-timeline-segment")).toHaveLength(5);
  });

  it("does not clip or merge overlaps and invalid records into a plausible chart", () => {
    const { container, rerender } = render(<SleepTimeline {...sleepWindow} intervals={[intervals[0]!, { ...intervals[1]!, start: 170 }]} />);
    expect(screen.getByText("Timeline unavailable: intervals overlap.")).toBeTruthy();
    expect(screen.getByText("01:00 to 01:15")).toBeTruthy();
    expect(container.querySelector(".rs-sleep-timeline-chart")).toBeNull();
    for (const interval of [{ ...intervals[0]!, end: 600 }, { ...intervals[0]!, end: 0 }, { ...intervals[0]!, start: Number.NaN }]) {
      rerender(<SleepTimeline {...sleepWindow} intervals={[interval]} />);
      expect(screen.getByText("Timeline unavailable: an interval is invalid or outside the time window.")).toBeTruthy();
      expect(container.querySelector(".rs-sleep-timeline-chart")).toBeNull();
      expect(container.innerHTML).not.toContain("NaN");
    }
  });

  it("handles invalid and empty windows and preserves input data order outside rendering", () => {
    const { container, rerender } = render(<SleepTimeline {...sleepWindow} end={0} intervals={[]} />);
    expect(screen.getByText("Timeline unavailable: the time window is invalid.")).toBeTruthy();
    expect(container.querySelector(".rs-sleep-timeline-chart")).toBeNull();
    rerender(<SleepTimeline {...sleepWindow} intervals={[]} />);
    expect(screen.getByText("No sleep intervals recorded")).toBeTruthy();
    expect(screen.getByText("Unrecorded")).toBeTruthy();
    const unordered = [intervals[1]!, intervals[0]!];
    rerender(<SleepTimeline {...sleepWindow} intervals={unordered} />);
    expect(unordered[0]!.id).toBe("b");
    expect(screen.getAllByRole("listitem")[0]!.textContent).toContain("22:00 to 01:00");
  });
});

describe("ActivityGoal", () => {
  it("uses native named progress and preserves the actual amount above the target", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(<ActivityGoal ref={ref} label="Walking" description="Your goal" current={35} target={30} unit="min" data-record="today" />);
    const progress = screen.getByRole("progressbar", { name: "Walking" }) as HTMLProgressElement;
    expect(progress.tagName).toBe("PROGRESS");
    expect(progress.max).toBe(30);
    expect(progress.value).toBe(30);
    expect(progress.getAttribute("aria-valuetext")).toBe("35 of 30 min");
    expect(screen.getByText("Goal exceeded")).toBeTruthy();
    expect(ref.current?.dataset.record).toBe("today");
    rerender(<ActivityGoal label="Walking" current={30} target={30} unit="min" />);
    expect(screen.getByText("Goal reached")).toBeTruthy();
    rerender(<ActivityGoal label="Walking" current={0} target={30} unit="min" />);
    expect((screen.getByRole("progressbar") as HTMLProgressElement).value).toBe(0);
    expect(screen.queryByText("No activity recorded")).toBeNull();
  });

  it("distinguishes missing values and invalid data without NaN, infinity or indeterminate progress", () => {
    const { container, rerender } = render(<ActivityGoal label="Walking" current={null} target={null} unit="min" />);
    expect(screen.getByText("No activity recorded")).toBeTruthy();
    expect(screen.getByText("No goal set")).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
    for (const current of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      rerender(<ActivityGoal label="Walking" current={current} target={30} unit="min" />);
      expect(screen.getByText("Activity unavailable")).toBeTruthy();
      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    }
    for (const target of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      rerender(<ActivityGoal label="Walking" current={24} target={target} unit="min" />);
      expect(screen.getByText("Goal unavailable")).toBeTruthy();
      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    }
  });
});

describe("wellness accessibility", () => {
  const examples = [
    <CheckIn key="check-in" label="Energy" description="Right now" options={options} />,
    <CheckIn key="read-only check-in" label="Energy" description="Right now" options={options} defaultValue="steady" readOnly />,
    <HabitTracker key="habit" label="Evening walk" description="This week" days={days} onDayChange={() => {}} />,
    <SleepTimeline key="sleep" {...sleepWindow} intervals={intervals} />,
    <ActivityGoal key="activity" label="Walking" description="Your personal goal" current={24} target={30} unit="min" />,
    <ActivityGoal key="missing activity" label="Walking" current={null} target={null} unit="min" />,
  ];
  for (const example of examples) it(`${example.key} exposes named controls and text equivalents`, async () => {
    const { container } = render(<main>{example}</main>);
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});
