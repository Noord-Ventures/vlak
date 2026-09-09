"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { ToolCall, type ToolCallProps } from "./tool-call";
import { CodeBlock } from "./code-block";
import { Tabs, TabList, Tab, TabPanel } from "./tabs";

export interface SandboxProps extends Omit<ToolCallProps, "input" | "output"> {
  code: string;
  language?: string;
  output?: React.ReactNode;
  codeContent?: React.ReactNode;
  tab?: "code" | "output";
  defaultTab?: "code" | "output";
  onTabChange?: (tab: "code" | "output") => void;
}
const styles = stylex.create({
  root: { minWidth: 0 },
  content: { minWidth: 0, display: "grid", gap: "0.75rem", color: vlak.ink },
  output: { margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: "0.875rem", lineHeight: 1.45, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
});

/** A code/output disclosure. Execution and process isolation remain application-owned. */
export const Sandbox = React.forwardRef<HTMLDetailsElement, SandboxProps>(function Sandbox({ code, language = "Text", output, codeContent, tab, defaultTab = "code", onTabChange, defaultOpen = true, children, className, style, ...props }, ref) {
  const root = rs(["rs-sandbox", className], styles.root);
  const content = rs(["rs-sandbox-content"], styles.content);
  const outputStyle = rs(["rs-sandbox-output"], styles.output);
  return <ToolCall {...props} ref={ref} defaultOpen={defaultOpen} className={root.className} style={{ ...root.style, ...style }}>
    <Tabs {...content} value={tab} defaultValue={defaultTab} onValueChange={value => onTabChange?.(value as "code" | "output")}><TabList aria-label="Sandbox content"><Tab value="code">Code</Tab><Tab value="output">Output</Tab></TabList><TabPanel value="code">{codeContent ?? <CodeBlock code={code} language={language} />}</TabPanel><TabPanel value="output">{typeof output === "string" || typeof output === "number" ? <pre {...outputStyle}>{output}</pre> : output ?? <p>No output supplied.</p>}</TabPanel></Tabs>{children}
  </ToolCall>;
});
