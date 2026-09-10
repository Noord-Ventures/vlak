# Conversation export

Downloads a Markdown snapshot from explicit message text, attachments, and structured tool results.

Category: ai  
Name: `conversation-export`  
Also known as: Conversation download, Markdown export  
Page: https://vlak.dev/ai/conversation-export/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Pass explicit message data to serializeConversation or ConversationDownload. No rendered DOM is scraped.
- Use serializePart for application-specific export formatting. The download owns and releases its object URLs.

## When not to

- Coercing arbitrary message objects into strings or claiming persistence from a local download.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ConversationDownload, serializeConversation } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add conversation-export
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/conversation-export.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<button class="rs-btn-subtle" type="button">Download conversation</button>
```

## Example

```tsx
import { ConversationDownload } from "@noorddev/vlak-react";

<ConversationDownload title="Project review" messages={[{ role: "user", content: "Review the brief" }, { role: "assistant", parts: [{ type: "text", text: "Two owners are missing." }] }]} />
```

## Props

### ConversationDownload

Downloads a Markdown snapshot using supplied message data, without reading rendered DOM.

Extends `ButtonHTMLAttributes<HTMLButtonElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "ghost" \| "subtle"` |  | Solid ink primary, hairline ghost, or borderless subtle. One primary per view. |
| `size` | `"default" \| "sm" \| "icon"` |  | Icon buttons stay square at every breakpoint. Supply an accessible name. |
| `grouped` | `boolean` |  | Flush into a ButtonGroup: no own stroke, one ink seam. |
| `serializePart` | `(part: ConversationExportPart, message: ConversationExportMessage) => string` |  |  |
| `messages` (required) | `readonly ConversationExportMessage[]` |  |  |
| `filename` | `string` | `"conversation.md"` |  |
| `onError` | `(error: unknown) => void` |  |  |

### Functions

- `serializeConversation` (function): Serializes explicit text, file and tool parts; unsupported application objects are never stringified as messages.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the supplied native controls in reading order |
| Enter, Space | Activates focused buttons and disclosure summaries |

## Accessibility

- Native attributes, className, style, and the forwarded ref reach the outer element.
- Interactive content requires accessible names; progress text is not announced for every streamed token.

## Classes

`rs-btn-subtle`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/conversation-export.tsx`  
CSS: `packages/core/css/components/button.css`
