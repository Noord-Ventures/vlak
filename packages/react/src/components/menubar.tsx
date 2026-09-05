"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useOverlayPosition } from "../use-overlay-position";
import { MenuPanel, menuStyles, type DropdownMenuItem, type MenuCloseReason } from "./dropdown-menu";

export interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {
  menus: Array<{ label: React.ReactNode; items: DropdownMenuItem[] }>;
}

const styles = stylex.create({
  bar: {
    boxSizing: "border-box",
    display: "inline-flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 2,
    minWidth: 0,
    maxWidth: "100%",
    width: {
      default: null,
      [mq.phone]: "100%",
    },
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    padding: 2,
  },
  wrap: {
    position: "relative",
    display: "flex",
    flex: "0 1 auto",
    minWidth: 0,
    maxWidth: "100%",
  },
  trigger: {
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: vlak.hit,
    minHeight: vlak.hit,
    maxWidth: "100%",
    padding: "0.5rem 0.75rem",
    borderWidth: 0,
    borderRadius: vlak.radiusSm,
    fontFamily: "inherit",
    fontSize: vlak.controlFs,
    lineHeight: 1.25,
    color: vlak.ink,
    backgroundColor: { default: "transparent", ":hover": vlak.controlFill },
    overflowWrap: "anywhere",
    cursor: "pointer",
    outlineWidth: { default: null, ":focus-visible": 2 },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: vlak.ink,
    outlineOffset: -2,
  },
  open: {
    backgroundColor: { default: vlak.controlFill, [mq.forcedColors]: "Highlight" },
    color: { default: vlak.ink, [mq.forcedColors]: "HighlightText" },
  },
  panel: {
    minWidth: "10rem",
    width: "max-content",
    maxWidth: "calc(100vw - 16px)",
  },
});

/**
 * Dropdown menus in a hairline strip. The triggers are menuitems with one
 * roving tab stop; ArrowLeft/ArrowRight move between them and an open
 * menu follows.
 */
export const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(function Menubar(
  { menus, className, style, onKeyDown, ...props },
  ref,
) {
  const idBase = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const setRootRef = useMergedRefs(rootRef, ref);
  const triggerRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const [focusIndex, setFocusIndex] = React.useState(0);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  // Changing the open menu must also reposition the newly mounted panel.
  const openTrigger = React.useMemo(() => ({
    current: openIndex === null ? null : triggerRefs.current[openIndex] ?? null,
  }), [openIndex]);
  const placement = useOverlayPosition(openIndex !== null, panelRef, openTrigger);
  const [initial, setInitial] = React.useState<"first" | "last">("first");
  const count = menus.length;

  React.useEffect(() => {
    if (openIndex === null) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenIndex(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openIndex]);

  const focusTrigger = (index: number) => {
    setFocusIndex(index);
    triggerRefs.current[index]?.focus();
  };

  const openMenu = (index: number, at: "first" | "last" = "first") => {
    setFocusIndex(index);
    setInitial(at);
    setOpenIndex(index);
  };

  const closeMenu = (reason: MenuCloseReason) => {
    setOpenIndex(null);
    if (reason !== "outside") triggerRefs.current[focusIndex]?.focus();
  };

  const moveTo = (index: number) => {
    const next = (index + count) % count;
    if (openIndex !== null) openMenu(next);
    else focusTrigger(next);
  };

  const onBarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || count === 0) return;
    const index = triggerRefs.current.indexOf(e.target as HTMLButtonElement);
    if (index < 0) return;
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveTo(index + 1);
        return;
      case "ArrowLeft":
        e.preventDefault();
        moveTo(index - 1);
        return;
      case "Home":
        e.preventDefault();
        moveTo(0);
        return;
      case "End":
        e.preventDefault();
        moveTo(count - 1);
        return;
      case "ArrowDown":
      case "Enter":
      case " ":
        e.preventDefault();
        openMenu(index, "first");
        return;
      case "ArrowUp":
        e.preventDefault();
        openMenu(index, "last");
        return;
      case "Escape":
        if (openIndex !== null) {
          e.preventDefault();
          closeMenu("escape");
        }
        return;
      default:
        return;
    }
  };

  const bar = rs(["rs-menubar", className], styles.bar);
  const wrap = rs(["rs-menubar-wrap"], styles.wrap);
  const menu = rs(["rs-menu"], menuStyles.menu, menuStyles.menuOverlay);
  const panel = rs(["rs-menubar-panel"], styles.panel);
  return (
    <div
      ref={setRootRef}
      role="menubar"
      {...props}
      className={bar.className}
      style={{ ...bar.style, ...style }}
      onKeyDown={onBarKeyDown}
    >
      {menus.map((entry, index) => {
        const triggerId = `${idBase}-trigger-${index}`;
        const menuId = `${idBase}-menu-${index}`;
        const isOpen = openIndex === index;
        const trigger = rs(["rs-menubar-trigger", isOpen && "rs-menubar-trigger-open"], styles.trigger, isOpen && styles.open);
        return (
          <div key={index} className={wrap.className} style={wrap.style}>
            <button
              ref={(el) => {
                triggerRefs.current[index] = el;
              }}
              id={triggerId}
              type="button"
              role="menuitem"
              className={trigger.className}
              style={trigger.style}
              tabIndex={focusIndex === index ? 0 : -1}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls={isOpen ? menuId : undefined}
              onFocus={() => setFocusIndex(index)}
              onClick={() => (isOpen ? closeMenu("select") : openMenu(index))}
              onPointerEnter={() => {
                if (openIndex !== null && openIndex !== index) openMenu(index);
              }}
            >
              {entry.label}
            </button>
            {isOpen && (
              <MenuPanel
                id={menuId}
                items={entry.items}
                labelledBy={triggerId}
                initial={initial}
                className={`${menu.className} ${panel.className}`}
                panelRef={panelRef}
                style={{ ...menu.style, ...panel.style, ...placement }}
                onClose={closeMenu}
                onHorizontal={(dir) => moveTo(index + dir)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});
