"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Conversation } from "./conversation";

export interface ChatProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Visible name of this chat and its region. */
  title: React.ReactNode;
  /** Context or status below the title. */
  description?: React.ReactNode;
  /** Application-owned controls in the header. */
  actions?: React.ReactNode;
  /** Messages rendered inside the conversation history. */
  children?: React.ReactNode;
  /** An application-owned message composer, outside the scrolling history. */
  composer: React.ReactNode;
  /** Supporting text below the composer. */
  footer?: React.ReactNode;
  /** Accessible name of the scrollable message history. */
  conversationLabel?: string;
  /** Height reserved for the message history, including its jump control. */
  historyHeight?: React.CSSProperties["height"];
  /** Follow new content while the reader is at the end. */
  autoScroll?: boolean;
}

const styles = stylex.create({
  root: {
    boxSizing: "border-box", display: "flex", flexDirection: "column", width: "100%", minWidth: 0, minHeight: 0,
    borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" },
    borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper,
  },
  header: {
    display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexShrink: 0,
    paddingBlock: "1rem", paddingInline: { default: "1.5rem", [mq.phone]: "1rem" },
    borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider,
  },
  heading: { display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0, flex: "1 1 12rem", overflowWrap: "anywhere" },
  title: { fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  description: { color: vlak.gray, fontSize: vlak.controlLabel, lineHeight: 1.45 },
  actions: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", minWidth: 0 },
  history: {
    boxSizing: "border-box", minHeight: 0, flex: "0 1 auto",
    paddingBlock: "1.5rem", paddingInline: { default: "1.5rem", [mq.phone]: "1rem" },
  },
  composer: {
    display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: 0, flexShrink: 0,
    paddingBlock: "1rem", paddingInline: { default: "1.5rem", [mq.phone]: "1rem" },
    borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider,
  },
  footer: { color: vlak.gray, fontSize: vlak.controlLabel, lineHeight: 1.45, overflowWrap: "anywhere" },
});

/** A chat frame with a named history and a composer that stays outside its scroll area. */
export const Chat = React.forwardRef<HTMLElement, ChatProps>(function Chat({
  title, description, actions, children, composer, footer, conversationLabel = "Conversation", historyHeight = "28rem", autoScroll = true,
  className, style, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props
}, ref) {
  const titleId = React.useId();
  const root = rs(["rs-chat", className], styles.root);
  const header = rs(["rs-chat-header"], styles.header);
  const heading = rs(["rs-chat-heading"], styles.heading);
  const titleStyle = rs(["rs-chat-title"], styles.title);
  const descriptionStyle = rs(["rs-chat-description"], styles.description);
  const actionsStyle = rs(["rs-chat-actions"], styles.actions);
  const history = rs(["rs-chat-history"], styles.history);
  const composerStyle = rs(["rs-chat-composer"], styles.composer);
  const footerStyle = rs(["rs-chat-footer"], styles.footer);

  return <section {...props} ref={ref} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy ?? (ariaLabel == null ? titleId : undefined)}
    className={root.className} style={{ ...root.style, ...style }}>
    <header {...header}>
      <div {...heading}>
        <span {...titleStyle} id={titleId}>{title}</span>
        {description != null && <div {...descriptionStyle}>{description}</div>}
      </div>
      {actions != null && <div {...actionsStyle}>{actions}</div>}
    </header>
    <Conversation {...history} label={conversationLabel} maxHeight="100%" autoScroll={autoScroll} style={{ ...history.style, height: historyHeight }}>
      {children}
    </Conversation>
    <div {...composerStyle}>
      {composer}
      {footer != null && <div {...footerStyle}>{footer}</div>}
    </div>
  </section>;
});
