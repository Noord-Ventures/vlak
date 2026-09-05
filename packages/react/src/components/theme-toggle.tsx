"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon } from "./icon";

export interface ThemeToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** localStorage key the choice persists under. */
  storageKey?: string;
  onThemeChange?: (dark: boolean) => void;
}

const styles = stylex.create({
  toggle: {
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    position: "fixed",
    top: "1.5rem",
    insetInlineEnd: {
      default: "1.25rem",
      [mq.mobileGrid]: "1.5625rem",
    },
    zIndex: vlak.zSticky,
    width: vlak.hit,
    height: vlak.hit,
    minWidth: vlak.hit,
    minHeight: vlak.hit,
    padding: "0.625rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "transparent",
    borderWidth: 0,
    borderStyle: "none",
    borderRadius: vlak.radiusSm,
    cursor: "pointer",
    color: {
      default: vlak.gray,
      ":hover": vlak.ink,
    },
    outlineWidth: {
      default: 0,
      ":focus-visible": 2,
    },
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineColor: {
      default: "transparent",
      ":focus-visible": vlak.ink,
    },
    outlineOffset: {
      default: 0,
      ":focus-visible": 2,
    },
    filter: `drop-shadow(0 0 12px ${vlak.paper}) drop-shadow(0 0 20px ${vlak.paper})`,
  },
  inline: {
    position: "relative",
    top: "auto",
    insetInlineEnd: "auto",
    zIndex: 1,
    filter: "none",
  },
  mark: {
    width: "1.5rem",
    height: "1.5rem",
    display: "block",
    flexShrink: 0,
  },
});

/**
 * One filled family mark on a 24px square, about 18–20px of drawn ink.
 * Moon on paper, sun on black. The button sets
 * data-theme="dark" on <html> and persists the choice.
 * Apps pin it top-right; catalog and previews use the inline modifier.
 * The name states the action ("Switch to dark scheme"), so it changes with the state.
 */
export const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(function ThemeToggle({
  storageKey = "vlak-theme",
  onThemeChange,
  className,
  style,
  onClick,
  ...props
}, ref) {
  const [dark, setDark] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const read = () => {
      const explicit = document.documentElement.dataset.theme;
      setDark(explicit === "dark" || (explicit !== "light" && !!media?.matches));
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    media?.addEventListener("change", read);
    return () => {
      observer.disconnect();
      media?.removeEventListener("change", read);
    };
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const explicit = document.documentElement.dataset.theme;
    const effectiveDark = explicit === "dark" || (explicit !== "light" && !!window.matchMedia?.("(prefers-color-scheme: dark)").matches);
    const next = !effectiveDark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem(storageKey, next ? "dark" : "light");
    } catch {
      /* private mode */
    }
    setDark(next);
    onThemeChange?.(next);
    onClick?.(e);
  };

  const inline = typeof className === "string" && className.split(/\s+/).includes("rs-theme-toggle-inline");
  const sx = rs(["rs-theme-toggle", className], styles.toggle, inline && styles.inline);
  const mark = rs([dark ? "rs-theme-sun" : "rs-theme-moon"], styles.mark);

  return (
    <button
      ref={ref}
      type="button"
      aria-label={dark ? "Switch to light scheme" : "Switch to dark scheme"}
      onClick={toggle}
      {...props}
      className={sx.className}
      style={{ ...sx.style, ...style }}
    >
      <Icon name={dark ? "sun" : "moon"} variant="filled" size={24} className={mark.className} style={mark.style} />
    </button>
  );
});
