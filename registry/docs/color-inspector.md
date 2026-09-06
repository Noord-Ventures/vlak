# Color inspector

Edits a six-digit hex color and alpha with a data-driven preview, a transparency ground, and native form validation.

Category: creative  
Name: `color-inspector`  
Also known as: ColorInspector, Color input, Hex editor, Alpha control, Fill inspector, Color swatch  
Page: https://vlak.dev/components/color-inspector/

## When to use

- Application-owned color data; only the swatch uses the supplied hue, while the inspector shell stays monochrome.
- Six-digit hex including #, with alpha from zero transparent to one opaque.
- onValueChange receives editable input; incomplete alpha is null and invalid hex remains available for correction.

## When not to

- Assuming color-space conversion, gamut checking, contrast certification, or color-profile management.
- Presenting a valid preview when the supplied color or alpha is invalid.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ColorInspector } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add color-inspector
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/color-inspector.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-color-inspector"><legend class="rs-color-inspector-label">Fill</legend><div class="rs-color-inspector-preview" aria-hidden="true"><span class="rs-color-inspector-swatch" style="background-color:#808080;opacity:0.5"></span></div><div class="rs-color-inspector-fields"><label class="rs-color-inspector-field">Hex<input class="rs-input rs-input-full rs-color-inspector-input" type="text" value="#808080" pattern="#[0-9a-fA-F]{6}" required /></label><label class="rs-color-inspector-field">Alpha<input class="rs-input rs-input-full rs-color-inspector-input" type="number" value="0.5" min="0" max="1" step="any" required /></label></div></fieldset>
```

## Example

```tsx
import { ColorInspector } from "@noorddev/vlak-react";

<ColorInspector label="Fill" name="fill" defaultValue={{ hex: "#808080", alpha: 0.5 }} />
```

## Props

### ColorInspector

A data swatch and editable six-digit hex and alpha, on a monochrome shell.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `value` | `InspectorColor` |  |  |
| `defaultValue` | `InspectorColor` | `initial` |  |
| `onValueChange` | `(value: InspectorColor) => void` |  | Receives editable hex text and alpha, including incomplete values. |
| `readOnly` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between the native hex and alpha inputs. |
| Text editing keys | Edits or selects hex and alpha values; any alpha precision from 0 to 1 is accepted. |

## Accessibility

- A fieldset and legend name the color; hex and alpha are labelled native controls with 44px targets.
- The decorative swatch has an explicit text equivalent and preserves caller-owned color in forced colors.
- Pattern, required, and numeric bounds supply native form validation; invalid data suppresses the swatch.
- Controlled and uncontrolled values support form reset; the ref and native attributes reach the fieldset.

## Classes

`rs-color-inspector`, `rs-color-inspector-label`, `rs-color-inspector-preview`, `rs-color-inspector-swatch`, `rs-color-inspector-fields`, `rs-color-inspector-field`, `rs-color-inspector-input`, `rs-color-inspector-note`

## Dependencies

Registry dependencies: [input](input.md).  
React: `packages/react/src/components/color-inspector.tsx`  
CSS: `packages/core/css/components/color-inspector.css`
