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
    minWidth: "var(--rs-select-min-width, 11.25rem)",
    backgroundColor: vlak.paper,
  },
  // The shared semantic base reads this too, regardless of stylesheet order.
  fluid: { display: "block", width: "100%", minWidth: 0, "--rs-select-min-width": "0px" },
  native: { position: "absolute", width: 1, height: 1, margin: -1, padding: 0, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap", borderWidth: 0 },
  feedback: { margin: "0.5rem 0 0", fontSize: "0.75rem", color: vlak.gray, lineHeight: 1.45 },
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
  /** Visible but unavailable options are skipped by keyboard navigation. */
  disabled?: boolean;
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
  /** Fill a compound field without imposing a minimum column width. */
  fullWidth?: boolean;
  name?: string;
  form?: string;
  required?: boolean;
  readOnly?: boolean;
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
  fullWidth = false,
  name, form, required = false, readOnly = false,
  className,
  style,
  onKeyDown,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  ...props
}: SelectProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const idBase = React.useId();
  const triggerId = `${idBase}-trigger`;
  const listboxId = `${idBase}-listbox`;
  const optionId = (index: number) => `${idBase}-opt-${index}`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const setRootRef = useMergedRefs(rootRef, ref);
  const nativeRef = React.useRef<HTMLSelectElement>(null);
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [showRequiredError, setShowRequiredError] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const activeRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const placement = useOverlayPosition(open, panelRef, triggerRef);
  const [inner, setInner] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;
  const selectedIndex = options.findIndex((o) => o.value === current);
  const enabledIndices = options.flatMap((option, index) => option.disabled ? [] : [index]);
  const available = enabledIndices.length;
  const resetState = React.useRef({ isControlled, defaultValue });
  resetState.current = { isControlled, defaultValue };
  const [activeIndex, setActiveIndex] = React.useState(Math.max(0, selectedIndex));
  const typed = React.useRef({ buffer: "", at: 0 });
  const typedTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the form attribute changes the native control's owner after commit.
  React.useEffect(() => {
    const owner = nativeRef.current?.form;
    if (!owner) return;
    const reset = (event: Event) => queueMicrotask(() => {
      if (event.defaultPrevented) return;
      if (!resetState.current.isControlled) setInner(resetState.current.defaultValue);
      setOpen(false); setShowRequiredError(false); refresh();
    });
    owner.addEventListener("reset", reset);
    return () => owner.removeEventListener("reset", reset);
  }, [form]);
  React.useEffect(() => { if (disabled || readOnly || !available) setOpen(false); }, [disabled, readOnly, available]);

  // A fieldset can disable the native controls without changing our props.
  // Follow that state while the custom popup is open, including the native
  // first-legend exception, and guard events before the observer runs.
  React.useEffect(() => {
    if (!open) return;
    const native = nativeRef.current;
    if (!native) return;
    const syncDisabled = () => { if (native.matches(":disabled")) setOpen(false); };
    const observer = new MutationObserver(syncDisabled);
    for (let ancestor = native.parentElement; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.tagName === "FIELDSET") observer.observe(ancestor, { attributes: true, attributeFilter: ["disabled"] });
    }
    syncDisabled();
    return () => observer.disconnect();
  }, [open]);

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
    if (disabled || readOnly || !available || nativeRef.current?.matches(":disabled")) return;
    setActiveIndex(enabledIndices.find(candidate => candidate >= index) ?? enabledIndices[available - 1]!);
    setOpen(true);
  };

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const select = (next: string) => {
    if (disabled || readOnly || nativeRef.current?.matches(":disabled") || options.find(option => option.value === next)?.disabled) return;
    setShowRequiredError(false);
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
    const match = typeAheadIndex(enabledIndices.map(index => optionText(options[index]!)), enabledIndices.indexOf(from), buffer);
    return match < 0 ? -1 : enabledIndices[match]!;
  };

  const onRootKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled || readOnly || available === 0 || nativeRef.current?.matches(":disabled")) return;
    const first = enabledIndices[0]!;
    const last = enabledIndices[available - 1]!;
    const printable = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
    const typing = typed.current.buffer.length > 0 && Date.now() - typed.current.at < 500;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openAt(selectedIndex);
      } else if (e.key === "Home") {
        e.preventDefault();
        openAt(first);
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
        setActiveIndex((i) => enabledIndices.find(index => index > i) ?? i);
        return;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => [...enabledIndices].reverse().find(index => index < i) ?? i);
        return;
      case "Home":
        e.preventDefault();
        setActiveIndex(first);
        return;
      case "End":
        e.preventDefault();
        setActiveIndex(last);
        return;
      case "PageUp":
        e.preventDefault();
        setActiveIndex((i) => enabledIndices[Math.max(0, enabledIndices.indexOf(i) - PAGE)]!);
        return;
      case "PageDown":
        e.preventDefault();
        setActiveIndex((i) => enabledIndices[Math.min(available - 1, enabledIndices.indexOf(i) + PAGE)]!);
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
  const root = rs(["rs-select", className, fullWidth && "rs-select-fluid"], menuStyles.select, styles.root, fullWidth && styles.fluid);
  const native = rs(["rs-select-native"], styles.native);
  const feedback = rs(["rs-select-feedback"], styles.feedback);
  const requiredError = showRequiredError && required && !selected?.value && !readOnly;
  const describedBy = [ariaDescribedBy, requiredError && `${idBase}-error`].filter(Boolean).join(" ") || undefined;
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
        aria-describedby={describedBy}
        aria-invalid={ariaInvalid ?? (requiredError || undefined)}
        aria-required={ariaRequired ?? (required || undefined)}
        aria-readonly={readOnly || undefined}
        disabled={disabled || readOnly || !available}
        onClick={() => (open ? close() : openAt(selectedIndex))}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <Icon name="chevron-right" rotate={90} />
      </button>
      <select {...native} ref={nativeRef} aria-hidden="true" tabIndex={-1} name={readOnly ? undefined : name} form={form} required={required} disabled={disabled || readOnly} value={selected ? selected.value : ""} onChange={event => select(event.currentTarget.value)} onInvalid={event => { event.preventDefault(); setShowRequiredError(true); triggerRef.current?.focus(); }}>
        {!options.some(option => option.value === "") && <option value="" label="Choose an option" />}
        {options.map(option => <option key={option.value} value={option.value} disabled={option.disabled} label={optionText(option)} />)}
      </select>
      {readOnly && <input type="hidden" name={name} form={form} disabled={disabled} value={selected?.value ?? ""} />}
      {requiredError && <p {...feedback} id={`${idBase}-error`}>Choose an option</p>}
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
              ["rs-menu-item", active && "rs-menu-item-active", option.disabled && "rs-menu-item-disabled"],
              menuStyles.item,
              active && menuStyles.itemActive,
              option.disabled && menuStyles.itemDisabled,
            );
            return (
              <div
                key={option.value}
                id={optionId(index)}
                ref={active ? activeRef : undefined}
                role="option"
                tabIndex={-1}
                aria-selected={option.value === current}
                aria-disabled={option.disabled || undefined}
                className={row.className}
                style={row.style}
                onPointerEnter={() => { if (!option.disabled) setActiveIndex(index); }}
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
