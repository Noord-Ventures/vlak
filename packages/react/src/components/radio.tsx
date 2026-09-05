"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { hidden } from "../hidden.stylex";

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  setValue: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup({
  name,
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}, ref) {
  const autoName = React.useId();
  const [inner, setInner] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;
  const setValue = (next: string) => {
    if (!isControlled) setInner(next);
    onValueChange?.(next);
  };
  return (
    <div ref={ref} role="radiogroup" {...props}>
      <RadioGroupContext.Provider value={{ name: name ?? autoName, value: current, setValue }}>
        {children}
      </RadioGroupContext.Provider>
    </div>
  );
});

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value"> {
  value: string;
  label?: React.ReactNode;
}

const styles = stylex.create({
  radio: {
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
  dot: {
    width: {
      default: "1rem",
      [mq.phone]: "1.375rem",
    },
    height: {
      default: "1rem",
      [mq.phone]: "1.375rem",
    },
    borderRadius: "50%",
    borderWidth: 1.5,
    borderStyle: "solid",
    borderColor: {
      default: vlak.controlBorder,
      [mq.forcedColors]: "CanvasText",
    },
    position: "relative",
    flexShrink: 0,
    boxSizing: "border-box",
  },
  on: {
    borderColor: {
      default: vlak.ink,
      [mq.forcedColors]: "Highlight",
    },
  },
  fill: {
    position: "absolute",
    inset: {
      default: "0.1875rem",
      [mq.phone]: "0.3125rem",
    },
    borderRadius: "50%",
    backgroundColor: {
      default: vlak.ink,
      [mq.forcedColors]: "Highlight",
    },
    forcedColorAdjust: "none",
  },
});

/** A real native radio inside a RadioGroup; the ink dot mirrors its state. */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, className, style, onChange, ...props },
  ref,
) {
  const group = React.useContext(RadioGroupContext);
  const on = group ? group.value === value : undefined;
  const row = rs(["rs-radio", className], styles.radio);
  const sr = rs(["rs-sr"], hidden.sr);
  const mark = rs(["rs-radio-dot", on && "rs-radio-on"], styles.dot, on && styles.on);
  const fill = rs(["rs-radio-fill"], styles.fill);
  return (
    <label className={row.className} style={{ ...row.style, ...style }}>
      <input
        ref={ref}
        type="radio"
        className={sr.className}
        style={sr.style}
        name={group?.name}
        value={value}
        checked={on}
        onChange={(e) => {
          group?.setValue(value);
          onChange?.(e);
        }}
        {...props}
      />
      <span className={mark.className} style={mark.style} aria-hidden="true">
        {on ? <span className={fill.className} style={fill.style} /> : null}
      </span>
      {label}
    </label>
  );
});
