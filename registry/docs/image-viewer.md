# Image viewer

Inspects an image collection with zoom, navigation, and a native dialog lightbox.

Category: patterns  
Name: `image-viewer`  
Also known as: ImageViewer, Lightbox, Image gallery  
Page: https://vlak.dev/components/image-viewer/

## When to use

- Examining a finite collection of labelled images.
- Inline preview with an optional focused lightbox.

## When not to

- Editing pixels or drawing annotations; use an image editor.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ImageViewer } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add image-viewer
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/image-viewer.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-image-viewer" role="region" aria-label="Image viewer"><div class="rs-image-viewer-canvas"><img class="rs-image-viewer-image" src="image.jpg" alt="Describe the image" /></div><p class="rs-image-viewer-caption">Image caption</p></div>
```

## Example

```tsx
import { ImageViewer } from "@noorddev/vlak-react";

<ImageViewer images={[{ src: "/front.jpg", alt: "Front cover", caption: "Front cover" }, { src: "/back.jpg", alt: "Back cover", caption: "Back cover" }]} />
```

## Props

### ImageViewer

Inspect a labelled image collection inline or in a native lightbox.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `images` (required) | `readonly ViewerImage[]` |  |  |
| `value` | `number` |  |  |
| `defaultValue` | `number` | `0` |  |
| `onValueChange` | `(index: number) => void` |  |  |
| `label` | `string` | `"Image viewer"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Arrow left, Arrow right | Changes images when the image canvas is focused. |
| Tab, Enter, Space | Operates image navigation and zoom controls. |
| Escape | Closes the native lightbox and returns focus to its opener. |

## Accessibility

- Each image requires alt text.
- Native dialog supplies modal focus behavior; visible errors replace broken image output.
- Navigation buttons disable at collection boundaries.

## Classes

`rs-image-viewer`, `rs-image-viewer-canvas`, `rs-image-viewer-plane`, `rs-image-viewer-image`, `rs-image-viewer-controls`, `rs-image-viewer-navigation`, `rs-image-viewer-action`, `rs-image-viewer-caption`, `rs-image-viewer-modal`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md), [canvas-controls](canvas-controls.md), [dialog](dialog.md).  
React: `packages/react/src/components/image-viewer.tsx`  
CSS: `packages/core/css/components/image-viewer.css`
