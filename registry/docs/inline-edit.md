# Inline edit

Switches a text value into an editor with explicit save and cancel, validation, and optional async persistence.

Category: forms  
Name: `inline-edit`  
Also known as: InlineEdit, Editable text, Click to edit  
Page: https://vlak.dev/components/inline-edit/

## When to use

- A short text value edited in its reading context.
- Provide onSave to await persistence before committing a new value.

## When not to

- Long-form writing; use Textarea.
- Implicit save-on-blur flows; this requires an explicit save.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { InlineEdit } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add inline-edit
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/inline-edit.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-inline-edit"><span class="rs-inline-edit-label">Project name</span><div class="rs-inline-edit-row"><span class="rs-inline-edit-value">Field study</span><button class="rs-btn-ghost rs-inline-edit-action" type="button" aria-label="Edit Project name">Edit</button></div></div>
```

## Example

```tsx
import { InlineEdit } from "@noorddev/vlak-react";

<InlineEdit label="Project name" name="project" defaultValue="Field study" validate={(value) => value.trim() ? undefined : "Enter a project name"} />
```

## Props

### InlineEdit

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `label` | `string` | `"Value"` |  |
| `name` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `placeholder` | `string` | `"Not set"` |  |
| `validate` | `(value: string) => string` |  |  |
| `onSave` | `(value: string) => void \| Promise<void>` |  | Resolves before the value is committed. Rejections leave the draft editable. |
| `editLabel` | `string` | `"Edit"` |  |
| `saveLabel` | `string` | `"Save"` |  |
| `cancelLabel` | `string` | `"Cancel"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Enter, Space on Edit | Opens the editor, focuses the input and selects its text. |
| Enter in the editor | Validates and saves without submitting the enclosing form. |
| Escape in the editor | Discards the draft and returns focus to Edit. |

## Accessibility

- The input is named by the visible label. Save errors preserve the draft and appear as alerts.
- Successful save and cancel return focus to Edit. Pending saves disable duplicate actions and expose aria-busy.
- Hidden name submits only the committed value. Form reset restores uncontrolled defaults and discards drafts; late pending responses do not reapply them.
- The forwarded ref reaches the root div. No nested form is introduced.

## Classes

`rs-inline-edit`, `rs-inline-edit-row`, `rs-inline-edit-label`, `rs-inline-edit-value`, `rs-inline-edit-input`, `rs-inline-edit-action`, `rs-inline-edit-error`

## Dependencies

Registry dependencies: [input](input.md), [button](button.md).  
React: `packages/react/src/components/inline-edit.tsx`  
CSS: `packages/core/css/components/inline-edit.css`
