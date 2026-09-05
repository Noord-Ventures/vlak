"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useOverlayPosition } from "../use-overlay-position";
import { Calendar } from "./calendar";
import { Icon } from "./icon";
import { menuStyles } from "./dropdown-menu";

const styles = stylex.create({
  calMenu: {
    insetInlineEnd: "auto",
    padding: "0.75rem",
    backgroundColor: vlak.paper,
  },
});

export interface DatePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date) => void;
  /** @deprecated Use `onValueChange`. */
  onChange?: (date: Date) => void;
  placeholder?: string;
  format?: (date: Date) => string;
  disabled?: boolean;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  locale?: string;
  /** Accessible name of the calendar dialog. */
  dialogLabel?: string;
}

const defaultDateFormat = (d: Date) =>
  d.toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" });

/**
 * Hairline trigger that opens a calendar in a non-modal dialog. Focus
 * moves to the selected (or today's) day; Escape, Tab out, and a click
 * outside close it; focus returns to the trigger.
 */
export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker({
  value,
  defaultValue,
  onValueChange,
  onChange,
  placeholder = "Pick a date",
  format = defaultDateFormat,
  disabled,
  min,
  max,
  isDateDisabled,
  locale,
  dialogLabel = "Choose a date",
  className,
  style,
  onKeyDown,
  onBlur,
  ...props
}: DatePickerProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const idBase = React.useId();
  const dialogId = `${idBase}-dialog`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const setRootRef = useMergedRefs(rootRef, ref);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const placement = useOverlayPosition(open, panelRef, triggerRef);
  const [inner, setInner] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const choose = (d: Date) => {
    if (!isControlled) setInner(d);
    onValueChange?.(d);
    onChange?.(d);
    close(true);
  };

  const root = rs(["rs-select", className], menuStyles.select);
  const trigger = rs(["rs-dropdown"], menuStyles.dropdown);
  const menu = rs(["rs-menu", "rs-date-picker-cal-menu"], menuStyles.menu, menuStyles.menuOverlay, menuStyles.menuCal, styles.calMenu);

  return (
    <div
      ref={setRootRef}
      className={root.className}
      style={{ ...root.style, ...style }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === "Escape" && open) {
          e.preventDefault();
          close(true);
        } else if (e.key === "ArrowDown" && !open && e.target === triggerRef.current) {
          e.preventDefault();
          setOpen(true);
        }
      }}
      onBlur={(e) => {
        onBlur?.(e);
        const to = e.relatedTarget as Node | null;
        if (open && to && !rootRef.current?.contains(to)) setOpen(false);
      }}
      {...props}
    >
      <button
        ref={triggerRef}
        type="button"
        className={trigger.className}
        style={trigger.style}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        disabled={disabled}
        onClick={() => (open ? close(true) : setOpen(true))}
      >
        <span>{current ? format(current) : placeholder}</span>
        <Icon name="calendar" size={16} />
      </button>
      {open && (
        <div ref={panelRef} id={dialogId} role="dialog" aria-label={dialogLabel} className={menu.className} style={{ ...menu.style, ...placement }}>
          <Calendar autoFocus={placement.visibility === "visible"} value={current} onValueChange={choose} min={min} max={max} isDateDisabled={isDateDisabled} locale={locale} />
        </div>
      )}
    </div>
  );
});
