"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useInputValue } from "../use-input-value";
import { Button } from "./button";
import { Input } from "./input";

export interface InlineEditProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  name?: string;
  disabled?: boolean;
  placeholder?: string;
  validate?: (value: string) => string | undefined;
  /** Resolves before the value is committed. Rejections leave the draft editable. */
  onSave?: (value: string) => void | Promise<void>;
  editLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", minWidth: 0 },
  row: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", minWidth: 0 },
  label: { fontSize: vlak.controlLabel, color: vlak.gray },
  value: { minWidth: 0, flex: "1 1 10rem", fontSize: vlak.controlFs, overflowWrap: "anywhere" },
  input: { minWidth: 0, flex: "1 1 10rem" },
  action: { width: "auto" },
  error: { margin: 0, color: vlak.ink, fontSize: vlak.controlLabel },
});

export const InlineEdit = React.forwardRef<HTMLDivElement, InlineEditProps>(function InlineEdit({
  value, defaultValue = "", onValueChange, label = "Value", name, disabled, placeholder = "Not set", validate, onSave, editLabel = "Edit", saveLabel = "Save", cancelLabel = "Cancel", className, style, ...props
}, ref) {
  const [current, setValue, rootRef] = useInputValue<string, HTMLDivElement>(value, defaultValue, onValueChange, () => { saveVersion.current++; setEditing(false); setError(""); setPending(false); });
  const mergedRef = useMergedRefs(ref, rootRef);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const wasEditing = React.useRef(false);
  const mounted = React.useRef(true);
  const saveVersion = React.useRef(0);
  const id = React.useId();
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  React.useEffect(() => {
    if (editing) { inputRef.current?.focus(); inputRef.current?.select(); }
    else if (wasEditing.current) triggerRef.current?.focus();
    wasEditing.current = editing;
  }, [editing]);
  const cancel = () => { if (!pending) { setEditing(false); setError(""); } };
  const save = async () => {
    if (pending || disabled) return;
    const validation = validate?.(draft);
    if (validation) { setError(validation); inputRef.current?.focus(); return; }
    const version = ++saveVersion.current;
    setPending(true); setError("");
    try {
      await onSave?.(draft);
      if (mounted.current && version === saveVersion.current) { setValue(draft); setEditing(false); }
    } catch (reason) { if (mounted.current && version === saveVersion.current) setError(reason instanceof Error ? reason.message : "Could not save. Try again."); }
    finally { if (mounted.current && version === saveVersion.current) setPending(false); }
  };
  const root = rs(["rs-inline-edit", className], styles.root);
  const row = rs(["rs-inline-edit-row"], styles.row);
  const lab = rs(["rs-inline-edit-label"], styles.label);
  const text = rs(["rs-inline-edit-value"], styles.value);
  const input = rs(["rs-inline-edit-input"], styles.input);
  const action = rs(["rs-inline-edit-action"], styles.action);
  const feedback = rs(["rs-inline-edit-error"], styles.error);
  return <div {...props} ref={mergedRef} className={root.className} style={{ ...root.style, ...style }} aria-busy={pending || undefined}>
    <span id={`${id}-label`} className={lab.className} style={lab.style}>{label}</span>
    <div className={row.className} style={row.style}>{editing ? <>
      <Input ref={inputRef} plain value={draft} aria-labelledby={`${id}-label`} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)} disabled={disabled || pending} className={input.className} style={input.style} onChange={(event) => { setDraft(event.currentTarget.value); setError(""); }} onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Enter") { event.preventDefault(); void save(); }
        if (event.key === "Escape") { event.preventDefault(); cancel(); }
      }} />
      <Button disabled={disabled || pending} className={action.className} style={action.style} onClick={() => void save()}>{pending ? "Saving…" : saveLabel}</Button>
      <Button variant="ghost" disabled={pending} className={action.className} style={action.style} onClick={cancel}>{cancelLabel}</Button>
    </> : <><span className={text.className} style={text.style}>{current || placeholder}</span><Button ref={triggerRef} variant="ghost" disabled={disabled} className={action.className} style={action.style} aria-label={`${editLabel} ${label}`} onClick={() => { setDraft(current); setEditing(true); setError(""); }}>{editLabel}</Button></>}</div>
    {error && <p id={`${id}-error`} role="alert" className={feedback.className} style={feedback.style}>{error}</p>}
    {name && <input type="hidden" name={name} value={current} disabled={disabled} />}
  </div>;
});
