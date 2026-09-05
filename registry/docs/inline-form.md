# Inline form

Pairs one field with an embedded submit action. The button appears after validation.

Category: patterns  
Name: `inline-form`  
Also known as: Inline form, Newsletter form, Subscribe form, Single-field form  
Page: https://vlak.dev/components/inline-form/

## When to use

- One value and one action: newsletter, invite by e-mail, join a waitlist.
- validate to decide when the action appears; the default is a loose e-mail check.

## When not to

- More than one field; use Form with Field.
- Actions needing a separate confirmation step; compose a Dialog before submitting.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { InlineForm } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add inline-form
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/inline-form.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-inline-field"><input class="rs-inline-input" placeholder="Your e-mail" /><span class="rs-reveal rs-reveal-in"><button class="rs-btn-primary rs-inline-btn">Subscribe</button></span></div>
```

## Example

```tsx
import { InlineForm } from "@noorddev/vlak-react";

<InlineForm
  placeholder="Your e-mail"
  buttonLabel="Subscribe"
  inputProps={{ "aria-label": "E-mail", type: "email" }}
  onSubmit={(email) => subscribe(email)}
/>
```

## Props

### InlineForm

One field, one action; asynchronous actions only confirm after they resolve.

Extends `Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFormElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placeholder` | `string` | `"Your e-mail"` |  |
| `buttonLabel` | `ReactNode` | `"Subscribe"` |  |
| `successLabel` | `ReactNode` | `"You're on the list"` |  |
| `pendingLabel` | `ReactNode` | `"Submitting…"` |  |
| `errorLabel` | `ReactNode` | `"Could not submit. Please try again."` |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `validate` | `(value: string) => boolean` | `(v) => /.+@.+\..+/.test(v)` | The action only appears once this returns true. Defaults to a loose e-mail check. |
| `onSubmit` | `(value: string) => void \| Promise<void>` |  |  |
| `inputProps` | `InputHTMLAttributes<HTMLInputElement>` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Enter | Submits once the value validates |
| Tab | Reaches the button only after the value validates |

## Accessibility

- The input is named by inputProps aria-label, falling back to the placeholder; use a clear persistent name.
- The submit button stays out of the tab order (tabIndex -1) until validate returns true.
- Submission awaits the onSubmit promise. aria-busy and pendingLabel indicate progress; duplicate submits are ignored, failure is an alert, and retry preserves the value.
- Success is a live status inside the same form, preserving its ref. Without an onSubmit handler the form cannot claim success.
- Controlled with value and onValueChange, or uncontrolled with defaultValue; native inputProps onChange is composed with internal state.

## Classes

`rs-inline-field`, `rs-inline-input`, `rs-inline-btn`, `rs-reveal`, `rs-reveal-in`, `rs-subscribed`, `rs-inline-field-btn`, `rs-inline-error`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/inline-form.tsx`  
CSS: `packages/core/css/components/inline-form.css`
