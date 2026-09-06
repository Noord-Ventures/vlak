import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { ActivityRings } from "../src/components/activity-rings";

afterEach(cleanup);
const goal = { id: "walk", label: "Walking", current: 18, target: 30, unit: "minutes" };

describe("ActivityRings", () => {
  it("supports one ring with named native progress and a complete value", () => {
    const { container } = render(<ActivityRings label="Daily activity" goals={[goal]} />);
    const progress = screen.getByRole("progressbar", { name: "Walking, ring 1" }) as HTMLProgressElement;
    expect(progress.value).toBe(18);
    expect(progress.max).toBe(30);
    expect(progress.getAttribute("aria-valuetext")).toBe("18 of 30 minutes");
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelectorAll(".rs-activity-rings-arc")).toHaveLength(1);
  });

  it("keeps zero empty and retains the real amount beyond a goal", () => {
    const { container } = render(<ActivityRings label="Today" goals={[{ ...goal, current: 0 }, { ...goal, id: "extra", label: "Stretching", current: 42 }]} />);
    expect(container.querySelectorAll(".rs-activity-rings-arc")).toHaveLength(1);
    const extra = screen.getByRole("progressbar", { name: "Stretching, ring 2" }) as HTMLProgressElement;
    expect(extra.value).toBe(30);
    expect(extra.getAttribute("aria-valuetext")).toBe("42 of 30 minutes");
    expect(screen.getByText("Goal exceeded")).toBeTruthy();
  });

  it("distinguishes unrecorded amounts, unavailable data, and unset targets", () => {
    const { container } = render(<ActivityRings label="Today" goals={[
      { ...goal, current: null }, { ...goal, id: "bad", current: Number.NaN },
      { ...goal, id: "unset", target: null }, { ...goal, id: "negative", target: -1 },
    ]} />);
    expect(screen.queryAllByRole("progressbar")).toHaveLength(0);
    expect(container.querySelectorAll(".rs-activity-rings-arc")).toHaveLength(0);
    for (const label of ["No activity recorded", "Activity unavailable", "No goal set", "Goal unavailable"]) expect(screen.getByText(label)).toBeTruthy();
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it("updates supplied readings without changing the target or losing its description", () => {
    const { container, rerender } = render(<ActivityRings label="Today" goals={[goal]} description="Your own target" />);
    rerender(<ActivityRings label="Today" goals={[{ ...goal, current: 30 }]} description="Your own target" />);
    const progress = screen.getByRole("progressbar") as HTMLProgressElement;
    expect(progress.value).toBe(30);
    expect(progress.max).toBe(30);
    expect(document.getElementById(progress.getAttribute("aria-describedby")!)?.textContent).toBe("Your own target");
    expect(container.querySelector(".rs-activity-rings-arc")?.getAttribute("stroke-dasharray")).toBe("100 100");
    expect(screen.getByText("Goal reached")).toBeTruthy();
  });

  it("keeps every text record when there are too many rings to draw", () => {
    const { container, rerender } = render(<ActivityRings label="Week" goals={Array.from({ length: 7 }, (_, index) => ({ ...goal, id: String(index), label: `Goal ${index + 1}` }))} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
    expect(screen.getAllByRole("progressbar")).toHaveLength(7);
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.getByText(/supports up to six goals/)).toBeTruthy();
    rerender(<ActivityRings label="Week" goals={[]} />);
    expect(screen.getByText("No activity goals supplied")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("forwards the figure ref, native attributes, and consumer overrides", () => {
    const ref = React.createRef<HTMLElement>();
    render(<ActivityRings ref={ref} label="Today" goals={[goal]} data-testid="rings" dir="rtl" className="custom" style={{ marginTop: 12 }} />);
    expect(ref.current).toBe(screen.getByTestId("rings"));
    expect(ref.current?.tagName).toBe("FIGURE");
    expect(ref.current?.dir).toBe("rtl");
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.style.marginTop).toBe("12px");
  });

  it("passes accessibility checks for mixed complete and unrecorded goals", async () => {
    const { container } = render(<ActivityRings label="Today" goals={[goal, { ...goal, id: "move", label: "Movement", current: null }]} />);
    expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });
});
