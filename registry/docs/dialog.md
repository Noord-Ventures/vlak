# Dialog

Focuses attention on a modal task. Title, body, and two equal actions.

Category: surfaces  
Name: `dialog`  
Also known as: Dialog, Modal, Modal dialog  
Page: https://vlak.dev/components/dialog/

## When to use

- A short decision or a form that must finish before the page continues.
- One title, one sentence of body, two equal actions.

## When not to

- Content the user should keep the page in view for; use Sheet or Popover.
- Destructive confirmations that must not dismiss on Escape; use AlertDialog.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add dialog
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/dialog.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-dialog" role="dialog" aria-labelledby="remove-title" aria-describedby="remove-body"><h2 class="rs-dialog-title" id="remove-title">Remove this item?</h2><p class="rs-dialog-body" id="remove-body">This can't be undone.</p><div class="rs-dialog-actions"><button class="rs-btn-ghost rs-btn-sm">Cancel</button><button class="rs-btn-primary rs-btn-sm">Remove</button></div></div>
```

## Example

```tsx
import { useState } from "react";
import { Button, Dialog, DialogActions, DialogBody, DialogTitle } from "@noorddev/vlak-react";

const [open, setOpen] = useState(false);

<Button variant="ghost" onClick={() => setOpen(true)}>Remove</Button>
<Dialog open={open} onClose={() => setOpen(false)} closeLabel="Close">
  <DialogTitle>Remove this item?</DialogTitle>
  <DialogBody>This can't be undone.</DialogBody>
  <DialogActions>
    <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
    <Button size="sm" onClick={remove}>Remove</Button>
  </DialogActions>
</Dialog>
```

## Props

### Dialog

A native <dialog>. Focus trapping, Escape, and the backdrop come from the platform; the title names it and the body describes it.

Extends `Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDialogElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` (required) | `boolean` |  |  |
| `onClose` | `() => void` |  |  |
| `dismissable` | `boolean` |  | Escape (and any other platform close request) asks the parent to close. Off, the dialog must be answered; maps to closedby="none". |
| `lightDismiss` | `boolean` |  | A click on the backdrop closes too; maps to closedby="any". |
| `closeLabel` | `string` |  | Renders a labelled close button in the top corner. |
| `extraStyles` | `Leaves` |  | Extra StyleX leaves merged after the dialog frame (command palette). |

### DialogActions

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

### DialogBody

Extends `HTMLAttributes<HTMLParagraphElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLParagraphElement`.

No props of its own.

### DialogTitle

Extends `HTMLAttributes<HTMLHeadingElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLHeadingElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `"div" \| "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "p" \| "span"` | `"h2"` | Heading level. The dialog is named by this element either way. |

## Keyboard

| Keys | Does |
| --- | --- |
| Escape | Calls onClose (when dismissable, the default) |
| Tab, Shift + Tab | Cycles focus inside the open dialog |
| Enter, Space | Activates the focused action |

## Accessibility

- A native <dialog> opened with showModal(): the platform traps focus, provides the backdrop, and handles Escape.
- DialogTitle (an h2 by default) names it through aria-labelledby; DialogBody describes it through aria-describedby, only while mounted.
- On open, focus moves to [autofocus] or the first focusable element; on close it returns to the element that opened it.
- dismissable={false} maps to closedby="none"; lightDismiss adds a click on the backdrop. closeLabel renders a labelled close button. The ref is forwarded to the <dialog>.

## Classes

`rs-dialog`, `rs-dialog-title`, `rs-dialog-body`, `rs-dialog-actions`, `rs-dialog-close`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/dialog.tsx`  
CSS: `packages/core/css/components/dialog.css`
