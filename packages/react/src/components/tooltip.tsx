"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { cx } from "../cx";

export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tip text. Shown on hover and on keyboard focus; Escape hides it. */
  tip: string;
}

const styles = stylex.create({
  tip: {
    position: "relative",
    display: "inline-flex",
  },
  bubble: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    insetInlineStart: "50%",
    transform: "translateX(-50%)",
    boxSizing: "border-box",
    width: "max-content",
    maxWidth: "min(280px, calc(100vw - 16px))",
    backgroundColor: vlak.ink,
    color: vlak.paper,
    fontSize: {
      default: "0.71875rem",
      [mq.phone]: "0.8125rem",
    },
    fontWeight: 500,
    letterSpacing: "-0.01em",
    lineHeight: 1.3,
    paddingBlock: {
      default: "0.3125rem",
      [mq.phone]: "0.5rem",
    },
    paddingInline: {
      default: "0.5625rem",
      [mq.phone]: "0.75rem",
    },
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    zIndex: vlak.zFloat,
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
    // The tip itself can be hovered (WCAG 1.4.13); ::before bridges the 8px gap.
    pointerEvents: {
      default: "none",
      [stylex.when.ancestor(":hover")]: { default: null, [mq.hover]: "auto" },
      [stylex.when.ancestor(":focus-within")]: "auto",
    },
    // The delay is the leave grace: the pointer can cross onto the tip.
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    "::before": {
      content: '""',
      position: "absolute",
      top: "100%",
      insetInlineStart: 0,
      insetInlineEnd: 0,
      height: "0.5rem",
    },
  },
});

/**
 * Whether a React element reaches the tab order on its own. `null`
 * when it cannot be told (a component), so callers leave it alone.
 */
export function isFocusableElement(el: React.ReactElement): boolean | null {
  const props = el.props as Record<string, unknown>;
  if (props.tabIndex != null) return true;
  if (typeof el.type !== "string") return null;
  switch (el.type) {
    case "a":
    case "area":
      return props.href != null;
    case "button":
    case "input":
    case "select":
    case "textarea":
    case "summary":
      return !props.disabled;
    case "iframe":
      return true;
    default:
      return props.contentEditable === true || props.contentEditable === "true";
  }
}

/**
 * Clones a trigger element with the description reference; a plain
 * element that is not focusable also gets tabIndex so keyboards
 * reach it. Components are trusted to forward the attribute.
 */
export function describeTrigger(el: React.ReactElement, id: string): React.ReactElement {
  const props = el.props as Record<string, unknown>;
  const extra: Record<string, unknown> = {
    "aria-describedby": cx(props["aria-describedby"] as string | undefined, id),
  };
  if (isFocusableElement(el) === false) extra.tabIndex = 0;
  return React.cloneElement(el, extra);
}

export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  { tip, className, style, children, onKeyDown, onPointerLeave, onBlur, ...props },
  ref,
) {
  const id = React.useId();
  const [dismissed, setDismissed] = React.useState(false);
  const sx = rs(["rs-tip", className], styles.tip, stylex.defaultMarker());
  const bubble = rs(["rs-tip-bubble"], styles.bubble);
  // A text child makes the wrapper the trigger; an element child is described directly.
  const triggerIsRoot = !React.isValidElement(children);
  return (
    <span
      ref={ref}
      {...props}
      className={sx.className}
      style={{ ...sx.style, ...style }}
      data-tip={tip}
      tabIndex={triggerIsRoot ? 0 : undefined}
      aria-describedby={triggerIsRoot ? id : undefined}
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
      {triggerIsRoot ? children : describeTrigger(children as React.ReactElement, id)}
      <span role="tooltip" id={id} hidden={dismissed} className={bubble.className} style={bubble.style}>
        {tip}
      </span>
    </span>
  );
});
