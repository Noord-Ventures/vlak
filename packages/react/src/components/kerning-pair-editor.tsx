"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";
import { Select } from "./select";
import { Input } from "./input";
import { Button } from "./button";

export interface KerningPair { id: string; left: string; right: string; label?: string }
export type KerningOffsets = Record<string, number | null>;
export interface KerningPairEditorProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange"> {
  label: React.ReactNode;
  pairs: KerningPair[];
  fontFamily: string;
  unitsPerEm: number;
  baselineOffsets?: KerningOffsets;
  value?: KerningOffsets;
  defaultValue?: KerningOffsets;
  onValueChange?: (offsets: KerningOffsets) => void;
  activePairId?: string | null;
  defaultActivePairId?: string | null;
  onActivePairChange?: (id: string | null) => void;
  min?: number;
  max?: number;
  readOnly?: boolean;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  toolbar: { display: "flex", flexWrap: "wrap", alignItems: "end", gap: "0.5rem" },
  field: { display: "grid", flexGrow: 1, minWidth: "8rem", gap: "0.375rem", fontSize: vlak.controlLabel, lineHeight: 1.45 },
  input: { minWidth: vlak.hit, width: "100%", fontVariantNumeric: "tabular-nums" },
  button: { minHeight: vlak.hit },
  previews: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))", gap: "0.75rem" },
  preview: { display: "grid", gap: "0.375rem", alignContent: "start", minWidth: 0, margin: 0, padding: "0.875rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider },
  glyphs: { display: "flex", alignItems: "baseline", minWidth: 0, overflow: "auto", whiteSpace: "nowrap", fontSize: "4rem", lineHeight: 1.45, fontKerning: "none", fontVariantLigatures: "none", color: { default: vlak.ink, [mq.forcedColors]: "CanvasText" } },
  glyph: { flexShrink: 0 },
  note: { margin: 0, fontSize: vlak.controlLabel, lineHeight: 1.45, color: vlak.gray },
});

/** Explicit pair offsets with browser font previews, without font-file editing or shaping. */
export const KerningPairEditor = React.forwardRef<HTMLFieldSetElement, KerningPairEditorProps>(function KerningPairEditor({ label, pairs, fontFamily, unitsPerEm, baselineOffsets = {}, value, defaultValue = {}, onValueChange, activePairId, defaultActivePairId, onActivePairChange, min = -unitsPerEm, max = unitsPerEm, readOnly, disabled, name, form, className, style, ...props }, ref) {
  const id = React.useId();
  const [undo, setUndo] = React.useState<{ id: string; value: number | null | undefined; after: number | null } | null>(null);
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const reset = () => { setUndo(null); refresh(); };
  const [current, setValue, fieldRef] = useInputValue<KerningOffsets, HTMLFieldSetElement>(value, defaultValue, onValueChange, reset);
  const [active, setActive, selectionRef] = useInputValue<string | null, HTMLFieldSetElement>(activePairId, defaultActivePairId ?? pairs[0]?.id ?? null, onActivePairChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef, selectionRef);
  const index = pairs.findIndex((pair) => pair.id === active);
  const pair = pairs[index];
  const offset = pair ? current[pair.id] : undefined;
  const baseline = pair ? baselineOffsets[pair.id] : undefined;
  const validUnits = Number.isFinite(unitsPerEm) && unitsPerEm > 0 && fontFamily.trim() !== "";
  const validBounds = Number.isFinite(min) && Number.isFinite(max) && min <= max;
  const validOffset = offset != null && Number.isFinite(offset);
  const validBaseline = baseline != null && Number.isFinite(baseline);
  const offsetInBounds = validOffset && offset >= min && offset <= max;
  const edit = (next: number | null) => {
    if (!pair || readOnly || disabled) return;
    setUndo({ id: pair.id, value: current[pair.id], after: next });
    setValue({ ...current, [pair.id]: next });
  };
  const restore = () => {
    if (!undo) return;
    const next = { ...current };
    if (undo.value === undefined) delete next[undo.id]; else next[undo.id] = undo.value;
    setValue(next);
    setUndo(null);
  };
  const root = rs(["rs-kerning-pair-editor", className], styles.root);
  const legend = rs(["rs-kerning-pair-editor-legend"], styles.legend);
  const toolbar = rs(["rs-kerning-pair-editor-toolbar"], styles.toolbar);
  const field = rs(["rs-kerning-pair-editor-field"], styles.field);
  const input = rs(["rs-kerning-pair-editor-input"], styles.input);
  const button = rs(["rs-kerning-pair-editor-button"], styles.button);
  const previews = rs(["rs-kerning-pair-editor-previews"], styles.previews);
  const preview = rs(["rs-kerning-pair-editor-preview"], styles.preview);
  const glyphs = rs(["rs-kerning-pair-editor-glyphs"], styles.glyphs);
  const glyph = rs(["rs-kerning-pair-editor-glyph"], styles.glyph);
  const note = rs(["rs-kerning-pair-editor-note"], styles.note);
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} className={root.className} style={{ ...root.style, ...style }}>
    <legend className={legend.className} style={legend.style}>{label}</legend>
    {pairs.length === 0 ? <p className={note.className} style={note.style}>No glyph pairs supplied</p> : <>
      <div className={toolbar.className} style={toolbar.style}>
        <div className={field.className} style={field.style}><span id={`${id}-pair`}>Pair</span><Select fullWidth aria-labelledby={`${id}-pair`} value={pair?.id ?? ""} disabled={disabled} options={[{ value: "", label: "Choose a pair" }, ...pairs.map(item => ({ value: item.id, label: item.label ?? `${item.left} / ${item.right}` }))]} onValueChange={next => setActive(next || null)} /></div>
        <Button variant="ghost" type="button" disabled={disabled || index <= 0} className={button.className} style={button.style} onClick={() => setActive(pairs[index - 1]!.id)}>Previous pair</Button>
        <Button variant="ghost" type="button" disabled={disabled || index >= pairs.length - 1} className={button.className} style={button.style} onClick={() => setActive(pairs[index + 1]!.id)}>Next pair</Button>
      </div>
      {!validUnits && <p className={note.className} style={note.style}>Supply a font family and positive units per em to preview spacing.</p>}
      {!validBounds && <p className={note.className} style={note.style}>Offset bounds unavailable</p>}
      {pair ? <>
        <p className={note.className} style={note.style}>{fontFamily || "Font unavailable"}{validUnits ? ` · ${unitsPerEm} units per em` : ""}</p>
        <div className={previews.className} style={previews.style}>{([{ title: "Baseline", value: baseline, valid: validBaseline }, { title: "Edited", value: offset, valid: validOffset }] as const).map((item) => <figure key={item.title} className={preview.className} style={preview.style}>
          <figcaption className={note.className} style={note.style}>{item.title}: {item.valid ? `${item.value} units` : item.value == null ? "not supplied" : "unavailable"}</figcaption>
          {validUnits && item.valid && Number.isFinite(item.value! / unitsPerEm) && <div role="img" aria-label={`${pair.left} followed by ${pair.right}, ${item.title.toLowerCase()} offset ${item.value} units`} className={glyphs.className} style={{ ...glyphs.style, fontFamily }}><span aria-hidden="true" className={glyph.className} style={glyph.style}>{pair.left}</span><span aria-hidden="true" className={glyph.className} style={{ ...glyph.style, marginInlineStart: `${item.value! / unitsPerEm}em` }}>{pair.right}</span></div>}
        </figure>)}</div>
        <label className={field.className} style={field.style}>Offset (font units)<Input plain type="number" form={form} name={name ? `${name}.${pair.id}` : undefined} value={validOffset ? offset : ""} min={validBounds ? min : undefined} max={validBounds ? max : undefined} step="any" readOnly={readOnly} disabled={disabled || !validBounds || !validUnits} aria-invalid={validOffset && !offsetInBounds || undefined} aria-describedby={`${id}-keys`} className={input.className} style={input.style} onChange={(event) => edit(event.currentTarget.value === "" ? null : Number(event.currentTarget.value))} onKeyDown={(event) => {
          if (readOnly || !validBounds || !validUnits || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
          event.preventDefault();
          const delta = (event.key === "ArrowLeft" ? -1 : 1) * (event.shiftKey ? 10 : 1);
          edit(Math.max(min, Math.min(max, (validOffset ? offset : 0) + delta)));
        }} /></label>
        <p id={`${id}-keys`} className={note.className} style={note.style}>{validOffset && !offsetInBounds ? `Offset is outside the supplied ${min} to ${max} bounds. ` : ""}Left and right arrows adjust one unit. Hold Shift for ten units.</p>
        <div className={toolbar.className} style={toolbar.style}><Button variant="ghost" type="button" disabled={disabled || readOnly || !validBaseline || !validBounds || baseline! < min || baseline! > max || baseline === offset} className={button.className} style={button.style} onClick={() => edit(baseline!)}>Reset to baseline</Button><Button variant="ghost" type="button" disabled={disabled || readOnly || undo == null || !pairs.some((item) => item.id === undo.id) || current[undo.id] !== undo.after} className={button.className} style={button.style} onClick={restore}>Undo last edit</Button></div>
      </> : <p className={note.className} style={note.style}>Choose a pair to edit its offset.</p>}
    </>}
    {name && pairs.filter((item) => item.id !== pair?.id).map((item) => current[item.id] != null && Number.isFinite(current[item.id]) ? <input key={item.id} type="hidden" form={form} name={`${name}.${item.id}`} value={current[item.id]!} /> : null)}
  </fieldset>;
});
