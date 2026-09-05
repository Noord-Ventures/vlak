# File upload

Collects validated files through browse or drop, with optional upload progress, cancellation, and retry.

Category: forms  
Name: `file-upload`  
Also known as: FileUpload, Drop zone, Attachment upload, File input  
Page: https://vlak.dev/components/file-upload/

## When to use

- Validated attachment queues with native file browsing and drag-and-drop.
- Provide onUpload when the app has a transport; it receives an AbortSignal and progress callback.

## When not to

- Assuming files upload automatically; without onUpload this only collects selected files.
- Client checks as security enforcement; validate uploaded files again on the server.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { FileUpload } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add file-upload
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/file-upload.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-file-upload"><div class="rs-file-upload-drop"><span class="rs-file-upload-title">Choose files</span><span class="rs-file-upload-description" id="files-hint">Drop files here or browse</span><input class="rs-file-upload-input" type="file" multiple aria-label="Choose files" aria-describedby="files-hint" /></div></div>
```

## Example

```tsx
import { FileUpload } from "@noorddev/vlak-react";

<FileUpload label="Project files" name="attachments" accept=".pdf,.txt" maxFiles={5} maxSize={10 * 1024 * 1024} description="PDF or text, up to 10 MB each" />
```

## Props

### FileUpload

Validated file selection, with an optional cancellable upload transport.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `File[]` |  |  |
| `defaultValue` | `File[]` | `[]` |  |
| `onValueChange` | `(files: File[]) => void` |  |  |
| `accept` | `string` |  |  |
| `multiple` | `boolean` | `true` |  |
| `maxFiles` | `number` |  |  |
| `maxSize` | `number` |  |  |
| `disabled` | `boolean` |  |  |
| `name` | `string` |  |  |
| `label` | `string` | `"Choose files"` |  |
| `description` | `ReactNode` | `"Drop files here or browse"` |  |
| `onReject` | `(rejections: FileUploadRejection[]) => void` |  |  |
| `onUpload` | `(file: File, context: FileUploadContext) => Promise<void>` |  | Optional transport supplied by the app. Omit to collect files without uploading. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Reaches the native file picker and labeled Remove, Cancel, and Retry actions. |

## Accessibility

- The native file input covers the drop target, remains keyboard-focusable, and receives the forwarded ref.
- Rejected types, sizes and counts produce readable errors. Upload status is announced; progress bars are named with the file.
- The app supplies onUpload(file, { signal, onProgress }). Cancel aborts the signal; errors retain the file and expose Retry.
- With name, the browser's formdata event appends the accepted queue to native FormData. Use multipart/form-data for native file submission. Disabled queues are omitted.
- Form reset restores uncontrolled files, clears errors and aborts active uploads. Unmount aborts outstanding transports.

## Classes

`rs-file-upload`, `rs-file-upload-drop`, `rs-file-upload-drag`, `rs-file-upload-input`, `rs-file-upload-title`, `rs-file-upload-description`, `rs-file-upload-list`, `rs-file-upload-item`, `rs-file-upload-row`, `rs-file-upload-name`, `rs-file-upload-actions`, `rs-file-upload-action`, `rs-file-upload-status`

## Dependencies

Registry dependencies: [button](button.md), [progress](progress.md).  
React: `packages/react/src/components/file-upload.tsx`  
CSS: `packages/core/css/components/file-upload.css`
