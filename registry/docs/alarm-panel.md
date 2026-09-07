# Alarm panel

Industrial alarm records with independent condition, acknowledgement and shelving states, explicit filters and host-confirmed actions.

Category: engineering  
Name: `alarm-panel`  
Also known as: Industrial alarms, Alarm acknowledgement, Alarm shelving, Operator alarm list, Process alarm panel  
Page: https://vlak.dev/components/alarm-panel/

## When to use

- Operator alarm lists with supplied lifecycle fields and explicit unknown values.
- Supply allowed actions and onAction to request acknowledgement, shelving or unshelving. Return pending and then confirmed records from the host.
- Use filter and onFilterChange for an application-owned filter; uncontrolled filtering starts from defaultFilter.
- Provide unique alarm ids, a bounded set of visible records, event time labels and the site's explicit time-zone context.

## When not to

- Treating acknowledgement as clearing a condition, or shelving as acknowledgement.
- Using a displayed action as proof that equipment changed state. The host owns permissions, audit records, filtering of large streams and shelving timers.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AlarmPanel } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add alarm-panel
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/alarm-panel.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-alarm-panel"><p class="rs-alarm-panel-heading">Plant alarms</p><ul class="rs-alarm-panel-list"><li class="rs-alarm-panel-item"><div class="rs-alarm-panel-head">Cooling flow</div><dl class="rs-alarm-panel-states"><div><dt class="rs-alarm-panel-term">Condition</dt><dd class="rs-alarm-panel-value">Cleared</dd></div><div><dt class="rs-alarm-panel-term">Acknowledgement</dt><dd class="rs-alarm-panel-value">Unacknowledged</dd></div><div><dt class="rs-alarm-panel-term">Shelving</dt><dd class="rs-alarm-panel-value">Not shelved</dd></div></dl></li></ul></div>
```

## Example

```tsx
import { AlarmPanel } from "@noorddev/vlak-react";

<AlarmPanel label="Plant alarms" alarms={[
  { id: "flow", label: "Cooling flow", source: "Example circulation loop", priority: "Medium", condition: "cleared", acknowledgement: "unacknowledged", shelving: "unshelved", timeLabel: "14:32, supplied event time" },
  { id: "sensor", label: "Sensor connection", condition: "active", acknowledgement: "acknowledged", shelving: "shelved", shelvedUntilLabel: "15:00, local plant time" },
]} />
```

## Props

### AlarmPanel

An industrial alarm's condition, acknowledgement and shelving are independent records.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `alarms` (required) | `readonly AlarmRecord[]` |  |  |
| `filter` | `AlarmFilter` |  |  |
| `defaultFilter` | `AlarmFilter` | `"all"` |  |
| `onFilterChange` | `(filter: AlarmFilter) => void` |  |  |
| `onAction` | `(id: string, action: AlarmAction) => void` |  | Requests an operation. Update the supplied record only after the host confirms it. |
| `disabled` | `boolean` |  |  |
| `description` | `ReactNode` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through filter buttons and supplied enabled alarm actions. |
| Enter, Space | Applies a filter or requests the focused action. |

## Accessibility

- Each alarm exposes separate condition, acknowledgement and shelving fields as visible text in a description list.
- Pressed filter buttons use a full fill; all controls have 44px targets, visible keyboard focus and forced-colour support.
- A polite record count reflects the current filter. Pending records keep their confirmed state and disable actions.
- The div ref, native attributes, className and style pass through.

## Classes

`rs-alarm-panel`, `rs-alarm-panel-heading`, `rs-alarm-panel-copy`, `rs-alarm-panel-filters`, `rs-alarm-panel-button`, `rs-alarm-panel-selected`, `rs-alarm-panel-list`, `rs-alarm-panel-item`, `rs-alarm-panel-head`, `rs-alarm-panel-states`, `rs-alarm-panel-term`, `rs-alarm-panel-value`, `rs-alarm-panel-actions`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/alarm-panel.tsx`  
CSS: `packages/core/css/components/alarm-panel.css`
