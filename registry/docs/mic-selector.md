# Mic selector

Searches available microphone inputs with explicit permission activation, device-change updates, and recoverable selection states.

Category: ai  
Name: `mic-selector`  
Also known as: AI Elements Mic Selector, Microphone picker, Audio input, useAudioDevices  
Page: https://vlak.dev/ai/mic-selector/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Select a device before application-owned recording.
- useAudioDevices enumerates without opening a microphone; requestAccess asks for permission only when activated.
- Input labels may be unavailable until the user allows access. Temporary permission streams are released.
- Keep value controlled to preserve a selected device across device-change events.
- CSS-only markup requires application code for discovery and capture permissions.

## When not to

- Assuming selection starts recording or guarantees that a disconnected device remains usable.
- Requesting microphone permission automatically when rendering a page.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { MicSelector, useAudioDevices } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add mic-selector
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/mic-selector.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-mic-selector"><label class="rs-mic-selector-label" for="microphone">Microphone</label><select id="microphone" class="rs-input"><option>System microphone</option></select><p class="rs-mic-selector-message">Selecting an input does not start recording.</p></div>
```

## Example

```tsx
"use client";
import { useState } from "react";
import { MicSelector } from "@noorddev/vlak-react";

export function MicrophonePicker() {
  const [deviceId, setDeviceId] = useState("");
  return <MicSelector label="Microphone" value={deviceId} onValueChange={setDeviceId} />;
}
```

## Props

### MicSelector

Searchable microphone choice. The application owns capture and the selected device's use.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `(deviceId: string) => void` |  |  |
| `label` | `string` | `"Microphone"` |  |
| `disabled` | `boolean` | `false` |  |

### Functions

- `useAudioDevices` (hook): Enumerates inputs without opening a microphone; requestAccess is an explicit user action.

## Keyboard

| Keys | Does |
| --- | --- |
| Type | Filters the microphone list |
| Arrow Down, Arrow Up, Enter | Navigates and chooses an available microphone |
| Escape | Closes the selection list |
| Tab, Enter, Space | Reaches and activates permission or refresh controls |

## Accessibility

- A visible label names the combobox. Loading, permission errors, and disconnection are announced through a status region.
- Keyboard filtering comes from the shared Combobox. Permission and refresh actions use native 44px buttons.
- Native div attributes and the root ref are forwarded.

## Classes

`rs-mic-selector`, `rs-mic-selector-label`, `rs-mic-selector-actions`, `rs-mic-selector-message`

## Dependencies

Registry dependencies: [button](button.md), [combobox](combobox.md), [input](input.md).  
React: `packages/react/src/components/mic-selector.tsx`  
CSS: `packages/core/css/components/mic-selector.css`
