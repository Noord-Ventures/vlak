# Tag input

Creates and removes freeform text tokens with paste splitting, duplicate prevention, and validation.

Category: forms  
Name: `tag-input`  
Also known as: TagInput, Token input, Chips input, Freeform tags  
Page: https://vlak.dev/components/tag-input/

## When to use

- Short freeform labels, recipients, or keywords.
- Comma-separated or newline-separated pasted values that should become distinct tokens.

## When not to

- A fixed vocabulary; use MultiSelect.
- Long prose; use Textarea.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { TagInput } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add tag-input
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/tag-input.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-tag-input"><label class="rs-tag-input-label" for="project-tags">Project tags</label><ul class="rs-tag-input-list" aria-label="Current tags"><li class="rs-tag-input-tag">Design<button class="rs-btn-ghost rs-tag-input-remove" type="button" aria-label="Remove Design">×</button></li></ul><div class="rs-tag-input-row"><input class="rs-input rs-tag-input-input" id="project-tags" placeholder="Add a tag" /><button class="rs-btn-ghost rs-tag-input-add" type="button">Add</button></div></div>
```

## Example

```tsx
import { TagInput } from "@noorddev/vlak-react";

<TagInput label="Project tags" name="tags" defaultValue={["Research", "Design"]} maxTags={5} validate={(tag) => tag.length > 24 ? "Use 24 characters or fewer" : undefined} />
```

## Props

### TagInput

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string[]` |  |  |
| `defaultValue` | `string[]` | `[]` |  |
| `onValueChange` | `(value: string[]) => void` |  |  |
| `label` | `ReactNode` | `"Tags"` |  |
| `name` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `placeholder` | `string` | `"Add a tag"` |  |
| `maxTags` | `number` |  |  |
| `validate` | `(tag: string) => string` |  | Return an error for an invalid token, or undefined to accept it. |
| `addLabel` | `string` | `"Add"` |  |
| `removeLabel` | `(tag: string) => string` | `(tag) => \`Remove ${tag}\`` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Enter, comma | Commits a trimmed draft as a tag without submitting the form. |
| Backspace in an empty input | Focuses the last tag's remove button. |
| Escape | Clears the current draft and its error. |
| Tab, Enter, Space | Reaches and activates named Add and Remove buttons. |

## Accessibility

- The forwarded ref reaches the text input. Each 44px remove target is named with its tag.
- Exact duplicate tags are ignored; validate and maxTags reject an addition while preserving the draft and exposing an alert.
- Hidden fields submit each tag under name. Form reset restores uncontrolled tags and clears the draft.
- Keyboard composition is respected; Enter does not commit while an input method is composing text.

## Classes

`rs-tag-input`, `rs-tag-input-label`, `rs-tag-input-list`, `rs-tag-input-tag`, `rs-tag-input-remove`, `rs-tag-input-row`, `rs-tag-input-input`, `rs-tag-input-add`, `rs-tag-input-feedback`

## Dependencies

Registry dependencies: [input](input.md), [button](button.md), [icons](icons.md), [field](field.md).  
React: `packages/react/src/components/tag-input.tsx`  
CSS: `packages/core/css/components/tag-input.css`
