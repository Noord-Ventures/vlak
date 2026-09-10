# Sources

A counted native disclosure of application-supplied references, descriptions and supporting quotes.

Category: ai  
Name: `sources`  
Also known as: AI Elements Sources, Source list, References, Citations  
Page: https://vlak.dev/ai/sources/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Present the references an application used to support an answer.
- Supply stable ids, titles, URLs and optional descriptions or exact source quotes.
- The native disclosure composes Refs and RefItem. Use open/onToggle or defaultOpen for disclosure state.
- Web URLs and document-relative links are accepted; executable schemes are not rendered as links.
- Links open a new tab with opener isolation. CSS-only markup retains native disclosure and link behavior.

## When not to

- Presenting an unverified model-generated URL as an independently checked source.
- Fetching sources or inferring quotations inside the component.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { sourceHref, Sources } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add sources
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/sources.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<details class="rs-sources rs-disclosure"><summary class="rs-disclosure-summary">Sources (1)</summary><ol class="rs-refs rs-sources-list"><li class="rs-cite-item"><a class="rs-sources-link" href="https://example.com/brief" target="_blank" rel="noopener noreferrer">Project brief</a></li></ol></details>
```

## Example

```tsx
import { Sources } from "@noorddev/vlak-react";

<Sources defaultOpen sources={[
  { id: "brief", title: "Project brief", url: "https://example.com/brief", description: "Scope and owners", quote: "Every decision has an owner." },
]} />
```

## Props

### Sources

A counted native disclosure of application-supplied source links and optional quotes.

Extends `Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDetailsElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `sources` (required) | `readonly CitationSource[]` |  |  |
| `label` | `string` | `"Sources"` |  |
| `defaultOpen` | `boolean` | `false` |  |

### Functions

- `sourceHref` (function): External web addresses and document-relative references; executable URL schemes are omitted.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Reaches the source summary and visible reference links |
| Enter, Space | Opens or closes the native source disclosure |
| Enter on a link | Opens the chosen reference in a new tab |

## Accessibility

- The summary includes the number of supplied references. An ordered list preserves source order and optional blockquotes identify quoted text.
- Source links have 44px minimum height and identify new-tab behavior in their accessible name.
- Native details attributes and its ref are forwarded.

## Classes

`rs-sources`, `rs-sources-list`, `rs-sources-link`, `rs-sources-description`, `rs-sources-quote`, `rs-sources-empty`

## Dependencies

Registry dependencies: [collapsible](collapsible.md), [references](references.md).  
React: `packages/react/src/components/sources.tsx`  
CSS: `packages/core/css/components/sources.css`
