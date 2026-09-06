# Channel strip

Edits channel gain, pan, mute, and solo with native sliders and 44px toggle actions wired to caller-owned state.

Category: creative  
Name: `channel-strip`  
Also known as: ChannelStrip, Mixer channel, Audio mixer, Gain control, Pan control, Mute solo  
Page: https://vlak.dev/components/channel-strip/

## When to use

- A host channel whose gain, pan, mute, and solo states belong together.
- value/defaultValue/onValueChange for controlled or local editing; connect changes to your audio host.
- Pan from -100 percent left through zero center to 100 percent right; gain uses decibels.

## When not to

- Assuming UI changes process audio without a connected host.
- Using solo as a global mixing policy; the application coordinates other channels.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ChannelStrip } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add channel-strip
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/channel-strip.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-channel-strip"><legend class="rs-channel-strip-label">Dialogue</legend><label class="rs-channel-strip-field">Gain<input class="rs-channel-strip-range" type="range" min="-60" max="12" step="any" value="0" /></label><label class="rs-channel-strip-field">Pan<input class="rs-channel-strip-range" type="range" min="-100" max="100" step="any" value="0" /></label><div class="rs-channel-strip-actions"><button class="rs-channel-strip-button" type="button" aria-pressed="false">Mute</button><button class="rs-channel-strip-button" type="button" aria-pressed="false">Solo</button></div></fieldset>
```

## Example

```tsx
import { ChannelStrip } from "@noorddev/vlak-react";

<ChannelStrip label="Dialogue" name="dialogue" defaultValue={{ gain: -3, pan: 0, muted: false, solo: false }} />
```

## Props

### ChannelStrip

Gain, pan, mute and solo state for an application-owned audio channel.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `value` | `ChannelStripValue` |  |  |
| `defaultValue` | `ChannelStripValue` | `initial` |  |
| `onValueChange` | `(value: ChannelStripValue) => void` |  |  |
| `gainMin` | `number` | `-60` |  |
| `gainMax` | `number` | `12` |  |
| `readOnly` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through enabled gain, pan, mute, and solo controls. |
| Arrow keys, Home, End | Uses native slider stepping and bounds. |
| Enter, Space | Toggles the focused mute or solo action. |

## Accessibility

- A fieldset and legend name the channel; native sliders expose gain and pan bounds and descriptive value text. In-range values retain their supplied precision.
- Mute and solo have stable names and aria-pressed; their entire surface changes on selection.
- All controls meet the 44px target size. Disabled or read-only controls cannot edit the channel.
- Uncontrolled form reset restores the supplied default; named read-only channels retain all valid values in form submissions. Disabled channels and out-of-range sliders are omitted. The ref reaches the fieldset.

## Classes

`rs-channel-strip`, `rs-channel-strip-label`, `rs-channel-strip-field`, `rs-channel-strip-text`, `rs-channel-strip-range`, `rs-channel-strip-actions`, `rs-channel-strip-button`, `rs-channel-strip-pressed`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/channel-strip.tsx`  
CSS: `packages/core/css/components/channel-strip.css`
