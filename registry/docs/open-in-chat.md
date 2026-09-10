# Open in chat

Explicit provider links that encode a supplied prompt for ChatGPT, Claude, Cursor, Scira, T3 Chat and v0.

Category: ai  
Name: `open-in-chat`  
Also known as: AI Elements Open in Chat, OpenIn, ChatGPT handoff, Claude handoff, Provider prompt links  
Page: https://vlak.dev/ai/open-in-chat/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Offer an explicit handoff of supplied text to another application.
- Choose providers from chatgpt, claude, cursor, scira, t3, v0 and github. GitHub requires a separate githubUrl; it does not treat the prompt as a URL.
- Prompt query parameters use the browser's query encoder. Native links preserve browser open-in-new-tab behavior.
- No prompt is sent when the component renders or opens; the selected provider is contacted only after link activation.
- Provider handoff addresses are based on the pinned AI Elements reference and may evolve. The provider controls what happens after navigation.

## When not to

- Claiming that opening a provider link has submitted or generated a response.
- Including conversation content in prompt that the application does not intend to hand off.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { OpenInChat, openInChatHref } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add open-in-chat
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/open-in-chat.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<details class="rs-open-in-chat rs-disclosure"><summary class="rs-disclosure-summary">Open in chat</summary><ul class="rs-open-in-chat-list"><li><a class="rs-open-in-chat-link" href="https://claude.ai/new?q=Review+the+brief" target="_blank" rel="noopener noreferrer">Claude</a></li></ul></details>
```

## Example

```tsx
import { OpenInChat } from "@noorddev/vlak-react";

<OpenInChat prompt="Review the brief and suggest the next step." providers={["chatgpt", "claude", "cursor"]} />
```

## Props

### OpenInChat

Explicit provider links for a supplied prompt. Nothing leaves the page until a link is activated.

Extends `Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDetailsElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `prompt` (required) | `string` |  |  |
| `providers` | `readonly OpenInChatProvider[]` | `["chatgpt", "claude", "cursor", "scira", "t3", "v0"]` |  |
| `githubUrl` | `string` |  |  |
| `label` | `string` | `"Open in chat"` |  |
| `defaultOpen` | `boolean` | `false` |  |

### Functions

- `openInChatHref` (function): Builds provider handoff links without contacting providers or submitting a conversation.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Reaches the native disclosure and its provider links |
| Enter, Space | Opens or closes provider choices |
| Enter on a link | Opens that provider in a new tab |

## Accessibility

- The disclosure and every provider link have readable names. New-tab behavior is included in link labels.
- Links have 44px minimum height, visible focus and rel=noopener noreferrer.
- Native details attributes and the details ref pass through; CSS-only markup retains native disclosure and links.

## Classes

`rs-open-in-chat`, `rs-open-in-chat-list`, `rs-open-in-chat-link`, `rs-open-in-chat-note`

## Dependencies

Registry dependencies: [collapsible](collapsible.md), [sources](sources.md).  
React: `packages/react/src/components/open-in-chat.tsx`  
CSS: `packages/core/css/components/open-in-chat.css`
