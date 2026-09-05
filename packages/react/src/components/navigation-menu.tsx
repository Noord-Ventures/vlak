import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> {
  items: Array<{ label: React.ReactNode; href: string; current?: boolean }>;
  /** Landmark name; pages carry several navs. */
  "aria-label"?: string;
}

const styles = stylex.create({
  nav: {
    display: "flex",
    alignItems: "center",
    gap: {
      default: "1.375rem",
      [mq.phone]: 0,
    },
    flexWrap: {
      default: null,
      [mq.phone]: "wrap",
    },
  },
  link: {
    minWidth: vlak.hit,
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
    paddingInline: {
      default: null,
      [mq.phone]: "0.75rem",
    },
    fontSize: {
      default: "0.875rem",
      [mq.phone]: vlak.controlFs,
    },
    fontWeight: 500,
    letterSpacing: "-0.01em",
    color: {
      default: vlak.gray,
      ":link": vlak.gray,
      ":visited": vlak.gray,
      ":hover": vlak.ink,
      '[aria-current="page"]': vlak.ink,
    },
    textDecoration: "none",
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
  },
});

/** Links in a row; the current page is ink. */
export const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu({
  items,
  className,
  style,
  "aria-label": ariaLabel = "Primary",
  ...props
}, ref) {
  const nav = rs(["rs-nav", className], styles.nav);
  const link = rs(["rs-nav-link"], styles.link);
  return (
    <nav
      ref={ref}
      aria-label={props["aria-labelledby"] ? undefined : ariaLabel}
      {...props}
      className={nav.className}
      style={{ ...nav.style, ...style }}
    >
      {items.map((item, index) => (
        <a
          key={index}
          href={item.href}
          aria-current={item.current ? "page" : undefined}
          className={link.className}
          style={link.style}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
});
