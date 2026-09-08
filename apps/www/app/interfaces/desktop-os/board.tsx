"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { Button, Icon, Tab, TabList, TabPanel, Tabs, type IconName } from "@noorddev/vlak-react";
import { DesktopApp } from "./apps";
import { MacMenus } from "./mac-menus";
import { initialFileSystem, validateFileSystem, welcomePath } from "./fs";
import { appNames, defaultPreferences, platforms, type AppId, type AppWindow, type DesktopPreferences, type FileSystem, type Platform } from "./types";
import "./scene.css";

const applications: AppId[] = ["files", "editor", "terminal", "browser", "calculator", "paint", "calendar", "settings", "monitor", "mines"];
const appIcons: Record<AppId, IconName> = { files: "folder", editor: "edit", terminal: "terminal", browser: "globe", calculator: "grid", paint: "image", calendar: "calendar", settings: "settings", monitor: "activity", mines: "grid" };
const macFavorites: AppId[] = ["files", "browser", "editor", "terminal", "paint", "calendar"];
type Rect = { x: number; y: number; width: number; height: number };
type WindowState = AppWindow & Rect & { z: number; workspace: number; maximized: boolean; shaded: boolean };
type Menu = "apps" | "tasks" | "file" | "window" | null;
const focusable = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]';

/** A queued app focus must not replace focus restored by entering or leaving preview. */
function currentFocusContext(owner: HTMLElement | null) {
  const preview = owner?.closest<HTMLElement>(".if-preview-frame") ?? null;
  const previewOpen = preview?.dataset.previewOpen;
  return () => Boolean(owner?.isConnected && !owner.closest("[hidden],[inert]")
    && owner.closest(".if-preview-frame") === preview && preview?.dataset.previewOpen === previewOpen);
}

function preferencesFrom(value: unknown): DesktopPreferences | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Partial<DesktopPreferences>;
  if (!["paper", "grid", "stripes"].includes(data.wallpaper ?? "") || typeof data.volume !== "number" || !Number.isFinite(data.volume) || typeof data.sound !== "boolean") return null;
  return { wallpaper: data.wallpaper!, volume: Math.max(0, Math.min(100, data.volume)), sound: data.sound };
}

function constrain(rect: Rect, bounds: { width: number; height: number }): Rect {
  const width = Math.min(bounds.width, Math.max(280, rect.width));
  const height = Math.min(bounds.height, Math.max(220, rect.height));
  return { width, height, x: Math.max(0, Math.min(rect.x, bounds.width - width)), y: Math.max(0, Math.min(rect.y, bounds.height - height)) };
}

function initialWindows(platform: Platform): WindowState[] {
  return [
    { id: 1, app: "files", title: appNames[platform].files, path: "/Documents", minimized: false, x: 100, y: 32, width: 420, height: 370, z: 1, workspace: 0, maximized: false, shaded: false },
    { id: 2, app: "editor", title: "Welcome.txt", path: welcomePath, minimized: false, x: 334, y: 160, width: 410, height: 330, z: 2, workspace: 0, maximized: false, shaded: false },
  ];
}

/** Window behaviors reimplemented from the user's classic, windowsxp and beos prototypes.
 * Pointer capture replaces their permanent document mouse listeners; all art is Vlak. */
function Desktop({ platform, active }: { platform: Platform; active: boolean }) {
  const names = appNames[platform];
  const desktop = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLElement | null>(null);
  const restoreFrame = useRef<number | null>(null);
  const windowFocusFrame = useRef<number | null>(null);
  const nextId = useRef(3);
  const topZ = useRef(2);
  const audioContext = useRef<AudioContext | null>(null);
  const menuId = useId();
  const instructionsId = useId();
  const [files, setFiles] = useState<FileSystem>(() => initialFileSystem(platform));
  const [preferences, setPreferences] = useState<DesktopPreferences>({ ...defaultPreferences });
  const [hydrated, setHydrated] = useState(false);
  const [storageState, setStorageState] = useState("Saved in this browser");
  const [windows, setWindows] = useState<WindowState[]>(() => initialWindows(platform));
  const [bounds, setBounds] = useState({ width: 850, height: 550 });
  const [compact, setCompact] = useState(false);
  const [workspace, setWorkspace] = useState(0);
  const [menu, setMenu] = useState<Menu>(null);
  const [search, setSearch] = useState("");
  const [clock, setClock] = useState("09:41");
  const [notice, setNotice] = useState("");
  const visibleWindows = windows.filter(win => !win.minimized && win.workspace === workspace);
  const front = visibleWindows.reduce<WindowState | undefined>((current, win) => !current || win.z > current.z ? win : current, undefined);
  const runningWindows = windows.filter(win => win.workspace === workspace);

  const cancelRestore = useCallback(() => {
    if (restoreFrame.current !== null) cancelAnimationFrame(restoreFrame.current);
    restoreFrame.current = null;
  }, []);
  const dismissMenu = useCallback((restore = true) => {
    cancelRestore();
    setMenu(null);
    const canFocus = currentFocusContext(desktop.current);
    if (restore) restoreFrame.current = requestAnimationFrame(() => { restoreFrame.current = null; if (canFocus() && menuTrigger.current?.isConnected) menuTrigger.current.focus({ preventScroll: true }); });
  }, [cancelRestore]);
  const openMenu = (next: Exclude<Menu, null>, trigger: HTMLElement) => {
    cancelRestore();
    if (windowFocusFrame.current !== null) cancelAnimationFrame(windowFocusFrame.current);
    windowFocusFrame.current = null;
    if (menu === next) { dismissMenu(); return; }
    menuTrigger.current = trigger;
    setSearch("");
    setMenu(next);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`vlak-desktop-os-${platform}-v1`);
      if (raw) {
        const data = JSON.parse(raw);
        const validFiles = validateFileSystem(data.files);
        const validPreferences = preferencesFrom(data.preferences);
        if (validFiles) setFiles(validFiles);
        if (validPreferences) setPreferences(validPreferences);
      }
    } catch { setStorageState("Changes stay in this session"); }
    setHydrated(true);
  }, [platform]);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(`vlak-desktop-os-${platform}-v1`, JSON.stringify({ files, preferences }));
      setStorageState("Saved in this browser");
    } catch { setStorageState("Changes stay in this session"); }
  }, [files, preferences, platform, hydrated]);
  useEffect(() => {
    if (!stage.current) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0]!.contentRect;
      if (width <= 0 || height <= 0) return;
      setBounds({ width, height });
      setCompact(width <= 680);
      if (width > 680) setWindows(current => current.map(win => ({ ...win, ...constrain(win, { width, height }) })));
    });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!active) {
      cancelRestore();
      if (windowFocusFrame.current !== null) cancelAnimationFrame(windowFocusFrame.current);
      windowFocusFrame.current = null;
      setMenu(null);
      return;
    }
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, [active, cancelRestore]);
  useLayoutEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLElement>(menu === "apps" ? "input" : focusable)?.focus({ preventScroll: true });
    const outside = (event: globalThis.PointerEvent) => {
      if (event.target instanceof Node && !desktop.current?.contains(event.target)) dismissMenu(false);
    };
    document.addEventListener("pointerdown", outside, true);
    return () => document.removeEventListener("pointerdown", outside, true);
  }, [menu, dismissMenu]);
  useEffect(() => () => {
    cancelRestore();
    if (windowFocusFrame.current !== null) cancelAnimationFrame(windowFocusFrame.current);
    void audioContext.current?.close();
  }, [cancelRestore]);

  const signal = () => {
    if (!preferences.sound || preferences.volume === 0) return;
    try {
      const context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 620;
      gain.gain.setValueAtTime(preferences.volume / 1500, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.09);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* Sound is optional when the browser cannot create an audio context. */ }
  };
  const focusWindow = (id: number, moveFocus = false) => {
    cancelRestore();
    const z = ++topZ.current;
    const targetWorkspace = windows.find(win => win.id === id)?.workspace;
    if (targetWorkspace !== undefined) setWorkspace(targetWorkspace);
    setWindows(current => current.map(win => win.id === id ? { ...win, minimized: false, z } : win));
    if (moveFocus) {
      if (windowFocusFrame.current !== null) cancelAnimationFrame(windowFocusFrame.current);
      const canFocus = currentFocusContext(desktop.current);
      windowFocusFrame.current = requestAnimationFrame(() => {
        windowFocusFrame.current = null;
        if (canFocus()) desktop.current?.querySelector<HTMLElement>(`[data-window-id="${id}"] .dos-window-title`)?.focus({ preventScroll: true });
      });
    }
  };
  const openApp = (app: AppId, path?: string) => {
    dismissMenu(false);
    if (app === "editor") path ??= "/Documents/Untitled.txt";
    const existing = windows.find(win => win.app === app && win.path === path);
    if (existing) { focusWindow(existing.id, true); signal(); return; }
    const id = nextId.current++;
    const offset = (id % 6) * 24;
    const rect = constrain({ x: 130 + offset, y: 34 + offset, width: app === "paint" ? 580 : app === "calculator" ? 340 : 470, height: app === "paint" ? 440 : app === "calculator" ? 500 : 390 }, bounds);
    const win: WindowState = { id, app, path, title: path && app === "editor" ? path.split("/").at(-1)! : names[app], minimized: false, ...rect, z: ++topZ.current, workspace, maximized: false, shaded: false };
    setWindows(current => [...current, win]);
    setNotice(`${names[app]} opened`);
    signal();
    if (windowFocusFrame.current !== null) cancelAnimationFrame(windowFocusFrame.current);
    const canFocus = currentFocusContext(desktop.current);
    windowFocusFrame.current = requestAnimationFrame(() => { windowFocusFrame.current = null; if (canFocus()) desktop.current?.querySelector<HTMLElement>(`[data-window-id="${id}"] .dos-window-title`)?.focus({ preventScroll: true }); });
  };
  const closeWindow = (id: number) => {
    setWindows(current => current.filter(win => win.id !== id));
    setNotice("Window closed");
    focusAfterRemoval();
  };
  const focusAfterRemoval = () => {
    if (windowFocusFrame.current !== null) cancelAnimationFrame(windowFocusFrame.current);
    const canFocus = currentFocusContext(desktop.current);
    windowFocusFrame.current = requestAnimationFrame(() => {
      windowFocusFrame.current = null;
      if (!canFocus()) return;
      const next = menuRef.current?.querySelector<HTMLElement>(focusable) ?? desktop.current?.querySelector<HTMLElement>(".dos-window[data-front='true'] .dos-window-title") ?? desktop.current?.querySelector<HTMLElement>(".dos-apps-trigger");
      next?.focus({ preventScroll: true });
    });
  };
  const updateWindow = (id: number, update: Partial<WindowState>) => setWindows(current => current.map(win => win.id === id ? { ...win, ...update } : win));
  const minimizeWindow = (id: number) => {
    updateWindow(id, { minimized: true });
    setNotice("Window minimized. Restore it from running apps.");
    focusAfterRemoval();
  };
  const zoomWindow = (win: WindowState) => updateWindow(win.id, { maximized: !win.maximized, shaded: false, z: ++topZ.current });
  const switchWorkspace = (next: number) => { setWorkspace(next); dismissMenu(Boolean(menu)); setNotice(`Workspace ${next + 1}`); };
  const arrange = (kind: "tile" | "cascade") => {
    const ids = visibleWindows.map(win => win.id);
    const columns = Math.ceil(Math.sqrt(ids.length));
    const rows = Math.ceil(ids.length / columns);
    setWindows(current => current.map(win => {
      const index = ids.indexOf(win.id);
      if (index < 0) return win;
      const rect = kind === "tile" ? { x: (index % columns) * bounds.width / columns, y: Math.floor(index / columns) * bounds.height / rows, width: bounds.width / columns, height: bounds.height / rows } : constrain({ x: 24 + index * 28, y: 18 + index * 28, width: 460, height: 370 }, bounds);
      return { ...win, ...rect, maximized: false, shaded: false };
    }));
    dismissMenu(Boolean(menu));
  };
  const drag = useRef<{ id: number; mode: "move" | "resize"; startX: number; startY: number; rect: Rect } | null>(null);
  const startPointer = (event: PointerEvent<HTMLButtonElement>, win: WindowState, mode: "move" | "resize") => {
    if (event.button !== 0 || compact || win.maximized) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    focusWindow(win.id);
    drag.current = { id: win.id, mode, startX: event.clientX, startY: event.clientY, rect: win };
  };
  const movePointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    const { id, mode, startX, startY, rect } = drag.current;
    const dx = event.clientX - startX, dy = event.clientY - startY;
    updateWindow(id, constrain(mode === "move" ? { ...rect, x: rect.x + dx, y: rect.y + dy } : { ...rect, width: Math.min(bounds.width - rect.x, rect.width + dx), height: Math.min(bounds.height - rect.y, rect.height + dy) }, bounds));
  };
  const stopPointer = () => { drag.current = null; };
  const windowKeyboard = (event: KeyboardEvent<HTMLButtonElement>, win: WindowState, resize = false) => {
    if (!event.key.startsWith("Arrow") || compact || win.maximized) return;
    event.preventDefault();
    const dx = event.key === "ArrowLeft" ? -16 : event.key === "ArrowRight" ? 16 : 0;
    const dy = event.key === "ArrowUp" ? -16 : event.key === "ArrowDown" ? 16 : 0;
    updateWindow(win.id, constrain(event.shiftKey || resize ? { ...win, width: win.width + dx, height: win.height + dy } : { ...win, x: win.x + dx, y: win.y + dy }, bounds));
  };
  const menuKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); dismissMenu(); return; }
    if (!["Tab", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    if (event.key !== "Tab" && event.target instanceof HTMLInputElement) return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(focusable)).filter(item => !item.hidden && item.getClientRects().length);
    if (!items.length) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey) ? -1 : 1) + items.length) % items.length;
    event.preventDefault();
    items[next]?.focus();
  };
  const trigger = (label: string, target: Exclude<Menu, null>, icon?: IconName, className = "") => <Button variant="ghost" size="sm" className={`dos-chrome-button ${target === "apps" ? "dos-apps-trigger" : ""} ${className}`} aria-haspopup="dialog" aria-expanded={menu === target} aria-controls={menu === target ? menuId : undefined} onClick={event => openMenu(target, event.currentTarget)}>{icon && <Icon name={icon} size={16} />}<span>{label}</span></Button>;
  const workspaceButtons = <div className="dos-workspaces" role="group" aria-label="Workspaces">{[0, 1, 2, 3].map(value => <Button key={value} variant="ghost" size="sm" className="dos-workspace-button" aria-label={`Workspace ${value + 1}`} aria-pressed={workspace === value} onClick={() => switchWorkspace(value)}>{value + 1}</Button>)}</div>;
  const tasks = <div className="dos-task-list" role="group" aria-label="Running applications">{runningWindows.map(win => <Button variant="ghost" size="sm" key={win.id} className="dos-task" aria-label={`${win.minimized ? "Restore" : "Switch to"} ${win.title}`} aria-pressed={front?.id === win.id} onClick={() => focusWindow(win.id, true)}><Icon name={appIcons[win.app]} size={16} /><span>{win.title}</span>{win.minimized && <span className="dos-minimized-mark" aria-hidden="true">·</span>}</Button>)}</div>;
  const dockApps = [...macFavorites, ...applications.filter(app => !macFavorites.includes(app) && windows.some(win => win.app === app))];
  const macDock = platform === "mac" && <div className="dos-mac-dockbar"><div className="dos-mac-dock" role="group" aria-label="Dock">
    {dockApps.map(app => {
      const appWindows = windows.filter(win => win.app === app);
      const latest = appWindows.reduce<WindowState | undefined>((current, win) => !current || win.z > current.z ? win : current, undefined);
      const action = latest ? latest.minimized ? "Restore" : "Switch to" : "Open";
      return <Button key={app} variant="ghost" className="dos-mac-dock-app" data-app={app} data-running={appWindows.length > 0} aria-label={`${action} ${names[app]}`} aria-pressed={front?.app === app} onClick={() => latest ? focusWindow(latest.id, true) : openApp(app)}><Icon name={appIcons[app]} size={24} /><span className="dos-mac-dock-label" aria-hidden="true">{names[app]}</span><span className="dos-mac-dock-dot" aria-hidden="true" /></Button>;
    })}
    <span className="dos-mac-dock-divider" aria-hidden="true" />
    <Button variant="ghost" className="dos-mac-dock-app dos-apps-trigger" aria-label="Applications" aria-haspopup="dialog" aria-expanded={menu === "apps"} aria-controls={menu === "apps" ? menuId : undefined} onClick={event => openMenu("apps", event.currentTarget)}><Icon name="grid" size={24} /><span className="dos-mac-dock-label" aria-hidden="true">Applications</span></Button>
    <Button variant="ghost" className="dos-mac-dock-app" aria-label="Open Trash" onClick={() => openApp("files", "/Trash")}><Icon name="trash" size={24} /><span className="dos-mac-dock-label" aria-hidden="true">Trash</span></Button>
  </div></div>;
  const statusClock = <Button variant="ghost" size="sm" className="dos-chrome-button dos-clock" aria-label={`Open calendar, ${clock}`} onClick={() => openApp("calendar")}><time>{clock}</time></Button>;

  return <div ref={desktop} className={`dos dos-${platform}`} data-platform={platform} data-compact={compact} data-wallpaper={preferences.wallpaper}>
    <p id={instructionsId} className="dos-sr-only">Drag a window by its title. With the title focused, arrow keys move the window and Shift plus arrow keys resize it.</p>
    <div className="dos-desktop-content" inert={menu !== null}>
      {(platform === "mac" || platform === "linux") && <div className="dos-menubar">
        {platform === "mac" ? <MacMenus active={active && menu === null} front={front} windows={windows} appName={front ? names[front.app] : "Finder"} onOpenApp={openApp} onApplications={opener => openMenu("apps", opener)} onFocusWindow={id => focusWindow(id, true)} onCloseWindow={closeWindow} onMinimizeWindow={minimizeWindow} onZoomWindow={id => { const win = windows.find(item => item.id === id); if (win) zoomWindow(win); }} onShadeWindow={id => { const win = windows.find(item => item.id === id); if (win) updateWindow(id, { shaded: !win.shaded }); }} onArrange={arrange} /> : <>{trigger("Activities", "apps")}<span className="dos-active-app">{front ? names[front.app] : "Desktop"}</span></>}
        <span className="dos-spacer" />{statusClock}
        {platform === "linux" && <Button variant="ghost" size="sm" className="dos-icon-button" aria-label="Open settings" onClick={() => openApp("settings")}><Icon name="settings" /></Button>}
      </div>}
      <div ref={stage} className="dos-stage" role="region" tabIndex={-1} aria-label={`${platforms.find(item => item.id === platform)!.label} desktop`}>
        <div className="dos-desktop-icons" role="group" aria-label="Desktop shortcuts">{(["files", "editor", "browser", "paint"] as AppId[]).map(app => <Button key={app} variant="ghost" className="dos-shortcut" onClick={() => openApp(app)}><Icon name={appIcons[app]} size={24} /><span>{names[app]}</span></Button>)}</div>
        {!front && <div className="dos-empty"><Icon name="monitor" size={24} /><p>Workspace {workspace + 1}</p>{trigger("Open an app", "apps", "plus")}</div>}
        {platform === "linux" && <div className="dos-dock" role="group" aria-label="Favorite applications">{(["files", "browser", "terminal", "editor"] as AppId[]).map(app => <Button variant="ghost" key={app} className="dos-icon-button" aria-label={`Open ${names[app]}`} onClick={() => openApp(app)}><Icon name={appIcons[app]} size={24} /></Button>)}{trigger("Apps", "apps", "grid")}</div>}
        {windows.map(win => {
          const isFront = front?.id === win.id;
          const hidden = win.minimized || win.workspace !== workspace || (compact && !isFront);
          const style: CSSProperties = { left: compact || win.maximized ? 0 : win.x, top: compact || win.maximized ? 0 : win.y, width: compact || win.maximized ? "100%" : win.width, height: compact ? "100%" : win.shaded ? 44 : win.maximized ? "100%" : win.height, zIndex: win.z };
          return <section key={win.id} className="dos-window" data-window-id={win.id} data-app={win.app} data-front={isFront} data-maximized={win.maximized} data-shaded={win.shaded} hidden={hidden} style={style} aria-label={`${win.title} window`} onPointerDownCapture={() => { if (!isFront) focusWindow(win.id); }} onFocusCapture={() => { if (!isFront) focusWindow(win.id); }}>
            <div className="dos-titlebar">
              {platform === "mac" && <Button variant="ghost" size="sm" className="dos-icon-button dos-close" aria-label={`Close ${win.title}`} onClick={() => closeWindow(win.id)}><Icon name="close" /></Button>}
              <button type="button" className="dos-window-title" aria-describedby={instructionsId} aria-label={`Move ${win.title}`} onPointerDown={event => startPointer(event, win, "move")} onPointerMove={movePointer} onPointerUp={stopPointer} onPointerCancel={stopPointer} onLostPointerCapture={stopPointer} onKeyDown={event => windowKeyboard(event, win)} onDoubleClick={() => platform === "mac" ? updateWindow(win.id, { shaded: !win.shaded }) : zoomWindow(win)}><Icon name={appIcons[win.app]} size={16} /><span>{win.title}</span></button>
              <div className="dos-window-actions">
                <Button variant="ghost" size="sm" className="dos-icon-button" aria-label={`Minimize ${win.title}`} onClick={() => minimizeWindow(win.id)}><Icon name="minus" /></Button>
                {platform === "mac" && <Button variant="ghost" size="sm" className="dos-icon-button dos-desktop-control" aria-label={`${win.shaded ? "Unshade" : "Shade"} ${win.title}`} onClick={() => updateWindow(win.id, { shaded: !win.shaded })}><Icon name="layers" /></Button>}
                <Button variant="ghost" size="sm" className="dos-icon-button dos-desktop-control" aria-label={`${win.maximized ? "Restore size of" : "Maximize"} ${win.title}`} onClick={() => zoomWindow(win)}><Icon name={win.maximized ? "minimize" : "expand"} /></Button>
                {platform !== "mac" && <Button variant="ghost" size="sm" className="dos-icon-button dos-close" aria-label={`Close ${win.title}`} onClick={() => closeWindow(win.id)}><Icon name="close" /></Button>}
              </div>
            </div>
            <div className="dos-window-body" hidden={win.shaded && !compact}><DesktopApp platform={platform} app={win.app} path={win.path} files={files} setFiles={setFiles} preferences={preferences} setPreferences={setPreferences} windows={windows} openApp={openApp} closeWindow={closeWindow} onDocumentSave={win.app === "editor" ? path => updateWindow(win.id, { path, title: path.split("/").at(-1)! }) : undefined} /></div>
            {!win.shaded && !win.maximized && <button type="button" className="dos-resize" aria-label={`Resize ${win.title}`} onPointerDown={event => startPointer(event, win, "resize")} onPointerMove={movePointer} onPointerUp={stopPointer} onPointerCancel={stopPointer} onLostPointerCapture={stopPointer} onKeyDown={event => windowKeyboard(event, win, true)}><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 12 12 4M8 12l4-4" fill="none" stroke="currentColor" /></svg></button>}
          </section>;
        })}
        {platform === "beos" && <div className="dos-deskbar">{trigger("BeOS", "apps", "grid")}{trigger(`${windows.length} apps`, "tasks", "layers")}{statusClock}</div>}
      </div>
      {macDock}
      <div className="dos-taskbar">
        {platform === "windows" ? trigger("Start", "apps", "grid") : trigger(platform === "beos" ? "Deskbar" : "Apps", "apps", "grid", "dos-mobile-launch")}
        <div className="dos-desktop-tasks">{tasks}</div>
        {trigger(`Tasks${runningWindows.length ? ` (${runningWindows.length})` : ""}`, "tasks", "layers", "dos-mobile-tasks")}
        <span className="dos-spacer" />
        {(platform === "linux" || platform === "beos") && workspaceButtons}
        {platform === "windows" && statusClock}
        {platform === "mac" && <Button variant="ghost" size="sm" className="dos-icon-button" aria-label="Open control panels" onClick={() => openApp("settings")}><Icon name="settings" /></Button>}
      </div>
    </div>
    {menu && <div className={`dos-menu-backdrop dos-menu-${menu}`} onPointerDown={event => { if (event.target === event.currentTarget) dismissMenu(); }}>
      <div ref={menuRef} className="dos-menu" role="dialog" aria-modal="true" aria-label={menu === "apps" ? `${platforms.find(item => item.id === platform)!.label} applications` : menu === "tasks" ? "Running applications" : `${menu === "file" ? "File" : "Window"} menu`} id={menuId} onKeyDown={menuKeyboard}>
        <div className="dos-menu-heading"><span>{menu === "apps" ? (platform === "linux" ? "Activities" : "Applications") : menu === "tasks" ? "Running apps" : menu === "file" ? "File" : "Window"}</span><Button variant="ghost" className="dos-icon-button" aria-label="Close menu" onClick={() => dismissMenu()}><Icon name="close" /></Button></div>
        {menu === "apps" && <><label className="dos-search"><Icon name="search" /><input type="search" placeholder="Find an app" aria-label="Find an app" value={search} onChange={event => setSearch(event.target.value)} /></label><div className="dos-app-grid">{applications.filter(app => `${names[app]} ${app}`.toLowerCase().includes(search.toLowerCase())).map(app => <Button key={app} variant="ghost" className="dos-app-launch" onClick={() => openApp(app)}><Icon name={appIcons[app]} size={24} /><span>{names[app]}</span></Button>)}</div>{!applications.some(app => `${names[app]} ${app}`.toLowerCase().includes(search.toLowerCase())) && <p className="dos-no-results">No apps match “{search}”.</p>}{(platform === "linux" || platform === "beos") && <div className="dos-menu-workspaces"><span>Workspaces</span>{workspaceButtons}</div>}</>}
        {(menu === "tasks" || menu === "window") && <div className="dos-menu-list">{windows.length ? windows.map(win => <div className="dos-running-row" key={win.id}><Button variant="ghost" className="dos-running-app" onClick={() => { dismissMenu(false); focusWindow(win.id, true); }}><Icon name={appIcons[win.app]} /><span>{win.title}<small>{win.minimized ? "Minimized" : "Open"}{win.workspace !== workspace ? ` · Workspace ${win.workspace + 1}` : ""}</small></span></Button><Button variant="ghost" className="dos-icon-button" aria-label={`Close ${win.title}`} onClick={() => closeWindow(win.id)}><Icon name="close" /></Button></div>) : <p className="dos-no-results">No apps are running.</p>}</div>}
        {menu === "window" && <div className="dos-menu-list dos-menu-commands"><Button variant="ghost" disabled={!front} onClick={() => { if (front) minimizeWindow(front.id); dismissMenu(); }}>Minimize current window</Button><Button variant="ghost" disabled={!visibleWindows.length} onClick={() => arrange("tile")}>Tile windows</Button><Button variant="ghost" disabled={!visibleWindows.length} onClick={() => arrange("cascade")}>Cascade windows</Button></div>}
        {menu === "file" && <div className="dos-menu-list"><Button variant="ghost" onClick={() => openApp("editor")}>New document</Button><Button variant="ghost" onClick={() => openApp("files", "/Documents")}>Open Documents</Button><Button variant="ghost" onClick={() => openApp("files", "/Trash")}>Open Trash</Button><Button variant="ghost" disabled={!front} onClick={() => { if (front) closeWindow(front.id); dismissMenu(); }}>Close current window</Button></div>}
      </div>
    </div>}
    <div className="dos-status"><span>{platforms.find(item => item.id === platform)!.edition}</span><span title={storageState}>{storageState}</span></div>
    <span className="dos-sr-only" role="status" aria-live="polite">{notice}</span>
  </div>;
}

export function Board() {
  const [platform, setPlatform] = useState<Platform>("mac");
  return <Tabs className="dos-board" value={platform} onValueChange={value => setPlatform(value as Platform)}><TabList className="dos-platform-tabs" aria-label="Operating system">{platforms.map(item => <Tab key={item.id} value={item.id}>{item.label}</Tab>)}</TabList>{platforms.map(item => <TabPanel className="dos-platform-panel" key={item.id} value={item.id}><Desktop platform={item.id} active={platform === item.id} /></TabPanel>)}</Tabs>;
}
