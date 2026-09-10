# Confirmation

Collects approval or rejection in a surface with a subtle 1px outline and 4px corners, with async recording, error recovery, and 44px actions.

Category: ai  
Name: `confirmation`  
Also known as: Confirmation, AI Elements Confirmation, Tool approval, Action approval, Human in the loop  
Page: https://vlak.dev/ai/confirmation/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Reviewing a proposed action before the application proceeds.
- Awaiting successful recording of approval or rejection, with a retry when its callback fails.

## When not to

- Treating approval recorded as proof that the proposed action has executed.
- Authorizing solely in the browser; application and server code must validate the requested action and its permissions.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Confirmation } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add confirmation
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/confirmation.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-confirmation" aria-labelledby="approval-title"><p id="approval-title" class="rs-confirmation-title">Include the appendix?</p><div class="rs-confirmation-context">Adds the supplied appendix to the proposed draft.</div><div class="rs-confirmation-actions"><button class="rs-btn-primary rs-confirmation-action" type="button">Confirm</button><button class="rs-btn-ghost rs-confirmation-action" type="button">Reject</button></div><p class="rs-confirmation-status" role="status">Awaiting your decision</p></section>
```

## Example

```tsx
import { Confirmation } from "@noorddev/vlak-react";

export function AppendixApproval({ recordApproval }: {
  recordApproval: (approved: boolean) => void | Promise<void>;
}) {
  return <Confirmation title="Include the appendix?" onConfirm={() => recordApproval(true)} onReject={() => recordApproval(false)}>
    Adds the supplied appendix to the proposed draft. Review it before continuing.
  </Confirmation>;
}
```

## Props

### Confirmation

Records a decision about an application-owned action without executing a tool.

Extends `Omit<HTMLAttributes<HTMLElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `ReactNode` |  | Names the proposed action and the confirmation region. |
| `status` | `ConfirmationStatus` |  |  |
| `defaultStatus` | `ConfirmationStatus` | `"pending"` |  |
| `onStatusChange` | `(status: Decision) => void` |  |  |
| `onConfirm` (required) | `() => void \| Promise<void>` |  | Records approval. A rejection keeps the proposal pending and allows retry. |
| `onReject` | `() => void \| Promise<void>` |  |  |
| `confirmLabel` | `string` | `"Confirm"` |  |
| `rejectLabel` | `string` | `"Reject"` |  |
| `disabled` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between Confirm and Reject while a decision can be made. |
| Enter, Space | Activates the focused decision or retry button without submitting an enclosing form. |

## Accessibility

- A native section is named by the visible title. Children supply context for the proposed action.
- Pending recording exposes aria-busy, disables both actions, and prevents duplicate callback submissions.
- Only a successful callback records accepted or rejected status. A failed callback leaves the proposal pending, reports an alert, and offers Try again for that decision.
- status and onStatusChange support application-controlled decisions; defaultStatus sets the uncontrolled initial decision. A changed controlled status invalidates an older pending callback result.
- A successfully recorded controlled decision stays locked until status changes. Use a new React key for a new proposal; a pending prop alone cannot resubmit an acknowledged decision.
- The status announces Approval recorded or Rejected. This component records a decision; application code owns tool execution. The ref reaches the section, and native attributes pass through.

## Classes

`rs-confirmation`, `rs-confirmation-title`, `rs-confirmation-context`, `rs-confirmation-actions`, `rs-confirmation-action`, `rs-confirmation-status`, `rs-confirmation-error`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/confirmation.tsx`  
CSS: `packages/core/css/components/confirmation.css`
