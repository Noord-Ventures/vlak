"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { useOverlayPosition } from "../use-overlay-position";
import type { DropdownMenuItem, MenuCloseReason } from "./dropdown-menu";
import { MenuPanel, menuStyles } from "./dropdown-menu";

const styles = stylex.create({
  trigger: {
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
  pin: {
    position: "fixed",
    zIndex: vlak.zFloat,
    backgroundColor: vlak.paper,
  },
});

export interface ContextMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  items: DropdownMenuItem[];
}

/**
 * Menu at the pointer on right-click, or anchored to the trigger on
 * Shift+F10 / the ContextMenu key. The wrapper is tabbable (pass
 * `tabIndex={-1}` when the child is focusable itself); focus returns to
 * whatever had it when the menu closes.
 */
export const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  { items, className, style, children, onContextMenu, onKeyDown, ...props },
  ref,
) {
  const idBase = React.useId();
  const menuId = `${idBase}-menu`;
  const [at, setAt] = React.useState<{ x: number; y: number } | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const restoreTo = React.useRef<HTMLElement | null>(null);
  const placement = useOverlayPosition(at !== null, menuRef, restoreTo, at);

  React.useEffect(() => {
    if (!at) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setAt(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [at]);

  const openAt = (x: number, y: number) => {
    restoreTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setAt({ x, y });
  };

  const openFromRect = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    openAt(r.left, r.bottom);
  };

  const close = (reason: MenuCloseReason) => {
    setAt(null);
    if (reason !== "outside") restoreTo.current?.focus();
  };

  const trigger = rs(["rs-context-menu-trigger", className], styles.trigger);
  const menu = rs(["rs-menu", "rs-context-menu-pin"], menuStyles.menu, menuStyles.menuFixed, styles.pin);
  return (
    <div
      ref={ref}
      tabIndex={0}
      aria-keyshortcuts="Shift+F10"
      className={trigger.className}
      style={{ ...trigger.style, ...style }}
      onContextMenu={(e) => {
        onContextMenu?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        /* A keyboard-synthesised contextmenu event carries no pointer position. */
        if (e.clientX === 0 && e.clientY === 0) openFromRect(e.currentTarget);
        else openAt(e.clientX, e.clientY);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented || at) return;
        if ((e.key === "F10" && e.shiftKey) || e.key === "ContextMenu") {
          e.preventDefault();
          openFromRect(e.currentTarget);
        }
      }}
      {...props}
    >
      {children}
      {at && (
        <MenuPanel
          panelRef={menuRef}
          id={menuId}
          items={items}
          className={menu.className}
          style={{ ...menu.style, ...placement }}
          onClose={close}
        />
      )}
    </div>
  );
});
