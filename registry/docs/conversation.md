# Conversation

Keeps a scrollable message history at the latest response until the reader scrolls back.

Category: ai  
Name: `conversation`  
Also known as: AI Elements Conversation, Chat history, Message log, Auto scroll, Chatbot  
Page: https://vlak.dev/ai/conversation/

## When to use

- A message history whose contents grow during a streamed response.
- Keep MessageComposer outside the scrollable history.
- Set autoScroll={false} to keep scrolling entirely manual.
- CSS-only markup provides native scrolling; following and the jump action require React or application code.

## When not to

- Putting an entire workbench in the message log.
- Using this component to fetch messages, render Markdown, or own a model connection.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Conversation } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add conversation
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/conversation.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-conversation"><div class="rs-conversation-viewport" role="log" aria-label="Conversation" aria-live="off" tabindex="0" style="max-height:28rem"><div class="rs-conversation-content"><p>You: Summarize this document.</p><p>Assistant: The document has three sections.</p></div></div></div>
```

## Example

```tsx
import { Conversation, MessageComposer, Response, ResponseActions, type ComposedMessage } from "@noorddev/vlak-react";

export function DocumentConversation({ onSend, generating, onStop }: {
  onSend: (message: ComposedMessage) => void | Promise<void>;
  generating: boolean;
  onStop: () => void;
}) {
  return <>
    <Conversation label="Document conversation" maxHeight="28rem">
      <Response from="user">Summarize this document.</Response>
      <Response actions={<ResponseActions text="The document has three sections." />}>
        <p>The document has three sections.</p>
      </Response>
    </Conversation>
    <MessageComposer compact maxRows={6} sendOnEnter onSend={onSend} generating={generating} onStop={onStop} />
  </>;
}
```

## Props

### Conversation

A message history that follows new content without taking the reader away from earlier messages.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `"Conversation"` | Accessible name of the scrollable message history. |
| `maxHeight` | `Property.MaxHeight<string \| number>` | `"28rem"` | Maximum height of the message history, before it scrolls. |
| `autoScroll` | `boolean` | `true` | Follow new content while the reader is at the end. |
| `latestLabel` | `string` | `"Jump to latest"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the scrollable log and its interactive contents |
| Arrow keys, Page Up, Page Down | Scrolls the focused history using native browser behavior |
| Enter, Space | Activates Jump to latest and returns focus to the history |

## Accessibility

- The message log has a supplied accessible label and a keyboard entry point.
- The log uses aria-live=off; use Response status announcements rather than announcing every streamed token.
- New content follows only while the reader is within 24px of the end. Scrolling back preserves the reading position.
- Jump to latest is a native 44px Button. Automatic scrolling is immediate and never moves focus.
- The ref and native attributes reach the outer div; maxHeight sets the inner scrollable history.

## Classes

`rs-conversation`, `rs-conversation-viewport`, `rs-conversation-content`, `rs-conversation-footer`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/conversation.tsx`  
CSS: `packages/core/css/components/conversation.css`
