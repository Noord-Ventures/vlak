import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface Crumb {
  label: React.ReactNode;
  href?: string;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: Crumb[];
}

const styles = stylex.create({
  crumbs: {
    fontSize: {
      default: "0.8125rem",
      [mq.phone]: vlak.controlFs,
    },
    color: vlak.ink,
    letterSpacing: "-0.01em",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    alignItems: {
      default: "baseline",
      [mq.phone]: "center",
    },
    flexWrap: {
      default: null,
      [mq.phone]: "wrap",
    },
    gap: {
      default: "0.5rem",
      [mq.phone]: "0.375rem",
    },
  },
  item: {
    display: "inline-flex",
    alignItems: {
      default: "baseline",
      [mq.phone]: "center",
    },
    gap: {
      default: "0.5rem",
      [mq.phone]: "0.375rem",
    },
  },
  /* Ancestors are secondary gray at full opacity; the page carries weight. */
  link: {
    minWidth: vlak.hit,
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    color: {
      default: vlak.gray,
      ":link": vlak.gray,
      ":visited": vlak.gray,
      ":hover": vlak.ink,
      ":active": vlak.ink,
      ":focus-visible": vlak.ink,
    },
    fontWeight: 400,
    textDecoration: {
      default: "none",
      ":hover": "underline",
    },
    textUnderlineOffset: 3,
    backgroundColor: "transparent",
    display: {
      default: "inline-flex",
      [mq.phone]: "inline-flex",
    },
    alignItems: {
      default: "center",
      [mq.phone]: "center",
    },
    minHeight: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
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
  sep: {
    color: vlak.gray,
  },
  here: {
    color: vlak.ink,
    fontWeight: 500,
    display: {
      default: null,
      [mq.phone]: "inline-flex",
    },
    alignItems: {
      default: null,
      [mq.phone]: "center",
    },
    minHeight: {
      default: null,
      [mq.phone]: vlak.hit,
    },
  },
});

/** A trail: ordered list in a nav, the current page marked. */
export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { items, className, style, ...props },
  ref,
) {
  const nav = rs(["rs-crumbs", className], styles.crumbs);
  const list = rs(["rs-crumbs-list"], styles.list);
  const item = rs(["rs-crumbs-item"], styles.item);
  const link = rs(["rs-crumbs-link"], styles.link);
  const sep = rs(["rs-crumbs-sep"], styles.sep);
  const here = rs(["rs-crumbs-here"], styles.here);
  return (
    <nav ref={ref} aria-label="Breadcrumb" {...props} className={nav.className} style={{ ...nav.style, ...style }}>
      <ol className={list.className} style={list.style}>
        {items.map((crumb, index) => {
          const last = index === items.length - 1;
          return (
            <li key={index} className={item.className} style={item.style}>
              {index > 0 && (
                <span className={sep.className} style={sep.style} aria-hidden="true">
                  /
                </span>
              )}
              {last ? (
                <span className={here.className} style={here.style} aria-current="page">
                  {crumb.label}
                </span>
              ) : crumb.href ? (
                <a className={link.className} style={link.style} href={crumb.href}>
                  {crumb.label}
                </a>
              ) : (
                <span className={link.className} style={link.style}>
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
