# Response branch

Navigates saved response alternatives with stable identity, previous and next controls, and a readable position.

Category: ai  
Name: `response-branch`  
Also known as: AI Elements MessageBranch, Response alternatives, Message versions, Response pagination  
Page: https://vlak.dev/ai/response-branch/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Compare existing assistant responses or application-supplied alternatives without losing their identity.
- Use value and onValueChange for application-owned selection, or defaultValue for an initial preference.
- Keep branch IDs stable when responses are reordered or new alternatives arrive.
- Compose retry and editing actions in branch content. The application owns generation, persistence, and conversation history.

## When not to

- Assuming changing a branch calls a model, deletes a response, or rewrites subsequent messages.
- Using array position as a persistent branch identity.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ResponseBranch } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add response-branch
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/response-branch.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-response-branch"><div class="rs-response-branch-content" id="branch-content"><p>Give each decision an owner and a next step.</p></div><div class="rs-response-branch-controls" role="group" aria-label="Response alternatives"><button class="rs-btn-subtle rs-response-branch-action" type="button" disabled aria-label="Previous response" aria-controls="branch-content">‹</button><span class="rs-response-branch-position" role="status" aria-live="polite">1 / 2</span><button class="rs-btn-subtle rs-response-branch-action" type="button" aria-label="Next response" aria-controls="branch-content">›</button></div></div>
```

## Example

```tsx
import { Response, ResponseBranch } from "@noorddev/vlak-react";

<ResponseBranch branches={[
  { id: "first", content: <Response>Give each decision an owner.</Response> },
  { id: "second", content: <Response>Start with a clear review flow.</Response> },
]} />
```

## Props

### ResponseBranch

Navigates application-owned response alternatives without changing conversation history.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `branches` (required) | `readonly ResponseBranchItem[]` |  |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `label` | `string` | `"Response alternatives"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Reaches available previous and next buttons and interactive content in the selected response. |
| Enter, Space | Requests the adjacent response through the focused native button. |

## Accessibility

- The named control group exposes descriptive 44px buttons. Boundary controls are disabled.
- A short polite status announces the selected position, while message content stays outside the live region.
- Only the selected response is rendered. Controlled values stay authoritative until the application accepts a request.
- Empty and single-branch states omit navigation. Native root attributes, className, style, and the div ref pass through.

## Classes

`rs-response-branch`, `rs-response-branch-content`, `rs-response-branch-controls`, `rs-response-branch-action`, `rs-response-branch-icon`, `rs-response-branch-position`, `rs-response-branch-empty`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/response-branch.tsx`  
CSS: `packages/core/css/components/response-branch.css`
