# Stack navigator

Navigates supplied depth, time, channel and stage-position axes while preserving exact physical readings and indexed positions.

Category: science  
Name: `stack-navigator`  
Also known as: Image stack controls, Z-stack navigator, Microscopy axes, Multidimensional image navigator, Stage position selector  
Page: https://vlak.dev/components/stack-navigator/

## When to use

- Image stacks with explicit axis labels, sampled physical values and known position indexes.
- Selection values are zero-based indexes; displayed position counts are one-based. Physical values are never calculated from spacing.
- name submits one selected index per axis. Controlled values remain caller-owned; native form reset restores uncontrolled defaults.

## When not to

- Calling an instrument, calculating stage motion, or inferring positions from an index.
- More than 8 axes or 8192 total positions; the component reports the bound rather than truncating axes.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { StackNavigator } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add stack-navigator
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/stack-navigator.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-stack-navigator"><legend class="rs-stack-navigator-legend">Image stack</legend><div class="rs-stack-navigator-axis"><p class="rs-stack-navigator-label">Depth</p><p class="rs-stack-navigator-copy">Position 1 of 3; -1 µm</p></div></fieldset>
```

## Example

```tsx
import { StackNavigator } from "@noorddev/vlak-react";

<StackNavigator label="Image stack" name="stack" axes={[
  { id: "depth", label: "Depth", unit: "µm", positions: [{ value: -1 }, { value: 0 }, { value: 1 }] },
  { id: "time", label: "Time", unit: "s", positions: [{ value: 0 }, { value: 5 }, { value: 10 }] },
  { id: "channel", label: "Channel", positions: [{ value: "Phase" }, { value: "Channel 2" }] },
  { id: "stage", label: "Stage position", unit: "µm", positions: [{ value: "x 12.5, y -1.5" }] },
]} defaultValue={{ depth: 1, time: 0, channel: 0, stage: 0 }} />
```

## Props

### StackNavigator

Navigates supplied stack coordinates without calculating stage positions or calling an instrument.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `axes` (required) | `readonly StackAxis[]` |  |  |
| `value` | `Readonly<Record<string, number \| null>>` |  |  |
| `defaultValue` | `Readonly<Record<string, number \| null>>` | `{}` |  |
| `onValueChange` | `(value: StackSelection) => void` |  |  |
| `description` | `ReactNode` |  |  |
| `readOnly` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between enabled previous, position-select and next controls. |
| Arrow keys, Home, End, typing | Opens and navigates the position list; disabled positions are skipped. |
| Enter, Space | Confirms the active list option or activates the focused previous or next button. |
| Escape | Closes the position list without changing selection. |

## Accessibility

- Every axis has a visible select label and a text description containing the exact displayed index and physical value.
- Zero and negative physical positions remain visible. Missing or invalid readings are explicitly unavailable.
- Each input and button has a 44px target and visible focus; no axis is selected implicitly.
- Read-only values remain submitted through hidden fields, while disabled fieldsets do not submit.
- The fieldset ref, form association, native attributes, className and style pass through.
- The shared Select and Button primitives supply combobox navigation and control styling; native form values remain available through the Select backing control.

## Classes

`rs-stack-navigator`, `rs-stack-navigator-legend`, `rs-stack-navigator-axis`, `rs-stack-navigator-label`, `rs-stack-navigator-row`, `rs-stack-navigator-step`, `rs-stack-navigator-copy`

## Dependencies

Registry dependencies: [button](button.md), [select](select.md).  
React: `packages/react/src/components/stack-navigator.tsx`  
CSS: `packages/core/css/components/stack-navigator.css`
