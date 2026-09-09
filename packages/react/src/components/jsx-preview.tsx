"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import JsxParser, { type TProps as ParserProps } from "react-jsx-parser";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { completePreviewJSX, previewBindings, validatePreviewJSX } from "./jsx-preview-parser";

export interface JSXPreviewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onError"> {
  jsx: string;
  streaming?: boolean;
  /** Trusted, display-only application components. Do not expose components that execute operations during render. */
  components?: Record<string, React.ElementType>;
  /** Plain data only. Calls, functions, accessors and prototype access are rejected. */
  bindings?: Record<string, unknown>;
  onError?: (error: Error) => void;
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
}
const ParserComponent = JsxParser as unknown as React.ComponentType<ParserProps>;
const styles = stylex.create({
  root: { minWidth: 0, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink, padding: "1rem", fontSize: "0.875rem", lineHeight: 1.45, overflow: "auto", isolation: "isolate", contain: "layout paint" },
  content: { minWidth: 0, overflowWrap: "anywhere" },
  status: { margin: "0.5rem 0 0", color: vlak.gray, fontSize: "0.75rem" },
  error: { margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
});

class PreviewBoundary extends React.Component<{ children: React.ReactNode; renderError: (error: Error) => React.ReactNode; onError: (error: Error) => void }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { this.props.onError(error); }
  render() { return this.state.error ? this.props.renderError(this.state.error) : this.props.children; }
}

/** Optional Acorn-validated JSX data renderer. This is not a general JavaScript sandbox. */
export const JSXPreview = React.forwardRef<HTMLDivElement, JSXPreviewProps>(function JSXPreview({ jsx, streaming = false, components = {}, bindings, onError, fallback, className, style, ...props }, ref) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const lastGood = React.useRef<{ source: string; bindings: Record<string, unknown> } | null>(null);
  const reported = React.useRef<string | null>(null);
  const errorCallback = React.useRef(onError);
  errorCallback.current = onError;
  const result = React.useMemo(() => {
    try {
      const source = streaming ? completePreviewJSX(jsx) : jsx;
      validatePreviewJSX(source, new Set(Object.keys(components)));
      const data = previewBindings(bindings);
      const good = { source, bindings: data };
      if (source.trim()) lastGood.current = good;
      return { good, error: null };
    } catch (error) { return { good: streaming ? lastGood.current : null, error: error instanceof Error ? error : new Error("Could not parse this preview.") }; }
  }, [jsx, streaming, components, bindings]);
  const root = rs(["rs-jsx-preview", className], styles.root);
  const content = rs(["rs-jsx-preview-content"], styles.content);
  const status = rs(["rs-jsx-preview-status"], styles.status);
  const errorStyle = rs(["rs-jsx-preview-error"], styles.error);
  const renderError = (error: Error) => <div {...errorStyle} role="alert">{typeof fallback === "function" ? fallback(error) : fallback ?? `Could not render preview: ${error.message}`}</div>;
  const report = React.useCallback((error: Error) => { const key = `${jsx}:${error.message}`; if (!streaming && reported.current !== key) { reported.current = key; queueMicrotask(() => errorCallback.current?.(error)); } }, [jsx, streaming]);
  React.useEffect(() => { if (result.error) report(result.error); else reported.current = null; }, [result.error, report]);
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    {!mounted && <p {...status}>Preparing preview…</p>}
    {mounted && result.good && <div {...content}><PreviewBoundary key={`${result.good.source}:${streaming}`} renderError={renderError} onError={report}><ParserComponent jsx={result.good.source} bindings={result.good.bindings} components={components as ParserProps["components"]} renderInWrapper={false} allowUnknownElements={false} blacklistedTags={["script", "iframe", "object", "embed", "style", "link", "meta", "base"]} blacklistedAttrs={[/^on/i, "dangerouslySetInnerHTML", "srcDoc", "ref"]} onError={report} renderError={({ error }) => renderError(new Error(error))} /></PreviewBoundary></div>}
    {result.error && !streaming ? renderError(result.error) : streaming && <p {...status} role="status">{result.good?.source.trim() ? "Streaming preview…" : "Waiting for a complete element…"}</p>}
  </div>;
});
