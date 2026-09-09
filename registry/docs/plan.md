# Plan

A collapsible proposed plan with streaming title treatment, actions, and supporting context.

Category: ai  
Name: `plan`  
Also known as: Plan  
Page: https://vlak.dev/ai/plan/

## When to use

- Supply plan content and application-owned actions. The title and description shimmer only while streaming.
- The native disclosure starts open; open/defaultOpen/onOpenChange preserve controlled and uncontrolled usage.

## When not to

- Treating a displayed plan as executed work.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Plan } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add plan
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/plan.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<details class="rs-plan" open><summary>Review plan</summary><ol><li>Read the brief</li><li>Check owners</li></ol></details>
```

## Example

```tsx
import { Plan, Button } from "@noorddev/vlak-react";

export function ReviewPlan({ streaming, onApprove }: { streaming: boolean; onApprove: () => void }) {
  return <Plan title="Review plan" description="Two steps" streaming={streaming} actions={<Button variant="subtle" disabled={streaming} onClick={onApprove}>Approve plan</Button>}>
    <ol><li>Read the brief</li><li>Check owners</li></ol>
  </Plan>;
}
```

## Props

### Plan

A proposed plan with supplied steps and actions. Execution remains application-owned.

Extends `Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDetailsElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `string` |  |  |
| `description` | `string` |  |  |
| `streaming` | `boolean` | `false` |  |
| `actions` | `ReactNode` |  |  |
| `footer` | `ReactNode` |  |  |
| `statusLabel` | `string` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `onOpenChange` | `(open: boolean) => void` |  |  |
| `variant` | `"inline" \| "panel"` |  | An inline disclosure for message activity, or a framed panel. |
| `durationMs` | `number` |  | Optional elapsed time supplied by the application, in milliseconds. |
| `measureDuration` | `boolean` |  | Measure this component's streaming interval. Off by default. |
| `autoExpand` | `boolean` |  | Open when a new streaming interval begins. Manual disclosure remains the default. |
| `autoCollapseDelay` | `number \| false` |  | Close once after completion unless the reader manually changed the disclosure. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the supplied native controls in reading order |
| Enter, Space | Activates focused buttons and disclosure summaries |

## Accessibility

- Native attributes, className, style, and the forwarded ref reach the outer element.
- Interactive content requires accessible names; progress text is not announced for every streamed token.

## Classes

`rs-plan`, `rs-plan-description`, `rs-plan-actions`, `rs-plan-footer`

## Dependencies

Registry dependencies: [reasoning](reasoning.md), [shimmer](shimmer.md).  
React: `packages/react/src/components/plan.tsx`  
CSS: `packages/core/css/components/plan.css`
