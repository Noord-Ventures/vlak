# AI Elements feature coverage

Reference snapshot: 9 September 2026, all 48 entries in the [official AI Elements catalog](https://elements.ai-sdk.dev/docs). The audit also inspected [upstream source at commit 6a9d5b1](https://github.com/vercel/ai-elements/tree/6a9d5b1822ffb10bba4bd97175f01edd7d8651cd/packages/elements/src).

This is functional coverage using Vlak APIs and styling. It is not a drop-in replacement for upstream imports. Existing Vlak components are reused where their behavior matches; seven workflow surfaces share one optional graph entry. Vlak's catalog contains 47 AI pages/components, plus the existing MessageComposer and TreeView used in these recipes.

## Installation boundaries

Core components use React and StyleX. The root `@noorddev/vlak-react` entry does not import the rendering engines. Optional imports are:

| Entry | Required engines | Additional styles |
| --- | --- | --- |
| `@noorddev/vlak-react/components/response-markdown` | Streamdown, Shiki, Mermaid, Streamdown math/CJK plugins, KaTeX | `katex/dist/katex.min.css` |
| `@noorddev/vlak-react/components/highlighted-code` | Shiki | None beyond Vlak CSS |
| `@noorddev/vlak-react/components/jsx-preview` | react-jsx-parser, Acorn, acorn-jsx | None beyond Vlak CSS |
| `@noorddev/vlak-react/components/workflow-canvas` | React Flow (`@xyflow/react`) | `@noorddev/vlak-react/workflow.css` |

Each component's generated docs, registry item, CLI output and MCP installation response list its dependencies. Copied workflow source includes a stylesheet that puts the engine's structural CSS in `vlak.engine`, below Vlak's component paint.

## Chatbot

| AI Elements | Vlak API | Capability |
| --- | --- | --- |
| [Attachments](https://elements.ai-sdk.dev/components/attachments) | [Attachments, Attachment, useFileAttachments](https://vlak.dev/ai/attachments/) | Grid, inline and list layouts; native media previews; removal and retry. |
| [Chain of thought](https://elements.ai-sdk.dev/components/chain-of-thought) | [ThoughtSteps](https://vlak.dev/ai/thought-steps/) | Supplied step summaries, progress, evidence, images and captions. |
| [Checkpoint](https://elements.ai-sdk.dev/components/checkpoint) | [Checkpoint](https://vlak.dev/ai/checkpoint/) | Async restore callback, duplicate protection and retry feedback. |
| [Confirmation](https://elements.ai-sdk.dev/components/confirmation) | [Confirmation](https://vlak.dev/ai/confirmation/) | Approval, rejection, pending work, failed decisions and retry. |
| [Context](https://elements.ai-sdk.dev/components/context) | [ContextUsage, resolveContextPricing](https://vlak.dev/ai/context-usage/) | Used/total context, token categories, supplied catalog resolution and explicit pricing overrides. |
| [Conversation](https://elements.ai-sdk.dev/components/conversation) | [Conversation, ConversationDownload](https://vlak.dev/ai/conversation/) | Scroll following with scrollback preservation and structured Markdown export. |
| [Inline citation](https://elements.ai-sdk.dev/components/inline-citation) | [InlineCitation](https://vlak.dev/ai/inline-citation/) | Multiple sources, quotes, source navigation and focus restoration. |
| [Message](https://elements.ai-sdk.dev/components/message) | [Response, ResponseMarkdown, ResponseBranch, ResponseEditor](https://vlak.dev/ai/response/) | Roles, avatar and layout slots, context hook, streamed rich text, ordered actions, alternatives, editing and regeneration callbacks. |
| [Model selector](https://elements.ai-sdk.dev/components/model-selector) | [ModelSelector](https://vlak.dev/ai/model-selector/) | Searchable supplied models, provider metadata and disabled options. |
| [Plan](https://elements.ai-sdk.dev/components/plan) | [Plan](https://vlak.dev/ai/plan/) | Disclosure, streaming title, content, footer and application actions. |
| [Prompt input](https://elements.ai-sdk.dev/components/prompt-input) | [MessageComposer, useMessageComposer](https://vlak.dev/components/message-composer/) | One-line growth with a cap, send/stop, paste/drop, file limits, screenshot capture, layout slots, native textarea customization and validated context commands. |
| [Queue](https://elements.ai-sdk.dev/components/queue) | [WorkQueue](https://vlak.dev/ai/work-queue/) | Prompt/todo sections, counts, completion callbacks, attachments and item actions. |
| [Reasoning](https://elements.ai-sdk.dev/components/reasoning) | [Reasoning](https://vlak.dev/ai/reasoning/) | Chevron disclosure, streaming status, optional duration and opt-in open/close policy. |
| [Shimmer](https://elements.ai-sdk.dev/components/shimmer) | [Shimmer](https://vlak.dev/ai/shimmer/) | Animated text with timing/spread and reduced-motion fallback. |
| [Sources](https://elements.ai-sdk.dev/components/sources) | [Sources](https://vlak.dev/ai/sources/) | Counted source disclosure and labelled links. |
| [Suggestion](https://elements.ai-sdk.dev/components/suggestion) | [Suggestions, Suggestion](https://vlak.dev/ai/suggestions/) | String-valued actions in scrolling or wrapping collections. |
| [Task](https://elements.ai-sdk.dev/components/task) | [Task](https://vlak.dev/ai/task/) | Default-open task rows with status and file badges. |
| [Tool](https://elements.ai-sdk.dev/components/tool) | [ToolCall, getToolCallPresentation](https://vlak.dev/ai/tool-call/) | Static/dynamic tool names, input/output/error, approval mapping and explicit execution state. |

## Code

| AI Elements | Vlak API | Capability |
| --- | --- | --- |
| [Agent](https://elements.ai-sdk.dev/components/agent) | [Agent](https://vlak.dev/ai/agent/) | Model, instructions, tools, schemas and output definition. |
| [Artifact](https://elements.ai-sdk.dev/components/artifact) | [Artifact](https://vlak.dev/ai/artifact/) | Structured content with title, actions and close behavior. |
| [Code block](https://elements.ai-sdk.dev/components/code-block) | [HighlightedCode](https://vlak.dev/ai/highlighted-code/) | Optional lazy Shiki, exact-source copy, line numbers and download. |
| [Commit](https://elements.ai-sdk.dev/components/commit) | [Commit](https://vlak.dev/ai/commit/) | Hash copy, author/time, file status, additions/deletions and file actions. |
| [Environment variables](https://elements.ai-sdk.dev/components/environment-variables) | [EnvironmentVariables](https://vlak.dev/ai/environment-variables/) | Masked values, explicit reveal/copy and escaped export formatting. |
| [File tree](https://elements.ai-sdk.dev/components/file-tree) | [TreeView](https://vlak.dev/components/tree-view/) | APG keyboard navigation, file icons, custom content, selection and expansion. |
| [Jsx preview](https://elements.ai-sdk.dev/components/jsx-preview) | [JSXPreview](https://vlak.dev/ai/jsx-preview/) | Optional constrained JSX parser, streaming completion, bindings, component map and error fallback. |
| [Package info](https://elements.ai-sdk.dev/components/package-info) | [PackageInfo](https://vlak.dev/ai/package-info/) | Versions, change type, package description and dependencies. |
| [Sandbox](https://elements.ai-sdk.dev/components/sandbox) | [Sandbox](https://vlak.dev/ai/sandbox/) | Disclosure with supplied status and code/output tabs. |
| [Schema display](https://elements.ai-sdk.dev/components/schema-display) | [SchemaDisplay](https://vlak.dev/ai/schema-display/) | Endpoint method/path, nested properties, parameters and request/response schemas. |
| [Snippet](https://elements.ai-sdk.dev/components/snippet) | [Snippet, SnippetCopy](https://vlak.dev/ai/snippet/) | Selectable command text, prefix and exact-value copy. |
| [Stack trace](https://elements.ai-sdk.dev/components/stack-trace) | [StackTrace, parseStackTrace](https://vlak.dev/ai/stack-trace/) | V8/Node and Firefox/Safari parsing, internal frames, copy and location callbacks. |
| [Terminal](https://elements.ai-sdk.dev/components/terminal) | [Terminal](https://vlak.dev/ai/terminal/) | Incremental ANSI attributes, optional original colors, cursor, scroll following, copy and clear. |
| [Test results](https://elements.ai-sdk.dev/components/test-results) | [TestResults](https://vlak.dev/ai/test-results/) | Suite/test hierarchy, counts, timing, errors, stacks and retry callbacks. |
| [Web preview](https://elements.ai-sdk.dev/components/web-preview) | [WebPreview](https://vlak.dev/ai/web-preview/) | URL navigation, sandboxed iframe, supplied logs and navigation callbacks. |

## Voice

| AI Elements | Vlak API | Capability |
| --- | --- | --- |
| [Audio player](https://elements.ai-sdk.dev/components/audio-player) | [AudioPlayer, AudioPlayerControls, useAudioPlayer](https://vlak.dev/ai/audio-player/) | Native playback, composable controls, seeking/skips, volume and generated-audio input. |
| [Mic selector](https://elements.ai-sdk.dev/components/mic-selector) | [MicSelector, useAudioDevices](https://vlak.dev/ai/mic-selector/) | Permission-aware enumeration, device changes, selection and stream cleanup. |
| [Persona](https://elements.ai-sdk.dev/components/persona) | [Persona](https://vlak.dev/ai/persona/) | Idle, listening, thinking, speaking and asleep; monochrome default and custom visual slot. |
| [Speech input](https://elements.ai-sdk.dev/components/speech-input) | [SpeechInput](https://vlak.dev/ai/speech-input/) | Recognition and recorded-audio fallback, explicit capture, interim/final text and cancellation. |
| [Transcription](https://elements.ai-sdk.dev/components/transcription) | [Transcription](https://vlak.dev/ai/transcription/) | Timed segments, playback-position styling, seek callbacks and reader-preserving following. |
| [Voice selector](https://elements.ai-sdk.dev/components/voice-selector) | [VoiceSelector](https://vlak.dev/ai/voice-selector/) | Searchable supplied voice metadata and coordinated audio previews. |

## Workflow

| AI Elements | Vlak API | Capability |
| --- | --- | --- |
| [Canvas](https://elements.ai-sdk.dev/components/canvas) | [WorkflowCanvas](https://vlak.dev/ai/workflow-canvas/) | React Flow graph model, drag/selection, pan/zoom, deletion, validation and change callbacks. |
| [Connection](https://elements.ai-sdk.dev/components/connection) | [WorkflowConnection](https://vlak.dev/ai/workflow-canvas/) | In-progress bezier geometry and destination indicator. |
| [Controls](https://elements.ai-sdk.dev/components/controls) | [WorkflowControls](https://vlak.dev/ai/workflow-canvas/) | Existing Vlak CanvasControls bound to the engine, with interaction locking. |
| [Edge](https://elements.ai-sdk.dev/components/edge) | [WorkflowEdge](https://vlak.dev/ai/workflow-canvas/) | Geometry, focus/selection, temporary/animated edges and reduced motion. |
| [Node](https://elements.ai-sdk.dev/components/node) | [WorkflowNode](https://vlak.dev/ai/workflow-canvas/) | Real connection handles, header/content/footer and controlled graph placement. |
| [Panel](https://elements.ai-sdk.dev/components/panel) | [WorkflowPanel](https://vlak.dev/ai/workflow-canvas/) | Six viewport anchors outside the zoom-transformed graph. |
| [Toolbar](https://elements.ai-sdk.dev/components/toolbar) | [WorkflowToolbar](https://vlak.dev/ai/workflow-canvas/) | Node anchoring with Vlak toolbar keyboard navigation. |

## Utilities

| AI Elements | Vlak API | Capability |
| --- | --- | --- |
| [Image](https://elements.ai-sdk.dev/components/image) | [GeneratedImage](https://vlak.dev/ai/generated-image/) | Supported generated image bytes and MIME type, alt text and responsive display. |
| [Open in chat](https://elements.ai-sdk.dev/components/open-in-chat) | [OpenInChat](https://vlak.dev/ai/open-in-chat/) | Locally encoded links for the supplied external chat providers. |

## Deliberate differences and application responsibilities

Vlak retains monochrome surfaces, subtle buttons, chevrons, 4px control corners, and native controls. Syntax highlighting uses monochrome token emphasis; Terminal can opt into the original ANSI colors. Persona has waveform, orb, and rings variants, five conversational states, intensity and pause controls, and a custom renderer that receives the effective motion policy. The site also demonstrates an original procedural monochrome orb avatar. Vlak does not include Vercel's six Rive artwork files or claim Rive API compatibility.

Models, voices, sources, usage counts and prices are supplied by the application. ContextUsage does not ship an automatically updated pricing catalog. SpeechInput can capture audio locally; recorded-audio transcription requires the application's callback. The graph editor has an example connection form for keyboard-only creation as well as pointer handles.

JSXPreview accepts constrained data expressions and registered display components. It rejects active HTML, calls, functions and prototype access; it is not arbitrary JavaScript execution. WebPreview uses an iframe and supplied logs. Sandbox and Agent display application results/configuration; neither executes code or runs an agent. The current upstream components have the same application-owned execution boundary.

The application also owns model requests, tool execution, approval verification, conversation persistence, regeneration, file upload/download policy and graph execution. The [integration guide](https://vlak.dev/docs/ai.md) shows the AI SDK lifecycle mapping without making the SDK a primitive dependency. A separate [runnable reference app](https://github.com/Noord-Ventures/vlak/tree/main/apps/assistant) implements the chat integration with AI SDK 7, OpenAI, server-verified approvals, local persistence, upload ownership, editing, regeneration and version restoration.

These APIs offer composition through slots and context hooks rather than matching every upstream compound-component export. Coverage does not mean identical artwork, import compatibility, or measured superiority. The reference app is an integration example, not a hosted authentication, storage, or agent-execution service.

## Verification

Focused tests exercise streaming syntax and code identity, parser boundaries, message alternatives, failed drafts, async cancellation, denied media permissions, device changes, transcript seeks, disabled model selection, clipboard failures, nested schemas, ANSI output and real graph keyboard behavior. Full package, distribution and browser checks validate the integrated catalog; this matrix records capabilities rather than treating catalog counts as evidence of parity.

The 10 September 2026 follow-up verifies:

- 1,421 package tests, including public exports, ref coverage, accessibility, generated CSS and registry integrity. Packed distributions pass React 18/19, optional renderer, copied-source import closure, publint and type-resolution checks.
- AI interactions at 1280px and 390px in Chromium 141, Firefox 142 and WebKit 26. Checks cover keyboard input, citation placement, graph endpoints, compact composers, media failures, reduced motion, forced colors and cleanup. Native recording tests use synthetic browser audio tracks, never a physical microphone.
- Nine reference-server tests for ownership, request limits, canonical history, signed approvals, tampering, idempotency, edits, stopping, replay and stable message IDs.
- Fourteen reference-app scenarios across desktop and phone widths, with axe checks and no page overflow. These use the explicitly marked deterministic model fixture and include a connection dropped after the server saved its response.
- A separate live OpenAI smoke run: brief reading, streamed text and reported usage, approval before a task write, one persisted task after approval, and saved partial output after Stop. This run uses server credentials and is opt-in.

Run the library browser matrix with `node apps/www/scripts/ai-cross-browser-e2e.mjs`. The reference app README documents its server, browser, recovery and optional live checks. These are functional and accessibility checks; they are not comparative performance benchmarks or proof that one library is universally better.
