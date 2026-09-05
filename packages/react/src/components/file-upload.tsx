"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useInputValue } from "../use-input-value";
import { Button } from "./button";
import { Progress } from "./progress";

export interface FileUploadRejection { file: File; reason: string }
export interface FileUploadContext { signal: AbortSignal; onProgress: (percentage: number) => void }
export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  name?: string;
  label?: string;
  description?: React.ReactNode;
  onReject?: (rejections: FileUploadRejection[]) => void;
  /** Optional transport supplied by the app. Omit to collect files without uploading. */
  onUpload?: (file: File, context: FileUploadContext) => Promise<void>;
}

type UploadState = { status: "uploading" | "complete" | "error" | "cancelled"; progress?: number; error?: string };
const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;

function accepts(file: File, accept?: string) {
  if (!accept?.trim()) return true;
  return accept.split(",").some((entry) => {
    const rule = entry.trim().toLowerCase();
    if (!rule) return false;
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
    if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    return file.type.toLowerCase() === rule;
  });
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0 },
  drop: { position: "relative", display: "grid", alignContent: "center", justifyItems: "center", gap: "0.5rem", minHeight: "8.25rem", padding: "1.25rem", boxSizing: "border-box", borderWidth: vlak.hairline, borderStyle: "dashed", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper, outlineWidth: { default: null, ":focus-within": 2 }, outlineStyle: { default: null, ":focus-within": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  drag: { backgroundColor: vlak.controlFill, outline: { default: null, [mq.forcedColors]: "2px solid Highlight" } },
  input: { position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" },
  title: { fontSize: vlak.controlFs, fontWeight: 500, textAlign: "center" },
  description: { fontSize: vlak.controlLabel, color: vlak.gray, textAlign: "center", lineHeight: 1.45 },
  list: { display: "grid", gap: "0.5rem", listStyle: "none", margin: 0, padding: 0 },
  item: { display: "grid", gap: "0.5rem", padding: "0.75rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, borderRadius: vlak.radiusSm, minWidth: 0 },
  row: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", minWidth: 0 },
  name: { flex: "1 1 10rem", overflowWrap: "anywhere", fontSize: vlak.controlFs },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  action: { width: "auto" },
  status: { margin: 0, fontSize: vlak.controlLabel, color: vlak.gray },
});

/** Validated file selection, with an optional cancellable upload transport. */
export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload({
  value, defaultValue = [], onValueChange, accept, multiple = true, maxFiles, maxSize, disabled, name, label = "Choose files", description = "Drop files here or browse", onReject, onUpload, className, style, ...props
}, ref) {
  const [files, setFiles, inputRef] = useInputValue<File[], HTMLInputElement>(value, defaultValue, onValueChange, () => {
    for (const controller of controllers.current.values()) controller.abort();
    controllers.current.clear(); setUploads(new Map()); setRejections([]);
  });
  const mergedRef = useMergedRefs(ref, inputRef);
  const [dragging, setDragging] = React.useState(false);
  const [rejections, setRejections] = React.useState<FileUploadRejection[]>([]);
  const [uploads, setUploads] = React.useState<Map<File, UploadState>>(new Map());
  const controllers = React.useRef(new Map<File, AbortController>());
  const latest = React.useRef({ files, name, disabled });
  latest.current = { files, name, disabled };
  const id = React.useId();
  React.useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const appendFiles = (event: Event) => {
      const data = (event as FormDataEvent).formData;
      const state = latest.current;
      if (data && state.name && !state.disabled) for (const file of state.files) data.append(state.name, file, file.name);
    };
    form.addEventListener("formdata", appendFiles);
    return () => form.removeEventListener("formdata", appendFiles);
  }, [inputRef]);
  React.useEffect(() => () => { for (const controller of controllers.current.values()) controller.abort(); }, []);
  React.useEffect(() => {
    for (const [file, controller] of controllers.current) if (!files.includes(file)) { controller.abort(); controllers.current.delete(file); }
    setUploads(previous => {
      const remaining = [...previous].filter(([file]) => files.includes(file));
      return remaining.length === previous.size ? previous : new Map(remaining);
    });
  }, [files]);
  const update = (file: File, state: UploadState) => setUploads((previous) => new Map(previous).set(file, state));
  const upload = async (file: File) => {
    if (!onUpload || disabled) return;
    controllers.current.get(file)?.abort();
    const controller = new AbortController();
    controllers.current.set(file, controller);
    update(file, { status: "uploading" });
    try {
      await onUpload(file, { signal: controller.signal, onProgress: (percentage) => { if (!controller.signal.aborted) update(file, { status: "uploading", progress: Math.min(100, Math.max(0, percentage)) }); } });
      if (!controller.signal.aborted) update(file, { status: "complete", progress: 100 });
    } catch (error) {
      if (!controller.signal.aborted) update(file, { status: "error", error: error instanceof Error ? error.message : "Upload failed" });
    } finally { if (controllers.current.get(file) === controller) controllers.current.delete(file); }
  };
  const choose = (incoming: File[]) => {
    if (disabled) return;
    const accepted = multiple ? [...files] : [];
    const added: File[] = [];
    const rejected: FileUploadRejection[] = [];
    const limit = multiple ? maxFiles : 1;
    for (const file of incoming) {
      if (accepted.some((entry) => fileKey(entry) === fileKey(file))) continue;
      const reason = !accepts(file, accept) ? "File type is not accepted" : maxSize != null && file.size > maxSize ? `File exceeds ${maxSize} bytes` : limit != null && accepted.length >= limit ? `Choose at most ${limit} ${limit === 1 ? "file" : "files"}` : undefined;
      if (reason) rejected.push({ file, reason }); else { accepted.push(file); added.push(file); }
    }
    setRejections(rejected);
    if (rejected.length) onReject?.(rejected);
    if (added.length) { setFiles(accepted); for (const file of added) void upload(file); }
  };
  const root = rs(["rs-file-upload", className], styles.root);
  const drop = rs(["rs-file-upload-drop", dragging && "rs-file-upload-drag"], styles.drop, dragging && styles.drag);
  const input = rs(["rs-file-upload-input"], styles.input);
  const title = rs(["rs-file-upload-title"], styles.title);
  const desc = rs(["rs-file-upload-description"], styles.description);
  const list = rs(["rs-file-upload-list"], styles.list);
  const item = rs(["rs-file-upload-item"], styles.item);
  const row = rs(["rs-file-upload-row"], styles.row);
  const filename = rs(["rs-file-upload-name"], styles.name);
  const actions = rs(["rs-file-upload-actions"], styles.actions);
  const action = rs(["rs-file-upload-action"], styles.action);
  const status = rs(["rs-file-upload-status"], styles.status);
  return <div {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div className={drop.className} style={drop.style} onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={(event) => { event.preventDefault(); setDragging(false); choose(Array.from(event.dataTransfer.files)); }}>
      <span className={title.className} style={title.style}>{label}</span>
      <span id={`${id}-hint`} className={desc.className} style={desc.style}>{description}</span>
      <input ref={mergedRef} type="file" aria-label={label} aria-describedby={`${id}-hint`} disabled={disabled} accept={accept} multiple={multiple} className={input.className} style={input.style} onChange={(event) => { choose(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ""; }} />
    </div>
    {rejections.length > 0 && <div role="alert">{rejections.map(({ file, reason }) => <p key={fileKey(file)} className={status.className} style={status.style}>{file.name}: {reason}</p>)}</div>}
    {files.length > 0 && <ul aria-label="Selected files" className={list.className} style={list.style}>{files.map((file) => {
      const state = uploads.get(file);
      return <li key={fileKey(file)} className={item.className} style={item.style}>
        <div className={row.className} style={row.style}><span className={filename.className} style={filename.style}>{file.name}</span><div className={actions.className} style={actions.style}>
          {state?.status === "uploading" && <Button variant="ghost" disabled={disabled} className={action.className} style={action.style} aria-label={`Cancel upload of ${file.name}`} onClick={() => { controllers.current.get(file)?.abort(); update(file, { status: "cancelled" }); }}>Cancel</Button>}
          {(state?.status === "error" || state?.status === "cancelled") && onUpload && <Button variant="ghost" disabled={disabled} className={action.className} style={action.style} aria-label={`Retry upload of ${file.name}`} onClick={() => void upload(file)}>Retry</Button>}
          <Button variant="ghost" disabled={disabled} className={action.className} style={action.style} aria-label={`Remove ${file.name}`} onClick={() => { controllers.current.get(file)?.abort(); setFiles(files.filter((entry) => entry !== file)); inputRef.current?.focus(); }}>Remove</Button>
        </div></div>
        {state?.status === "uploading" && state.progress != null ? <Progress label={`Uploading ${file.name}`} value={state.progress} /> : <p role="status" className={status.className} style={status.style}>{state?.status === "error" ? state.error : state?.status === "complete" ? "Uploaded" : state?.status === "cancelled" ? "Cancelled" : state?.status === "uploading" ? "Uploading" : `${file.size.toLocaleString()} bytes · Ready`}</p>}
      </li>;
    })}</ul>}
  </div>;
});
