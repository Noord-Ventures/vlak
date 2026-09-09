# Speech input

Starts and stops native speech capture, with final text, optional interim results, and application transcription of recorded audio.

Category: ai  
Name: `speech-input`  
Also known as: AI Elements Speech Input, Voice input, Dictation, MediaRecorder, Speech recognition  
Page: https://vlak.dev/ai/speech-input/

## When to use

- Capture speech only after the user activates the button. Stop processes the recording; Cancel discards pending capture or transcription.
- Native speech recognition is feature-detected. Supply onAudioRecorded for browsers that need a MediaRecorder transcription fallback.
- The fallback negotiates an available media type and passes actual audio bytes plus an AbortSignal to the application.
- Use mode=recording and deviceId for a specific input. Recognition mode follows the browser's input choice.
- maxDuration defaults to 120 seconds; configuration changes and unmount cancel owned capture resources.
- Provider credentials and transcription requests belong to the application. CSS-only markup does not record audio.

## When not to

- Claiming browser speech recognition always works offline.
- Automatically sending transcribed text to a conversation without the application's send action.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { SpeechInput } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add speech-input
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/speech-input.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<span class="rs-speech-input"><button class="rs-btn-subtle" type="button" aria-pressed="false">Start speech input</button><span class="rs-speech-input-message" role="status">Speech capture requires application code.</span></span>
```

## Example

```tsx
import { SpeechInput } from "@noorddev/vlak-react";

export function Dictation({ onTranscript, endpoint }: {
  onTranscript: (text: string) => void;
  endpoint: string; // The application's audio transcription endpoint.
}) {
  return <SpeechInput lang="en-US" onTranscript={onTranscript}
    onAudioRecorded={async (audio, { signal }) => {
      const body = new FormData();
      body.append("audio", audio);
      const response = await fetch(endpoint, { method: "POST", body, signal });
      if (!response.ok) throw new Error("Transcription failed. Try again.");
      const result: unknown = await response.json();
      if (!result || typeof result !== "object" || !("text" in result) || typeof result.text !== "string") {
        throw new Error("The transcription response must contain text.");
      }
      return result.text;
    }}
  />;
}
```

## Props

### SpeechInput

User-activated speech capture with an application-owned transcription fallback.

Extends `ButtonHTMLAttributes<HTMLButtonElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "ghost" \| "subtle"` |  | Solid ink primary, hairline ghost, or borderless subtle. One primary per view. |
| `size` | `"default" \| "sm" \| "icon"` |  | Icon buttons stay square at every breakpoint. Supply an accessible name. |
| `grouped` | `boolean` |  | Flush into a ButtonGroup: no own stroke, one ink seam. |
| `onTranscript` (required) | `(text: string) => void` |  |  |
| `onInterimTranscript` | `(text: string) => void` |  |  |
| `onAudioRecorded` | `(audio: Blob, context: { signal: AbortSignal; }) => Promise<string>` |  |  |
| `onStatusChange` | `(status: SpeechInputStatus) => void` |  |  |
| `onError` | `(error: Error) => void` |  |  |
| `mode` | `"auto" \| "recognition" \| "recording"` | `"auto"` |  |
| `deviceId` | `string` |  |  |
| `lang` | `string` | `"en-US"` |  |
| `maxDuration` | `number` | `120` | Stops and processes a recording after this many seconds. Defaults to 120. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the speech control when available |
| Enter, Space | Starts, stops, or cancels speech input according to its current state |

## Accessibility

- The native button has a state-specific label, aria-pressed, and a 44px target.
- A described status region explains listening, processing, unavailable support and recoverable errors.
- The button ref and native button attributes pass through. Unsupported capture is disabled with an explanation.
- Owned streams, listeners, recognition and processing are canceled on cleanup; late results are ignored.

## Classes

`rs-speech-input`, `rs-speech-input-message`, `rs-speech-input-icon`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/speech-input.tsx`  
CSS: `packages/core/css/components/speech-input.css`
