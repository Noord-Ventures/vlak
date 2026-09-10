# Web preview

Provides URL navigation, a sandboxed iframe and a collapsible console of supplied log messages.

Category: ai  
Name: `web-preview`  
Also known as: AI Elements Web Preview, Generated page preview, Iframe console  
Page: https://vlak.dev/ai/web-preview/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Preview a supplied http/https URL, local path or about:blank.
- Use url/onUrlChange for controlled navigation. Optional onBack/onForward callbacks and canGoBack/canGoForward flags let the host own history.
- Pass frameProps for explicit iframe permissions and native load/error events; the default does not grant same-origin access.
- Supply logs from a trusted application channel. maxLogEntries bounds the visible console tail.

## When not to

- Evaluating JavaScript URLs or embedding executable data URLs in the address field.
- Claiming automatic console capture from a cross-origin iframe.
- Treating iframe load as proof that a provider page accepted framing or successfully ran its application.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { isPreviewUrl, WebPreview } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add web-preview
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/web-preview.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-web-preview" aria-label="Calendar preview"><div class="rs-web-preview-body"><iframe class="rs-widget-embed" title="Calendar preview" src="about:blank" sandbox="allow-scripts allow-forms" loading="lazy" referrerpolicy="no-referrer"></iframe></div><p class="rs-web-preview-status" role="status">Preview loaded.</p></section>
```

## Example

```tsx
import { WebPreview } from "@noorddev/vlak-react";

<WebPreview title="Generated page" defaultUrl="about:blank" frameProps={{ height: 320 }} logs={[{ level: "info", message: "Preview ready" }]} />
```

## Props

### WebPreview

URL navigation and a sandboxed iframe with host-supplied console messages.

Extends `Omit<HTMLAttributes<HTMLElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | `"Web preview"` |  |
| `url` | `string` |  |  |
| `defaultUrl` | `string` | `"about:blank"` |  |
| `onUrlChange` | `(url: string) => void` |  |  |
| `onBack` | `() => void` |  |  |
| `onForward` | `() => void` |  |  |
| `canGoBack` | `boolean` | `false` |  |
| `canGoForward` | `boolean` | `false` |  |
| `onReload` | `() => void` |  |  |
| `logs` | `WebPreviewLog[]` | `[]` |  |
| `maxLogEntries` | `number` | `200` |  |
| `frameProps` | `Omit<DetailedHTMLProps<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>, "title" \| "children" \| "src" \| "srcDoc">` |  | iframe permissions remain application-controlled; scripts and forms are allowed without same-origin access by default. |

### Functions

- `isPreviewUrl` (function)

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab reaches enabled navigation controls, the address, iframe and console disclosure. |
| Enter, Space | Enter in the address field requests navigation; Enter or Space activates the focused button. |

## Accessibility

- The iframe, address, navigation form and console list have accessible names.
- URL validation is visible and invalid protocols never reach iframe src.
- Controlled navigation leaves the previous source in place until the host supplies a new url.
- Log levels use text and messages are escaped; history and external application behavior remain host-owned.

## Classes

`rs-web-preview`, `rs-web-preview-navigation`, `rs-web-preview-address`, `rs-web-preview-body`, `rs-web-preview-status`, `rs-web-preview-console`, `rs-web-preview-logs`, `rs-web-preview-log`, `rs-web-preview-level`, `rs-web-preview-message`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md), [input](input.md), [collapsible](collapsible.md), [widget](widget.md).  
React: `packages/react/src/components/web-preview.tsx`  
CSS: `packages/core/css/components/web-preview.css`
