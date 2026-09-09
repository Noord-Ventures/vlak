"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";

export interface AttachmentData {
  id: string;
  name: string;
  mediaType?: string;
  size?: number;
  url?: string;
  status?: "ready" | "uploading" | "error";
  progress?: number;
  error?: string;
}
export type AttachmentVariant = "grid" | "inline" | "list";
const AttachmentLayout = React.createContext<AttachmentVariant>("grid");

export interface AttachmentsProps extends React.HTMLAttributes<HTMLUListElement> {
  label?: string;
  variant?: AttachmentVariant;
}
export interface AttachmentProps extends React.HTMLAttributes<HTMLLIElement> {
  data: AttachmentData;
  /** Overrides the layout inherited from Attachments. */
  variant?: AttachmentVariant;
  disabled?: boolean;
  onRemove?: () => void;
  onRetry?: () => void;
  /** Trusted application content replaces the automatic media preview. */
  preview?: React.ReactNode;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", padding: 0, margin: 0, listStyle: "none", minWidth: 0 },
  grid: { gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))" },
  inline: { display: "flex", flexWrap: "wrap", alignItems: "flex-start" },
  list: { gridTemplateColumns: "minmax(0, 1fr)" },
  inlineItem: { width: "auto", maxWidth: "100%", flex: "0 1 auto", padding: "0.25rem" },
  listItem: { width: "100%", boxSizing: "border-box" },
  inlineThumbnail: { width: 32, height: 32 },
  inlineDetail: { display: "none" },
  inlineMedia: { maxWidth: "18rem" },
  item: { minWidth: 0, display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.5rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper },
  row: { display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 },
  thumbnail: { width: 48, height: 48, objectFit: "cover", borderRadius: vlak.radiusSm, flexShrink: 0 },
  fileIcon: { width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: vlak.gray, backgroundColor: vlak.tableAlt, borderRadius: vlak.radiusSm, flexShrink: 0 },
  info: { display: "grid", gap: "0.25rem", flex: "1 1 auto", minWidth: 0 },
  name: { fontSize: "0.8125rem", fontWeight: 500, color: vlak.ink, overflowWrap: "anywhere", margin: 0 },
  detail: { fontSize: "0.75rem", lineHeight: 1.4, color: vlak.gray, margin: 0, overflowWrap: "anywhere" },
  action: { width: 44, minWidth: 44, maxWidth: 44, height: 44, padding: 0, flexShrink: 0 },
  media: { display: "block", width: "100%", minWidth: 0, maxHeight: 240, borderRadius: vlak.radiusSm },
  link: { color: vlak.ink, textDecoration: "underline", textUnderlineOffset: "0.2em", outlineWidth: { default: 0, ":focus-visible": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 },
  status: { fontSize: "0.75rem", color: vlak.gray, margin: 0 },
  progress: { width: "100%", height: 6, accentColor: vlak.ink },
});

function attachmentUrl(url?: string): string | undefined {
  if (!url || Array.from(url).some((character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127)) return undefined;
  try { return ["http:", "https:", "blob:"].includes(new URL(url, "https://vlak.invalid").protocol) ? url : undefined; }
  catch { return undefined; }
}

/** A responsive list of application-owned files and media. */
export const Attachments = React.forwardRef<HTMLUListElement, AttachmentsProps>(function Attachments({ label = "Attachments", variant = "grid", className, style, ...props }, ref) {
  const root = rs(["rs-attachments", variant === "grid" && "rs-attachments-grid", variant === "inline" && "rs-attachments-inline", variant === "list" && "rs-attachments-list", className], styles.root, variant === "grid" && styles.grid, variant === "inline" && styles.inline, variant === "list" && styles.list);
  return <AttachmentLayout.Provider value={variant}><ul {...props} ref={ref} aria-label={label} className={root.className} style={{ ...root.style, ...style }} /></AttachmentLayout.Provider>;
});

/** File metadata and native media previews, with explicit application actions. */
export const Attachment = React.forwardRef<HTMLLIElement, AttachmentProps>(function Attachment({ data, variant, disabled = false, onRemove, onRetry, preview, className, style, ...props }, ref) {
  const inheritedVariant = React.useContext(AttachmentLayout);
  const layout = variant ?? inheritedVariant;
  const isInline = layout === "inline";
  const url = attachmentUrl(data.url);
  const download = url?.slice(0, 5).toLowerCase() === "blob:";
  const mediaType = data.mediaType?.toLowerCase() ?? "";
  const image = mediaType.startsWith("image/");
  const audio = mediaType.startsWith("audio/");
  const video = mediaType.startsWith("video/");
  const root = rs(["rs-attachment", isInline && "rs-attachment-inline", layout === "list" && "rs-attachment-list", className], styles.item, isInline && styles.inlineItem, layout === "list" && styles.listItem);
  const row = rs(["rs-attachment-row"], styles.row);
  const thumbnail = rs(["rs-attachment-thumbnail", isInline && "rs-attachment-thumbnail-inline"], styles.thumbnail, isInline && styles.inlineThumbnail);
  const fileIcon = rs(["rs-attachment-file-icon", isInline && "rs-attachment-thumbnail-inline"], styles.fileIcon, isInline && styles.inlineThumbnail);
  const info = rs(["rs-attachment-info"], styles.info);
  const name = rs(["rs-attachment-name"], styles.name);
  const detail = rs(["rs-attachment-detail", isInline && "rs-attachment-detail-inline"], styles.detail, isInline && styles.inlineDetail);
  const action = rs(["rs-attachment-action"], styles.action);
  const media = rs(["rs-attachment-media", isInline && "rs-attachment-media-inline"], styles.media, isInline && styles.inlineMedia);
  const link = rs(["rs-attachment-link"], styles.link);
  const status = rs(["rs-attachment-status"], styles.status);
  const progress = rs(["rs-attachment-progress"], styles.progress);
  return <li {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <div {...row}>
      {image && url ? <img {...thumbnail} src={url} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span {...fileIcon} aria-hidden="true"><Icon name="attachment" /></span>}
      <div {...info}><p {...name}>{url ? <a {...link} href={url} download={download ? data.name || true : undefined} target={download ? undefined : "_blank"} rel={download ? undefined : "noopener noreferrer"}>{data.name}</a> : data.name}</p><p {...detail}>{[data.mediaType, data.size === undefined ? undefined : `${data.size.toLocaleString()} bytes`].filter(Boolean).join(" · ")}</p></div>
      {onRetry && data.status === "error" && <Button {...action} variant="subtle" aria-label={`Retry ${data.name}`} title={`Retry ${data.name}`} disabled={disabled} onClick={onRetry}><Icon name="refresh" /></Button>}
      {onRemove && <Button {...action} variant="subtle" aria-label={`Remove ${data.name}`} title={`Remove ${data.name}`} disabled={disabled} onClick={onRemove}><Icon name="close" size={12} /></Button>}
    </div>
    {preview ?? (url && audio ? <audio {...media} controls preload="none" src={url} aria-label={`Audio preview of ${data.name}`} /> : url && video ? <video {...media} controls preload="metadata" src={url} aria-label={`Video preview of ${data.name}`} /> : null)}
    {data.status === "uploading" && data.progress !== undefined && <progress {...progress} max={100} value={Math.min(100, Math.max(0, data.progress))} aria-label={`Uploading ${data.name}`} />}
    {data.status && data.status !== "ready" && <p {...status} role={data.status === "error" ? "alert" : "status"}>{data.status === "error" ? data.error || "This file could not be uploaded." : "Uploading…"}</p>}
  </li>;
});

/** Creates local preview URLs and revokes them when files leave the list or the owner unmounts. */
export function useFileAttachments(files: readonly File[]): AttachmentData[] {
  const prefix = React.useId();
  const ids = React.useRef(new WeakMap<File, string>());
  const sequence = React.useRef(0);
  const [previews, setPreviews] = React.useState(new Map<File, string>());
  const urls = React.useRef(new Map<File, string>());
  React.useEffect(() => {
    let changed = false;
    for (const [file, url] of urls.current) if (!files.includes(file)) { URL.revokeObjectURL(url); urls.current.delete(file); changed = true; }
    if (typeof URL.createObjectURL === "function") for (const file of files) if (!urls.current.has(file)) { urls.current.set(file, URL.createObjectURL(file)); changed = true; }
    if (changed) setPreviews(new Map(urls.current));
  }, [files]);
  React.useEffect(() => () => { for (const url of urls.current.values()) URL.revokeObjectURL(url); urls.current.clear(); }, []);
  return files.map((file) => {
    if (!ids.current.has(file)) ids.current.set(file, `${prefix}-${++sequence.current}`);
    return { id: ids.current.get(file)!, name: file.name, mediaType: file.type, size: file.size, url: previews.get(file), status: "ready" };
  });
}
