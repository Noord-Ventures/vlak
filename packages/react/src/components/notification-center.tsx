"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export interface NotificationItem {
  id: string;
  title: string;
  description?: React.ReactNode;
  dateTime?: string;
  timeLabel?: string;
  read?: boolean;
  action?: { label: string; onAction: () => void };
}
export interface NotificationCenterProps extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue"> {
  value?: NotificationItem[];
  defaultValue?: NotificationItem[];
  onValueChange?: (items: NotificationItem[]) => void;
  label?: string;
  emptyLabel?: string;
}
const styles = stylex.create({
  root: { color: vlak.ink, width: "100%", minWidth: 0 },
  header: { display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between" },
  title: { margin: 0, fontSize: "1rem", fontWeight: 600, lineHeight: 1.45 },
  list: { listStyleType: "none", margin: 0, padding: 0 },
  item: { padding: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, overflowWrap: "anywhere" },
  unread: { backgroundColor: vlak.controlFill },
  detail: { marginBlock: "0.5rem", color: vlak.ink, lineHeight: 1.45 },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" },
});

/** Persistent notifications with controlled read/unread and dismissal state. */
export const NotificationCenter = React.forwardRef<HTMLElement, NotificationCenterProps>(function NotificationCenter({ value, defaultValue = [], onValueChange, label = "Notifications", emptyLabel = "You're up to date", className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const items = value ?? inner;
  const [status, setStatus] = React.useState("");
  const pending = React.useRef<{ items: NotificationItem[]; announcement: string; onCommit?: () => void } | null>(null);
  React.useLayoutEffect(() => {
    const request = pending.current;
    if (!request || request.items.length !== items.length || !request.items.every((item, index) => items[index]?.id === item.id && Boolean(items[index]?.read) === Boolean(item.read))) return;
    pending.current = null;
    setStatus(request.announcement);
    request.onCommit?.();
  }, [items]);
  const id = React.useId();
  const change = (next: NotificationItem[], announcement: string, onCommit?: () => void) => { pending.current = { items: next, announcement, onCommit }; setStatus(""); if (value === undefined) setInner(next); onValueChange?.(next); };
  const root = rs(["rs-notification-center", className], styles.root);
  const header = rs(["rs-notification-center-header"], styles.header);
  const title = rs(["rs-notification-center-title"], styles.title);
  const list = rs(["rs-notification-center-list"], styles.list);
  const detail = rs(["rs-notification-center-detail"], styles.detail);
  const actions = rs(["rs-notification-center-actions"], styles.actions);
  const unread = items.filter(item => !item.read).length;
  return <section ref={ref} tabIndex={-1} aria-labelledby={id} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...header}><h2 id={id} {...title}>{label} <span>({unread} unread)</span></h2><Button variant="ghost" disabled={!unread} onClick={() => change(items.map(item => ({ ...item, read: true })), "All notifications marked as read")}>Mark all as read</Button></div>
    <p role="status" {...detail}>{status}</p>
    {!items.length && <p>{emptyLabel}</p>}
    <ul {...list}>{items.map(item => {
      const unseen = !item.read;
      const row = rs(["rs-notification-center-item", unseen && "rs-notification-center-unread"], styles.item, unseen && styles.unread);
      return <li key={item.id} {...row}><h3 {...title}>{item.title}</h3>{item.dateTime && <time {...detail} dateTime={item.dateTime}>{item.timeLabel ?? item.dateTime}</time>}{item.description != null && <div {...detail}>{item.description}</div>}<div {...actions}>
        <Button variant="ghost" aria-label={`Mark ${item.title} as ${item.read ? "unread" : "read"}`} onClick={() => change(items.map(entry => entry.id === item.id ? { ...entry, read: !entry.read } : entry), `${item.title} marked as ${item.read ? "unread" : "read"}`)}>{item.read ? "Mark unread" : "Mark read"}</Button>
        {item.action && <Button variant="ghost" onClick={item.action.onAction}>{item.action.label}</Button>}
        <Button variant="ghost" aria-label={`Dismiss ${item.title}`} onClick={event => { const section = event.currentTarget.closest("section"); const nextButton = event.currentTarget.closest("li")?.nextElementSibling?.querySelector("button") ?? event.currentTarget.closest("li")?.previousElementSibling?.querySelector("button"); change(items.filter(entry => entry.id !== item.id), `${item.title} dismissed`, () => (nextButton ?? section)?.focus()); }}>Dismiss</Button>
      </div></li>;
    })}</ul>
  </section>;
});
