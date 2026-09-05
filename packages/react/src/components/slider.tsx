"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useFieldControl } from "./field";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange"> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
}

const styles = stylex.create({
  slider: {
    position: "relative",
    height: {
      default: 2,
      [mq.phone]: "0.25rem",
    },
    backgroundColor: vlak.divider,
    borderRadius: {
      default: 1,
      [mq.phone]: 1,
    },
    marginBlock: {
      default: "1.3125rem",
      [mq.phone]: "1.25rem",
    },
    marginInline: 0,
  },
  fill: {
    position: "absolute",
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    backgroundColor: vlak.ink,
    borderRadius: {
      default: 1,
      [mq.phone]: 1,
    },
    pointerEvents: "none",
  },
  thumb: {
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: {
      default: "0.875rem",
      [mq.phone]: "1.375rem",
    },
    height: {
      default: "0.875rem",
      [mq.phone]: "1.375rem",
    },
    borderRadius: {
      default: "50%",
      [mq.phone]: "50%",
    },
    backgroundColor: vlak.paper,
    borderWidth: 1.5,
    borderStyle: "solid",
    borderColor: vlak.ink,
    boxSizing: "border-box",
    pointerEvents: "none",
  },
  /** Keyboard focus on the hidden range paints a ring on the thumb. */
  thumbFocused: {
    outlineWidth: 2,
    outlineStyle: "solid",
    outlineColor: vlak.ink,
    outlineOffset: 2,
  },
  range: {
    position: "absolute",
    insetInlineStart: 0,
    insetInlineEnd: 0,
    // The hit area is 44px; the visible track stays quiet.
    top: {
      default: "-1.3125rem",
      [mq.phone]: "-1.25rem",
    },
    bottom: {
      default: "-1.3125rem",
      [mq.phone]: "-1.25rem",
    },
    width: "100%",
    height: "auto",
    opacity: 0,
    cursor: "pointer",
    margin: 0,
  },
});

function isFocusVisible(el: HTMLElement): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}

/** A native range input drives the ink track. */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { value, defaultValue = 50, min = 0, max = 100, step = 1, onValueChange, className, style, onFocus, onBlur, ...props },
  ref,
) {
  const [inner, setInner] = React.useState(defaultValue);
  const [focused, setFocused] = React.useState(false);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;
  const pct = max === min ? 0 : ((current - min) / (max - min)) * 100;
  const field = useFieldControl(props);
  const sx = rs(["rs-slider", className], styles.slider);
  const fill = rs(["rs-slider-fill"], styles.fill);
  const thumb = rs(["rs-slider-thumb", focused && "rs-slider-thumb-focused"], styles.thumb, focused && styles.thumbFocused);
  const range = rs(["rs-slider-range"], styles.range);
  return (
    <div className={sx.className} style={{ ...sx.style, ...style }}>
      <span className={fill.className} style={{ ...fill.style, width: `${pct}%` }} />
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        className={range.className}
        style={range.style}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (!isControlled) setInner(next);
          onValueChange?.(next);
        }}
        {...props}
        aria-describedby={field["aria-describedby"]}
        aria-invalid={field["aria-invalid"]}
        onFocus={(e) => {
          onFocus?.(e);
          setFocused(isFocusVisible(e.currentTarget));
        }}
        onBlur={(e) => {
          onBlur?.(e);
          setFocused(false);
        }}
      />
      <span className={thumb.className} style={{ ...thumb.style, left: `${pct}%` }} />
    </div>
  );
});
