"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon } from "./icon";

export interface ToastOptions {
  description?: React.ReactNode;
  /** Overrides the computed lifetime, in milliseconds. */
  duration?: number;
}

interface ToastItem {
  id: number;
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
}

let nextId = 1;
const listeners = new Set<(item: ToastItem) => void>();
/** Fired before any <Toaster /> mounted; flushed by the first one. */
const pending: ToastItem[] = [];

/** Fire a toast from anywhere; a mounted <Toaster /> renders it. */
export function toast(title: React.ReactNode, options?: ToastOptions): void {
  const item: ToastItem = { id: nextId++, title, description: options?.description, duration: options?.duration };
  if (listeners.size === 0) {
    pending.push(item);
    return;
  }
  for (const listener of listeners) listener(item);
}

export interface ToasterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The shortest a toast stays, in milliseconds. Longer text stays longer. */
  duration?: number;
  /** Accessible name of the close button on every toast. */
  closeLabel?: string;
}

/** Characters in a node tree: what the lifetime scales with. */
function textLength(node: React.ReactNode): number {
  if (node == null || typeof node === "boolean") return 0;
  if (typeof node === "string" || typeof node === "number") return String(node).length;
  if (Array.isArray(node)) return node.reduce<number>((n, child) => n + textLength(child), 0);
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textLength(node.props.children);
  return 0;
}

const PER_CHAR = 50;
const CAP = 15000;

function lifetime(item: ToastItem, min: number): number {
  if (item.duration != null) return item.duration;
  const chars = textLength(item.title) + textLength(item.description);
  return Math.min(Math.max(min, CAP), min + chars * PER_CHAR);
}

interface Timer {
  remaining: number;
  started: number;
  handle: ReturnType<typeof setTimeout> | null;
  holds: Set<string>;
}

const toastIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const styles = stylex.create({
  stack: {
    position: "fixed",
    bottom: {
      default: "1.25rem",
      [mq.phone]: "max(0.5rem, env(safe-area-inset-bottom))",
    },
    insetInlineEnd: {
      default: "1.25rem",
      [mq.phone]: "0.5rem",
    },
    insetInlineStart: {
      default: null,
      [mq.phone]: "0.5rem",
    },
    zIndex: vlak.zToast,
    display: "flex",
    flexDirection: "column",
    alignItems: {
      default: "flex-end",
      [mq.phone]: "stretch",
    },
    gap: {
      default: "0.5rem",
      [mq.phone]: "0.5rem",
    },
  },
  toast: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.625rem",
    backgroundColor: vlak.paper,
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    borderRadius: {
      default: vlak.radius,
      [mq.phone]: vlak.radiusSm,
    },
    boxShadow: {
      default: "0 8px 24px rgba(0,0,0,0.06)",
      [mq.phone]: "none",
    },
    paddingTop: {
      default: "0.625rem",
      [mq.phone]: "1rem",
    },
    paddingInline: {
      default: "0.875rem",
      [mq.phone]: "1.25rem",
    },
    paddingBottom: {
      default: "0.625rem",
      [mq.phone]: "calc(16px + env(safe-area-inset-bottom, 0px))",
    },
    maxWidth: {
      default: "21.25rem",
      [mq.phone]: "none",
    },
    width: {
      default: null,
      [mq.phone]: "100%",
    },
    animationName: {
      default: toastIn,
      [mq.reduce]: "none",
    },
    animationDuration: vlak.durationConfirm,
    animationTimingFunction: vlak.ease,
  },
  title: {
    display: "block",
    fontSize: {
      default: "0.8125rem",
      [mq.phone]: "1rem",
    },
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: vlak.ink,
  },
  body: {
    fontSize: {
      default: "0.78125rem",
      [mq.phone]: "0.9375rem",
    },
    lineHeight: 1.45,
    letterSpacing: "-0.01em",
    color: vlak.gray,
    marginTop: {
      default: 1,
      [mq.phone]: "0.25rem",
    },
    marginBottom: 0,
    marginInline: 0,
  },
  close: {
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginInlineStart: "auto",
    marginTop: {
      default: "-0.25rem",
      [mq.phone]: "-0.625rem",
    },
    marginInlineEnd: {
      default: "-0.375rem",
      [mq.phone]: "-0.75rem",
    },
    width: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    height: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    padding: 0,
    borderWidth: 0,
    borderRadius: vlak.radiusSm,
    backgroundColor: {
      default: "transparent",
      ":hover": vlak.controlFill,
    },
    color: vlak.ink,
    cursor: "pointer",
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
});

export const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(function Toaster(
  { duration = 4000, closeLabel = "Dismiss", className, style, ...props },
  ref,
) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const timers = React.useRef(new Map<number, Timer>());
  const minRef = React.useRef(duration);
  minRef.current = duration;

  const remove = React.useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer?.handle) clearTimeout(timer.handle);
    timers.current.delete(id);
    setItems((current) => current.filter((i) => i.id !== id));
  }, []);

  const run = React.useCallback(
    (id: number) => {
      const timer = timers.current.get(id);
      if (!timer || timer.handle || timer.holds.size) return;
      timer.started = Date.now();
      timer.handle = setTimeout(() => remove(id), timer.remaining);
    },
    [remove],
  );

  /** Hover and focus each hold the timer; it resumes when both let go. */
  const hold = React.useCallback((id: number, reason: string) => {
    const timer = timers.current.get(id);
    if (!timer) return;
    timer.holds.add(reason);
    if (!timer.handle) return;
    clearTimeout(timer.handle);
    timer.handle = null;
    timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.started));
  }, []);

  const release = React.useCallback(
    (id: number, reason: string) => {
      const timer = timers.current.get(id);
      if (!timer) return;
      timer.holds.delete(reason);
      run(id);
    },
    [run],
  );

  React.useEffect(() => {
    const timerMap = timers.current;
    const add = (item: ToastItem) => {
      timerMap.set(item.id, { remaining: lifetime(item, minRef.current), started: 0, handle: null, holds: new Set() });
      setItems((current) => [...current, item]);
      run(item.id);
    };
    listeners.add(add);
    pending.splice(0).forEach(add);
    return () => {
      listeners.delete(add);
      for (const timer of timerMap.values()) if (timer.handle) clearTimeout(timer.handle);
      timerMap.clear();
    };
  }, [run]);

  const stack = rs(["rs-toasts", className], styles.stack);
  return (
    <div ref={ref} {...props} className={stack.className} style={{ ...stack.style, ...style }} role="status" aria-live="polite">
      {items.map((item) => {
        const card = rs(["rs-toast"], styles.toast);
        const heading = rs(["rs-toast-title"], styles.title);
        const body = rs(["rs-toast-body"], styles.body);
        const close = rs(["rs-toast-close"], styles.close);
        return (
          <div
            key={item.id}
            className={card.className}
            style={card.style}
            onPointerEnter={() => hold(item.id, "hover")}
            onPointerLeave={() => release(item.id, "hover")}
            onFocus={() => hold(item.id, "focus")}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) release(item.id, "focus");
            }}
          >
            <div>
              <span className={heading.className} style={heading.style}>
                {item.title}
              </span>
              {item.description != null && (
                <p className={body.className} style={body.style}>
                  {item.description}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label={closeLabel}
              className={close.className}
              style={close.style}
              onClick={() => remove(item.id)}
            >
              <Icon name="close" size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
});
