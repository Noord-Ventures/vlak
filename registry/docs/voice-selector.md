# Voice selector

Searches application-supplied voice names and metadata, with controlled selection and optional audio preview playback.

Category: ai  
Name: `voice-selector`  
Also known as: AI Elements Voice Selector, Voice picker, Voice preview, TTS voice  
Page: https://vlak.dev/ai/voice-selector/

## When to use

- Supply provider voice records; name, provider, language, description and attributes all participate in search.
- Use value/onValueChange or defaultValue for voice selection.
- Supply previewSrc for a real audio sample and previewText for speech's text alternative.
- Sample playback begins only after Preview voice. Selection changes or unmount stop this selector's previous sample.
- CSS-only markup provides selection paint; search and sample playback need application code.

## When not to

- Assuming this picker fetches a provider catalog or changes a speech engine by itself.
- Inferring voice metadata instead of using the provider's supplied descriptions.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { VoiceSelector } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add voice-selector
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/voice-selector.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-voice-selector"><label class="rs-voice-selector-label" for="voice">Voice</label><select class="rs-input" id="voice"><option>Mina · English</option><option>Noor · Dutch</option></select></div>
```

## Example

```tsx
"use client";
import { useState } from "react";
import { VoiceSelector } from "@noorddev/vlak-react";

export function VoicePicker({ sampleUrl }: { sampleUrl?: string }) {
  const [voiceId, setVoiceId] = useState("mina");
  return <VoiceSelector value={voiceId} onValueChange={setVoiceId} voices={[
    { id: "mina", name: "Mina", provider: "Your provider", language: "English", attributes: ["Warm"], previewSrc: sampleUrl, previewText: "A short sample of this voice." },
    { id: "noor", name: "Noor", provider: "Your provider", language: "Dutch" },
  ]} />;
}
```

## Props

### VoiceSelector

Supplied voice metadata and optional real audio samples; provider catalogs remain application-owned.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `voices` (required) | `readonly VoiceOption[]` |  |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `(voiceId: string) => void` |  |  |
| `label` | `string` | `"Voice"` |  |
| `disabled` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Type | Filters voice names and supplied metadata |
| Arrow Down, Arrow Up, Enter | Navigates and selects a voice |
| Escape | Closes the voice list |
| Enter, Space | Starts or stops the selected voice sample |

## Accessibility

- The visible label names the shared Combobox; disabled voices are skipped by keyboard navigation.
- Preview errors use a status region and permit retry. Samples never autoplay.
- The selected voice's metadata uses a subtle 1px frame with 4px corners. Native div attributes and ref are forwarded.

## Classes

`rs-voice-selector`, `rs-voice-selector-label`, `rs-voice-selector-option`, `rs-voice-selector-metadata`, `rs-voice-selector-detail`, `rs-voice-selector-message`

## Dependencies

Registry dependencies: [button](button.md), [combobox](combobox.md), [input](input.md).  
React: `packages/react/src/components/voice-selector.tsx`  
CSS: `packages/core/css/components/voice-selector.css`
