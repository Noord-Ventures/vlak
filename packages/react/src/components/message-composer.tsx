"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { Icon } from "./icon";
import { Attachment, Attachments, useFileAttachments, type AttachmentData } from "./attachments";
import { selectFiles, type FileSelectionRejection } from "../file-selection";
import { captureScreenshot } from "../capture-screenshot";

export interface ComposedMessage { text: string; files: File[] }
export type MessageAttachmentRejection = FileSelectionRejection;
export interface MessageComposerAttachmentActions {
  remove: (id: string) => void;
  openFileDialog: () => void;
  disabled: boolean;
}
export interface MessageComposerState {
  value: string;
  files: readonly File[];
  attachments: readonly AttachmentData[];
  /** Changes the draft unless submission or the composer is disabled. */
  setValue: (value: string) => void;
  /** Uses the same validation as the file picker, paste, and drop. */
  addFiles: (files: readonly File[] | FileList) => boolean;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  openFileDialog: () => void;
  captureScreenshot: () => Promise<void>;
  focus: () => void;
  /** Returns false when blocked, invalid, or sending fails. */
  submit: () => Promise<boolean>;
  stop: () => void;
  disabled: boolean;
  pending: boolean;
  generating: boolean;
  canSubmit: boolean;
  canAttach: boolean;
  canCapture: boolean;
  capturing: boolean;
  status: string;
  failed: boolean;
}
export interface MessageComposerParts {
  /** Render once; owns the merged ref, shortcuts, and compact auto sizing. */
  input: React.ReactNode;
  submit: React.ReactNode;
  attach: React.ReactNode;
  screenshot: React.ReactNode;
  attachments: React.ReactNode;
  tools: React.ReactNode;
}
export type MessageComposerTextareaProps = Omit<React.ComponentPropsWithRef<"textarea">, "value" | "defaultValue" | "disabled" | "placeholder" | "maxLength" | "rows" | "children">;
const MessageComposerContext = React.createContext<MessageComposerState | null>(null);

/** Reads the nearest composer's draft and validated commands from a custom child or tool. */
export function useMessageComposer(): MessageComposerState {
  const context = React.useContext(MessageComposerContext);
  if (!context) throw new Error("useMessageComposer must be used inside MessageComposer.");
  return context;
}
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
  /** Controlled file selection, independent of the text draft. */
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  onAttachmentError?: (rejections: MessageAttachmentRejection[]) => void;
  /** Also accept file drops outside this composer. Enable on one composer per page. */
  globalDrop?: boolean;
  /** Shows a user-activated browser screen capture action when available. */
  allowScreenshot?: boolean;
  /** Application-owned model selectors, capability controls, or other tools. */
  tools?: React.ReactNode;
  renderAttachments?: (attachments: AttachmentData[], actions: MessageComposerAttachmentActions) => React.ReactNode;
  /** Rearranges the provided controls. Render input and submit once; feedback stays in the form. */
  renderLayout?: (parts: MessageComposerParts, state: MessageComposerState) => React.ReactNode;
  /** Native textarea attributes and handlers. Prevent a key's default to override its shortcut. */
  textareaProps?: MessageComposerTextareaProps;
  maxLength?: number;
  /** Enter submits, Shift+Enter inserts a line. Otherwise use Cmd/Ctrl+Enter. */
  sendOnEnter?: boolean;
  /** Application-owned response generation, separate from submission pending state. */
  generating?: boolean;
  /** Requests that the application stop generation; does not itself cancel a network request. */
  onStop?: () => void;
  /** A single-line draft with an inline icon action; grows as the message wraps. */
  compact?: boolean;
  /** Maximum visible draft lines in compact mode, clamped to 1–20. */
  maxRows?: number;
}
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", width: "100%", minWidth: 0, gap: "0.75rem", color: vlak.ink },
  compact: { gap: "0.5rem" },
  row: { display: "flex", alignItems: "flex-end", gap: "0.25rem", padding: "0.25rem", minWidth: 0, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper },
  area: {
    boxSizing: "border-box", flex: "1 1 0%", width: "100%", minWidth: 0, minHeight: vlak.hit,
    fontFamily: "inherit", fontSize: "1rem", lineHeight: 1.375, color: vlak.ink,
    backgroundColor: "transparent", borderWidth: 0, borderRadius: vlak.radiusSm,
    paddingBlock: "0.6875rem", paddingInline: "0.5rem", resize: "none", overflowY: "hidden",
    outlineWidth: { default: 0, ":focus-visible": 2 },
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineColor: vlak.ink, outlineOffset: -2,
  },
  actions: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" },
  action: { width: "auto", minWidth: vlak.hit, minHeight: vlak.hit, paddingInline: "0.875rem" },
  iconAction: { flex: "0 0 auto", flexBasis: vlak.hit, width: { default: vlak.hit, [mq.phone]: vlak.hit }, maxWidth: vlak.hit, height: vlak.hit, minHeight: vlak.hit, paddingInline: { default: 0, [mq.phone]: 0 }, alignSelf: "flex-end" },
  files: { minWidth: 0 },
  file: { minWidth: 0 },
  tools: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", minWidth: 0 },
  drag: { outlineWidth: 2, outlineStyle: "dashed", outlineColor: vlak.ink, outlineOffset: 4 },
  hint: { margin: 0, fontSize: "0.75rem", lineHeight: 1.45, color: vlak.gray },
  input: { display: "none" },
  srOnly: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap", borderWidth: 0 },
});

/** A message draft with attachments, IME-safe shortcuts, and retained text after send failures. */
export const MessageComposer = React.forwardRef<HTMLTextAreaElement, MessageComposerProps>(function MessageComposer({ value, defaultValue = "", onValueChange, onSend, label = "Message", placeholder = "Write a message…", disabled = false, allowAttachments = false, accept, files: controlledFiles, defaultFiles = [], onFilesChange, multiple = true, maxFiles, maxFileSize, onAttachmentError, globalDrop = false, allowScreenshot = false, tools, renderAttachments, renderLayout, textareaProps = {}, children, maxLength, sendOnEnter = false, generating = false, onStop, compact = false, maxRows = 6, className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const [innerFiles, setInnerFiles] = React.useState<File[]>(defaultFiles);
  const files = controlledFiles ?? innerFiles;
  const previews = useFileAttachments(files);
  const [rejections, setRejections] = React.useState<MessageAttachmentRejection[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [capturing, setCapturing] = React.useState(false);
  const [captureAvailable, setCaptureAvailable] = React.useState(false);
  const capturedStream = React.useRef<MediaStream | null>(null);
  const captureAbort = React.useRef<AbortController | null>(null);
  const mounted = React.useRef(true);
  const sendVersion = React.useRef(0);
  const [pending, setPending] = React.useState(false);
  const sending = React.useRef(false);
  const [status, setStatus] = React.useState("");
  const [failed, setFailed] = React.useState(false);
  const areaRef = React.useRef<HTMLTextAreaElement>(null);
  const mergedRef = useMergedRefs(areaRef, ref, textareaProps.ref);
  const composing = React.useRef(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const helpId = React.useId();
  const blocked = disabled || pending;
  const currentDraft = React.useRef({ text: current, files });
  currentDraft.current = { text: current, files };
  const setFiles = (next: File[]) => {
    if (controlledFiles === undefined) { currentDraft.current.files = next; setInnerFiles(next); }
    onFilesChange?.(next);
  };
  React.useEffect(() => {
    mounted.current = true;
    setCaptureAvailable(typeof navigator.mediaDevices?.getDisplayMedia === "function");
    return () => { mounted.current = false; sendVersion.current++; captureAbort.current?.abort(); for (const track of capturedStream.current?.getTracks() ?? []) track.stop(); };
  }, []);
  const addFiles = (incoming: readonly File[] | FileList) => {
    if (blocked || sending.current || !allowAttachments) return false;
    const { accepted, added, rejected } = selectFiles(Array.from(incoming), { files: currentDraft.current.files, accept, multiple, maxFiles, maxSize: maxFileSize });
    setRejections(rejected);
    if (rejected.length) onAttachmentError?.(rejected);
    if (added.length) setFiles(accepted);
    return added.length > 0;
  };
  const attachmentState = React.useRef({ addFiles, blocked, allowAttachments });
  attachmentState.current = { addFiles, blocked, allowAttachments };
  React.useEffect(() => {
    if (!globalDrop || !allowAttachments) return;
    const over = (event: DragEvent) => { if (!attachmentState.current.blocked && event.dataTransfer?.types.includes("Files")) event.preventDefault(); };
    const drop = (event: DragEvent) => {
      if (event.defaultPrevented || attachmentState.current.blocked || !event.dataTransfer?.files.length) return;
      event.preventDefault(); attachmentState.current.addFiles(Array.from(event.dataTransfer.files));
    };
    document.addEventListener("dragover", over); document.addEventListener("drop", drop);
    return () => { document.removeEventListener("dragover", over); document.removeEventListener("drop", drop); };
  }, [globalDrop, allowAttachments]);
  const takeScreenshot = async () => {
    if (blocked || sending.current || capturing || captureAbort.current || !allowAttachments || !allowScreenshot || !captureAvailable) return;
    const controller = new AbortController();
    captureAbort.current = controller;
    setCapturing(true); setFailed(false); setStatus("Choose a screen or window to attach.");
    try {
      const file = await captureScreenshot((stream) => { capturedStream.current = stream; if (!mounted.current) for (const track of stream.getTracks()) track.stop(); }, controller.signal);
      if (mounted.current) setStatus(attachmentState.current.addFiles([file]) ? "Screenshot attached." : "");
    } catch { if (mounted.current) { setFailed(true); setStatus("Screen capture was cancelled or could not be attached."); } }
    finally { capturedStream.current = null; captureAbort.current = null; if (mounted.current) setCapturing(false); }
  };
  const rows = Number.isFinite(maxRows) ? Math.min(20, Math.max(1, Math.floor(maxRows))) : 6;
  const resize = React.useCallback(() => {
    const area = areaRef.current;
    if (!compact || !area) return;
    const computed = window.getComputedStyle(area);
    const number = (property: string) => Number.parseFloat(property) || 0;
    const lineHeight = number(computed.lineHeight) || number(computed.fontSize) * 1.375 || 22;
    const padding = number(computed.paddingTop) + number(computed.paddingBottom);
    const border = number(computed.borderTopWidth) + number(computed.borderBottomWidth);
    const minimum = number(computed.minHeight) || 44;
    const maximum = Math.max(minimum, rows * lineHeight + padding + border);
    // Release the previous height before measuring so shorter and cleared drafts shrink.
    area.style.height = "auto";
    const content = area.scrollHeight + border;
    area.style.height = `${Math.max(minimum, Math.min(content, maximum))}px`;
    area.style.maxHeight = `${maximum}px`;
    area.style.overflowY = content > maximum ? "auto" : "hidden";
  }, [compact, rows]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Draft changes alter the textarea's measured scroll height.
  React.useEffect(() => { resize(); }, [resize, current]);
  React.useEffect(() => {
    const area = areaRef.current;
    if (!compact || !area || typeof ResizeObserver === "undefined") return;
    let width = area.clientWidth;
    const observer = new ResizeObserver(() => {
      const nextWidth = area.clientWidth;
      // Height changes are our own work; only remeasure when wrapping width changes.
      if (nextWidth === width) return;
      width = nextWidth;
      resize();
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, [compact, resize]);
  const change = (next: string) => { if (value === undefined) { currentDraft.current.text = next; setInner(next); } onValueChange?.(next); };
  const submit = async (): Promise<boolean> => {
    const draft = currentDraft.current;
    if (blocked || capturing || captureAbort.current || generating || sending.current || (!draft.text.trim() && draft.files.length === 0)) return false;
    if (areaRef.current && !areaRef.current.reportValidity()) return false;
    const snapshot = { text: draft.text, files: [...draft.files] };
    const request = ++sendVersion.current;
    sending.current = true; setPending(true); setFailed(false); setStatus("Sending…");
    try {
      await onSend({ text: snapshot.text.trim(), files: snapshot.files });
      if (!mounted.current || request !== sendVersion.current) return false;
      if (currentDraft.current.text === snapshot.text) change("");
      setFiles(currentDraft.current.files.filter((file) => !snapshot.files.includes(file)));
      setRejections([]); setStatus("Message sent.");
      return true;
    } catch { if (mounted.current && request === sendVersion.current) { setFailed(true); setStatus("The message could not be sent. Your draft is still here."); } return false; }
    finally { if (mounted.current && request === sendVersion.current) { sending.current = false; setPending(false); areaRef.current?.focus(); } }
  };
  const root = rs(["rs-message-composer", compact && "rs-message-composer-compact", dragging && "rs-message-composer-drag", className], styles.root, compact && styles.compact, dragging && styles.drag);
  const row = rs(["rs-message-composer-row"], styles.row);
  const area = rs(["rs-message-composer-area"], styles.area);
  const actions = rs(["rs-message-composer-actions"], styles.actions);
  const action = rs(["rs-message-composer-action", compact && "rs-message-composer-icon-action"], styles.action, compact && styles.iconAction);
  const fileList = rs(["rs-message-composer-files"], styles.files);
  const toolRow = rs(["rs-message-composer-tools"], styles.tools);
  const file = rs(["rs-message-composer-file"], styles.file);
  const hint = rs(["rs-message-composer-hint", compact && "rs-message-composer-sr-only"], styles.hint, compact && styles.srOnly);
  const feedback = rs(["rs-message-composer-hint", compact && !failed && "rs-message-composer-sr-only"], styles.hint, compact && !failed && styles.srOnly);
  const input = rs(["rs-message-composer-input"], styles.input);
  const rejection = rs(["rs-message-composer-hint"], styles.hint);
  const draftProps = {
    ...textareaProps,
    ref: mergedRef, value: current,
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => { textareaProps.onChange?.(event); if (!event.defaultPrevented) change(event.target.value); },
    placeholder, disabled: blocked, maxLength, "aria-describedby": [textareaProps["aria-describedby"], helpId].filter(Boolean).join(" "),
    onCompositionStart: (event: React.CompositionEvent<HTMLTextAreaElement>) => { composing.current = true; textareaProps.onCompositionStart?.(event); },
    onCompositionEnd: (event: React.CompositionEvent<HTMLTextAreaElement>) => { composing.current = false; textareaProps.onCompositionEnd?.(event); },
    onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      textareaProps.onKeyDown?.(event);
      if (event.defaultPrevented || composing.current || event.nativeEvent.isComposing || event.keyCode === 229 || event.key !== "Enter") return;
      if ((sendOnEnter && !event.shiftKey) || event.metaKey || event.ctrlKey) { event.preventDefault(); void submit(); }
    },
  };
  const openFileDialog = () => { if (!blocked && !sending.current && allowAttachments) fileRef.current?.click(); };
  const attachAction = allowAttachments && <Button {...action} variant="subtle" aria-label={compact ? "Attach files" : undefined} title={compact ? "Attach files" : undefined} disabled={blocked} onClick={openFileDialog}><Icon name="attachment" />{!compact && "Attach"}</Button>;
  const removeAttachment = (id: string) => { const index = previews.findIndex((item) => item.id === id); if (index >= 0 && !blocked && !sending.current) setFiles(currentDraft.current.files.filter(entry => entry !== files[index])); };
  const captureAction = allowAttachments && allowScreenshot && <Button {...action} variant="subtle" aria-label="Attach screenshot" title={captureAvailable ? "Attach screenshot" : "Screen capture is unavailable in this browser"} disabled={blocked || capturing || !captureAvailable} onClick={() => void takeScreenshot()}><Icon name="camera" />{!compact && (capturing ? "Capturing…" : "Screenshot")}</Button>;
  const sendLabel = pending ? "Sending…" : "Send";
  const sendAction = generating
    ? <Button {...action} type="button" aria-label={compact ? "Stop response" : undefined} title={compact ? "Stop response" : undefined} disabled={disabled || !onStop} onClick={onStop}><Icon name="stop" />{!compact && "Stop response"}</Button>
    : <Button {...action} type="submit" aria-label={compact ? sendLabel : undefined} title={compact ? sendLabel : undefined} disabled={blocked || capturing || (!current.trim() && files.length === 0)}><Icon name="send" />{!compact && sendLabel}</Button>;
  const draftInput = compact ? <textarea {...draftProps} className={[area.className, textareaProps.className].filter(Boolean).join(" ")} style={{ ...area.style, ...textareaProps.style }} rows={1} aria-label={textareaProps["aria-label"] ?? label} /> : <Textarea {...draftProps} label={label} />;
  const attachmentList = files.length > 0 && <div {...fileList}>{renderAttachments ? renderAttachments(previews, { remove: removeAttachment, openFileDialog, disabled: blocked }) : <Attachments>{previews.map((data) => <Attachment {...file} key={data.id} data={data} disabled={blocked} onRemove={() => removeAttachment(data.id)} />)}</Attachments>}</div>;
  const state: MessageComposerState = {
    value: current, files, attachments: previews,
    setValue: next => { if (!blocked && !sending.current) change(next); },
    addFiles, removeAttachment, clearAttachments: () => { if (!blocked && !sending.current) { setFiles([]); setRejections([]); } },
    openFileDialog, captureScreenshot: takeScreenshot, focus: () => areaRef.current?.focus(), submit,
    stop: () => { if (!disabled && generating) onStop?.(); },
    disabled: blocked, pending, generating, capturing,
    canSubmit: !blocked && !capturing && !generating && (current.trim().length > 0 || files.length > 0),
    canAttach: allowAttachments && !blocked,
    canCapture: allowAttachments && allowScreenshot && captureAvailable && !blocked && !capturing,
    status, failed,
  };
  const parts: MessageComposerParts = { input: draftInput, submit: sendAction, attach: attachAction, screenshot: captureAction, attachments: attachmentList, tools };
  return <MessageComposerContext.Provider value={state}><form aria-label={label} aria-busy={pending || generating} {...props} className={root.className} style={{ ...root.style, ...style }} onSubmit={event => { event.preventDefault(); void submit(); }}
    onDragOver={event => { props.onDragOver?.(event); if (!event.defaultPrevented && allowAttachments && !blocked && event.dataTransfer.types.includes("Files")) { event.preventDefault(); setDragging(true); } }}
    onDragLeave={event => { props.onDragLeave?.(event); if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
    onDrop={event => { props.onDrop?.(event); setDragging(false); if (!event.defaultPrevented && allowAttachments && !blocked && event.dataTransfer.files.length) { event.preventDefault(); addFiles(Array.from(event.dataTransfer.files)); } }}
    onPaste={event => { props.onPaste?.(event); if (!event.defaultPrevented && allowAttachments && !blocked && event.clipboardData.files.length) { if (!event.clipboardData.getData("text/plain")) event.preventDefault(); addFiles(Array.from(event.clipboardData.files)); } }}>
    {allowAttachments && <input {...input} ref={fileRef} type="file" multiple={multiple} accept={accept} tabIndex={-1} aria-label="Attach files" disabled={blocked} onChange={event => { addFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />}
    {renderLayout ? renderLayout(parts, state) : <>
      {compact ? <div {...row}>{draftInput}{attachAction}{sendAction}</div> : draftInput}
      {attachmentList}
      {!compact && <div {...actions}><div {...toolRow}>{attachAction}{captureAction}</div>{sendAction}</div>}
      {(tools || (compact && captureAction)) && <div {...toolRow}>{compact && captureAction}{tools}</div>}
    </>}
    {children}
    {rejections.length > 0 && <div role="alert">{rejections.map(({ file, reason }, index) => <p {...rejection} key={`${file.name}-${index}`}>{file.name}: {reason}</p>)}</div>}
    <p {...hint} id={helpId}>{sendOnEnter ? "Enter to send. Shift+Enter for a new line." : "Cmd or Ctrl+Enter to send."}</p>
    <p {...feedback} role="status">{status}</p>
  </form></MessageComposerContext.Provider>;
});
