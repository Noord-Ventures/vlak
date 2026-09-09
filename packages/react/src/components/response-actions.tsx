"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useOverlayPosition } from "../use-overlay-position";
import { MenuPanel, type MenuCloseReason } from "./dropdown-menu";
import { Button } from "./button";

export type ResponseFeedback = "positive" | "negative" | null;
export type ResponseAction = "copy" | "read" | "feedback" | "share";

export interface ResponseActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Plain text used for copying, narration, and the default share action. */
  text: string;
  /** Built-in controls in display and keyboard order. Omit for all four; duplicates are ignored. */
  actions?: readonly ResponseAction[];
  feedback?: ResponseFeedback;
  defaultFeedback?: ResponseFeedback;
  /** A rejected promise preserves the previous selection and allows retry. */
  onFeedback?: (value: ResponseFeedback) => void | Promise<void>;
  /** Overrides native sharing. Without it, unsupported browsers copy the text. */
  onShare?: () => void | Promise<void>;
  /** Reports this response's narration state for an avatar or other presentation. */
  onReadingChange?: (reading: boolean) => void;
}

const styles = stylex.create({
  root: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0, minWidth: 0, color: vlak.gray },
  selected: { color: { default: vlak.ink, [mq.forcedColors]: "HighlightText" }, backgroundColor: { default: vlak.tableAlt, [mq.forcedColors]: "Highlight" } },
  icon: { display: "block", width: 18, height: 18, flexShrink: 0, pointerEvents: "none" },
  status: { color: vlak.gray, fontSize: "0.8125rem", lineHeight: 1.45, overflowWrap: "anywhere" },
  menu: { boxSizing: "border-box", position: "fixed", zIndex: vlak.zFloat, width: "13rem", margin: 0, padding: "0.25rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink },
});

type ActionIcon = "copy" | "read" | "stop" | "feedback" | "share";

function ActionGlyph({ name }: { name: ActionIcon }) {
  const icon = rs(["rs-response-actions-icon"], styles.icon);
  return <svg {...icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === "copy" && <><rect x="8" y="8" width="12" height="13" rx="1" /><path d="M16 8V3H4v13h4" /></>}
    {name === "read" && <><path d="m11 4-6 5H2v6h3l6 5V4Z" /><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></>}
    {name === "stop" && <rect x="5" y="5" width="14" height="14" rx="1" />}
    {name === "feedback" && <><path transform="translate(1 0)" d="M1 7h3v7H1zM4 7l3-5c1.5 0 2 1 1 4h4a1 1 0 0 1 1 1l-1.5 6a1 1 0 0 1-1 .8H4" /><path transform="translate(-1 0)" d="M23 17h-3v-7h3zM20 17l-3 5c-1.5 0-2-1-1-4h-4a1 1 0 0 1-1-1l1.5-6a1 1 0 0 1 1-.8H20" /></>}
    {name === "share" && <path d="M12 16V2m-5 5 5-5 5 5M5 12H3v10h18V12h-2" />}
  </svg>;
}

/** Compact message actions. Speech and sharing run only after a button activation. */
export const ResponseActions = React.forwardRef<HTMLDivElement, ResponseActionsProps>(function ResponseActions({
  text, actions = ["copy", "read", "feedback", "share"], feedback, defaultFeedback = null, onFeedback, onShare, onReadingChange, className, style, children, "aria-label": label = "Response actions", ...props
}, ref) {
  const actionOrder = [...new Set(actions)];
  const hasRead = actionOrder.includes("read");
  const hasFeedback = actionOrder.includes("feedback");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(rootRef, ref);
  const [innerFeedback, setInnerFeedback] = React.useState<ResponseFeedback>(defaultFeedback);
  const selected = feedback === undefined ? innerFeedback : feedback;
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [canRead, setCanRead] = React.useState(false);
  const [reading, setReading] = React.useState(false);
  const locked = React.useRef(false);
  const version = React.useRef(0);
  const utterance = React.useRef<SpeechSynthesisUtterance | null>(null);
  const readingRef = React.useRef(false);
  const readingCallback = React.useRef(onReadingChange);
  readingCallback.current = onReadingChange;
  const feedbackId = React.useId();
  const feedbackTrigger = React.useRef<HTMLButtonElement>(null);
  const feedbackPanel = React.useRef<HTMLDivElement>(null);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [initialChoice, setInitialChoice] = React.useState<"first" | "last">("first");
  const placement = useOverlayPosition(feedbackOpen, feedbackPanel, feedbackTrigger, undefined, "bottom", { matchAnchorWidth: false });

  React.useEffect(() => {
    if (!feedbackOpen) return;
    const outside = (event: PointerEvent) => {
      if (!feedbackTrigger.current?.contains(event.target as Node) && !feedbackPanel.current?.contains(event.target as Node)) setFeedbackOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [feedbackOpen]);

  function closeFeedback(reason: MenuCloseReason) {
    setFeedbackOpen(false);
    if (reason !== "outside") feedbackTrigger.current?.focus();
  }

  function openFeedback(at: "first" | "last" = "first") {
    if (locked.current) return;
    setInitialChoice(at);
    setFeedbackOpen(true);
  }

  function feedbackKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (feedbackOpen) closeFeedback("escape");
      else openFeedback(event.key === "ArrowUp" ? "last" : "first");
    } else if (event.key === "Escape" && feedbackOpen) {
      event.preventDefault();
      closeFeedback("escape");
    }
  }

  function updateReading(value: boolean, updateState = true) {
    if (updateState) setReading(value);
    if (readingRef.current === value) return;
    readingRef.current = value;
    readingCallback.current?.(value);
  }

  function stopReading(updateState = true) {
    const owned = utterance.current;
    if (!owned) return;
    utterance.current = null;
    owned.onend = null;
    owned.onerror = null;
    // The platform exposes one shared queue. Only cancel while our own utterance is pending or active.
    window.speechSynthesis.cancel();
    updateReading(false, updateState);
  }

  React.useEffect(() => {
    setCanRead(typeof window.speechSynthesis?.speak === "function" && typeof window.SpeechSynthesisUtterance === "function");
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Removing a control closes its owned interaction, without restarting on unrelated renders.
  React.useEffect(() => {
    if (!hasRead) stopReading();
    if (!hasFeedback && feedbackOpen) {
      setFeedbackOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    }
  }, [hasRead, hasFeedback]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Replacing message text invalidates its pending actions and narration.
  React.useEffect(() => {
    version.current++;
    locked.current = false;
    setBusy(false);
    setMessage("");
    setReading(false);
    if (feedbackOpen) feedbackTrigger.current?.focus();
    setFeedbackOpen(false);
    return () => { version.current++; stopReading(false); };
  }, [text]);

  async function perform(action: () => Promise<string>, errorMessage: string) {
    if (locked.current) return;
    locked.current = true;
    const request = ++version.current;
    setBusy(true);
    setMessage("");
    setFeedbackOpen(false);
    try {
      const result = await action();
      if (request === version.current) setMessage(result);
    } catch {
      if (request === version.current) setMessage(errorMessage);
    } finally {
      if (request === version.current) { locked.current = false; setBusy(false); }
    }
  }

  async function copyText() {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(text);
  }

  function copy() {
    void perform(async () => { await copyText(); return "Copied"; }, "Could not copy. Try again.");
  }

  function rate(value: Exclude<ResponseFeedback, null>) {
    const next = selected === value ? null : value;
    const request = version.current + 1;
    void perform(async () => {
      await onFeedback?.(next);
      if (request === version.current && feedback === undefined) setInnerFeedback(next);
      return next === "positive" ? "Marked as helpful" : next === "negative" ? "Marked as unhelpful" : "Feedback cleared";
    }, "Could not save feedback. Try again.");
  }

  function share() {
    void perform(async () => {
      if (onShare) { await onShare(); return "Shared"; }
      if (typeof navigator.share === "function") {
        try { await navigator.share({ text }); return "Shared"; }
        catch (error) { if (typeof error === "object" && error !== null && "name" in error && error.name === "AbortError") return ""; throw error; }
      }
      await copyText();
      return "Copied response to share";
    }, "Could not share. Try again.");
  }

  function narrate() {
    if (utterance.current) { stopReading(); setMessage("Reading stopped"); return; }
    if (!canRead || !text) return;
    const speech = window.speechSynthesis;
    if (speech.speaking || speech.pending) { setMessage("Another reading is in progress. Try again when it finishes."); return; }
    const next = new window.SpeechSynthesisUtterance(text);
    utterance.current = next;
    next.onend = () => {
      if (utterance.current !== next) return;
      utterance.current = null;
      updateReading(false);
      setMessage("Reading finished");
    };
    next.onerror = () => {
      if (utterance.current !== next) return;
      utterance.current = null;
      updateReading(false);
      setMessage("Could not read aloud. Try again.");
    };
    updateReading(true);
    setMessage("");
    try { speech.speak(next); }
    catch { utterance.current = null; updateReading(false); setMessage("Could not read aloud. Try again."); }
  }

  const root = rs(["rs-response-actions-bar", className], styles.root);
  const feedbackButton = rs([selected !== null && "rs-response-actions-selected"], selected !== null && styles.selected);
  const menu = rs(["rs-response-actions-menu"], styles.menu);
  const status = rs(["rs-response-actions-status"], styles.status);
  const readingLabel = reading ? "Stop reading" : "Read aloud";
  const controls: Record<ResponseAction, React.ReactNode> = {
    copy: <Button variant="subtle" size="icon" aria-label="Copy response" title="Copy response" disabled={busy || !text} onClick={copy}><ActionGlyph name="copy" /></Button>,
    read: <Button variant="subtle" size="icon" aria-label={readingLabel} title={canRead ? readingLabel : "Read aloud is unavailable in this browser"} disabled={!canRead || !text} onClick={narrate}><ActionGlyph name={reading ? "stop" : "read"} /></Button>,
    feedback: <><Button {...feedbackButton} variant="subtle" size="icon" ref={feedbackTrigger} id={`${feedbackId}-trigger`} aria-label="Rate response" title={selected === null ? "Rate response" : selected === "positive" ? "Rate response: Helpful" : "Rate response: Unhelpful"} aria-haspopup="menu" aria-expanded={feedbackOpen} aria-controls={feedbackOpen ? `${feedbackId}-menu` : undefined} aria-disabled={busy || undefined} data-feedback={selected ?? "none"} onClick={() => feedbackOpen ? closeFeedback("select") : openFeedback()} onKeyDown={feedbackKeyDown}><ActionGlyph name="feedback" /></Button>
    {feedbackOpen && hasFeedback && <MenuPanel id={`${feedbackId}-menu`} panelRef={feedbackPanel} labelledBy={`${feedbackId}-trigger`} initial={initialChoice} className={menu.className} style={{ ...menu.style, ...placement }} onClose={closeFeedback} items={[
      { label: "Helpful response", checked: selected === "positive", disabled: busy, onSelect: () => rate("positive") },
      { label: "Unhelpful response", checked: selected === "negative", disabled: busy, onSelect: () => rate("negative") },
    ]} />}</>,
    share: <Button variant="subtle" size="icon" aria-label="Share response" title="Share response" disabled={busy || !text} onClick={share}><ActionGlyph name="share" /></Button>,
  };
  return <div role="group" aria-label={label} {...props} ref={mergedRef} className={root.className} style={{ ...root.style, ...style }}>
    {actionOrder.map(action => <React.Fragment key={action}>{controls[action]}</React.Fragment>)}
    {children}
    <span {...status} role="status" aria-live="polite" aria-atomic="true">{message}</span>
  </div>;
});
