"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";

export interface ArtifactProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  /** Requests closing; the application owns visibility and focus restoration. */
  onClose?: () => void;
  closeLabel?: string;
  /** Optional height cap for long generated content. */
  maxHeight?: React.CSSProperties["maxHeight"];
}
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", minWidth: 0, width: "100%", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper },
  header: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", padding: "0.75rem 1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  heading: { display: "grid", gap: "0.25rem", minWidth: 0, flex: "1 1 auto", overflowWrap: "anywhere" },
  title: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.45 },
  description: { fontSize: "0.75rem", lineHeight: 1.45, color: vlak.gray },
  actions: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.25rem" },
  content: { minWidth: 0, overflow: "auto", padding: "1rem", fontSize: "0.875rem", lineHeight: 1.45, outlineColor: vlak.ink, outlineOffset: -2 },
  footer: { padding: "0.75rem 1rem", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider, color: vlak.gray, fontSize: "0.75rem", lineHeight: 1.45 },
});

/** Generated content with header actions, a close request and an optional scroll region. */
export const Artifact = React.forwardRef<HTMLElement, ArtifactProps>(function Artifact({ title, description, actions, footer, onClose, closeLabel = "Close artifact", maxHeight, children, className, style, "aria-label": label, "aria-labelledby": labelledBy, ...props }, ref) {
  const titleId = React.useId();
  const root = rs(["rs-artifact", className], styles.root);
  const header = rs(["rs-artifact-header"], styles.header);
  const heading = rs(["rs-artifact-heading"], styles.heading);
  const titleStyle = rs(["rs-artifact-title"], styles.title);
  const descriptionStyle = rs(["rs-artifact-description"], styles.description);
  const actionStyle = rs(["rs-artifact-actions"], styles.actions);
  const content = rs(["rs-artifact-content"], styles.content);
  const footerStyle = rs(["rs-artifact-footer"], styles.footer);
  return <section {...props} ref={ref} aria-label={label} aria-labelledby={labelledBy ?? (label == null ? titleId : undefined)} className={root.className} style={{ ...root.style, ...style }}>
    <header {...header}><div {...heading}><span {...titleStyle} id={titleId}>{title}</span>{description != null && <div {...descriptionStyle}>{description}</div>}</div>
      {(actions != null || onClose) && <div {...actionStyle}>{actions}{onClose && <Button type="button" variant="subtle" size="icon" aria-label={closeLabel} title={closeLabel} onClick={onClose}><Icon name="close" /></Button>}</div>}
    </header>
    <div className={content.className} style={{ ...content.style, maxHeight }} tabIndex={maxHeight != null ? 0 : undefined}>{children}</div>
    {footer != null && <footer {...footerStyle}>{footer}</footer>}
  </section>;
});
