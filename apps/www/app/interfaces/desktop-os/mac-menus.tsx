"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@noorddev/vlak-react";
import type { AppId, AppWindow } from "./types";
import "./mac-menus.css";

export interface MacMenusProps {
  active: boolean;
  front?: AppWindow & { maximized: boolean; shaded: boolean };
  windows: AppWindow[];
  appName: string;
  onOpenApp(app: AppId, path?: string): void;
  onApplications(trigger: HTMLElement): void;
  onFocusWindow(id: number): void;
  onCloseWindow(id: number): void;
  onMinimizeWindow(id: number): void;
  onZoomWindow(id: number): void;
  onShadeWindow(id: number): void;
  onArrange(kind: "tile" | "cascade"): void;
}

type MenuName = "system" | "file" | "window";
type Action = { id: string; label: string; detail?: string; disabled?: boolean; checked?: boolean; restore?: boolean; run(): void };
type Item = Action | { id: string; separator: true };
const names: Record<MenuName, string> = { system: "Mac OS", file: "File", window: "Window" };
const order: MenuName[] = ["system", "file", "window"];
const usable = (element: HTMLElement | null) => Boolean(element?.isConnected && !element.closest("[inert],[hidden],[aria-hidden='true']") && element.getClientRects().length && getComputedStyle(element).visibility !== "hidden");

/** Native top-layer menus stay attached to the desktop while escaping its window clipping. */
export function MacMenus(props: MacMenusProps) {
  const { active, front, windows, appName } = props;
  const id = useId();
  const owner = useRef<HTMLDivElement>(null), panel = useRef<HTMLDivElement>(null);
  const triggers = useRef<Partial<Record<MenuName, HTMLButtonElement | null>>>({});
  const [open, setOpen] = useState<MenuName | null>(null);
  const [tabStop, setTabStop] = useState<MenuName>("system");
  const activeNow = useRef(active); activeNow.current = active;
  const openNow = useRef(open); openNow.current = open;
  const initial = useRef<"first" | "last">("first");
  const focusContext = useRef<{ frame: HTMLElement | null; preview: string | undefined } | null>(null);
  const typed = useRef({ text: "", at: 0 });

  const sameContext = useCallback(() => {
    const frame = owner.current?.closest<HTMLElement>(".if-preview-frame") ?? null;
    return activeNow.current && usable(owner.current) && frame === focusContext.current?.frame && frame?.dataset.previewOpen === focusContext.current?.preview;
  }, []);
  const close = useCallback((restore = false) => {
    const trigger = openNow.current ? triggers.current[openNow.current] : null;
    const canRestore = restore && sameContext() && usable(trigger ?? null);
    openNow.current = null;
    panel.current?.hidePopover?.();
    setOpen(null);
    typed.current = { text: "", at: 0 };
    // Restore synchronously: no queued focus can overwrite a subsequent preview change.
    if (canRestore) trigger?.focus({ preventScroll: true });
  }, [sameContext]);

  const show = (name: MenuName, at: "first" | "last" = "first") => {
    if (!activeNow.current || !usable(triggers.current[name] ?? null)) return;
    const frame = owner.current?.closest<HTMLElement>(".if-preview-frame") ?? null;
    focusContext.current = { frame, preview: frame?.dataset.previewOpen };
    initial.current = at;
    typed.current = { text: "", at: 0 };
    setTabStop(name);
    openNow.current = name;
    setOpen(name);
  };
  const visibleMenus = () => order.filter(name => usable(triggers.current[name] ?? null));
  const switchMenu = (name: MenuName, direction: number, opening = Boolean(openNow.current)) => {
    const visible = visibleMenus();
    const next = visible[(visible.indexOf(name) + direction + visible.length) % visible.length];
    if (!next) return;
    setTabStop(next);
    if (opening) show(next);
    else triggers.current[next]?.focus({ preventScroll: true });
  };

  const position = useCallback(() => {
    const menu = panel.current, trigger = openNow.current ? triggers.current[openNow.current] : null;
    if (!menu || !trigger) return;
    if (!sameContext() || !usable(trigger)) { close(); return; }
    const rect = trigger.getBoundingClientRect();
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0, top = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? window.innerWidth, height = viewport?.height ?? window.innerHeight;
    menu.style.maxHeight = `${Math.max(44, height - 16)}px`;
    const below = rect.bottom, above = rect.top - menu.offsetHeight;
    menu.style.left = `${Math.max(left + 8, Math.min(rect.left, left + width - menu.offsetWidth - 8))}px`;
    menu.style.top = `${Math.max(top + 8, Math.min(below + menu.offsetHeight <= top + height - 8 ? below : above, top + height - menu.offsetHeight - 8))}px`;
  }, [close, sameContext]);

  useLayoutEffect(() => {
    if (!active || !open || !sameContext()) { close(); return; }
    const menu = panel.current;
    if (!menu) return;
    menu.showPopover?.();
    position();
    const entries = menu.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
    (initial.current === "last" ? entries.item(entries.length - 1) : entries.item(0))?.focus({ preventScroll: true });
    const outside = (event: globalThis.PointerEvent) => {
      if (!(event.target instanceof Node) || owner.current?.contains(event.target)) return;
      close();
    };
    const focusOutside = (event: FocusEvent) => {
      if (event.target instanceof Node && !owner.current?.contains(event.target)) close();
    };
    const toggle = () => { if (!menu.matches(":popover-open")) close(); };
    const frame = focusContext.current?.frame;
    const observer = new MutationObserver(() => { if (!sameContext()) close(); });
    if (frame) observer.observe(frame, { attributes: true, attributeFilter: ["data-preview-open"] });
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("focusin", focusOutside);
    menu.addEventListener("toggle", toggle);
    window.addEventListener("scroll", position, true);
    window.addEventListener("resize", position);
    window.visualViewport?.addEventListener("resize", position);
    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("focusin", focusOutside);
      menu.removeEventListener("toggle", toggle);
      window.removeEventListener("scroll", position, true);
      window.removeEventListener("resize", position);
      window.visualViewport?.removeEventListener("resize", position);
    };
  }, [active, open, close, position, sameContext]);

  useLayoutEffect(() => {
    if (!active) return;
    const ensureTabStop = () => {
      const visible = order.filter(name => usable(triggers.current[name] ?? null));
      setTabStop(current => visible.includes(current) ? current : visible[0] ?? "system");
      if (openNow.current && !visible.includes(openNow.current)) close();
    };
    ensureTabStop();
    const observer = new ResizeObserver(ensureTabStop);
    if (owner.current) observer.observe(owner.current);
    return () => observer.disconnect();
  }, [active, close]);

  const menus: Record<MenuName, Item[]> = {
    system: [
      { id: "applications", label: "Applications…", run: () => { const trigger = triggers.current.system; if (trigger) props.onApplications(trigger); } },
      { id: "system-separator", separator: true },
      { id: "settings", label: "Control Panels", run: () => props.onOpenApp("settings") },
      { id: "monitor", label: "Process Viewer", run: () => props.onOpenApp("monitor") },
      { id: "calculator", label: "Calculator", run: () => props.onOpenApp("calculator") },
    ],
    file: [
      { id: "new", label: "New document", run: () => props.onOpenApp("editor") },
      { id: "documents", label: "Open Documents", run: () => props.onOpenApp("files", "/Documents") },
      { id: "trash", label: "Open Trash", run: () => props.onOpenApp("files", "/Trash") },
      { id: "file-separator", separator: true },
      { id: "close", label: "Close window", disabled: !front, run: () => { if (front) props.onCloseWindow(front.id); } },
    ],
    window: [
      { id: "minimize", label: "Minimize", disabled: !front, run: () => { if (front) props.onMinimizeWindow(front.id); } },
      { id: "zoom", label: front?.maximized ? "Restore size" : "Zoom", disabled: !front, restore: true, run: () => { if (front) props.onZoomWindow(front.id); } },
      { id: "shade", label: front?.shaded ? "Unshade" : "Shade", disabled: !front, restore: true, run: () => { if (front) props.onShadeWindow(front.id); } },
      { id: "arrange-separator", separator: true },
      { id: "tile", label: "Tile windows", disabled: !windows.some(win => !win.minimized), restore: true, run: () => props.onArrange("tile") },
      { id: "cascade", label: "Cascade windows", disabled: !windows.some(win => !win.minimized), restore: true, run: () => props.onArrange("cascade") },
      ...(windows.length ? [{ id: "windows-separator", separator: true } as const] : []),
      ...windows.map(win => ({ id: `window-${win.id}`, label: win.title, detail: win.minimized ? "Minimized" : undefined, checked: front?.id === win.id, run: () => props.onFocusWindow(win.id) })),
    ],
  };

  const triggerKey = (event: KeyboardEvent<HTMLButtonElement>, name: MenuName) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault(); show(name, event.key === "ArrowUp" ? "last" : "first");
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault(); switchMenu(name, event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next = event.key === "Home" ? visibleMenus()[0] : visibleMenus().at(-1);
      if (next) { setTabStop(next); if (openNow.current) show(next); else triggers.current[next]?.focus({ preventScroll: true }); }
    } else if (event.key === "Escape" && openNow.current) {
      event.preventDefault(); event.stopPropagation(); close(true);
    } else if (event.key === "Tab" && openNow.current) close(true);
  };
  const menuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (event.key === "Tab") { close(true); return; }
    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && openNow.current) {
      event.preventDefault(); switchMenu(openNow.current, event.key === "ArrowLeft" ? -1 : 1); return;
    }
    const entries = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
    const current = entries.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") next = (current + (event.key === "ArrowUp" ? -1 : 1) + entries.length) % entries.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = entries.length - 1;
    else if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = performance.now();
      typed.current = { text: now - typed.current.at < 500 ? typed.current.text + event.key.toLocaleLowerCase() : event.key.toLocaleLowerCase(), at: now };
      const letters = [...typed.current.text];
      const query = letters.every(letter => letter === letters[0]) ? letters[0]! : typed.current.text;
      for (let step = 1; step <= entries.length; step++) {
        const index = (current + step) % entries.length;
        if (entries[index]?.getAttribute("aria-label")?.toLocaleLowerCase().startsWith(query)) { next = index; break; }
      }
      event.preventDefault();
    }
    if (next >= 0) { event.preventDefault(); entries[next]?.focus({ preventScroll: true }); entries[next]?.scrollIntoView({ block: "nearest" }); }
  };
  const trigger = (name: MenuName) => <button ref={element => { triggers.current[name] = element; }} id={`${id}-${name}`} type="button" role="menuitem" className="dos-mac-menu-trigger" data-menu={name} tabIndex={tabStop === name ? 0 : -1} aria-haspopup="menu" aria-expanded={active && open === name} aria-controls={active && open === name ? `${id}-menu` : undefined} onFocus={() => setTabStop(name)} onKeyDown={event => triggerKey(event, name)} onClick={() => openNow.current === name ? close(true) : show(name)} onPointerEnter={event => { if (event.pointerType !== "touch" && openNow.current && openNow.current !== name) show(name); }}>{names[name]}</button>;

  return <div ref={owner} className="dos-mac-menus" role="menubar" aria-label="Mac OS menus">
    {trigger("system")}<span className="dos-active-app" role="presentation">{appName}</span>{trigger("file")}{trigger("window")}
    <div ref={panel} id={`${id}-menu`} popover="auto" className="dos-mac-menu" role="menu" aria-labelledby={open ? `${id}-${open}` : undefined} onKeyDown={menuKey}>
      {open && menus[open].map(item => "separator" in item ? <hr key={item.id} /> : <button key={item.id} type="button" {...(item.checked === undefined ? { role: "menuitem" as const } : { role: "menuitemcheckbox" as const, "aria-checked": item.checked })} aria-label={item.label} aria-description={item.detail} disabled={item.disabled} tabIndex={-1} className="dos-mac-menu-item" onPointerMove={event => { if (event.pointerType !== "touch" && document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true }); }} onClick={() => { close(item.restore); item.run(); }}><span className="dos-mac-menu-check" aria-hidden="true">{item.checked && <Icon name="check" size={16} />}</span><span className="dos-mac-menu-label">{item.label}</span>{item.detail && <small aria-hidden="true">{item.detail}</small>}</button>)}
    </div>
  </div>;
}
