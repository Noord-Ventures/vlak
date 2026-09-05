"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const styles = stylex.create({
  toggle: {
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.375rem",
    height: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    minHeight: {
      default: null,
      [mq.phone]: vlak.hit,
    },
    minWidth: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    paddingBlock: 0,
    paddingInline: {
      default: "0.625rem",
      [mq.phone]: "0.875rem",
    },
    fontSize: {
      default: "0.8125rem",
      [mq.phone]: vlak.controlFs,
    },
    fontWeight: 500,
    letterSpacing: "-0.01em",
    backgroundColor: {
      default: "transparent",
      ":hover": vlak.controlFill,
      [mq.forcedColors]: "ButtonFace",
    },
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: {
      default: vlak.controlBorder,
      ":hover": vlak.controlFill,
      [mq.forcedColors]: "ButtonText",
    },
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    color: {
      default: vlak.gray,
      ":hover": vlak.ink,
      [mq.forcedColors]: "ButtonText",
    },
    cursor: "pointer",
    fontFamily: "inherit",
    transition: {
      default: vlak.transition,
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
  pressed: {
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
  group: {
    display: {
      default: "inline-flex",
      [mq.phone]: "flex",
    },
    alignItems: "stretch",
    boxSizing: "border-box",
    minHeight: `calc(${vlak.hit} + 2 * ${vlak.hairline})`,
    width: {
      default: null,
      [mq.phone]: "100%",
    },
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    /* The frame is the ink of the pressed toggle: one object, one colour. */
    borderColor: {
      default: vlak.ink,
      [mq.forcedColors]: "ButtonText",
    },
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    overflow: "hidden",
  },
  grouped: {
    height: "auto",
    minHeight: vlak.hit,
    flexGrow: {
      default: null,
      [mq.phone]: 1,
    },
    borderWidth: 0,
    borderRadius: 0,
    margin: 0,
    outlineOffset: {
      default: null,
      ":focus-visible": -2,
    },
    borderInlineStartWidth: {
      default: 0,
      ":not(:first-child)": vlak.hairline,
    },
    borderInlineStartStyle: {
      default: "none",
      ":not(:first-child)": "solid",
    },
    borderInlineStartColor: {
      default: "transparent",
      ":not(:first-child)": vlak.controlBorder,
    },
  },
  groupedOn: {
    position: "relative",
    zIndex: 1,
  },
});

/** Press switch; state lives in aria-pressed. */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { pressed, defaultPressed, onPressedChange, className, style, onClick, ...props },
  ref,
) {
  const [inner, setInner] = React.useState(defaultPressed ?? false);
  const isControlled = pressed !== undefined;
  const on = isControlled ? pressed : inner;
  const sx = rs(["rs-toggle", className, on && "rs-toggle-pressed"], styles.toggle, on && styles.pressed);
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={on}
      onClick={(e) => {
        if (!isControlled) setInner(!on);
        onPressedChange?.(!on);
        onClick?.(e);
      }}
      {...props}
      className={sx.className}
      style={{ ...sx.style, ...style }}
    />
  );
});

export interface ToggleGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: Array<{ value: string; label: React.ReactNode }>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

/** One pressed at a time. */
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  className,
  style,
  ...props
}, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;
  const group = rs(["rs-toggle-group", className], styles.group);
  const nest: React.CSSProperties = {
    ["--rs-out" as string]: "var(--radius-sm)",
    ["--rs-gap" as string]: "0px",
    ["--rs-in" as string]: "max(0px, calc(var(--rs-out) - var(--rs-gap)))",
  };
  return (
    <div ref={ref} role="group" {...props} className={group.className} style={{ ...group.style, ...nest, ...style }}>
      {options.map((option) => {
        const on = option.value === current;
        const btn = rs(["rs-toggle", "rs-toggle-grouped", on && "rs-toggle-pressed", on && "rs-toggle-grouped-on"], styles.toggle, styles.grouped, on && styles.pressed, on && styles.groupedOn);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            className={btn.className}
            style={btn.style}
            onClick={() => {
              if (!isControlled) setInner(option.value);
              onValueChange?.(option.value);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
});
