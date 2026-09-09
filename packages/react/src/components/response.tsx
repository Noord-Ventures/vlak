"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export type ResponseStatus = "streaming" | "complete" | "error" | "stopped";

export interface ResponseProps extends React.HTMLAttributes<HTMLElement> {
  /** The speaker's identity, separate from the native ARIA role. */
  from?: "user" | "assistant";
  author?: React.ReactNode;
  status?: ResponseStatus;
  /** A short status phrase. Keep token-by-token updates in children. */
  statusLabel?: string;
  errorMessage?: string;
  /** Explicit text to copy. Omit to hide the copy action. */
  copyText?: string;
  copyLabel?: string;
  copiedLabel?: string;
  copyErrorLabel?: string;
  /** Application-owned actions, such as retry or feedback buttons. */
  actions?: React.ReactNode;
  /** Rendered content. Supply your own markdown renderer here when needed. */
  children?: React.ReactNode;
}

const statusLabels: Record<ResponseStatus, string> = {
  streaming: "Responding",
  complete: "Complete",
  error: "Response failed",
  stopped: "Stopped",
};

const styles = stylex.create({
  root: {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "0.875rem",
    minWidth: 0,
    width: "100%",
    maxWidth: "66ch",
    alignSelf: "flex-start",
    marginInlineStart: 0,
    marginInlineEnd: "auto",
    paddingBlock: "1.25rem",
    paddingInline: 0,
    color: vlak.ink,
    fontSize: "0.9375rem",
    lineHeight: 1.45,
    overflowWrap: "anywhere",
  },
  user: {
    width: "fit-content",
    maxWidth: "min(85%, 66ch)",
    alignSelf: "flex-end",
    marginInlineStart: "auto",
    marginInlineEnd: 0,
    backgroundColor: vlak.tableAlt,
    borderRadius: vlak.radiusSm,
    paddingBlock: "1rem",
    paddingInline: "1rem",
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  author: {
    fontWeight: 600,
    fontSize: "0.84375rem",
  },
  status: {
    color: vlak.gray,
    fontSize: "0.8125rem",
  },
  content: {
    minWidth: 0,
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
  },
  error: {
    margin: 0,
    color: vlak.ink,
    fontSize: "0.875rem",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  copy: {
    boxSizing: "border-box",
    minHeight: vlak.hit,
    minWidth: vlak.hit,
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: {
      default: vlak.controlBorder,
      [mq.forcedColors]: "ButtonText",
    },
    borderRadius: vlak.radiusSm,
    backgroundColor: {
      default: "transparent",
      ":hover:not(:disabled)": { default: null, [mq.hover]: vlak.controlFill },
      [mq.forcedColors]: "ButtonFace",
    },
    color: {
      default: vlak.ink,
      [mq.forcedColors]: "ButtonText",
    },
    fontFamily: "inherit",
    fontSize: "0.8125rem",
    fontWeight: 500,
    lineHeight: 1.45,
    cursor: { default: "pointer", ":disabled": "wait" },
    outlineWidth: { default: null, ":focus-visible": 2 },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": vlak.ink },
    outlineOffset: { default: null, ":focus-visible": 2 },
  },
  copyStatus: {
    color: vlak.gray,
    fontSize: "0.8125rem",
  },
});

/** One message with application-rendered content and a separate status announcement. */
export const Response = React.forwardRef<HTMLElement, ResponseProps>(function Response(
  {
    from = "assistant",
    author,
    status = "complete",
    statusLabel,
    errorMessage,
    copyText,
    copyLabel = "Copy response",
    copiedLabel = "Copied",
    copyErrorLabel = "Could not copy. Try again.",
    actions,
    children,
    className,
    style,
    "aria-labelledby": labelledBy,
    "aria-label": label,
    ...props
  },
  ref,
) {
  const authorId = React.useId();
  const [copyState, setCopyState] = React.useState<"idle" | "pending" | "copied" | "error">("idle");
  const copyRequest = React.useRef(0);
  const copyPending = React.useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: New copy text invalidates pending writes and their feedback.
  React.useEffect(() => {
    copyRequest.current += 1;
    copyPending.current = false;
    setCopyState("idle");
    return () => { copyRequest.current += 1; };
  }, [copyText]);

  async function copy() {
    if (copyText === undefined || copyPending.current) return;
    const request = ++copyRequest.current;
    copyPending.current = true;
    setCopyState("pending");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(copyText);
      if (request === copyRequest.current) setCopyState("copied");
    } catch {
      if (request === copyRequest.current) setCopyState("error");
    } finally {
      if (request === copyRequest.current) copyPending.current = false;
    }
  }

  const root = rs(["rs-response", from === "user" && "rs-response-user", className], styles.root, from === "user" && styles.user);
  const header = rs(["rs-response-header"], styles.header);
  const authorStyle = rs(["rs-response-author"], styles.author);
  const statusStyle = rs(["rs-response-status"], styles.status);
  const content = rs(["rs-response-content"], styles.content);
  const error = rs(["rs-response-error"], styles.error);
  const actionsStyle = rs(["rs-response-actions"], styles.actions);
  const copyStyle = rs(["rs-response-copy"], styles.copy);
  const copyStatus = rs(["rs-response-copy-status"], styles.copyStatus);
  const showActions = copyText !== undefined || actions != null;

  return (
    <article
      ref={ref}
      {...props}
      aria-label={label}
      aria-labelledby={labelledBy ?? (label ? undefined : authorId)}
      data-from={from}
      data-status={status}
      className={root.className}
      style={{ ...root.style, ...style }}
    >
      <div {...header}>
        <span id={authorId} {...authorStyle}>{author ?? (from === "user" ? "You" : "Assistant")}</span>
        <span {...statusStyle} role="status" aria-live="polite" aria-atomic="true">
          {statusLabel ?? statusLabels[status]}
        </span>
      </div>
      <div {...content}>{children}</div>
      {status === "error" && errorMessage && <p {...error}>{errorMessage}</p>}
      {showActions && <div {...actionsStyle}>
        {copyText !== undefined && <>
          <button type="button" {...copyStyle} disabled={copyState === "pending"} onClick={copy}>
            {copyLabel}
          </button>
          <span {...copyStatus} role="status" aria-live="polite" aria-atomic="true">
            {copyState === "copied" ? copiedLabel : copyState === "error" ? copyErrorLabel : ""}
          </span>
        </>}
        {actions}
      </div>}
    </article>
  );
});
