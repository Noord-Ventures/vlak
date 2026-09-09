"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Collapsible } from "./collapsible";
import { sourceHref } from "./sources";

export type OpenInChatProvider = "chatgpt" | "claude" | "cursor" | "scira" | "t3" | "v0" | "github";
export interface OpenInChatProps extends Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  prompt: string;
  providers?: readonly OpenInChatProvider[];
  githubUrl?: string;
  label?: string;
  defaultOpen?: boolean;
}
const names: Record<OpenInChatProvider, string> = { chatgpt: "ChatGPT", claude: "Claude", cursor: "Cursor", scira: "Scira", t3: "T3 Chat", v0: "v0", github: "GitHub" };

/** Builds provider handoff links without contacting providers or submitting a conversation. */
export function openInChatHref(provider: OpenInChatProvider, prompt: string, githubUrl?: string): string | undefined {
  switch (provider) {
    case "chatgpt": return `https://chatgpt.com/?${new URLSearchParams({ hints: "search", prompt })}`;
    case "claude": return `https://claude.ai/new?${new URLSearchParams({ q: prompt })}`;
    case "cursor": return `https://cursor.com/link/prompt?${new URLSearchParams({ text: prompt })}`;
    case "scira": return `https://scira.ai/?${new URLSearchParams({ q: prompt })}`;
    case "t3": return `https://t3.chat/new?${new URLSearchParams({ q: prompt })}`;
    case "v0": return `https://v0.app/?${new URLSearchParams({ q: prompt })}`;
    case "github": return githubUrl ? sourceHref(githubUrl) : undefined;
  }
}
const styles = stylex.create({
  root: { minWidth: 0, color: vlak.ink },
  list: { margin: 0, padding: 0, listStyleType: "none", display: "grid", gap: 0 },
  link: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", minWidth: vlak.hit, minHeight: vlak.hit, color: { default: vlak.gray, ":hover": { default: null, [mq.hover]: vlak.ink } }, fontSize: vlak.controlFs, lineHeight: 1.45, textDecoration: "none", paddingInline: "0.5rem", borderRadius: vlak.radiusSm, ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: -2 } },
  note: { margin: "0.5rem 0 0", fontSize: vlak.controlLabel, lineHeight: 1.45, color: vlak.gray },
});

/** Explicit provider links for a supplied prompt. Nothing leaves the page until a link is activated. */
export const OpenInChat = React.forwardRef<HTMLDetailsElement, OpenInChatProps>(function OpenInChat({ prompt, providers = ["chatgpt", "claude", "cursor", "scira", "t3", "v0"], githubUrl, label = "Open in chat", defaultOpen = false, className, style, ...props }, ref) {
  const root = rs(["rs-open-in-chat", className], styles.root);
  const list = rs(["rs-open-in-chat-list"], styles.list);
  const link = rs(["rs-open-in-chat-link"], styles.link);
  const note = rs(["rs-open-in-chat-note"], styles.note);
  const links = Array.from(new Set(providers)).flatMap(provider => { const href = openInChatHref(provider, prompt, githubUrl); return href ? [{ provider, href }] : []; });
  return <Collapsible {...props} ref={ref} title={label} defaultOpen={defaultOpen} className={root.className} style={{ ...root.style, ...style }}>
    <ul {...list}>{links.map(({ provider, href }) => <li key={provider}><a {...link} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Open in ${names[provider]} (new tab)`}><span>{names[provider]}</span><span aria-hidden="true">↗</span></a></li>)}</ul>
    <p {...note}>{links.length ? "Choose a provider to open the supplied prompt in a new tab." : "No provider links available."}</p>
  </Collapsible>;
});
