"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon } from "./icon";

export interface IOSListProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  footer?: React.ReactNode;
}
export interface IOSListRowProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  label: React.ReactNode;
  description?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  disabled?: boolean;
  disclosure?: boolean;
}
const styles = stylex.create({
  root: { fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontSize: 17, lineHeight: "22px", color: vlak.ink, minWidth: 0 },
  title: { marginBlock: "0 8px", marginInline: 16, fontSize: 15, lineHeight: "20px", fontWeight: 400, color: vlak.gray },
  group: { borderRadius: 22, backgroundColor: vlak.paper, borderWidth: 1, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "ButtonText" }, overflow: "hidden" },
  footer: { marginBlock: "8px 0", marginInline: 16, fontSize: 13, lineHeight: "18px", color: vlak.gray },
  row: { appearance: "none", display: "flex", alignItems: "center", boxSizing: "border-box", gap: 12, width: "100%", minWidth: 44, minHeight: 52, borderWidth: 0, borderStyle: "solid", borderBlockEndWidth: 1, borderColor: vlak.divider, backgroundColor: "transparent", color: vlak.ink, paddingBlock: 8, paddingInline: 16, textAlign: "start", fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit", ":last-child": { borderBlockEndWidth: 0 } },
  action: { cursor: "pointer", backgroundColor: { default: "transparent", ":hover": { default: null, [mq.hover]: vlak.tableAlt } }, outlineWidth: { default: 0, ":focus-visible": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: -3, transition: { default: "background-color 200ms ease", [mq.reduce]: "none" } },
  disabled: { opacity: 0.45, cursor: "not-allowed" },
  leading: { display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: 28, minHeight: 28 },
  copy: { display: "flex", flexDirection: "column", gap: 2, flexGrow: 1, minWidth: 0, overflowWrap: "anywhere" },
  description: { fontSize: 15, lineHeight: "20px", color: vlak.gray },
  trailing: { display: "inline-flex", alignItems: "center", gap: 8, color: vlak.gray, fontSize: 15, lineHeight: "20px", flexShrink: 0 },
});

/** An inset group of rows; controls remain separate focus targets. */
export const IOSList = React.forwardRef<HTMLElement, IOSListProps>(function IOSList({ title, footer, className, style, children, ...props }, ref) {
  const id = React.useId();
  const root = rs(["rs-ios-list", className], styles.root);
  const heading = rs(["rs-ios-list-title"], styles.title);
  const group = rs(["rs-ios-list-group"], styles.group);
  const note = rs(["rs-ios-list-footer"], styles.footer);
  return <section ref={ref} aria-labelledby={title ? id : undefined} {...props} className={root.className} style={{ ...root.style, ...style }}>{title && <h3 {...heading} id={id}>{title}</h3>}<div {...group}>{children}</div>{footer && <p {...note}>{footer}</p>}</section>;
});

/** Supply onClick for a native button, or omit it to hold a switch or other input. */
export const IOSListRow = React.forwardRef<HTMLElement, IOSListRowProps>(function IOSListRow({ label, description, leading, trailing, disclosure = false, onClick, disabled, className, style, ...props }, ref) {
  const root = rs(["rs-ios-list-row", !!onClick && "rs-ios-list-row-action", disabled && "rs-ios-list-row-disabled", className], styles.row, !!onClick && styles.action, disabled && styles.disabled);
  const mark = rs(["rs-ios-list-row-leading"], styles.leading);
  const copy = rs(["rs-ios-list-row-copy"], styles.copy);
  const detail = rs(["rs-ios-list-row-description"], styles.description);
  const end = rs(["rs-ios-list-row-trailing"], styles.trailing);
  const content = <>{leading && <span {...mark} aria-hidden="true">{leading}</span>}<span {...copy}><span>{label}</span>{description && <span {...detail}>{description}</span>}</span>{(trailing || disclosure) && <span {...end}>{trailing}{disclosure && <Icon name="chevron-right" size={16} />}</span>}</>;
  return onClick ? <button {...props} ref={ref as React.Ref<HTMLButtonElement>} type="button" disabled={disabled} onClick={onClick} className={root.className} style={{ ...root.style, ...style }}>{content}</button> : <div {...props} ref={ref as React.Ref<HTMLDivElement>} className={root.className} style={{ ...root.style, ...style }}>{content}</div>;
});
