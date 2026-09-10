# Chat

A subtle 1px outline with 4px corners, a named header, scrollable conversation, and a composer anchored below the history.

Category: ai  
Name: `chat`  
Also known as: AI chat, Chat interface, Chat panel, Assistant chat, Chat shell  
Page: https://vlak.dev/ai/chat/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- A complete chat surface with a stable header and composer around scrolling messages.
- Supply Response elements as children and MessageComposer through the composer slot. Compact mode starts on one line, uses icon send and stop controls, and grows up to maxRows.
- Set historyHeight to reserve message space and let the frame fill its container width.
- Use actions for header controls and footer for supporting text below the composer.
- CSS-only markup provides the frame and native scrolling; following, draft growth, and send handling require React or application code.

## When not to

- Nesting another Conversation inside the supplied children.
- Using this component to connect a model, store messages, or execute tools.
- Using a fixed page overlay when the surrounding application needs to control placement.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Chat } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add chat
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/chat.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-chat" aria-labelledby="project-chat-title"><header class="rs-chat-header"><div class="rs-chat-heading"><span class="rs-chat-title" id="project-chat-title">Project brief</span><div class="rs-chat-description">Ask about the current draft</div></div></header><div class="rs-chat-history rs-conversation" style="height:28rem"><div class="rs-conversation-viewport" role="log" aria-label="Project brief messages" aria-live="off" tabindex="0" style="max-height:100%"><div class="rs-conversation-content"><p>You: What needs to change?</p><p>Assistant: Name the owner and next step.</p></div></div></div><div class="rs-chat-composer"><form aria-label="Message composer" style="display:flex;align-items:flex-end;gap:4px"><textarea aria-label="Message" name="message" rows="1" style="flex:1;min-width:0;min-height:44px;max-height:10rem"></textarea><button type="submit" aria-label="Send message" style="width:44px;height:44px;flex:none"><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" /></svg></button></form></div></section>
```

## Example

```tsx
import { Chat, MessageComposer, Reasoning, Response, ResponseActions, type ComposedMessage } from "@noorddev/vlak-react";

export function ProjectChat({ onSend, generating, onStop }: {
  onSend: (message: ComposedMessage) => void | Promise<void>;
  generating: boolean;
  onStop: () => void;
}) {
  return <Chat title="Project brief" description="Ask about the current draft" conversationLabel="Project brief messages" historyHeight="28rem"
    composer={<MessageComposer compact maxRows={6} sendOnEnter onSend={onSend} generating={generating} onStop={onStop} />}>
    <Response from="user">What needs to change?</Response>
    <Response actions={<ResponseActions text="Name the owner and next step." />}>
      <Reasoning variant="inline" title="Reviewed the brief" status="complete">
        <p>Checked the supplied scope and responsibilities.</p>
      </Reasoning>
      <p>Name the owner and next step.</p>
    </Response>
  </Chat>;
}
```

## Props

### Chat

A chat frame with a named history and a composer that stays outside its scroll area.

Extends `Omit<HTMLAttributes<HTMLElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `ReactNode` |  | Visible name of this chat and its region. |
| `description` | `ReactNode` |  | Context or status below the title. |
| `actions` | `ReactNode` |  | Application-owned controls in the header. |
| `children` | `ReactNode` |  | Messages rendered inside the conversation history. |
| `composer` (required) | `ReactNode` |  | An application-owned message composer, outside the scrolling history. |
| `footer` | `ReactNode` |  | Supporting text below the composer. |
| `conversationLabel` | `string` | `"Conversation"` | Accessible name of the scrollable message history. |
| `historyHeight` | `Property.Height<string \| number>` | `"28rem"` | Height reserved for the message history, including its jump control. |
| `autoScroll` | `boolean` | `true` | Follow new content while the reader is at the end. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through supplied header actions, the message history, and composer controls |
| Arrow keys, Page Up, Page Down | Scrolls the focused history using native browser behavior |
| Enter, Space | Activates Jump to latest and returns focus to the history |

## Accessibility

- The section is named by its visible title unless an accessible name override is supplied.
- conversationLabel names the scrollable message log independently of the frame.
- The built-in Conversation keeps its live region off and preserves the reader's position when they scroll back.
- The composer and its supporting footer remain outside the scrollable history.
- Native attributes and the forwarded ref reach the outer section. The application supplies accessible controls in the actions and composer slots.

## Classes

`rs-chat`, `rs-chat-header`, `rs-chat-heading`, `rs-chat-title`, `rs-chat-description`, `rs-chat-actions`, `rs-chat-history`, `rs-chat-composer`, `rs-chat-footer`

## Dependencies

Registry dependencies: [conversation](conversation.md).  
React: `packages/react/src/components/chat.tsx`  
CSS: `packages/core/css/components/chat.css`
