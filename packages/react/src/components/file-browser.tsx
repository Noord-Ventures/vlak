"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";
import { Input } from "./input";
import { TreeView, type TreeNode } from "./tree-view";

export interface BrowserEntry { id: string; name: string; kind: "file" | "folder"; children?: BrowserEntry[]; size?: string; modified?: string; disabled?: boolean }
export interface FileBrowserProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onSelect"> {
  entries: BrowserEntry[];
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  folder?: string | null;
  defaultFolder?: string | null;
  onFolderChange?: (id: string | null) => void;
  onOpen?: (entry: BrowserEntry) => void;
}
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", width: "100%", minWidth: 0, gap: "1rem", color: vlak.ink },
  toolbar: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" },
  path: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.25rem", listStyleType: "none", padding: 0, margin: 0 },
  action: { width: "auto", minWidth: vlak.hit, minHeight: vlak.hit, paddingInline: "0.75rem" },
  active: { backgroundColor: vlak.controlFill, fontWeight: 600 },
  body: { display: "grid", gridTemplateColumns: { default: "minmax(10rem, 1fr) minmax(0, 3fr)", [mq.phone]: "minmax(0, 1fr)" }, gap: "1rem", minWidth: 0 },
  tree: { minWidth: 0, borderInlineEndWidth: vlak.hairline, borderInlineEndStyle: "solid", borderInlineEndColor: vlak.divider, paddingInlineEnd: "0.75rem" },
  content: { minWidth: 0, display: "flex", flexDirection: "column", gap: "0.75rem" },
  list: { listStyleType: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "0.5rem" },
  grid: { gridTemplateColumns: "repeat(auto-fill, minmax(8rem, 1fr))" },
  item: { display: "flex", gap: "0.75rem", alignItems: "center", width: "100%", minWidth: 0, minHeight: vlak.hit, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, padding: "0.75rem", backgroundColor: "transparent", color: vlak.ink, textAlign: "start", fontFamily: "inherit", fontSize: "0.875rem", cursor: "pointer", ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 }, ":disabled": { color: vlak.gray, cursor: "not-allowed" } },
  tile: { flexDirection: "column", alignItems: "flex-start", minHeight: "7.5rem" },
  selected: { backgroundColor: vlak.controlFill, fontWeight: 600 },
  name: { flex: "1 1 auto", minWidth: 0, overflowWrap: "anywhere" },
  meta: { color: vlak.gray, fontSize: "0.75rem", fontVariantNumeric: "tabular-nums", lineHeight: 1.45 },
  empty: { margin: 0, paddingBlock: "1rem", color: vlak.gray, lineHeight: 1.45 },
});
function findPath(entries: BrowserEntry[], id: string | null | undefined): BrowserEntry[] | null {
  if (id == null) return [];
  for (const entry of entries) { if (entry.id === id) return [entry]; if (entry.children) { const child = findPath(entry.children, id); if (child) return [entry, ...child]; } }
  return null;
}
const folderNodes = (entries: BrowserEntry[]): TreeNode[] => entries.filter(entry => entry.kind === "folder").map(entry => ({ id: entry.id, label: entry.name, disabled: entry.disabled, children: folderNodes(entry.children ?? []) }));

/** A controlled file collection with folder tree, breadcrumbs, search, and list or grid views. */
export const FileBrowser = React.forwardRef<HTMLDivElement, FileBrowserProps>(function FileBrowser({ entries, label = "Files", value, defaultValue, onValueChange, folder, defaultFolder = null, onFolderChange, onOpen, className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const [innerFolder, setInnerFolder] = React.useState<string | null>(defaultFolder);
  const [view, setView] = React.useState<"list" | "grid">("list");
  const [query, setQuery] = React.useState("");
  const rootId = React.useId();
  const folderId = folder === undefined ? innerFolder : folder;
  const rawPath = findPath(entries, folderId) ?? [];
  const path = rawPath.at(-1)?.kind === "file" ? rawPath.slice(0, -1) : rawPath;
  const currentFolder = path.at(-1);
  const pathKey = JSON.stringify(path.map(entry => entry.id));
  const [expandedIds, setExpandedIds] = React.useState<string[]>(() => [rootId, ...path.map(entry => entry.id)]);
  React.useEffect(() => {
    const visibleAncestors = [rootId, ...JSON.parse(pathKey) as string[]];
    setExpandedIds(previous => visibleAncestors.every(id => previous.includes(id)) ? previous : [...new Set([...previous, ...visibleAncestors])]);
  }, [pathKey, rootId]);
  const visible = (currentFolder?.children ?? entries).filter(entry => entry.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const selected = value ?? inner;
  const chosen = (currentFolder?.children ?? entries).find(entry => entry.id === selected);
  const navigate = (next: string | null) => { if (folder === undefined) setInnerFolder(next); onFolderChange?.(next); setQuery(""); };
  const select = (entry: BrowserEntry) => { if (entry.disabled) return; if (entry.kind === "folder") navigate(entry.id); else { if (value === undefined) setInner(entry.id); onValueChange?.(entry.id); } };
  const root = rs(["rs-file-browser", className], styles.root);
  const toolbar = rs(["rs-file-browser-toolbar"], styles.toolbar);
  const pathStyle = rs(["rs-file-browser-path"], styles.path);
  const action = rs(["rs-file-browser-action"], styles.action);
  const body = rs(["rs-file-browser-body"], styles.body);
  const tree = rs(["rs-file-browser-tree"], styles.tree);
  const content = rs(["rs-file-browser-content"], styles.content);
  const list = rs(["rs-file-browser-list", view === "grid" && "rs-file-browser-grid"], styles.list, view === "grid" && styles.grid);
  const name = rs(["rs-file-browser-name"], styles.name);
  const meta = rs(["rs-file-browser-meta"], styles.meta);
  const empty = rs(["rs-file-browser-empty"], styles.empty);
  return <div ref={ref} role="region" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...toolbar}><nav aria-label={`${label} breadcrumbs`}><ol {...pathStyle}><li><Button {...action} variant="ghost" aria-current={path.length === 0 ? "location" : undefined} onClick={() => navigate(null)}>{label}</Button></li>{path.map((entry, index) => <li key={entry.id}><Button {...action} variant="ghost" aria-current={index === path.length - 1 ? "location" : undefined} onClick={() => navigate(entry.id)}><Icon name="chevron-right" size={12} />{entry.name}</Button></li>)}</ol></nav></div>
    <div {...body}>
      <aside {...tree} aria-label={`${label} folders`}><TreeView nodes={[{ id: rootId, label, children: folderNodes(entries) }]} label={`${label} folder tree`} value={currentFolder?.id ?? rootId} expanded={expandedIds} onExpandedChange={setExpandedIds} onValueChange={id => navigate(id === rootId ? null : id)} /></aside>
      <div {...content}>
        <Input type="search" aria-label="Search this folder" placeholder="Search this folder" value={query} onChange={event => setQuery(event.target.value)} />
        <div {...toolbar} role="group" aria-label="File view">{(["list", "grid"] as const).map(mode => { const choice = rs(["rs-file-browser-action", view === mode && "rs-file-browser-view-active"], styles.action, view === mode && styles.active); return <Button key={mode} {...choice} variant="ghost" aria-pressed={view === mode} onClick={() => setView(mode)}><Icon name={mode} />{mode === "list" ? "List" : "Grid"}</Button>; })}{onOpen && <Button {...action} variant="ghost" disabled={!chosen || chosen.disabled} onClick={() => { if (chosen && !chosen.disabled) onOpen(chosen); }}>Open selected</Button>}</div>
        <ul {...list} aria-label={currentFolder?.name ?? label}>{visible.map(entry => { const selectedFile = entry.kind === "file" && entry.id === selected; const row = rs(["rs-file-browser-item", view === "grid" && "rs-file-browser-tile", selectedFile && "rs-file-browser-selected"], styles.item, view === "grid" && styles.tile, selectedFile && styles.selected); return <li key={entry.id}><button {...row} type="button" disabled={entry.disabled} aria-pressed={entry.kind === "file" ? selectedFile : undefined} onClick={() => select(entry)} onDoubleClick={() => { if (!entry.disabled && entry.kind === "file") onOpen?.(entry); }}><Icon name={entry.kind === "folder" ? "folder" : "file"} size={view === "grid" ? 24 : 16} /><span {...name}>{entry.name}</span><span {...meta}>{entry.kind === "folder" ? "Folder" : entry.size ?? "File"}{entry.modified ? ` · ${entry.modified}` : ""}</span></button></li>; })}</ul>
        {visible.length === 0 && <p {...empty} role="status">{query ? "No files match this search." : "This folder is empty."}</p>}
      </div>
    </div>
  </div>;
});
