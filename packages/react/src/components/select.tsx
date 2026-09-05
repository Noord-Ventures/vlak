"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useOverlayPosition } from "../use-overlay-position";
import { Icon } from "./icon";
import { menuStyles, typeAheadIndex } from "./dropdown-menu";

const styles = stylex.create({
  root: {
    position: "relative",
    display: "inline-block",
    minWidth: "11.25rem",
    backgroundColor: vlak.paper,
  },
  list: {
    maxHeight: "17.5rem",
    overflowY: "auto",
  },
});

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  /** Plain text for type-ahead and filtering when `label` is not a string. */
  searchText?: string;
}

/** Text an option answers to: `searchText`, a string label, else the value. */
export function optionText(option: SelectOption): string {
  if (option.searchText) return option.searchText;
  return typeof option.label === "string" ? option.label : option.value;
}

export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: React.ReactNode;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

const PAGE = 10;

/**
 * Select-only combobox: the trigger holds focus and points at the active
 * option with aria-activedescendant; the listbox overlays.
 */
export const Select = React.forwardRef<HTMLDivElement, SelectProps>(function Select({
  options,
  value,
  defaultValue,
  placeholder = "Select…",
  onValueChange,
  disabled,
  className,
  style,
  onKeyDown,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}: SelectProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const idBase = React.useId();
  const triggerId = `${idBase}-trigger`;
  const listboxId = `${idBase}-listbox`;
  const optionId = (index: number) => `${idBase}-opt-${index}`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const setRootRef = useMergedRefs(rootRef, ref);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const activeRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const placement = useOverlayPosition(open, panelRef, triggerRef);
  const [inner, setInner] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;
  const selectedIndex = options.findIndex((o) => o.value === current);
  const [activeIndex, setActiveIndex] = React.useState(Math.max(0, selectedIndex));
  const typed = React.useRef({ buffer: "", at: 0 });
  const typedTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* Resync the highlight whenever the value changes underneath. */
  React.useEffect(() => {
    setActiveIndex(Math.max(0, selectedIndex));
  }, [selectedIndex]);

  React.useEffect(() => () => clearTimeout(typedTimer.current), []);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  React.useEffect(() => {
    if (open) activeRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex]);

  const openAt = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(options.length - 1, index)));
    setOpen(true);
  };

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const select = (next: string) => {
    if (!isControlled) setInner(next);
    onValueChange?.(next);
    close();
  };

  const typeAhead = (key: string, from: number): number => {
    const now = Date.now();
    const buffer = now - typed.current.at < 500 ? typed.current.buffer + key : key;
    typed.current = { buffer, at: now };
    clearTimeout(typedTimer.current);
    typedTimer.current = setTimeout(() => {
      typed.current = { buffer: "", at: 0 };
    }, 500);
    return typeAheadIndex(options.map(optionText), from, buffer);
  };

  const onRootKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled || options.length === 0) return;
    const last = options.length - 1;
    const printable = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
    const typing = typed.current.buffer.length > 0 && Date.now() - typed.current.at < 500;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openAt(selectedIndex);
      } else if (e.key === "Home") {
        e.preventDefault();
        openAt(0);
      } else if (e.key === "End") {
        e.preventDefault();
        openAt(last);
      } else if (printable && e.key !== " ") {
        e.preventDefault();
        const match = typeAhead(e.key, selectedIndex);
        openAt(match >= 0 ? match : selectedIndex);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(last, i + 1));
        return;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        return;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        return;
      case "End":
        e.preventDefault();
        setActiveIndex(last);
        return;
      case "PageUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - PAGE));
        return;
      case "PageDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(last, i + PAGE));
        return;
      case "Escape":
        e.preventDefault();
        close();
        return;
      case "Tab":
        close(false);
        return;
      case "Enter":
      case " ": {
        if (e.key === " " && typing) break;
        e.preventDefault();
        const active = options[activeIndex];
        if (active) select(active.value);
        return;
      }
      default:
        break;
    }
    if (printable) {
      e.preventDefault();
      const match = typeAhead(e.key, activeIndex);
      if (match >= 0) setActiveIndex(match);
    }
  };

  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const root = rs(["rs-select", className], menuStyles.select, styles.root);
  const trigger = rs(["rs-dropdown"], menuStyles.dropdown);
  const menu = rs(["rs-menu", "rs-select-list"], menuStyles.menu, menuStyles.menuOverlay, styles.list);

  return (
    <div
      ref={setRootRef}
      className={root.className}
      style={{ ...root.style, ...style }}
      onKeyDown={onRootKeyDown}
      {...props}
    >
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        className={trigger.className}
        style={trigger.style}
        aria-label={ariaLabel}
        /* A combobox is not named by its content. Without a label prop the
           trigger names itself, so the current value is at least announced. */
        aria-labelledby={ariaLabelledby ?? (ariaLabel ? undefined : triggerId)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && options[activeIndex] ? optionId(activeIndex) : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openAt(selectedIndex))}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <Icon name="chevron-right" rotate={90} />
      </button>
      {open && (
        <div
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={ariaLabelledby ?? triggerId}
          className={menu.className}
          ref={panelRef}
          style={{ ...menu.style, ...placement }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {options.map((option, index) => {
            const active = index === activeIndex;
            const row = rs(
              ["rs-menu-item", active && "rs-menu-item-active"],
              menuStyles.item,
              active && menuStyles.itemActive,
            );
            return (
              <div
                key={option.value}
                id={optionId(index)}
                ref={active ? activeRef : undefined}
                role="option"
                tabIndex={-1}
                aria-selected={option.value === current}
                className={row.className}
                style={row.style}
                onPointerEnter={() => setActiveIndex(index)}
                onClick={() => select(option.value)}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
