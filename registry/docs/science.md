# Science

Components for measurements, physical quantities, laboratory plates, experimental procedures, and spectra.

## Measurements and quantities

Keep a measured value with its unit, uncertainty, and source. Capture quantities without silently converting them.

- [Measurement value](https://vlak.dev/docs/measurement-value.md): A supplied scientific reading with units, symmetric uncertainty, optional scientific notation and explicit availability.
- [Quantity field](https://vlak.dev/docs/quantity-field.md): A 44px native numeric input and unit selector with controlled quantity values, form submission and reset support.

## Experimental work

Select a sample position, follow an experimental run, and inspect a spectrum alongside the underlying values.

- [Well plate](https://vlak.dev/docs/well-plate.md): A labelled laboratory plate with supplied well states, 44px selection controls and keyboard navigation across up to 1536 wells.
- [Experiment run](https://vlak.dev/docs/experiment-run.md): Supplied experiment metadata, conditions and ordered protocol steps with explicit statuses and controlled recording actions.
- [Spectrum plot](https://vlak.dev/docs/spectrum-plot.md): A supplied numeric spectrum with labelled axes, caller-provided peak annotations and a complete paginated data table.

## Data and action contracts

### Preserve measurement meaning

Supply the unit, uncertainty label, precision, and provenance that belong to the measurement. A missing value is distinct from zero. The application owns significant-figure rules and scientific interpretation.

### Convert explicitly

QuantityField changes the selected unit and amount independently. It does not convert units. Perform validated conversion in the application and update the complete controlled value together.

### Keep instrument work outside the view

Plate selections and experiment actions emit intent. The application controls sample records, instrument access, execution, persistence, and confirmed step status.

### Show the evidence behind a plot

Supply finite points, axis labels, units, and any peak annotations. SpectrumPlot provides a data table and does not identify substances, fit peaks, or infer scientific conclusions.

## Install

```sh
npm install @noorddev/vlak-react
# Or vendor an individual component
npx @noorddev/vlak-cli add measurement-value
```
