# Notification center

Keeps persistent notifications with read, unread, action, and dismissal state.

Category: feedback  
Name: `notification-center`  
Also known as: NotificationCenter  
Page: https://vlak.dev/components/notification-center/

## When to use

- An inbox of persistent application notifications.

## When not to

- Ephemeral confirmation; use Toast.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { NotificationCenter } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add notification-center
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/notification-center.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-notification-center" aria-label="Notifications"><ul class="rs-notification-center-list"><li class="rs-notification-center-item rs-notification-center-unread"><h3 class="rs-notification-center-title">Export ready</h3><p class="rs-notification-center-detail">Unread</p></li></ul></section>
```

## Example

```tsx
import { NotificationCenter } from "@noorddev/vlak-react";

<NotificationCenter defaultValue={[{ id: "export", title: "Export ready", description: "Your study is ready to download" }, { id: "invite", title: "Studio invitation", read: true }]} />
```

## Props

### NotificationCenter

Persistent notifications with controlled read/unread and dismissal state.

Extends `Omit<HTMLAttributes<HTMLElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `NotificationItem[]` |  |  |
| `defaultValue` | `NotificationItem[]` | `[]` |  |
| `onValueChange` | `(items: NotificationItem[]) => void` |  |  |
| `label` | `string` | `"Notifications"` |  |
| `emptyLabel` | `string` | `"You're up to date"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Tab reaches read, action, and dismiss buttons; Enter or Space activates. |

## Accessibility

- Unread state is also exposed in text and control names. User changes are announced through a polite status.

## Classes

`rs-notification-center`, `rs-notification-center-header`, `rs-notification-center-title`, `rs-notification-center-list`, `rs-notification-center-item`, `rs-notification-center-unread`, `rs-notification-center-detail`, `rs-notification-center-actions`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/notification-center.tsx`  
CSS: `packages/core/css/components/notification-center.css`
