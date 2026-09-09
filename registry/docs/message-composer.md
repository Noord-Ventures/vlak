# Message composer

Composes a compact growing draft with validated file previews, paste and drop, screenshot capture, and retained drafts on failure.

Category: patterns  
Name: `message-composer`  
Also known as: MessageComposer, Chat input, Comment composer, AI Elements PromptInput  
Page: https://vlak.dev/components/message-composer/

## When to use

- Chat, comments, or a support reply.
- Async submission that must preserve a draft when it fails.
- Application-owned response generation with a Stop response action.
- Use compact for a single-line draft with inline icon actions. The field grows with wrapping and newlines, then scrolls at maxRows, which defaults to six lines.
- The compact field shrinks when text is removed or a successful send clears it, and remeasures when its available width changes.
- Use files, defaultFiles, and onFilesChange to lift attachment selection alongside controlled text.
- Picker, paste, and drop share accept, maxFiles, maxFileSize, and multiple validation. onAttachmentError receives rejected files and reasons.
- Use tools for model selectors or application controls, and renderAttachments for custom preview composition.
- useMessageComposer reads the current draft, files, previews, pending and generation state, and validated commands from a descendant. It requires a surrounding MessageComposer.
- renderLayout receives MessageComposerParts and state to arrange input, submit, attach, screenshot, attachments, and tools. Render input and submit once; hidden file selection and feedback remain owned by the form.
- textareaProps forwards native attributes, events, and a merged ref to the actual field. Prevent a keyboard event default to override its shortcut; required draft and submission behavior stay in the composer.
- Enable globalDrop on one composer per page when file drops outside the field should attach there. allowScreenshot adds explicit browser screen selection when supported.

## When not to

- An arbitrary multi-field form or uploading files without a message.
- Calling useMessageComposer outside its provider or invoking commands while rendering. Run commands from user actions or application effects.
- Assuming browser file checks replace the application upload policy or that attachment selection uploads files automatically.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { MessageComposer, useMessageComposer } from "@noorddev/vlak-react";
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
"use client";
import { Button, MessageComposer, useMessageComposer, type ComposedMessage } from "@noorddev/vlak-react";

function ClearDraft() {
  const draft = useMessageComposer();
  return <Button variant="subtle" size="sm" disabled={draft.disabled || !draft.value}
    onClick={() => { draft.setValue(""); draft.focus(); }}>Clear draft</Button>;
}

export function ProjectComposer({ onSend, generating = false, onStop }: {
  onSend: (message: ComposedMessage) => void | Promise<void>;
  generating?: boolean;
  onStop?: () => void;
}) {
  return <MessageComposer compact maxRows={6} sendOnEnter onSend={onSend}
    generating={generating} onStop={onStop} tools={<ClearDraft />}
    textareaProps={{ "aria-label": "Ask about the project", autoComplete: "off" }}
    allowAttachments accept="image/*,.pdf" maxFiles={4}
    maxFileSize={10 * 1024 * 1024} allowScreenshot />;
}
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
| `files` | `File[]` |  | Controlled file selection, independent of the text draft. |
| `defaultFiles` | `File[]` | `[]` |  |
| `onFilesChange` | `(files: File[]) => void` |  |  |
| `multiple` | `boolean` | `true` |  |
| `maxFiles` | `number` |  |  |
| `maxFileSize` | `number` |  |  |
| `onAttachmentError` | `(rejections: MessageAttachmentRejection[]) => void` |  |  |
| `globalDrop` | `boolean` | `false` | Also accept file drops outside this composer. Enable on one composer per page. |
| `allowScreenshot` | `boolean` | `false` | Shows a user-activated browser screen capture action when available. |
| `tools` | `ReactNode` |  | Application-owned model selectors, capability controls, or other tools. |
| `renderAttachments` | `(attachments: AttachmentData[], actions: MessageComposerAttachmentActions) => ReactNode` |  |  |
| `renderLayout` | `(parts: MessageComposerParts, state: MessageComposerState) => ReactNode` |  | Rearranges the provided controls. Render input and submit once; feedback stays in the form. |
| `textareaProps` | `MessageComposerTextareaProps` | `{}` | Native textarea attributes and handlers. Prevent a key's default to override its shortcut. |
| `maxLength` | `number` |  |  |
| `sendOnEnter` | `boolean` | `false` | Enter submits, Shift+Enter inserts a line. Otherwise use Cmd/Ctrl+Enter. |
| `generating` | `boolean` | `false` | Application-owned response generation, separate from submission pending state. |
| `onStop` | `() => void` |  | Requests that the application stop generation; does not itself cancel a network request. |
| `compact` | `boolean` | `false` | A single-line draft with an inline icon action; grows as the message wraps. |
| `maxRows` | `number` | `6` | Maximum visible draft lines in compact mode, clamped to 1–20. |

### Functions

- `useMessageComposer` (hook): Reads the nearest composer's draft and validated commands from a custom child or tool.

## Keyboard

| Keys | Does |
| --- | --- |
| Cmd+Enter, Ctrl+Enter | Submits the draft when no send or response generation is in progress. |
| Enter, Shift+Enter | With sendOnEnter enabled, Enter submits and Shift+Enter inserts a line; IME composition never submits. |
| Tab, Enter, Space | Operates attachment, send, and stop actions. |

## Accessibility

- The textarea has a visible label by default. Compact mode uses the same accessible name and a visually hidden shortcut description.
- Sending prevents duplicate submission; results are announced.
- Only a successful send clears the draft and attachments; failures retain both.
- generating replaces Send with Stop response but keeps the next draft editable. onStop requests application cancellation; it does not cancel network activity itself.
- Compact icon actions retain readable names, titles, and 44px targets. Failed sends remain visible beneath the field; other status updates are available to assistive technology.
- Rejected attachments remain visible in an alert. File previews have named remove controls and preserve object addresses until removal.
- Screenshot capture starts only from its button, uses the browser chooser, and stops display tracks after capture, cancellation, or unmount.
- If controlled text or files change during a pending send, successful completion clears only the submitted draft and files that still match.
- Custom layouts retain the form, validation, shortcuts, and feedback. Keep the provided field and action names and their natural reading order.

## Classes

`rs-message-composer`, `rs-message-composer-compact`, `rs-message-composer-row`, `rs-message-composer-area`, `rs-message-composer-actions`, `rs-message-composer-action`, `rs-message-composer-icon-action`, `rs-message-composer-files`, `rs-message-composer-file`, `rs-message-composer-hint`, `rs-message-composer-input`, `rs-message-composer-sr-only`, `rs-message-composer-tools`, `rs-message-composer-drag`

## Dependencies

Registry dependencies: [textarea](textarea.md), [button](button.md), [icons](icons.md), [attachments](attachments.md).  
React: `packages/react/src/components/message-composer.tsx`  
CSS: `packages/core/css/components/message-composer.css`
