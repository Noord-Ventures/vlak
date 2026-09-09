# Checkpoint

A conversation marker with an async restore action, retry feedback, and stable cancellation.

Category: ai  
Name: `checkpoint`  
Also known as: Checkpoint  
Page: https://vlak.dev/ai/checkpoint/

## When to use

- Mark a saved point in history and supply onRestore to restore it.
- A rejected promise keeps the restore action available and explains the failure.

## When not to

- Assuming the component saves model or tool state. The application owns persistence and restoration.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Checkpoint } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add checkpoint
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/checkpoint.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-checkpoint"><span class="rs-checkpoint-line"></span><span>Before editing</span><button class="rs-btn-subtle" type="button">Restore checkpoint</button><span class="rs-checkpoint-line"></span></div>
```

## Example

```tsx
import { Checkpoint } from "@noorddev/vlak-react";

export function SavedCheckpoint({ onRestore }: { onRestore: () => void | Promise<void> }) {
  return <Checkpoint label="Before editing" onRestore={onRestore} />;
}
```

## Props

### Checkpoint

A restore marker. The application owns saved history and the async restore operation.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onError">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `onRestore` | `() => void \| Promise<void>` |  |  |
| `restoreLabel` | `string` | `"Restore checkpoint"` |  |
| `disabled` | `boolean` |  |  |
| `onError` | `(error: unknown) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the supplied native controls in reading order |
| Enter, Space | Activates focused buttons and disclosure summaries |

## Accessibility

- Native attributes, className, style, and the forwarded ref reach the outer element.
- Interactive content requires accessible names; progress text is not announced for every streamed token.

## Classes

`rs-checkpoint`, `rs-checkpoint-line`, `rs-checkpoint-error`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/checkpoint.tsx`  
CSS: `packages/core/css/components/checkpoint.css`
