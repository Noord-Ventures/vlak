"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { describeTrigger } from "./tooltip";

export interface HoverCardProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** A focusable element is used as is; anything else gets one tab stop. */
  trigger: React.ReactNode;
  /** Keep the panel shown regardless of hover or focus: for docs, tests, and static previews. */
  open?: boolean;
}

const styles = stylex.create({
  root: {
    position: "relative",
    display: "inline-block",
  },
  panel: {
    position: "absolute",
    top: "calc(100% + 8px)",
    insetInlineStart: 0,
    zIndex: vlak.zFloat,
    width: {
      default: "16.25rem",
      [mq.phone]: "min(280px, calc(100vw - 32px))",
    },
    backgroundColor: vlak.paper,
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    borderRadius: {
      default: vlak.radius,
      [mq.phone]: vlak.radius,
    },
    boxShadow: {
      default: "0 8px 24px rgba(0,0,0,0.06)",
      [mq.phone]: "none",
    },
    padding: "0.875rem",
    fontSize: {
      default: "0.8125rem",
      [mq.phone]: "0.9375rem",
    },
    lineHeight: 1.45,
    letterSpacing: "-0.01em",
    color: vlak.gray,
    opacity: {
      default: 0,
      [stylex.when.ancestor(":hover")]: {
        default: null,
        [mq.hover]: 1,
      },
      [stylex.when.ancestor(":focus-within")]: 1,
      [stylex.when.ancestor(":active")]: {
        default: null,
        [mq.touch]: 1,
      },
    },
    visibility: {
      default: "hidden",
      [stylex.when.ancestor(":hover")]: {
        default: null,
        [mq.hover]: "visible",
      },
      [stylex.when.ancestor(":focus-within")]: "visible",
      [stylex.when.ancestor(":active")]: {
        default: null,
        [mq.touch]: "visible",
      },
    },
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    // Bridges the 8px gap so the pointer can move onto the panel.
    "::before": {
      content: '""',
      position: "absolute",
      bottom: "100%",
      insetInlineStart: 0,
      insetInlineEnd: 0,
      height: "0.5rem",
    },
  },
  open: {
    opacity: 1,
    visibility: "visible",
  },
});

/**
 * Preview panel on hover or keyboard focus. CSS shows it; the panel
 * describes the trigger, and Escape hides it until the pointer leaves.
 */
export const HoverCard = React.forwardRef<HTMLSpanElement, HoverCardProps>(function HoverCard(
  { trigger, open, className, style, children, onKeyDown, onPointerLeave, onBlur, ...props },
  ref,
) {
  const id = React.useId();
  const [dismissed, setDismissed] = React.useState(false);
  const sx = rs(["rs-hover-card", className], styles.root, stylex.defaultMarker());
  const panel = rs(["rs-hover-card-panel", open && "rs-hover-card-open"], styles.panel, open && styles.open);
  const anchor = React.isValidElement(trigger) ? (
    describeTrigger(trigger, id)
  ) : (
    <span tabIndex={0} aria-describedby={id}>
      {trigger}
    </span>
  );
  return (
    <span
      ref={ref}
      {...props}
      className={sx.className}
      style={{ ...sx.style, ...style }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "Escape") setDismissed(true);
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        setDismissed(false);
      }}
      onBlur={(e) => {
        onBlur?.(e);
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDismissed(false);
      }}
    >
      {anchor}
      <span className={panel.className} style={panel.style} role="tooltip" id={id} hidden={dismissed}>
        {children}
      </span>
    </span>
  );
});
