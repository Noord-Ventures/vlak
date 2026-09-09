import type { UIMessage } from "ai";

export interface StoredUpload { id: string; name: string; mediaType: string; size: number; url: string }
export interface ReferenceTask { id: string; title: string; status: "open"; createdAt: string; toolCallId: string }
export interface Brief { title: string; content: string; sources: { title: string; url: string }[] }
export interface ProjectWidget { type: "project-summary"; title: string; summary: string; stats: { label: string; value: string }[]; tasks: ReferenceTask[] }
export type ReferenceTools = {
  readBrief: { input: { fileId?: string }; output: Brief };
  projectWidget: { input: { title: string }; output: ProjectWidget };
  createTask: { input: { title: string }; output: ReferenceTask };
};
export type ReferenceMessage = UIMessage<{ mode?: "live" | "fixture"; model?: string; outcome?: "complete" | "stopped" | "error"; usage?: { inputTokens?: number; outputTokens?: number; reasoningTokens?: number; cachedInputTokens?: number } }, Record<string, never>, ReferenceTools>;
export interface ConversationVersion { id: string; createdAt: string }
export interface ReferenceConversation { id: string; title: string; createdAt: string; updatedAt: string; messages: ReferenceMessage[]; tasks: ReferenceTask[]; versions: ConversationVersion[] }
export type ChatIntent =
  | { conversationId: string; intent: "submit"; text: string; requestId?: string; uploadIds?: string[] }
  | { conversationId: string; intent: "approve"; approvalId: string; approved: boolean }
  | { conversationId: string; intent: "edit"; messageId: string; text: string }
  | { conversationId: string; intent: "regenerate"; messageId?: string };
