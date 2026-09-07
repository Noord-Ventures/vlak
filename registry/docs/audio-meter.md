# Audio meter

Shows supplied channel levels and peaks in decibels, with bounded native meters and explicit missing readings.

Category: creative  
Name: `audio-meter`  
Also known as: AudioMeter, Level meter, Peak meter, Decibel meter, Channel meter  
Page: https://vlak.dev/components/audio-meter/

## When to use

- Live or recorded decibel readings supplied by an audio host.
- min and max to set the visible scale; supplied readings remain visible as text.
- Negative infinity for digital silence, and null for an unavailable level.

## When not to

- Expecting microphone access, audio analysis, or automatic peak holding.
- Treating a missing reading as silence or zero decibels.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AudioMeter } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add audio-meter
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/audio-meter.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-audio-meter"><p class="rs-audio-meter-label">Output</p><div class="rs-audio-meter-channel"><div class="rs-audio-meter-text"><span id="left-channel">Left</span><span>-12 dB</span></div><meter class="rs-audio-meter-bar" min="-60" max="0" value="-12" aria-labelledby="left-channel">-12 dB</meter><p class="rs-audio-meter-note">Peak: -3 dB</p></div></div>
```

## Example

```tsx
import { AudioMeter } from "@noorddev/vlak-react";

<AudioMeter label="Output" channels={[{ id: "left", label: "Left", level: -12, peak: -3 }, { id: "right", label: "Right", level: -15, peak: -4 }]} />
```

## Props

### AudioMeter

Supplied channel levels and peaks; no audio analysis or peak holding.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `channels` (required) | `AudioMeterChannel[]` |  |  |
| `min` | `number` | `-60` |  |
| `max` | `number` | `0` |  |

## Accessibility

- Each native meter has a channel name, minimum, maximum, and decibel value text.
- Supplied peaks are visible text; absent and invalid readings suppress the meter.
- Native meter styles remove browser gradients so the track and fill remain monochrome. System colors retain visible fill and boundaries in forced colors.
- The ref and native attributes reach the root div.

## Classes

`rs-audio-meter`, `rs-audio-meter-label`, `rs-audio-meter-channel`, `rs-audio-meter-text`, `rs-audio-meter-bar`, `rs-audio-meter-note`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/audio-meter.tsx`  
CSS: `packages/core/css/components/audio-meter.css`
