# AI interfaces

Explore the [AI section](https://vlak.dev/ai/) for the interactive overview and individual component pages. The [feature coverage matrix](https://vlak.dev/docs/ai-parity.md) maps all 48 current AI Elements entries to Vlak APIs and explains the optional rendering engines.

Compose an assistant from Vlak components and application-supplied messages. Vlak provides scrolling, response states, disclosures, message actions, widgets, and confirmation controls. Your application supplies the model, transport, tool execution, and saved records.

Core components use React and StyleX. They work with any provider and do not require the AI SDK or AI Elements. Rich rendering is available through official optional subpaths, with their parser and media dependencies installed only when needed.

## Runnable reference app

The [assistant reference app](https://github.com/Noord-Ventures/vlak/tree/main/apps/assistant) is a complete Next.js application using AI SDK 7, the OpenAI Responses provider, and Vlak components. Try the [live assistant](https://assistant.vlak.dev). The static documentation examples remain usable without credentials.

From this repository:

```sh
pnpm install
pnpm build
cp apps/assistant/.env.example apps/assistant/.env.local
# Set OPENAI_API_KEY in that ignored server file.
pnpm --filter @noorddev/vlak-assistant-reference dev
```

Open `http://localhost:3211`. Choose a Responses API model available to your OpenAI project with `AI_REFERENCE_MODEL` (`AI_MODEL` remains a fallback). The key stays on the server. The app demonstrates streamed Markdown, file uploads, saved conversations, edits, regeneration, previous versions, read-only tool results, and an approved task-writing tool. The same widget surface hosts a React result and a sandboxed iframe example.

This app sends explicit request intents to the server. The server loads canonical history, resolves only session-owned uploads, and verifies a pending approval before executing a write. The browser cannot authorize a tool by inventing an assistant message. Local runs use files; the hosted configuration uses private Vercel Blob with conditional writes, shared cancellation, and bounded demo usage. Each browser has a private anonymous session. The app README documents hosting setup, ownership and retention boundaries, and the separate deterministic fixture mode used for protocol tests.

## Customize composition

`MessageComposer` offers `renderLayout(parts, state)` and `useMessageComposer()` for custom input, attachment, and tool placement. Its validated commands remain the same when a child adds files, submits, or stops. `textareaProps` merges native attributes, events, and the input ref. Render the supplied input and send control once.

`Response` offers an avatar slot, `renderLayout(parts, state)`, and `useResponse()`. Use the complete header or its identity/status parts, then place content and actions as needed. Keep the status announcement in custom layouts. `ResponseActions` accepts an ordered `actions` array using `copy`, `read`, `feedback`, and `share`; omitted actions keep all four defaults.

`Persona` includes waveform, orb, and rings variants. All five conversational states share intensity, pause, visibility, reduced-motion, and forced-colors behavior. A custom `renderVisual` receives the effective animation policy, so a custom engine can release resources and stop consistently.

`ContextUsage` can resolve a model name, context limit, and rates from a supplied Tokenlens/models.dev-shaped catalog via `modelId` and `catalog`. `resolveContextPricing` is also exported for application code. Explicit values override the catalog; unknown or ambiguous models stay unknown. Vlak does not fetch or bundle changing prices.

## Choose the pieces

| Component | Use it for |
| --- | --- |
| `Chat` | A complete chat frame with a named header, scrollable history, and an anchored composer |
| `Conversation` | A named, scrollable message history that follows new content while the reader is at the end |
| `Response` | A user or assistant message, rendered content, streaming state, and actions |
| `ResponseMarkdown` | Optional streaming Markdown, tables, code, math, and Mermaid diagrams |
| `HighlightedCode` | Optional monochrome syntax highlighting with copy and download |
| `ResponseBranch` | Navigation between saved response alternatives |
| `Attachments`, `Attachment` | File metadata, previews, removal, and supplied upload states |
| `Reasoning` | An expandable work summary with a chevron, presented as a panel or inline activity |
| `ResponseActions` | Four subtle icon controls for copying, narration, a combined feedback menu, and sharing |
| `ToolCall` | A named tool with supplied input, output, and execution state |
| `Confirmation` | A proposed action, an explicit decision, and the recorded approval state |
| `Widget`, `WidgetEmbed` | A common surface and data states for React content and provider iframes |
| `Assistant` | A general bordered shell for assistant content without a dedicated chat layout |
| `MessageComposer` | A compact growing draft, optional attachments, send handling, and a stop request |
| `Refs`, `RefItem`, `Cite`, `CiteLink` | Source lists and links between a response and its sources |
| `Button` | Suggested prompts, retry, and other application actions |

These patterns are related to the [AI Elements conversation](https://elements.ai-sdk.dev/components/conversation), [message](https://elements.ai-sdk.dev/components/message), and [tool](https://elements.ai-sdk.dev/components/tool) components. Vlak keeps its own tokens, native controls, and component APIs.

## Compose a conversation

`Chat` composes a header, `Conversation`, and a composer area in a frame with a subtle 1px outline and 4px corners. It fills the available width and keeps the supplied composer outside the scrolling history. Supply stable message IDs and preserve the status of earlier responses when another request starts.

```tsx
"use client";

import { useState, type ReactNode } from "react";
import {
  Button,
  Chat,
  MessageComposer,
  Response,
  ResponseActions,
  type ComposedMessage,
  type ResponseStatus,
} from "@noorddev/vlak-react";

type Message = {
  id: string;
  from: "user" | "assistant";
  content: ReactNode;
  status?: ResponseStatus;
  plainText?: string;
};

export function AssistantView({
  messages,
  generating,
  onSend,
  onStop,
}: {
  messages: Message[];
  generating: boolean;
  onSend: (message: ComposedMessage) => void | Promise<void>;
  onStop: () => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <Chat
      title="Document assistant"
      description="Ask about the supplied documents"
      conversationLabel="Document assistant messages"
      historyHeight="28rem"
      composer={
        <MessageComposer
          compact
          maxRows={6}
          sendOnEnter
          value={draft}
          onValueChange={setDraft}
          onSend={onSend}
          generating={generating}
          onStop={onStop}
        />
      }
      footer={`${messages.length} messages in this conversation`}
    >
      {messages.length === 0 && <>
        <p>Ask about your documents.</p>
        <Button
          variant="subtle"
          disabled={generating}
          onClick={() => setDraft("Summarize the supplied documents")}
        >
          Summarize documents
        </Button>
      </>}
      {messages.map((message) => (
        <Response
          key={message.id}
          from={message.from}
          status={message.status}
          actions={message.from === "assistant" && message.plainText && message.status !== "streaming"
            ? <ResponseActions text={message.plainText} />
            : undefined}
        >
          {message.content}
        </Response>
      ))}
    </Chat>
  );
}
```

The suggestion fills the draft. `onSend` submits it. Returning a rejected promise from `onSend` keeps the draft and attachments available for another attempt. Set `generating` for the application-owned request, including the initial wait, and connect `onStop` to the transport's cancellation method. The button itself does not cancel a request or establish that server work stopped.

`compact` starts the composer on one line with icon-only send and stop controls. Wrapping and newlines grow the field up to `maxRows`, which defaults to six and is clamped to 1–20. Longer drafts scroll; removing text or successfully sending shrinks the field. The label and shortcut remain accessible, and send failures stay visible. Omit `compact` for the larger field with visible labels.

`Chat` uses `Conversation` to preserve the reader's position when they scroll away from the end. Its “Jump to latest” control returns to the newest content. The message history is not a live region; response and tool status changes provide separate announcements without reading each incoming token. Use `autoScroll={false}` when the application owns scrolling. Use `Conversation` directly when composing a different layout, or use the `actions` slot on `Chat` for header controls such as a new conversation action.

## Attach files and compose tools

`MessageComposer` accepts picker, pasted, and dropped files when `allowAttachments` is enabled. `accept`, `maxFiles`, `maxFileSize`, and `multiple` apply the same validation to each route. Rejections stay visible and are reported through `onAttachmentError`. Selection does not upload files; `onSend` still receives `{ text, files: File[] }`.

Use `files`, `defaultFiles`, and `onFilesChange` to manage attachments outside the composer. The default display uses `Attachments` and `Attachment` for image thumbnails, native audio/video previews, and named removal controls. `renderAttachments` receives the preview data and removal/picker actions for custom composition. `useFileAttachments(files)` creates local preview addresses and revokes them when files are removed or the owning component unmounts.

```tsx
<MessageComposer
  compact
  allowAttachments
  files={files}
  onFilesChange={setFiles}
  accept="image/*,audio/*,video/*,.pdf,.txt"
  maxFiles={4}
  maxFileSize={10 * 1024 * 1024}
  tools={<ModelControls />}
  onSend={sendMessage}
/>
```

`tools` holds application controls such as model selection. `globalDrop` also accepts files dropped outside the field; enable it on one composer per page. `allowScreenshot` adds a button that opens the browser's screen chooser on activation. Unsupported browsers show it disabled. Display tracks stop after capture, cancellation, or unmount. Screenshots pass through the same attachment validation.

`useMessageComposer()` gives descendant tools the current draft, files, previews, and validated commands such as `setValue`, `addFiles`, `submit`, `stop`, and `focus`. It must run inside a component rendered beneath `MessageComposer`. `textareaProps` reaches the actual field, including its ref and native events; preventing a keyboard event's default overrides that shortcut.

Use `renderLayout(parts, state)` to arrange existing controls. Render `input` and `submit` once. The form keeps its hidden file picker, validation, shortcut description, and feedback outside your layout:

```tsx
import { MessageComposer, type ComposedMessage } from "@noorddev/vlak-react";

export function ComposedDraft({ onSend }: {
  onSend: (message: ComposedMessage) => void | Promise<void>;
}) {
  return <MessageComposer onSend={onSend} allowAttachments
    renderLayout={({ input, submit, attach, screenshot, attachments, tools }) => <>
      {attachments}
      {input}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        {attach}{screenshot}{tools}{submit}
      </div>
    </>}
  />;
}
```

For received files or upload state, compose `Attachment` items inside `Attachments`. Supply `data` with a stable identity, filename, media type, size, and optional address. The application controls `status`, `progress`, `error`, and `onRetry`; use `preview` to supply captions, transcripts, or other specialized media content. Failed sends retain the current draft. A successful send preserves text or files that the application replaced while the request was pending.

## Render response content

`Response` and `Reasoning` accept React children. Use `ResponseMarkdown` when the supplied text contains Markdown. Its optional subpath uses Streamdown for streaming syntax, Shiki for code, KaTeX for math, and a lazy Mermaid renderer. Install the dependencies listed on its component page and import the KaTeX stylesheet. The root component package stays free of those required dependencies.

```tsx
import { Response } from "@noorddev/vlak-react";
import { ResponseMarkdown } from "@noorddev/vlak-react/components/response-markdown";
import "katex/dist/katex.min.css";

<Response status={streaming ? "streaming" : "complete"}>
  <ResponseMarkdown streaming={streaming}>{text}</ResponseMarkdown>
</Response>
```

Raw markup is disabled. Links use web or mail protocols; image descriptions remain text unless their exact origins appear in `imageOrigins`. Completed diagram fences load the diagram renderer, with readable source available if rendering fails. Use trusted `components` overrides for application content. The renderer does not execute displayed code or start a model request.

For standalone code, import `HighlightedCode` from `@noorddev/vlak-react/components/highlighted-code`. It loads grammars as needed, preserves exact source for copy and download, and keeps unknown languages readable. `streaming` defers highlighting of unfinished source. The core `CodeBlock` remains available for plain source without a highlighter.

You can also compose ordinary React content, citations, and code directly:

```tsx
import {
  Cite,
  CiteLink,
  CodeBlock,
  Reasoning,
  RefItem,
  Refs,
  Response,
  ResponseActions,
} from "@noorddev/vlak-react";

<Response
  from="assistant"
  status="complete"
  actions={<ResponseActions text="The setting is enabled." />}
>
  <Reasoning variant="inline" title="Reviewed the configuration" status="complete">
    <p>Compared the supplied configuration with its documented default.</p>
  </Reasoning>
  <p>
    The setting is enabled.
    <Cite><CiteLink href="#configuration-source" aria-label="Source 1">1</CiteLink></Cite>
  </p>
  <CodeBlock code={'{ "enabled": true }'} language="JSON" />
  <Refs aria-label="Sources">
    <RefItem id="configuration-source">The configuration supplied in this conversation</RefItem>
  </Refs>
</Response>
```

Supply source IDs that are unique across the page. Show source links only when the application has a corresponding source. Pass the intended plain text to `ResponseActions`; it does not scrape rendered children. Omit `Response.copyText` when using the action bar to avoid a second copy control.

`Response` also accepts an `avatar` and `renderLayout(parts, state)`. Use the complete `header`, or its separate `avatar`, `author`, and `status` parts; keep each part once along with `content`, `error`, and `actions`. The status part carries the phase announcement. `useResponse()` lets descendant content or actions read the speaker and response state without passing them through each layer. A custom layout retains an article name, and an explicit accessible name can describe a custom author.

Use `Reasoning` for a work summary or explanation that the provider makes available for display. It does not retrieve private model reasoning. `variant="inline"` uses a padded summary with a text-color hover; the default panel has a subtle 1px outline and 4px corners. Its chevron points right when closed and down when open. The native disclosure keeps the reader's open or closed choice as content changes. Only label a response `complete` after completion; use `stopped` for an interrupted response and `error` for a failed one.

`ResponseBranch` navigates application-owned alternatives. Each item has a stable `id`, React `content`, and an optional `label`. Use `value` and `onValueChange` for controlled selection, or `defaultValue` for an initial alternative. The component does not generate responses or persist a message graph. Keep original alternatives when implementing edit or retry, and let the application decide which later turns belong to each branch.

## Add response actions

`ResponseActions` supplies four named 44px icon buttons for copy, read aloud, feedback, and share. They compose `Button variant="subtle" size="icon"`, with transparent surfaces and a text-color hover. One combined thumbs icon opens helpful and unhelpful choices; choosing the checked item again clears it. The menu supports arrow keys, Enter, Space, Escape, and Tab. Narration starts only on activation and offers a stop control; it is disabled when browser speech is unavailable. `onReadingChange` can coordinate an avatar with narration. Sharing uses `onShare` when supplied, otherwise native sharing or a clipboard fallback.

Set `actions` to any ordered subset of `"copy"`, `"read"`, `"feedback"`, and `"share"`; duplicates are ignored. All four remain the default, and `children` adds application actions. Removing `read` stops this response's narration; removing `feedback` closes its menu.

Feedback stays local unless `onFeedback` persists it. Use `feedback` for controlled selection or `defaultFeedback` for an initial value; callbacks receive `"positive"`, `"negative"`, or `null` when cleared. Rejected callbacks preserve the previous choice for retry. Completed actions and failures are announced, and replacing the text invalidates pending results.

## Use a conversational visual

`Persona` offers native `waveform`, `orb`, and `rings` variants for `idle`, `listening`, `thinking`, `speaking`, and `asleep`. Waveform is the default. Supply measured `intensity` from zero to one, or use each state's representative level. `asleep` settles to zero. A controlled `paused` prop stops motion without changing the conversational state.

```tsx
import { Persona, type PersonaState } from "@noorddev/vlak-react";

export function SpeakerVisual({ state, level }: { state: PersonaState; level?: number }) {
  return <Persona variant="orb" state={state} intensity={level} size={32} />;
}
```

The native visuals stop when offscreen, the page is hidden, reduced motion or forced colors is active, or the caller pauses them. `onMotionChange(animated)` reports this effective motion policy. `renderVisual` receives `{ state, size, intensity, animated }` for an application-owned renderer; it should honor `animated` and release its resources on unmount. Existing `children` can supply custom content. Omit `label` beside an already named message, or provide one to expose the visual and state as an image. The native variants need no graphics engine or downloaded artwork.

## Resolve supplied context metadata

`ContextUsage` accepts explicit `maxTokens` and `pricing`, or `modelId` with an application-supplied Tokenlens or models.dev catalog. Explicit `model`, `maxTokens`, and `pricing` replace the resolved values. Nothing is fetched or bundled as a pricing snapshot.

For a custom presentation, `resolveContextPricing(modelId, catalog, { inputTokens })` returns the same model name, context limit, and token rates. Qualify ids as `provider/model` when provider pricing matters; providerless ids must match exactly one model. Context pricing tiers require the actual input count. Missing, ambiguous, or invalid information stays unavailable, and calculated costs remain estimates from the supplied rates.

## Show tools and decisions separately

`ToolCall` displays supplied state: `queued`, `running`, `complete`, or `error`. Its surface has a subtle 1px outline, 4px corners, and a native summary with a right or down chevron. Its `input` and `output` accept React content. Convert JSON data to a string before passing it; this also keeps `false`, `0`, `null`, and an empty string distinct from an absent value.

```tsx
import { Confirmation, ToolCall } from "@noorddev/vlak-react";

<ToolCall
  title="Search documents"
  state="complete"
  input={JSON.stringify({ query: "renewal terms" }, null, 2)}
  output={JSON.stringify({ matches: 0 }, null, 2)}
/>;

// The application supplies recordApproval and persists the decision.
<Confirmation
  title="Add the summary to the project?"
  confirmLabel="Add summary"
  onConfirm={() => recordApproval({ approved: true })}
  onReject={() => recordApproval({ approved: false })}
>
  <p>The summary will be added to the current project.</p>
</Confirmation>;
```

`Confirmation` uses the same subtle outline and 4px corners. It locks both actions while a callback is pending. A successful callback records `accepted` or `rejected`; a rejected promise leaves the request available for another attempt and shows failure feedback. Use `status` and `onStatusChange` when the application owns the record. With controlled `status`, the actions remain locked after a successful callback until the application updates that status. Give each distinct proposal a stable React key. An accepted decision does not mean the tool has executed. Show execution progress and its eventual result separately.

## Compose widgets

Use the [widget design system](https://vlak.dev/ai/widgets/) for both internal tools and connected providers, using React content or an iframe. `Widget` uses the same subtle 1px outline and 4px corners, with shared slots for `title`, optional `provider` and decorative `icon`, `description`, `children`, `actions`, and a supporting `footer`. Render provider data with your own React components, or place `WidgetEmbed` in the content slot. Use subtle `Button` actions and `ToggleGroup variant="subtle"` for supporting actions and view choices.

```tsx
import { Button, Widget } from "@noorddev/vlak-react";

<Widget
  title="Recent files"
  provider="Connected drive"
  status={status}
  emptyMessage="No files match this request."
  errorMessage="The drive could not be reached."
  onRetry={reloadFiles}
  actions={<Button variant="subtle" onClick={openFiles}>Open files</Button>}
  footer="Updated just now"
>
  <p>Project brief · Ready for review</p>
</Widget>
```

Map application data to `ready`, `loading`, `empty`, or `error`. Ready renders children and actions; other states show their message while preserving provider context. `onRetry` requests a reload and reports rejected attempts. The application updates `status` when new data arrives. Widgets do not fetch, authenticate, or execute tools; pass trusted React content rather than raw provider markup.

For an iframe, use the provider's embed URL and a descriptive title. Set an explicit height for the content you expect:

```tsx
import { Widget, WidgetEmbed } from "@noorddev/vlak-react";

<Widget title="Project board" provider="Connected board">
  <WidgetEmbed
    title="Project board from the connected provider"
    src={providerEmbedUrl}
    height={360}
  />
</Widget>
```

`WidgetEmbed` fills its container width and defaults to `height={320}`, `loading="lazy"`, `referrerPolicy="no-referrer"`, and `sandbox="allow-scripts allow-forms"`. Native iframe attributes pass through, including application-owned `sandbox` and `allow` permissions. The parent page cannot style a cross-origin frame's interior; the provider owns its appearance and accessible controls. Provider theming, messaging, and automatic height coordination belong to the application integration.

## Connect the AI SDK

The AI SDK is an optional application dependency. Its `useChat` hook supplies messages, request status, `sendMessage`, `stop`, and approval responses. Render `message.parts` explicitly so each part retains its state and meaning. The following adapter uses the documented [UI message parts](https://ai-sdk.dev/docs/reference/ai-sdk-core/ui-message) and [tool approval flow](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-with-tool-calling).

```tsx
import type { ReactNode } from "react";
import type { UIMessage } from "ai";
import { Confirmation, Reasoning, ToolCall, type ResponseStatus } from "@noorddev/vlak-react";

type Part = UIMessage["parts"][number];
type Approve = (decision: { id: string; approved: boolean }) => void | PromiseLike<void>;

export function renderPart(
  part: Part,
  renderMarkdown: (text: string) => ReactNode,
  approve: Approve,
  responseStatus: ResponseStatus,
) {
  if (part.type === "text") return renderMarkdown(part.text);
  if (part.type === "reasoning") {
    const incomplete = part.state === "streaming";
    const label = incomplete && responseStatus === "stopped" ? "Stopped"
      : incomplete && responseStatus === "error" ? "Interrupted"
      : undefined;
    return (
      <Reasoning
        status={incomplete && responseStatus === "streaming" ? "streaming" : "complete"}
        statusLabel={label}
      >
        {renderMarkdown(part.text)}
      </Reasoning>
    );
  }
  if (!(part.type === "dynamic-tool" || part.type.startsWith("tool-"))) return null;
  // Narrow both static and dynamic tool parts without importing SDK types into Vlak.
  if (!("toolCallId" in part)) return null;

  const title = part.type === "dynamic-tool" ? part.toolName : part.type.slice(5);
  const input = part.input === undefined ? undefined : JSON.stringify(part.input, null, 2);

  switch (part.state) {
    case "input-streaming":
      return <ToolCall title={title} state="queued" input={input} />;
    case "input-available":
      return <ToolCall title={title} state="queued" input={input} />;
    case "approval-requested":
      if ("isAutomatic" in part.approval && part.approval.isAutomatic) {
        return <p>{title}: checking the approval policy</p>;
      }
      return (
        <Confirmation
          key={part.approval.id}
          title={`Allow ${title}?`}
          status="pending"
          onConfirm={async () => { await approve({ id: part.approval.id, approved: true }); }}
          onReject={async () => { await approve({ id: part.approval.id, approved: false }); }}
        >
          <pre>{input}</pre>
        </Confirmation>
      );
    case "approval-responded":
      return <p>{title}: {part.approval.approved ? "approved, waiting for execution" : "denied"}</p>;
    case "output-available":
      return <ToolCall title={title} state="complete" input={input} output={JSON.stringify(part.output, null, 2)} />;
    case "output-error":
      return <ToolCall title={title} state="error" input={input} error="The tool could not complete." />;
    case "output-denied":
      return <p>{title}: execution denied</p>;
  }
}
```

This adapter covers text, displayable reasoning, and tools. An unfinished reasoning part is labeled “Stopped” or “Interrupted” when its response ends that way; a summary that already finished keeps its completion label. `input-available` confirms that tool arguments are ready; promote the tool to `running` when the application has execution evidence. Add handlers for `source-url`, `source-document`, `file`, and your application's data parts before enabling those features. Source URLs belong in `Refs`; files need the application's upload and download policy. Keep the order of parts and give each rendered part a stable key, using `toolCallId` for tools. The application can combine related reasoning parts into one `Reasoning` disclosure when a provider emits several parts for one summary.

Configure the hook in the consuming application and call the adapter from inside a `Response`. The `sendAutomaticallyWhen` option continues after all required approvals are supplied. Automatic approval decisions should be displayed without asking the user to decide again. See the [useChat reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) for transport and callback options.

```tsx
import { Fragment, useState, type ReactNode } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import { Conversation, Response, type ResponseStatus } from "@noorddev/vlak-react";
import { renderPart } from "./render-part";

// renderMarkdown is the application's renderer, not a Vlak export.
export function SdkHistory({ renderMarkdown }: { renderMarkdown: (text: string) => ReactNode }) {
  const [outcomes, setOutcomes] = useState<Record<string, ResponseStatus>>({});
  const chat = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    onFinish: ({ message, isAbort, isError, isDisconnect }) => {
      setOutcomes((previous) => ({
        ...previous,
        [message.id]: isAbort ? "stopped" : isError || isDisconnect ? "error" : "complete",
      }));
    },
  });
  const busy = chat.status === "submitted" || chat.status === "streaming";

  return (
    <Conversation label="Assistant messages">
      {chat.messages.map((message, index) => {
        if (message.role === "system") return null;
        const latest = message.role === "assistant" && index === chat.messages.length - 1;
        const responseStatus = latest && busy ? "streaming"
          : latest && chat.status === "error" ? "error"
          : outcomes[message.id] ?? "complete";
        return (
          <Response key={message.id} from={message.role} status={responseStatus}>
            {message.parts.map((part, partIndex) => (
              <Fragment key={"toolCallId" in part ? part.toolCallId : `${message.id}-${partIndex}`}>
                {renderPart(part, renderMarkdown, chat.addToolApprovalResponse, responseStatus)}
              </Fragment>
            ))}
          </Response>
        );
      })}
      {chat.error && <p role="status">The response could not complete. Try again.</p>}
    </Conversation>
  );
}
```

Place a `MessageComposer compact` after the conversation in the same component. Set `generating={busy}` and connect `onStop` to `chat.stop`. Connect submission to `chat.sendMessage({ text })` through an application callback. Adapt SDK errors into a rejected `onSend` promise if the composer should retain a failed draft; the hook also reports errors through `onError` and `error`, so awaiting `sendMessage` alone is not a complete error policy. The example retains response outcomes in local state; persist them with the conversation to restore interrupted responses correctly. System messages are omitted from this user-facing view.

Tool execution, authorization, approval verification, and persistence belong on the application server. Use the [AI SDK tool execution documentation](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-with-tool-calling) for the installed SDK version; a client-side `Confirmation` is the decision interface, not the server's authorization check.
