# Layer stack

Manages supplied layer selection, visibility, locking, and order through named 44px controls and caller-owned changes.

Category: creative  
Name: `layer-stack`  
Also known as: LayerStack, Layers panel, Layer list, Layer inspector, Object stack  
Page: https://vlak.dev/components/layer-stack/

## When to use

- Top-to-bottom layer order for a graphics, audio, or video editor.
- onLayersChange receives the proposed array; the application applies it and owns persistence.
- onSelect independently controls selection; locked layers cannot use their move actions.

## When not to

- Implying drag-and-drop support or modifying document content behind the host's back.
- Rendering state-changing controls without onLayersChange.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { LayerStack } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add layer-stack
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/layer-stack.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-layer-stack"><p class="rs-layer-stack-label">Layers</p><ol class="rs-layer-stack-list"><li class="rs-layer-stack-row"><span>Title</span><span class="rs-layer-stack-note">Visible · Unlocked</span></li><li class="rs-layer-stack-row"><span>Background</span><span class="rs-layer-stack-note">Visible · Locked</span></li></ol></div>
```

## Example

```tsx
import { useState } from "react";
import { LayerStack } from "@noorddev/vlak-react";
import type { CreativeLayer } from "@noorddev/vlak-react";

function Layers() {
  const [layers, setLayers] = useState<CreativeLayer[]>([{ id: "title", label: "Title", visible: true, locked: false }, { id: "background", label: "Background", visible: true, locked: true }]);
  const [selected, setSelected] = useState<string | null>(null);
  return <LayerStack label="Layers" layers={layers} selectedId={selected} onSelect={setSelected} onLayersChange={setLayers} />;
}
```

## Props

### LayerStack

A controlled layer order with explicit selection, visibility, lock and move actions.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onSelect">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `layers` (required) | `CreativeLayer[]` |  | Ordered from top to bottom. |
| `selectedId` | `string \| null` |  |  |
| `onSelect` | `(id: string) => void` |  |  |
| `onLayersChange` | `(layers: CreativeLayer[]) => void` |  |  |
| `disabled` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through available layer selection and Vlak visibility, lock, and move buttons. |
| Enter, Space | Requests the focused action; move buttons reorder one position when allowed. |

## Accessibility

- An ordered list preserves the supplied layer order, with visible status text for visibility and locking.
- Selection, visibility, and lock controls have stable names and pressed states.
- Move actions name their layer, disable at boundaries or when locked, and avoid a drag-only workflow.
- All actions have 44px targets; the ref and native attributes reach the root div.

## Classes

`rs-layer-stack`, `rs-layer-stack-label`, `rs-layer-stack-list`, `rs-layer-stack-row`, `rs-layer-stack-actions`, `rs-layer-stack-action`, `rs-layer-stack-button`, `rs-layer-stack-selected`, `rs-layer-stack-note`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/layer-stack.tsx`  
CSS: `packages/core/css/components/layer-stack.css`
