# Concentric radius

Calculates aligned nested corners. Inner radius = outer − inset, clamped at 0.

Category: surfaces  
Name: `concentric-radius`  
Also known as: Nested radius, Concentric corners, Inner radius  
Page: https://vlak.dev/components/concentric-radius/

## When to use

- Nested rounded boxes whose corners must share a centre.
- innerRadius(outer, pad) computes max(0, outer minus padding) in constant time. Obsolete fit options remain accepted but are ignored.

## When not to

- Square chrome; surfaces are 0 or 4px and rarely nest.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { concentricInner, concentricOuter, innerRadius, Nest, NestInner } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add concentric-radius
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/concentric-radius.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-nest" style="--rs-out:28px;--rs-gap:16px;width:184px"><div class="rs-nest-in"><button class="rs-btn-primary rs-btn-sm">Save</button></div></div>
```

## Example

```tsx
import { Button, Nest, NestInner, innerRadius } from "@noorddev/vlak-react";

<Nest radius={28} pad={16}>
  <NestInner>
    <Button size="sm">Save</Button>
  </NestInner>
</Nest>

innerRadius(28, 16); // 12
```

## Props

### Nest

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `radius` | `number` |  | Outer radius in px. Nested nests inherit the parent inner radius. |
| `pad` | `number` |  | Padding in px. Inset for Steve’s innerRadius. |

### NestInner

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

### Functions

- `concentricInner` (function)
- `concentricOuter` (function)
- `innerRadius` (function): The exact inner circle shares its outer circle's center. No iterative fitting is needed.

## Accessibility

- Layout only. Nest sets --rs-out, --rs-gap, and --rs-in on a <div>.

## Classes

`rs-nest`, `rs-nest-in`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/concentric-radius.tsx`  
CSS: `packages/core/css/components/concentric-radius.css`
