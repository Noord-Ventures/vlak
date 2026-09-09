"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Button, CodeBlock, Sandbox, StackTrace, Terminal, WebPreview, Widget } from "@noorddev/vlak-react";
import dynamic from "next/dynamic";
const JSXPreview = dynamic(() => import("@noorddev/vlak-react/components/jsx-preview").then(module => module.JSXPreview));

const terminalChunks = ["$ pnpm test\n", "\u001b[1mRunning composer tests\u001b[0m\n", "\u001b[32mPASS\u001b[0m sends a complete prompt\n", "\u001b[32mPASS\u001b[0m retains the draft on failure\n", "\n2 tests passed in 428 ms\n"];
export function TerminalPreview({ title = "Composer tests" }: { title?: string } = {}) {
  const [count, setCount] = useState(terminalChunks.length);
  const [playing, setPlaying] = useState(false);
  const [colors, setColors] = useState(false);
  useEffect(() => { if (!playing || count >= terminalChunks.length) return; const timer = window.setTimeout(() => setCount(current => current + 1), 450); return () => window.clearTimeout(timer); }, [count, playing]);
  return <div style={{ display: "grid", gap: "1rem", minWidth: 0 }}><Terminal title={title} output={terminalChunks.slice(0, count).join("")} streaming={playing && count < terminalChunks.length} ansiColors={colors} onClear={() => { setPlaying(false); setCount(0); }} /><div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}><Button variant="subtle" onClick={() => { setPlaying(true); setCount(0); }}>Replay output</Button><Button variant="subtle" aria-pressed={colors} onClick={() => setColors(current => !current)}>{colors ? "Use monochrome" : "Show ANSI colors"}</Button></div></div>;
}

export function StackTracePreview() {
  const [location, setLocation] = useState("");
  return <div style={{ display: "grid", gap: "1rem", minWidth: 0 }}><StackTrace trace={'TypeError: Draft must contain text\n  at sendPrompt (src/composer.tsx:42:5)\n  at handleSubmit (src/chat.tsx:18:3)\n  at node:internal/process/task_queues:95:5'} defaultOpen onFilePathClick={(path, line, column) => setLocation(`${path}:${line}:${column}`)} />{location && <CodeBlock language={location} code={'if (!draft.trim()) {\n  throw new TypeError("Draft must contain text");\n}'} />}</div>;
}

export function SandboxPreview() {
  const [state, setState] = useState<"complete" | "error">("complete");
  return <div style={{ display: "grid", gap: "1rem", minWidth: 0 }}><Sandbox title="Check the generated module" state={state} code={'export function canSend(draft: string) {\n  return draft.trim().length > 0;\n}'} language="TypeScript" output={state === "complete" ? "2 checks passed\nNo errors found." : "1 check failed\nExpected an empty draft to be rejected."} error={state === "error" ? "The recorded check failed." : undefined} /><Button variant="subtle" aria-pressed={state === "error"} onClick={() => setState(current => current === "complete" ? "error" : "complete")}>{state === "complete" ? "Show failed result" : "Show successful result"}</Button></div>;
}

export function WebPreviewPreview({ title = "Calendar preview" }: { title?: string } = {}) {
  const [history, setHistory] = useState(["/widgets/calendar-demo.html"]);
  const [index, setIndex] = useState(0);
  return <WebPreview title={title} url={history[index]} onUrlChange={url => { setHistory(current => [...current.slice(0, index + 1), url]); setIndex(index + 1); }} onBack={() => setIndex(current => current - 1)} onForward={() => setIndex(current => current + 1)} canGoBack={index > 0} canGoForward={index < history.length - 1} frameProps={{ height: 268, sandbox: "" }} logs={[{ id: "ready", level: "info", message: "Calendar example loaded. No external calendar is connected.", timestamp: "2026-09-09T10:20:00Z" }]} />;
}

function PreviewNote({ title, children }: { title: string; children?: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return <Widget title={title} actions={<Button variant="subtle" aria-expanded={expanded} onClick={() => setExpanded(current => !current)}>{expanded ? "Hide details" : "Show details"}</Button>}>{children}{expanded && <p>This registered component owns its local controls.</p>}</Widget>;
}
const previewComponents = { Note: PreviewNote };
export function JSXPreviewPreview({ title = "Review summary" }: { title?: string } = {}) {
  const [state, setState] = useState<"complete" | "streaming" | "invalid">("complete");
  return <div style={{ display: "grid", gap: "1rem", minWidth: 0 }}><JSXPreview jsx={state === "invalid" ? "<div>{runTask()}</div>" : state === "streaming" ? '<Note title={title}><p>{count} findings' : '<Note title={title}><p>{count} findings are ready for review.</p></Note>'} streaming={state === "streaming"} components={previewComponents} bindings={{ count: 3, title }} /><div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>{(["complete", "streaming", "invalid"] as const).map(value => <Button key={value} variant="subtle" aria-pressed={state === value} onClick={() => setState(value)}>{value === "complete" ? "Complete" : value === "streaming" ? "Partial stream" : "Invalid expression"}</Button>)}</div></div>;
}

export const aiCodeToolsPreviews: Record<string, ComponentType> = {
  terminal: TerminalPreview,
  "stack-trace": StackTracePreview,
  sandbox: SandboxPreview,
  "web-preview": WebPreviewPreview,
  "jsx-preview": JSXPreviewPreview,
};
