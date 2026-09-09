# Suggestions

A wrapping or horizontally scrollable collection of prompt buttons with subtle outlines and 4px corners.

Category: ai  
Name: `suggestions`  
Also known as: AI Elements Suggestion, Suggested prompts  
Page: https://vlak.dev/ai/suggestions/

## When to use

- Offer short suggested prompts using value and onSelect. Display text may be shorter than the submitted value.
- The collection scrolls horizontally by default; wrap places buttons on multiple lines.

## When not to

- Making suggestions look like completed or submitted messages.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Suggestion, Suggestions } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add suggestions
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/suggestions.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-suggestions" role="group" aria-label="Suggested prompts"><button class="rs-suggestions-item rs-btn-ghost" type="button">Review the brief</button></div>
```

## Example

```tsx
"use client";
import { useState } from "react";
import { MessageComposer, Suggestions, Suggestion, type ComposedMessage } from "@noorddev/vlak-react";

export function SuggestedPrompts({ onSend }: { onSend: (message: ComposedMessage) => void | Promise<void> }) {
  const [draft, setDraft] = useState("");
  return <>
    <Suggestions wrap>
      <Suggestion value="Review the launch brief" onSelect={setDraft}>Review brief</Suggestion>
      <Suggestion value="Find missing owners" onSelect={setDraft} />
    </Suggestions>
    <MessageComposer compact value={draft} onValueChange={setDraft} onSend={onSend} />
  </>;
}
```

## Props

### Suggestion

Extends `ButtonHTMLAttributes<HTMLButtonElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "ghost" \| "subtle"` |  | Solid ink primary, hairline ghost, or borderless subtle. One primary per view. |
| `size` | `"default" \| "sm" \| "icon"` |  | Icon buttons stay square at every breakpoint. Supply an accessible name. |
| `grouped` | `boolean` |  | Flush into a ButtonGroup: no own stroke, one ink seam. |
| `value` (required) | `string` |  |  |
| `onSelect` | `(value: string) => void` |  |  |

### Suggestions

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `wrap` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the supplied native controls in reading order |
| Enter, Space | Activates focused buttons and disclosure summaries |

## Accessibility

- Native attributes, className, style, and the forwarded ref reach the outer element.
- Interactive content requires accessible names; progress text is not announced for every streamed token.

## Classes

`rs-suggestions`, `rs-suggestions-wrap`, `rs-suggestions-item`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/suggestions.tsx`  
CSS: `packages/core/css/components/suggestions.css`
