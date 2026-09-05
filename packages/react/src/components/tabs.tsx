"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  idBase: string;
  /** Panels currently mounted, so a tab only claims aria-controls for one that exists. */
  panels: ReadonlySet<string>;
  registerPanel: (value: string) => () => void;
  registerTab: (value: string, element: HTMLButtonElement, disabled: boolean) => () => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Tabs>`);
  return ctx;
}

const styles = stylex.create({
  list: {
    display: "flex",
    alignItems: {
      default: "baseline",
      [mq.phone]: "stretch",
    },
    gap: {
      default: "1.375rem",
      [mq.phone]: 0,
    },
    width: {
      default: null,
      [mq.phone]: "100%",
    },
    maxWidth: {
      default: "22.5rem",
      [mq.phone]: "none",
    },
    borderWidth: 0,
    borderStyle: "none",
    borderBottomWidth: {
      default: 0,
      [mq.phone]: vlak.hairline,
    },
    borderBottomStyle: {
      default: "none",
      [mq.phone]: "solid",
    },
    borderBottomColor: {
      default: "transparent",
      [mq.phone]: vlak.divider,
    },
    boxShadow: "none",
    backgroundColor: "transparent",
  },
  vertical: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 0,
    borderBottomWidth: 0,
    borderBottomStyle: "none",
  },
  tab: {
    appearance: "none",
    boxSizing: "border-box",
    flexGrow: {
      default: null,
      [mq.phone]: 1,
    },
    flexShrink: {
      default: null,
      [mq.phone]: 1,
    },
    flexBasis: {
      default: null,
      [mq.phone]: 0,
    },
    display: {
      default: null,
      [mq.phone]: "inline-flex",
    },
    alignItems: {
      default: null,
      [mq.phone]: "center",
    },
    justifyContent: {
      default: null,
      [mq.phone]: "center",
    },
    minHeight: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    minWidth: vlak.hit,
    paddingBlock: {
      default: "0.5rem",
      [mq.phone]: 0,
    },
    paddingInline: {
      default: 0,
      [mq.phone]: "0.5rem",
    },
    fontSize: {
      default: "0.875rem",
      [mq.phone]: vlak.controlFs,
    },
    fontFamily: "inherit",
    fontWeight: 400,
    color: {
      default: vlak.gray,
      [mq.forcedColors]: "ButtonText",
    },
    letterSpacing: "-0.01em",
    textDecoration: "none",
    textAlign: {
      default: "start",
      [mq.phone]: "center",
    },
    backgroundColor: "transparent",
    backgroundImage: "none",
    boxShadow: "none",
    borderWidth: 0,
    borderStyle: "none",
    borderRadius: 0,
    cursor: "pointer",
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
  active: {
    color: {
      default: vlak.ink,
      [mq.forcedColors]: "Highlight",
    },
    fontWeight: 600,
    borderWidth: 0,
    borderStyle: "none",
    /* The underline is a box-shadow on paper; forced colors drop shadows, so it becomes a border there. */
    boxShadow: "inset 0 -1px 0",
    borderBottomWidth: {
      default: 0,
      [mq.forcedColors]: 2,
    },
    borderBottomStyle: {
      default: "none",
      [mq.forcedColors]: "solid",
    },
    borderBottomColor: {
      default: "transparent",
      [mq.forcedColors]: "Highlight",
    },
  },
});

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, defaultValue, onValueChange, children, ...props },
  ref,
) {
  const idBase = React.useId();
  const [panels, setPanels] = React.useState<ReadonlySet<string>>(() => new Set());
  const registerPanel = React.useCallback((v: string) => {
    setPanels((prev) => (prev.has(v) ? prev : new Set(prev).add(v)));
    return () => setPanels((prev) => {
      if (!prev.has(v)) return prev;
      const next = new Set(prev);
      next.delete(v);
      return next;
    });
  }, []);
  const [inner, setInner] = React.useState(defaultValue ?? "");
  const [tabs, setTabs] = React.useState<ReadonlyMap<string, { element: HTMLButtonElement; disabled: boolean }>>(() => new Map());
  const registerTab = React.useCallback((v: string, element: HTMLButtonElement, disabled: boolean) => {
    setTabs((prev) => new Map(prev).set(v, { element, disabled }));
    return () => setTabs((prev) => {
      const next = new Map(prev);
      next.delete(v);
      return next;
    });
  }, []);
  const isControlled = value !== undefined;
  const requested = isControlled ? value : inner;
  const enabled = [...tabs].filter(([, tab]) => !tab.disabled).sort(([, a], [, b]) =>
    a.element.compareDocumentPosition(b.element) & 4 ? -1 : 1);
  const current = enabled.some(([v]) => v === requested) ? requested : enabled[0]?.[0] ?? requested;
  React.useEffect(() => {
    if (!isControlled && enabled.length && current !== inner) setInner(current);
  }, [isControlled, enabled.length, current, inner]);
  const setValue = (next: string) => {
    if (!isControlled) setInner(next);
    onValueChange?.(next);
  };
  return (
    <div ref={ref} {...props}>
      <TabsContext.Provider value={{ value: current, setValue, idBase, panels, registerPanel, registerTab }}>
        {children}
      </TabsContext.Provider>
    </div>
  );
});

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stacked tabs answer Up/Down instead of Left/Right. */
  orientation?: "horizontal" | "vertical";
}

/** Roving tabs: arrows step, Home/End jump, and selection follows focus. */
export const TabList = React.forwardRef<HTMLDivElement, TabListProps>(function TabList(
  { orientation = "horizontal", className, style, onKeyDown, ...props },
  ref,
) {
  const vertical = orientation === "vertical";
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const prevKey = vertical ? "ArrowUp" : "ArrowLeft";
    const nextKey = vertical ? "ArrowDown" : "ArrowRight";
    if (e.key !== prevKey && e.key !== nextKey && e.key !== "Home" && e.key !== "End") return;
    const tabs = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
    );
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1 || tabs.length === 0) return;
    e.preventDefault();
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? tabs.length - 1
          : e.key === nextKey
            ? (index + 1) % tabs.length
            : (index - 1 + tabs.length) % tabs.length;
    tabs[next]?.focus();
    tabs[next]?.click();
  };
  const sx = rs(["rs-tabs", vertical && "rs-tabs-vertical", className], styles.list, vertical && styles.vertical);
  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={vertical ? "vertical" : undefined}
      onKeyDown={handleKeyDown}
      {...props}
      className={sx.className}
      style={{ ...sx.style, ...style }}
    />
  );
});

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { value, className, style, onClick, disabled = false, ...props },
  ref,
) {
  const ctx = useTabsContext("Tab");
  const element = React.useRef<HTMLButtonElement>(null);
  const mergedRef = useMergedRefs(ref, element);
  const registerTab = ctx.registerTab;
  React.useEffect(() => element.current ? registerTab(value, element.current, disabled) : undefined, [registerTab, value, disabled]);
  const selected = ctx.value === value;
  const sx = rs(["rs-tab", selected && "rs-tab-active", className], styles.tab, selected && styles.active);
  return (
    <button
      ref={mergedRef}
      type="button"
      role="tab"
      disabled={disabled}
      id={`${ctx.idBase}-tab-${value}`}
      aria-selected={selected}
      aria-controls={ctx.panels.has(value) ? `${ctx.idBase}-panel-${value}` : undefined}
      tabIndex={selected ? 0 : -1}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.setValue(value);
      }}
      {...props}
      className={sx.className}
      style={{ ...sx.style, ...style }}
    />
  );
});

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { value, ...props },
  ref,
) {
  const ctx = useTabsContext("TabPanel");
  const selected = ctx.value === value;
  const register = ctx.registerPanel;
  React.useEffect(() => register(value), [register, value]);
  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`${ctx.idBase}-panel-${value}`}
      aria-labelledby={`${ctx.idBase}-tab-${value}`}
      hidden={!selected}
      {...props}
    />
  );
});
