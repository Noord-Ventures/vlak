"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Badge } from "./badge";
import { Button } from "./button";
import { CodeBlock } from "./code-block";
import { Collapsible } from "./collapsible";

export type TestResultStatus = "passed" | "failed" | "skipped" | "running" | "pending";
export interface TestResultItem { id: string; name: string; status: TestResultStatus; duration?: number; error?: string; stack?: string }
export interface TestResultSuite { id: string; name: string; tests: TestResultItem[]; duration?: number }
export interface TestResultsProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  suites: TestResultSuite[];
  title?: React.ReactNode;
  /** Total elapsed time in milliseconds, when measured by the runner. */
  duration?: number;
  defaultOpen?: boolean;
  /** Requests a retry; only new supplied test data changes the displayed result. */
  onRetry?: (test: TestResultItem, suite: TestResultSuite) => void | Promise<void>;
}
const styles = stylex.create({
  root: { minWidth: 0, width: "100%", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper, fontSize: "0.875rem", lineHeight: 1.45 },
  header: { display: "grid", gap: "0.75rem", padding: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  title: { fontWeight: 600 },
  summary: { display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", fontVariantNumeric: "tabular-nums" },
  progress: { width: "100%", height: "0.5rem", accentColor: vlak.ink },
  content: { padding: "0.5rem 1rem 1rem", display: "grid", gap: "0.75rem", minWidth: 0 },
  list: { listStyle: "none", margin: 0, padding: 0 },
  test: { paddingBlock: "0.75rem", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider, color: vlak.ink, minWidth: 0 },
  line: { display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", minWidth: 0 },
  name: { minWidth: 0, overflowWrap: "anywhere", flex: "1 1 auto" },
  note: { color: vlak.gray, fontSize: "0.75rem", margin: 0 },
  error: { margin: "0.5rem 0", whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
});
function durationLabel(milliseconds: number): string { const ms = Number.isFinite(milliseconds) ? Math.max(0, milliseconds) : 0; return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`; }

function TestRow({ test, suite, onRetry }: { test: TestResultItem; suite: TestResultSuite; onRetry?: TestResultsProps["onRetry"] }) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");
  const locked = React.useRef(false);
  const request = React.useRef(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A new result invalidates the previous retry callback.
  React.useEffect(() => { request.current++; locked.current = false; setPending(false); setError(""); return () => { request.current++; }; }, [test.status, test.error, test.stack]);
  const retry = async () => {
    if (!onRetry || locked.current) return;
    locked.current = true;
    const id = ++request.current;
    setPending(true); setError("");
    try { await onRetry(test, suite); }
    catch { if (id === request.current) setError("Retry failed. Try again."); }
    finally { if (id === request.current) { locked.current = false; setPending(false); } }
  };
  const row = rs(["rs-test-results-test"], styles.test);
  const line = rs(["rs-test-results-line"], styles.line);
  const name = rs(["rs-test-results-name"], styles.name);
  const note = rs(["rs-test-results-note"], styles.note);
  const errorStyle = rs(["rs-test-results-error"], styles.error);
  return <li {...row}><div {...line}><Badge variant={test.status === "passed" ? "solid" : "muted"}>{test.status}</Badge><span {...name}>{test.name}</span>{test.duration != null && <span {...note}>{durationLabel(test.duration)}</span>}{test.status === "failed" && onRetry && <Button type="button" variant="subtle" disabled={pending} aria-label={`Retry ${test.name}`} onClick={() => { void retry(); }}>{pending ? "Retrying…" : "Retry"}</Button>}</div>
    {(test.error || test.stack) && <Collapsible title={`Failure details for ${test.name}`} defaultOpen={test.status === "failed"}>{test.error && <p {...errorStyle}>{test.error}</p>}{test.stack && <CodeBlock code={test.stack} language="Stack trace" />}</Collapsible>}
    <span {...note} role="status">{error || (pending ? "Retry requested…" : "")}</span>
  </li>;
}

/** Test hierarchy and derived totals, with runner-owned status and retry results. */
export const TestResults = React.forwardRef<HTMLElement, TestResultsProps>(function TestResults({ suites, title = "Test results", duration, defaultOpen = true, onRetry, children, className, style, "aria-label": label, "aria-labelledby": labelledBy, ...props }, ref) {
  const titleId = React.useId();
  const tests = suites.flatMap(suite => suite.tests);
  const counts = { passed: 0, failed: 0, skipped: 0, running: 0, pending: 0 };
  for (const test of tests) counts[test.status]++;
  const completed = counts.passed + counts.failed + counts.skipped;
  const root = rs(["rs-test-results", className], styles.root);
  const header = rs(["rs-test-results-header"], styles.header);
  const titleStyle = rs(["rs-test-results-title"], styles.title);
  const summary = rs(["rs-test-results-summary"], styles.summary);
  const progress = rs(["rs-test-results-progress"], styles.progress);
  const content = rs(["rs-test-results-content"], styles.content);
  const list = rs(["rs-test-results-list"], styles.list);
  const note = rs(["rs-test-results-note"], styles.note);
  return <section {...props} ref={ref} aria-label={label} aria-labelledby={labelledBy ?? (label == null ? titleId : undefined)} className={root.className} style={{ ...root.style, ...style }}>
    <header {...header}><span {...titleStyle} id={titleId}>{title}</span><div {...summary} role="status" aria-live="polite" aria-atomic="true">{Object.entries(counts).map(([status, count]) => count > 0 && <Badge key={status} variant={status === "passed" ? "solid" : "muted"}>{count} {status}</Badge>)}<span {...note}>{completed} of {tests.length} complete</span>{duration != null && <span {...note}>{durationLabel(duration)}</span>}</div><progress {...progress} value={completed} max={Math.max(1, tests.length)} aria-label="Tests completed" /></header>
    <div {...content}>{suites.map(suite => <Collapsible key={suite.id} title={<>{suite.name} · {suite.tests.length} tests{suite.duration != null && ` · ${durationLabel(suite.duration)}`}</>} defaultOpen={defaultOpen}><ul {...list}>{suite.tests.map(test => <TestRow key={test.id} test={test} suite={suite} onRetry={onRetry} />)}</ul>{suite.tests.length === 0 && <p {...note}>No tests in this suite.</p>}</Collapsible>)}{suites.length === 0 && <p {...note}>No test results yet.</p>}{children}</div>
  </section>;
});
