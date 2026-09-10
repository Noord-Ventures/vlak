import { catalogComponents } from "@noorddev/vlak";

/** Reading order follows composing a conversation, then richer results and optional engines. */
const sections = [
  { title: "Conversation", names: ["chat", "conversation", "response", "response-markdown", "response-actions", "response-branch", "response-editor", "conversation-export", "attachments", "suggestions", "model-selector", "context-usage", "checkpoint"] },
  { title: "Work and sources", names: ["reasoning", "thought-steps", "plan", "task", "work-queue", "tool-call", "confirmation", "inline-citation", "sources", "shimmer"] },
  { title: "Widgets", names: ["widget", "generated-image", "open-in-chat"] },
  { title: "Code", names: ["highlighted-code", "agent", "artifact", "snippet", "commit", "environment-variables", "package-info", "schema-display", "test-results", "stack-trace", "terminal", "sandbox", "web-preview", "jsx-preview"] },
  { title: "Voice", names: ["audio-player", "mic-selector", "speech-input", "transcription", "voice-selector", "persona"] },
  { title: "Workflow", names: ["workflow-canvas"] },
];
export const aiComponentOrder = sections.flatMap(section => section.names);
export const aiComponents = aiComponentOrder.flatMap(name => {
  const component = catalogComponents.find(item => item.name === name && item.category === "ai");
  return component ? [component] : [];
});
export interface AiPage { href: string; title: string; description: string; aliases?: string[] }
export interface AiPageGroup { title: string; pages: AiPage[] }
const overview: AiPage = { href: "/ai", title: "Overview", description: "Compose AI interfaces with Vlak components." };
export const aiPageGroups: AiPageGroup[] = sections.map(section => ({
  title: section.title,
  pages: section.names.flatMap(name => {
    const component = aiComponents.find(item => item.name === name);
    return component ? [{ href: `/ai/${component.name}`, title: component.title, description: component.description, aliases: component.aliases }] : [];
  }),
}));
aiPageGroups.find(group => group.title === "Conversation")?.pages.splice(4, 0, { href: "/components/message-composer", title: "Message composer", description: "A compact prompt field with bounded growth, media attachments, and composable input controls.", aliases: catalogComponents.find(component => component.name === "message-composer")?.aliases });
aiPageGroups.find(group => group.title === "Code")?.pages.splice(2, 0, { href: "/components/tree-view", title: "File tree", description: "A keyboard-navigable tree with file icons, custom labels, selection, and expansion.", aliases: catalogComponents.find(component => component.name === "tree-view")?.aliases });
aiPageGroups.find(group => group.title === "Widgets")?.pages.push({ href: "/ai/widgets", title: "Widget patterns", description: "Compose application data and third-party integrations with the same widget structure and controls." });
export const aiPages = [overview, ...aiPageGroups.flatMap(group => group.pages)];
