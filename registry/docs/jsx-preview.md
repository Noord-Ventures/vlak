# Jsx preview

Renders registered components and plain data expressions from streamed JSX through an optional parser.

Category: ai  
Name: `jsx-preview`  
Also known as: AI Elements JSX Preview, Generated React preview, JSX widgets  
Page: https://vlak.dev/ai/jsx-preview/

## When to use

- Install the optional react-jsx-parser, acorn and acorn-jsx dependencies and import the component subpath.
- Register trusted display components and pass plain data bindings. Application components own their internal interactive controls.
- Set streaming for simple tag completion and last-valid-content fallback while an expression is incomplete.
- Use fallback/onError for invalid completed source or a registered component that throws.

## When not to

- Treating this component as an arbitrary JavaScript sandbox or exposing side-effectful components that execute operations during render.
- Passing functions, getters, prototype objects or secrets through bindings.
- Expecting function calls, arrow functions, spreads, event attributes, active markup or dynamic link targets to be interpreted. Use application components or an isolated external preview for those cases.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react react-jsx-parser@^2.4.1 acorn@^8.15.0 acorn-jsx@^5.3.2
```

This optional entry point keeps its rendering dependencies out of the core React import.

```tsx
import "@noorddev/vlak-react/css";
import { JSXPreview } from "@noorddev/vlak-react/components/jsx-preview";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add jsx-preview
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/jsx-preview.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-jsx-preview"><div class="rs-jsx-preview-content"><section aria-label="Review summary"><p>3 findings are ready for review.</p></section></div></div>
```

## Example

```tsx
import { JSXPreview } from "@noorddev/vlak-react/components/jsx-preview";

<JSXPreview jsx={'<section aria-label="Review summary"><p>{count} findings are ready.</p></section>'} bindings={{ count: 3 }} />
```

## Props

### JSXPreview

Optional Acorn-validated JSX data renderer. This is not a general JavaScript sandbox.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "children" | "onError">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `jsx` (required) | `string` |  |  |
| `streaming` | `boolean` | `false` |  |
| `components` | `Record<string, ElementType<any, keyof JSX.IntrinsicElements>>` | `{}` | Trusted, display-only application components. Do not expose components that execute operations during render. |
| `bindings` | `Record<string, unknown>` |  | Plain data only. Calls, functions, accessors and prototype access are rejected. |
| `onError` | `(error: Error) => void` |  |  |
| `fallback` | `ReactNode \| ((error: Error) => ReactNode)` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab follows the normal order of controls and safe links produced by registered components. |
| Enter, Space | Keyboard behavior inside a registered component belongs to that component. |

## Accessibility

- Acorn validates the data-expression subset before react-jsx-parser interprets it; no host eval is used.
- Function calls, prototype access, active tags and unsafe attributes are rejected rather than executed.
- Bindings have bounded depth and size and are copied without invoking accessors.
- Invalid completed previews show an alert; streaming updates retain the last valid preview and use a short status message.
- The parser mounts after hydration; styling remains inside a contained 4px surface.

## Classes

`rs-jsx-preview`, `rs-jsx-preview-content`, `rs-jsx-preview-status`, `rs-jsx-preview-error`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/jsx-preview.tsx`  
CSS: `packages/core/css/components/jsx-preview.css`
