"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon } from "./icon";

export interface CalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue"> {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date) => void;
  /** @deprecated Use `onValueChange`. */
  onSelect?: (date: Date) => void;
  defaultMonth?: Date;
  /** 0 = Sunday, 1 = Monday. */
  weekStart?: 0 | 1;
  /** Keep six week rows. False shows only the four to six rows this month needs. */
  fixedWeeks?: boolean;
  /** Move focus to the roving day on mount (a date picker opening). */
  autoFocus?: boolean;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  isDateDisabled?: (date: Date) => boolean;
  locale?: string;
}

const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const DOW_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function sameDay(a: Date | undefined, b: Date): boolean {
  return (
    !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}
const sameMonth = (a: Date | undefined, b: Date) =>
  !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
/** Numeric Date constructors reinterpret years 0–99 as 1900–1999. */
function civilDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month, day);
  return date;
}
const startOfMonth = (d: Date) => civilDate(d.getFullYear(), d.getMonth(), 1);
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const addDays = (d: Date, n: number) => civilDate(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** Same day-of-month `n` months on, clamped to the target month's length. */
function addMonths(d: Date, n: number): Date {
  const first = civilDate(d.getFullYear(), d.getMonth() + n, 1);
  const last = civilDate(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return civilDate(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last));
}
const longDate = (d: Date, locale = "en") =>
  d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const styles = stylex.create({
  cal: {
    width: "19.25rem",
    maxWidth: "100%",
    overflowX: "auto",
  },
  head: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: vlak.hit,
    marginBottom: "0.25rem",
  },
  title: {
    fontSize: "0.875rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    lineHeight: 20 / 14,
    color: vlak.ink,
  },
  nav: {
    display: "flex",
    gap: 0,
    flexShrink: 0,
    marginInlineStart: "auto",
  },
  page: {
    boxSizing: "border-box",
    width: vlak.hit,
    height: vlak.hit,
    minWidth: vlak.hit,
    minHeight: vlak.hit,
    borderRadius: vlak.radiusSm,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8125rem",
    color: vlak.gray,
    borderWidth: 0,
    borderStyle: "none",
    padding: 0,
    backgroundColor: {
      default: "transparent",
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: vlak.controlFill, [mq.forcedColors]: "ButtonFace" } },
    },
    fontFamily: "inherit",
    cursor: "pointer",
    opacity: { default: 1, ":disabled": 0.4 },
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
      ":focus-visible": { default: vlak.ink, [mq.forcedColors]: "CanvasText" },
    },
    outlineOffset: {
      default: null,
      ":focus-visible": -2,
    },
  },
  icon: {
    display: "block",
    color: "inherit",
  },
  grid: {
    width: "100%",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(44px, 1fr))",
  },
  dow: {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: vlak.gray,
    textAlign: "center",
    lineHeight: 20 / 12,
    paddingTop: "0.25rem",
    paddingBottom: "0.25rem",
    paddingInline: 0,
  },
  day: {
    opacity: { default: 1, '[aria-disabled="true"]': 0.4 },
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    boxSizing: "border-box",
    width: "100%",
    height: vlak.hit,
    minWidth: "44px",
    minHeight: vlak.hit,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    color: vlak.ink,
    backgroundColor: {
      default: "transparent",
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: vlak.controlFill, [mq.forcedColors]: "ButtonFace" } },
    },
    borderWidth: 0,
    borderStyle: "none",
    borderRadius: vlak.radiusSm,
    cursor: "pointer",
    fontFamily: "inherit",
    padding: 0,
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
      ":focus-visible": { default: vlak.ink, [mq.forcedColors]: "CanvasText" },
    },
    outlineOffset: {
      default: null,
      ":focus-visible": -2,
    },
  },
  /* Gray at full opacity stays above 4.5:1 on paper and on the dark ground. */
  out: {
    color: vlak.gray,
  },
  today: {
    boxShadow: `inset 0 0 0 1px ${vlak.divider}`,
  },
  selected: {
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    backgroundColor: {
      default: vlak.ink,
      ":hover:not(:disabled):not([aria-disabled='true'])": { default: null, [mq.hover]: { default: vlak.ink, [mq.forcedColors]: "Highlight" } },
      [mq.forcedColors]: "Highlight",
    },
    borderRadius: vlak.radiusSm,
    color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" },
    fontWeight: 600,
    forcedColorAdjust: "none",
    boxShadow: "none",
    outlineColor: {
      default: null,
      ":focus-visible": { default: vlak.paper, [mq.forcedColors]: "HighlightText" },
    },
    outlineOffset: { default: null, ":focus-visible": -4 },
  },
});

/**
 * Month grid with one roving tab stop. Arrows move by day and week,
 * Home/End to the week's ends, PageUp/PageDown by month (Shift: year).
 * Selected is ink; today is a hairline.
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(function Calendar({
  value,
  defaultValue,
  onValueChange,
  onSelect,
  defaultMonth,
  weekStart = 1,
  fixedWeeks = true,
  autoFocus,
  min,
  max,
  disabled = false,
  isDateDisabled,
  locale = "en",
  className,
  style,
  onKeyDown,
  ...props
}, ref) {
  const idBase = React.useId();
  const titleId = `${idBase}-title`;
  const isControlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue);
  const selectedDate = isControlled ? value : inner;
  const today = new Date();
  const dateOnly = (d: Date) => civilDate(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const unavailable = (d: Date) => disabled || (!!min && dateOnly(d) < dateOnly(min)) || (!!max && dateOnly(d) > dateOnly(max)) || !!isDateDisabled?.(d);

  const [month, setMonth] = React.useState(() => startOfMonth(selectedDate ?? defaultMonth ?? today));
  const [focusDate, setFocusDate] = React.useState(
    () => selectedDate ?? (sameMonth(today, month) ? today : month),
  );
  const cellRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const focusPending = React.useRef(false);

  /* Follow the value when it changes underneath: show its month, rove to it. */
  const valueKey = selectedDate ? dayKey(selectedDate) : "";
  const seenValueKey = React.useRef(valueKey);
  React.useEffect(() => {
    if (seenValueKey.current === valueKey) return;
    seenValueKey.current = valueKey;
    if (selectedDate) {
      setMonth(startOfMonth(selectedDate));
      setFocusDate(selectedDate);
    }
  }, [valueKey, selectedDate]);

  /* The roving cell is always inside the shown month. */
  const roving = sameMonth(focusDate, month)
    ? focusDate
    : sameMonth(selectedDate, month)
      ? selectedDate!
      : sameMonth(today, month)
        ? today
        : month;

  React.useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    cellRefs.current.get(dayKey(roving))?.focus();
  });

  /* A picker requests focus after its measured overlay becomes visible. */
  const rovingOnMount = React.useRef(roving);
  React.useEffect(() => {
    if (autoFocus) cellRefs.current.get(dayKey(rovingOnMount.current))?.focus();
  }, [autoFocus]);

  const first = civilDate(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() - weekStart + 7) % 7;
  const start = civilDate(month.getFullYear(), month.getMonth(), 1 - lead);
  const monthDays = civilDate(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const rowCount = fixedWeeks ? 6 : Math.ceil((lead + monthDays) / 7);
  const weeks = Array.from({ length: rowCount }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)),
  );
  const title = month.toLocaleDateString(locale, { month: "long", year: "numeric" });
  const weekdayDates = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + weekStart + i));
  const dows = weekdayDates.map((d) => d.toLocaleDateString(locale, { weekday: "narrow" }));
  const dowsLong = weekdayDates.map((d) => d.toLocaleDateString(locale, { weekday: "long" }));

  const shift = (delta: number) => {
    const next = addMonths(month, delta);
    setMonth(startOfMonth(next));
    setFocusDate(addMonths(roving, delta));
  };

  const moveFocus = (next: Date) => {
    if (min && dateOnly(next) < dateOnly(min)) next = min;
    if (max && dateOnly(next) > dateOnly(max)) next = max;
    setFocusDate(next);
    if (!sameMonth(next, month)) setMonth(startOfMonth(next));
    focusPending.current = true;
  };

  const choose = (d: Date) => {
    if (unavailable(d)) return;
    if (!isControlled) setInner(d);
    onValueChange?.(d);
    onSelect?.(d);
    setFocusDate(d);
    if (!sameMonth(d, month)) setMonth(startOfMonth(d));
  };

  const onGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const from = roving;
    const dow = (from.getDay() - weekStart + 7) % 7;
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(addDays(from, -1));
        return;
      case "ArrowRight":
        e.preventDefault();
        moveFocus(addDays(from, 1));
        return;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(addDays(from, -7));
        return;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(addDays(from, 7));
        return;
      case "Home":
        e.preventDefault();
        moveFocus(addDays(from, -dow));
        return;
      case "End":
        e.preventDefault();
        moveFocus(addDays(from, 6 - dow));
        return;
      case "PageUp":
        e.preventDefault();
        moveFocus(addMonths(from, e.shiftKey ? -12 : -1));
        return;
      case "PageDown":
        e.preventDefault();
        moveFocus(addMonths(from, e.shiftKey ? 12 : 1));
        return;
      default:
        return;
    }
  };

  const cal = rs(["rs-cal", className], styles.cal);
  const head = rs(["rs-cal-head"], styles.head);
  const titleSx = rs(["rs-cal-title"], styles.title);
  const nav = rs(["rs-cal-nav"], styles.nav);
  const page = rs(["rs-page", "rs-cal-page"], styles.page);
  const icon = rs(["rs-cal-icon"], styles.icon);
  const grid = rs(["rs-cal-grid"], styles.grid);
  const row = rs(["rs-cal-row"], styles.row);
  const dow = rs(["rs-cal-dow"], styles.dow);

  return (
    <div ref={ref} {...props} className={cal.className} style={{ ...cal.style, ...style }}>
      <div className={head.className} style={head.style}>
        <span id={titleId} className={titleSx.className} style={titleSx.style} aria-live="polite">
          {title}
        </span>
        <span className={nav.className} style={nav.style}>
          <button type="button" className={page.className} style={page.style} disabled={disabled || (!!min && startOfMonth(month) <= startOfMonth(min))} aria-label="Previous month" onClick={() => shift(-1)}>
            <Icon name="chevron-left" size={16} className={icon.className} style={icon.style} />
          </button>
          <button type="button" className={page.className} style={page.style} disabled={disabled || (!!max && startOfMonth(month) >= startOfMonth(max))} aria-label="Next month" onClick={() => shift(1)}>
            <Icon name="chevron-right" size={16} className={icon.className} style={icon.style} />
          </button>
        </span>
      </div>
      <div className={grid.className} style={grid.style} role="grid" aria-labelledby={titleId} onKeyDown={onGridKeyDown}>
        <div className={row.className} style={row.style} role="row">
          {dows.map((d, i) => (
            <span key={dowsLong[i]} className={dow.className} style={dow.style} role="columnheader" aria-label={dowsLong[i]}>
              {d}
            </span>
          ))}
        </div>
        {weeks.map((week, w) => (
          <div key={w} className={row.className} style={row.style} role="row">
            {week.map((d) => {
              const out = d.getMonth() !== month.getMonth();
              const selected = sameDay(selectedDate, d);
              const isToday = sameDay(today, d);
              const key = dayKey(d);
              const day = rs(
                ["rs-cal-day", out && "rs-cal-day-out", isToday && "rs-cal-day-today", selected && "rs-cal-day-selected"],
                styles.day,
                out && styles.out,
                isToday && styles.today,
                selected && styles.selected,
              );
              return (
                <button
                  key={key}
                  ref={(el) => {
                    if (el) cellRefs.current.set(key, el);
                    else cellRefs.current.delete(key);
                  }}
                  type="button"
                  role="gridcell"
                  tabIndex={!disabled && !out && sameDay(roving, d) ? 0 : -1}
                  className={day.className}
                  style={day.style}
                  aria-selected={selected}
                  aria-disabled={unavailable(d) || undefined}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={longDate(d, locale)}
                  onClick={() => choose(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});
