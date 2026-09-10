# Thought steps

A collapsible sequence of work summaries, with step states, source badges, images, and captions.

Category: ai  
Name: `thought-steps`  
Also known as: Chain of thought, AI Elements ChainOfThought  
Page: https://vlak.dev/ai/thought-steps/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Present application-supplied work summaries and the evidence supporting each step.
- Use sources, content, image, caption, and icon slots for richer evidence; images need meaningful alt text.

## When not to

- Exposing private model reasoning or inventing an explanation of hidden model internals.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ThoughtSteps } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add thought-steps
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/thought-steps.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<details class="rs-thought-steps"><summary>Review summary</summary><ol class="rs-thought-steps-list"><li class="rs-thought-steps-step">Checked the supplied source</li></ol></details>
```

## Example

```tsx
import { ThoughtSteps } from "@noorddev/vlak-react";

<ThoughtSteps title="Review summary" defaultOpen steps={[{ id: "source", title: "Read the brief", state: "complete", description: "Checked the supplied scope and owners." }, { id: "review", title: "Compare responsibilities", state: "active" }]} />
```

## Props

### ThoughtSteps

Application-supplied work summaries, with per-step state and supporting evidence.

Extends `Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDetailsElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` |  |  |
| `status` | `ReasoningStatus` |  | Describes application-supplied progress, without generating a thinking trace. |
| `statusLabel` | `string` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `onOpenChange` | `(open: boolean) => void` |  |  |
| `variant` | `"inline" \| "panel"` |  | An inline disclosure for message activity, or a framed panel. |
| `durationMs` | `number` |  | Optional elapsed time supplied by the application, in milliseconds. |
| `measureDuration` | `boolean` |  | Measure this component's streaming interval. Off by default. |
| `autoExpand` | `boolean` |  | Open when a new streaming interval begins. Manual disclosure remains the default. |
| `autoCollapseDelay` | `number \| false` |  | Close once after completion unless the reader manually changed the disclosure. |
| `steps` (required) | `readonly ThoughtStep[]` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the supplied native controls in reading order |
| Enter, Space | Activates focused buttons and disclosure summaries |

## Accessibility

- Native attributes, className, style, and the forwarded ref reach the outer element.
- Interactive content requires accessible names; progress text is not announced for every streamed token.

## Classes

`rs-thought-steps`, `rs-thought-steps-list`, `rs-thought-steps-step`, `rs-thought-steps-detail`, `rs-thought-steps-title`, `rs-thought-steps-active`, `rs-thought-steps-sources`, `rs-thought-steps-figure`, `rs-thought-steps-caption`

## Dependencies

Registry dependencies: [reasoning](reasoning.md).  
React: `packages/react/src/components/thought-steps.tsx`  
CSS: `packages/core/css/components/thought-steps.css`
