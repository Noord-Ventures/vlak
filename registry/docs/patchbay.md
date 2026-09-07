# Patchbay

Connects supplied source and destination ports through a keyboard-navigable matrix, with signal types, channel groups, and blocked-route reasons.

Category: creative  
Name: `patchbay`  
Also known as: Patchbay, Routing matrix, Audio routing, Crosspoint matrix, Connection matrix, Signal patching  
Page: https://vlak.dev/components/patchbay/

## When to use

- An audio or signal-routing matrix whose ports and confirmed connections come from the host.
- value/defaultValue/onValueChange for controlled routing requests or a local prototype; the host applies real routing changes.
- Signal type strings must match; getBlockReason can add a host-specific restriction with a visible explanation.
- Existing incompatible connections can be disconnected; routes involving unavailable ports remain explicitly listed and preserved.

## When not to

- Assuming the component creates audio streams, manages clocking, or configures a routing engine.
- Silently deleting host connections when a port temporarily disappears.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Patchbay } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add patchbay
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/patchbay.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-patchbay"><legend class="rs-patchbay-legend">Studio routing</legend><div class="rs-patchbay-viewport"><table class="rs-patchbay-table"><thead><tr><th class="rs-patchbay-header" scope="col">Source / destination</th><th class="rs-patchbay-header" scope="col">Monitor left<span class="rs-patchbay-detail">Outputs · audio</span></th></tr></thead><tbody><tr><th class="rs-patchbay-header" scope="row">Mix left<span class="rs-patchbay-detail">Mix bus · audio</span></th><td class="rs-patchbay-cell"><label class="rs-patchbay-control rs-patchbay-connected"><span aria-hidden="true">✓</span><input class="rs-patchbay-input" type="checkbox" checked aria-label="Mix left to Monitor left" /></label></td></tr></tbody></table></div></fieldset>
```

## Example

```tsx
import { Patchbay } from "@noorddev/vlak-react";

<Patchbay label="Studio routing" name="routes"
  sources={[{ id: "mix-l", label: "Mix left", group: "Mix bus", signalType: "audio" }]}
  destinations={[{ id: "out-l", label: "Monitor left", group: "Outputs", signalType: "audio" }, { id: "clock", label: "Clock", signalType: "control" }]}
  defaultValue={[{ sourceId: "mix-l", destinationId: "out-l" }]} />
```

## Props

### Patchbay

A connection matrix for supplied ports; the caller owns the routing engine.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `sources` (required) | `PatchPort[]` |  |  |
| `destinations` (required) | `PatchPort[]` |  |  |
| `value` | `PatchConnection[]` |  |  |
| `defaultValue` | `PatchConnection[]` | `[]` |  |
| `onValueChange` | `(connections: PatchConnection[]) => void` |  |  |
| `getBlockReason` | `(source: PatchPort, destination: PatchPort) => string \| null` |  | Additional host constraints. Matching signal types are required by default. |
| `readOnly` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Enters the connection matrix at one enabled checkbox, then leaves the matrix. |
| Arrow keys | Moves focus through enabled crosspoints in the same row or column. |
| Home, End | Moves to the first or last enabled crosspoint in the row; Control includes the whole matrix. |
| Space | Toggles the focused connection through the native checkbox. |

## Accessibility

- Native table headers identify sources and destinations; every checkbox also names both ports.
- Connection targets are at least 44px, with a full-surface checked state and forced-colors support.
- Blocked crosspoints expose reasons in text and descriptions. Roving focus skips disabled cells.
- Named checkboxes submit connection pairs; read-only hidden values preserve existing routes. Form reset restores uncontrolled defaults.
- The ref and native fieldset attributes reach the root fieldset.

## Classes

`rs-patchbay`, `rs-patchbay-legend`, `rs-patchbay-viewport`, `rs-patchbay-table`, `rs-patchbay-header`, `rs-patchbay-detail`, `rs-patchbay-cell`, `rs-patchbay-control`, `rs-patchbay-connected`, `rs-patchbay-blocked`, `rs-patchbay-input`, `rs-patchbay-note`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/patchbay.tsx`  
CSS: `packages/core/css/components/patchbay.css`
