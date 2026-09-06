"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export interface CreativeLayer { id: string; label: string; visible: boolean; locked: boolean }
export interface LayerStackProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  label: React.ReactNode;
  /** Ordered from top to bottom. */
  layers: CreativeLayer[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onLayersChange?: (layers: CreativeLayer[]) => void;
  disabled?: boolean;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, color: vlak.ink },
  label: { margin: 0, fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  list: { display: "grid", gap: "0.5rem", listStyleType: "none", margin: 0, padding: 0 },
  row: { display: "grid", gap: "0.5rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, padding: "0.5rem" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.375rem" },
  action: { minWidth: vlak.hit, minHeight: vlak.hit, width: "auto", maxWidth: "100%" },
  button: { minWidth: vlak.hit, minHeight: vlak.hit, paddingInline: "0.625rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink, fontFamily: "inherit", fontSize: vlak.controlLabel, lineHeight: 1.45, cursor: "pointer", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  selected: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
  note: { margin: 0, fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45 },
});

/** A controlled layer order with explicit selection, visibility, lock and move actions. */
export const LayerStack = React.forwardRef<HTMLDivElement, LayerStackProps>(function LayerStack({ label, layers, selectedId, onSelect, onLayersChange, disabled, className, style, ...props }, ref) {
  const root = rs(["rs-layer-stack", className], styles.root);
  const heading = rs(["rs-layer-stack-label"], styles.label);
  const list = rs(["rs-layer-stack-list"], styles.list);
  const row = rs(["rs-layer-stack-row"], styles.row);
  const actions = rs(["rs-layer-stack-actions"], styles.actions);
  const note = rs(["rs-layer-stack-note"], styles.note);
  const action = rs(["rs-layer-stack-action"], styles.action);
  const update = (id: string, patch: Partial<CreativeLayer>) => onLayersChange?.(layers.map((layer) => layer.id === id ? { ...layer, ...patch } : layer));
  const move = (index: number, delta: number) => {
    const next = [...layers];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    onLayersChange?.(next);
  };
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <p className={heading.className} style={heading.style}>{label}</p>
    {layers.length === 0 && <p className={note.className} style={note.style}>No layers</p>}
    <ol className={list.className} style={list.style}>{layers.map((layer, index) => {
      const selected = layer.id === selectedId;
      const select = rs(["rs-layer-stack-button", selected && "rs-layer-stack-selected"], styles.button, selected && styles.selected);
      return <li key={layer.id} className={row.className} style={row.style}>
        {onSelect ? <button type="button" disabled={disabled} aria-pressed={selected} className={select.className} style={select.style} onClick={() => onSelect(layer.id)}>{layer.label}</button> : <span>{layer.label}{selected ? " · Selected" : ""}</span>}
        <span className={note.className} style={note.style}>{layer.visible ? "Visible" : "Hidden"} · {layer.locked ? "Locked" : "Unlocked"}</span>
        {onLayersChange && <div className={actions.className} style={actions.style}>
          <Button variant="ghost" size="sm" disabled={disabled} aria-label={`${layer.label} visibility`} aria-pressed={layer.visible} {...action} onClick={() => update(layer.id, { visible: !layer.visible })}>Visibility</Button>
          <Button variant="ghost" size="sm" disabled={disabled} aria-label={`${layer.label} lock`} aria-pressed={layer.locked} {...action} onClick={() => update(layer.id, { locked: !layer.locked })}>Lock</Button>
          <Button variant="ghost" size="sm" disabled={disabled || layer.locked || index === 0} aria-label={`Move ${layer.label} up`} {...action} onClick={() => move(index, -1)}>↑</Button>
          <Button variant="ghost" size="sm" disabled={disabled || layer.locked || index === layers.length - 1} aria-label={`Move ${layer.label} down`} {...action} onClick={() => move(index, 1)}>↓</Button>
        </div>}
      </li>;
    })}</ol>
  </div>;
});
