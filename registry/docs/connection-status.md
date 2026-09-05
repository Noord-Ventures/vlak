# Connection status

Communicates connecting, connected, offline, and reconnecting states.

Category: feedback  
Name: `connection-status`  
Also known as: ConnectionStatus  
Page: https://vlak.dev/components/connection-status/

## When to use

- Network-dependent controls and synchronization status.

## When not to

- Inferring server connectivity from browser online status alone.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ConnectionStatus } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add connection-status
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/connection-status.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-connection-status"><span class="rs-connection-status-label" role="status">Connected</span><span class="rs-connection-status-detail">Changes are synchronized</span></div>
```

## Example

```tsx
import { ConnectionStatus } from "@noorddev/vlak-react";

<ConnectionStatus state="connected" description="Changes are synchronized" />
```

## Props

### ConnectionStatus

Application-supplied connection state. A successful retry does not assume reconnection.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `state` (required) | `ConnectionState` |  |  |
| `label` | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `onRetry` | `() => void \| Promise<void>` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Tab reaches retry when offline and a callback is supplied; Enter or Space retries. |

## Accessibility

- State is visible text announced politely. Retry completion does not assume the connection recovered.

## Classes

`rs-connection-status`, `rs-connection-status-label`, `rs-connection-status-detail`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md).  
React: `packages/react/src/components/connection-status.tsx`  
CSS: `packages/core/css/components/connection-status.css`
