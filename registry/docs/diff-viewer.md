# Diff viewer

Compares text revisions in unified or split rows with explicit change labels.

Category: content  
Name: `diff-viewer`  
Also known as: DiffViewer  
Page: https://vlak.dev/components/diff-viewer/

## When to use

- Reviewing configuration, document, or code changes.

## When not to

- Rich document editing or merging conflicts.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { diffLines, DiffViewer } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add diff-viewer
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/diff-viewer.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-diff-viewer"><div class="rs-diff-viewer-scroll" tabindex="0" role="region" aria-label="Changes"><table class="rs-diff-viewer-table"><caption>Changes</caption><thead><tr><th scope="col">Change</th><th scope="col">Content</th></tr></thead><tbody><tr class="rs-diff-viewer-change"><th scope="row">Added</th><td class="rs-diff-viewer-cell">range: 386</td></tr></tbody></table></div></div>
```

## Example

```tsx
import { DiffViewer } from "@noorddev/vlak-react";

<DiffViewer label="Configuration changes" before={"range: 368\nbattery: 84"} after={"range: 386\nbattery: 84"} />
```

## Props

### DiffViewer

Monochrome before/after comparison with explicit change labels, never color alone.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `before` (required) | `string` |  |  |
| `after` (required) | `string` |  |  |
| `label` | `string` | `"Changes"` |  |
| `view` | `"unified" \| "split"` |  |  |
| `defaultView` | `"unified" \| "split"` | `"unified"` |  |
| `onViewChange` | `(view: "unified" \| "split") => void` |  |  |
| `pageSize` | `number` | `200` | Maximum rendered rows per page, clamped to 1–1000. |

### Functions

- `diffLines` (function): Line LCS with bounded memory. Large changes use a truthful coarse replacement.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Tab reaches layout buttons, the scrollable comparison, and page controls; Enter or Space switches layout or moves between line pages. |

## Accessibility

- Table headers and explicit Added/Removed labels communicate changes without color. Large replacements use a bounded coarse diff. At most 200 rows render per page by default; pageSize is capped at 1000, with page ranges announced and all lines reachable through navigation.

## Classes

`rs-diff-viewer`, `rs-diff-viewer-header`, `rs-diff-viewer-tools`, `rs-diff-viewer-scroll`, `rs-diff-viewer-table`, `rs-diff-viewer-cell`, `rs-diff-viewer-change`, `rs-diff-viewer-number`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/diff-viewer.tsx`  
CSS: `packages/core/css/components/diff-viewer.css`
