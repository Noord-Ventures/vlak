# Artifact

Frames generated content with header actions, an optional scroll region and a close request.

Category: ai  
Name: `artifact`  
Also known as: AI Elements Artifact, Generated document, Artifact panel  
Page: https://vlak.dev/ai/artifact/

## When to use

- Generated documents, code or previews with actions placed in their header.
- Pass onClose to request dismissal; the application controls visibility and restores focus to the opener.
- Set maxHeight to create a keyboard-reachable scroll region for long content.

## When not to

- Treating the container as a renderer or code execution environment.
- Removing the view after close without returning focus to a useful control.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Artifact } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add artifact
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/artifact.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-artifact" aria-labelledby="artifact-title"><header class="rs-artifact-header"><div class="rs-artifact-heading"><span class="rs-artifact-title" id="artifact-title">Review notes</span><div class="rs-artifact-description">Draft 1</div></div></header><div class="rs-artifact-content"><p>Retain the original draft when sending fails.</p></div><footer class="rs-artifact-footer">Local draft</footer></section>
```

## Example

```tsx
import { Artifact, Button } from "@noorddev/vlak-react";

export function ReviewArtifact({ onRevise }: { onRevise: () => void }) {
  return <Artifact title="Review notes" description="Draft 1" maxHeight="20rem" actions={<Button variant="subtle" onClick={onRevise}>Revise draft</Button>} footer="Local draft">
    <p>Retain the original draft when sending fails.</p>
  </Artifact>;
}
```

## Props

### Artifact

Generated content with header actions, a close request and an optional scroll region.

Extends `Omit<HTMLAttributes<HTMLElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `actions` | `ReactNode` |  |  |
| `footer` | `ReactNode` |  |  |
| `onClose` | `() => void` |  | Requests closing; the application owns visibility and focus restoration. |
| `closeLabel` | `string` | `"Close artifact"` |  |
| `maxHeight` | `Property.MaxHeight<string \| number>` |  | Optional height cap for long generated content. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab reaches supplied actions, the labelled close control and a height-limited content region. |
| Enter, Space | Enter or Space activates the focused button. |

## Accessibility

- A section is named by its visible title, unless a custom accessible name is supplied.
- The close control uses an icon, a descriptive accessible label and a 44px target.
- Content remains mounted until the application accepts the close request.

## Classes

`rs-artifact`, `rs-artifact-header`, `rs-artifact-heading`, `rs-artifact-title`, `rs-artifact-description`, `rs-artifact-actions`, `rs-artifact-content`, `rs-artifact-footer`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md).  
React: `packages/react/src/components/artifact.tsx`  
CSS: `packages/core/css/components/artifact.css`
