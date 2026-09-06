"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";

export interface FormError { id: string; message: string }
export interface ErrorSummaryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  errors: FormError[];
  title?: React.ReactNode;
  /** Move focus to the summary after a failed submission, not while typing. */
  autoFocus?: boolean;
}
const styles = stylex.create({
  root: { boxSizing: "border-box", minWidth: 0, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, padding: "1rem", backgroundColor: vlak.paper, color: vlak.ink, outlineColor: vlak.ink, outlineOffset: 2 },
  title: { fontSize: "0.875rem", fontWeight: 600, margin: "0 0 0.25rem", lineHeight: 1.45 },
  list: { margin: 0, padding: 0, listStyle: "none" },
  link: { display: "inline-flex", alignItems: "center", minHeight: vlak.hit, minWidth: vlak.hit, maxWidth: "100%", fontSize: "0.875rem", fontWeight: 400, color: vlak.ink, textDecoration: "underline", textDecorationThickness: vlak.hairline, textUnderlineOffset: "0.2em", lineHeight: 1.45, overflowWrap: "anywhere", borderRadius: vlak.radiusSm, outlineColor: vlak.ink, outlineOffset: 2 },
});

/** A form-wide summary linking each message to the field that needs attention. */
export const ErrorSummary = React.forwardRef<HTMLDivElement, ErrorSummaryProps>(function ErrorSummary({ errors, title = "Check the following fields", autoFocus = false, className, style, ...props }, ref) {
  const local = React.useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();
  const hasErrors = errors.length > 0;
  React.useEffect(() => { if (autoFocus && hasErrors) local.current?.focus(); }, [autoFocus, hasErrors]);
  const root = rs(["rs-error-summary", className], styles.root);
  const heading = rs(["rs-error-summary-title"], styles.title);
  const list = rs(["rs-error-summary-list"], styles.list);
  const link = rs(["rs-error-summary-link"], styles.link);
  if (!hasErrors) return null;
  return <div ref={node => { local.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} role="alert" aria-labelledby={titleId} tabIndex={-1} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <h2 id={titleId} {...heading}>{title}</h2>
    {/* biome-ignore lint/a11y/noRedundantRoles: Retain list semantics in Safari when list-style is none. */}
    <ul role="list" {...list}>{errors.map((error, index) => <li key={`${error.id}:${index}`}><a {...link} href={`#${encodeURIComponent(error.id)}`} onClick={event => { const field = document.getElementById(error.id); if (field) { event.preventDefault(); field.focus(); field.scrollIntoView?.({ block: "nearest" }); } }}>{error.message}</a></li>)}</ul>
  </div>;
});
