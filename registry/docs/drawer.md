# Drawer

Opens a focused task from the bottom edge. Native dialog with platform focus handling and backdrop.

Category: surfaces  
Name: `drawer`  
Also known as: Drawer, Bottom sheet, Vaul, Bottom panel  
Page: https://vlak.dev/components/drawer/

## When to use

- Phone-first panels that rise from the bottom edge: options, a share sheet, a short form.
- Content that reads in one screen.

## When not to

- Desktop side panels; use Sheet.
- Long content; the drawer is not a page.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Drawer, DrawerBody, DrawerTitle } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add drawer
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/drawer.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<dialog class="rs-drawer" aria-labelledby="notes-title" open><button class="rs-drawer-close" type="button" aria-label="Close">&times;</button><h2 class="rs-drawer-title" id="notes-title">Notes</h2><p class="rs-drawer-body">A bottom panel. Escape closes it.</p></dialog>
```

## Example

```tsx
import { useState } from "react";
import { Button, Drawer, DrawerBody, DrawerTitle } from "@noorddev/vlak-react";

const [open, setOpen] = useState(false);

<Button variant="ghost" onClick={() => setOpen(true)}>Notes</Button>
<Drawer open={open} onClose={() => setOpen(false)} closeLabel="Close">
  <DrawerTitle>Notes</DrawerTitle>
  <DrawerBody>A bottom panel. Escape closes it.</DrawerBody>
</Drawer>
```

## Props

### Drawer

A native <dialog> from the bottom edge. The platform provides the focus trap, Escape, and the backdrop; the title names it.

Extends `Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDialogElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` (required) | `boolean` |  |  |
| `onClose` | `() => void` |  |  |
| `dismissable` | `boolean` |  | Escape (and any other platform close request) asks the parent to close. Off, the dialog must be answered; maps to closedby="none". |
| `lightDismiss` | `boolean` |  | A click on the backdrop closes too; maps to closedby="any". |
| `closeLabel` | `string` |  | Renders a labelled close button in the top corner. |

### DrawerBody

Extends `HTMLAttributes<HTMLParagraphElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLParagraphElement`.

No props of its own.

### DrawerTitle

Extends `HTMLAttributes<HTMLHeadingElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLHeadingElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `"div" \| "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "p" \| "span"` | `"h2"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Escape | Calls onClose (when dismissable, the default) |
| Tab, Shift + Tab | Cycles focus inside the drawer |

## Accessibility

- A native modal <dialog> from the bottom edge: the platform traps focus and provides the backdrop.
- DrawerTitle names it through aria-labelledby; DrawerBody describes it. Focus moves in on open and returns on close.
- closeLabel renders a labelled close button. The ref is forwarded to the <dialog>.

## Classes

`rs-drawer`, `rs-drawer-title`, `rs-drawer-body`, `rs-drawer-close`

## Dependencies

Registry dependencies: [dialog](dialog.md).  
React: `packages/react/src/components/drawer.tsx`  
CSS: `packages/core/css/components/drawer.css`
