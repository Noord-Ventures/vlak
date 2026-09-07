import * as React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { ActivityRings } from "../src/components/activity-rings";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
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
    expect(container.querySelector(".rs-activity-rings-arc")?.getAttribute("stroke-dasharray")).toBe("100 100");
    expect(container.querySelector(".rs-activity-rings-arc")?.getAttribute("stroke-dashoffset")).toBe("40");
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
    expect(container.querySelector(".rs-activity-rings-arc")?.getAttribute("stroke-dashoffset")).toBe("0");
    expect(screen.getByText("Goal reached")).toBeTruthy();
  });

  it("keeps every text record when there are too many rings to draw", () => {
    const { container, rerender } = render(<ActivityRings label="Week" goals={Array.from({ length: 7 }, (_, index) => ({ ...goal, id: String(index), label: `Goal ${index + 1}` }))} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
    expect(screen.getAllByRole("progressbar")).toHaveLength(7);
    expect(container.querySelector(".rs-activity-rings-graphic")).toBeNull();
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


/** Drive the browser signals the component observes without pretending to run CSS animation. */
function browserSignals(initialReducedMotion = false) {
  const media = Object.assign(new EventTarget(), { matches: initialReducedMotion, media: "(prefers-reduced-motion: reduce)" });
  vi.stubGlobal("matchMedia", vi.fn(() => media));
  const mediaAdded = vi.spyOn(media, "addEventListener");
  const mediaRemoved = vi.spyOn(media, "removeEventListener");
  const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  const observers: Array<{ show: (shown: boolean) => void; disconnect: ReturnType<typeof vi.fn> }> = [];
  vi.stubGlobal("IntersectionObserver", class {
    disconnect = vi.fn();
    constructor(callback: IntersectionObserverCallback) {
      observers.push({ show: shown => callback([{ isIntersecting: shown } as IntersectionObserverEntry], this as unknown as IntersectionObserver), disconnect: this.disconnect });
    }
    observe() {}
    unobserve() {}
    takeRecords() { return []; }
  });
  return {
    mediaAdded,
    mediaRemoved,
    observers,
    show: (shown: boolean) => { act(() => { for (const observer of observers) observer.show(shown); }); },
    reduce: (reduced: boolean) => { act(() => { media.matches = reduced; media.dispatchEvent(new Event("change")); }); },
    visible: (shown: boolean) => { act(() => { visibility.mockReturnValue(shown ? "visible" : "hidden"); document.dispatchEvent(new Event("visibilitychange")); }); },
  };
}
const encouragements = ["Make room for yourself.", "Take the time you need.", "Small moments can matter."];
const advance = (milliseconds: number) => { act(() => { vi.advanceTimersByTime(milliseconds); }); };
const currentEncouragement = () => document.querySelector(".rs-activity-rings-encouragement-text")?.textContent;

describe("ActivityRings encouragement", () => {
  it("uses a deterministic first line for server and client rendering", () => {
    vi.useFakeTimers();
    browserSignals();
    const random = vi.spyOn(Math, "random").mockReturnValue(0.75);
    const markup = renderToString(<ActivityRings label="Today" goals={[goal]} />);
    expect(markup).toContain("Small steps still count.");
    render(<ActivityRings label="Today" goals={[goal]} />);
    expect(screen.getByText("Small steps still count.").getAttribute("aria-live")).toBe("off");
    expect(random).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("waits ten visible seconds and randomly picks a different supplied line at each interval", () => {
    vi.useFakeTimers();
    const signals = browserSignals();
    vi.spyOn(Math, "random").mockReturnValueOnce(0.99).mockReturnValue(0);
    render(<ActivityRings label="Today" goals={[goal]} encouragement={encouragements} />);
    advance(30000);
    expect(currentEncouragement()).toBe(encouragements[0]);
    signals.show(true);
    advance(9999);
    expect(currentEncouragement()).toBe(encouragements[0]);
    advance(1);
    expect(currentEncouragement()).toBe(encouragements[2]);
    for (let index = 0; index < 4; index++) {
      const previous = currentEncouragement();
      advance(10000);
      expect(encouragements).toContain(currentEncouragement());
      expect(currentEncouragement()).not.toBe(previous);
    }
  });

  it("keeps the rotation deadline when frequent readings and equivalent message arrays update", () => {
    vi.useFakeTimers();
    const signals = browserSignals();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { rerender } = render(<ActivityRings label="Today" goals={[goal]} encouragement={[...encouragements]} />);
    signals.show(true);
    advance(5000);
    rerender(<ActivityRings label="Today" goals={[{ ...goal, current: 19 }]} encouragement={[...encouragements]} />);
    advance(4999);
    expect(currentEncouragement()).toBe(encouragements[0]);
    expect((screen.getByRole("progressbar") as HTMLProgressElement).value).toBe(19);
    advance(1);
    expect(currentEncouragement()).toBe(encouragements[1]);
  });

  it("pauses and resumes from the keyboard without submitting the surrounding form", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const user = userEvent.setup();
    const signals = browserSignals();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const submit = vi.fn(event => event.preventDefault());
    render(<form onSubmit={submit}><ActivityRings label="Today" goals={[goal]} encouragement={encouragements} /></form>);
    signals.show(true);
    advance(5000);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Pause encouragement" }));
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Resume encouragement" })).toBe(document.activeElement);
    expect(vi.getTimerCount()).toBe(0);
    advance(30000);
    expect(currentEncouragement()).toBe(encouragements[0]);
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Pause encouragement" })).toBe(document.activeElement);
    advance(9999);
    expect(currentEncouragement()).toBe(encouragements[0]);
    advance(1);
    expect(currentEncouragement()).toBe(encouragements[1]);
    expect(submit).not.toHaveBeenCalled();
  });

  it("suspends timers offscreen and while the document is hidden, restarting a full interval on return", () => {
    vi.useFakeTimers();
    const signals = browserSignals();
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<ActivityRings label="Today" goals={[goal]} encouragement={encouragements} />);
    signals.show(true);
    advance(8000);
    signals.show(false);
    expect(vi.getTimerCount()).toBe(0);
    advance(30000);
    expect(currentEncouragement()).toBe(encouragements[0]);
    signals.show(true);
    advance(9999);
    expect(currentEncouragement()).toBe(encouragements[0]);
    advance(1);
    expect(currentEncouragement()).toBe(encouragements[1]);
    signals.visible(false);
    expect(vi.getTimerCount()).toBe(0);
    advance(30000);
    expect(currentEncouragement()).toBe(encouragements[1]);
    signals.visible(true);
    advance(10000);
    expect(currentEncouragement()).toBe(encouragements[0]);
  });

  it("follows runtime reduced-motion changes without losing a user's pause preference", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const user = userEvent.setup();
    const signals = browserSignals(true);
    render(<ActivityRings label="Today" goals={[goal]} encouragement={encouragements} />);
    signals.show(true);
    expect(screen.queryByRole("button")).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    advance(30000);
    expect(currentEncouragement()).toBe(encouragements[0]);
    signals.reduce(false);
    expect(vi.getTimerCount()).toBe(1);
    await user.click(screen.getByRole("button", { name: "Pause encouragement" }));
    signals.reduce(true);
    expect(screen.queryByRole("button")).toBeNull();
    signals.reduce(false);
    expect(screen.getByRole("button", { name: "Resume encouragement" })).toBeTruthy();
    expect(vi.getTimerCount()).toBe(0);
    await user.click(screen.getByRole("button", { name: "Resume encouragement" }));
    signals.reduce(true);
    expect(vi.getTimerCount()).toBe(0);
    advance(30000);
    expect(currentEncouragement()).toBe(encouragements[0]);
  });

  it("trims and deduplicates custom lines without introducing immediate repeats", () => {
    vi.useFakeTimers();
    const signals = browserSignals();
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<ActivityRings label="Today" goals={[goal]} encouragement={[" One step. ", "One step.", "", "  ", "Your own pace."]} />);
    signals.show(true);
    expect(currentEncouragement()).toBe("One step.");
    advance(10000);
    expect(currentEncouragement()).toBe("Your own pace.");
    advance(10000);
    expect(currentEncouragement()).toBe("One step.");
  });

  it("has no rotation or pause control with a single line, false, an empty list or no goals", () => {
    vi.useFakeTimers();
    const signals = browserSignals();
    const { rerender } = render(<ActivityRings label="Today" goals={[goal]} encouragement={["One step.", " One step. "]} />);
    signals.show(true);
    expect(currentEncouragement()).toBe("One step.");
    expect(screen.queryByRole("button")).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    advance(20000);
    expect(currentEncouragement()).toBe("One step.");
    rerender(<ActivityRings label="Today" goals={[goal]} encouragement={false} />);
    expect(currentEncouragement()).toBeUndefined();
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<ActivityRings label="Today" goals={[goal]} encouragement={[]} />);
    expect(currentEncouragement()).toBeUndefined();
    rerender(<ActivityRings label="Today" goals={[]} encouragement={encouragements} />);
    expect(currentEncouragement()).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("replaces removed messages promptly and cleans up running rotation when disabled or unmounted", () => {
    vi.useFakeTimers();
    const signals = browserSignals();
    const removed = vi.spyOn(document, "removeEventListener");
    const { rerender, unmount } = render(<ActivityRings label="Today" goals={[goal]} encouragement={encouragements} />);
    signals.show(true);
    expect(vi.getTimerCount()).toBe(1);
    rerender(<ActivityRings label="Today" goals={[goal]} encouragement={["A fresh line.", "Another fresh line."]} />);
    expect(currentEncouragement()).toBe("A fresh line.");
    expect(vi.getTimerCount()).toBe(1);
    rerender(<ActivityRings label="Today" goals={[goal]} encouragement={false} />);
    expect(currentEncouragement()).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
    rerender(<ActivityRings label="Today" goals={[goal]} encouragement={encouragements} />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(signals.observers[0]!.disconnect).toHaveBeenCalledOnce();
    expect(signals.mediaRemoved).toHaveBeenCalledWith("change", signals.mediaAdded.mock.calls[0]![1]);
    expect(removed).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
  });

  it("keeps reported and drawn target values immediate when entrance animation is disabled", () => {
    const { container } = render(<ActivityRings label="Today" goals={[goal]} animate={false} encouragement={false} />);
    expect((screen.getByRole("progressbar") as HTMLProgressElement).value).toBe(18);
    const arc = container.querySelector(".rs-activity-rings-arc")!;
    expect(arc.getAttribute("stroke-dashoffset")).toBe("40");
    expect(arc.classList.contains("rs-activity-rings-motion")).toBe(false);
    expect(arc.classList.contains("rs-activity-rings-waiting")).toBe(false);
  });
});
