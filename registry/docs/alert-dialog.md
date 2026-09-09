# Alert dialog

Requires a decision before work continues. Native dialog with Escape and light dismiss disabled.

Category: surfaces  
Name: `alert-dialog`  
Also known as: Alert dialog, Confirm dialog, Confirmation, Destructive confirm  
Page: https://vlak.dev/components/alert-dialog/

## When to use

- Destructive or irreversible actions that need an explicit answer.
- Exactly two actions: keep and proceed.

## When not to

- Anything the user may dismiss without answering; use Dialog.
- Informational messages; use Alert or toast.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AlertDialog, AlertDialogActions, AlertDialogBody, AlertDialogTitle } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add alert-dialog
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/alert-dialog.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<dialog class="rs-dialog" role="alertdialog" closedby="none" aria-labelledby="delete-title" aria-describedby="delete-body" open><h2 class="rs-dialog-title" id="delete-title">Delete this workspace?</h2><p class="rs-dialog-body" id="delete-body">All projects go with it.</p><div class="rs-dialog-actions"><button class="rs-btn-ghost rs-btn-sm">Cancel</button><button class="rs-btn-primary rs-btn-sm">Delete</button></div></dialog>
```

## Example

```tsx
import { useState } from "react";
import { AlertDialog, AlertDialogActions, AlertDialogBody, AlertDialogTitle, Button } from "@noorddev/vlak-react";

const [open, setOpen] = useState(false);

<AlertDialog open={open} onClose={() => setOpen(false)}>
  <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
  <AlertDialogBody>All projects go with it.</AlertDialogBody>
  <AlertDialogActions>
    <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Keep it</Button>
    <Button size="sm" onClick={remove}>Delete</Button>
  </AlertDialogActions>
</AlertDialog>
```

## Props

### AlertDialog

A native <dialog> that requires an explicit answer. Escape and light dismiss are off (closedby="none"); the actions close it.

Extends `Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDialogElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` (required) | `boolean` |  |  |
| `onClose` | `() => void` |  |  |
| `extraStyles` | `Leaves` |  | Extra StyleX leaves merged after the dialog frame (command palette). |

### AlertDialogActions

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

### AlertDialogBody

Extends `HTMLAttributes<HTMLParagraphElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLParagraphElement`.

No props of its own.

### AlertDialogTitle

Extends `HTMLAttributes<HTMLHeadingElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLHeadingElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `"div" \| "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "p" \| "span"` | `"h2"` | Heading level. The dialog is named by this element either way. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Shift + Tab | Cycles focus between the actions |
| Enter, Space | Activates the focused action |
| Escape | Does nothing; the dialog must be answered |

## Accessibility

- A native modal <dialog> with role="alertdialog" and closedby="none": Escape and light dismiss are off.
- AlertDialogTitle and AlertDialogBody wire aria-labelledby and aria-describedby like Dialog; focus moves in on open and returns on close.

## Classes

`rs-alert-dialog`

## Dependencies

Registry dependencies: [dialog](dialog.md), [button](button.md).  
React: `packages/react/src/components/alert-dialog.tsx`  
CSS: `packages/core/css/components/alert-dialog.css`
