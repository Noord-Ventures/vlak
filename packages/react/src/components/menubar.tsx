"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useOverlayPosition } from "../use-overlay-position";
import { Icon } from "./icon";
import { MenuPanel, menuStyles, type DropdownMenuItem, type MenuCloseReason } from "./dropdown-menu";

export interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {
  menus: Array<{ label: React.ReactNode; items: DropdownMenuItem[] }>;
}

const styles = stylex.create({
  bar: {
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
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
    padding: {
      default: 2,
      [mq.phone]: 0,
    },
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
  const openTrigger = React.useRef<HTMLButtonElement | null>(null);
  openTrigger.current = openIndex === null ? null : triggerRefs.current[openIndex] ?? null;
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
  const wrap = rs(["rs-select"], menuStyles.select);
  const trigger = rs(["rs-dropdown"], menuStyles.dropdown);
  const menu = rs(["rs-menu"], menuStyles.menu, menuStyles.menuOverlay);
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
              <span>{entry.label}</span>
              <Icon name="chevron-right" rotate={90} />
            </button>
            {isOpen && (
              <MenuPanel
                id={menuId}
                items={entry.items}
                labelledBy={triggerId}
                initial={initial}
                className={menu.className}
                panelRef={panelRef}
                style={{ ...menu.style, ...placement }}
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
