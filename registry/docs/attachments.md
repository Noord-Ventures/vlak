# Attachments

A responsive file list with image, audio, and video previews, file metadata, removal, and application-owned upload states.

Category: ai  
Name: `attachments`  
Also known as: AI Elements Attachments, File attachments, Attachment preview, Message files  
Page: https://vlak.dev/ai/attachments/

## When to use

- Compose Attachment items inside Attachments for files in a message, a draft, or a tool result.
- Choose grid, inline, or list layout through variant. Items inherit that layout and can override it individually.
- Supply stable data IDs, readable filenames, media types, and optional web or local preview addresses.
- Use useFileAttachments with a browser File array to create local previews with automatic cleanup.
- Set status, progress, error, and onRetry from an application upload process. Native audio and video controls let the reader start playback.
- Use preview for application-specific media content, including captions and transcripts where available.

## When not to

- Treating removal or retry controls as an upload service. The application owns those operations.
- Passing untrusted script addresses, or revoking preview addresses created by a different owner.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Attachment, Attachments, useFileAttachments } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add attachments
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/attachments.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<ul class="rs-attachments" aria-label="Attachments"><li class="rs-attachment"><div class="rs-attachment-row"><div class="rs-attachment-info"><p class="rs-attachment-name">Project brief.txt</p><p class="rs-attachment-detail">text/plain · 342 bytes</p></div></div></li></ul>
```

## Example

```tsx
"use client";
import { useState } from "react";
import { Attachment, Attachments, Button } from "@noorddev/vlak-react";

export function DraftFiles() {
  const [visible, setVisible] = useState(true);
  return visible ? <Attachments>
    <Attachment data={{ id: "brief", name: "Project brief.txt", mediaType: "text/plain", size: 342 }} onRemove={() => setVisible(false)} />
  </Attachments> : <Button variant="subtle" onClick={() => setVisible(true)}>Reset file</Button>;
}
```

## Props

### Attachment

File metadata and native media previews, with explicit application actions.

Extends `HTMLAttributes<HTMLLIElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLLIElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `AttachmentData` |  |  |
| `variant` | `AttachmentVariant` |  | Overrides the layout inherited from Attachments. |
| `disabled` | `boolean` | `false` |  |
| `onRemove` | `() => void` |  |  |
| `onRetry` | `() => void` |  |  |
| `preview` | `ReactNode` |  | Trusted application content replaces the automatic media preview. |

### Attachments

A responsive list of application-owned files and media.

Extends `HTMLAttributes<HTMLUListElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLUListElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `"Attachments"` |  |
| `variant` | `AttachmentVariant` | `"grid"` |  |

### Functions

- `useFileAttachments` (hook): Creates local preview URLs and revokes them when files leave the list or the owner unmounts.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Reaches file links, native media controls, retry, and remove actions. |
| Enter, Space | Activates the focused file action or native media control. |

## Accessibility

- The named list preserves file grouping. Filenames identify file links and action buttons.
- Images use decorative thumbnails beside their readable filenames. Audio and video use named native controls without autoplay.
- Upload status and errors are announced separately from file content. Determinate progress has a file-specific accessible name.
- Removal and retry have 44px targets and visible focus inherited from Button. Native list and item attributes, className, style, and refs pass through.
- useFileAttachments preserves file identity and revokes owned preview addresses when files are removed or the owner unmounts.

## Classes

`rs-attachments`, `rs-attachments-grid`, `rs-attachments-inline`, `rs-attachments-list`, `rs-attachment-inline`, `rs-attachment-list`, `rs-attachment-thumbnail-inline`, `rs-attachment-detail-inline`, `rs-attachment-media-inline`, `rs-attachment`, `rs-attachment-row`, `rs-attachment-thumbnail`, `rs-attachment-file-icon`, `rs-attachment-info`, `rs-attachment-name`, `rs-attachment-detail`, `rs-attachment-action`, `rs-attachment-media`, `rs-attachment-link`, `rs-attachment-status`, `rs-attachment-progress`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md).  
React: `packages/react/src/components/attachments.tsx`  
CSS: `packages/core/css/components/attachments.css`
