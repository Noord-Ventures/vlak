"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const styles = stylex.create({
  track: {
    display: "inline-flex",
    boxSizing: "border-box",
    width: {
      default: "4rem",
      [mq.phone]: "4rem",
    },
    height: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    minWidth: {
      default: "4rem",
      [mq.phone]: "4rem",
    },
    minHeight: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    borderRadius: {
      default: "1.375rem",
      [mq.phone]: "1.375rem",
    },
    borderWidth: 1.5,
    borderStyle: "solid",
    borderColor: {
      default: vlak.controlBorder,
      [mq.forcedColors]: "ButtonText",
    },
    position: "relative",
    flexShrink: 0,
    padding: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: {
      default: `background-color ${vlak.duration} ${vlak.ease}, border-color ${vlak.duration} ${vlak.ease}`,
      [mq.reduce]: "none",
    },
    outlineWidth: {
      default: null,
      ":focus-visible": 2,
    },
    outlineStyle: {
      default: null,
      ":focus-visible": "solid",
    },
    outlineColor: {
      default: null,
      ":focus-visible": vlak.ink,
    },
    outlineOffset: {
      default: null,
      ":focus-visible": 2,
    },
  },
  on: {
    backgroundColor: {
      default: vlak.ink,
      [mq.forcedColors]: "Highlight",
    },
    borderColor: {
      default: vlak.ink,
      [mq.forcedColors]: "Highlight",
    },
    forcedColorAdjust: "none",
  },
  thumb: {
    position: "absolute",
    top: {
      default: "0.15625rem",
      [mq.phone]: "0.15625rem",
    },
    insetInlineStart: {
      default: "0.15625rem",
      [mq.phone]: "0.15625rem",
    },
    width: {
      default: "2.25rem",
      [mq.phone]: "2.25rem",
    },
    height: {
      default: "2.25rem",
      [mq.phone]: "2.25rem",
    },
    borderRadius: {
      default: "50%",
      [mq.phone]: "50%",
    },
    backgroundColor: {
      default: vlak.gray,
      [mq.forcedColors]: "ButtonText",
    },
    forcedColorAdjust: "none",
    transition: {
      default: `transform ${vlak.duration} ${vlak.ease}`,
      [mq.reduce]: "none",
    },
  },
  thumbOn: {
    backgroundColor: {
      default: vlak.paper,
      [mq.forcedColors]: "HighlightText",
    },
    transform: {
      default: "translateX(20px)",
      [mq.phone]: "translateX(20px)",
    },
  },
});

/** A button with role="switch". */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, defaultChecked, onCheckedChange, className, style, onClick, ...props },
  ref,
) {
  const [inner, setInner] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : inner;
  const sx = rs(["rs-switch", on && "rs-switch-on", className], styles.track, on && styles.on);
  const knob = rs(["rs-switch-thumb", on && "rs-switch-thumb-on"], styles.thumb, on && styles.thumbOn);
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={on}
      className={sx.className}
      style={{ ...sx.style, ...style }}
      onClick={(e) => {
        if (!isControlled) setInner(!on);
        onCheckedChange?.(!on);
        onClick?.(e);
      }}
      {...props}
    >
      <i className={knob.className} style={knob.style} />
    </button>
  );
});
