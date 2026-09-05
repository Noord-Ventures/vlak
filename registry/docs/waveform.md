# Waveform

Displays supplied audio amplitudes with optional seeking and editable selection bounds.

Category: content  
Name: `waveform`  
Also known as: Waveform, Audio waveform, Audio region  
Page: https://vlak.dev/components/waveform/

## When to use

- A supplied waveform for an audio recording.
- Seeking or selecting an interval in normalised zero-to-one coordinates.

## When not to

- Generating or decoding audio data; provide amplitude samples.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Waveform } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add waveform
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/waveform.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-waveform"><svg class="rs-waveform-plot" viewBox="0 0 80 48" role="img" aria-label="Audio waveform"><path d="M0 24 H10 V10 H12 V38 H14 V24 H30 V4 H32 V44 H34 V24 H80" fill="none" stroke="currentColor" /></svg></div>
```

## Example

```tsx
import { Waveform } from "@noorddev/vlak-react";

<Waveform samples={[0.2, 0.5, 0.8, 0.3, 0.7, 0.4]} label="Interview waveform" value={position} onValueChange={setPosition} region={region} onRegionChange={setRegion} />
```

## Props

### Waveform

A waveform from supplied amplitude data, optionally scrubbed through a native range.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `samples` (required) | `readonly number[]` |  | Amplitudes from zero to one; values are clamped. |
| `label` (required) | `string` |  |  |
| `value` | `number` |  |  |
| `defaultValue` | `number` | `0` |  |
| `onValueChange` | `(position: number) => void` |  |  |
| `disabled` | `boolean` | `false` |  |
| `region` | `WaveformRegion` |  |  |
| `defaultRegion` | `WaveformRegion` | `{ start: 0, end: 1 }` |  |
| `onRegionChange` | `(region: WaveformRegion) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Arrow keys, Home, End | Operates the native seek range and optional selection start and end ranges. |

## Accessibility

- Static waveforms have a labelled image role.
- Interactive waveforms announce percentage and selection endpoints.
- Long inputs are reduced to no more than 240 peak bars to bound SVG rendering cost.

## Classes

`rs-waveform`, `rs-waveform-stage`, `rs-waveform-plot`, `rs-waveform-input`, `rs-waveform-region`, `rs-waveform-region-controls`, `rs-waveform-label`, `rs-waveform-bar`, `rs-waveform-played`

## Dependencies

Registry dependencies: [slider](slider.md).  
React: `packages/react/src/components/waveform.tsx`  
CSS: `packages/core/css/components/waveform.css`
