# Android bottom sheet

A native modal bottom sheet with Material geometry, accessible naming and focus restoration.

Category: android  
Name: `android-sheet`  
Also known as: Material modal bottom sheet, Android bottom sheet, modal sheet  
Page: https://vlak.dev/components/android-sheet/

## When to use

- Contextual Android controls that temporarily cover the lower screen.
- A focused choice or short task with a clear way to dismiss it.

## When not to

- Permanent side navigation or long documents.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AndroidSheet, AndroidSheetBody, AndroidSheetTitle } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add android-sheet
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/android-sheet.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<dialog class="rs-android-sheet" aria-labelledby="android-sheet-title"><span class="rs-android-sheet-handle" aria-hidden="true"></span><button class="rs-android-sheet-close" type="button" aria-label="Close">×</button><h2 class="rs-android-sheet-title" id="android-sheet-title">Connection settings</h2><p class="rs-android-sheet-body">Choose how this device connects.</p></dialog>
```

## Example

```tsx
import { AndroidSheet, AndroidSheetTitle, AndroidSheetBody } from "@noorddev/vlak-react";

<AndroidSheet open={open} onOpenChange={setOpen}>
  <AndroidSheetTitle>Connection settings</AndroidSheetTitle>
  <AndroidSheetBody>Choose how this device connects.</AndroidSheetBody>
</AndroidSheet>
```

## Props

### AndroidSheet

Extends `Omit< DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose" >`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDialogElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` | `false` |  |
| `onOpenChange` | `(open: boolean) => void` |  |  |
| `onClose` | `() => void` |  |  |
| `dismissable` | `boolean` | `true` |  |
| `lightDismiss` | `boolean` | `true` |  |
| `closeLabel` | `string` | `"Close"` |  |

### AndroidSheetBody

Extends `HTMLAttributes<HTMLParagraphElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLParagraphElement`.

No props of its own.

### AndroidSheetTitle

Extends `HTMLAttributes<HTMLHeadingElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLHeadingElement`.

No props of its own.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab or Shift+Tab | Moves through the modal's controls using native dialog focus containment. |
| Escape | Requests dismissal when dismissable is enabled. |
| Enter or Space | Activates the focused control. |

## Accessibility

- Native dialog showModal supplies the top layer, inert background and focus containment.
- Title and body parts connect aria-labelledby and aria-describedby automatically.
- Closing returns focus to the connected opener.
- The handle is decorative; this sheet does not promise a drag gesture.
- Supports controlled open state or defaultOpen; onOpenChange reports dismissal.

## Classes

`rs-android-sheet`, `rs-android-sheet-open`, `rs-android-sheet-handle`, `rs-android-sheet-close`, `rs-android-sheet-title`, `rs-android-sheet-body`

## Dependencies

Registry dependencies: [dialog](dialog.md), [icons](icons.md).  
React: `packages/react/src/components/android-sheet.tsx`  
CSS: `packages/core/css/components/android-sheet.css`
