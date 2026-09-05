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
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** Same day-of-month `n` months on, clamped to the target month's length. */
function addMonths(d: Date, n: number): Date {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last));
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
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: {
      default: "1.625rem",
      [mq.phone]: vlak.hit,
    },
    marginBottom: "0.5rem",
  },
  title: {
    fontSize: {
      default: "0.8125rem",
      [mq.phone]: vlak.controlFs,
    },
    fontWeight: 600,
    letterSpacing: "-0.01em",
    lineHeight: "26px",
    color: vlak.ink,
  },
  nav: {
    display: "flex",
    gap: {
      default: "0.3125rem",
      [mq.phone]: "0.5rem",
    },
    flexShrink: 0,
  },
  page: {
    boxSizing: "border-box",
    width: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    height: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    minWidth: {
      default: null,
      [mq.phone]: vlak.hit,
    },
    minHeight: {
      default: null,
      [mq.phone]: vlak.hit,
    },
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: {
      default: "0.8125rem",
      [mq.phone]: vlak.controlFs,
    },
    color: vlak.gray,
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    padding: 0,
    backgroundColor: "transparent",
    fontFamily: "inherit",
    cursor: "pointer",
    transform: "translateY(1px)",
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
    fontSize: {
      default: "0.6875rem",
      [mq.phone]: "0.8125rem",
    },
    fontWeight: 500,
    color: vlak.gray,
    textAlign: "center",
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
    minWidth: vlak.hit,
    minHeight: vlak.hit,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    color: vlak.ink,
    backgroundColor: {
      default: "transparent",
      ":hover": vlak.controlFill,
      [mq.touch]: {
        ":hover": "transparent",
        ":active": vlak.controlFill,
      },
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
      ":focus-visible": vlak.ink,
    },
    outlineOffset: {
      default: null,
      ":focus-visible": 2,
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
      ":hover": vlak.ink,
    },
    borderRadius: vlak.radiusSm,
    color: vlak.paper,
    fontWeight: 600,
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
  const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
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

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() - weekStart + 7) % 7;
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - lead);
  const weeks = Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)),
  );
  const title = month.toLocaleDateString(locale, { month: "long", year: "numeric" });
  const weekdayDates = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + weekStart + i));
  const dows = weekdayDates.map((d) => d.toLocaleDateString(locale, { weekday: "short" }));
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
            <Icon name="chevron-left" size={12} className={icon.className} style={icon.style} />
          </button>
          <button type="button" className={page.className} style={page.style} disabled={disabled || (!!max && startOfMonth(month) >= startOfMonth(max))} aria-label="Next month" onClick={() => shift(1)}>
            <Icon name="chevron-right" size={12} className={icon.className} style={icon.style} />
          </button>
        </span>
      </div>
      <div className={grid.className} style={grid.style} role="grid" aria-labelledby={titleId} onKeyDown={onGridKeyDown}>
        <div className={row.className} style={row.style} role="row">
          {dows.map((d, i) => (
            <span key={d} className={dow.className} style={dow.style} role="columnheader" aria-label={dowsLong[i]}>
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
