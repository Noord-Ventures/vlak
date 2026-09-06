"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

import { Dialog } from "./dialog";

export interface CommandItem {
  label: string;
  hint?: React.ReactNode;
  keywords?: string;
  onSelect?: () => void;
}

export interface CommandGroup {
  label?: string;
  items: CommandItem[];
}

export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  groups: CommandGroup[];
  placeholder?: string;
  emptyLabel?: React.ReactNode;
  onDone?: () => void;
}

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  palette: {
    width: {
      default: 480,
      [mq.phone]: "100%",
    },
    maxWidth: {
      default: "90vw",
      [mq.phone]: "100%",
    },
    padding: 0,
    overflow: "hidden",
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    borderWidth: 0,
    borderBottomWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    backgroundColor: "transparent",
    fontFamily: "inherit",
    fontSize: {
      default: "0.875rem",
      [mq.phone]: "1rem",
    },
    letterSpacing: "-0.01em",
    color: vlak.ink,
    paddingBlock: "0.875rem",
    paddingInline: "1rem",
    /* The palette clips at its edge, so the ring sits inside the field. */
    outlineWidth: {
      default: 0,
      ":focus-visible": 2,
    },
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineColor: {
      default: null,
      ":focus-visible": vlak.ink,
    },
    outlineOffset: {
      default: null,
      ":focus-visible": -2,
    },
    minHeight: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    "::placeholder": {
      color: vlak.gray,
    },
  },
  list: {
    maxHeight: "20rem",
    overflowY: "auto",
    padding: "0.375rem",
  },
  group: {
    fontSize: {
      default: "0.6875rem",
      [mq.phone]: "0.8125rem",
    },
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: vlak.gray,
    paddingTop: {
      default: "0.5rem",
      [mq.phone]: "0.75rem",
    },
    paddingInlineEnd: {
      default: "0.625rem",
      [mq.phone]: "0.875rem",
    },
    paddingBottom: {
      default: "0.25rem",
      [mq.phone]: "0.375rem",
    },
    paddingInlineStart: {
      default: "0.625rem",
      [mq.phone]: "0.875rem",
    },
  },
  item: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
    width: "100%",
    textAlign: "start",
    borderWidth: 0,
    backgroundColor: "transparent",
    fontFamily: "inherit",
    fontSize: {
      default: "0.84375rem",
      [mq.phone]: vlak.controlFs,
    },
    letterSpacing: "-0.01em",
    color: vlak.ink,
    paddingBlock: {
      default: "0.5rem",
      [mq.phone]: "0.75rem",
    },
    paddingInline: {
      default: "0.625rem",
      [mq.phone]: "0.875rem",
    },
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    cursor: "pointer",
    minHeight: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
  },
  itemActive: {
    backgroundColor: vlak.dividerSubtle,
  },
  hint: {
    fontSize: "0.6875rem",
    color: vlak.gray,
  },
  empty: {
    padding: {
      default: "1.25rem",
      [mq.phone]: "1.5rem",
    },
    textAlign: "center",
    fontSize: {
      default: "0.8125rem",
      [mq.phone]: "0.9375rem",
    },
    color: vlak.gray,
  },
});

const PAGE = 10;

/** Filter, arrows, enter. The input keeps focus; the list is aria-activedescendant. */
export const Command = React.forwardRef<HTMLDivElement, CommandProps>(function Command({
  groups,
  placeholder = "Type a command or search…",
  emptyLabel = "Nothing found.",
  onDone,
  className,
  style,
  ...props
}, ref) {
  const idBase = React.useId();
  const inputId = `${idBase}-input`;
  const listboxId = `${idBase}-listbox`;
  const optionId = (index: number) => `${idBase}-opt-${index}`;
  const activeRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const q = query.trim().toLowerCase();
  const filtered = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.label.toLowerCase().includes(q) || item.keywords?.toLowerCase().includes(q),
      ),
    }))
    .filter((group) => group.items.length > 0);
  const flat = filtered.flatMap((group) => group.items);
  const hasList = flat.length > 0;

  React.useEffect(() => {
    setActiveIndex((i) => Math.max(0, Math.min(flat.length - 1, i)));
  }, [flat.length]);

  React.useEffect(() => {
    activeRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, q]);

  const run = (item: CommandItem) => {
    onDone?.();
    item.onSelect?.();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const last = Math.max(0, flat.length - 1);
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
      case "Enter": {
        e.preventDefault();
        const item = flat[activeIndex];
        if (item) run(item);
        return;
      }
      case "Escape":
        e.preventDefault();
        onDone?.();
        return;
      default:
        return;
    }
  };

  const root = rs(["rs-command", className], styles.root);
  const input = rs(["rs-command-input"], styles.input);
  const list = rs(["rs-command-list"], styles.list);
  const empty = rs(["rs-command-empty"], styles.empty);
  const groupSx = rs(["rs-command-group"], styles.group);
  const hint = rs(["rs-command-hint"], styles.hint);

  let cursor = -1;
  return (
    <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
      <input
        id={inputId}
        className={input.className}
        style={input.style}
        autoFocus
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        role="combobox"
        aria-expanded={hasList}
        aria-controls={hasList ? listboxId : undefined}
        aria-activedescendant={hasList && flat[activeIndex] ? optionId(activeIndex) : undefined}
        aria-autocomplete="list"
        aria-label="Command"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={onKeyDown}
      />
      <div
        id={hasList ? listboxId : undefined}
        role={hasList ? "listbox" : undefined}
        aria-labelledby={hasList ? inputId : undefined}
        tabIndex={-1}
        className={list.className}
        style={list.style}
        onMouseDown={(e) => e.preventDefault()}
      >
        {flat.length === 0 && (
          <div className={empty.className} style={empty.style}>
            {emptyLabel}
          </div>
        )}
        {filtered.map((group, gi) => {
          const groupLabelId = `${idBase}-group-${gi}`;
          return (
            <div key={gi} role="group" aria-labelledby={group.label ? groupLabelId : undefined}>
              {group.label && (
                <div id={groupLabelId} role="presentation" className={groupSx.className} style={groupSx.style}>
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                cursor++;
                const index = cursor;
                const active = index === activeIndex;
                const row = rs(
                  ["rs-command-item", active && "rs-command-item-active"],
                  styles.item,
                  active && styles.itemActive,
                );
                return (
                  <div
                    key={`${gi}-${item.label}`}
                    id={optionId(index)}
                    ref={active ? activeRef : undefined}
                    role="option"
                    tabIndex={-1}
                    aria-selected={active}
                    className={row.className}
                    style={row.style}
                    onPointerEnter={() => setActiveIndex(index)}
                    onClick={() => run(item)}
                  >
                    <span>{item.label}</span>
                    {item.hint != null && (
                      <span className={hint.className} style={hint.style}>
                        {item.hint}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export interface CommandDialogProps extends CommandProps {
  open: boolean;
  onClose?: () => void;
}

/** The palette in a native <dialog>. Wire ⌘K in your app to setOpen(true). */
export const CommandDialog = React.forwardRef<HTMLDialogElement, CommandDialogProps>(function CommandDialog(
  { open, onClose, className, "aria-label": ariaLabel = "Commands", "aria-labelledby": ariaLabelledBy, ...props },
  ref,
) {
  return (
    <Dialog
      ref={ref}
      open={open}
      onClose={onClose}
      aria-label={ariaLabelledBy ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={["rs-command-dialog", className].filter(Boolean).join(" ")}
      extraStyles={[styles.palette]}
    >
      {open && <Command onDone={onClose} {...props} />}
    </Dialog>
  );
});
