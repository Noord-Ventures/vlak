# Accordion

Reveals related sections on demand. Native details rows with 1px rules.

Category: content  
Name: `accordion`  
Also known as: Accordion, Disclosure group, Expansion panel, FAQ  
Page: https://vlak.dev/components/accordion/

## When to use

- FAQ and settings sections where headings should stay scannable.
- exclusive to keep one item open through the platform's details name grouping.

## When not to

- Hiding content most readers need; put it in the flow.
- A single item; use Collapsible.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Accordion, AccordionItem } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add accordion
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/accordion.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-acc"><details class="rs-acc-item" name="faq" open><summary>What is Vlak?<svg class="rs-acc-chevron" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(90 8 8)"><path d="M5.5 3.5 L10.5 8 L5.5 12.5" vector-effect="non-scaling-stroke"/></g></svg></summary><div class="rs-acc-body">A minimal, CSS-first design system.</div></details><details class="rs-acc-item" name="faq"><summary>Does it require Radix?<svg class="rs-acc-chevron" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(90 8 8)"><path d="M5.5 3.5 L10.5 8 L5.5 12.5" vector-effect="non-scaling-stroke"/></g></svg></summary><div class="rs-acc-body">No. Native elements provide the behavior.</div></details></div>
```

## Example

```tsx
import { Accordion, AccordionItem } from "@noorddev/vlak-react";

<Accordion exclusive>
  <AccordionItem title="What is Vlak?" defaultOpen>
    A minimal, CSS-first design system.
  </AccordionItem>
  <AccordionItem title="Does it require Radix?">
    No. Native elements provide the behavior.
  </AccordionItem>
</Accordion>
```

## Props

### Accordion

Native <details> rows on hairlines.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `exclusive` | `boolean` |  | One item open at a time, via the platform's own `name` grouping. |

### AccordionItem

Extends `Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDetailsElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `ReactNode` |  |  |
| `defaultOpen` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves to the next summary |
| Enter, Space | Opens or closes the item |

## Accessibility

- Each item is a native <details> with a <summary>; the platform exposes the expanded state.
- title is the summary text and the accessible name. Controlled with open and onToggle, or uncontrolled with defaultOpen.

## Classes

`rs-acc`, `rs-acc-item`, `rs-acc-chevron`, `rs-acc-body`, `rs-acc-chevron-open`, `rs-acc-summary`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/accordion.tsx`  
CSS: `packages/core/css/components/accordion.css`
