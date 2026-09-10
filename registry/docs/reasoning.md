# Reasoning

A native disclosure for supplied work summaries, with a chevron and 44px control. Panels use a subtle 1px outline and 4px corners.

Category: ai  
Name: `reasoning`  
Also known as: AI Elements Reasoning, Work summary, AI progress disclosure, Task summary  
Page: https://vlak.dev/ai/reasoning/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Optional task progress, tool activity summaries, or explanatory text supplied by your application.
- Use variant=inline for activity within a message. Its padded summary changes text color on hover; the default panel uses a subtle 1px outline and 4px corners.
- Use open and onOpenChange for controlled disclosure, or defaultOpen for an initial preference.
- Keep title to non-interactive content so the native summary remains one clear disclosure control.

## When not to

- Inventing private model thinking or inferring hidden chain-of-thought from a response. Supply a supported public summary or task progress instead.
- Treating status as a timer or automatically closing the disclosure when work completes. The reader owns their open state.
- Streaming long text into statusLabel. Put the evolving summary in children.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Reasoning } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add reasoning
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/reasoning.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<details class="rs-reasoning"><summary class="rs-reasoning-summary"><svg class="rs-reasoning-indicator" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg><span class="rs-reasoning-title">Work summary</span><span class="rs-reasoning-status" role="status" aria-live="polite" aria-atomic="true">Complete</span></summary><div class="rs-reasoning-content"><p>Compared the renewal clause with the notice period.</p></div></details>
```

## Example

```tsx
import { Reasoning } from "@noorddev/vlak-react";

<Reasoning variant="inline" title="Reviewed the brief" status="complete">
  <p>Compared the supplied brief with the previous revision.</p>
</Reasoning>
```

## Props

### Reasoning

A native disclosure for a work summary supplied by the application.

Extends `Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDetailsElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `"Work summary"` |  |
| `status` | `ReasoningStatus` | `"complete"` | Describes application-supplied progress, without generating a thinking trace. |
| `statusLabel` | `string` |  |  |
| `defaultOpen` | `boolean` | `false` |  |
| `onOpenChange` | `(open: boolean) => void` |  |  |
| `variant` | `"inline" \| "panel"` | `"panel"` | An inline disclosure for message activity, or a framed panel. |
| `durationMs` | `number` |  | Optional elapsed time supplied by the application, in milliseconds. |
| `measureDuration` | `boolean` | `false` | Measure this component's streaming interval. Off by default. |
| `autoExpand` | `boolean` | `false` | Open when a new streaming interval begins. Manual disclosure remains the default. |
| `autoCollapseDelay` | `number \| false` | `false` | Close once after completion unless the reader manually changed the disclosure. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the native summary, then any interactive content in the expanded details. |
| Enter, Space | Toggles the focused summary. In controlled mode, requests the next open value through onOpenChange. |

## Accessibility

- Native details and summary expose disclosure state and keyboard behavior without a custom widget.
- The decorative chevron points right when closed and down when open; it is hidden from assistive technology.
- The summary target is at least 44px with a visible focus outline and system colors in forced-colors mode.
- Only the short status phrase is a polite, atomic live region; body updates are available in the normal reading order.
- Status changes never close or open the disclosure. Controlled open values remain authoritative even when a change request is not accepted.
- Native details attributes, onToggle, className, style, and the details ref are forwarded. The application supplies the summary and status; no model reasoning is generated or inferred.

## Classes

`rs-reasoning`, `rs-reasoning-inline`, `rs-reasoning-summary`, `rs-reasoning-summary-inline`, `rs-reasoning-indicator`, `rs-reasoning-title`, `rs-reasoning-title-inline`, `rs-reasoning-status`, `rs-reasoning-content`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/reasoning.tsx`  
CSS: `packages/core/css/components/reasoning.css`
