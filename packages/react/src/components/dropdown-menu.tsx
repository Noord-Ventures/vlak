"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useOverlayPosition } from "../use-overlay-position";

import { Icon } from "./icon";

export interface DropdownMenuItem {
  label?: React.ReactNode;
  /** Plain text for type-ahead when `label` is not a string. */
  searchText?: string;
  onSelect?: () => void;
  disabled?: boolean;
  separator?: boolean;
  /** Checked items use menuitemcheckbox semantics. */
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** A nested action menu. A parent item opens its children rather than selecting. */
  items?: DropdownMenuItem[];
}

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  items: DropdownMenuItem[];
}

export const menuStyles = stylex.create({
  select: {
    position: "relative",
    display: {
      default: "inline-block",
      [mq.phone]: "block",
    },
    minWidth: {
      default: "11.25rem",
      [mq.phone]: 0,
    },
    width: {
      default: null,
      [mq.phone]: "100%",
    },
  },
  dropdown: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
    paddingBlock: {
      default: "0.5625rem",
      [mq.phone]: "0.75rem",
    },
    paddingInline: {
      default: "0.75rem",
      [mq.phone]: "0.875rem",
    },
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.controlBorder,
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    fontSize: {
      default: "0.875rem",
      [mq.phone]: vlak.controlFs,
    },
    color: vlak.ink,
    letterSpacing: "-0.01em",
    cursor: "pointer",
    fontFamily: "inherit",
    backgroundColor: "transparent",
    width: "100%",
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
  menu: {
    boxSizing: "border-box",
    padding: "0.25rem",
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    marginTop: {
      default: "0.375rem",
      [mq.phone]: 0,
    },
    overflow: "hidden",
    backgroundColor: vlak.paper,
    boxShadow: {
      default: "0 8px 24px rgba(0,0,0,0.06)",
      [mq.phone]: "none",
    },
  },
  menuOverlay: {
    position: "absolute",
    top: "100%",
    insetInlineStart: 0,
    insetInlineEnd: 0,
    zIndex: vlak.zFloat,
  },
  menuFixed: {
    position: "fixed",
    zIndex: vlak.zFloat,
    marginTop: 0,
    minWidth: "10rem",
  },
  menuCal: {
    insetInlineEnd: "auto",
    padding: "0.75rem",
  },
  menuCombobox: {
    position: "absolute",
    top: "100%",
    insetInlineStart: 0,
    insetInlineEnd: 0,
    zIndex: vlak.zFloat,
    maxHeight: "15rem",
    overflowY: "auto",
  },
  item: {
    boxSizing: "border-box",
    display: {
      default: "block",
      [mq.phone]: "flex",
    },
    alignItems: {
      default: null,
      [mq.phone]: "center",
    },
    paddingBlock: {
      default: "0.5625rem",
      [mq.phone]: "0.75rem",
    },
    paddingInline: {
      default: "0.75rem",
      [mq.phone]: "0.875rem",
    },
    fontSize: {
      default: "0.875rem",
      [mq.phone]: vlak.controlFs,
    },
    color: {
      default: vlak.ink,
      ":focus-visible": vlak.paper,
      [mq.forcedColors]: { default: "CanvasText", ":focus-visible": "HighlightText" },
    },
    letterSpacing: "-0.01em",
    borderWidth: 0,
    borderRadius: vlak.radiusSm,
    width: "100%",
    textAlign: "start",
    cursor: "pointer",
    backgroundColor: {
      default: "transparent",
      ":focus-visible": vlak.ink,
      [mq.forcedColors]: { default: "Canvas", ":focus-visible": "Highlight" },
    },
    fontFamily: "inherit",
    minHeight: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    /* Full-surface focus avoids framing each action as a separate button.
       Forced colors retain an explicit outline alongside system-color fill. */
    outlineWidth: {
      default: 0,
      [mq.forcedColors]: { default: 0, ":focus-visible": 2 },
    },
    outlineStyle: {
      default: "none",
      [mq.forcedColors]: { default: "none", ":focus-visible": "solid" },
    },
    outlineColor: "HighlightText",
    outlineOffset: -2,
    forcedColorAdjust: "none",
  },
  itemActive: {
    backgroundColor: { default: vlak.dividerSubtle, ":focus-visible": vlak.ink, [mq.forcedColors]: "Highlight" },
    color: { default: vlak.ink, ":focus-visible": vlak.paper, [mq.forcedColors]: "HighlightText" },
  },
  itemDisabled: {
    color: vlak.gray,
    cursor: "default",
  },
  sep: {
    borderWidth: 0,
    borderTopWidth: vlak.hairline,
    borderTopStyle: "solid",
    borderTopColor: vlak.divider,
    marginBlock: "0.25rem",
    marginInline: "0.5rem",
  },
});

/** Text a menu item answers to for type-ahead. */
export function menuItemText(item: DropdownMenuItem): string {
  if (item.searchText) return item.searchText;
  return typeof item.label === "string" ? item.label : "";
}

/**
 * Next index whose text starts with `query`, searching forward from `from`
 * and wrapping. A repeated single letter cycles through its matches.
 */
export function typeAheadIndex(texts: string[], from: number, query: string): number {
  const q = query.toLowerCase();
  const repeated = q.length > 1 && q.split("").every((c) => c === q[0]);
  const needle = repeated ? q[0]! : q;
  const start = repeated || q.length === 1 ? from + 1 : from;
  for (let k = 0; k < texts.length; k++) {
    const i = (start + k + texts.length) % texts.length;
    if (texts[i]!.toLowerCase().startsWith(needle)) return i;
  }
  return -1;
}

/** Why a menu closed; decides whether focus goes back to the trigger. */
export type MenuCloseReason = "escape" | "select" | "tab" | "outside" | "arrow";

export interface MenuPanelProps {
  id: string;
  items: DropdownMenuItem[];
  /** Class and style from an rs() call; the panel adds nothing of its own. */
  className?: string;
  style?: React.CSSProperties;
  labelledBy?: string;
  /** Which item takes focus on open (ArrowUp opens on the last). */
  initial?: "first" | "last";
  onClose: (reason: MenuCloseReason) => void;
  /** ArrowLeft/ArrowRight, for a menubar to move to the neighbour menu. */
  onHorizontal?: (dir: -1 | 1) => void;
  /** The `role="menu"` element, for outside-click checks. */
  panelRef?: React.Ref<HTMLDivElement>;
  /** Internal nested-menu return action. */
  onBack?: () => void;
}

/**
 * The open `role="menu"` list: roving tabindex, arrows wrap, Home/End,
 * type-ahead, Escape and Tab close. Focus lands on the first item on mount.
 */
export function MenuPanel({
  id,
  items,
  className,
  style,
  labelledBy,
  initial = "first",
  onClose,
  onHorizontal,
  panelRef,
  onBack,
}: MenuPanelProps) {
  const actionable = items.filter((item) => !item.separator);
  const enabled = actionable.map((item, index) => (item.disabled ? -1 : index)).filter((i) => i >= 0);
  const [active, setActive] = React.useState(() =>
    initial === "last" ? (enabled[enabled.length - 1] ?? 0) : (enabled[0] ?? 0),
  );
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const [submenu, setSubmenu] = React.useState<number | null>(null);
  const subAnchor = React.useRef<HTMLButtonElement | null>(null);
  subAnchor.current = submenu === null ? null : itemRefs.current[submenu] ?? null;
  const typed = React.useRef({ buffer: "", at: 0 });
  const typedTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    // A positioned popover mounts hidden while its bounds are measured.
    // Browsers cannot focus its items until the visible commit has landed.
    if (style?.visibility !== "hidden") itemRefs.current[active]?.focus();
  }, [active, style?.visibility]);

  React.useEffect(() => () => clearTimeout(typedTimer.current), []);

  const choose = (item: DropdownMenuItem) => {
    if (item.disabled) return;
    if (item.items?.length) { setSubmenu(actionable.indexOf(item)); return; }
    onClose("select");
    if (item.checked !== undefined) item.onCheckedChange?.(!item.checked);
    item.onSelect?.();
  };

  const step = (dir: -1 | 1) => {
    if (enabled.length === 0) return;
    setSubmenu(null);
    const pos = enabled.indexOf(active);
    setActive(enabled[(pos + dir + enabled.length) % enabled.length]!);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest('[role="menu"]') !== e.currentTarget) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    if (e.key === forward && actionable[active]?.items?.length) {
      e.preventDefault(); setSubmenu(active); return;
    }
    if (e.key === backward && onBack) { e.preventDefault(); onBack(); return; }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        step(1);
        return;
      case "ArrowUp":
        e.preventDefault();
        step(-1);
        return;
      case "Home":
        e.preventDefault();
        setSubmenu(null);
        if (enabled.length) setActive(enabled[0]!);
        return;
      case "End":
        e.preventDefault();
        setSubmenu(null);
        if (enabled.length) setActive(enabled[enabled.length - 1]!);
        return;
      case "ArrowLeft":
      case "ArrowRight":
        if (onHorizontal) {
          e.preventDefault();
          onHorizontal(e.key === "ArrowLeft" ? -1 : 1);
        }
        return;
      case "Escape":
        e.preventDefault();
        if (onBack) onBack(); else onClose("escape");
        return;
      case "Tab":
        onClose("tab");
        return;
      case "Enter":
      case " ": {
        e.preventDefault();
        const item = actionable[active];
        if (item) choose(item);
        return;
      }
      default:
        break;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const now = Date.now();
      const buffer = now - typed.current.at < 500 ? typed.current.buffer + e.key : e.key;
      typed.current = { buffer, at: now };
      clearTimeout(typedTimer.current);
      typedTimer.current = setTimeout(() => {
        typed.current = { buffer: "", at: 0 };
      }, 500);
      const texts = actionable.map((item) => (item.disabled ? "" : menuItemText(item)));
      const next = typeAheadIndex(texts, active, buffer);
      if (next >= 0) { setSubmenu(null); setActive(next); }
    }
  };

  let actionIndex = -1;
  return (
    <div
      ref={panelRef}
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      className={className}
      style={style}
      onKeyDown={onKeyDown}
    >
      {items.map((item, index) => {
        if (item.separator) {
          const sep = rs(["rs-menu-sep"], menuStyles.sep);
          return <hr key={`sep-${index}`} className={sep.className} style={sep.style} />;
        }
        actionIndex++;
        const current = actionIndex;
        const row = rs(
          ["rs-menu-item", current === active && "rs-menu-item-active", item.disabled && "rs-menu-item-disabled"],
          menuStyles.item,
          current === active && menuStyles.itemActive,
          item.disabled && menuStyles.itemDisabled,
        );
        return (
          <button
            key={index}
            id={`${id}-item-${current}`}
            ref={(el) => {
              itemRefs.current[current] = el;
            }}
            type="button"
            role={item.checked !== undefined ? "menuitemcheckbox" : "menuitem"}
            aria-checked={item.checked}
            aria-haspopup={item.items?.length ? "menu" : undefined}
            aria-expanded={item.items?.length ? submenu === current : undefined}
            aria-controls={item.items?.length && submenu === current ? `${id}-sub-${current}` : undefined}
            tabIndex={current === active ? 0 : -1}
            aria-disabled={item.disabled || undefined}
            className={row.className}
            style={row.style}
            onPointerEnter={() => {
              if (!item.disabled && current !== active) { setSubmenu(null); setActive(current); }
            }}
            onFocus={() => { if (!item.disabled) setActive(current); }}
            onClick={() => choose(item)}
          >
            {item.checked && <Icon name="check" />}
            {item.label}
            {item.items?.length ? <Icon name="chevron-right" style={{ float: "inline-end", marginInlineStart: 16 }} /> : null}
          </button>
        );
      })}
      {submenu !== null && submenu === active && actionable[submenu]?.items?.length ? <NestedMenu
        id={`${id}-sub-${submenu}`}
        items={actionable[submenu]!.items!}
        labelledBy={`${id}-item-${submenu}`}
        anchor={subAnchor}
        onClose={onClose}
        onBack={() => { setSubmenu(null); itemRefs.current[active]?.focus(); }}
      /> : null}
    </div>
  );
}

function NestedMenu({ anchor, ...props }: Omit<MenuPanelProps, "panelRef" | "style" | "className"> & { anchor: React.RefObject<HTMLButtonElement | null> }) {
  const panel = React.useRef<HTMLDivElement>(null);
  const position = useOverlayPosition(true, panel, anchor, undefined, "inline-end");
  const menu = rs(["rs-menu", "rs-menu-nested"], menuStyles.menu, menuStyles.menuFixed);
  return <MenuPanel {...props} panelRef={panel} className={menu.className} style={{ ...menu.style, ...position }} />;
}

/** Action menu with menu semantics and keyboard navigation. */
export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(function DropdownMenu(
  { label, items, className, style, ...props },
  ref,
) {
  const idBase = React.useId();
  const triggerId = `${idBase}-trigger`;
  const menuId = `${idBase}-menu`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const setRootRef = useMergedRefs(rootRef, ref);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [initial, setInitial] = React.useState<"first" | "last">("first");
  const panelRef = React.useRef<HTMLDivElement>(null);
  const placement = useOverlayPosition(open, panelRef, triggerRef);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const openMenu = (at: "first" | "last") => {
    setInitial(at);
    setOpen(true);
  };

  const close = (reason: MenuCloseReason) => {
    setOpen(false);
    if (reason !== "outside") triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMenu("first");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        openMenu("last");
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close("escape");
    }
  };

  const root = rs(["rs-select", className], menuStyles.select);
  const trigger = rs(["rs-dropdown"], menuStyles.dropdown);
  const menu = rs(["rs-menu"], menuStyles.menu, menuStyles.menuOverlay);
  return (
    <div ref={setRootRef} className={root.className} style={{ ...root.style, ...style }} {...props}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={trigger.className}
        style={trigger.style}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close("select") : openMenu("first"))}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{label}</span>
        <Icon name="chevron-right" rotate={90} />
      </button>
      {open && (
        <MenuPanel
          panelRef={panelRef}
          id={menuId}
          items={items}
          labelledBy={triggerId}
          initial={initial}
          className={menu.className}
          style={{ ...menu.style, ...placement }}
          onClose={close}
        />
      )}
    </div>
  );
});
