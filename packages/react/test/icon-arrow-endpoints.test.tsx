import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Icon, type IconSize, type IconVariant } from "../src/components/icon";
import {
  filledMarks,
  marks,
  smallFilledMarks,
  type DrawnName,
  type MarkEl,
} from "../src/components/icon-marks";

afterEach(cleanup);

type Point = readonly [number, number];
type Segment = { start: Point; end: Point; startTangent?: Point; endTangent?: Point };
type Subpath = { points: Point[]; commands: string[]; segments: Segment[] };
const subtract = (a: Point, b: Point): Point => [a[0] - b[0], a[1] - b[1]];
const length = (point: Point) => Math.hypot(...point);
const dot = (a: Point, b: Point) => a[0] * b[0] + a[1] * b[1];
const samePoint = (a: Point, b: Point) => length(subtract(a, b)) < 1e-8;

// Deliberately scoped to the arrow construction, not a general SVG parser.
// Cubic endpoint tangents are exact; arc endpoints are checked, but their
// tangents remain part of visual verification unless the mark uses cubics.
function subpaths(path: string): Subpath[] {
  const tokens = path.match(/[A-Za-z]|-?(?:\d*\.\d+|\d+)(?:e[-+]?\d+)?/g) ?? [];
  const result: Subpath[] = [];
  let index = 0;
  let current: Point = [0, 0];
  let command = "";
  const number = () => {
    const token = tokens[index++];
    if (token == null || !Number.isFinite(Number(token))) throw new Error(`Expected coordinate in ${path}`);
    return Number(token);
  };
  const point = (): Point => [number(), number()];
  while (index < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[index]!)) command = tokens[index++]!;
    if (command === "M") {
      current = point();
      result.push({ points: [current], commands: ["M"], segments: [] });
      command = "L";
      continue;
    }
    const active = result.at(-1);
    if (!active) throw new Error(`Arrow must start with M: ${path}`);
    const start = current;
    let startTangent: Point | undefined;
    let endTangent: Point | undefined;
    if (command === "L") current = point();
    else if (command === "H") current = [number(), current[1]];
    else if (command === "V") current = [current[0], number()];
    else if (command === "C") {
      const first = point();
      const last = point();
      current = point();
      startTangent = subtract(first, start);
      endTangent = subtract(current, last);
    } else if (command === "A") {
      for (let parameter = 0; parameter < 5; parameter++) number();
      current = point();
    } else throw new Error(`Unsupported or closed arrow command ${command}: ${path}`);
    if (["L", "H", "V"].includes(command)) startTangent = endTangent = subtract(current, start);
    active.commands.push(command);
    active.points.push(current);
    active.segments.push({ start, end: current, startTangent, endTangent });
  }
  return result;
}

const arrows: Array<{ name: DrawnName; element: number; shafts: number; heads: number }> = [
  ...["arrow-left", "arrow-right", "arrow-up", "arrow-down", "reply", "refresh", "undo", "redo", "history", "trending-up", "trending-down"].map((name) => ({ name: name as DrawnName, element: 0, shafts: 1, heads: 1 })),
  ...["external", "download", "upload", "log-in", "log-out"].map((name) => ({ name: name as DrawnName, element: 1, shafts: 1, heads: 1 })),
  { name: "move", element: 0, shafts: 2, heads: 4 },
];
const sizes = [12, 16, 24] as const;
const variants = ["line", "filled"] as const;
function figure(name: DrawnName, variant: IconVariant, size: IconSize): MarkEl[] {
  return variant === "line" ? marks[name] : (size === 12 ? smallFilledMarks[name] : undefined) ?? filledMarks[name] ?? marks[name];
}
function pathAt(elements: MarkEl[], index: number): string {
  const element = elements[index];
  if (element?.t !== "path") throw new Error(`Expected arrow path at element ${index}`);
  return element.d;
}

describe("Arrow endpoint craft", () => {
  it.each(arrows)("keeps $name heads uninterrupted, symmetric, and square to the shaft", ({ name, element, shafts, heads }) => {
    for (const variant of variants) for (const size of sizes) {
      const paths = subpaths(pathAt(figure(name, variant, size), element));
      expect(paths, `${name} ${variant} ${size}`).toHaveLength(shafts + heads);
      const stems = paths.slice(0, shafts);
      for (const head of paths.slice(shafts)) {
        expect(head.points).toHaveLength(3);
        expect(head.commands).toHaveLength(3);
        expect(head.commands[0]).toBe("M");
        expect(head.commands.slice(1).every((command) => ["L", "H", "V"].includes(command))).toBe(true);
        const [first, tip, last] = head.points as [Point, Point, Point];
        const left = subtract(first, tip);
        const right = subtract(last, tip);
        expect(length(left)).toBeGreaterThan(0);
        expect(length(left)).toBeCloseTo(length(right), 8);
        expect(dot(left, right)).toBeCloseTo(0, 8);
        const bisector: Point = [left[0] + right[0], left[1] + right[1]];
        const attachments = stems.flatMap((stem) => {
          const start = stem.segments[0]!;
          const end = stem.segments.at(-1)!;
          return [
            { point: start.start, inward: start.startTangent },
            { point: end.end, inward: end.endTangent && [-end.endTangent[0], -end.endTangent[1]] as Point },
          ].filter((attachment) => samePoint(attachment.point, tip));
        });
        expect(attachments, `${name}: shaft must meet the apex, not a wing`).toHaveLength(1);
        const tangent = attachments[0]!.inward;
        if (tangent) {
          expect(length(tangent)).toBeGreaterThan(0);
          expect(dot(tangent, bisector) / (length(tangent) * length(bisector))).toBeCloseTo(1, 8);
        }
        // Include the 90° miter's full reach inside the filled SVG mask.
        const reach = variant === "filled" ? Math.SQRT2 : 16 / size / Math.SQRT2;
        for (const coordinate of tip) {
          expect(coordinate - reach).toBeGreaterThanOrEqual(0);
          expect(coordinate + reach).toBeLessThanOrEqual(16);
        }
      }
    }
  });

  it.each(sizes)("renders the same compound arrow construction at %ipx in line and filled variants", (size) => {
    for (const variant of variants) for (const { name, element } of arrows) {
      const { container, unmount } = render(<Icon name={name} variant={variant} size={size} />);
      const expected = pathAt(figure(name, variant, size), element);
      const scope = variant === "filled" ? container.querySelector("mask")! : container;
      const path = [...scope.querySelectorAll("path")].find((entry) => entry.getAttribute("d") === expected);
      expect(path, `${name} ${variant}`).toBeTruthy();
      expect(path!.getAttribute("fill")).toBe("none");
      expect(path!.getAttribute("stroke-linecap")).toBe("butt");
      expect(path!.getAttribute("stroke-linejoin")).toBe("miter");
      expect(path!.getAttribute("stroke-width")).toBe(variant === "line" ? "1" : "2");
      expect(path!.getAttribute("vector-effect")).toBe(variant === "line" ? "non-scaling-stroke" : "none");
      expect(path!.getAttribute("stroke")).toBe(variant === "line" ? "currentColor" : "white");
      unmount();
    }
  });

  it.each(sizes)("keeps the filled send detail behind the outer apex at %ipx", (size) => {
    const elements = figure("send", "filled", size);
    const silhouette = pathAt(elements, 0);
    const outlineCoordinates = [...silhouette.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
    const tipX = Math.max(...outlineCoordinates.filter((_, index) => index % 2 === 0));
    const { container } = render(<Icon name="send" variant="filled" size={size} />);
    const cut = container.querySelector('mask path[stroke="black"]')!;
    expect(cut).toBeTruthy();
    const detail = subpaths(cut.getAttribute("d")!);
    expect(detail).toHaveLength(1);
    const end = detail[0]!.points.at(-1)!;
    expect((tipX - end[0]) * size / 16).toBeGreaterThanOrEqual(1);
    expect(end[1]).toBe(8);
  });
});
