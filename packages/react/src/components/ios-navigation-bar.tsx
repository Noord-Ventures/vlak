"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon } from "./icon";

export interface IOSNavigationBarAction extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Explicit DOM ID when another element needs to reference this action. */
  buttonId?: string;
}
export interface IOSNavigationBarProps extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "children"> {
  title: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  actions?: IOSNavigationBarAction[];
  orientation?: "horizontal" | "vertical";
  largeTitle?: boolean;
}
const styles = stylex.create({
  root: { boxSizing: "border-box", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", color: vlak.ink, minWidth: 0, padding: 8 },
  vertical: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: 0 },
  row: { display: "grid", gridTemplateColumns: "minmax(48px, 1fr) minmax(0, auto) minmax(48px, 1fr)", gap: 8, alignItems: "center", minHeight: 54 },
  leading: { justifySelf: "start" },
  actions: { display: "inline-flex", alignItems: "center", gap: 2, padding: 3, borderRadius: 27, justifySelf: "end", backgroundColor: vlak.controlFill, borderWidth: 1, borderStyle: "solid", borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "ButtonText" } },
  rail: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 },
  verticalActions: { flexDirection: "column" },
  button: { appearance: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, boxSizing: "border-box", minWidth: 44, minHeight: 44, paddingBlock: 10, paddingInline: 12, borderWidth: 0, borderRadius: 22, backgroundColor: { default: "transparent", ":hover": { default: null, [mq.hover]: vlak.paper } }, color: vlak.ink, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontSize: 17, lineHeight: "22px", cursor: "pointer", outlineWidth: { default: 0, ":focus-visible": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: -2, transition: { default: "background-color 200ms ease", [mq.reduce]: "none" } },
  iconButton: { width: 44, padding: 0 },
  back: { minWidth: 48, minHeight: 48, width: 48, borderRadius: 24, padding: 0, backgroundColor: vlak.controlFill, borderWidth: 1, borderStyle: "solid", borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "ButtonText" } },
  disabled: { opacity: 0.45, cursor: "not-allowed" },
  title: { margin: 0, textAlign: "center", fontSize: 17, lineHeight: "22px", fontWeight: 600, overflowWrap: "anywhere" },
  large: { marginBlock: "10px 4px", marginInline: 8, fontSize: 34, lineHeight: "41px", letterSpacing: "-0.035em", textAlign: "start", fontWeight: 700 },
  verticalTitle: { textAlign: "start", fontSize: 28, lineHeight: "34px", fontWeight: 700, marginBlock: 8, marginInline: 0 },
});

/** Compact and large-title navigation, with an optional trailing Duo action rail. */
export const IOSNavigationBar = React.forwardRef<HTMLElement, IOSNavigationBarProps>(function IOSNavigationBar({ title, onBack, backLabel = "Back", actions = [], orientation = "horizontal", largeTitle = false, className, style, ...props }, ref) {
  const vertical = orientation === "vertical";
  const base = React.useId();
  const root = rs(["rs-ios-navigation-bar", vertical && "rs-ios-navigation-bar-vertical", className], styles.root, vertical && styles.vertical);
  const row = rs(["rs-ios-navigation-bar-row"], styles.row);
  const leading = rs(["rs-ios-navigation-bar-leading"], styles.leading);
  const rail = rs(["rs-ios-navigation-bar-rail"], styles.rail);
  const group = rs(["rs-ios-navigation-bar-actions", vertical && "rs-ios-navigation-bar-actions-vertical"], styles.actions, vertical && styles.verticalActions);
  const heading = rs(["rs-ios-navigation-bar-title", largeTitle && "rs-ios-navigation-bar-large-title", vertical && "rs-ios-navigation-bar-vertical-title"], styles.title, largeTitle && styles.large, vertical && styles.verticalTitle);
  const backStyle = rs(["rs-ios-navigation-bar-button", "rs-ios-navigation-bar-back"], styles.button, styles.back);
  const back = onBack && <button {...backStyle} type="button" aria-label={backLabel} onClick={onBack}><Icon name="chevron-left" size={24} /></button>;
  const actionGroup = actions.length > 0 && <div {...group}>{actions.map(({ id, label, icon, buttonId, type = "button", className: actionClass, style: actionStyle, disabled, ...buttonProps }) => {
    const action = rs(["rs-ios-navigation-bar-button", !!icon && "rs-ios-navigation-bar-icon-button", disabled && "rs-ios-navigation-bar-disabled", actionClass], styles.button, !!icon && styles.iconButton, disabled && styles.disabled);
    return <button {...buttonProps} key={id} id={buttonId ?? `${base}-${id}`} type={type} disabled={disabled} aria-label={icon ? label : undefined} className={action.className} style={{ ...action.style, ...actionStyle }}>{icon ? <span aria-hidden="true">{icon}</span> : label}</button>;
  })}</div>;
  return <header ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>{vertical ? <><h2 {...heading}>{title}</h2><div {...rail}>{back}{actionGroup}</div></> : <><div {...row}><div {...leading}>{back}</div>{largeTitle ? <span /> : <h2 {...heading}>{title}</h2>}{actionGroup || <span />}</div>{largeTitle && <h2 {...heading}>{title}</h2>}</>}</header>;
});
