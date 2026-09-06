# File browser

Explores a supplied file hierarchy through folders, breadcrumbs, search, and list or grid views.

Category: patterns  
Name: `file-browser`  
Also known as: FileBrowser, File explorer, Asset browser  
Page: https://vlak.dev/components/file-browser/

## When to use

- Browsing a supplied file tree and choosing a file.
- Folder-local search with consistent selection in list and grid views.

## When not to

- Direct filesystem access or cloud storage sync; the application supplies data and actions.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { FileBrowser } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add file-browser
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/file-browser.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-file-browser" role="region" aria-label="Files"><nav aria-label="Folder breadcrumbs">Files</nav><ul class="rs-file-browser-list"><li><button class="rs-file-browser-item" type="button" aria-pressed="false">Cover.pdf</button></li></ul></div>
```

## Example

```tsx
import { FileBrowser } from "@noorddev/vlak-react";

<FileBrowser entries={[{ id: "design", name: "Design", kind: "folder", children: [{ id: "cover", name: "Cover.pdf", kind: "file", size: "1.2 MB" }] }]} onOpen={openFile} />
```

## Props

### FileBrowser

A controlled file collection with folder tree, breadcrumbs, search, and list or grid views.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onSelect">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `entries` (required) | `BrowserEntry[]` |  |  |
| `label` | `string` | `"Files"` |  |
| `rootLabel` | `string` | `"Files"` | Visible root-folder name, separate from the accessible browser label. |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `onValueChange` | `(id: string) => void` |  |  |
| `folder` | `string \| null` |  |  |
| `defaultFolder` | `string \| null` | `null` |  |
| `onFolderChange` | `(id: string \| null) => void` |  |  |
| `onOpen` | `(entry: BrowserEntry) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Arrow keys, Home, End, type-ahead | Navigates the folder tree using its roving focus behavior. |
| Tab, Enter, Space | Uses breadcrumbs, selects files, switches view, and activates Open selected. |

## Accessibility

- Folder tree, breadcrumbs, search, and file collection each have names.
- label names the region and its landmarks; rootLabel supplies the visible root folder name.
- Selected files use aria-pressed and a full surface change.
- Files can be opened by an explicit keyboard-operable action as well as double click.

## Classes

`rs-file-browser`, `rs-file-browser-toolbar`, `rs-file-browser-breadcrumbs`, `rs-file-browser-path`, `rs-file-browser-crumb-item`, `rs-file-browser-crumb`, `rs-file-browser-crumb-current`, `rs-file-browser-action`, `rs-file-browser-body`, `rs-file-browser-tree`, `rs-file-browser-content`, `rs-file-browser-list`, `rs-file-browser-grid`, `rs-file-browser-name`, `rs-file-browser-meta`, `rs-file-browser-empty`, `rs-file-browser-view-active`, `rs-file-browser-item`, `rs-file-browser-tile`, `rs-file-browser-selected`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md), [input](input.md), [tree-view](tree-view.md).  
React: `packages/react/src/components/file-browser.tsx`  
CSS: `packages/core/css/components/file-browser.css`
