"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon } from "./icon";

export interface TreeNode { id: string; label: string; disabled?: boolean; children?: TreeNode[] }
export interface TreeViewProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "defaultValue" | "onSelect"> {
  nodes: TreeNode[];
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
}
const styles = stylex.create({
  root: { listStyleType: "none", margin: 0, padding: 0, color: vlak.ink, minWidth: 0, width: "100%", boxSizing: "border-box", fontSize: "0.875rem", lineHeight: 1.45 },
  group: { listStyleType: "none", margin: 0, paddingInlineStart: "1rem", minWidth: 0, boxSizing: "border-box" },
  item: { display: "flex", alignItems: "center", gap: "0.25rem", minHeight: vlak.hit, minWidth: vlak.hit, width: "100%", paddingInline: "0.25rem", boxSizing: "border-box", borderRadius: vlak.radiusSm, cursor: "pointer", outlineColor: vlak.ink, outlineOffset: -2, ":focus-visible": { outlineWidth: 2, outlineStyle: "solid" } },
  label: { flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  selected: { backgroundColor: vlak.controlFill, fontWeight: 600 },
  disabled: { color: vlak.gray, cursor: "not-allowed" },
  spacer: { width: vlak.hit, flexShrink: 0 },
  disclosure: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: vlak.hit, height: vlak.hit, minWidth: vlak.hit, minHeight: vlak.hit, flexShrink: 0, boxSizing: "border-box", borderWidth: 0, borderRadius: vlak.radiusSm, backgroundColor: "transparent", color: vlak.ink, cursor: "pointer", padding: 0 },
});
function flatten(nodes: TreeNode[], open: Set<string>, parent?: string): Array<{ node: TreeNode; parent?: string }> {
  return nodes.flatMap(node => [{ node, parent }, ...(node.children && open.has(node.id) ? flatten(node.children, open, node.id) : [])]);
}

/** Single selection and APG-style roving focus through a hierarchical collection. */
export const TreeView = React.forwardRef<HTMLUListElement, TreeViewProps>(function TreeView({ nodes, label, value, defaultValue, onValueChange, expanded, defaultExpanded = [], onExpandedChange, className, style, onKeyDown, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const [innerExpanded, setInnerExpanded] = React.useState(defaultExpanded);
  const [focused, setFocused] = React.useState<string | undefined>(defaultValue);
  const current = value ?? inner;
  const open = new Set(expanded ?? innerExpanded);
  const visible = flatten(nodes, open);
  const active = visible.some(item => item.node.id === focused) ? focused : visible[0]?.node.id;
  const elements = React.useRef(new Map<string, HTMLDivElement>());
  const typeAhead = React.useRef({ text: "", time: 0 });
  const treeId = React.useId();
  const expand = (id: string, state: boolean) => { const next = new Set(open); if (state) next.add(id); else next.delete(id); const ids = [...next]; if (expanded === undefined) setInnerExpanded(ids); onExpandedChange?.(ids); };
  const select = (node: TreeNode) => { if (node.disabled) return; if (value === undefined) setInner(node.id); onValueChange?.(node.id); };
  const focus = (id?: string) => { if (!id) return; setFocused(id); elements.current.get(id)?.focus(); };
  const root = rs(["rs-tree-view", className], styles.root);
  const group = rs(["rs-tree-view-group"], styles.group);
  const spacer = rs(["rs-tree-view-spacer"], styles.spacer);
  const disclosure = rs(["rs-tree-view-disclosure"], styles.disclosure);
  const text = rs(["rs-tree-view-label"], styles.label);
  const renderNodes = (items: TreeNode[], level: number): React.ReactNode => items.map((node, index) => {
    const selected = node.id === current;
    const disabled = Boolean(node.disabled);
    const row = rs(["rs-tree-view-item", selected && "rs-tree-view-selected", disabled && "rs-tree-view-disabled"], styles.item, selected && styles.selected, disabled && styles.disabled);
    return <li key={node.id} role="none"><div {...row} ref={element => { if (element) elements.current.set(node.id, element); else elements.current.delete(node.id); }} role="treeitem" aria-label={node.label} aria-owns={node.children?.length && open.has(node.id) ? `${treeId}-${encodeURIComponent(node.id)}` : undefined} aria-level={level} aria-posinset={index + 1} aria-setsize={items.length} aria-selected={selected} aria-disabled={disabled || undefined} aria-expanded={node.children?.length ? open.has(node.id) : undefined} tabIndex={node.id === active ? 0 : -1} onFocus={() => setFocused(node.id)} onClick={() => { focus(node.id); select(node); }} onDoubleClick={() => { if (!disabled && node.children?.length) expand(node.id, !open.has(node.id)); }} onKeyDown={event => {
      const at = visible.findIndex(item => item.node.id === node.id); let next: string | undefined;
      if (event.key === "ArrowDown") next = visible[Math.min(visible.length - 1, at + 1)]?.node.id;
      else if (event.key === "ArrowUp") next = visible[Math.max(0, at - 1)]?.node.id;
      else if (event.key === "Home") next = visible[0]?.node.id;
      else if (event.key === "End") next = visible.at(-1)?.node.id;
      else if (event.key === "ArrowRight") { if (node.children?.length) { if (!open.has(node.id)) expand(node.id, true); else next = node.children[0]?.id; } }
      else if (event.key === "ArrowLeft") { if (node.children?.length && open.has(node.id)) expand(node.id, false); else next = visible[at]?.parent; }
      else if (event.key === "Enter" || event.key === " ") select(node);
      else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) { const now = Date.now(); typeAhead.current.text = now - typeAhead.current.time < 700 ? typeAhead.current.text + event.key.toLocaleLowerCase() : event.key.toLocaleLowerCase(); typeAhead.current.time = now; const order = [...visible.slice(at + 1), ...visible.slice(0, at + 1)]; next = order.find(item => item.node.label.toLocaleLowerCase().startsWith(typeAhead.current.text))?.node.id; }
      else return;
      event.preventDefault(); event.stopPropagation(); if (next) focus(next);
    }}>{node.children?.length ? <button {...disclosure} type="button" tabIndex={-1} disabled={disabled} aria-label={`${open.has(node.id) ? "Collapse" : "Expand"} ${node.label}`} onClick={event => { event.stopPropagation(); focus(node.id); expand(node.id, !open.has(node.id)); }}><Icon name="chevron-right" rotate={open.has(node.id) ? 90 : undefined} /></button> : <span {...spacer} aria-hidden="true" />}<span {...text} title={node.label}>{node.label}</span></div>{node.children?.length && open.has(node.id) ? <ul {...group} role="group" id={`${treeId}-${encodeURIComponent(node.id)}`}>{renderNodes(node.children, level + 1)}</ul> : null}</li>;
  });
  // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: The APG tree pattern explicitly uses a ul with role=tree and roving treeitems.
  return <ul ref={ref} role="tree" aria-label={label} {...props} onKeyDown={onKeyDown} className={root.className} style={{ ...root.style, ...style }}>{renderNodes(nodes, 1)}</ul>;
});
