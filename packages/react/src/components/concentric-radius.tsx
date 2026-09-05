"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";

/** The exact inner circle shares its outer circle's center. No iterative fitting is needed. */
export function innerRadius(
  outerRadius: number,
  padding: number,
  _options: { lr?: number; epochs?: number } = {},
): number {
  if (!Number.isFinite(outerRadius) || outerRadius <= 0) return 0;
  if (!Number.isFinite(padding) || padding <= 0) return outerRadius;
  return Math.max(0, outerRadius - padding);
}

export function concentricInner(outer: number, padding: number): number {
  return innerRadius(outer, padding);
}

export function concentricOuter(inner: number, padding: number): number {
  return Math.max(0, inner) + Math.max(0, padding);
}

const NestInnerRadius = React.createContext<number | null>(null);

function nestVars(out?: number, gap?: number): React.CSSProperties {
  const style: Record<string, string> = {
    "--rs-in": "max(0px, calc(var(--rs-out) - var(--rs-gap)))",
  };
  if (out != null) style["--rs-out"] = `${out}px`;
  if (gap != null) style["--rs-gap"] = `${gap}px`;
  return style as React.CSSProperties;
}

const styles = stylex.create({
  nest: {
    boxSizing: "border-box",
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    borderRadius: "var(--rs-out, var(--radius-sm))",
    padding: "var(--rs-gap, var(--pad))",
    backgroundColor: vlak.paper,
  },
  inner: {
    boxSizing: "border-box",
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    borderRadius: "var(--rs-in)",
    minHeight: "4.5rem",
    backgroundColor: vlak.paper,
    display: "flex",
    alignItems: "flex-end",
  },
});

export interface NestProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Outer radius in px. Nested nests inherit the parent inner radius. */
  radius?: number;
  /** Padding in px. Inset for Steve’s innerRadius. */
  pad?: number;
}

export const Nest = React.forwardRef<HTMLDivElement, NestProps>(function Nest(
  { radius, pad, style, className, children, ...props },
  ref,
) {
  const inherited = React.useContext(NestInnerRadius);
  const out = radius ?? inherited ?? undefined;
  const next = out != null && pad != null ? concentricInner(out, pad) : inherited;

  const sx = rs(["rs-nest", className], styles.nest);
  return (
    <NestInnerRadius.Provider value={next ?? null}>
      <div ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...nestVars(out, pad), ...style }}>
        {children}
      </div>
    </NestInnerRadius.Provider>
  );
});

export const NestInner = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function NestInner(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-nest-in", className], styles.inner);
  return <div ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});
