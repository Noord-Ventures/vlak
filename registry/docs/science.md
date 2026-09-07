# Science

Components for measurements, physical quantities, microscopy acquisition, sequence inspection, experimental procedures, and spectra.

## Measurements and quantities

Keep a measured value with its unit, uncertainty, and source. Capture quantities without silently converting them.

- [Measurement value](https://vlak.dev/docs/measurement-value.md): A supplied scientific reading with units, symmetric uncertainty, optional scientific notation and explicit availability.
- [Quantity field](https://vlak.dev/docs/quantity-field.md): A 44px Vlak numeric input and styled unit selector with controlled quantity values, form submission and reset support.

## Experimental work

Select a sample position, follow an experimental run, and inspect a spectrum alongside the underlying values.

- [Experiment run](https://vlak.dev/docs/experiment-run.md): Supplied experiment metadata, conditions and ordered protocol steps with explicit statuses and controlled recording actions.
- [Spectrum plot](https://vlak.dev/docs/spectrum-plot.md): A supplied numeric spectrum with labelled axes, caller-provided peak annotations and a complete paginated data table.

## Microscopy

Review named stage positions in an explicit coordinate frame, navigate supplied stacks and edit acquisition sequences with declared units.

- [Stage position list](https://vlak.dev/docs/stage-position-list.md): Reviews supplied named stage positions with an explicit coordinate frame, per-axis units, inclusion state and controlled selection, reorder and removal requests.
- [Stack navigator](https://vlak.dev/docs/stack-navigator.md): Navigates supplied depth, time, channel and stage-position axes while preserving exact physical readings and indexed positions.
- [Acquisition sequencer](https://vlak.dev/docs/acquisition-sequencer.md): Edits supplied capture steps, exact exposure, time, depth and channel values, and distinguishes requested actions from recorded run state.

## Genomics

Enter a genomic region, inspect supplied sequence alignments and compare exact coverage counts.

- [Genomic region field](https://vlak.dev/docs/genomic-region-field.md): Collects a reference, contig and validated integer interval with an explicit one-based inclusive coordinate convention and native form submission.
- [Sequence alignment](https://vlak.dev/docs/sequence-alignment.md): Displays a bounded window of already aligned reference and read strings, with supplied genomic positions, gaps and keyboard region selection.
- [Coverage inspector](https://vlak.dev/docs/coverage-inspector.md): Shows supplied per-locus depth, base and strand counts with an exact position selector, bounded plot and complete depth table.

## Data and action contracts

### Keep coordinate conventions explicit

Genomic regions and supplied loci use 1-based inclusive coordinates. Alignment selections use 1-based aligned columns, including supplied gap columns. Stack values are zero-based indexes into supplied positions; the displayed ordinal starts at one. Stage positions retain immutable identifiers, supplied frame identity and per-axis units; missing coordinates are not zero. The host owns coordinate conversion and reference identity.

### Preserve measurement meaning

Supply the unit, uncertainty label, precision, and provenance that belong to the measurement. A missing value is distinct from zero. The application owns significant-figure rules and scientific interpretation.

### Convert explicitly

QuantityField changes the selected unit and amount independently. It does not convert units. Perform validated conversion in the application and update the complete controlled value together.

### Keep instrument work outside the view

Stage selection requires controlled value and onValueChange props. Inclusion, order, removal and experiment actions request changes; the host supplies accepted records. Selection never confirms stage motion or acquired frames. The application controls instrument access, execution, persistence and confirmed step status.

### Show the evidence behind a plot

Supply finite points, axis labels, units, and any peak annotations. SpectrumPlot provides a data table and does not identify substances, fit peaks, or infer scientific conclusions.

## Install

```sh
npm install @noorddev/vlak-react
# Or vendor an individual component
npx @noorddev/vlak-cli add measurement-value
```
