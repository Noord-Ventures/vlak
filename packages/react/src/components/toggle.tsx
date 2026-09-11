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
  /** Subtle uses a quiet hover and a soft selected fill. */
  variant?: "default" | "subtle";
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
      default: "1.25rem",
      [mq.phone]: "1.25rem",
    },
    fontSize: {
      default: "0.8125rem",
      [mq.phone]: vlak.controlFs,
    },
    fontWeight: 500,
    letterSpacing: "-0.01em",
    backgroundColor: {
      default: "transparent",
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: vlak.controlFill, [mq.forcedColors]: "ButtonFace" } },
      [mq.forcedColors]: "ButtonFace",
    },
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: {
      default: vlak.controlBorder,
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: vlak.controlFill, [mq.forcedColors]: "ButtonText" } },
      [mq.forcedColors]: "ButtonText",
    },
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    color: {
      default: vlak.gray,
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: vlak.ink, [mq.forcedColors]: "ButtonText" } },
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
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: vlak.ink, [mq.forcedColors]: "Highlight" } },
      [mq.forcedColors]: "Highlight",
    },
    borderColor: {
      default: vlak.ink,
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: vlak.ink, [mq.forcedColors]: "Highlight" } },
      [mq.forcedColors]: "Highlight",
    },
    color: {
      default: vlak.paper,
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
      [mq.forcedColors]: "HighlightText",
    },
    forcedColorAdjust: "none",
  },
  subtle: {
    backgroundColor: {
      default: "transparent",
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: "transparent", [mq.forcedColors]: "ButtonFace" } },
      [mq.forcedColors]: "ButtonFace",
    },
    borderColor: {
      default: "transparent",
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: "transparent", [mq.forcedColors]: "ButtonText" } },
      [mq.forcedColors]: "ButtonText",
    },
    cursor: { default: "pointer", ":disabled": "not-allowed" },
    opacity: { default: 1, ":disabled": { default: 0.5, [mq.forcedColors]: 1 } },
  },
  subtlePressed: {
    backgroundColor: {
      default: vlak.controlFill,
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: vlak.controlFill, [mq.forcedColors]: "Highlight" } },
      [mq.forcedColors]: "Highlight",
    },
    borderColor: {
      default: "transparent",
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: "transparent", [mq.forcedColors]: "Highlight" } },
      [mq.forcedColors]: "Highlight",
    },
    color: {
      default: vlak.ink,
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: vlak.ink, [mq.forcedColors]: "HighlightText" } },
      [mq.forcedColors]: "HighlightText",
    },
    fontWeight: 600,
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
  groupSubtle: {
    minWidth: 0,
    maxWidth: "100%",
    padding: 0,
    gap: "3px",
    backgroundColor: { default: vlak.tableAlt, [mq.forcedColors]: "Canvas" },
    borderColor: { default: vlak.divider, [mq.forcedColors]: "ButtonText" },
  },
  groupedSubtle: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: { default: "auto", [mq.phone]: 0 },
    minWidth: { default: vlak.hit, [mq.phone]: vlak.hit },
    paddingInline: { default: "0.75rem", [mq.phone]: "0.625rem" },
    borderRadius: { default: vlak.radiusSm, [mq.phone]: vlak.radiusSm },
    borderInlineStartWidth: { default: 0, ":not(:first-child)": 0 },
    borderInlineStartStyle: { default: "none", ":not(:first-child)": "none" },
    borderInlineStartColor: { default: "transparent", ":not(:first-child)": "transparent" },
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  },
});

/** Press switch; state lives in aria-pressed. */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { pressed, defaultPressed, onPressedChange, variant = "default", className, style, onClick, ...props },
  ref,
) {
  const [inner, setInner] = React.useState(defaultPressed ?? false);
  const isControlled = pressed !== undefined;
  const on = isControlled ? pressed : inner;
  const subtle = variant === "subtle";
  const sx = rs(["rs-toggle", className, subtle && "rs-toggle-subtle", on && "rs-toggle-pressed", subtle && on && "rs-toggle-subtle-pressed"], styles.toggle, subtle && styles.subtle, on && styles.pressed, subtle && on && styles.subtlePressed);
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
  /** Subtle groups use a soft rail and individually rounded selected items. */
  variant?: "default" | "subtle";
}

/** One pressed at a time. */
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  variant = "default",
  className,
  style,
  ...props
}, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;
  const subtle = variant === "subtle";
  const group = rs(["rs-toggle-group", className, subtle && "rs-toggle-group-subtle"], styles.group, subtle && styles.groupSubtle);
  const nest: React.CSSProperties = {
    ["--rs-out" as string]: "var(--radius-sm)",
    ["--rs-gap" as string]: "0px",
    ["--rs-in" as string]: "max(0px, calc(var(--rs-out) - var(--rs-gap)))",
  };
  return (
    <div ref={ref} role="group" {...props} className={group.className} style={{ ...group.style, ...nest, ...style }}>
      {options.map((option) => {
        const on = option.value === current;
        const btn = rs(["rs-toggle", "rs-toggle-grouped", subtle && "rs-toggle-subtle", subtle && "rs-toggle-grouped-subtle", on && "rs-toggle-pressed", subtle && on && "rs-toggle-subtle-pressed", on && "rs-toggle-grouped-on"], styles.toggle, styles.grouped, subtle && styles.subtle, subtle && styles.groupedSubtle, on && styles.pressed, subtle && on && styles.subtlePressed, on && styles.groupedOn);
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
