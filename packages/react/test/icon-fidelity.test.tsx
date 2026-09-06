import * as React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon, IconCatalog, type IconSize } from "../src/components/icon";
import {
  filledCutouts,
  filledMarks,
  iconNames,
  marks,
  smallFilledCutouts,
  smallFilledMarks,
} from "../src/components/icon-marks";

describe("Icon optical fidelity", () => {
  it("keeps save detail enclosed within the silhouette at every supported size", () => {
    for (const size of [12, 16, 24] as const) {
      const { container, unmount } = render(<Icon name="save" variant="filled" size={size} />);
      const cuts = [...container.querySelectorAll('mask rect[fill="black"]')]
        .filter((rect) => rect.hasAttribute("x"));
      expect(cuts).toHaveLength(2);
      for (const cut of cuts) {
        const x = Number(cut.getAttribute("x"));
        const y = Number(cut.getAttribute("y"));
        const width = Number(cut.getAttribute("width"));
        const height = Number(cut.getAttribute("height"));
        // A detail may not break either horizontal edge of the enclosing disk.
        expect(y).toBeGreaterThan(3.5);
        expect(y + height).toBeLessThan(12.5);
        expect(x).toBeGreaterThan(3.5);
        expect(x + width).toBeLessThan(12.5);
        expect(height * size / 16).toBeGreaterThanOrEqual(1);
      }
      unmount();
    }
  });

  it("uses closed silhouettes for filled containers", () => {
    for (const name of ["archive", "package", "duplicate", "files"] as const) {
      const { container, unmount } = render(<Icon name={name} variant="filled" />);
      const bodies = [...container.querySelectorAll('mask path[fill="white"]')];
      expect(bodies.some((path) => /z\s*$/i.test(path.getAttribute("d") ?? ""))).toBe(true);
      unmount();
    }
  });

  it("simplifies fine trash slots so every 12px opening exceeds one CSS pixel", () => {
    const { container } = render(<Icon name="trash" variant="filled" size={12} />);
    const slots = [...container.querySelectorAll('mask rect[fill="black"][x]')];
    expect(slots).toHaveLength(2);
    for (const slot of slots) {
      expect(Number(slot.getAttribute("width")) * 12 / 16).toBeGreaterThanOrEqual(1);
    }
  });

  it.each<IconSize>([12, 16, 24])("scales filled outlines with the %ipx silhouette and preserves cut clarity", (size) => {
    const { container } = render(<Icon name="info" variant="filled" size={size} />);
    const cuts = [...container.querySelectorAll('mask path[stroke="black"]')];
    expect(cuts.length).toBeGreaterThan(0);
    for (const cut of cuts) {
      expect(cut.getAttribute("vector-effect")).toBe("none");
      expect(Number(cut.getAttribute("stroke-width")) * size / 16).toBeGreaterThanOrEqual(1);
    }
    const { container: action } = render(<Icon name="plus" variant="filled" size={size} />);
    for (const stroke of action.querySelectorAll('mask path[stroke="white"]')) {
      expect(stroke.getAttribute("vector-effect")).toBe("none");
    }
  });

  it("separates every filled off-state slash from the underlying figure", () => {
    for (const name of ["eye-off", "volume-off", "mic-off", "wifi-off"] as const) {
      const { container, unmount } = render(<Icon name={name} variant="filled" />);
      const mask = container.querySelector("mask")!;
      const separator = mask.querySelector('path[fill="black"]');
      expect(separator).toBeTruthy();
      const slash = mask.querySelector('g')!.lastElementChild!;
      expect(slash.getAttribute("stroke") === "white" || slash.getAttribute("fill") === "white").toBe(true);
      expect(separator?.compareDocumentPosition(mask.querySelector('g')!.lastElementChild!))
        .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      unmount();
    }
  });

  it("has valid optical cutout indices for every size and mark", () => {
    for (const size of [12, 16, 24]) {
      for (const name of iconNames) {
        const figure = (size === 12 ? smallFilledMarks[name] : undefined) ?? filledMarks[name] ?? marks[name];
        const cuts = (size === 12 ? smallFilledCutouts[name] : undefined) ?? filledCutouts[name] ?? [];
        for (const index of cuts) expect(figure[index]).toBeDefined();
      }
    }
  });

  it("labels the catalog variants and their actual sizes", () => {
    const { getByText } = render(<IconCatalog />);
    expect(getByText("Line on the left, filled on the right. Each shown at 12, 16, and 24px.")).toBeTruthy();
  });
});
