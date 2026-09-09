"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name of the scrollable message history. */
  label?: string;
  /** Maximum height of the message history, before it scrolls. */
  maxHeight?: React.CSSProperties["maxHeight"];
  /** Follow new content while the reader is at the end. */
  autoScroll?: boolean;
  latestLabel?: string;
}

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", minWidth: 0, color: vlak.ink },
  viewport: {
    overflowY: "auto", overflowX: "hidden", overscrollBehavior: "contain", minHeight: 0,
    minWidth: 0, boxSizing: "border-box", padding: "0.25rem", scrollBehavior: "auto",
    outlineWidth: { default: null, ":focus-visible": 2 },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": vlak.ink },
    outlineOffset: { default: null, ":focus-visible": -2 },
  },
  content: { display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0, overflowWrap: "anywhere" },
  footer: { display: "flex", justifyContent: "center" },
});

/** A message history that follows new content without taking the reader away from earlier messages. */
export const Conversation = React.forwardRef<HTMLDivElement, ConversationProps>(function Conversation({
  label = "Conversation", maxHeight = "28rem", autoScroll = true, latestLabel = "Jump to latest",
  className, style, children, ...props
}, ref) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const following = React.useRef(true);
  const [atEnd, setAtEnd] = React.useState(true);
  const viewportId = React.useId();
  const measure = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const end = viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop <= 24;
    following.current = end;
    setAtEnd(end);
  }, []);
  const jump = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
    following.current = true;
    setAtEnd(true);
  }, []);
  const follow = React.useCallback(() => {
    if (autoScroll && following.current) jump();
    else measure();
  }, [autoScroll, jump, measure]);

  // Content can grow without a new message (streaming, images, or rendered code).
  React.useEffect(() => {
    follow();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(follow);
    if (contentRef.current) observer.observe(contentRef.current);
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [follow]);
  React.useEffect(() => { follow(); }, [children, follow]);

  const root = rs(["rs-conversation", className], styles.root);
  const viewport = rs(["rs-conversation-viewport"], styles.viewport);
  const content = rs(["rs-conversation-content"], styles.content);
  const footer = rs(["rs-conversation-footer"], styles.footer);
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...viewport} ref={viewportRef} id={viewportId} role="log" aria-label={label} aria-live="off"
      tabIndex={0} style={{ ...viewport.style, maxHeight }} onScroll={measure}>
      <div {...content} ref={contentRef}>{children}</div>
    </div>
    {!atEnd && <div {...footer}><Button variant="ghost" aria-controls={viewportId} onClick={() => {
      jump();
      viewportRef.current?.focus({ preventScroll: true });
    }}>{latestLabel}</Button></div>}
  </div>;
});
