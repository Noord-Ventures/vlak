import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Icon, type IconSize, type IconVariant } from "../src/components/icon";
import {
  filledCutouts,
  filledMarks,
  marks,
  smallFilledMarks,
  type MarkEl,
} from "../src/components/icon-marks";

afterEach(cleanup);

const sizes = [12, 16, 24] as const;
const variants = ["line", "filled"] as const;
const names = ["wifi", "wifi-off"] as const;
type Point = readonly [number, number];
type WifiName = (typeof names)[number];

function figure(name: WifiName, variant: IconVariant, size: IconSize): MarkEl[] {
  return variant === "line"
    ? marks[name]
    : (size === 12 ? smallFilledMarks[name] : undefined) ?? filledMarks[name] ?? marks[name];
}

function pathAt(elements: MarkEl[], index: number): string {
  const element = elements[index];
  if (element?.t !== "path") throw new Error(`Expected Wi-Fi path at ${index}`);
  return element.d;
}

function numbers(path: string): number[] {
  return (path.match(/-?(?:\d*\.\d+|\d+)/g) ?? []).map(Number);
}

// The signal uses one circular, symmetric SVG arc per wave, not arbitrary
// curves whose crowns can drift away from the shared source point.
function arc(path: string) {
  expect(path.match(/[A-Za-z]/g)).toEqual(["M", "A"]);
  const values = numbers(path);
  expect(values).toHaveLength(9);
  const [x1, y1, radius, ry, rotation, large, sweep, x2, y2] = values as [number, number, number, number, number, number, number, number, number];
  expect(ry).toBe(radius);
  expect(rotation).toBe(0);
  expect(large).toBe(0);
  expect(sweep).toBe(1);
  expect(y1).toBe(y2);
  const cx = (x1 + x2) / 2;
  const cy = y1 + Math.sqrt(radius ** 2 - ((x2 - x1) / 2) ** 2);
  return {
    radius,
    cx,
    cy,
    start: Math.atan2(y1 - cy, x1 - cx),
    end: Math.atan2(y2 - cy, x2 - cx),
  };
}

function rectangle(path: string) {
  expect(path.match(/[A-Za-z]/g)).toEqual(["M", "L", "L", "L", "Z"]);
  const values = numbers(path);
  expect(values).toHaveLength(8);
  const points: Point[] = [];
  for (let i = 0; i < values.length; i += 2) points.push([values[i]!, values[i + 1]!]);
  // Project perpendicular to the shared bottom-left to top-right slash.
  const projections = points.map(([x, y]) => (x + y) / Math.SQRT2);
  const minimum = Math.min(...projections);
  const maximum = Math.max(...projections);
  const edges = points.map((point, i): Point => {
    const next = points[(i + 1) % points.length]!;
    return [next[0] - point[0], next[1] - point[1]];
  });
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i]!;
    const next = edges[(i + 1) % edges.length]!;
    expect(edge[0] * next[0] + edge[1] * next[1]).toBeCloseTo(0, 5);
  }
  for (const point of points) for (const coordinate of point) {
    expect(coordinate).toBeGreaterThan(0);
    expect(coordinate).toBeLessThan(16);
  }
  return { minimum, maximum, width: maximum - minimum };
}

describe("Wi-Fi optical fidelity", () => {
  it("uses concentric, symmetric 90-degree waves with a four-unit radial pitch", () => {
    const waves = marks.wifi.slice(0, 2).map((_, index) => arc(pathAt(marks.wifi, index)));
    expect(waves.map((wave) => wave.radius)).toEqual([9, 5]);
    for (const wave of waves) {
      expect(wave.cx).toBe(8);
      expect(wave.cy).toBeCloseTo(12.5, 5);
      expect(wave.start).toBeCloseTo(-3 * Math.PI / 4, 5);
      expect(wave.end).toBeCloseTo(-Math.PI / 4, 5);
      expect(wave.end - wave.start).toBeCloseTo(Math.PI / 2, 5);
    }
    expect(waves[0]!.radius - waves[1]!.radius).toBe(4);
    // Two-unit filled strokes still leave 1.5 CSS px between waves at 12px.
    expect((waves[0]!.radius - waves[1]!.radius - 2) * 12 / 16).toBe(1.5);
  });

  it("retains the same two complete waves and source point in both on and off figures", () => {
    expect(marks.wifi).toHaveLength(3);
    for (const size of sizes) for (const variant of variants) for (const name of names) {
      const elements = figure(name, variant, size);
      expect(elements.slice(0, 3), `${name} ${variant} ${size}`).toEqual(marks.wifi);
      expect(elements).toHaveLength(name === "wifi" ? 3 : variant === "line" ? 4 : 5);
    }
  });

  it.each(sizes)("renders a solid source point with unchanged geometry in every %ipx pair", (size) => {
    expect(marks.wifi[2]).toEqual({ t: "circle", cx: 8, cy: 12.5, r: 1, solid: true });
    for (const variant of variants) for (const name of names) {
      const { container, unmount } = render(<Icon name={name} size={size} variant={variant} />);
      const svg = container.querySelector("svg")!;
      expect(svg.getAttribute("viewBox")).toBe("0 0 16 16");
      expect(svg.getAttribute("width")).toBe(String(size));
      expect(svg.getAttribute("height")).toBe(String(size));
      const circles = svg.querySelectorAll("circle");
      expect(circles).toHaveLength(1);
      const source = circles[0]!;
      expect(source.getAttribute("cx")).toBe("8");
      expect(source.getAttribute("cy")).toBe("12.5");
      expect(source.getAttribute("r")).toBe("1");
      expect(source.getAttribute("fill")).toBe(variant === "line" ? "currentColor" : "white");
      expect(source.getAttribute("stroke")).toBe("none");
      expect(source.hasAttribute("solid")).toBe(false);
      expect(2 * Number(source.getAttribute("r")) * size / 16).toBeGreaterThanOrEqual(1.5);
      unmount();
    }
  });

  it.each(sizes)("preserves square-ended hairlines and scaled filled waves at %ipx", (size) => {
    for (const variant of variants) for (const name of names) {
      const { container, unmount } = render(<Icon name={name} size={size} variant={variant} />);
      const paths = container.querySelectorAll("path");
      for (let index = 0; index < 2; index++) {
        const wave = paths[index]!;
        expect(wave.getAttribute("d")).toBe(pathAt(marks.wifi, index));
        expect(wave.getAttribute("fill")).toBe("none");
        expect(wave.getAttribute("stroke-width")).toBe(variant === "line" ? "1" : "2");
        expect(wave.getAttribute("stroke-linecap")).toBe("butt");
        expect(wave.getAttribute("stroke-linejoin")).toBe("miter");
        expect(wave.getAttribute("vector-effect")).toBe(variant === "line" ? "non-scaling-stroke" : "none");
      }
      unmount();
    }
  });

  it("uses a dedicated narrow clearance and a centered 1.5-unit filled slash without erasing the source", () => {
    const elements = filledMarks["wifi-off"]!;
    const clearance = rectangle(pathAt(elements, 3));
    const slash = rectangle(pathAt(elements, 4));
    expect(filledCutouts["wifi-off"]).toEqual([3]);
    expect(clearance.width).toBeCloseTo(2.5, 5);
    expect(clearance.width).toBeLessThan(6 / Math.SQRT2);
    expect(slash.width).toBeCloseTo(1.5, 5);
    for (const band of [clearance, slash]) {
      expect((band.minimum + band.maximum) / 2).toBeCloseTo(16 / Math.SQRT2, 5);
      // The entire source circle stays outside either polygon, not just its center.
      expect((8 + 12.5) / Math.SQRT2 - band.maximum).toBeGreaterThan(1);
    }
    expect(slash.minimum - clearance.minimum).toBeCloseTo(0.5, 5);
    expect(clearance.maximum - slash.maximum).toBeCloseTo(0.5, 5);
  });

  it("keeps most of both wave centerlines outside the off-state clearance", () => {
    const clearance = rectangle(pathAt(filledMarks["wifi-off"]!, 3));
    for (const [index, minimumRetained] of [[0, 0.8], [1, 0.5]] as const) {
      const wave = arc(pathAt(marks.wifi, index));
      let retained = 0;
      const samples = 2000;
      for (let index = 0; index < samples; index++) {
        const angle = wave.start + (wave.end - wave.start) * (index + 0.5) / samples;
        const x = wave.cx + wave.radius * Math.cos(angle);
        const y = wave.cy + wave.radius * Math.sin(angle);
        const projection = (x + y) / Math.SQRT2;
        if (projection < clearance.minimum || projection > clearance.maximum) retained++;
      }
      // Centerline retention catches destructive mask growth, not raster quality.
      expect(retained / samples).toBeGreaterThan(minimumRetained);
    }
  });

  it.each(sizes)("paints the filled %ipx slash after its separator with no extra outline", (size) => {
    const { container } = render(<Icon name="wifi-off" size={size} variant="filled" />);
    const group = container.querySelector("mask g")!;
    expect(group.children).toHaveLength(5);
    const separator = group.children[3]!;
    const slash = group.lastElementChild!;
    expect(separator.getAttribute("d")).toBe(pathAt(filledMarks["wifi-off"]!, 3));
    expect(separator.getAttribute("fill")).toBe("black");
    expect(separator.getAttribute("stroke")).toBe("none");
    expect(slash.getAttribute("d")).toBe(pathAt(filledMarks["wifi-off"]!, 4));
    expect(slash.getAttribute("fill")).toBe("white");
    expect(slash.getAttribute("stroke")).toBe("none");
  });
});
