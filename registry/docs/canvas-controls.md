# Canvas controls

Adjusts bounded zoom and exposes fit and reset actions for a canvas.

Category: actions  
Name: `canvas-controls`  
Also known as: CanvasControls, Zoom controls, Viewport controls  
Page: https://vlak.dev/components/canvas-controls/

## When to use

- A canvas, diagram, map, or image with application-owned transforms.

## When not to

- Rendering or panning the canvas; these controls emit zoom and action callbacks.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { CanvasControls } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add canvas-controls
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/canvas-controls.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-canvas-controls" role="group" aria-label="Canvas controls"><button class="rs-btn-ghost rs-canvas-action" type="button" aria-label="Zoom out">−</button><output class="rs-canvas-zoom" aria-label="Zoom level">100%</output><button class="rs-btn-ghost rs-canvas-action" type="button" aria-label="Zoom in">+</button></div>
```

## Example

```tsx
import { CanvasControls } from "@noorddev/vlak-react";

<CanvasControls zoom={zoom} onZoomChange={setZoom} minZoom={0.25} maxZoom={4} onFit={fitCanvas} onReset={resetPan} />
```

## Props

### CanvasControls

Zoom, fit, and reset actions for a canvas. The canvas owns pan and rendering.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `zoom` | `number` |  |  |
| `defaultZoom` | `number` | `1` |  |
| `onZoomChange` | `(zoom: number) => void` |  |  |
| `minZoom` | `number` | `0.25` |  |
| `maxZoom` | `number` | `4` |  |
| `step` | `number` | `0.25` |  |
| `onFit` | `() => void` |  |  |
| `onReset` | `() => void` |  |  |
| `disabled` | `boolean` | `false` |  |
| `label` | `string` | `"Canvas controls"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Operates zoom, optional fit, and reset buttons. |

## Accessibility

- Zoom has a visible numeric reading.
- Limits disable the corresponding zoom action.
- All actions keep at least a 44px target.

## Classes

`rs-canvas-controls`, `rs-canvas-action`, `rs-canvas-zoom`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md).  
React: `packages/react/src/components/canvas-controls.tsx`  
CSS: `packages/core/css/components/canvas-controls.css`
