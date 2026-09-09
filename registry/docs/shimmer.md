# Shimmer

A monochrome moving highlight over progress text, with reduced-motion and forced-color fallbacks.

Category: ai  
Name: `shimmer`  
Also known as: Shimmer  
Page: https://vlak.dev/ai/shimmer/

## When to use

- Use short progress text while the application is working. Duration is in seconds; spread is a bounded percentage.
- Set active=false to keep the same text without animation.

## When not to

- Using animation as the only indication of progress.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Shimmer } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add shimmer
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/shimmer.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<span class="rs-shimmer rs-shimmer-active">Reading the brief</span>
```

## Example

```tsx
import { Shimmer } from "@noorddev/vlak-react";

export function ReadingStatus({ streaming }: { streaming: boolean }) {
  return <Shimmer active={streaming}>Reading the brief</Shimmer>;
}
```

## Props

### Shimmer

Animated text for supplied progress. Screen readers receive the text once, without token announcements.

Extends `HTMLAttributes<HTMLSpanElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSpanElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` (required) | `string` |  |  |
| `active` | `boolean` | `true` |  |
| `duration` | `number` | `2` |  |
| `spread` | `number` | `15` |  |

## Accessibility

- Reduced motion and forced colors keep the text static and readable.
- Text remains available to assistive technology; use an application status region for meaningful progress changes.

## Classes

`rs-shimmer`, `rs-shimmer-active`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/shimmer.tsx`  
CSS: `packages/core/css/components/shimmer.css`
