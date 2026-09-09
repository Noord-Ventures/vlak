# Response

Presents user messages in right-aligned soft bubbles and assistant responses on the left, with speaker identity, avatars, status, actions, and a custom layout API.

Category: ai  
Name: `response`  
Also known as: AI response, Chat message, Assistant message, AI Elements Message, Streaming response  
Page: https://vlak.dev/ai/response/

## When to use

- A user or assistant message whose content and response status come from the application.
- Pass plain text or rendered React content as children. To render markdown, supply an external markdown renderer in the children slot and configure its content and link safety in your application.
- Place ResponseActions in actions for icon controls that copy, narrate, rate, and share the response. Omit copyText when using that action bar.
- Use avatar for an application-owned visual and renderLayout to rearrange ResponseParts. Render the complete header or its avatar, author, and status parts once; retain content, errors, and actions.
- useResponse reads speaker, author, status, statusLabel, and errorMessage from a descendant. It requires a surrounding Response.
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
import { Response, useResponse } from "@noorddev/vlak-react";
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
<article class="rs-response" aria-labelledby="response-author"><div class="rs-response-header"><div class="rs-response-identity"><span class="rs-response-avatar" aria-hidden="true"><svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor"><circle cx="10" cy="10" r="7" /></svg></span><span class="rs-response-author" id="response-author">Assistant</span></div><span class="rs-response-status" role="status" aria-live="polite" aria-atomic="true">Complete</span></div><div class="rs-response-content"><p>The lease renews on 1 October.</p></div></article>
```

## Example

```tsx
"use client";
import { Persona, Response, ResponseActions, useResponse } from "@noorddev/vlak-react";

function CompletedActions({ text }: { text: string }) {
  const { status } = useResponse();
  return status === "complete" ? <ResponseActions text={text} /> : null;
}

export function LeaseExchange() {
  return <>
    <Response from="user">When does the lease renew?</Response>
    <Response from="assistant" status="complete"
      avatar={<Persona variant="orb" size={20} />}
      actions={<CompletedActions text="The lease renews on 1 October." />}
      renderLayout={({ avatar, author, status, content, error, actions }) =>
        <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 12 }}>
          {avatar}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>{author}{status}</div>
            {content}{error}{actions}
          </div>
        </div>}
    >
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
| `avatar` | `ReactNode` |  | An application-owned avatar beside the author. |
| `status` | `ResponseStatus` | `"complete"` |  |
| `statusLabel` | `string` |  | A short status phrase. Keep token-by-token updates in children. |
| `errorMessage` | `string` |  |  |
| `copyText` | `string` |  | Explicit text to copy. Omit to hide the copy action. |
| `copyLabel` | `string` | `"Copy response"` |  |
| `copiedLabel` | `string` | `"Copied"` |  |
| `copyErrorLabel` | `string` | `"Could not copy. Try again."` |  |
| `actions` | `ReactNode` |  | Application-owned actions, such as retry or feedback buttons. |
| `renderLayout` | `(parts: ResponseParts, state: ResponseState) => ReactNode` |  | Rearranges the same content and controls. Render each part once; keep the status announcement. |
| `children` | `ReactNode` |  | Rendered content. Supply your own markdown renderer here when needed. |

### Functions

- `useResponse` (hook): Reads speaker and response status from a custom descendant without threading props.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Reaches the optional copy button, supplied actions, and links in the rendered content. |
| Enter, Space on Copy response | Copies the explicit copyText value and reports success only after the clipboard write resolves. |

## Accessibility

- A semantic article is named by its visible speaker. from identifies user or assistant without taking over the native role attribute.
- Custom layouts retain a fallback article name. Keep the supplied status part so phase changes remain announced, and give a non-text custom author an explicit accessible name when needed.
- Status is a separate polite, atomic live region. Changing response tokens are ordinary readable content and do not repeat the whole message through a live region.
- The streaming, complete, error, and stopped states are supplied by the application. An errorMessage is visible when status is error; the short response status announces the failure.
- Copy is shown only with copyText. Clipboard denial or unavailability reports a readable failure and allows retry. Pending writes prevent duplicate activation, and stale writes cannot announce success for new content.
- The 44px copy control has a focus outline and forced-colors styling. Native article attributes, className, style, and the article ref are forwarded.

## Classes

`rs-response`, `rs-response-user`, `rs-response-header`, `rs-response-identity`, `rs-response-avatar`, `rs-response-author`, `rs-response-status`, `rs-response-content`, `rs-response-error`, `rs-response-actions`, `rs-response-copy`, `rs-response-copy-status`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/response.tsx`  
CSS: `packages/core/css/components/response.css`
