"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { cx } from "../cx";
import { useMergedRefs } from "../merge-refs";
import { useOverlayPosition } from "../use-overlay-position";
import { Calendar } from "./calendar";
import { Input, type InputProps } from "./input";
import { Button } from "./button";
import { Icon } from "./icon";

export interface CalendarPopoverProps extends Omit<InputProps, "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "plain" | "grouped"> {
  type?: "date" | "datetime-local";
  /** Local canonical value. Typed partial drafts are emitted too. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  min?: string;
  max?: string;
  weekStart?: 0 | 1;
  locale?: string;
  triggerLabel?: string;
  dialogLabel?: string;
}

const styles = stylex.create({
  root: { width: "100%", minWidth: 0, display: "flex", flexDirection: "column", gap: "0.5rem" },
  label: { fontSize: { default: "0.75rem", [mq.phone]: vlak.controlLabel }, fontWeight: 600, color: vlak.gray, lineHeight: "16px" },
  control: {
    display: "flex", alignItems: "stretch", minWidth: 0, minHeight: vlak.hit, boxSizing: "border-box", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper,
    outlineWidth: { default: 0, ":focus-within": 2 }, outlineStyle: { default: "none", ":focus-within": "solid" }, outlineColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, outlineOffset: 2,
  },
  input: { minWidth: 0, width: "100%", flex: "1 1 0", height: vlak.hit, minHeight: vlak.hit, fontVariantNumeric: "tabular-nums", outlineOffset: -2 },
  trigger: { flexShrink: 0, width: vlak.hit, height: vlak.hit, minWidth: vlak.hit, minHeight: vlak.hit, padding: 0, borderWidth: 0, borderRadius: vlak.radiusSm },
  panel: {
    boxSizing: "border-box", position: "fixed", inset: "auto", margin: 0,
    width: "calc(19.25rem + 26px)", maxWidth: "calc(100vw - 2px)", padding: "clamp(4px, calc((100vw - 312px) / 2), 12px)",
    borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, borderRadius: vlak.radius,
    backgroundColor: vlak.paper, color: vlak.ink, overflow: "auto", overscrollBehavior: "contain",
    boxShadow: { default: "0 8px 24px rgba(0,0,0,0.08)", [mq.forcedColors]: "none" },
    "::backdrop": { backgroundColor: "transparent" },
  },
  grid: { width: "100%" },
  time: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", paddingBlock: "0.75rem", paddingInline: "clamp(4px, calc((100vw - 312px) / 2), 12px)", marginInline: "calc(-1 * clamp(4px, calc((100vw - 312px) / 2), 12px))", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  actions: { display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap", marginTop: "0.5rem", marginInline: "calc(-1 * clamp(4px, calc((100vw - 312px) / 2), 12px))", paddingTop: "0.25rem", paddingInline: "clamp(4px, calc((100vw - 312px) / 2), 12px)", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  action: { width: "auto", minWidth: vlak.hit, minHeight: vlak.hit, paddingInline: "0.5rem", marginInlineEnd: { default: null, ":first-child": "auto" }, borderWidth: 0, backgroundColor: "transparent", fontWeight: 500, outlineOffset: -2 },
  done: { width: "auto", minWidth: vlak.hit, paddingInline: "0.875rem" },
  feedback: { margin: 0, fontSize: { default: "0.75rem", [mq.phone]: "0.875rem" }, color: vlak.gray, lineHeight: 1.45 },
  error: { color: vlak.ink },
});

const pad = (value: number) => String(value).padStart(2, "0");
const dateString = (date: Date) => `${String(date.getFullYear()).padStart(4, "0")}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const canonical = (value: string, type: string) => type === "datetime-local" ? value.replace(" ", "T") : value;
const display = (value: string, type: string) => type === "datetime-local" ? value.replace("T", " ") : value;
function parseDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
  const [year, month, day] = value.split("-").map(Number) as [number, number, number];
  if (year < 1 || year > 9999) return;
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) return date;
}
function valid(value: string, type: string): boolean {
  return type === "date" ? Boolean(parseDate(value)) : /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) && Boolean(parseDate(value.slice(0, 10)));
}
const usable = (element: HTMLElement | null) => Boolean(element?.isConnected && !element.closest("[hidden],[inert],dialog:not([open])") && element.getClientRects().length && getComputedStyle(element).visibility !== "hidden");

/** Editable civil dates with native form validation and a top-layer calendar. */
export const CalendarPopover = React.forwardRef<HTMLInputElement, CalendarPopoverProps>(function CalendarPopover({
  type = "date", value, defaultValue = "", onValueChange, min, max, label, hint, error, feedback, ok,
  weekStart = 1, locale = "en", triggerLabel = "Open calendar", dialogLabel,
  required, disabled, readOnly, name, form, id, className, style, placeholder,
  onKeyDown, onBlur, onInvalid, ...props
}, forwardedRef) {
  const generatedId = React.useId(), inputId = id ?? generatedId, panelId = `${inputId}-calendar`;
  const rootRef = React.useRef<HTMLDivElement>(null), controlRef = React.useRef<HTMLDivElement>(null), inputRef = React.useRef<HTMLInputElement>(null), triggerRef = React.useRef<HTMLButtonElement>(null), panelRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(inputRef, forwardedRef);
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue);
  const current = canonical(controlled ? value : inner, type);
  const [open, setOpen] = React.useState(false), openRef = React.useRef(false);
  const [showError, setShowError] = React.useState(false), [panelError, setPanelError] = React.useState("");
  const [draft, setDraft] = React.useState({ day: "", hours: "09", minutes: "00" });
  const context = React.useRef<HTMLDialogElement | null>(null);
  const minValue = min && valid(min, type) ? min : undefined, maxValue = max && valid(max, type) ? max : undefined;
  const minDay = parseDate(minValue?.slice(0, 10) ?? "0001-01-01"), maxDay = parseDate(maxValue?.slice(0, 10) ?? "9999-12-31");
  const placement = useOverlayPosition(open, panelRef, controlRef, undefined, "bottom", { popover: "auto", edge: 1, matchAnchorWidth: false });

  const issue = (next: string) => {
    if (!next) return required ? "Enter a date." : "";
    if (!valid(next, type)) return type === "date" ? "Enter a valid date as YYYY-MM-DD." : "Enter a valid date and time as YYYY-MM-DD HH:mm.";
    if (minValue && next < minValue) return `Choose ${display(minValue, type)} or later.`;
    if (maxValue && next > maxValue) return `Choose ${display(maxValue, type)} or earlier.`;
    return "";
  };
  const message = issue(current);
  React.useLayoutEffect(() => { inputRef.current?.setCustomValidity(message); }, [message]);
  const sameContext = React.useCallback(() => {
    const owner = rootRef.current;
    const dialog = owner?.closest<HTMLDialogElement>("dialog") ?? null;
    return usable(owner) && dialog === context.current && (!dialog || dialog.open);
  }, []);
  const close = React.useCallback((restore = false) => {
    const canRestore = restore && sameContext() && usable(triggerRef.current);
    openRef.current = false;
    const panel = panelRef.current;
    if (typeof panel?.hidePopover === "function" && panel.matches(":popover-open")) panel.hidePopover();
    setOpen(false); setPanelError("");
    if (canRestore) triggerRef.current?.focus({ preventScroll: true });
  }, [sameContext]);
  const change = (next: string) => { if (!controlled) setInner(next); onValueChange?.(next); };
  const choose = (next: string) => {
    const problem = issue(next);
    if (problem) { setPanelError(problem); return; }
    setShowError(false); change(next); close(true);
  };
  const draftValue = type === "date" ? draft.day : `${draft.day}T${draft.hours.padStart(2, "0")}:${draft.minutes.padStart(2, "0")}`;
  const validClock = /^\d{1,2}$/.test(draft.hours) && Number(draft.hours) <= 23 && /^\d{1,2}$/.test(draft.minutes) && Number(draft.minutes) <= 59;
  const draftIssue = type === "datetime-local" && !validClock ? "Enter hours from 0 to 23 and minutes from 0 to 59." : issue(draftValue);
  const clampTime = (day: string, hours: string, minutes: string) => {
    let next = `${day}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    if (minValue?.slice(0, 10) === day && next < minValue) next = minValue;
    if (maxValue?.slice(0, 10) === day && next > maxValue) next = maxValue;
    return { day, hours: next.slice(11, 13), minutes: next.slice(14, 16) };
  };
  const show = () => {
    if (disabled || readOnly) return;
    context.current = rootRef.current?.closest<HTMLDialogElement>("dialog") ?? null;
    let seed = valid(current, type) ? current : `${dateString(new Date())}${type === "datetime-local" ? "T09:00" : ""}`;
    if (minValue && seed < minValue) seed = minValue;
    if (maxValue && seed > maxValue) seed = maxValue;
    setDraft({ day: seed.slice(0, 10), hours: type === "datetime-local" ? seed.slice(11, 13) : "09", minutes: type === "datetime-local" ? seed.slice(14, 16) : "00" });
    setPanelError(""); openRef.current = true; setOpen(true);
  };
  const selectDay = (day: Date) => {
    const next = dateString(day);
    if (type === "date") choose(next);
    else { setDraft(state => clampTime(next, state.hours, state.minutes)); setPanelError(""); }
  };

  React.useEffect(() => {
    if (!open) return;
    const owner = rootRef.current;
    const onFocus = (event: FocusEvent) => { if (event.target instanceof Node && !owner?.contains(event.target)) close(); };
    const onPointer = (event: PointerEvent) => { if (event.target instanceof Node && !owner?.contains(event.target)) close(); };
    const observer = new MutationObserver(() => { if (!sameContext()) close(); });
    for (let ancestor: HTMLElement | null = owner; ancestor; ancestor = ancestor.parentElement) observer.observe(ancestor, { attributes: true, attributeFilter: ["hidden", "inert", "open", "class", "style"] });
    document.addEventListener("focusin", onFocus);
    document.addEventListener("pointerdown", onPointer, true);
    return () => { observer.disconnect(); document.removeEventListener("focusin", onFocus); document.removeEventListener("pointerdown", onPointer, true); };
  }, [open, close, sameContext]);
  const seen = React.useRef({ current, type, min, max, disabled, readOnly });
  React.useLayoutEffect(() => {
    const before = seen.current;
    seen.current = { current, type, min, max, disabled, readOnly };
    if (openRef.current && (before.current !== current || before.type !== type || before.min !== min || before.max !== max || disabled || readOnly)) close();
  }, [current, type, min, max, disabled, readOnly, close]);
  React.useEffect(() => {
    const reset = (event: Event) => {
      if (event.target !== inputRef.current?.form) return;
      queueMicrotask(() => {
        if (event.defaultPrevented || !inputRef.current?.isConnected) return;
        if (!controlled) setInner(defaultValue);
        setShowError(false); close();
      });
    };
    document.addEventListener("reset", reset, true);
    return () => document.removeEventListener("reset", reset, true);
  }, [controlled, defaultValue, close]);

  const root = rs(["rs-calendar-popover", className], styles.root);
  const lab = rs(["rs-calendar-popover-label"], styles.label);
  const control = rs(["rs-calendar-popover-control"], styles.control);
  const field = rs(["rs-calendar-popover-input"], styles.input);
  const trigger = rs(["rs-calendar-popover-trigger"], styles.trigger);
  const panel = rs(["rs-calendar-popover-panel"], styles.panel);
  const grid = rs(["rs-calendar-popover-grid"], styles.grid);
  const time = rs(["rs-calendar-popover-time"], styles.time);
  const actions = rs(["rs-calendar-popover-actions"], styles.actions);
  const action = rs(["rs-calendar-popover-action"], styles.action);
  const done = rs(["rs-calendar-popover-done"], styles.done);
  const quiet = rs(["rs-calendar-popover-feedback"], styles.feedback);
  const err = rs(["rs-calendar-popover-error"], styles.feedback, styles.error);
  const shownError = error ?? (showError ? message : "");
  const describedBy = cx(props["aria-describedby"], hint != null && `${inputId}-hint`, Boolean(shownError) && `${inputId}-error`) || undefined;
  const today = dateString(new Date());
  const todayDisabled = Boolean(minValue && today < minValue.slice(0, 10) || maxValue && today > maxValue.slice(0, 10));
  return <div ref={rootRef} className={root.className} style={{ ...root.style, ...style }}>
    {label != null && <label htmlFor={inputId} className={lab.className} style={lab.style}>{label}</label>}
    <div ref={controlRef} className={control.className} style={control.style}>
      <Input {...props} ref={mergedRef} id={inputId} plain grouped type="text" value={display(current, type)} required={required} disabled={disabled} readOnly={readOnly} form={form} ok={ok} aria-describedby={describedBy} aria-invalid={shownError ? true : props["aria-invalid"]} placeholder={placeholder ?? (type === "date" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm")} className={field.className} style={field.style}
        onChange={event => { change(canonical(event.target.value, type)); setShowError(false); }}
        onBlur={event => { onBlur?.(event); setShowError(true); }}
        onInvalid={event => { setShowError(true); onInvalid?.(event); }}
        onKeyDown={event => { onKeyDown?.(event); if (event.defaultPrevented) return; if (event.key === "ArrowDown") { event.preventDefault(); show(); } else if (event.key === "Escape" && openRef.current) { event.preventDefault(); event.stopPropagation(); close(true); } }} />
      <Button ref={triggerRef} type="button" variant="ghost" className={trigger.className} style={trigger.style} aria-label={triggerLabel} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? panelId : undefined} disabled={disabled || readOnly}
        onClick={() => openRef.current ? close(true) : show()} onKeyDown={event => { if (event.key === "ArrowDown") { event.preventDefault(); show(); } else if (event.key === "Escape" && openRef.current) { event.preventDefault(); event.stopPropagation(); close(true); } }}><Icon name="calendar" size={16} /></Button>
    </div>
    {name != null && <input type="hidden" name={name} value={current} form={form} disabled={disabled} />}
    {feedback != null && <span className={quiet.className} style={quiet.style}>{feedback}</span>}
    {hint != null && <span id={`${inputId}-hint`} className={quiet.className} style={quiet.style}>{hint}</span>}
    {shownError && <span id={`${inputId}-error`} role="alert" className={err.className} style={err.style}>{shownError}</span>}
    <div ref={panelRef} id={panelId} hidden={!open} popover="auto" role="dialog" aria-label={dialogLabel ?? (type === "date" ? "Choose date" : "Choose date and time")} className={panel.className} style={{ ...panel.style, ...placement }}
      onToggle={event => { if ((event.nativeEvent as ToggleEvent).newState === "closed" && openRef.current) close(); }}
      onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); }
        else if (event.key === "Enter" && event.target instanceof HTMLInputElement) { event.preventDefault(); if (draftIssue) setPanelError(draftIssue); else choose(draftValue); }
      }}>
      {open && <>
        <Calendar fixedWeeks={false} className={grid.className} style={grid.style} value={parseDate(draft.day)} defaultMonth={parseDate(draft.day)} min={minDay} max={maxDay} weekStart={weekStart} locale={locale} autoFocus={placement.visibility === "visible"} onValueChange={selectDay} />
        {type === "datetime-local" && <div className={time.className} style={time.style}>
          <Input label="Hours" type="number" inputMode="numeric" min={0} max={23} step={1} value={draft.hours} onChange={event => { setDraft(state => ({ ...state, hours: event.target.value })); setPanelError(""); }} />
          <Input label="Minutes" type="number" inputMode="numeric" min={0} max={59} step={1} value={draft.minutes} onChange={event => { setDraft(state => ({ ...state, minutes: event.target.value })); setPanelError(""); }} />
        </div>}
        {panelError && <p role="alert" className={err.className} style={err.style}>{panelError}</p>}
        <div className={actions.className} style={actions.style}>
          <Button type="button" variant="ghost" className={action.className} style={action.style} disabled={todayDisabled} onClick={() => selectDay(new Date())}>Today</Button>
          {!required && <Button type="button" variant="ghost" className={action.className} style={action.style} onClick={() => { change(""); setShowError(false); close(true); }}>Clear</Button>}
          {type === "datetime-local" && <Button type="button" className={done.className} style={done.style} onClick={() => { if (draftIssue) setPanelError(draftIssue); else choose(draftValue); }}>Done</Button>}
        </div>
      </>}
    </div>
  </div>;
});
