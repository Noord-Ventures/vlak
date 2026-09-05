import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Solid ink primary or hairline ghost. One primary per view. */
  variant?: "primary" | "ghost";
  size?: "default" | "sm";
  /** Flush into a ButtonGroup: no own stroke, one ink seam. */
  grouped?: boolean;
}

const styles = stylex.create({
  base: {
    boxSizing: "border-box",
    minWidth: vlak.hit,
    fontFamily: "inherit",
    letterSpacing: "-0.01em",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    height: {
      default: vlak.controlH,
      [mq.phone]: vlak.controlH,
    },
    minHeight: {
      default: null,
      [mq.phone]: vlak.hit,
    },
    width: {
      default: null,
      [mq.phone]: "100%",
    },
    fontSize: vlak.controlFs,
    paddingInline: {
      default: "1.375rem",
      [mq.phone]: "1.25rem",
    },
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    /* Hover and disabled are opacity on paper; in forced colors they become system colors instead. */
    opacity: {
      default: 1,
      ":hover": 0.85,
      ":disabled": 0.4,
      [mq.forcedColors]: {
        default: 1,
        ":hover": 1,
        ":disabled": 1,
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
  primary: {
    fontWeight: 600,
    backgroundColor: {
      default: vlak.ink,
      [mq.forcedColors]: "ButtonFace",
    },
    color: {
      default: vlak.paper,
      [mq.forcedColors]: {
        default: "ButtonText",
        ":disabled": "GrayText",
      },
    },
    borderColor: {
      default: "transparent",
      [mq.forcedColors]: {
        default: "ButtonText",
        ":disabled": "GrayText",
      },
    },
  },
  ghost: {
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    fontWeight: 500,
    backgroundColor: {
      default: "transparent",
      ":hover": vlak.controlFill,
      ":disabled": "transparent",
      [mq.forcedColors]: "ButtonFace",
    },
    color: {
      default: vlak.ink,
      [mq.forcedColors]: {
        default: "ButtonText",
        ":disabled": "GrayText",
      },
    },
    borderColor: {
      default: vlak.divider,
      ":hover": vlak.controlFill,
      ":disabled": vlak.divider,
      [mq.forcedColors]: {
        default: "ButtonText",
        ":hover": "Highlight",
        ":disabled": "GrayText",
      },
    },
  },
  sm: {
    height: {
      default: vlak.hit,
      [mq.phone]: vlak.controlH,
    },
    minHeight: {
      default: null,
      [mq.phone]: vlak.hit,
    },
    paddingInline: {
      default: "0.875rem",
      [mq.phone]: "1rem",
    },
    fontSize: {
      default: "0.8125rem",
      [mq.phone]: vlak.controlFs,
    },
    minWidth: {
      default: "6.5rem",
      [mq.phone]: 0,
    },
  },
  grouped: {
    height: "auto",
    minHeight: vlak.hit,
    width: {
      default: null,
      [mq.phone]: null,
    },
    borderWidth: 0,
    borderRadius: 0,
    margin: 0,
    flexGrow: {
      default: null,
      [mq.phone]: 1,
    },
    minWidth: {
      default: 0,
      [mq.phone]: 0,
    },
    outlineOffset: {
      default: null,
      ":focus-visible": -2,
    },
  },
  groupedGhost: {
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    backgroundColor: {
      default: vlak.paper,
      ":hover": vlak.controlFill,
      ":disabled": vlak.paper,
      [mq.forcedColors]: "ButtonFace",
    },
  },
});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "default", grouped = false, type = "button", className, style, ...props },
  ref,
) {
  const sx = rs([variant === "ghost" ? "rs-btn-ghost" : "rs-btn-primary", size === "sm" && "rs-btn-sm", className, grouped && "rs-btn-grouped", grouped && variant === "ghost" && "rs-btn-grouped-ghost"], styles.base, variant === "ghost" ? styles.ghost : styles.primary, size === "sm" && styles.sm, grouped && styles.grouped, grouped && variant === "ghost" && styles.groupedGhost);
  return <button ref={ref} type={type} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});
