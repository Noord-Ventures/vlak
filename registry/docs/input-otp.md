# One-time code

Collects a one-time code in one cell per character. Supports auto-advance, backspace, and paste.

Category: forms  
Name: `input-otp`  
Also known as: One-time code, OTP input, InputOTP, PIN input, Verification code  
Page: https://vlak.dev/components/input-otp/

## When to use

- Numeric verification codes from SMS, mail, or an authenticator.
- onComplete to submit as soon as the last cell fills.

## When not to

- Alphanumeric codes; the cells strip non-digits.
- Passwords; use Input type="password".

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { InputOTP } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add input-otp
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/input-otp.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-otp" role="group" aria-label="One-time code"><input class="rs-otp-cell" maxlength="1" value="8" aria-label="Digit 1" /><input class="rs-otp-cell" maxlength="1" value="2" aria-label="Digit 2" /><input class="rs-otp-cell" maxlength="1" aria-label="Digit 3" /><input class="rs-otp-cell" maxlength="1" aria-label="Digit 4" /></div>
```

## Example

```tsx
import { InputOTP } from "@noorddev/vlak-react";

<InputOTP length={6} aria-label="One-time code" onComplete={(code) => verify(code)} />
```

## Props

### InputOTP

One cell per character. Auto-advance, backspace, paste.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `length` | `number` | `6` |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `(code: string) => void` |  |  |
| `name` | `string` |  |  |
| `disabled` | `boolean` | `false` |  |
| `readOnly` | `boolean` | `false` |  |
| `onChange` | `(code: string) => void` |  | Deprecated. Use onValueChange. |
| `onComplete` | `(code: string) => void` |  | Called once every cell is filled. |
| `aria-label` | `string` | `"One-time code"` | Defines a string value that labels the current element. |

## Keyboard

| Keys | Does |
| --- | --- |
| Type a digit | Fills the cell and moves to the next |
| Backspace | Clears the cell; on an empty cell moves back and clears the previous one |
| Arrow left, Arrow right | Moves between cells |
| Paste | Fills from the current cell onward |

## Accessibility

- Renders role="group" named by aria-label ("One-time code" by default); each cell is an <input> named "Digit n".
- inputMode="numeric" and autoComplete="one-time-code" on the first cell let phones offer the code.
- Inside Field, hint and error reach the group and cells through aria-describedby and aria-invalid.
- Controlled with value and onValueChange, or uncontrolled with defaultValue; name submits one hidden complete-code value. disabled and readOnly apply to every cell.
- Each cell has a 44px target and 4px corners. length is clamped to 1–12; onComplete fires once per distinct complete code until it changes.

## Classes

`rs-otp`, `rs-otp-cell`, `rs-otp-cell-invalid`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/input-otp.tsx`  
CSS: `packages/core/css/components/input-otp.css`
