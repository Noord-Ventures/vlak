# Kerning pair editor

Edits supplied glyph-pair offsets in font units, with baseline and edited previews, bounded keyboard nudging, and one-step undo.

Category: creative  
Name: `kerning-pair-editor`  
Also known as: KerningPairEditor, Kerning editor, Glyph pair spacing, Font pair editor, Pair adjustment  
Page: https://vlak.dev/components/kerning-pair-editor/

## When to use

- Supplied glyph strings, a caller-selected font family, and explicit units per em.
- value/defaultValue/onValueChange as a map from pair id to offset; null or an absent entry means not supplied.
- baselineOffsets to compare and reset a pair; missing baselines never imply zero.
- Optional min/max bounds default to negative and positive units per em; typed values retain native validation.
- activePairId/defaultActivePairId/onActivePairChange for caller-owned pair navigation.

## When not to

- Treating the preview as a font shaping engine, font-file editor, or source of baseline kerning.
- Assuming a requested font is installed; the browser uses its normal font fallback.
- Undoing external host changes; undo is available only while the latest requested edit remains current.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { KerningPairEditor } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add kerning-pair-editor
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/kerning-pair-editor.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-kerning-pair-editor"><legend class="rs-kerning-pair-editor-legend">Pair spacing</legend><div class="rs-kerning-pair-editor-previews"><figure class="rs-kerning-pair-editor-preview"><figcaption class="rs-kerning-pair-editor-note">Edited: -80 units</figcaption><div class="rs-kerning-pair-editor-glyphs" style="font-family:Georgia,serif" role="img" aria-label="A followed by V, edited offset -80 units"><span class="rs-kerning-pair-editor-glyph" aria-hidden="true">A</span><span class="rs-kerning-pair-editor-glyph" aria-hidden="true" style="margin-inline-start:-0.08em">V</span></div></figure></div><label class="rs-kerning-pair-editor-field">Offset (font units)<input class="rs-input rs-input-full rs-kerning-pair-editor-input" type="number" value="-80" min="-1000" max="1000" step="any" /></label></fieldset>
```

## Example

```tsx
import { KerningPairEditor } from "@noorddev/vlak-react";

<KerningPairEditor label="Pair spacing" name="kerning" fontFamily="Georgia, serif" unitsPerEm={1000}
  pairs={[{ id: "av", left: "A", right: "V" }, { id: "to", left: "T", right: "o" }]}
  baselineOffsets={{ av: -60, to: -40 }} defaultValue={{ av: -80, to: -50 }} />
```

## Props

### KerningPairEditor

Explicit pair offsets with browser font previews, without font-file editing or shaping.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `pairs` (required) | `KerningPair[]` |  |  |
| `fontFamily` (required) | `string` |  |  |
| `unitsPerEm` (required) | `number` |  |  |
| `baselineOffsets` | `KerningOffsets` | `{}` |  |
| `value` | `KerningOffsets` |  |  |
| `defaultValue` | `KerningOffsets` | `{}` |  |
| `onValueChange` | `(offsets: KerningOffsets) => void` |  |  |
| `activePairId` | `string \| null` |  |  |
| `defaultActivePairId` | `string \| null` |  |  |
| `onActivePairChange` | `(id: string \| null) => void` |  |  |
| `min` | `number` | `-unitsPerEm` |  |
| `max` | `number` | `unitsPerEm` |  |
| `readOnly` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the pair selector, navigation, offset editor, reset, and undo actions. |
| Arrow left, Arrow right | Nudges the focused offset by one font unit within the supplied bounds. |
| Shift + Arrow left, Shift + Arrow right | Nudges the focused offset by ten font units. |
| Enter, Space | Activates the focused previous, next, reset, or undo button. |

## Accessibility

- A fieldset and legend name the editor; Vlak Select and Input controls have 44px targets.
- Baseline and edited offsets remain text, and each pair preview has an accessible description.
- Preview spacing is offset divided by units per em; intrinsic browser kerning and ligatures are disabled for the comparison.
- Missing or invalid font units suppress geometry; typed out-of-bounds values expose native validity and a visible explanation.
- The ref and native attributes reach the fieldset. Named offsets submit per pair; reset restores uncontrolled offsets and clears undo.

## Classes

`rs-kerning-pair-editor`, `rs-kerning-pair-editor-legend`, `rs-kerning-pair-editor-toolbar`, `rs-kerning-pair-editor-field`, `rs-kerning-pair-editor-input`, `rs-kerning-pair-editor-button`, `rs-kerning-pair-editor-previews`, `rs-kerning-pair-editor-preview`, `rs-kerning-pair-editor-glyphs`, `rs-kerning-pair-editor-glyph`, `rs-kerning-pair-editor-note`

## Dependencies

Registry dependencies: [select](select.md), [input](input.md), [button](button.md).  
React: `packages/react/src/components/kerning-pair-editor.tsx`  
CSS: `packages/core/css/components/kerning-pair-editor.css`
