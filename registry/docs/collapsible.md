# Collapsible

Shows or hides one section with a native details disclosure.

Category: content  
Name: `collapsible`  
Also known as: Collapsible, Disclosure, Details, Expander  
Page: https://vlak.dev/components/collapsible/

## When to use

- One optional block the reader can reveal: details, advanced options, a long list.
- defaultOpen when most readers want it open.

## When not to

- Several related sections; use Accordion.
- Content everyone needs; leave it in the flow.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Collapsible } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add collapsible
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/collapsible.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<details class="rs-disclosure"><summary>Show the details<svg class="rs-acc-chevron" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(90 8 8)"><path d="M5.5 3.5 L10.5 8 L5.5 12.5" vector-effect="non-scaling-stroke"/></g></svg></summary><div class="rs-disclosure-body">Here they are.</div></details>
```

## Example

```tsx
import { Collapsible } from "@noorddev/vlak-react";

<Collapsible title="Show the details">Here they are.</Collapsible>
<Collapsible title="Advanced" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>…</Collapsible>
```

## Props

### Collapsible

A bare native <details>.

Extends `Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDetailsElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `ReactNode` |  |  |
| `defaultOpen` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves focus to the summary |
| Enter, Space | Opens or closes it |

## Accessibility

- A native <details> and <summary>; the platform exposes the expanded state and title is the name.

## Classes

`rs-disclosure`, `rs-disclosure-body`, `rs-disclosure-chevron`, `rs-disclosure-chevron-open`, `rs-disclosure-summary`

## Dependencies

Registry dependencies: [accordion](accordion.md).  
React: `packages/react/src/components/collapsible.tsx`  
CSS: `packages/core/css/components/collapsible.css`
