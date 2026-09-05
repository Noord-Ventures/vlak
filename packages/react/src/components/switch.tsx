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
    width: vlak.hit,
    height: vlak.hit,
    minWidth: vlak.hit,
    minHeight: vlak.hit,
    borderRadius: vlak.radiusSm,
    borderWidth: 0,
    position: "relative",
    flexShrink: 0,
    padding: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    // The visible rail is slim; the transparent button keeps a 44px hit area.
    "::before": {
      content: '""',
      boxSizing: "border-box",
      position: "absolute",
      top: "0.625rem",
      insetInlineStart: 0,
      width: "2.75rem",
      height: "1.5rem",
      borderRadius: "0.75rem",
      borderWidth: 1.5,
      borderStyle: "solid",
      borderColor: {
        default: vlak.controlBorder,
        [mq.forcedColors]: "ButtonText",
      },
      backgroundColor: "transparent",
      transition: {
        default: `background-color ${vlak.duration} ${vlak.ease}, border-color ${vlak.duration} ${vlak.ease}`,
        [mq.reduce]: "none",
      },
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
    "::before": {
      backgroundColor: {
        default: vlak.ink,
        [mq.forcedColors]: "Highlight",
      },
      borderColor: {
        default: vlak.ink,
        [mq.forcedColors]: "Highlight",
      },
    },
    forcedColorAdjust: "none",
  },
  thumb: {
    position: "absolute",
    top: "0.84375rem",
    insetInlineStart: "0.21875rem",
    width: "1.0625rem",
    height: "1.0625rem",
    borderRadius: "50%",
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
      default: "translateX(1.25rem)",
      ":dir(rtl)": "translateX(-1.25rem)",
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
      <i aria-hidden="true" className={knob.className} style={knob.style} />
    </button>
  );
});
