"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";

export interface CanvasControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  onFit?: () => void;
  onReset?: () => void;
  disabled?: boolean;
  label?: string;
}
const styles = stylex.create({
  root: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", color: vlak.ink },
  action: { width: "auto", minWidth: vlak.hit, minHeight: vlak.hit, paddingInline: "0.75rem" },
  value: { minWidth: "3.75rem", textAlign: "center", fontSize: "0.8125rem", fontVariantNumeric: "tabular-nums" },
});

/** Zoom, fit, and reset actions for a canvas. The canvas owns pan and rendering. */
export const CanvasControls = React.forwardRef<HTMLDivElement, CanvasControlsProps>(function CanvasControls({ zoom, defaultZoom = 1, onZoomChange, minZoom = 0.25, maxZoom = 4, step = 0.25, onFit, onReset, disabled = false, label = "Canvas controls", className, style, ...props }, ref) {
  const lower = Number.isFinite(minZoom) && minZoom > 0 ? minZoom : 0.25;
  const upper = Number.isFinite(maxZoom) ? Math.max(lower, maxZoom) : 4;
  const increment = Number.isFinite(step) && step > 0 ? step : 0.25;
  const bounded = (n: number) => Math.max(lower, Math.min(upper, Number.isFinite(n) ? n : 1));
  const [inner, setInner] = React.useState(defaultZoom);
  const current = bounded(zoom ?? inner);
  const change = (next: number) => { const result = Number(bounded(next).toFixed(4)); if (zoom === undefined) setInner(result); onZoomChange?.(result); };
  const root = rs(["rs-canvas-controls", className], styles.root);
  const action = rs(["rs-canvas-action"], styles.action);
  const reading = rs(["rs-canvas-zoom"], styles.value);
  return <div ref={ref} role="group" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <Button {...action} variant="ghost" aria-label="Zoom out" disabled={disabled || current <= lower} onClick={() => change(current - increment)}><Icon name="minus" /></Button>
    <output {...reading} aria-label="Zoom level">{Math.round(current * 100)}%</output>
    <Button {...action} variant="ghost" aria-label="Zoom in" disabled={disabled || current >= upper} onClick={() => change(current + increment)}><Icon name="plus" /></Button>
    {onFit && <Button {...action} variant="ghost" disabled={disabled} onClick={onFit}><Icon name="expand" />Fit</Button>}
    <Button {...action} variant="ghost" disabled={disabled} onClick={() => { change(1); onReset?.(); }}><Icon name="refresh" />Reset</Button>
  </div>;
});
