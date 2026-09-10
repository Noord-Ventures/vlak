# iOS sheet

A native modal bottom sheet with a centered title, grabber and deliberate entrance.

Category: ios  
Name: `ios-sheet`  
Also known as: UISheetPresentationController, iOS bottom sheet, iOS modal sheet  
Page: https://vlak.dev/components/ios-sheet/

## When to use

- A focused modal task presented from the bottom edge.
- Keep the sheet mounted to preserve form drafts while closed.

## When not to

- Claiming the grabber is draggable; it is a visual indicator.
- Using a modal for ordinary page navigation or passive status.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { IOSSheet } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add ios-sheet
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/ios-sheet.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<dialog class="rs-ios-sheet" aria-labelledby="sheet-title"><div class="rs-ios-sheet-handle" aria-hidden="true"></div><header class="rs-ios-sheet-header"><span></span><h2 class="rs-ios-sheet-title" id="sheet-title">Edit note</h2><button class="rs-ios-sheet-close" type="button" aria-label="Close sheet">×</button></header><div class="rs-ios-sheet-body">Note content</div></dialog>
```

## Example

```tsx
import { IOSSheet } from "@noorddev/vlak-react";

<IOSSheet title="Edit note" open={open} onOpenChange={setOpen} description="Changes stay on this device."><form id="note-editor">…</form></IOSSheet>
```

## Props

### IOSSheet

A modal bottom sheet. The platform owns the focus trap and top layer.

Extends `Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose" | "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDialogElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` | `false` |  |
| `onOpenChange` | `(open: boolean) => void` |  |  |
| `onClose` | `() => void` |  |  |
| `title` (required) | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `closeLabel` | `string` | `"Close sheet"` |  |
| `dismissable` | `boolean` | `true` |  |
| `lightDismiss` | `boolean` | `true` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Shift+Tab | Uses the native modal focus trap. |
| Escape | Requests closing unless dismissable is false or onCancel prevents it. |
| Enter, Space on Close | Closes a dismissable sheet and restores its trigger when still available. |

## Accessibility

- The native dialog is named by its title and optionally described by its description.
- Focus restores on close and unmount; reduced motion removes the entrance animation. Nondismissable sheets omit the close control.

## Classes

`rs-ios-sheet`, `rs-ios-sheet-open`, `rs-ios-sheet-handle`, `rs-ios-sheet-header`, `rs-ios-sheet-title`, `rs-ios-sheet-close`, `rs-ios-sheet-body`, `rs-ios-sheet-description`

## Dependencies

Registry dependencies: [icons](icons.md).  
React: `packages/react/src/components/ios-sheet.tsx`  
CSS: `packages/core/css/components/ios-sheet.css`
