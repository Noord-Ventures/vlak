# Assistant panel

Frames an assistant exchange with a user message, reply, suggestion, and input row.

Category: patterns  
Name: `assistant`  
Also known as: Assistant, Chat panel, AI chat, Conversation, Copilot panel  
Page: https://vlak.dev/components/assistant/

## When to use

- A chat panel with a head, a message thread, and an input row.
- AssistantCard and AssistantTag for a suggestion the reply proposes.

## When not to

- Long transcripts without a ScrollArea.
- Notifications; use toast.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Assistant, AssistantCard, AssistantDone, AssistantHead, AssistantInput, AssistantMsg, AssistantReply, AssistantSend, AssistantStatus, AssistantTag, AssistantText, AssistantTitle, AssistantUserBlock } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add assistant
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/assistant.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-ai"><div class="rs-ai-msg rs-ai-user"><div class="rs-ai-user-block">Make the intro tighter.</div></div><p class="rs-ai-reply">Done. Two sentences, same claim.</p></div>
```

## Example

```tsx
import { Assistant, AssistantHead, AssistantMsg, AssistantReply, AssistantStatus, AssistantTitle, AssistantUserBlock, MessageComposer } from "@noorddev/vlak-react";

<Assistant>
  <AssistantHead>
    <AssistantTitle>Assistant</AssistantTitle>
    <AssistantStatus>Ready</AssistantStatus>
  </AssistantHead>
  <AssistantMsg user>
    <AssistantUserBlock>Make the intro tighter.</AssistantUserBlock>
  </AssistantMsg>
  <AssistantReply>Done. Two sentences, same claim.</AssistantReply>
  <MessageComposer onSend={sendMessage} />
</Assistant>
```

## Props

### Assistant

Chat panel: user block, reply, suggestion card, input row.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

### AssistantCard

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

### AssistantDone

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

### AssistantHead

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

### AssistantInput

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

### AssistantMsg

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `user` | `boolean` |  |  |

### AssistantReply

Extends `HTMLAttributes<HTMLParagraphElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLParagraphElement`.

No props of its own.

### AssistantSend

Extends `HTMLAttributes<HTMLSpanElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSpanElement`.

No props of its own.

### AssistantStatus

Extends `HTMLAttributes<HTMLSpanElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSpanElement`.

No props of its own.

### AssistantTag

Extends `HTMLAttributes<HTMLSpanElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSpanElement`.

No props of its own.

### AssistantText

Extends `HTMLAttributes<HTMLParagraphElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLParagraphElement`.

No props of its own.

### AssistantTitle

Extends `HTMLAttributes<HTMLSpanElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSpanElement`.

No props of its own.

### AssistantUserBlock

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

## Accessibility

- Layout parts only. Give the thread aria-live="polite" if replies stream in, and make the input a real <input> with a name and the send a <button>.

## Classes

`rs-ai`, `rs-ai-head`, `rs-ai-title`, `rs-ai-status`, `rs-ai-msg`, `rs-ai-user`, `rs-ai-user-block`, `rs-ai-reply`, `rs-ai-card`, `rs-ai-tag`, `rs-ai-text`, `rs-ai-done`, `rs-ai-input`, `rs-ai-send`, `rs-ai-status-dot`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/assistant.tsx`  
CSS: `packages/core/css/components/assistant.css`
