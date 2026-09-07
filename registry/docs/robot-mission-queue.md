# Robot mission queue

Shows supplied mission order and recorded step states, with keyboard reorder requests and explicit host actions separate from pending and confirmed records.

Category: robotics  
Name: `robot-mission-queue`  
Also known as: RobotMissionQueue, Robot task queue, Mission plan, Robot job sequence, Mission steps  
Page: https://vlak.dev/components/robot-mission-queue/

## When to use

- A caller-owned ordered step list, explicit recorded statuses, and only those actions the host makes available.
- onOrderChange receives step identifiers in the proposed order. The host supplies the resulting records; the queue never rewrites status on a reorder request.
- onAction receives a step identifier and supplied action identifier. pending and confirmedLabel remain separate host records.
- Pending steps lock their own actions and adjacent reorder controls. readOnly keeps all request controls disabled.
- Named hidden inputs submit the supplied step identifiers in order; invalid duplicate step or action identifiers suppress ambiguous controls.

## When not to

- Assuming a request starts, cancels, schedules, or confirms physical execution.
- Using display order as an execution dependency graph or deriving allowed actions from a status string.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { RobotMissionQueue } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add robot-mission-queue
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/robot-mission-queue.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-robot-mission-queue"><legend class="rs-robot-mission-queue-legend">Inspection mission</legend><ol class="rs-robot-mission-queue-list"><li class="rs-robot-mission-queue-step"><div class="rs-robot-mission-queue-head"><p class="rs-robot-mission-queue-title">Inspect station</p><p class="rs-robot-mission-queue-status">Recorded: Not started</p></div><div class="rs-robot-mission-queue-actions"><button class="rs-btn-ghost rs-robot-mission-queue-button" type="button" aria-label="Review plan: step 1, Inspect station">Review plan</button></div></li></ol><p class="rs-robot-mission-queue-copy">Reordering and actions request host changes. Reported mission state remains supplied by the host.</p></fieldset>
```

## Example

```tsx
import { RobotMissionQueue } from "@noorddev/vlak-react";

<RobotMissionQueue label="Inspection mission" name="mission"
  steps={[{ id: "inspect", label: "Inspect station", status: "Not started", actions: [{ id: "review", label: "Review plan" }] }, { id: "return", label: "Return to dock", status: "Not started" }]}
  onOrderChange={ids => console.log("Requested order", ids)}
  onAction={(stepId, actionId) => console.log("Requested action", stepId, actionId)} />
```

## Props

### RobotMissionQueue

A supplied mission order, recorded step states, and explicit host request actions.

Extends `FieldsetHTMLAttributes<HTMLFieldSetElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `steps` (required) | `readonly RobotMissionStep[]` |  |  |
| `onOrderChange` | `(stepIds: readonly string[]) => void` |  | Proposed step identifiers in order; the host confirms and supplies the resulting records. |
| `onAction` | `(stepId: string, actionId: string) => void` |  |  |
| `readOnly` | `boolean` | `false` |  |
| `description` | `ReactNode` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through enabled reorder and host-action buttons. |
| Enter, Space | Requests the focused reorder or supplied host action. |

## Accessibility

- The fieldset and legend name the mission, and a native ordered list conveys its supplied order.
- Vlak Button actions name both the step number and label. Reorder buttons state their direction and disable at list boundaries.
- Recorded status, host confirmation, and request-pending text remain distinct; pending feedback uses a status role.
- Action descriptions are connected to the corresponding button, including its recorded status.
- The ref and native fieldset attributes reach the root, and read-only ordered records remain available to forms.

## Classes

`rs-robot-mission-queue`, `rs-robot-mission-queue-legend`, `rs-robot-mission-queue-list`, `rs-robot-mission-queue-step`, `rs-robot-mission-queue-head`, `rs-robot-mission-queue-title`, `rs-robot-mission-queue-copy`, `rs-robot-mission-queue-status`, `rs-robot-mission-queue-actions`, `rs-robot-mission-queue-button`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/robot-mission-queue.tsx`  
CSS: `packages/core/css/components/robot-mission-queue.css`
