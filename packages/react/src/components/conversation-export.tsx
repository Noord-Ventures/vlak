"use client";
import * as React from "react";
import { Button, type ButtonProps } from "./button";

export type ConversationExportPart = { type: "text"; text: string } | { type: "file"; filename: string; url?: string } | { type: "tool"; name: string; input?: unknown; output?: unknown };
export interface ConversationExportMessage { role: string; content?: string; parts?: readonly ConversationExportPart[] }
export interface ConversationExportOptions { title?: string; serializePart?: (part: ConversationExportPart, message: ConversationExportMessage) => string | undefined }
function json(value: unknown) { try { return JSON.stringify(value, null, 2) ?? ""; } catch { return "[Unable to serialize this result]"; } }
function fenced(value: string) { const longest = Math.max(2, ...[...value.matchAll(/`+/g)].map(match => match[0].length)); const fence = "`".repeat(longest + 1); return `${fence}json\n${value}\n${fence}`; }
/** Serializes explicit text, file and tool parts; unsupported application objects are never stringified as messages. */
export function serializeConversation(messages: readonly ConversationExportMessage[], { title, serializePart }: ConversationExportOptions = {}): string {
  const blocks = messages.map(message => {
    const parts = message.parts?.map(part => {
      const custom = serializePart?.(part, message);
      if (custom !== undefined) return custom;
      if (part.type === "text") return part.text;
      if (part.type === "file") return `Attachment: ${part.filename}${part.url ? `\n${part.url}` : ""}`;
      if (part.type === "tool") return [`Tool: ${part.name}`, part.input !== undefined ? `Input:\n${fenced(json(part.input))}` : "", part.output !== undefined ? `Output:\n${fenced(json(part.output))}` : ""].filter(Boolean).join("\n\n");
      return "";
    }).filter(Boolean).join("\n\n");
    return `## ${message.role.replace(/[\r\n]+/g, " ")}\n\n${parts ?? message.content ?? ""}`;
  });
  return [title ? `# ${title.replace(/[\r\n]+/g, " ")}` : "", ...blocks].filter(Boolean).join("\n\n") + "\n";
}
export interface ConversationDownloadProps extends Omit<ButtonProps, "onClick" | "onError">, ConversationExportOptions { messages: readonly ConversationExportMessage[]; filename?: string; onError?: (error: unknown) => void }
/** Downloads a Markdown snapshot using supplied message data, without reading rendered DOM. */
export const ConversationDownload = React.forwardRef<HTMLButtonElement, ConversationDownloadProps>(function ConversationDownload({ messages, filename = "conversation.md", title, serializePart, onError, children = "Download conversation", ...props }, ref) {
  const [failed, setFailed] = React.useState(false);
  const urls = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());
  React.useEffect(() => () => { for (const [url, timer] of urls.current) { clearTimeout(timer); URL.revokeObjectURL(url); } urls.current.clear(); }, []);
  return <><Button ref={ref} variant="subtle" {...props} onClick={() => { setFailed(false); try { const blob = new Blob([serializeConversation(messages, { title, serializePart })], { type: "text/markdown;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; document.body.append(anchor); anchor.click(); anchor.remove(); urls.current.set(url, setTimeout(() => { URL.revokeObjectURL(url); urls.current.delete(url); }, 1000)); } catch (error) { setFailed(true); onError?.(error); } }}>{children}</Button>{failed && <span role="alert">The conversation could not be downloaded. Try again.</span>}</>;
});
