# Raster band mixer

A raster configuration editor with source-band mapping, single or three-channel modes, supplied stretch bounds and explicit missing-data metadata.

Category: geospatial  
Name: `raster-band-mixer`  
Also known as: Band composition, Multiband raster, Satellite band selector, Raster stretch, Single-band renderer settings  
Page: https://vlak.dev/components/raster-band-mixer/

## When to use

- Mapping supplied raster bands to red, green and blue display channels or a single band.
- Choose no enhancement, stretch, clipping or both. Each active channel keeps its own supplied minimum and maximum; band changes do not calculate new ranges.
- Use unique, non-empty band identifiers. noDataValue undefined means unknown, null means no sentinel, and zero remains a supplied missing-data value.
- The name prefix submits mode, stretch and active channel fields such as name.red.band and name.red.minimum. Inactive mappings remain in state but do not submit; ranges only submit when enhancement uses them.

## When not to

- Treating the component as a raster renderer, deriving a histogram or assuming a missing-data value from the image appearance.
- Reusing display ranges across different bands without application review. No automatic statistics or unit conversion runs here.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { RasterBandMixer } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add raster-band-mixer
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/raster-band-mixer.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-raster-band-mixer"><legend class="rs-raster-band-mixer-legend">Band mapping</legend><p class="rs-raster-band-mixer-note">The application renders the image from this configuration.</p><div class="rs-raster-band-mixer-fields"><div class="rs-raster-band-mixer-label"><span id="geo-rendering-mode-label">Rendering mode</span><div class="rs-select rs-select-fluid rs-raster-band-mixer-control"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="geo-rendering-mode-label" aria-expanded="false" aria-haspopup="listbox">Single band</button></div></div><div class="rs-raster-band-mixer-label"><span id="geo-range-treatment-label">Range treatment</span><div class="rs-select rs-select-fluid rs-raster-band-mixer-control"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="geo-range-treatment-label" aria-expanded="false" aria-haspopup="listbox">No enhancement</button></div></div></div><div class="rs-raster-band-mixer-channel"><p class="rs-raster-band-mixer-title">Single band</p><div class="rs-raster-band-mixer-label"><span id="geo-single-band-source-label">Single band source</span><div class="rs-select rs-select-fluid rs-raster-band-mixer-control"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="geo-single-band-source-label" aria-expanded="false" aria-haspopup="listbox">Band 1</button></div></div><p class="rs-raster-band-mixer-note">Missing-data value: 0. Unit: counts</p></div></fieldset>
```

## Example

```tsx
import { RasterBandMixer } from "@noorddev/vlak-react";
import type { RasterBandConfiguration } from "@noorddev/vlak-react";

const configuration: RasterBandConfiguration = {
  mode: "rgb", stretch: "none",
  red: { bandId: "b3", minimum: 0, maximum: 255 },
  green: { bandId: "b2", minimum: 0, maximum: 255 },
  blue: { bandId: "b1", minimum: 0, maximum: 255 },
  single: { bandId: "b1", minimum: 0, maximum: 255 },
};

<RasterBandMixer label="Band mapping" name="raster" defaultValue={configuration} bands={[
  { id: "b1", label: "Band 1", unit: "counts", noDataValue: 0 },
  { id: "b2", label: "Band 2", unit: "counts", noDataValue: null },
  { id: "b3", label: "Band 3", unit: "counts" },
]} />
```

## Props

### RasterBandMixer

Selects source bands and display ranges. No pixels, statistics or missing-data rules are inferred.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `bands` (required) | `readonly RasterSourceBand[]` |  |  |
| `value` | `RasterBandConfiguration` |  |  |
| `defaultValue` | `RasterBandConfiguration` | `initial` |  |
| `onValueChange` | `(value: RasterBandConfiguration) => void` |  | Emits configuration only. The host owns rendering and any statistics or range calculation. |
| `description` | `ReactNode` |  |  |
| `readOnly` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through mode, range treatment and active channel controls. |
| Arrow keys, Home, End | Navigates the focused Vlak selector. Enter or Space commits a choice; Escape closes the menu. |
| Typing | Edits each active channel's numeric range bounds. |

## Accessibility

- A fieldset legend names the editor. Vlak Select and Input provide shared control paint, with channel labels and 44px targets.
- Missing, unavailable and disabled source bands stay distinct. Missing-data values and units are readable text, with zero preserved.
- Active channels require a band. Enhancement requires finite bounds with minimum less than maximum; invalid configurations fail native form validation.
- Switching modes preserves inactive mappings without submitting them. No enhancement hides and omits range fields without discarding their values.
- Native form reset restores uncontrolled defaults, including external forms; controlled updates remain with the application.
- Read-only valid configuration values submit; disabled fields do not. Native fieldset attributes, ref, className and style pass through.

## Classes

`rs-raster-band-mixer`, `rs-raster-band-mixer-legend`, `rs-raster-band-mixer-fields`, `rs-raster-band-mixer-channel`, `rs-raster-band-mixer-title`, `rs-raster-band-mixer-label`, `rs-raster-band-mixer-control`, `rs-raster-band-mixer-note`

## Dependencies

Registry dependencies: [select](select.md), [input](input.md), [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/raster-band-mixer.tsx`  
CSS: `packages/core/css/components/raster-band-mixer.css`
