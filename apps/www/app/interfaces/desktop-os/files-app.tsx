"use client";
import * as React from "react";
import { Button, Icon, Input, Textarea } from "@noorddev/vlak-react";
import type { DesktopAppProps, FileSystem } from "./types";
import { basename, childrenOf, makeFolder, moveEntry, normalizePath, parentPath, removeEntry, runCommand, writeFile } from "./fs";

export function downloadFile(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function FilesApp({ files, setFiles, path, openApp }: DesktopAppProps) {
  const [directory, setDirectory] = React.useState(path ?? "/");
  const [selected, setSelected] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [action, setAction] = React.useState<"folder" | "rename" | "delete" | null>(null);
  const [name, setName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const upload = React.useRef<HTMLInputElement>(null);
  const latestFiles = React.useRef(files); latestFiles.current = files;
  const directoryExists = files.some(entry => entry.path === directory && entry.kind === "folder");
  const currentDirectory = directoryExists ? directory : "/";
  const entries = childrenOf(files, currentDirectory).filter(entry => basename(entry.path).toLowerCase().includes(query.toLowerCase()));
  const selectedEntry = files.find(entry => entry.path === selected);
  const navigate = (next: string) => { setDirectory(next); setSelected(null); setQuery(""); setAction(null); };
  const open = (target: string) => {
    const entry = files.find(file => file.path === target);
    if (entry?.kind === "folder") navigate(target);
    else if (entry?.content?.startsWith("data:image/")) openApp("paint", target);
    else openApp("editor", target);
  };
  const change = (operation: (files: FileSystem) => FileSystem, success: string) => {
    try { const next = operation(latestFiles.current); setFiles(() => next); setMessage(success); setAction(null); setSelected(null); }
    catch (error) { setMessage(error instanceof Error ? error.message : "The file could not be changed."); }
  };
  return <div className="dos-app dos-files">
    <div className="dos-app-toolbar">
      <Button variant="ghost" disabled={currentDirectory === "/"} aria-label="Parent folder" onClick={() => navigate(parentPath(currentDirectory))}><Icon name="arrow-left" size={16} /></Button>
      <span className="dos-path">{currentDirectory === "/" ? "Home" : currentDirectory}</span>
      <Button variant="ghost" onClick={() => { setAction("folder"); setName(""); }}>New folder</Button>
    </div>
    <Input plain aria-label="Search this folder" placeholder="Search this folder" value={query} onChange={event => setQuery(event.target.value)} />
    <div className="dos-file-list" role="group" aria-label={currentDirectory === "/" ? "Home files" : `Files in ${currentDirectory}`}>
      {entries.map(entry => <Button key={entry.path} variant="ghost" className="dos-file-row" aria-pressed={selected === entry.path} onClick={() => setSelected(entry.path)} onDoubleClick={() => open(entry.path)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); open(entry.path); } }}>
        <Icon name={entry.kind === "folder" ? "folder" : "file"} size={24} /><span>{basename(entry.path)}</span><small>{entry.kind === "folder" ? `${childrenOf(files, entry.path).length} items` : `${(entry.content?.length ?? 0).toLocaleString()} characters`}</small>
      </Button>)}
      {!entries.length && <p className="dos-app-muted">{query ? "No matching files." : "This folder is empty."}</p>}
    </div>
    <div className="dos-app-toolbar dos-app-actions">
      <Button disabled={!selectedEntry} onClick={() => selected && open(selected)}>Open</Button>
      <Button variant="ghost" disabled={!selectedEntry} onClick={() => { setAction("rename"); setName(basename(selected!)); }}>Rename</Button>
      <Button variant="ghost" disabled={!selectedEntry} onClick={() => setAction("delete")}>Delete</Button>
      <Button variant="ghost" onClick={() => openApp("editor", `${currentDirectory === "/" ? "" : currentDirectory}/Untitled.txt`)}>New text file</Button>
      <Button variant="ghost" onClick={() => upload.current?.click()}>Import text</Button>
      <Button variant="ghost" disabled={selectedEntry?.kind !== "file"} onClick={() => selectedEntry && downloadFile(basename(selectedEntry.path), selectedEntry.content ?? "")}>Export</Button>
      <input ref={upload} type="file" accept=".txt,.md,.csv,.json,text/plain,text/markdown" hidden onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = "";
        if (!file) return;
        if (file.size > 1_000_000) { setMessage("Choose a text file smaller than 1 MB."); return; }
        const target = normalizePath(file.name.replaceAll("/", "_"), currentDirectory);
        if (files.some(entry => entry.path === target)) { setMessage("A file already has that name. Rename it before importing."); return; }
        try { const content = await file.text(); change(current => { if (current.some(entry => entry.path === target)) throw new Error("A file already has that name."); return writeFile(current, target, content); }, `${file.name} imported`); }
        catch { setMessage("The file could not be read."); }
      }} />
    </div>
    {action && <form className="dos-inline-form" onSubmit={event => {
      event.preventDefault();
      if (action === "delete" && selected) change(current => removeEntry(current, selected), "Item deleted");
      else if (!name.trim() || name.includes("/") || name.trim() === "." || name.trim() === "..") setMessage("Use a file name without slashes.");
      else if (action === "folder") change(current => makeFolder(current, normalizePath(name.trim(), currentDirectory)), "Folder created");
      else if (selected) change(current => moveEntry(current, selected, normalizePath(name.trim(), currentDirectory)), "Item renamed");
    }}>
      {action === "delete" ? <p>Delete {selectedEntry && basename(selectedEntry.path)}{selectedEntry?.kind === "folder" ? " and everything inside it" : ""}?</p> : <Input label={action === "folder" ? "Folder name" : "New name"} aria-label={action === "folder" ? "Folder name" : "New name"} value={name} onChange={event => setName(event.target.value)} maxLength={80} required />}
      <div className="dos-app-toolbar"><Button type="submit">{action === "delete" ? "Delete item" : "Save name"}</Button><Button variant="ghost" onClick={() => setAction(null)}>Cancel</Button></div>
    </form>}
    <p className="dos-app-status" role="status">{message || `${entries.length} items`}</p>
  </div>;
}

const drafts = new Map<string, string>();
export function EditorApp({ platform, files, setFiles, path = "/Documents/Untitled.txt", onDocumentSave }: DesktopAppProps) {
  const [documentPath, setDocumentPath] = React.useState(path);
  const key = `${platform}:${documentPath}`;
  const saved = files.find(entry => entry.path === documentPath)?.content ?? "";
  const [text, setText] = React.useState(() => drafts.get(key) ?? saved);
  const [destination, setDestination] = React.useState(path);
  const previousSaved = React.useRef(saved);
  React.useEffect(() => {
    if (previousSaved.current !== saved) {
      const oldSaved = previousSaved.current;
      setText(current => current === oldSaved && !drafts.has(key) ? saved : current);
      previousSaved.current = saved;
    }
  }, [saved, key]);
  const [message, setMessage] = React.useState("");
  const dirty = text !== saved || normalizePath(destination) !== documentPath;
  const save = () => {
    try { const target = normalizePath(destination); const next = writeFile(files, target, text); setFiles(() => next); setDestination(target); setDocumentPath(target); drafts.delete(key); drafts.delete(`${platform}:${target}`); previousSaved.current = text; onDocumentSave?.(target); setMessage("Saved"); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save."); }
  };
  return <div className="dos-app dos-editor" onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); save(); } }}>
    <div className="dos-app-toolbar"><Input plain aria-label="Save file path" value={destination} onChange={event => setDestination(event.target.value)} maxLength={256} /><Button onClick={save}>Save</Button><Button variant="ghost" onClick={() => downloadFile(basename(destination), text)}>Export</Button></div>
    <Textarea className="dos-editor-text" aria-label="Document text" value={text} maxLength={200000} onChange={event => { setText(event.target.value); drafts.set(key, event.target.value); setMessage(""); }} spellCheck />
    <div className="dos-app-status" role="status"><span>{message || (dirty ? "Draft kept until you save" : "Saved document")}</span><span>{text.trim().split(/\s+/).filter(Boolean).length} words</span></div>
  </div>;
}

export function TerminalApp({ files, setFiles, platform }: DesktopAppProps) {
  const [cwd, setCwd] = React.useState("/Documents");
  const [command, setCommand] = React.useState("");
  const [history, setHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [lines, setLines] = React.useState(["Type help for commands. Files are shared with the text editor."]);
  const output = React.useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: each output append scrolls the terminal log
  React.useEffect(() => { output.current?.scrollTo({ top: output.current.scrollHeight }); }, [lines]);
  return <div className="dos-app dos-terminal">
    <div ref={output} className="dos-terminal-output" role="log" aria-label="Terminal output" aria-live="polite" tabIndex={0}>{lines.map((line, index) => <pre key={`${index}-${line.slice(0, 20)}`}>{line}</pre>)}</div>
    <form className="dos-terminal-prompt" onSubmit={event => {
      event.preventDefault();
      const result = runCommand(command, files, cwd);
      if (result.files !== files) setFiles(() => result.files);
      setCwd(result.cwd);
      setLines(current => result.clear ? [] : [...current.slice(-100), `${cwd}${platform === "windows" ? ">" : " $"} ${command}`, ...(result.output ? [result.output] : [])]);
      if (command.trim()) setHistory(current => [...current, command].slice(-100));
      setHistoryIndex(-1); setCommand("");
    }}>
      <Input plain aria-label="Terminal command" placeholder={`${cwd} ${platform === "windows" ? ">" : "$"}`} value={command} maxLength={2048} autoComplete="off" spellCheck={false} onChange={event => setCommand(event.target.value)} onKeyDown={event => {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        const next = event.key === "ArrowUp" ? Math.min(history.length - 1, historyIndex + 1) : Math.max(-1, historyIndex - 1);
        setHistoryIndex(next); setCommand(next < 0 ? "" : history[history.length - 1 - next] ?? "");
      }} />
      <Button type="submit">Run</Button>
    </form>
  </div>;
}
