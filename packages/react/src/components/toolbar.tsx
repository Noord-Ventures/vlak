"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon, type IconName } from "./icon";

export interface ToolbarAction { id: string; label: string; icon?: IconName; disabled?: boolean; pressed?: boolean; onAction: () => void }
export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  actions: ToolbarAction[];
  orientation?: "horizontal" | "vertical";
}
const styles = stylex.create({
  root: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", color: vlak.ink },
  vertical: { flexDirection: "column", alignItems: "stretch" },
  pressed: { fontWeight: 600 },
});

/** Named action collection with one Tab stop and roving keyboard focus. */
export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar({ label, actions, orientation = "horizontal", className, style, onKeyDown, ...props }, ref) {
  const [focused, setFocused] = React.useState<string>();
  const enabled = actions.filter(action => !action.disabled);
  const current = enabled.some(action => action.id === focused) ? focused : enabled[0]?.id;
  const buttons = React.useRef(new Map<string, HTMLButtonElement>());
  const vertical = orientation === "vertical";
  const root = rs(["rs-toolbar", className, vertical && "rs-toolbar-vertical"], styles.root, vertical && styles.vertical);
  const pressed = rs(["rs-toolbar-pressed"], styles.pressed);
  return <div ref={ref} role="toolbar" aria-label={label} aria-orientation={orientation} {...props} className={root.className} style={{ ...root.style, ...style }} onKeyDown={event => {
    onKeyDown?.(event); if (event.defaultPrevented || !enabled.length) return;
    const index = enabled.findIndex(action => action.id === current);
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const nextKey = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const previousKey = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : event.key === nextKey ? (index + 1) % enabled.length : event.key === previousKey ? (index - 1 + enabled.length) % enabled.length : -1;
    if (next < 0) return; event.preventDefault(); const action = enabled[next]; if (action) { setFocused(action.id); buttons.current.get(action.id)?.focus(); }
  }}>{actions.map(action => <Button key={action.id} ref={element => { if (element) buttons.current.set(action.id, element); else buttons.current.delete(action.id); }} variant={action.pressed ? "primary" : "ghost"} style={{ width: "auto", ...(action.pressed ? pressed.style : {}) }} className={action.pressed ? pressed.className : undefined} disabled={action.disabled} tabIndex={action.id === current ? 0 : -1} aria-pressed={action.pressed} onFocus={() => setFocused(action.id)} onClick={action.onAction}>{action.icon && <Icon name={action.icon} />}{action.label}</Button>)}</div>;
});
