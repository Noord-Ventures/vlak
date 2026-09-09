"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export type WidgetStatus = "ready" | "loading" | "empty" | "error";
export interface WidgetProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Visible name of this widget and its region. */
  title: React.ReactNode;
  /** Name or linked attribution for the application or integration supplying the content. */
  provider?: React.ReactNode;
  /** Optional decorative provider or content mark. */
  icon?: React.ReactNode;
  description?: React.ReactNode;
  /** Application-supplied data state. The widget never fetches data itself. */
  status?: WidgetStatus;
  statusLabel?: string;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void | Promise<void>;
  /** Application-owned controls, rendered after the content. */
  actions?: React.ReactNode;
  /** Supporting source, update time, or context below the actions. */
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export interface WidgetEmbedProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  /** Descriptive name of the embedded interface, announced to assistive technology. */
  title: string;
  /** Address supplied by the application or its connected provider. */
  src: string;
}

const styles = stylex.create({
  root: { boxSizing: "border-box", minWidth: 0, width: "100%", maxWidth: "100%", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink, overflowWrap: "anywhere" },
  header: { display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  icon: { display: "flex", alignItems: "center", justifyContent: "center", width: "1.25rem", height: "1.25rem", flexShrink: 0 },
  heading: { display: "grid", gap: "0.25rem", flex: "1 1 auto", minWidth: 0 },
  title: { fontSize: "0.875rem", lineHeight: 1.45, fontWeight: 600 },
  provider: { fontSize: "0.75rem", lineHeight: 1.45, color: vlak.gray },
  label: { fontSize: "0.75rem", lineHeight: 1.45, color: vlak.gray, marginInlineStart: "auto" },
  content: { display: "grid", gap: "0.75rem", minWidth: 0, padding: "1rem", fontSize: "0.875rem", lineHeight: 1.45 },
  description: { margin: 0, color: vlak.gray },
  state: { display: "grid", justifyItems: "start", gap: "0.75rem", minWidth: 0 },
  message: { margin: 0 },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem", minWidth: 0, paddingBlock: "0 1rem", paddingInline: "1rem" },
  footer: { margin: 0, padding: "0.75rem 1rem", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider, fontSize: "0.75rem", lineHeight: 1.45, color: vlak.gray },
  embed: { boxSizing: "border-box", display: "block", width: "100%", maxWidth: "100%", minWidth: 0, borderWidth: 0 },
});

/** An explicitly sized provider iframe for a Widget. Permissions and provider messaging remain application-owned. */
export const WidgetEmbed = React.forwardRef<HTMLIFrameElement, WidgetEmbedProps>(function WidgetEmbed({
  title, src, height = 320, sandbox = "allow-scripts allow-forms", referrerPolicy = "no-referrer", loading = "lazy", className, style, ...props
}, ref) {
  const embed = rs(["rs-widget-embed", className], styles.embed);
  return <iframe {...props} ref={ref} title={title} src={src} height={height} sandbox={sandbox} referrerPolicy={referrerPolicy} loading={loading} className={embed.className} style={{ ...embed.style, ...style }} />;
});

/** A shared surface for application and third-party React content, with explicit data states. */
export const Widget = React.forwardRef<HTMLElement, WidgetProps>(function Widget({
  title, provider, icon, description, status = "ready", statusLabel, emptyMessage = "No results to show.", errorMessage = "This widget could not be loaded.",
  onRetry, actions, footer, children, className, style, "aria-label": label, "aria-labelledby": labelledBy, ...props
}, ref) {
  const titleId = React.useId();
  const [retrying, setRetrying] = React.useState(false);
  const [retryError, setRetryError] = React.useState("");
  const pending = React.useRef(false);
  const request = React.useRef(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A changed data state invalidates previous retry results.
  React.useEffect(() => {
    request.current += 1;
    pending.current = false;
    setRetrying(false);
    setRetryError("");
    return () => { request.current += 1; };
  }, [status]);
  const retry = async () => {
    if (!onRetry || pending.current) return;
    pending.current = true;
    const id = ++request.current;
    setRetrying(true);
    setRetryError("");
    try { await onRetry(); }
    catch { if (request.current === id) setRetryError("Retry failed. Try again."); }
    finally { if (request.current === id) { pending.current = false; setRetrying(false); } }
  };
  const root = rs(["rs-widget", className], styles.root);
  const header = rs(["rs-widget-header"], styles.header);
  const iconStyle = rs(["rs-widget-icon"], styles.icon);
  const heading = rs(["rs-widget-heading"], styles.heading);
  const titleStyle = rs(["rs-widget-title"], styles.title);
  const providerStyle = rs(["rs-widget-provider"], styles.provider);
  const labelStyle = rs(["rs-widget-label"], styles.label);
  const content = rs(["rs-widget-content"], styles.content);
  const descriptionStyle = rs(["rs-widget-description"], styles.description);
  const state = rs(["rs-widget-state"], styles.state);
  const message = rs(["rs-widget-message"], styles.message);
  const actionsStyle = rs(["rs-widget-actions"], styles.actions);
  const footerStyle = rs(["rs-widget-footer"], styles.footer);

  return <section {...props} ref={ref} aria-label={label} aria-labelledby={labelledBy ?? (label == null ? titleId : undefined)} data-status={status} className={root.className} style={{ ...root.style, ...style }}>
    <header {...header}>
      {icon != null && <span {...iconStyle} aria-hidden="true">{icon}</span>}
      <div {...heading}>
        <span {...titleStyle} id={titleId}>{title}</span>
        {provider != null && <div {...providerStyle}>{provider}</div>}
      </div>
      {statusLabel && <span {...labelStyle}>{statusLabel}</span>}
    </header>
    <div {...content}>
      {description != null && <div {...descriptionStyle}>{description}</div>}
      {status === "ready" ? children : <div {...state}>
        <p {...message} role={status === "error" ? "alert" : "status"}>{retrying ? "Retrying…" : retryError || (status === "loading" ? "Loading…" : status === "empty" ? emptyMessage : errorMessage)}</p>
        {status === "error" && onRetry && <Button type="button" variant="ghost" disabled={retrying} onClick={() => { void retry(); }}>{retrying ? "Retrying…" : "Try again"}</Button>}
      </div>}
    </div>
    {status === "ready" && actions != null && <div {...actionsStyle}>{actions}</div>}
    {footer != null && <div {...footerStyle}>{footer}</div>}
  </section>;
});
