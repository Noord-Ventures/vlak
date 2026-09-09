# Sheet

Opens a focused task from a screen edge. Native dialog with platform focus handling and backdrop.

Category: surfaces  
Name: `sheet`  
Also known as: Sheet, Side panel, Drawer, Slide-over, Off-canvas  
Page: https://vlak.dev/components/sheet/

## When to use

- Filters, settings, or a detail view that slides in beside the page.
- side="left" for navigation on phones.

## When not to

- Short decisions; use Dialog.
- Content that should stay open while the page is used; the sheet is modal.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Sheet, SheetBody, SheetTitle } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add sheet
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/sheet.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<dialog class="rs-sheet" aria-labelledby="filters-title" open><button class="rs-sheet-close" type="button" aria-label="Close">&times;</button><h2 class="rs-sheet-title" id="filters-title">Filters</h2><p class="rs-sheet-body">Everything narrows from here.</p></dialog>
```

## Example

```tsx
import { useState } from "react";
import { Button, Sheet, SheetBody, SheetTitle } from "@noorddev/vlak-react";

const [open, setOpen] = useState(false);

<Button variant="ghost" onClick={() => setOpen(true)}>Filters</Button>
<Sheet open={open} onClose={() => setOpen(false)} side="right" closeLabel="Close">
  <SheetTitle>Filters</SheetTitle>
  <SheetBody>Everything narrows from here.</SheetBody>
</Sheet>
```

## Props

### Sheet

A native <dialog> at the screen edge. The platform provides the focus trap, Escape, and the backdrop; the title names it.

Extends `Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDialogElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` (required) | `boolean` |  |  |
| `onClose` | `() => void` |  |  |
| `dismissable` | `boolean` |  | Escape (and any other platform close request) asks the parent to close. Off, the dialog must be answered; maps to closedby="none". |
| `lightDismiss` | `boolean` |  | A click on the backdrop closes too; maps to closedby="any". |
| `closeLabel` | `string` |  | Renders a labelled close button in the top corner. |
| `side` | `"left" \| "right"` | `"right"` |  |

### SheetBody

Extends `HTMLAttributes<HTMLParagraphElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLParagraphElement`.

No props of its own.

### SheetTitle

Extends `HTMLAttributes<HTMLHeadingElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLHeadingElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `"div" \| "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "p" \| "span"` | `"h2"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Escape | Calls onClose (when dismissable, the default) |
| Tab, Shift + Tab | Cycles focus inside the sheet |

## Accessibility

- A native modal <dialog> docked to an edge: the platform traps focus and provides the backdrop.
- SheetTitle names it through aria-labelledby; SheetBody describes it. Focus moves in on open and returns on close.
- closeLabel renders a labelled close button; lightDismiss closes on a backdrop click. The ref is forwarded to the <dialog>.

## Classes

`rs-sheet`, `rs-sheet-left`, `rs-sheet-title`, `rs-sheet-body`, `rs-sheet-close`

## Dependencies

Registry dependencies: [dialog](dialog.md).  
React: `packages/react/src/components/sheet.tsx`  
CSS: `packages/core/css/components/sheet.css`
