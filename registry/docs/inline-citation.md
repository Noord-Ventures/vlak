# Inline citation

A quiet inline source trigger opening a counted, keyboard-navigable preview with links, descriptions and quotes.

Category: ai  
Name: `inline-citation`  
Also known as: AI Elements Inline Citation, Citation card, Source preview, Citation carousel  
Page: https://vlak.dev/ai/inline-citation/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Attach one or more application-supplied sources to a specific claim.
- The count and quote change as the reader navigates sources; index/onIndexChange can make source selection application-owned.
- Use open/onOpenChange or defaultOpen for preview state. Empty source arrays disable the trigger.
- The preview is portaled outside the text paragraph, follows the trigger and stays inside the viewport.
- CSS-only markup provides a named trigger; opening, focus and source navigation require React or application code.

## When not to

- Hiding citations behind pointer-only hover behavior.
- Treating a source card as proof that the application verified the linked content.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { InlineCitation } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add inline-citation
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/inline-citation.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<span class="rs-inline-citation">Read the brief<button class="rs-btn-subtle rs-btn-sm rs-inline-citation-trigger" type="button" aria-label="View 2 sources" aria-haspopup="dialog" aria-expanded="false">[2]</button></span>
```

## Example

```tsx
import { InlineCitation } from "@noorddev/vlak-react";

<p>The brief names an owner for every decision. <InlineCitation sources={[
  { id: "brief", title: "Project brief", url: "https://example.com/brief", quote: "Every decision has an owner." },
  { id: "notes", title: "Review notes", url: "https://example.com/notes", description: "The next review" },
]} /></p>
```

## Props

### InlineCitation

A keyboard-reachable source preview with count, quotes and navigation through multiple citations.

Extends `HTMLAttributes<HTMLSpanElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSpanElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `sources` (required) | `readonly CitationSource[]` |  |  |
| `label` | `string` |  |  |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` | `false` |  |
| `onOpenChange` | `(open: boolean) => void` |  |  |
| `index` | `number` |  |  |
| `defaultIndex` | `number` | `0` |  |
| `onIndexChange` | `(index: number) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Enter, Space | Opens the source dialog or activates its focused control |
| Arrow Left, Arrow Right | Moves through sources, following text direction |
| Home, End | Moves to the first or last source |
| Escape | Closes the preview and restores trigger focus |
| Tab, Shift+Tab | Moves through preview controls and returns to document focus order at its boundaries |

## Accessibility

- The 44px trigger exposes its source count, dialog relationship and expanded state.
- The nonmodal dialog receives focus on open. Its source position uses a status region; boundary navigation remains focusable with aria-disabled.
- Close and Escape restore trigger focus; outside interaction dismisses without stealing focus.
- Links identify new-tab behavior. Native span attributes, class/style and the span ref are forwarded.

## Classes

`rs-inline-citation`, `rs-inline-citation-trigger`, `rs-inline-citation-panel`, `rs-inline-citation-header`, `rs-inline-citation-navigation`, `rs-inline-citation-count`, `rs-inline-citation-title`, `rs-inline-citation-link`, `rs-inline-citation-description`, `rs-inline-citation-quote`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md), [sources](sources.md).  
React: `packages/react/src/components/inline-citation.tsx`  
CSS: `packages/core/css/components/inline-citation.css`
