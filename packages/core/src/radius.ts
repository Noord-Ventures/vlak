/** The exact inner circle shares its outer circle's center. No iterative fitting is needed. */
export interface InnerRadiusOptions {
  /** @deprecated Retained for source compatibility; the exact solution needs no learning rate. */
  lr?: number;
  /** @deprecated Retained for source compatibility; the exact solution needs no iterations. */
  epochs?: number;
}

export function innerRadius(
  outerRadius: number,
  padding: number,
  _options: InnerRadiusOptions = {},
): number {
  if (!Number.isFinite(outerRadius) || outerRadius <= 0) return 0;
  if (!Number.isFinite(padding) || padding <= 0) return outerRadius;
  return Math.max(0, outerRadius - padding);
}

/** Nested inner radius: Steve’s innerRadius, clamped at 0. */
export function concentricInner(outer: number, padding: number): number {
  return innerRadius(outer, padding);
}

/** Outer radius that keeps `inner` concentric across `padding`. */
export function concentricOuter(inner: number, padding: number): number {
  return Math.max(0, inner) + Math.max(0, padding);
}

/**
 * CSS closed form of innerRadius for a circular corner: the fit converges
 * to max(0, outer − padding). Surfaces set --rs-out and --rs-gap.
 */
export const concentricInnerCss = "max(0px, calc(var(--rs-out) - var(--rs-gap)))";
