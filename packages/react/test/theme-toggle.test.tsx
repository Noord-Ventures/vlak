import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { ThemeToggle } from "../src/components/theme-toggle";
import { filledMarks, marks } from "../src/components/icon-marks";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
  const saved = new Map<string, string>();
  vi.stubGlobal("localStorage", { getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => saved.set(key, value) });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.theme;
});

describe("Theme toggle icon craft", () => {
  it("uses the filled target-mode mark at the supported 24px size", () => {
    document.documentElement.dataset.theme = "light";
    render(<ThemeToggle className="rs-theme-toggle-inline" />);
    const button = screen.getByRole("button", { name: "Switch to dark scheme" });
    const icon = button.querySelector("svg")!;
    expect(icon.classList.contains("rs-theme-moon")).toBe(true);
    expect(icon.classList.contains("rs-icon-filled")).toBe(true);
    expect(icon.getAttribute("width")).toBe("24");
    expect(icon.getAttribute("height")).toBe("24");
    expect(icon.style.width).toBe("1.5rem");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.querySelectorAll('mask path[fill="white"][stroke="none"]')).toHaveLength(1);
    expect(icon.querySelector('path[stroke="currentColor"]')).toBeNull();
  });

  it("shows the sun for the light action and preserves keyboard focus across changes", async () => {
    document.documentElement.dataset.theme = "dark";
    const onThemeChange = vi.fn();
    const user = userEvent.setup();
    render(<ThemeToggle onThemeChange={onThemeChange} />);
    const button = screen.getByRole("button", { name: "Switch to light scheme" });
    expect(button.querySelector(".rs-theme-sun")).toBeTruthy();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(button);
    expect(button.querySelector(".rs-theme-moon")).toBeTruthy();
    expect(button.getAttribute("aria-label")).toBe("Switch to dark scheme");
    expect(localStorage.getItem("vlak-theme")).toBe("light");
    await user.keyboard(" ");
    expect(document.activeElement).toBe(button);
    expect(button.querySelector(".rs-theme-sun")).toBeTruthy();
    expect(onThemeChange.mock.calls).toEqual([[false], [true]]);
  });

  it("tracks an external scheme change without showing the previous target icon", async () => {
    render(<ThemeToggle />);
    await act(async () => { document.documentElement.dataset.theme = "dark"; });
    expect(screen.getByRole("button", { name: "Switch to light scheme" }).querySelector(".rs-theme-sun")).toBeTruthy();
  });

  it("keeps a disabled toggle inert", async () => {
    document.documentElement.dataset.theme = "light";
    const onThemeChange = vi.fn();
    render(<ThemeToggle disabled onThemeChange={onThemeChange} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onThemeChange).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("has one named control and no accessibility violations", async () => {
    const { container } = render(<ThemeToggle className="rs-theme-toggle-inline" />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    const result = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("constructs both moon variants from valid arcs, without implicit SVG radius expansion", () => {
    expect(filledMarks.moon).toEqual(marks.moon);
    const path = marks.moon[0]!;
    expect(path.t).toBe("path");
    if (path.t !== "path") return;
    const values = path.d.match(/-?\d*\.?\d+/g)!.map(Number);
    const [startX, startY, outerX, outerY, , outerLarge, outerSweep, endX, endY, innerX, innerY, , innerLarge, innerSweep] = values;
    const chord = Math.hypot(endX! - startX!, endY! - startY!);
    expect(chord).toBeLessThanOrEqual(2 * Math.min(outerX!, outerY!));
    expect(chord).toBeLessThanOrEqual(2 * Math.min(innerX!, innerY!));
    expect([outerLarge, outerSweep, innerLarge, innerSweep]).toEqual([1, 1, 0, 0]);
    expect(path.d.endsWith("Z")).toBe(true);
  });
});
