"use client";

import { useState, type ComponentType } from "react";
import { ContextUsage, InlineCitation, ModelSelector, OpenInChat, Sources, type CitationSource } from "@noorddev/vlak-react";

const exampleSources: CitationSource[] = [{ id: "brief", title: "Project brief", url: "https://example.com/brief", description: "Example source · Scope and owners", quote: "Every decision has an owner and a next step." }, { id: "review", title: "Review notes", url: "https://example.com/review", description: "Example source · Review schedule", quote: "Review the draft together on Thursday." }];
export function ContextUsagePreview() { return <ContextUsage defaultOpen model="Example model" usedTokens={12400} maxTokens={128000} usage={{ inputTokens: 10800, outputTokens: 1600, cachedInputTokens: 4200, reasoningTokens: 400 }} />; }
export function ModelSelectorPreview() {
  const [value, setValue] = useState("swift");
  return <ModelSelector value={value} onValueChange={setValue} models={[{ id: "swift", name: "Swift", provider: "Example provider", capabilities: ["Text", "Fast"], contextWindow: 32000, description: "An example entry for quick text tasks." }, { id: "vision", name: "Vision", provider: "Example provider", capabilities: ["Text", "Images"], contextWindow: 128000, description: "An example entry for a longer review with images." }, { id: "reason", name: "Reason", provider: "Another provider", capabilities: ["Reasoning"], description: "An example entry for working through a complex question." }]} />;
}
export function SourcesPreview() { return <Sources defaultOpen sources={exampleSources} />; }
export function InlineCitationPreview() { return <p style={{ margin: 0, lineHeight: 1.45 }}>The brief names an owner and next step for every decision.<InlineCitation sources={exampleSources} /></p>; }
export function OpenInChatPreview() { return <OpenInChat defaultOpen prompt="What makes a project brief useful?" providers={["chatgpt", "claude", "cursor"]} />; }
export const aiChatControlPreviews: Record<string, ComponentType> = {
  "context-usage": ContextUsagePreview,
  "model-selector": ModelSelectorPreview,
  sources: SourcesPreview,
  "inline-citation": InlineCitationPreview,
  "open-in-chat": OpenInChatPreview
};
