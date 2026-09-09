# Response actions

Four subtle 44px icon controls for copying, reading aloud, rating through a combined feedback menu, and sharing an assistant response.

Category: ai  
Name: `response-actions`  
Also known as: AI response actions, Message toolbar, Read aloud, Message feedback, Thumbs up, Thumbs down  
Page: https://vlak.dev/ai/response-actions/

## When to use

- Place in the actions slot of Response and supply the same plain text the reader sees.
- Each action composes a subtle icon Button. Muted text turns to ink on hover while the surface stays transparent.
- The combined feedback icon opens helpful and unhelpful choices. Selecting the checked choice again clears it.
- Use onFeedback to persist positive, negative, or cleared feedback. A rejected promise keeps the previous selection available for retry.
- Use feedback for controlled selection or defaultFeedback for an initial local selection.
- Supply onShare for an application-owned share flow. Otherwise the browser shares the text or copies it when native sharing is unavailable.
- Read aloud uses browser speech only after activation. onReadingChange can coordinate an avatar with narration.
- CSS-only markup supplies named controls; clipboard, speech, the feedback menu, and sharing require React or application code.

## When not to

- Adding copyText to the same Response, which would duplicate its copy control.
- Assuming local feedback has been stored on a server without supplying onFeedback.
- Passing raw markup as text or automatically starting narration when a message appears.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ResponseActions } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add response-actions
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/response-actions.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-response-actions-bar" role="group" aria-label="Response actions"><button class="rs-btn-subtle rs-btn-icon" type="button" aria-label="Copy response" title="Copy response"><svg class="rs-response-actions-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="1"/><path d="M16 8V3H4v13h4"/></svg></button><button class="rs-btn-subtle rs-btn-icon" type="button" aria-label="Read aloud" title="Read aloud"><svg class="rs-response-actions-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m11 4-6 5H2v6h3l6 5V4ZM15 8a6 6 0 0 1 0 8"/></svg></button><button class="rs-btn-subtle rs-btn-icon" type="button" aria-label="Rate response" title="Rate response" aria-haspopup="menu" aria-expanded="false"><svg class="rs-response-actions-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M1 7h3v7H1zM4 7l3-5c1.5 0 2 1 1 4h4a1 1 0 0 1 1 1l-1.5 6a1 1 0 0 1-1 .8H4M23 17h-3v-7h3zM20 17l-3 5c-1.5 0-2-1-1-4h-4a1 1 0 0 1-1-1l1.5-6a1 1 0 0 1 1-.8H20"/></svg></button><button class="rs-btn-subtle rs-btn-icon" type="button" aria-label="Share response" title="Share response"><svg class="rs-response-actions-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 16V2m-5 5 5-5 5 5M5 12H3v10h18V12h-2"/></svg></button><span class="rs-response-actions-status" role="status" aria-live="polite" aria-atomic="true"></span></div>
```

## Example

```tsx
"use client";
import { useState } from "react";
import { Response, ResponseActions, type ResponseFeedback } from "@noorddev/vlak-react";

export function AnswerActions() {
  const [feedback, setFeedback] = useState<ResponseFeedback>(null);
  const answer = "The brief now names one owner and one next step.";
  return <Response actions={<ResponseActions text={answer} feedback={feedback} onFeedback={setFeedback} />}>
    <p>{answer}</p>
  </Response>;
}
```

## Props

### ResponseActions

Compact message actions. Speech and sharing run only after a button activation.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` (required) | `string` |  | Plain text used for copying, narration, and the default share action. |
| `feedback` | `ResponseFeedback` |  |  |
| `defaultFeedback` | `ResponseFeedback` | `null` |  |
| `onFeedback` | `(value: ResponseFeedback) => void \| Promise<void>` |  | A rejected promise preserves the previous selection and allows retry. |
| `onShare` | `() => void \| Promise<void>` |  | Overrides native sharing. Without it, unsupported browsers copy the text. |
| `onReadingChange` | `(reading: boolean) => void` |  | Reports this response's narration state for an avatar or other presentation. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the available copy, narration, feedback, and share controls |
| Enter, Space | Activates the focused action or feedback choice; choosing the checked feedback item again clears it |
| Arrow Down, Arrow Up | Opens feedback on the first or last choice, then moves between choices |
| Home, End | Moves to the first or last feedback choice |
| Escape | Closes the feedback menu and returns focus to its trigger |
| Tab | Closes the feedback menu and moves focus to the next action |

## Accessibility

- Every icon button has a readable name and title, a 44px target, and a visible focus outline.
- One Rate response trigger exposes its expanded menu state. Helpful and unhelpful menu choices expose aria-checked and remain mutually exclusive.
- The menu moves focus between choices and returns focus on selection or Escape. Outside interaction dismisses it without stealing focus.
- A polite, atomic status region announces completed actions and recoverable errors. Clipboard success is reported only after the write resolves.
- Read aloud is disabled when browser speech is unavailable and becomes Stop reading while this response is narrated. Replacing the text or unmounting stops this component's narration.
- Pending asynchronous actions prevent duplicate activation. The feedback trigger remains focusable with aria-disabled while saving. Replacing the response text closes its menu and invalidates stale results.
- The group accepts native div attributes, children for extra actions, className, style, and a forwarded div ref.

## Classes

`rs-response-actions-bar`, `rs-response-actions-selected`, `rs-response-actions-icon`, `rs-response-actions-status`, `rs-response-actions-menu`

## Dependencies

Registry dependencies: [button](button.md), [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/response-actions.tsx`  
CSS: `packages/core/css/components/response-actions.css`
