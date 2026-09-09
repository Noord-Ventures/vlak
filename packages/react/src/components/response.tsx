"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export type ResponseStatus = "streaming" | "complete" | "error" | "stopped";

export interface ResponseState {
  from: "user" | "assistant";
  author: React.ReactNode;
  status: ResponseStatus;
  statusLabel: string;
  errorMessage?: string;
}
export interface ResponseParts {
  /** The complete identity and status row. Use this or its individual parts. */
  header: React.ReactNode;
  avatar: React.ReactNode;
  author: React.ReactNode;
  status: React.ReactNode;
  content: React.ReactNode;
  error: React.ReactNode;
  actions: React.ReactNode;
}
const ResponseContext = React.createContext<ResponseState | null>(null);

/** Reads speaker and response status from a custom descendant without threading props. */
export function useResponse(): ResponseState {
  const context = React.useContext(ResponseContext);
  if (!context) throw new Error("useResponse must be used inside Response.");
  return context;
}

export interface ResponseProps extends React.HTMLAttributes<HTMLElement> {
  /** The speaker's identity, separate from the native ARIA role. */
  from?: "user" | "assistant";
  author?: React.ReactNode;
  /** An application-owned avatar beside the author. */
  avatar?: React.ReactNode;
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
  /** Rearranges the same content and controls. Render each part once; keep the status announcement. */
  renderLayout?: (parts: ResponseParts, state: ResponseState) => React.ReactNode;
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
  identity: { display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 },
  avatar: { display: "inline-flex", flexShrink: 0, alignItems: "center", justifyContent: "center" },
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
    avatar,
    status = "complete",
    statusLabel,
    errorMessage,
    copyText,
    copyLabel = "Copy response",
    copiedLabel = "Copied",
    copyErrorLabel = "Could not copy. Try again.",
    actions,
    renderLayout,
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
  const identity = rs(["rs-response-identity"], styles.identity);
  const avatarStyle = rs(["rs-response-avatar"], styles.avatar);
  const statusStyle = rs(["rs-response-status"], styles.status);
  const content = rs(["rs-response-content"], styles.content);
  const error = rs(["rs-response-error"], styles.error);
  const actionsStyle = rs(["rs-response-actions"], styles.actions);
  const copyStyle = rs(["rs-response-copy"], styles.copy);
  const copyStatus = rs(["rs-response-copy-status"], styles.copyStatus);
  const showActions = copyText !== undefined || actions != null;
  const state: ResponseState = { from, author: author ?? (from === "user" ? "You" : "Assistant"), status, statusLabel: statusLabel ?? statusLabels[status], errorMessage };
  const authorPart = <span id={authorId} {...authorStyle}>{state.author}</span>;
  const avatarPart = avatar != null ? <span {...avatarStyle}>{avatar}</span> : null;
  const statusPart = <span {...statusStyle} role="status" aria-live="polite" aria-atomic="true">{state.statusLabel}</span>;
  const parts: ResponseParts = {
    avatar: avatarPart,
    author: authorPart,
    status: statusPart,
    header: <div {...header}>{avatarPart ? <div {...identity}>{avatarPart}{authorPart}</div> : authorPart}{statusPart}</div>,
    content: <div {...content}>{children}</div>,
    error: status === "error" && errorMessage ? <p {...error}>{errorMessage}</p> : null,
    actions: showActions ? <div {...actionsStyle}>
      {copyText !== undefined && <>
        <button type="button" {...copyStyle} disabled={copyState === "pending"} onClick={copy}>{copyLabel}</button>
        <span {...copyStatus} role="status" aria-live="polite" aria-atomic="true">{copyState === "copied" ? copiedLabel : copyState === "error" ? copyErrorLabel : ""}</span>
      </>}
      {actions}
    </div> : null,
  };
  const accessibleLabel = label ?? (renderLayout && !labelledBy ? (typeof state.author === "string" ? state.author : from === "user" ? "You" : "Assistant") : undefined);

  return (
    <ResponseContext.Provider value={state}><article
      ref={ref}
      {...props}
      aria-label={accessibleLabel}
      aria-labelledby={labelledBy ?? (accessibleLabel ? undefined : authorId)}
      data-from={from}
      data-status={status}
      className={root.className}
      style={{ ...root.style, ...style }}
    >
      {renderLayout ? renderLayout(parts, state) : <>{parts.header}{parts.content}{parts.error}{parts.actions}</>}
    </article></ResponseContext.Provider>
  );
});
