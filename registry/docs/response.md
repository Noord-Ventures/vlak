# Response

Presents user messages in right-aligned soft bubbles and assistant responses on the left, with speaker identity, status, and an action slot.

Category: ai  
Name: `response`  
Also known as: AI response, Chat message, Assistant message, AI Elements Message, Streaming response  
Page: https://vlak.dev/ai/response/

## When to use

- A user or assistant message whose content and response status come from the application.
- Pass plain text or rendered React content as children. To render markdown, supply an external markdown renderer in the children slot and configure its content and link safety in your application.
- Place ResponseActions in actions for icon controls that copy, narrate, rate, and share the response. Omit copyText when using that action bar.
- Use actions for other application-owned controls. Provide copyText for a standalone copy button when a full action bar is not needed.

## When not to

- Assuming this component calls a model or parses markdown. It does neither.
- Putting changing token content in statusLabel. Reserve that label for short phase changes.
- Injecting untrusted markup or unsafe links through an external renderer.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Response } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add response
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/response.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<article class="rs-response" aria-labelledby="response-author"><div class="rs-response-header"><span class="rs-response-author" id="response-author">Assistant</span><span class="rs-response-status" role="status" aria-live="polite" aria-atomic="true">Complete</span></div><div class="rs-response-content"><p>The lease renews on 1 October.</p></div></article>
```

## Example

```tsx
import { Response, ResponseActions } from "@noorddev/vlak-react";

export function LeaseExchange() {
  return <>
    <Response from="user">When does the lease renew?</Response>
    <Response from="assistant" status="complete" actions={<ResponseActions text="The lease renews on 1 October." />}>
      <p>The lease renews on <strong>1 October</strong>.</p>
    </Response>
  </>;
}
```

## Props

### Response

One message with application-rendered content and a separate status announcement.

Extends `HTMLAttributes<HTMLElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `from` | `"user" \| "assistant"` | `"assistant"` | The speaker's identity, separate from the native ARIA role. |
| `author` | `ReactNode` |  |  |
| `status` | `ResponseStatus` | `"complete"` |  |
| `statusLabel` | `string` |  | A short status phrase. Keep token-by-token updates in children. |
| `errorMessage` | `string` |  |  |
| `copyText` | `string` |  | Explicit text to copy. Omit to hide the copy action. |
| `copyLabel` | `string` | `"Copy response"` |  |
| `copiedLabel` | `string` | `"Copied"` |  |
| `copyErrorLabel` | `string` | `"Could not copy. Try again."` |  |
| `actions` | `ReactNode` |  | Application-owned actions, such as retry or feedback buttons. |
| `children` | `ReactNode` |  | Rendered content. Supply your own markdown renderer here when needed. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Reaches the optional copy button, supplied actions, and links in the rendered content. |
| Enter, Space on Copy response | Copies the explicit copyText value and reports success only after the clipboard write resolves. |

## Accessibility

- A semantic article is named by its visible speaker. from identifies user or assistant without taking over the native role attribute.
- Status is a separate polite, atomic live region. Changing response tokens are ordinary readable content and do not repeat the whole message through a live region.
- The streaming, complete, error, and stopped states are supplied by the application. An errorMessage is visible when status is error; the short response status announces the failure.
- Copy is shown only with copyText. Clipboard denial or unavailability reports a readable failure and allows retry. Pending writes prevent duplicate activation, and stale writes cannot announce success for new content.
- The 44px copy control has a focus outline and forced-colors styling. Native article attributes, className, style, and the article ref are forwarded.

## Classes

`rs-response`, `rs-response-user`, `rs-response-header`, `rs-response-author`, `rs-response-status`, `rs-response-content`, `rs-response-error`, `rs-response-actions`, `rs-response-copy`, `rs-response-copy-status`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/response.tsx`  
CSS: `packages/core/css/components/response.css`
