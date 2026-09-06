# Care plan

Lists supplied care tasks, owners, due labels, and statuses with controlled completion requests.

Category: health  
Name: `care-plan`  
Also known as: CarePlan, Care tasks, Patient checklist, Care coordination, Treatment task list  
Page: https://vlak.dev/components/care-plan/

## When to use

- Existing care plans with named owners and application-supplied deadlines and task status.
- Supply an explicit completed boolean and onCompletedChange to enable a completion control.

## When not to

- Generating treatment plans or deriving task urgency from dates.
- Treating an unknown completion state as unchecked or showing success before the caller updates the record.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { CarePlan } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add care-plan
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/care-plan.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-care-plan" role="group" aria-label="Care plan"><ul class="rs-care-plan-list"><li class="rs-care-plan-row"><p class="rs-care-plan-title">Confirm the next visit</p><dl class="rs-care-plan-metadata"><div class="rs-care-plan-field"><dt class="rs-care-plan-label">Owner</dt><dd class="rs-care-plan-value">Robin Ellis</dd></div><div class="rs-care-plan-field"><dt class="rs-care-plan-label">Due</dt><dd class="rs-care-plan-value">17 September</dd></div><div class="rs-care-plan-field"><dt class="rs-care-plan-label">Status</dt><dd class="rs-care-plan-value">Open</dd></div></dl></li></ul></div>
```

## Example

```tsx
import { CarePlan } from "@noorddev/vlak-react";

<CarePlan tasks={[{ id: "visit", title: "Confirm the next visit", owner: "Robin Ellis", dueLabel: "17 September", status: "Open", completed: false }]} />

// Pass onCompletedChange(taskId, completed) to request changes.
// The caller persists completion and supplies updated tasks and pending states.
```

## Props

### CarePlan

A supplied care task list with controlled completion requests and explicit pending states.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tasks` (required) | `readonly CarePlanTask[]` |  |  |
| `description` | `ReactNode` |  |  |
| `emptyLabel` | `ReactNode` | `"No care tasks supplied"` |  |
| `onCompletedChange` | `(taskId: string, completed: boolean) => void` |  | Requests a change only. Persist it and return updated tasks from the caller. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between enabled completion checkboxes when editing is available. |
| Space | Requests a completion change through onCompletedChange. The checkbox stays at the supplied value until the caller updates it. |

## Accessibility

- Task labels name native checkboxes with at least 44px label targets; the recorded status describes each checkbox.
- Pending or disabled tasks cannot be changed. Pending text is visible in a polite status region with aria-busy on the task.
- Tasks with unknown completion or no change callback render as static text, without an invented checkbox state.
- Owner and due-date omissions are explicitly marked as not supplied. Dates are never parsed or inferred.

## Classes

`rs-care-plan`, `rs-care-plan-description`, `rs-care-plan-list`, `rs-care-plan-row`, `rs-care-plan-title`, `rs-care-plan-check`, `rs-care-plan-detail`, `rs-care-plan-metadata`, `rs-care-plan-field`, `rs-care-plan-label`, `rs-care-plan-value`, `rs-care-plan-pending`, `rs-care-plan-empty`

## Dependencies

Registry dependencies: [checkbox](checkbox.md).  
React: `packages/react/src/components/care-plan.tsx`  
CSS: `packages/core/css/components/care-plan.css`
