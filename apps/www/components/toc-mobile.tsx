"use client";

import * as React from "react";
import { Icon } from "@noorddev/vlak-react";

/**
 * Phone contents picker. Desktop rails stay in docs-nav / interfaces nav.
 * 44pt trigger, 44pt rows, paper + hairline, no radius, no dim.
 */
export function MobileToc({
  label,
  children,
  inset,
}: {
  label: string;
  children: React.ReactNode;
  inset?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const sheetId = React.useId();

  React.useEffect(() => {
    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus({ preventScroll: true }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className={`toc-mobile${inset ? " toc-mobile-inset" : ""}`} aria-label={label} data-scrolled={scrolled}>
      <button
        type="button"
        ref={triggerRef}
        className="toc-mobile-trigger"
        aria-expanded={open}
        aria-controls={sheetId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{label}</span>
        <span className="toc-mobile-mark" aria-hidden="true">
          <Icon name="chevron-right" size={16} rotate={open ? 270 : 90} />
        </span>
      </button>
      {open ? (
        <button
          type="button"
          className="toc-mobile-dismiss"
          aria-label="Close contents"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <div id={sheetId} className="toc-mobile-sheet" data-open={open} hidden={!open} onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setOpen(false); }}>
        {children}
      </div>
    </nav>
  );
}
