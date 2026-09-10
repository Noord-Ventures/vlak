# Vlak AI components

47 AI components and 2 existing companion primitives, generated from the 231-component registry. Each linked record includes the exact exports, props, install commands, keyboard behavior, and accessibility contract. Version 0.4.0.

## Start here

- [Interactive AI catalog](https://vlak.dev/ai/): live component examples
- [Widget patterns](https://vlak.dev/ai/widgets/): application-owned React content and third-party iframe composition
- [AI integration guide](https://vlak.dev/docs/ai.md): streaming messages, attachments, approval boundaries, and the runnable AI SDK reference app
- [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md): the audited upstream component mapping and deliberate differences
- [Live assistant](https://assistant.vlak.dev): a working integration with private browser sessions and bounded demo usage
- [Reference application source](https://github.com/Noord-Ventures/vlak/tree/main/apps/assistant): server-side model requests, durable history, private uploads, approval verification, and deployment setup

## Compose an assistant

Use [Chat](https://vlak.dev/docs/chat.md) and [Conversation](https://vlak.dev/docs/conversation.md) for the frame and history, [Response](https://vlak.dev/docs/response.md) for user and assistant roles, [ResponseActions](https://vlak.dev/docs/response-actions.md) for copy, narration, feedback and sharing, and [MessageComposer](https://vlak.dev/docs/message-composer.md) for compact growing input and validated attachments. [Widget](https://vlak.dev/docs/widget.md) composes React content or a provider iframe. The application owns model requests, persisted history, tool execution, approval verification and provider access.

## Installation boundaries

Core components import from `@noorddev/vlak-react`; load `@noorddev/vlak-react/css` once. Optional renderers use the exact subpaths and additional packages below. Do not import these renderers from the core entry. Component records show runnable examples and required stylesheet imports. Functional coverage does not imply upstream import or API compatibility.

| Component | React import | Additional npm packages | Additional styles |
| --- | --- | --- | --- |
| [Highlighted code](https://vlak.dev/docs/highlighted-code.md) | `@noorddev/vlak-react/components/highlighted-code` | `shiki@^3.19.0` | None beyond Vlak CSS |
| [Jsx preview](https://vlak.dev/docs/jsx-preview.md) | `@noorddev/vlak-react/components/jsx-preview` | `react-jsx-parser@^2.4.1`, `acorn@^8.15.0`, `acorn-jsx@^5.3.2` | None beyond Vlak CSS |
| [Response markdown](https://vlak.dev/docs/response-markdown.md) | `@noorddev/vlak-react/components/response-markdown` | `streamdown@^2.6.0`, `shiki@^3.19.0`, `@streamdown/math@^1.0.2`, `@streamdown/cjk@^1.0.3`, `mermaid@^11.12.2`, `katex@^0.16.27` | `katex/dist/katex.min.css` |
| [Workflow canvas](https://vlak.dev/docs/workflow-canvas.md) | `@noorddev/vlak-react/components/workflow-canvas` | `@xyflow/react` | `@noorddev/vlak-react/workflow.css` |

## AI component records

| Component | Exports | Purpose |
| --- | --- | --- |
| [Agent](https://vlak.dev/docs/agent.md) | `Agent` | Inspects an agent’s model, instructions, tool definitions and output schema in a 4px surface. |
| [Artifact](https://vlak.dev/docs/artifact.md) | `Artifact` | Frames generated content with header actions, an optional scroll region and a close request. |
| [Attachments](https://vlak.dev/docs/attachments.md) | `Attachment`, `Attachments`, `useFileAttachments` | A responsive file list with image, audio, and video previews, file metadata, removal, and application-owned upload states. |
| [Audio player](https://vlak.dev/docs/audio-player.md) | `AudioPlayer`, `AudioPlayerControls`, `useAudioPlayer` | Native audio playback for remote files and generated speech, with composable controls, bounded skip seeking, volume, and recoverable errors. |
| [Chat](https://vlak.dev/docs/chat.md) | `Chat` | A subtle 1px outline with 4px corners, a named header, scrollable conversation, and a composer anchored below the history. |
| [Checkpoint](https://vlak.dev/docs/checkpoint.md) | `Checkpoint` | A conversation marker with an async restore action, retry feedback, and stable cancellation. |
| [Commit](https://vlak.dev/docs/commit.md) | `Commit` | Shows a commit message, full-hash copy, author and time, with expandable changed files. |
| [Confirmation](https://vlak.dev/docs/confirmation.md) | `Confirmation` | Collects approval or rejection in a surface with a subtle 1px outline and 4px corners, with async recording, error recovery, and 44px actions. |
| [Context usage](https://vlak.dev/docs/context-usage.md) | `ContextUsage`, `resolveContextPricing` | A native disclosure of context occupancy, token categories and estimated costs from application-supplied rates or model catalogs. |
| [Conversation](https://vlak.dev/docs/conversation.md) | `Conversation` | Keeps a scrollable message history at the latest response until the reader scrolls back. |
| [Conversation export](https://vlak.dev/docs/conversation-export.md) | `ConversationDownload`, `serializeConversation` | Downloads a Markdown snapshot from explicit message text, attachments, and structured tool results. |
| [Environment variables](https://vlak.dev/docs/environment-variables.md) | `EnvironmentVariables`, `formatEnvironmentExports` | Masks environment values by default, with deliberate reveal, value copy and quoted shell exports. |
| [Generated image](https://vlak.dev/docs/generated-image.md) | `GeneratedImage` | Displays a supplied generated-image result with alt text and responsive 4px corners. |
| [Highlighted code](https://vlak.dev/docs/highlighted-code.md) | `HighlightedCode` | Monochrome syntax highlighting with lazy grammars, exact-source copy and download, and a scrollable code region. |
| [Inline citation](https://vlak.dev/docs/inline-citation.md) | `InlineCitation` | A quiet inline source trigger opening a counted, keyboard-navigable preview with links, descriptions and quotes. |
| [Jsx preview](https://vlak.dev/docs/jsx-preview.md) | `JSXPreview` | Renders registered components and plain data expressions from streamed JSX through an optional parser. |
| [Mic selector](https://vlak.dev/docs/mic-selector.md) | `MicSelector`, `useAudioDevices` | Searches available microphone inputs with explicit permission activation, device-change updates, and recoverable selection states. |
| [Model selector](https://vlak.dev/docs/model-selector.md) | `ModelSelector` | Searches a supplied model catalog by name, provider and capabilities, with metadata and controlled selection. |
| [Open in chat](https://vlak.dev/docs/open-in-chat.md) | `OpenInChat`, `openInChatHref` | Explicit provider links that encode a supplied prompt for ChatGPT, Claude, Cursor, Scira, T3 Chat and v0. |
| [Package info](https://vlak.dev/docs/package-info.md) | `PackageInfo` | Compares current and proposed package versions with change type and expandable dependencies. |
| [Persona](https://vlak.dev/docs/persona.md) | `Persona` | Native monochrome waveform, fluid orb, and ring visuals with five conversational states, live intensity, and a custom renderer. |
| [Plan](https://vlak.dev/docs/plan.md) | `Plan` | A collapsible proposed plan with streaming title treatment, actions, and supporting context. |
| [Reasoning](https://vlak.dev/docs/reasoning.md) | `Reasoning` | A native disclosure for supplied work summaries, with a chevron and 44px control. Panels use a subtle 1px outline and 4px corners. |
| [Response](https://vlak.dev/docs/response.md) | `Response`, `useResponse` | Presents user messages in right-aligned soft bubbles and assistant responses on the left, with speaker identity, avatars, status, actions, and a custom layout API. |
| [Response actions](https://vlak.dev/docs/response-actions.md) | `ResponseActions` | Selectable subtle 44px icon controls for copying, reading aloud, rating through a combined feedback menu, and sharing an assistant response. |
| [Response branch](https://vlak.dev/docs/response-branch.md) | `ResponseBranch` | Navigates saved response alternatives with stable identity, previous and next controls, and a readable position. |
| [Response editor](https://vlak.dev/docs/response-editor.md) | `ResponseEditor` | A multiline message editor that preserves failed drafts and ignores cancelled saves. |
| [Response markdown](https://vlak.dev/docs/response-markdown.md) | `ResponseMarkdown` | Renders streaming markdown, tables, code, math, and diagrams with Vlak typography and safe default links. |
| [Sandbox](https://vlak.dev/docs/sandbox.md) | `Sandbox` | Combines a tool-status disclosure with keyboard-accessible code and output tabs. |
| [Schema display](https://vlak.dev/docs/schema-display.md) | `SchemaDisplay` | Displays an endpoint’s method, path, parameters and nested request and response schemas. |
| [Shimmer](https://vlak.dev/docs/shimmer.md) | `Shimmer` | A monochrome moving highlight over progress text, with reduced-motion and forced-color fallbacks. |
| [Snippet](https://vlak.dev/docs/snippet.md) | `Snippet`, `SnippetCopy` | Presents a compact selectable command with a decorative prefix and exact-value copy action. |
| [Sources](https://vlak.dev/docs/sources.md) | `sourceHref`, `Sources` | A counted native disclosure of application-supplied references, descriptions and supporting quotes. |
| [Speech input](https://vlak.dev/docs/speech-input.md) | `SpeechInput` | Starts and stops native speech capture, with final text, optional interim results, and application transcription of recorded audio. |
| [Stack trace](https://vlak.dev/docs/stack-trace.md) | `parseStackTrace`, `StackTrace` | Parses JavaScript error frames into function names, file locations and internal-frame labels. |
| [Suggestions](https://vlak.dev/docs/suggestions.md) | `Suggestion`, `Suggestions` | A wrapping or horizontally scrollable collection of prompt buttons with subtle outlines and 4px corners. |
| [Task](https://vlak.dev/docs/task.md) | `Task` | A default-open task disclosure with supplied item states and file references. |
| [Terminal](https://vlak.dev/docs/terminal.md) | `Terminal` | Renders streamed console output with incremental ANSI attributes and optional original colors. |
| [Test results](https://vlak.dev/docs/test-results.md) | `TestResults` | Displays suites, derived pass/fail/skip totals, elapsed time and failure details with optional retries. |
| [Thought steps](https://vlak.dev/docs/thought-steps.md) | `ThoughtSteps` | A collapsible sequence of work summaries, with step states, source badges, images, and captions. |
| [Tool call](https://vlak.dev/docs/tool-call.md) | `getToolCallPresentation`, `ToolCall` | Shows tool input, output, and execution state in a native disclosure with a subtle 1px outline, 4px corners, and a 44px summary. |
| [Transcription](https://vlak.dev/docs/transcription.md) | `Transcription` | Displays timestamped speech segments, highlights playback time, and optionally seeks a player through accessible phrase controls. |
| [Voice selector](https://vlak.dev/docs/voice-selector.md) | `VoiceSelector` | Searches application-supplied voice names and metadata, with controlled selection and optional audio preview playback. |
| [Web preview](https://vlak.dev/docs/web-preview.md) | `isPreviewUrl`, `WebPreview` | Provides URL navigation, a sandboxed iframe and a collapsible console of supplied log messages. |
| [Widget](https://vlak.dev/docs/widget.md) | `Widget`, `WidgetEmbed` | A surface with a subtle 1px outline and 4px corners for React content and provider iframes, with attribution, data states, actions, and supporting context. |
| [Work queue](https://vlak.dev/docs/work-queue.md) | `WorkQueue` | Collapsible prompt and todo sections with completion counts, attachments, and item actions. |
| [Workflow canvas](https://vlak.dev/docs/workflow-canvas.md) | `WorkflowCanvas`, `WorkflowConnection`, `WorkflowControls`, `WorkflowEdge`, `WorkflowNode`, `WorkflowPanel`, `WorkflowToolbar` | An interactive graph with draggable nodes, connections, viewport controls, anchored panels, and node actions. |

## Companion primitives

| Component | Purpose |
| --- | --- |
| [Message composer](https://vlak.dev/docs/message-composer.md) | Composes a compact growing draft with validated file previews, paste and drop, screenshot capture, and retained drafts on failure. |
| [Tree view](https://vlak.dev/docs/tree-view.md) | Navigates a hierarchy with expansion, single selection, and roving focus. |

## Agent and data access

Use MCP `get_guide` with `page: "ai-index"`, `page: "ai"`, or `page: "ai-parity"`. `list_components` with `category: "ai"` lists the AI records; search separately for MessageComposer and TreeView. Search accepts upstream names such as PromptInput, Code block and Chain of thought. Call `get_component` and `get_install` before writing imports.

```sh
npx @noorddev/vlak-cli docs ai-index
npx @noorddev/vlak-cli docs ai
npx @noorddev/vlak-cli search "AI Elements Prompt input" --json
npx @noorddev/vlak-cli docs response-markdown
```

[Registry JSON](https://vlak.dev/r/index.json) · [Props JSON](https://vlak.dev/docs/props.json) · [Agent guide](https://vlak.dev/docs/agents.md) · [Complete Markdown](https://vlak.dev/llms-full.txt)
