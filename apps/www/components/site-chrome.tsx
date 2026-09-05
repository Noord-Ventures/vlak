"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Button, ToggleGroup } from "@noorddev/vlak-react";
import { chrome } from "@/app/site.stylex";
import { sx } from "@/lib/sx";
import { VlakMark } from "./vlak-mark";

type Scheme = "light" | "dark" | "auto";
type GridPref = "on" | "off";

const schemes: { value: Scheme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto" },
];

const TEXT_STEPS = [0.9, 1, 1.1, 1.25, 1.4];

function applyScheme(scheme: Scheme) {
  const dark =
    scheme === "dark" ||
    (scheme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

function applyGrid(grid: GridPref) {
  document.documentElement.dataset.grid = grid;
}

function persistTextScale(scale: number) {
  const pct = String(Math.round(scale * 100));
  const root = document.documentElement;
  root.style.setProperty("--text-scale", String(scale));
  root.setAttribute("data-text-scale", pct);
  try {
    localStorage.setItem("vlak-text-scale", pct);
  } catch {
    /* private mode */
  }
}

function readScheme(): Scheme {
  try {
    const stored = localStorage.getItem("vlak-theme");
    if (stored === "light" || stored === "dark" || stored === "auto") return stored;
  } catch {
    /* private mode */
  }
  return "auto";
}

function readGrid(): GridPref {
  try {
    return localStorage.getItem("vlak-grid") === "off" ? "off" : "on";
  } catch {
    return "on";
  }
}

function readTextIndex(): number {
  try {
    const raw = localStorage.getItem("vlak-text-scale");
    if (raw == null || raw === "") return 1;
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return 1;
    const scale = n > 3 ? n / 100 : n;
    const i = TEXT_STEPS.findIndex((step) => Math.abs(step - scale) < 0.001);
    if (i >= 0) return i;
  } catch {
    /* private mode */
  }
  return 1;
}

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function useSettings() {
  const [scheme, setScheme] = React.useState<Scheme>("auto");
  const [grid, setGrid] = React.useState<GridPref>("on");
  const [textIndex, setTextIndex] = React.useState(1);

  useIsoLayoutEffect(() => {
    const nextScheme = readScheme();
    const nextGrid = readGrid();
    const nextText = readTextIndex();
    setScheme(nextScheme);
    setGrid(nextGrid);
    setTextIndex(nextText);
    applyScheme(nextScheme);
    applyGrid(nextGrid);
    persistTextScale(TEXT_STEPS[nextText]!);
  }, []);

  React.useEffect(() => {
    if (scheme !== "auto") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyScheme("auto");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [scheme]);

  const selectScheme = (next: Scheme) => {
    setScheme(next);
    try {
      localStorage.setItem("vlak-theme", next);
    } catch {
      /* private mode */
    }
    applyScheme(next);
  };

  const selectGrid = (next: GridPref) => {
    setGrid(next);
    try {
      if (next === "off") localStorage.setItem("vlak-grid", "off");
      else localStorage.removeItem("vlak-grid");
    } catch {
      /* private mode */
    }
    applyGrid(next);
  };

  const stepText = (delta: number) => {
    const next = Math.max(0, Math.min(TEXT_STEPS.length - 1, textIndex + delta));
    setTextIndex(next);
    persistTextScale(TEXT_STEPS[next]!);
  };

  return { scheme, selectScheme, grid, selectGrid, textIndex, stepText };
}

/* Same sliders mark as the top-right control on renatovaldes.com. One glyph, no track. */
function SettingsMark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="butt"
      strokeLinejoin="miter"
    >
      <path d="M2 4.5h5M11 4.5h3M2 11.5h3M9 11.5h5" />
      <circle cx="9" cy="4.5" r="1.9" />
      <circle cx="7" cy="11.5" r="1.9" />
    </svg>
  );
}

/* Settings are Vlak controls: a label, a ToggleGroup for each choice,
   ghost buttons for the text-size stepper. */
function Choice<T extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onSelect: (next: T) => void;
}) {
  const id = `lbl-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="settings-group">
      <p className="rs-label settings-label" id={id}>
        {label}
      </p>
      <ToggleGroup
        className="settings-choice"
        aria-labelledby={id}
        options={options}
        value={value}
        onValueChange={(next) => onSelect(next as T)}
      />
    </div>
  );
}

function TextStepper({
  index,
  onStep,
}: {
  index: number;
  onStep: (delta: number) => void;
}) {
  const scale = TEXT_STEPS[index] ?? 1;
  return (
    <div className="settings-group">
      <p className="rs-label settings-label" id="lbl-text-size">
        Text size
      </p>
      <div className="text-stepper" role="group" aria-labelledby="lbl-text-size">
        <Button variant="ghost" size="sm" aria-label="Decrease text size" disabled={index === 0} onClick={() => onStep(-1)}>
          −
        </Button>
        <output suppressHydrationWarning>{Math.round(scale * 100)}%</output>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Increase text size"
          disabled={index === TEXT_STEPS.length - 1}
          onClick={() => onStep(1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}

function SettingsBody({
  scheme,
  onScheme,
  grid,
  onGrid,
  textIndex,
  onTextStep,
}: {
  scheme: Scheme;
  onScheme: (next: Scheme) => void;
  grid: GridPref;
  onGrid: (next: GridPref) => void;
  textIndex: number;
  onTextStep: (delta: number) => void;
}) {
  return (
    <>
      <Choice label="Appearance" value={scheme} options={schemes} onSelect={onScheme} />
      <TextStepper index={textIndex} onStep={onTextStep} />
      <Choice
        label="Grid"
        value={grid}
        options={[
          { value: "on", label: "Show" },
          { value: "off", label: "Hide" },
        ]}
        onSelect={onGrid}
      />
    </>
  );
}

const links = [
  { href: "/", label: "Home", corner: false },
  { href: "/components", label: "Components", corner: true },
  { href: "/interfaces", label: "Interfaces", corner: true },
  { href: "/docs", label: "Docs", corner: true },
  { href: "/about", label: "About", corner: true },
];

export function SiteChrome() {
  const pathname = usePathname();
  const { scheme, selectScheme, grid, selectGrid, textIndex, stepText } = useSettings();
  const [open, setOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [atTop, setAtTop] = React.useState(true);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const navToggleRef = React.useRef<HTMLButtonElement>(null);
  const navPanelRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => setOpen(false), [pathname]);
  React.useEffect(() => setMenuOpen(false), [pathname]);
  React.useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Phone menu: lock scroll, move focus to the first link, close on
     Escape, and hand focus back to the toggle on close. */
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return () => {
      document.body.style.overflow = "";
    };
    const first = navPanelRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      navToggleRef.current?.focus();
    };
  }, [open]);

  /* Appearance panel: focus moves to the current scheme on open, Escape
     and outside clicks close it, and focus returns to the toggle. */
  React.useEffect(() => {
    if (!menuOpen) return;
    const panel = settingsRef.current?.querySelector<HTMLElement>("#appearanceMenu");
    const first = panel?.querySelector<HTMLElement>('[aria-pressed="true"], button');
    first?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        settingsRef.current?.querySelector<HTMLElement>(".theme-toggle")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const current = (href: string) =>
    (href === "/" ? pathname === "/" : pathname.startsWith(href)) ? ("page" as const) : undefined;

  const settingsProps = {
    scheme,
    onScheme: selectScheme,
    grid,
    onGrid: selectGrid,
    textIndex,
    onTextStep: stepText,
  };

  return (
    <>
      <div {...sx("logo-wrap", chrome.logoWrap)}>
        <Link href="/" {...sx("site-logo", chrome.logo)} aria-label="Vlak">
          <VlakMark />
        </Link>
        <span className="mobile-site-name" data-visible={atTop && pathname === "/"} aria-hidden="true">
          Vlak.dev
        </span>
      </div>

      <nav {...sx("corner-nav", chrome.cornerNav)} aria-label="Site">
        {links.filter((l) => l.corner).map((l) => (
          <Link key={l.href} href={l.href} aria-current={current(l.href)}>
            {l.label}
          </Link>
        ))}
        <a href="https://github.com/Noord-Ventures/vlak">GitHub</a>
      </nav>

      <div className="settings" ref={settingsRef}>
        <button
          type="button"
          {...sx("theme-toggle", chrome.themeToggle)}
          aria-label="Appearance"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls="appearanceMenu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <SettingsMark />
        </button>
        <div
          id="appearanceMenu"
          className="rs-menu appearance-menu"
          hidden={!menuOpen}
          role="dialog"
          aria-label="Appearance"
        >
          <SettingsBody {...settingsProps} />
        </div>
      </div>

      <Button
        ref={navToggleRef}
        variant="ghost"
        grouped
        {...sx("nav-toggle", chrome.navToggle)}
        aria-expanded={open}
        aria-controls="navPanel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="nav-toggle-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </Button>
      <nav
        id="navPanel"
        ref={navPanelRef}
        {...sx("nav-panel", chrome.navPanel)}
        data-open={open}
        aria-label="Site menu"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="nav-panel-links">
          {links.filter((l) => l.href !== "/").map((l) => (
            <Link key={l.href} href={l.href} {...sx("nav-panel-link", chrome.navPanelLink)} aria-current={current(l.href)}>
              {l.label}
            </Link>
          ))}
          <a href="https://github.com/Noord-Ventures/vlak" {...sx("nav-panel-link", chrome.navPanelLink)}>
            GitHub
          </a>
        </div>
        <div className="nav-panel-appearance">
          <SettingsBody {...settingsProps} />
        </div>
      </nav>
    </>
  );
}
