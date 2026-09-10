# Generated image

Displays a supplied generated-image result with alt text and responsive 4px corners.

Category: ai  
Name: `generated-image`  
Also known as: AI Elements Image, Generated image result  
Page: https://vlak.dev/ai/generated-image/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Adapt a provider result containing base64 image bytes and a supported image media type.
- Use native width and height to reserve space. Image generation and fetching remain application-owned.

## When not to

- Omitting meaningful alt text for informative results.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { GeneratedImage } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add generated-image
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/generated-image.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<img class="rs-generated-image" src="/example.png" alt="Generated project diagram" />
```

## Example

```tsx
import { GeneratedImage, type GeneratedImageData } from "@noorddev/vlak-react";

export function WorkflowImage({ image }: { image: GeneratedImageData }) {
  return <GeneratedImage image={image} alt="Project workflow diagram" />;
}
```

## Props

### GeneratedImage

Displays supplied image bytes; image generation remains application-owned.

Extends `Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLImageElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `image` (required) | `GeneratedImageData` |  |  |
| `alt` (required) | `string` |  |  |

## Accessibility

- Native attributes, className, style, and the forwarded ref reach the outer element.
- Interactive content requires accessible names; progress text is not announced for every streamed token.

## Classes

`rs-generated-image`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/generated-image.tsx`  
CSS: `packages/core/css/components/generated-image.css`
