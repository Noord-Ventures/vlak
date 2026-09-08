import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** In-copy gradient underline, inset 1px. */
  underline?: boolean;
}

const styles = stylex.create({
  hairline: {
    fontSize: "0.875rem",
    color: "var(--accent)",
    textDecoration: "none",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    borderBottomWidth: vlak.hairline,
    borderBottomStyle: "solid",
    borderBottomColor: {
      default: vlak.divider,
      ":hover": { default: null, [mq.hover]: vlak.accent },
      ":active": vlak.accent,
    },
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
      ":focus-visible": vlak.accent,
    },
    outlineOffset: {
      default: null,
      ":focus-visible": 2,
    },
  },
  underline: {
    color: "var(--text)",
    textDecoration: "none",
    borderBottomWidth: 0,
    borderBottomStyle: "none",
    backgroundImage: {
      default: "linear-gradient(var(--divider), var(--divider))",
      ":hover": { default: null, [mq.hover]: "linear-gradient(var(--accent), var(--accent))" },
      ":active": "linear-gradient(var(--accent), var(--accent))",
    },
    backgroundSize: "calc(100% - 1px) 1px",
    backgroundPosition: "1px 100%",
    backgroundRepeat: "no-repeat",
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
  },
});

/** Text link with a hairline underline. In-copy variant is inset 1px. */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { underline = false, className, style, ...props },
  ref,
) {
  const sx = rs(
    [underline ? "rs-link-underline" : "rs-link", className],
    underline ? styles.underline : styles.hairline,
  );
  return <a ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});
