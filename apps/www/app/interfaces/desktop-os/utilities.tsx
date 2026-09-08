"use client";
import * as React from "react";
import { Button, Icon, Input, Switch, Textarea } from "@noorddev/vlak-react";
import { basename, writeFile } from "./fs";
import { appNames, type DesktopAppProps } from "./types";
import "./utilities.css";

const drawingWidth = 720, drawingHeight = 480;
const drawingPaper = "#fafafa", drawingInk = "#202020";

export function exportPNG(canvas: HTMLCanvasElement, name: string) {
  const anchor = document.createElement("a");
  anchor.href = canvas.toDataURL("image/png");
  anchor.download = name.toLowerCase().endsWith(".png") ? name : `${name}.png`;
  anchor.click();
}

export function PaintApp({ files, setFiles, path, platform }: DesktopAppProps) {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const history = React.useRef<ImageData[]>([]);
  const stroke = React.useRef<{ id: number; x: number; y: number } | null>(null);
  const [tool, setTool] = React.useState<"ink" | "eraser">("ink");
  const [width, setWidth] = React.useState(4);
  const [name, setName] = React.useState(path ? basename(path) : "Drawing.png");
  const [undoCount, setUndoCount] = React.useState(0);
  const [status, setStatus] = React.useState("Ready to draw");
  const [ready, setReady] = React.useState(false);
  const [cursor, setCursor] = React.useState({ x: drawingWidth / 2, y: drawingHeight / 2 });
  const [keyboard, setKeyboard] = React.useState(false);
  const instructions = React.useId();
  const initialFiles = React.useRef(files); initialFiles.current = files;
  // biome-ignore lint/correctness/useExhaustiveDependencies: Switching desktops resets the drawing even when its path is unchanged.
  React.useEffect(() => {
    const surface = canvas.current, context = surface?.getContext("2d");
    if (!surface || !context) return;
    let cancelled = false;
    stroke.current = null; history.current = []; setUndoCount(0); setReady(false);
    context.fillStyle = drawingPaper; context.fillRect(0, 0, drawingWidth, drawingHeight);
    setName(path ? basename(path) : "Drawing.png");
    const content = initialFiles.current.find(file => file.path === path)?.content;
    if (!path) { setReady(true); setStatus("Ready to draw"); return; }
    if (!content || !/^data:image\/(png|jpeg|webp|gif);base64,/.test(content)) {
      setReady(true); setStatus("This file is not a supported drawing. The canvas is empty."); return;
    }
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const scale = Math.min(drawingWidth / image.width, drawingHeight / image.height);
      context.drawImage(image, (drawingWidth - image.width * scale) / 2, (drawingHeight - image.height * scale) / 2, image.width * scale, image.height * scale);
      setReady(true); setStatus(`Opened ${basename(path)}`);
    };
    image.onerror = () => { if (!cancelled) { setReady(true); setStatus("The drawing could not be opened."); } };
    image.src = content;
    return () => { cancelled = true; image.onload = null; image.onerror = null; };
  }, [path, platform]);
  const remember = () => {
    const context = canvas.current?.getContext("2d"); if (!context) return;
    history.current = [...history.current.slice(-11), context.getImageData(0, 0, drawingWidth, drawingHeight)];
    setUndoCount(history.current.length);
  };
  const undo = () => {
    const previous = history.current.pop(); if (!previous) return;
    stroke.current = null; canvas.current?.getContext("2d")?.putImageData(previous, 0, 0);
    setUndoCount(history.current.length); setStatus("Undid the last change");
  };
  const mark = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const context = canvas.current?.getContext("2d"); if (!context) return;
    const size = tool === "eraser" ? width * 5 : width;
    context.strokeStyle = context.fillStyle = tool === "eraser" ? drawingPaper : drawingInk;
    context.lineWidth = size; context.lineCap = context.lineJoin = "round";
    context.beginPath(); context.moveTo(from.x, from.y); context.lineTo(to.x, to.y); context.stroke();
    if (from.x === to.x && from.y === to.y) { context.beginPath(); context.arc(to.x, to.y, size / 2, 0, Math.PI * 2); context.fill(); }
  };
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(drawingWidth, (event.clientX - box.left) * drawingWidth / box.width)), y: Math.max(0, Math.min(drawingHeight, (event.clientY - box.top) * drawingHeight / box.height)) };
  };
  const fileName = () => {
    const value = name.trim();
    if (!value || (value.includes("/") || value.includes("\\") || [...value].some(character => character.charCodeAt(0) < 32)) || value === "." || value === "..") throw new Error("Choose a file name without slashes.");
    return value.toLowerCase().endsWith(".png") ? value : `${value}.png`;
  };
  const save = () => {
    if (!canvas.current || !ready) return;
    try {
      const destination = `/Pictures/${fileName()}`;
      const next = writeFile(files, destination, canvas.current.toDataURL("image/png"));
      setFiles(() => next); setName(basename(destination)); setStatus(`Saved to ${destination}`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "The drawing could not be saved."); }
  };
  return <div className="dos-app dos-paint" onKeyDown={event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") { event.preventDefault(); save(); }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && event.target === canvas.current) { event.preventDefault(); undo(); }
  }}>
    <div className="dos-app-toolbar dos-utility-toolbar" aria-label="Drawing tools" role="group">
      <Button variant="ghost" aria-pressed={tool === "ink"} onClick={() => setTool("ink")}>Ink</Button>
      <Button variant="ghost" aria-pressed={tool === "eraser"} onClick={() => setTool("eraser")}>Eraser</Button>
      <label className="dos-utility-range">Size <input type="range" min="1" max="12" value={width} onChange={event => setWidth(Number(event.target.value))} /><output>{width}</output></label>
      <Button variant="ghost" disabled={!undoCount || !ready} onClick={undo}>Undo</Button>
      <Button variant="ghost" disabled={!ready} onClick={() => { remember(); const context = canvas.current?.getContext("2d"); if (context) { context.fillStyle = drawingPaper; context.fillRect(0, 0, drawingWidth, drawingHeight); } setStatus("Canvas cleared. Undo restores it."); }}>Clear</Button>
    </div>
    <div className="dos-paint-sheet">
      <canvas ref={canvas} width={drawingWidth} height={drawingHeight} tabIndex={0} aria-label="Drawing canvas" aria-describedby={instructions}
        onFocus={() => setKeyboard(true)} onBlur={() => setKeyboard(false)}
        onPointerDown={event => { if (!ready || event.button !== 0 || stroke.current) return; event.preventDefault(); event.currentTarget.focus(); setKeyboard(false); const p = point(event); remember(); stroke.current = { id: event.pointerId, ...p }; event.currentTarget.setPointerCapture(event.pointerId); mark(p, p); setStatus("Drawing changed"); }}
        onPointerMove={event => { if (stroke.current?.id !== event.pointerId) return; const next = point(event); mark(stroke.current, next); stroke.current = { id: event.pointerId, ...next }; }}
        onPointerUp={event => { if (stroke.current?.id === event.pointerId) { setCursor(point(event)); stroke.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); } }}
        onPointerCancel={() => { stroke.current = null; }} onLostPointerCapture={() => { stroke.current = null; }}
        onKeyDown={event => {
          if (!ready || event.metaKey || event.ctrlKey) return;
          const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
          if (direction) {
            event.preventDefault(); setKeyboard(true);
            const next = { x: Math.max(0, Math.min(drawingWidth, cursor.x + direction[0]! * 10)), y: Math.max(0, Math.min(drawingHeight, cursor.y + direction[1]! * 10)) };
            if (event.shiftKey) { remember(); mark(cursor, next); setStatus("Drawing changed"); } setCursor(next);
          } else if (event.key === " ") { event.preventDefault(); remember(); mark(cursor, cursor); setStatus("Drawing changed"); }
        }} />
      {keyboard && <span className="dos-paint-cursor" aria-hidden="true" style={{ left: `${cursor.x / drawingWidth * 100}%`, top: `${cursor.y / drawingHeight * 100}%` }} />}
    </div>
    <p id={instructions} className="dos-app-muted dos-utility-help">Draw with a pointer. On the canvas, arrows move the brush, Shift + arrows draw, and Space makes a mark.</p>
    <div className="dos-app-toolbar dos-utility-toolbar"><Input plain aria-label="Drawing file name" value={name} maxLength={80} onChange={event => setName(event.target.value)} /><Button disabled={!ready} onClick={save}>Save</Button><Button variant="ghost" disabled={!ready} onClick={() => { try { if (canvas.current) { exportPNG(canvas.current, fileName()); setStatus("PNG exported"); } } catch (error) { setStatus(error instanceof Error ? error.message : "Could not export."); } }}>Export PNG</Button></div>
    <p className="dos-app-status" role="status">{status}</p>
  </div>;
}

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const dayLabel = (date: Date) => date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
export function CalendarApp({ files, setFiles }: DesktopAppProps) {
  const [selected, setSelected] = React.useState(() => new Date());
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState("");
  const key = dateKey(selected), destination = `/Documents/Calendar/${key}.txt`;
  const saved = files.find(file => file.path === destination)?.content ?? "", note = drafts[key] ?? saved;
  const today = dateKey(new Date()), year = selected.getFullYear(), month = selected.getMonth();
  const days = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => new Date(year, month, i + 1));
  const blanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const monthName = selected.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const select = (date: Date) => { setSelected(date); setStatus(""); };
  const moveMonth = (step: number) => { const target = new Date(year, month + step, 1); target.setDate(Math.min(selected.getDate(), new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate())); select(target); };
  const hasNote = (date: Date) => (drafts[dateKey(date)] ?? files.find(file => file.path === `/Documents/Calendar/${dateKey(date)}.txt`)?.content ?? "").trim();
  return <div className="dos-app dos-calendar">
    <div className="dos-app-toolbar dos-utility-toolbar dos-calendar-heading"><Button variant="ghost" aria-label="Previous month" onClick={() => moveMonth(-1)}><Icon name="arrow-left" size={16} /></Button><h2 aria-live="polite">{monthName}</h2><Button variant="ghost" aria-label="Next month" onClick={() => moveMonth(1)}><Icon name="arrow-right" size={16} /></Button><Button variant="ghost" onClick={() => select(new Date())}>Today</Button></div>
    <div className="dos-calendar-layout">
      <div className="dos-calendar-days" role="group" aria-label={`Days in ${monthName}`}>
        <div className="dos-calendar-weekdays" aria-hidden="true">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <span key={day}>{day}</span>)}</div>
        <div className="dos-calendar-month">{Array.from({ length: blanks }, (_, i) => <span key={`blank-${i}`} className="dos-calendar-blank" aria-hidden="true" />)}{days.map(date => <Button key={dateKey(date)} variant="ghost" className="dos-calendar-day" aria-label={`${dayLabel(date)}${hasNote(date) ? ", has note" : ""}`} aria-pressed={dateKey(date) === key} aria-current={dateKey(date) === today ? "date" : undefined} onClick={() => select(date)}><span className="dos-calendar-number">{date.getDate()}</span><span className="dos-calendar-agenda-label">{date.toLocaleDateString(undefined, { weekday: "short" })}</span><span className="dos-calendar-note-preview">{hasNote(date) || "No note"}</span>{hasNote(date) && <span className="dos-calendar-dot" aria-hidden="true" />}</Button>)}</div>
      </div>
      <form className="dos-calendar-note" onSubmit={event => { event.preventDefault(); try { const next = writeFile(files, destination, note); setFiles(() => next); setDrafts(current => { const copy = { ...current }; delete copy[key]; return copy; }); setStatus(`Saved note for ${selected.toLocaleDateString()}`); } catch (error) { setStatus(error instanceof Error ? error.message : "The note could not be saved."); } }}>
        <h3>{dayLabel(selected)}</h3><Textarea aria-label="Day note" placeholder="Keep a note for this day" value={note} maxLength={20000} onChange={event => { setDrafts(current => ({ ...current, [key]: event.target.value })); setStatus(""); }} /><Button type="submit">Save note</Button><p className="dos-app-status" role="status">{status || (note !== saved ? "Unsaved note" : saved ? "Saved note" : "No note for this day")}</p>
      </form>
    </div>
  </div>;
}

export function SettingsApp({ preferences, setPreferences }: DesktopAppProps) {
  const audio = React.useRef<AudioContext | null>(null), gain = React.useRef<GainNode | null>(null);
  const [status, setStatus] = React.useState("");
  React.useEffect(() => () => { const context = audio.current; audio.current = null; void context?.close().catch(() => {}); }, []);
  React.useEffect(() => { if (audio.current && gain.current) gain.current.gain.setTargetAtTime(preferences.sound ? preferences.volume / 100 * .12 : 0, audio.current.currentTime, .01); }, [preferences.volume, preferences.sound]);
  const tone = async () => {
    try {
      if (!window.AudioContext) { setStatus("Sound is unavailable in this browser."); return; }
      const context = audio.current ?? new AudioContext(); audio.current = context;
      await context.resume(); if (audio.current !== context) return;
      const oscillator = context.createOscillator(), level = context.createGain(); gain.current = level;
      oscillator.type = "sine"; oscillator.frequency.value = 523.25;
      level.gain.setValueAtTime(0, context.currentTime); level.gain.linearRampToValueAtTime(preferences.volume / 100 * .12, context.currentTime + .02); level.gain.linearRampToValueAtTime(0, context.currentTime + .3);
      oscillator.connect(level); level.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .31);
      oscillator.onended = () => { oscillator.disconnect(); level.disconnect(); if (gain.current === level) gain.current = null; };
      setStatus("Test tone played");
    } catch { setStatus("Sound could not start. Try the tone again."); }
  };
  return <div className="dos-app dos-preferences">
    <section className="dos-settings-section"><h2>Desktop</h2><p className="dos-app-muted">Choose the paper behind your windows.</p><div className="dos-wallpaper-options" role="group" aria-label="Wallpaper">{(["paper", "grid", "stripes"] as const).map(value => <Button key={value} variant="ghost" aria-pressed={preferences.wallpaper === value} onClick={() => setPreferences(current => ({ ...current, wallpaper: value }))}><span className="dos-wallpaper-sample" data-wallpaper={value} aria-hidden="true" /><span>{value[0]!.toUpperCase() + value.slice(1)}</span></Button>)}</div></section>
    <section className="dos-settings-section"><h2>Sound</h2><div className="dos-setting-row"><span>Desktop sounds</span><Switch aria-label="Desktop sounds" checked={preferences.sound} onCheckedChange={sound => setPreferences(current => ({ ...current, sound }))} /></div><label className="dos-utility-range dos-volume">Volume <input type="range" min="0" max="100" step="1" value={preferences.volume} onChange={event => { const volume = Number(event.target.value); setPreferences(current => ({ ...current, volume })); }} /><output>{preferences.volume}%</output></label><Button variant="ghost" disabled={!preferences.sound || preferences.volume === 0} onClick={() => void tone()}>Play test tone</Button><p className="dos-app-status" role="status">{status || (!preferences.sound ? "Sound is off" : preferences.volume === 0 ? "Volume is muted" : "Sound is on")}</p></section>
  </div>;
}

export function MonitorApp({ windows, files, closeWindow, platform }: DesktopAppProps) {
  const storedFiles = files.filter(file => file.kind === "file"), byteCount = new TextEncoder().encode(storedFiles.map(file => file.content ?? "").join("")).byteLength;
  const bytes = byteCount < 1024 ? `${byteCount} B` : `${(byteCount / 1024).toFixed(1)} KB`;
  return <div className="dos-app dos-monitor"><div className="dos-monitor-stats"><div><span>Open windows</span><strong>{windows.length}</strong></div><div><span>Minimized</span><strong>{windows.filter(window => window.minimized).length}</strong></div><div><span>Files</span><strong>{storedFiles.length}</strong></div><div><span>File content</span><strong>{bytes}</strong></div></div>
    <div className="dos-monitor-list" role="group" aria-label="Open desktop windows">{windows.map(window => <div key={window.id} className="dos-task-row"><div><strong>{window.title}</strong><span>{appNames[platform][window.app]} · {window.minimized ? "Minimized" : "Open"}</span></div><Button variant="ghost" aria-label={`Close ${window.title}`} onClick={() => closeWindow(window.id)}>End task</Button></div>)}{!windows.length && <p className="dos-app-muted">No windows are open.</p>}</div><p className="dos-app-status">{files.filter(file => file.kind === "folder").length} folders · File content is measured as UTF-8 bytes.</p>
  </div>;
}

const mineRows = 5, mineCount = 5;
type MineGame = { mines: Set<number> | null; revealed: Set<number>; flags: Set<number>; status: "ready" | "playing" | "won" | "lost" };
const freshGame = (): MineGame => ({ mines: null, revealed: new Set(), flags: new Set(), status: "ready" });
function neighbors(cell: number) {
  const row = Math.floor(cell / mineRows), column = cell % mineRows, cells: number[] = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && row + dy >= 0 && row + dy < mineRows && column + dx >= 0 && column + dx < mineRows) cells.push((row + dy) * mineRows + column + dx);
  return cells;
}
function plantMines(first: number) {
  const safe = new Set([first, ...neighbors(first)]), candidates = Array.from({ length: 25 }, (_, i) => i).filter(i => !safe.has(i));
  for (let i = candidates.length - 1; i > 0; i--) { const next = Math.floor(Math.random() * (i + 1)); [candidates[i], candidates[next]] = [candidates[next]!, candidates[i]!]; }
  return new Set(candidates.slice(0, mineCount));
}
export function MinesApp(_props: DesktopAppProps) {
  const [game, setGame] = React.useState<MineGame>(freshGame), [flagMode, setFlagMode] = React.useState(false), [focused, setFocused] = React.useState(0);
  const cells = React.useRef<(HTMLButtonElement | null)[]>([]);
  const ended = game.status === "won" || game.status === "lost";
  const flag = (cell: number) => setGame(current => { if (current.status === "won" || current.status === "lost" || current.revealed.has(cell)) return current; const flags = new Set(current.flags); if (flags.has(cell)) flags.delete(cell); else if (flags.size < mineCount) flags.add(cell); return { ...current, flags }; });
  const reveal = (cell: number) => setGame(current => {
    if (current.status === "won" || current.status === "lost" || current.flags.has(cell) || current.revealed.has(cell)) return current;
    const mines = current.mines ?? plantMines(cell), revealed = new Set(current.revealed);
    if (mines.has(cell)) { revealed.add(cell); return { ...current, mines, revealed, status: "lost" }; }
    const pending = [cell];
    while (pending.length) { const next = pending.pop()!; if (revealed.has(next) || current.flags.has(next) || mines.has(next)) continue; revealed.add(next); const adjacent = neighbors(next); if (!adjacent.some(value => mines.has(value))) pending.push(...adjacent); }
    const won = revealed.size === mineRows * mineRows - mineCount;
    return { mines, revealed, flags: won ? new Set(mines) : current.flags, status: won ? "won" : "playing" };
  });
  const message = game.status === "won" ? "Field cleared. You found every safe square." : game.status === "lost" ? "A mine was uncovered. Start a new game to try again." : game.status === "ready" ? "Choose a square. Your first move is safe." : `${game.revealed.size} of 20 safe squares revealed`;
  return <div className="dos-app dos-mines"><div className="dos-app-toolbar dos-utility-toolbar"><strong>{mineCount - game.flags.size} flags left</strong><Button variant="ghost" aria-pressed={flagMode} disabled={ended} onClick={() => setFlagMode(value => !value)}>Flag mode</Button><Button variant="ghost" onClick={() => { setGame(freshGame()); setFlagMode(false); }}>New game</Button></div><p className="dos-app-status" role="status">{message}</p>
    <div className="dos-mine-board" role="group" aria-label="Mine field, five rows and five columns">{Array.from({ length: 25 }, (_, cell) => {
      const revealed = game.revealed.has(cell), mine = game.mines?.has(cell), flagged = game.flags.has(cell), count = neighbors(cell).filter(value => game.mines?.has(value)).length;
      const state = game.status === "lost" && mine ? "mine" : revealed ? "open" : flagged ? "flag" : "covered";
      const label = `Row ${Math.floor(cell / mineRows) + 1}, column ${cell % mineRows + 1}, ${state === "mine" ? "mine" : revealed ? count ? `${count} neighboring mines` : "empty" : flagged ? "flagged" : "covered"}`;
      return <Button ref={element => { cells.current[cell] = element; }} key={cell} variant="ghost" className="dos-mine-cell" data-state={state} aria-label={label} aria-disabled={ended || revealed} tabIndex={focused === cell ? 0 : -1} onFocus={() => setFocused(cell)} onClick={() => flagMode ? flag(cell) : reveal(cell)} onContextMenu={event => { event.preventDefault(); flag(cell); }} onKeyDown={event => {
        if (event.key.toLowerCase() === "f") { event.preventDefault(); flag(cell); return; }
        const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -5, ArrowDown: 5, Home: -(cell % 5), End: 4 - cell % 5 }[event.key];
        if (offset === undefined) return; event.preventDefault(); cells.current[Math.max(0, Math.min(24, cell + offset))]?.focus();
      }}>{state === "mine" ? "●" : flagged ? "⚑" : revealed && count ? count : ""}</Button>;
    })}</div><p className="dos-app-muted dos-utility-help">Five mines. Numbers count neighboring mines. Use Flag mode, right-click, or press F to mark a square. Arrow keys move between squares.</p>
  </div>;
}
