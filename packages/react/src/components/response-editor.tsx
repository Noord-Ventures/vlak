"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { rs } from "../rs";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { vlak } from "../tokens.stylex";

export interface ResponseEditorProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onError"> { text: string; onSave: (text: string) => void | Promise<void>; onCancel: () => void; label?: string; saveLabel?: string; disabled?: boolean; onError?: (error: unknown) => void }
const styles = stylex.create({ root: { display: "grid", gap: "0.75rem", minWidth: 0 }, actions: { display: "flex", gap: "0.5rem", flexWrap: "wrap" }, error: { margin: 0, color: vlak.ink, fontSize: "0.8125rem" } });
/** Multiline message editing with async save, cancellation, and failed-draft retention. */
export const ResponseEditor = React.forwardRef<HTMLFormElement, ResponseEditorProps>(function ResponseEditor({ text, onSave, onCancel, label = "Edit message", saveLabel = "Save message", disabled, onError, className, style, onKeyDown, ...props }, ref) {
  const [draft, setDraft] = React.useState(text);
  const [pending, setPending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const version = React.useRef(0);
  const busy = React.useRef(false);
  React.useEffect(() => { version.current++; setDraft(text); setFailed(false); setPending(false); busy.current = false; return () => { version.current++; }; }, [text]);
  const cancel = () => { version.current++; busy.current = false; setPending(false); onCancel(); };
  const root = rs(["rs-response-editor", className], styles.root);
  return <form ref={ref} aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }} onKeyDown={event => { onKeyDown?.(event); if (!event.defaultPrevented && !event.nativeEvent.isComposing && event.key === "Escape") { event.preventDefault(); cancel(); } }} onSubmit={async event => { event.preventDefault(); if (busy.current || disabled || !draft.trim()) return; busy.current = true; setPending(true); setFailed(false); const token = version.current; try { await onSave(draft); } catch (error) { if (token === version.current) { setFailed(true); onError?.(error); } } finally { if (token === version.current) { busy.current = false; setPending(false); } } }}>
    <Textarea label={label} rows={3} value={draft} onChange={event => setDraft(event.target.value)} disabled={disabled} readOnly={pending} />
    <div {...rs(["rs-response-editor-actions"], styles.actions)}><Button type="submit" variant="subtle" disabled={disabled || !draft.trim()} aria-disabled={pending || undefined} aria-busy={pending}>{pending ? "Saving…" : saveLabel}</Button><Button variant="subtle" onClick={cancel}>Cancel</Button></div>
    {failed && <p {...rs(["rs-response-editor-error"], styles.error)} role="alert">The message could not be saved. Your draft is still here.</p>}
  </form>;
});
