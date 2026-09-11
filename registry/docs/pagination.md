# Pagination

Moves through paginated content. Square controls; the current page fills with ink.

Category: navigation  
Name: `pagination`  
Also known as: Pagination, Pager, Page navigation  
Page: https://vlak.dev/components/pagination/

## When to use

- Paged lists and tables where the user needs to jump to a specific page.
- siblings to widen the window around the current page.

## When not to

- Feeds that load more on scroll.
- Fewer than three pages; a previous and next pair is enough.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Pagination } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add pagination
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/pagination.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-pages"><span class="rs-page"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 3.75 L5.5 8.25 L10.5 12.75" vector-effect="non-scaling-stroke"/></svg></span><span class="rs-page rs-page-on">1</span><span class="rs-page">2</span><span class="rs-page"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 3.75 L10.5 8.25 L5.5 12.75" vector-effect="non-scaling-stroke"/></svg></span></div>
```

## Example

```tsx
import { useState } from "react";
import { Pagination } from "@noorddev/vlak-react";

const [page, setPage] = useState(1);

<Pagination page={page} count={12} onPageChange={setPage} siblings={1} />
```

## Props

### Pagination

Extends `HTMLAttributes<HTMLElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `page` (required) | `number` |  | Current 1-based page. |
| `count` (required) | `number` |  |  |
| `onPageChange` | `(page: number) => void` |  |  |
| `siblings` | `number` | `1` | Pages kept visible around the current one. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between the page buttons |
| Enter, Space | Goes to that page |

## Accessibility

- Renders <nav aria-label="Pagination"> of native buttons; the current page carries aria-current="page".
- Previous and next are labelled and disabled at the ends; gaps are aria-hidden.

## Classes

`rs-pages`, `rs-page`, `rs-page-on`, `rs-page-gap`, `rs-pages-icon`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/pagination.tsx`  
CSS: `packages/core/css/components/pagination.css`
