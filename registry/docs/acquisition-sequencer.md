# Acquisition sequencer

Edits supplied capture steps, exact exposure, time, depth and channel values, and distinguishes requested actions from recorded run state.

Category: science  
Name: `acquisition-sequencer`  
Also known as: Capture sequence, Microscopy acquisition plan, Time-lapse plan, Capture step editor, Instrument run plan  
Page: https://vlak.dev/components/acquisition-sequencer/

## When to use

- Editing and reordering an existing capture plan with onStepsChange.
- Pass exact values and units from the acquisition application; the component performs no conversions or scheduling.
- Use explicit step actions and onAction to request operations. Supply pending and confirmedLabel from actual host state.

## When not to

- Treating an edit or action callback as proof that capture ran successfully.
- Deriving instrument settings or executing acquisition. The host owns commands, persistence and confirmations.
- More than 128 steps or 128 channels.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AcquisitionSequencer } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add acquisition-sequencer
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/acquisition-sequencer.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-acquisition-sequencer"><legend class="rs-acquisition-sequencer-legend">Capture plan</legend><ol class="rs-acquisition-sequencer-list"><li class="rs-acquisition-sequencer-step"><div class="rs-acquisition-sequencer-head"><span class="rs-acquisition-sequencer-title">First plane</span><span class="rs-acquisition-sequencer-copy">Not run</span></div><p class="rs-acquisition-sequencer-value">Exposure 10 ms · Time offset 0 s · Depth -1 µm · Phase</p></li></ol></fieldset>
```

## Example

```tsx
import { useState } from "react";
import { AcquisitionSequencer } from "@noorddev/vlak-react";
import type { AcquisitionStep } from "@noorddev/vlak-react";

function CapturePlan() {
  const [steps, setSteps] = useState<readonly AcquisitionStep[]>([
    { id: "first", label: "First plane", exposure: 10, exposureUnit: "ms", time: 0, timeUnit: "s", depth: -1, depthUnit: "µm", channel: "phase", status: "Not run" },
    { id: "second", label: "Second plane", exposure: 10, exposureUnit: "ms", time: 5, timeUnit: "s", depth: 0, depthUnit: "µm", channel: "phase", status: "Not run" },
  ]);
  return <AcquisitionSequencer label="Capture plan" channels={[{ id: "phase", label: "Phase" }]} steps={steps} onStepsChange={setSteps} />;
}
```

## Props

### AcquisitionSequencer

A controlled capture plan editor and recorded-state display, without an acquisition engine.

Extends `FieldsetHTMLAttributes<HTMLFieldSetElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `steps` (required) | `readonly AcquisitionStep[]` |  |  |
| `channels` (required) | `readonly AcquisitionChannel[]` |  |  |
| `onStepsChange` | `(steps: readonly AcquisitionStep[]) => void` |  |  |
| `onAction` | `(stepId: string, actionId: string) => void` |  |  |
| `description` | `ReactNode` |  |  |
| `readOnly` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through enabled numeric inputs, channel selectors and step actions. |
| Arrow keys, Home, End, typing | Edits native numeric fields or navigates the opened channel list. |
| Enter, Space | Confirms the active channel option or requests the focused action or reorder. |
| Escape | Closes the channel list without changing the supplied selection. |

## Accessibility

- Step fields and action names include the step number and label, preventing ambiguity between repeated capture names.
- Exposure and time offsets use a native non-negative minimum; signed depth values and all supplied units are preserved.
- Pending steps disable editing and actions while their last recorded state remains visible.
- Controls have 44px targets. Controlled native inputs retain the supplied plan through form resets.
- The fieldset ref and native attributes pass through; no callback is interpreted as an actual run confirmation.
- Generic controls compose the shared Input, Select and Button primitives; the native numeric fields and Select backing control preserve form values.

## Classes

`rs-acquisition-sequencer`, `rs-acquisition-sequencer-legend`, `rs-acquisition-sequencer-list`, `rs-acquisition-sequencer-step`, `rs-acquisition-sequencer-head`, `rs-acquisition-sequencer-title`, `rs-acquisition-sequencer-fields`, `rs-acquisition-sequencer-label`, `rs-acquisition-sequencer-control`, `rs-acquisition-sequencer-value`, `rs-acquisition-sequencer-copy`, `rs-acquisition-sequencer-actions`, `rs-acquisition-sequencer-action`

## Dependencies

Registry dependencies: [button](button.md), [input](input.md), [select](select.md).  
React: `packages/react/src/components/acquisition-sequencer.tsx`  
CSS: `packages/core/css/components/acquisition-sequencer.css`
