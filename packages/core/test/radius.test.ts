import { describe, expect, it } from "vitest";
import {
  concentricInner,
  concentricInnerCss,
  concentricOuter,
  innerRadius,
} from "../src/radius";

describe("concentric radius", () => {
  it("uses exact geometry independently of obsolete fit settings", () => {
    expect(innerRadius(28, 16, { epochs: 0, lr: 0 })).toBe(12);
    expect(innerRadius(10.75, 0.25)).toBe(10.5);
    expect(innerRadius(Number.NaN, 2)).toBe(0);
  });

  it("fits the −padding isosurface and clamps at 0", () => {
    expect(innerRadius(28, 16)).toBe(12);
    expect(concentricInner(28, 16)).toBe(12);
    expect(innerRadius(4, 20)).toBe(0);
    expect(innerRadius(6, 20)).toBe(0);
    expect(innerRadius(0, 8)).toBe(0);
    expect(innerRadius(28, 0)).toBe(28);
  });

  it("does not keep the outer radius as the inner answer", () => {
    expect(innerRadius(28, 16)).not.toBe(28);
    expect(innerRadius(24, 8)).toBe(16);
  });

  it("adds padding to recover the outer radius", () => {
    expect(concentricOuter(12, 16)).toBe(28);
    expect(concentricOuter(0, 20)).toBe(20);
  });

  it("round-trips when the inner radius stays positive", () => {
    const outer = 32;
    const pad = 12;
    expect(concentricOuter(concentricInner(outer, pad), pad)).toBe(outer);
  });

  it("ships the CSS closed form of the fit", () => {
    expect(concentricInnerCss).toBe("max(0px, calc(var(--rs-out) - var(--rs-gap)))");
  });
});
