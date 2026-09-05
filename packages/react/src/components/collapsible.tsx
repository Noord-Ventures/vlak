"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon } from "./icon";

export interface CollapsibleProps
  extends Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  title: React.ReactNode;
  defaultOpen?: boolean;
}

const styles = stylex.create({
  summary: {
    listStyle: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4375rem",
    minHeight: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    minWidth: vlak.hit,
    fontSize: {
      default: "0.84375rem",
      [mq.phone]: "1.0625rem",
    },
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: vlak.ink,
    "::-webkit-details-marker": {
      display: "none",
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
  chevron: {
    transition: {
      default: `transform ${vlak.duration} ${vlak.ease}`,
      [mq.reduce]: "none",
    },
  },
  chevronOpen: {
    transform: "rotate(180deg)",
  },
  body: {
    paddingTop: {
      default: "0.625rem",
      [mq.phone]: "0.75rem",
    },
    paddingInlineEnd: 0,
    paddingBottom: 0,
    paddingInlineStart: 0,
    fontSize: {
      default: "0.84375rem",
      [mq.phone]: "1rem",
    },
    lineHeight: 1.45,
    color: vlak.gray,
  },
});

/** A bare native <details>. */
export const Collapsible = React.forwardRef<HTMLDetailsElement, CollapsibleProps>(function Collapsible({
  title,
  defaultOpen,
  className,
  style,
  children,
  onToggle,
  open,
  ...props
}, ref) {
  const [innerOpen, setInnerOpen] = React.useState(!!defaultOpen);
  const isOpen = open ?? innerOpen;
  const root = rs(["rs-disclosure", className]);
  const summary = rs(["rs-disclosure-summary"], styles.summary);
  const chevron = rs(["rs-acc-chevron", "rs-disclosure-chevron", isOpen && "rs-disclosure-chevron-open"], styles.chevron, isOpen && styles.chevronOpen);
  const body = rs(["rs-disclosure-body"], styles.body);
  return (
    <details
      ref={ref}
      open={open ?? (defaultOpen || undefined)}
      onToggle={(e) => {
        setInnerOpen(e.currentTarget.open);
        onToggle?.(e);
      }}
      {...props}
      className={root.className}
      style={{ ...root.style, ...style }}
    >
      <summary className={summary.className} style={summary.style}>
        {title}
        <Icon name="chevron-right" rotate={90} className={chevron.className} style={chevron.style} />
      </summary>
      <div className={body.className} style={body.style}>
        {children}
      </div>
    </details>
  );
});
