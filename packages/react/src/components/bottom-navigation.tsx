import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon, type IconName } from "./icon";

export interface BottomNavigationItem { id: string; label: string; href: string; icon?: IconName; count?: number }
export interface BottomNavigationProps extends React.HTMLAttributes<HTMLElement> {
  items: BottomNavigationItem[];
  current?: string;
  label?: string;
}
const styles = stylex.create({
  root: { backgroundColor: vlak.paper, color: vlak.ink, borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider, paddingBottom: "env(safe-area-inset-bottom, 0px)" },
  list: { listStyleType: "none", display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(0, 1fr)", gap: "0.25rem", padding: "0.5rem", margin: 0 },
  link: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.25rem", minWidth: vlak.hit, minHeight: vlak.hit, boxSizing: "border-box", padding: "0.5rem", color: vlak.gray, textDecoration: "none", fontSize: "0.875rem", borderRadius: vlak.radiusSm, textAlign: "center", overflowWrap: "anywhere", outlineColor: vlak.ink, outlineOffset: 2 },
  current: { color: vlak.ink, fontWeight: 600, backgroundColor: vlak.controlFill },
});

/** Mobile destinations with safe-area padding and native links. Keep to five items. */
export const BottomNavigation = React.forwardRef<HTMLElement, BottomNavigationProps>(function BottomNavigation({ items, current, label = "Primary navigation", className, style, ...props }, ref) {
  const root = rs(["rs-bottom-navigation", className], styles.root);
  const list = rs(["rs-bottom-navigation-list"], styles.list);
  return <nav ref={ref} aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}><ul {...list}>{items.map(item => {
    const active = current === item.id;
    const link = rs(["rs-bottom-navigation-link", active && "rs-bottom-navigation-current"], styles.link, active && styles.current);
    return <li key={item.id}><a {...link} href={item.href} aria-current={active ? "page" : undefined}>{item.icon && <Icon name={item.icon} />}<span>{item.label}{item.count != null ? ` (${item.count})` : ""}</span></a></li>;
  })}</ul></nav>;
});
