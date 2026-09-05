"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { hidden } from "../hidden.stylex";
import { Icon } from "./icon";
import { useMergedRefs } from "../merge-refs";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const styles = stylex.create({
  choice: {
    display: "flex",
    alignItems: "center",
    gap: {
      default: "0.5625rem",
      [mq.phone]: "0.75rem",
    },
    fontSize: {
      default: "0.875rem",
      [mq.phone]: "1.0625rem",
    },
    color: vlak.ink,
    letterSpacing: "-0.01em",
    minHeight: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    minWidth: vlak.hit,
  },
  check: {
    width: {
      default: "1rem",
      [mq.phone]: "1.375rem",
    },
    height: {
      default: "1rem",
      [mq.phone]: "1.375rem",
    },
    borderRadius: {
      default: 3,
      [mq.phone]: 3,
    },
    borderWidth: 1.5,
    borderStyle: "solid",
    borderColor: {
      default: vlak.controlBorder,
      [mq.forcedColors]: "CanvasText",
    },
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: vlak.paper,
    boxSizing: "border-box",
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
    color: {
      default: vlak.paper,
      [mq.forcedColors]: "HighlightText",
    },
    forcedColorAdjust: "none",
  },
});

/** A real native checkbox; the visible 16px box mirrors its state. */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, style, checked, defaultChecked, indeterminate = false, onCheckedChange, onChange, ...props },
  ref,
) {
  const [inner, setInner] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : inner;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRefs(ref, inputRef);
  React.useEffect(() => { if (inputRef.current) inputRef.current.indeterminate = indeterminate; }, [indeterminate]);
  const row = rs(["rs-choice", className], styles.choice);
  const sr = rs(["rs-sr"], hidden.sr);
  const filled = on || indeterminate;
  const box = rs(["rs-check", filled && "rs-check-on"], styles.check, filled && styles.on);
  return (
    <label className={row.className} style={{ ...row.style, ...style }}>
      <input
        ref={mergedRef}
        type="checkbox"
        className={sr.className}
        style={sr.style}
        checked={on}
        onChange={(e) => {
          onChange?.(e);
          if (e.defaultPrevented) return;
          if (!isControlled) setInner(e.target.checked);
          onCheckedChange?.(e.target.checked);
        }}
        {...props}
      />
      <span className={box.className} style={box.style} aria-hidden="true">
        {filled && <Icon name={indeterminate ? "minus" : "check"} size={12} />}
      </span>
      {label}
    </label>
  );
});
