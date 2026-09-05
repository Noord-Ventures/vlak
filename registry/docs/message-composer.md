# Message composer

Composes text and optional attachments with submission shortcuts and retained drafts on failure.

Category: patterns  
Name: `message-composer`  
Also known as: MessageComposer, Chat input, Comment composer  
Page: https://vlak.dev/components/message-composer/

## When to use

- Chat, comments, or a support reply.
- Async submission that must preserve a draft when it fails.
- Application-owned response generation with a Stop response action.

## When not to

- An arbitrary multi-field form or uploading files without a message.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { MessageComposer } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add message-composer
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/message-composer.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<form class="rs-message-composer" aria-label="Message"><label>Message<textarea class="rs-textarea" placeholder="Write a message…"></textarea></label><div class="rs-message-composer-actions"><button class="rs-btn-primary" type="submit">Send</button></div></form>
```

## Example

```tsx
import { MessageComposer } from "@noorddev/vlak-react";

<MessageComposer onSend={async ({ text, files }) => sendMessage(text, files)} generating={generating} onStop={stopResponse} allowAttachments accept="image/*,.pdf" />
```

## Props

### MessageComposer

A message draft with attachments, IME-safe shortcuts, and retained text after send failures.

Extends `Omit<FormHTMLAttributes<HTMLFormElement>, "defaultValue" | "onSubmit">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLTextAreaElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `(text: string) => void` |  |  |
| `onSend` (required) | `(message: ComposedMessage) => void \| Promise<void>` |  |  |
| `label` | `string` | `"Message"` |  |
| `placeholder` | `string` | `"Write a message…"` |  |
| `disabled` | `boolean` | `false` |  |
| `allowAttachments` | `boolean` | `false` |  |
| `accept` | `string` |  |  |
| `maxLength` | `number` |  |  |
| `sendOnEnter` | `boolean` | `false` | Enter submits, Shift+Enter inserts a line. Otherwise use Cmd/Ctrl+Enter. |
| `generating` | `boolean` | `false` | Application-owned response generation, separate from submission pending state. |
| `onStop` | `() => void` |  | Requests that the application stop generation; does not itself cancel a network request. |

## Keyboard

| Keys | Does |
| --- | --- |
| Cmd+Enter, Ctrl+Enter | Submits the draft when no send or response generation is in progress. |
| Enter, Shift+Enter | With sendOnEnter enabled, Enter submits and Shift+Enter inserts a line; IME composition never submits. |
| Tab, Enter, Space | Operates attachment, send, and stop actions. |

## Accessibility

- The textarea has a visible label and shortcut description.
- Sending prevents duplicate submission; results are announced.
- Only a successful send clears the draft and attachments; failures retain both.
- generating replaces Send with Stop response but keeps the next draft editable. onStop requests application cancellation; it does not cancel network activity itself.

## Classes

`rs-message-composer`, `rs-message-composer-actions`, `rs-message-composer-action`, `rs-message-composer-files`, `rs-message-composer-file`, `rs-message-composer-hint`, `rs-message-composer-input`

## Dependencies

Registry dependencies: [textarea](textarea.md), [button](button.md), [icons](icons.md).  
React: `packages/react/src/components/message-composer.tsx`  
CSS: `packages/core/css/components/message-composer.css`
