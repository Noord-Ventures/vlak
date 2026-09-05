"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useOverlayPosition } from "../use-overlay-position";

import { menuStyles } from "./dropdown-menu";
import { optionText, type SelectOption } from "./select";

export interface ComboboxProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyLabel?: React.ReactNode;
  disabled?: boolean;
}

const styles = stylex.create({
  root: {
    position: "relative",
    display: {
      default: "inline-block",
      [mq.phone]: "block",
    },
    minWidth: {
      default: "12.5rem",
      [mq.phone]: 0,
    },
    width: {
      default: null,
      [mq.phone]: "100%",
    },
  },
  empty: {
    padding: {
      default: "10px 12px",
      [mq.phone]: "0.875rem",
    },
    fontSize: {
      default: "0.8125rem",
      [mq.phone]: "0.9375rem",
    },
    letterSpacing: "-0.01em",
    color: vlak.gray,
  },
});

const PAGE = 10;

/**
 * Editable combobox: the input holds focus, filters on typed text, and
 * points at the active option with aria-activedescendant.
 */
export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Search…",
  emptyLabel = "Nothing found.",
  disabled,
  className,
  style,
  id,
  onBlur,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}: ComboboxProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const idBase = React.useId();
  const inputId = id ?? `${idBase}-input`;
  const listboxId = `${idBase}-listbox`;
  const optionId = (index: number) => `${idBase}-opt-${index}`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const setRootRef = useMergedRefs(rootRef, ref);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const activeRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const placement = useOverlayPosition(open, panelRef, inputRef);
  const [inner, setInner] = React.useState(defaultValue);
  const [searchValue, setSearchValue] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;
  const selected = options.find((o) => o.value === current);
  const needle = searchValue.trim().toLowerCase();
  const matches = needle ? options.filter((o) => optionText(o).toLowerCase().includes(needle)) : options;
  const hasList = open && matches.length > 0;

  /* Keep the highlight on a real row as the filter shrinks the list. */
  React.useEffect(() => {
    setActiveIndex((i) => Math.max(0, Math.min(matches.length - 1, i)));
  }, [matches.length]);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  React.useEffect(() => {
    if (hasList) activeRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [hasList, activeIndex]);

  const openList = (at: "selected" | "last" = "selected") => {
    setSearchValue("");
    const selectedIndex = options.findIndex((o) => o.value === current);
    setActiveIndex(at === "last" ? Math.max(0, options.length - 1) : Math.max(0, selectedIndex));
    setOpen(true);
  };

  const pick = (option: SelectOption) => {
    if (!isControlled) setInner(option.value);
    onValueChange?.(option.value);
    setSearchValue("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const last = matches.length - 1;
    if (!open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        openList();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        openList("last");
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
        setActiveIndex(Math.max(0, last));
        return;
      case "PageUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - PAGE));
        return;
      case "PageDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(Math.max(0, last), i + PAGE));
        return;
      case "Enter": {
        const match = matches[activeIndex];
        if (match) {
          e.preventDefault();
          pick(match);
        }
        return;
      }
      case "Escape":
        e.preventDefault();
        setSearchValue("");
        setOpen(false);
        return;
      case "Tab":
        setOpen(false);
        return;
      default:
        return;
    }
  };

  const root = rs(["rs-combobox", className], styles.root);
  const menu = rs(["rs-menu"], menuStyles.menu, menuStyles.menuCombobox);
  const empty = rs(["rs-combobox-empty"], styles.empty);

  return (
    <div
      ref={setRootRef}
      className={root.className}
      style={{ ...root.style, ...style }}
      onBlur={(e) => {
        onBlur?.(e);
        const to = e.relatedTarget as Node | null;
        if (open && to && !rootRef.current?.contains(to)) setOpen(false);
      }}
      {...props}
    >
      <input
        ref={inputRef}
        id={inputId}
        className="rs-input rs-input-full"
        type="text"
        role="combobox"
        autoComplete="off"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-expanded={open}
        aria-controls={hasList ? listboxId : undefined}
        aria-activedescendant={hasList && matches[activeIndex] ? optionId(activeIndex) : undefined}
        aria-autocomplete="list"
        disabled={disabled}
        placeholder={placeholder}
        value={open ? searchValue : selected ? optionText(selected) : ""}
        onClick={() => {
          if (!open) openList();
        }}
        onChange={(e) => {
          setSearchValue(e.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div
          id={hasList ? listboxId : undefined}
          role={hasList ? "listbox" : undefined}
          aria-labelledby={hasList ? (ariaLabelledby ?? inputId) : undefined}
          tabIndex={-1}
          className={menu.className}
          ref={panelRef}
          style={{ ...menu.style, ...placement }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {matches.length === 0 && (
            <div className={empty.className} style={empty.style}>
              {emptyLabel}
            </div>
          )}
          {matches.map((option, index) => {
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
                onClick={() => pick(option)}
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
