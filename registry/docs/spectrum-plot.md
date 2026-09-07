# Spectrum plot

A supplied numeric spectrum with labelled axes, caller-provided peak annotations and a complete paginated data table.

Category: science  
Name: `spectrum-plot`  
Also known as: Spectral plot, Spectroscopy chart, Frequency spectrum, Signal spectrum, Peak annotations  
Page: https://vlak.dev/components/spectrum-plot/

## When to use

- Display supplied x/y spectra in acquisition order without smoothing, peak detection or resampling.
- Supply axis labels and units; optional finite increasing domains must contain every point and annotation.
- Up to 4096 points and 128 annotations; larger inputs receive a visible limit message without partial plotting.
- Use the 50-row data pages to inspect every supplied point at its original numeric precision.

## When not to

- Interpreting a marked feature as an identified substance or validated scientific finding.
- Using rounded axis tick labels as the original data, or relying on this display for signal processing.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { SpectrumPlot } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add spectrum-plot
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/spectrum-plot.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<figure class="rs-spectrum-plot"><figcaption class="rs-spectrum-plot-label">Supplied spectrum</figcaption><table class="rs-spectrum-plot-table"><caption>Supplied numeric data</caption><thead><tr><th class="rs-spectrum-plot-cell" scope="col">Wavelength (nm)</th><th class="rs-spectrum-plot-cell" scope="col">Signal (counts)</th></tr></thead><tbody><tr><td class="rs-spectrum-plot-cell">400</td><td class="rs-spectrum-plot-cell">1</td></tr><tr><td class="rs-spectrum-plot-cell">500</td><td class="rs-spectrum-plot-cell">15</td></tr></tbody></table></figure>
```

## Example

```tsx
import { SpectrumPlot } from "@noorddev/vlak-react";

<SpectrumPlot label="Supplied spectrum" description="Synthetic example data" xLabel="Wavelength" xUnit="nm" yLabel="Signal" yUnit="counts" points={[{ x: 400, y: 1 }, { x: 440, y: 2 }, { x: 480, y: 9 }, { x: 500, y: 15 }, { x: 520, y: 4 }, { x: 560, y: 2 }, { x: 600, y: 1 }]} peaks={[{ id: "annotation", label: "Marked feature", x: 500, y: 15 }]} />
```

## Props

### SpectrumPlot

A supplied spectrum and peak annotations, with a paginated complete data table.

Extends `HTMLAttributes<HTMLElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `points` (required) | `readonly SpectrumPoint[]` |  | Up to 4096 supplied points, connected in the supplied order without resampling. |
| `xLabel` (required) | `string` |  |  |
| `yLabel` (required) | `string` |  |  |
| `xUnit` | `string` |  |  |
| `yUnit` | `string` |  |  |
| `xDomain` | `readonly [number, number]` |  |  |
| `yDomain` | `readonly [number, number]` |  |  |
| `peaks` | `readonly SpectrumPeak[]` | `[]` | Up to 128 supplied annotations. The component never detects peaks. |
| `description` | `ReactNode` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the plot's scroll region, native data disclosure and enabled pagination controls when open. |
| Arrow keys | Scrolls the focused plot region when it exceeds the available width. |
| Enter, Space | Toggles the focused disclosure or activates the focused page button. |

## Accessibility

- A figure caption names the spectrum. The decorative chart is hidden from assistive technology; exact point values remain in a captioned table.
- Every supplied peak has a numbered marker and a visible textual coordinate description; no peaks are inferred.
- Empty, non-finite or out-of-domain data is explicitly reported. Invalid rows remain visible in the table as unavailable values.
- A single point has a visible marker, and constant axes receive display padding without changing the data.
- Pagination bounds table rendering to 50 rows. Controls have 44px targets, visible focus and a polite row-range announcement.
- The figure ref and native attributes pass through; large data is rejected before scanning or rendering it.

## Classes

`rs-spectrum-plot`, `rs-spectrum-plot-label`, `rs-spectrum-plot-description`, `rs-spectrum-plot-scroll`, `rs-spectrum-plot-svg`, `rs-spectrum-plot-axis`, `rs-spectrum-plot-grid`, `rs-spectrum-plot-trace`, `rs-spectrum-plot-point`, `rs-spectrum-plot-annotation`, `rs-spectrum-plot-ticks`, `rs-spectrum-plot-x-label`, `rs-spectrum-plot-peaks`, `rs-spectrum-plot-summary`, `rs-spectrum-plot-table`, `rs-spectrum-plot-cell`, `rs-spectrum-plot-controls`, `rs-spectrum-plot-button`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/spectrum-plot.tsx`  
CSS: `packages/core/css/components/spectrum-plot.css`
