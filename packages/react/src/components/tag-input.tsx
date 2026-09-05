"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useInputValue } from "../use-input-value";
import { useFieldControl } from "./field";
import { Input } from "./input";
import { Button } from "./button";
import { Icon } from "./icon";

export interface TagInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  label?: React.ReactNode;
  name?: string;
  disabled?: boolean;
  placeholder?: string;
  maxTags?: number;
  /** Return an error for an invalid token, or undefined to accept it. */
  validate?: (tag: string) => string | undefined;
  addLabel?: string;
  removeLabel?: (tag: string) => string;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", minWidth: 0 },
  label: { fontSize: vlak.controlLabel, color: vlak.gray },
  list: { display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: 0, margin: 0, listStyle: "none" },
  tag: { display: "inline-flex", alignItems: "center", gap: "0.25rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, paddingInlineStart: "0.75rem", fontSize: vlak.controlFs },
  remove: { minWidth: vlak.hit, minHeight: vlak.hit, width: vlak.hit, padding: 0, borderWidth: 0, flexShrink: 0 },
  row: { display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "start", minWidth: 0 },
  input: { flex: "1 1 8rem", minWidth: vlak.hit },
  add: { width: "auto", flexShrink: 0 },
  feedback: { color: vlak.gray, fontSize: vlak.controlLabel, margin: 0, lineHeight: 1.45 },
});

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(function TagInput({
  value, defaultValue = [], onValueChange, label = "Tags", name, disabled, placeholder = "Add a tag", maxTags, validate, addLabel = "Add", removeLabel = (tag) => `Remove ${tag}`, className, style, ...props
}, ref) {
  const [current, setValue, rootRef] = useInputValue<string[], HTMLDivElement>(value, defaultValue, onValueChange, () => { setDraft(""); setError(""); });
  const [draft, setDraft] = React.useState("");
  const [error, setError] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRefs(ref, inputRef);
  const removeRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const id = React.useId();
  const field = useFieldControl(props);
  const add = (text = draft) => {
    const candidates = text.split(/[,\n\r]+/).map((tag) => tag.trim()).filter(Boolean);
    if (!candidates.length) return;
    const next = [...new Set([...current, ...candidates])];
    const invalid = candidates.map((tag) => validate?.(tag)).find(Boolean);
    if (invalid || (maxTags != null && next.length > maxTags)) { setError(invalid ?? `Use at most ${maxTags} ${maxTags === 1 ? "tag" : "tags"}`); return; }
    setValue(next); setDraft(""); setError(""); inputRef.current?.focus();
  };
  const root = rs(["rs-tag-input", className], styles.root);
  const lab = rs(["rs-tag-input-label"], styles.label);
  const list = rs(["rs-tag-input-list"], styles.list);
  const tag = rs(["rs-tag-input-tag"], styles.tag);
  const remove = rs(["rs-tag-input-remove"], styles.remove);
  const row = rs(["rs-tag-input-row"], styles.row);
  const input = rs(["rs-tag-input-input"], styles.input);
  const action = rs(["rs-tag-input-add"], styles.add);
  const feedback = rs(["rs-tag-input-feedback"], styles.feedback);
  return <div {...props} ref={rootRef} className={root.className} style={{ ...root.style, ...style }}>
    <label htmlFor={id} className={lab.className} style={lab.style}>{label}</label>
    {current.length > 0 && <ul aria-label="Current tags" className={list.className} style={list.style}>{current.map((item, index) => <li key={item} className={tag.className} style={tag.style}>
      <span>{item}</span><Button ref={(node) => { removeRefs.current[index] = node; }} variant="ghost" className={remove.className} style={remove.style} disabled={disabled} aria-label={removeLabel(item)} onClick={() => { setValue(current.filter((entry) => entry !== item)); inputRef.current?.focus(); }}><Icon name="close" size={16} /></Button>
    </li>)}</ul>}
    <div className={row.className} style={row.style}>
      <Input ref={mergedRef} id={id} plain value={draft} disabled={disabled} placeholder={placeholder} className={input.className} style={input.style} aria-describedby={[field["aria-describedby"], `${id}-hint`, error ? `${id}-error` : null].filter(Boolean).join(" ")} aria-invalid={error ? true : field["aria-invalid"]} onChange={(event) => { setDraft(event.currentTarget.value); setError(""); }} onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Enter" || event.key === ",") { event.preventDefault(); add(); }
        if (event.key === "Escape") { setDraft(""); setError(""); }
        if (event.key === "Backspace" && !draft) { event.preventDefault(); removeRefs.current[current.length - 1]?.focus(); }
      }} onPaste={(event) => { const text = event.clipboardData.getData("text"); if (/[,\n\r]/.test(text)) { event.preventDefault(); const start = event.currentTarget.selectionStart ?? draft.length; const end = event.currentTarget.selectionEnd ?? start; add(draft.slice(0, start) + text + draft.slice(end)); } }} />
      <Button variant="ghost" disabled={disabled || !draft.trim()} className={action.className} style={action.style} onClick={() => add()}>{addLabel}</Button>
    </div>
    <p id={`${id}-hint`} className={feedback.className} style={feedback.style}>Press Enter or comma to add a tag{maxTags != null ? `, up to ${maxTags}` : ""}</p>
    {error && <p id={`${id}-error`} role="alert" className={feedback.className} style={feedback.style}>{error}</p>}
    {name && current.map((item) => <input key={item} type="hidden" name={name} value={item} disabled={disabled} />)}
  </div>;
});
