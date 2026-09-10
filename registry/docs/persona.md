# Persona

Native monochrome waveform, fluid orb, and ring visuals with five conversational states, live intensity, and a custom renderer.

Category: ai  
Name: `persona`  
Also known as: AI Elements Persona, AI avatar, Assistant visual, Voice state, Orb  
Page: https://vlak.dev/ai/persona/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Drive state from actual application recording, generation and playback events.
- Choose waveform, orb, or rings. Waveform remains the default. All five states work with each native visual without an external graphics runtime.
- Supply intensity from zero to one for measured input or output energy; it is clamped, and asleep always settles to zero. Otherwise each state provides a representative intensity.
- Motion pauses when offscreen, the document is hidden, paused is true, or state is asleep. Reduced motion and forced colors keep a static visual.
- onMotionChange reports the effective motion policy initially and when it changes. It does not report asset loading or custom engine playback events.
- Supply children for static custom content, or renderVisual for state, normalized size and intensity, and animated. A custom graphics renderer should honor animated and release its own resources.
- CSS-only markup shows a static representative visual; the React component manages visibility and user preference changes.
- Omit label for a decorative visual beside an already named response. Add label to expose the visual and state as an image.

## When not to

- Mounting a separate graphics runtime for every historical message.
- Using animation alone to communicate an error or progress that needs readable text.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Persona } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add persona
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/persona.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-persona rs-persona-thinking" role="img" aria-label="Assistant: thinking" data-state="thinking" data-variant="orb" style="width:48px;height:48px"><span class="rs-persona-orb" aria-hidden="true"><span class="rs-persona-orb-surface"></span></span></div>
```

## Example

```tsx
import { Persona, type PersonaState, type PersonaVariant, type PersonaVisualContext } from "@noorddev/vlak-react";
import type { ReactNode } from "react";

export function AssistantPersona({ state = "idle", variant = "orb", intensity, paused, renderVisual }: {
  state?: PersonaState;
  variant?: PersonaVariant;
  intensity?: number;
  paused?: boolean;
  renderVisual?: (context: PersonaVisualContext) => ReactNode;
}) {
  return <Persona state={state} variant={variant} intensity={intensity} paused={paused}
    size={48} label="Assistant" renderVisual={renderVisual} />;
}
```

## Props

### Persona

Three native monochrome visuals share five conversational states and an optional custom renderer.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `state` | `PersonaState` | `"idle"` |  |
| `variant` | `PersonaVariant` | `"waveform"` |  |
| `size` | `number` | `48` |  |
| `label` | `string` |  |  |
| `intensity` | `number` |  | Input/output energy in the range 0–1. Asleep always settles to zero. |
| `paused` | `boolean` | `false` | Stop motion without changing the conversational state. |
| `onMotionChange` | `(animated: boolean) => void` |  | Called initially and whenever the effective motion policy changes. |
| `children` | `ReactNode` |  | A custom decorative visual. The application owns its rendering lifecycle. |
| `renderVisual` | `(context: PersonaVisualContext) => ReactNode` |  | Custom visuals should honor animated and release their own rendering resources. |

## Accessibility

- The default is decorative. A supplied label exposes a named image including the current conversational state.
- Animation respects reduced motion, forced colors, viewport visibility and document visibility.
- The component forwards native div attributes, class/style and ref; it does not request audio permissions or play speech.

## Classes

`rs-persona`, `rs-persona-visual`, `rs-persona-bar`, `rs-persona-running`, `rs-persona-listening`, `rs-persona-thinking`, `rs-persona-speaking`, `rs-persona-asleep`, `rs-persona-orb`, `rs-persona-orb-surface`, `rs-persona-rings`, `rs-persona-ring`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/persona.tsx`  
CSS: `packages/core/css/components/persona.css`
