import * as React from "react";
import { renderToString } from "react-dom/server";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Persona, type PersonaVisualContext } from "../src/components/persona";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function motionEnvironment() {
  const queries = new Map<string, MediaQueryList & { set: (matches: boolean) => void }>();
  vi.stubGlobal("matchMedia", (query: string) => {
    if (!queries.has(query)) {
      const events = new EventTarget();
      let matches = false;
      queries.set(query, Object.assign(events, { media: query, get matches() { return matches; }, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), set(value: boolean) { matches = value; Object.defineProperty(this, "matches", { value, configurable: true }); events.dispatchEvent(new Event("change")); } }) as unknown as MediaQueryList & { set: (matches: boolean) => void });
    }
    return queries.get(query)!;
  });
  let intersection: IntersectionObserverCallback | undefined;
  const disconnect = vi.fn(); const observe = vi.fn();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { intersection = callback; }
    observe = observe; disconnect = disconnect;
  });
  let visibility: DocumentVisibilityState = "visible";
  vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibility);
  return {
    observe, disconnect,
    intersect(value: boolean) { act(() => intersection?.([{ isIntersecting: value } as IntersectionObserverEntry], {} as IntersectionObserver)); },
    reduce(value: boolean) { act(() => queries.get("(prefers-reduced-motion: reduce)")!.set(value)); },
    force(value: boolean) { act(() => queries.get("(forced-colors: active)")!.set(value)); },
    hide(value: boolean) { visibility = value ? "hidden" : "visible"; fireEvent(document, new Event("visibilitychange")); },
  };
}

describe("Persona visuals and motion", () => {
  it("keeps SSR static and decorative unless named, while retaining native attributes and refs", async () => {
    expect(renderToString(<Persona variant="orb" />)).toContain('data-animated="false"');
    const ref = React.createRef<HTMLDivElement>();
    const { container, rerender } = render(<Persona ref={ref} variant="rings" size={72} label="Guide" state="thinking" className="custom" data-owner="assistant" style={{ marginBlock: 4 }} />);
    expect(screen.getByRole("img", { name: "Guide: thinking" })).toBe(ref.current);
    expect(ref.current?.dataset.owner).toBe("assistant");
    expect(ref.current?.style.width).toBe("72px"); expect(ref.current?.style.marginBlock).toBe("4px");
    for (const variant of ["waveform", "orb", "rings"] as const) {
      for (const state of ["idle", "listening", "thinking", "speaking", "asleep"] as const) {
        rerender(<Persona variant={variant} label="Guide" state={state} />);
        expect(screen.getByRole("img", { name: `Guide: ${state}` }).dataset.variant).toBe(variant);
        if (state === "asleep") expect(screen.getByRole("img").dataset.animated).toBe("false");
      }
    }
    const result = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
    rerender(<Persona />); expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("gates actual motion and custom renderers on intersection, document visibility, preferences, explicit pause and asleep", () => {
    const environment = motionEnvironment(); const onMotionChange = vi.fn();
    const contexts: PersonaVisualContext[] = [];
    const renderVisual = (context: PersonaVisualContext) => { contexts.push(context); return <span>Custom visual</span>; };
    const { rerender, unmount } = render(<Persona renderVisual={renderVisual} onMotionChange={onMotionChange} />);
    expect(environment.observe).toHaveBeenCalledOnce();
    expect(contexts.at(-1)?.animated).toBe(false); expect(onMotionChange).toHaveBeenLastCalledWith(false);
    environment.intersect(true); expect(contexts.at(-1)?.animated).toBe(true);
    environment.hide(true); expect(contexts.at(-1)?.animated).toBe(false);
    environment.hide(false); expect(contexts.at(-1)?.animated).toBe(true);
    environment.reduce(true); expect(contexts.at(-1)?.animated).toBe(false);
    environment.reduce(false); expect(contexts.at(-1)?.animated).toBe(true);
    environment.force(true); expect(contexts.at(-1)?.animated).toBe(false);
    environment.force(false); expect(contexts.at(-1)?.animated).toBe(true);
    rerender(<Persona paused renderVisual={renderVisual} onMotionChange={onMotionChange} />);
    expect(contexts.at(-1)?.animated).toBe(false);
    rerender(<Persona state="asleep" renderVisual={renderVisual} onMotionChange={onMotionChange} />);
    expect(contexts.at(-1)?.animated).toBe(false);
    rerender(<Persona state="speaking" renderVisual={renderVisual} onMotionChange={onMotionChange} />);
    expect(contexts.at(-1)?.animated).toBe(true);
    environment.intersect(false); expect(contexts.at(-1)?.animated).toBe(false);
    const count = onMotionChange.mock.calls.length;
    unmount(); expect(environment.disconnect).toHaveBeenCalledOnce();
    environment.intersect(true); environment.reduce(true); environment.hide(true);
    expect(onMotionChange).toHaveBeenCalledTimes(count);
  });

  it("clamps live intensity, settles asleep, keeps custom children and gives the renderer normalized values", () => {
    const renderVisual = vi.fn(({ intensity }: PersonaVisualContext) => <span>Energy {intensity}</span>);
    const { rerender, container } = render(<Persona size={Number.NaN} intensity={2} renderVisual={renderVisual}>Unused child</Persona>);
    expect(screen.getByText("Energy 1")).toBeTruthy(); expect(screen.queryByText("Unused child")).toBeNull();
    expect(renderVisual.mock.calls.at(-1)?.[0].size).toBe(48);
    rerender(<Persona size={-20} intensity={-1} renderVisual={renderVisual} />);
    expect(renderVisual.mock.calls.at(-1)?.[0]).toMatchObject({ intensity: 0, size: 1 });
    rerender(<Persona state="speaking" intensity={Number.NaN} renderVisual={renderVisual} />);
    expect(renderVisual.mock.calls.at(-1)?.[0].intensity).toBe(0.85);
    rerender(<Persona state="asleep" intensity={1} renderVisual={renderVisual} />);
    expect(renderVisual.mock.calls.at(-1)?.[0]).toMatchObject({ intensity: 0, animated: false });
    rerender(<Persona><svg aria-hidden="true" data-custom="visual" /></Persona>);
    expect(container.querySelector('[data-custom="visual"]')).toBeTruthy();
    expect(container.querySelector(".rs-persona-bar")).toBeNull();
    expect(container.firstElementChild?.getAttribute("data-variant")).toBe("custom");
  });

  it("uses the latest callback without restarting observers or publishing unchanged motion", () => {
    const environment = motionEnvironment(); const first = vi.fn(); const next = vi.fn();
    const { rerender } = render(<Persona onMotionChange={first} />);
    environment.intersect(true);
    rerender(<Persona state="speaking" onMotionChange={next} />);
    expect(environment.observe).toHaveBeenCalledOnce(); expect(next).not.toHaveBeenCalled();
    environment.hide(true); expect(next).toHaveBeenCalledExactlyOnceWith(false);
    expect(first).toHaveBeenLastCalledWith(true);
  });
});
