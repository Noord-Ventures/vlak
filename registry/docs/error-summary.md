# Error summary

Summarizes invalid fields and moves focus to their inputs.

Category: feedback  
Name: `error-summary`  
Also known as: ErrorSummary  
Page: https://vlak.dev/components/error-summary/

## When to use

- Failed form submissions with errors across several fields.

## When not to

- Validation on every keystroke; keep inline field feedback nearby.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ErrorSummary } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add error-summary
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/error-summary.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-error-summary" role="alert" aria-labelledby="error-title" tabindex="-1"><h2 id="error-title" class="rs-error-summary-title">Check the following fields</h2><ul class="rs-error-summary-list"><li><a class="rs-error-summary-link" href="#email">Enter an email address</a></li></ul></div>
```

## Example

```tsx
import { ErrorSummary } from "@noorddev/vlak-react";

<ErrorSummary errors={[{ id: "email", message: "Enter an email address" }]} />
```

## Props

### ErrorSummary

A form-wide summary linking each message to the field that needs attention.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `errors` (required) | `FormError[]` |  |  |
| `title` | `ReactNode` | `"Check the following fields"` |  |
| `autoFocus` | `boolean` | `false` | Move focus to the summary after a failed submission, not while typing. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Tab reaches each field link; Enter focuses the corresponding input. |

## Accessibility

- Uses role alert with a heading. autoFocus is opt-in for failed submission, not continuous validation.

## Classes

`rs-error-summary`, `rs-error-summary-title`, `rs-error-summary-list`, `rs-error-summary-link`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/error-summary.tsx`  
CSS: `packages/core/css/components/error-summary.css`
