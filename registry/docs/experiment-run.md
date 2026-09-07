# Experiment run

Supplied experiment metadata, conditions and ordered protocol steps with explicit statuses and controlled recording actions.

Category: science  
Name: `experiment-run`  
Also known as: Protocol run, Lab notebook run, Experiment record, Acquisition workflow, Scientific workflow  
Page: https://vlak.dev/components/experiment-run/

## When to use

- Lab notebooks, acquisition workspaces and protocol review with supplied run state.
- Pass explicit step actions and onAction to request changes; update supplied statuses after persistence.
- Keep protocol links, conditions and step details with the run they describe.

## When not to

- Inferring completion, experimental validity or the next scientific procedure.
- Treating an action request as proof that an instrument ran or that data was saved.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ExperimentRun } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add experiment-run
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/experiment-run.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-experiment-run" role="group" aria-label="Optical measurement"><div class="rs-experiment-run-head"><p class="rs-experiment-run-title">Optical measurement</p><span class="rs-experiment-run-context">Awaiting review</span></div><p class="rs-experiment-run-context">Run 042</p><ol class="rs-experiment-run-list"><li class="rs-experiment-run-step"><div class="rs-experiment-run-head"><span>Review acquisition</span><span class="rs-experiment-run-context">Not reviewed</span></div></li></ol></div>
```

## Example

```tsx
import { ExperimentRun } from "@noorddev/vlak-react";

<ExperimentRun label="Optical measurement" runId="042" protocol="Protocol revision 3" status="Awaiting review" conditions={[{ id: "temperature", label: "Recorded temperature", value: "21.4 °C" }]} steps={[
  { id: "acquisition", label: "Acquire readings", status: "Recorded", details: "Data file supplied by the instrument" },
  { id: "review", label: "Review acquisition", status: "Not reviewed" },
]} />
```

## Props

### ExperimentRun

Supplied run metadata and protocol steps, with application-owned transitions.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `runId` | `string` |  |  |
| `protocol` | `ReactNode` |  |  |
| `status` (required) | `string` |  |  |
| `conditions` | `readonly ExperimentCondition[]` | `[]` |  |
| `steps` (required) | `readonly ExperimentStep[]` |  |  |
| `onAction` | `(stepId: string, actionId: string) => void` |  | Requests an explicit action. State remains supplied by the application. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between supplied links and enabled step actions. |
| Enter, Space | Requests the focused step action through onAction. |

## Accessibility

- A named group contains conditions as a description list and steps as an ordered list.
- Action names include their step number and label; the current step status is their accessible description.
- Pending steps keep their recorded state, show pending text and disable actions. No internal success state is invented.
- Zero-valued conditions remain visible and missing conditions are explicitly labelled. Buttons are at least 44px with visible focus rings.
- The root div forwards native attributes and its ref.

## Classes

`rs-experiment-run`, `rs-experiment-run-head`, `rs-experiment-run-title`, `rs-experiment-run-context`, `rs-experiment-run-conditions`, `rs-experiment-run-value`, `rs-experiment-run-list`, `rs-experiment-run-step`, `rs-experiment-run-details`, `rs-experiment-run-actions`, `rs-experiment-run-action`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/experiment-run.tsx`  
CSS: `packages/core/css/components/experiment-run.css`
