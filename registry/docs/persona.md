# Persona

A monochrome assistant visual with idle, listening, thinking, speaking, and asleep states, plus a custom visual slot.

Category: ai  
Name: `persona`  
Also known as: AI Elements Persona, AI avatar, Assistant visual, Voice state, Orb  
Page: https://vlak.dev/ai/persona/

## When to use

- Drive state from actual application recording, generation and playback events.
- The default visual uses native CSS, pauses when offscreen or the document is hidden, and stops animation for reduced motion and forced colors.
- Supply children for a custom decorative visual such as an application-owned Orbkit renderer. Its graphics lifecycle remains application-owned.
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
<div class="rs-persona" role="img" aria-label="Assistant: thinking" data-state="thinking" style="width:48px;height:48px"><span class="rs-persona-visual" aria-hidden="true"><span class="rs-persona-bar rs-persona-thinking"></span><span class="rs-persona-bar rs-persona-thinking"></span><span class="rs-persona-bar rs-persona-thinking"></span><span class="rs-persona-bar rs-persona-thinking"></span></span></div>
```

## Example

```tsx
import type { ReactNode } from "react";
import { Persona, type PersonaState } from "@noorddev/vlak-react";

export function AssistantPersona({ state = "idle", visual }: {
  state?: PersonaState;
  visual?: ReactNode; // Optional application-owned decorative renderer.
}) {
  return <Persona state={state} size={32} label="Assistant">{visual}</Persona>;
}
```

## Props

### Persona

Five conversational states with a native monochrome visual and a custom rendering slot.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `state` | `PersonaState` | `"idle"` |  |
| `size` | `number` | `48` |  |
| `label` | `string` |  |  |
| `children` | `ReactNode` |  | A custom decorative visual. The application owns its rendering lifecycle. |

## Accessibility

- The default is decorative. A supplied label exposes a named image including the current conversational state.
- Animation respects reduced motion, forced colors, viewport visibility and document visibility.
- The component forwards native div attributes, class/style and ref; it does not request audio permissions or play speech.

## Classes

`rs-persona`, `rs-persona-visual`, `rs-persona-bar`, `rs-persona-running`, `rs-persona-listening`, `rs-persona-thinking`, `rs-persona-speaking`, `rs-persona-asleep`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/persona.tsx`  
CSS: `packages/core/css/components/persona.css`
