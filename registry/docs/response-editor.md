# Response editor

A multiline message editor that preserves failed drafts and ignores cancelled saves.

Category: ai  
Name: `response-editor`  
Also known as: Response editor, Edit message, Regenerate response  
Page: https://vlak.dev/ai/response-editor/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Edit a supplied message with an application-owned async save. Failed saves preserve the draft.
- Compose this editor with ResponseBranch when editing produces another response version. The application owns regenerate requests and history.
- Escape or Cancel invalidates local pending feedback and calls onCancel.

## When not to

- Treating local cancellation as cancellation of a backend operation; pass and manage that signal in the application.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ResponseEditor } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add response-editor
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/response-editor.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<form class="rs-response-editor" aria-label="Edit message"><label>Message<textarea>Review the brief</textarea></label><div class="rs-response-editor-actions"><button class="rs-btn-subtle" type="submit">Save message</button></div></form>
```

## Example

```tsx
import { ResponseEditor } from "@noorddev/vlak-react";

export function EditMessage({ text, onSave, onCancel }: {
  text: string;
  onSave: (text: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  return <ResponseEditor text={text} onSave={onSave} onCancel={onCancel} />;
}
```

## Props

### ResponseEditor

Multiline message editing with async save, cancellation, and failed-draft retention.

Extends `Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onError">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFormElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` (required) | `string` |  |  |
| `onSave` (required) | `(text: string) => void \| Promise<void>` |  |  |
| `onCancel` (required) | `() => void` |  |  |
| `label` | `string` | `"Edit message"` |  |
| `saveLabel` | `string` | `"Save message"` |  |
| `disabled` | `boolean` |  |  |
| `onError` | `(error: unknown) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the supplied native controls in reading order |
| Enter, Space | Activates focused buttons and disclosure summaries |
| Escape | Cancels the editor and invalidates pending feedback |

## Accessibility

- Native attributes, className, style, and the forwarded ref reach the outer element.
- Interactive content requires accessible names; progress text is not announced for every streamed token.

## Classes

`rs-response-editor`, `rs-response-editor-actions`, `rs-response-editor-error`

## Dependencies

Registry dependencies: [button](button.md), [textarea](textarea.md).  
React: `packages/react/src/components/response-editor.tsx`  
CSS: `packages/core/css/components/response-editor.css`
