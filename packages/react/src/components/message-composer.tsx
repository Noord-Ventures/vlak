"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { Icon } from "./icon";

export interface ComposedMessage { text: string; files: File[] }
export interface MessageComposerProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "defaultValue" | "onSubmit"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (text: string) => void;
  onSend: (message: ComposedMessage) => void | Promise<void>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  allowAttachments?: boolean;
  accept?: string;
  maxLength?: number;
  /** Enter submits, Shift+Enter inserts a line. Otherwise use Cmd/Ctrl+Enter. */
  sendOnEnter?: boolean;
  /** Application-owned response generation, separate from submission pending state. */
  generating?: boolean;
  /** Requests that the application stop generation; does not itself cancel a network request. */
  onStop?: () => void;
}
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", width: "100%", minWidth: 0, gap: "0.75rem", color: vlak.ink },
  actions: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" },
  action: { width: "auto", minWidth: vlak.hit, minHeight: vlak.hit, paddingInline: "0.875rem" },
  files: { display: "flex", flexWrap: "wrap", gap: "0.5rem", listStyleType: "none", padding: 0, margin: 0 },
  file: { display: "flex", alignItems: "center", gap: "0.5rem", maxWidth: "100%", overflowWrap: "anywhere", fontSize: "0.8125rem" },
  hint: { margin: 0, fontSize: "0.75rem", lineHeight: 1.45, color: vlak.gray },
  input: { display: "none" },
});

/** A message draft with attachments, IME-safe shortcuts, and retained text after send failures. */
export const MessageComposer = React.forwardRef<HTMLTextAreaElement, MessageComposerProps>(function MessageComposer({ value, defaultValue = "", onValueChange, onSend, label = "Message", placeholder = "Write a message…", disabled = false, allowAttachments = false, accept, maxLength, sendOnEnter = false, generating = false, onStop, className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const [files, setFiles] = React.useState<File[]>([]);
  const [pending, setPending] = React.useState(false);
  const sending = React.useRef(false);
  const [status, setStatus] = React.useState("");
  const areaRef = React.useRef<HTMLTextAreaElement>(null);
  const mergedRef = useMergedRefs(areaRef, ref);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const helpId = React.useId();
  const blocked = disabled || pending;
  const change = (next: string) => { if (value === undefined) setInner(next); onValueChange?.(next); };
  const submit = async () => {
    if (blocked || generating || sending.current || (!current.trim() && files.length === 0)) return;
    sending.current = true; setPending(true); setStatus("Sending…");
    try { await onSend({ text: current.trim(), files: [...files] }); change(""); setFiles([]); setStatus("Message sent."); }
    catch { setStatus("The message could not be sent. Your draft is still here."); }
    finally { sending.current = false; setPending(false); areaRef.current?.focus(); }
  };
  const root = rs(["rs-message-composer", className], styles.root);
  const actions = rs(["rs-message-composer-actions"], styles.actions);
  const action = rs(["rs-message-composer-action"], styles.action);
  const fileList = rs(["rs-message-composer-files"], styles.files);
  const file = rs(["rs-message-composer-file"], styles.file);
  const hint = rs(["rs-message-composer-hint"], styles.hint);
  const input = rs(["rs-message-composer-input"], styles.input);
  return <form aria-label={label} aria-busy={pending || generating} {...props} className={root.className} style={{ ...root.style, ...style }} onSubmit={event => { event.preventDefault(); void submit(); }}>
    <Textarea ref={mergedRef} label={label} value={current} onChange={event => change(event.target.value)} placeholder={placeholder} disabled={blocked} maxLength={maxLength} aria-describedby={helpId} onKeyDown={event => { if (event.nativeEvent.isComposing || event.key !== "Enter") return; if ((sendOnEnter && !event.shiftKey) || event.metaKey || event.ctrlKey) { event.preventDefault(); void submit(); } }} />
    {files.length > 0 && <ul {...fileList} aria-label="Attachments">{files.map((attachment, index) => <li {...file} key={`${attachment.name}-${index}`}><Icon name="attachment" />{attachment.name}<Button {...action} variant="ghost" aria-label={`Remove ${attachment.name}`} disabled={blocked} onClick={() => setFiles(files.filter((_, at) => at !== index))}><Icon name="close" size={12} /></Button></li>)}</ul>}
    <div {...actions}>
      {allowAttachments ? <><input {...input} ref={fileRef} type="file" multiple accept={accept} tabIndex={-1} aria-label="Attach files" disabled={blocked} onChange={event => { setFiles([...files, ...Array.from(event.target.files ?? [])]); event.target.value = ""; }} /><Button {...action} variant="ghost" disabled={blocked} onClick={() => fileRef.current?.click()}><Icon name="attachment" />Attach</Button></> : <span />}
      {generating ? <Button {...action} type="button" disabled={disabled || !onStop} onClick={onStop}><Icon name="stop" />Stop response</Button> : <Button {...action} type="submit" disabled={blocked || (!current.trim() && files.length === 0)}><Icon name="send" />{pending ? "Sending…" : "Send"}</Button>}
    </div>
    <p {...hint} id={helpId}>{sendOnEnter ? "Enter to send. Shift+Enter for a new line." : "Cmd or Ctrl+Enter to send."}</p>
    <p {...hint} role="status">{status}</p>
  </form>;
});
