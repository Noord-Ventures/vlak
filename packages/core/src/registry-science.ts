import type { VlakComponent } from "./schema";

export const scienceComponents: VlakComponent[] = [
  {
    name: "measurement-value", title: "Measurement value", category: "science",
    description: "A supplied scientific reading with units, symmetric uncertainty, optional scientific notation and explicit availability.",
    classes: ["rs-measurement-value", "rs-measurement-value-label", "rs-measurement-value-reading", "rs-measurement-value-number", "rs-measurement-value-uncertainty", "rs-measurement-value-unit", "rs-measurement-value-context"],
    css: ["components/measurement-value.css"], react: "components/measurement-value.tsx", registryDependencies: [],
    snippet: '<div class="rs-measurement-value"><p class="rs-measurement-value-label">Sample mass</p><p class="rs-measurement-value-reading"><span class="rs-measurement-value-number">1.230</span><span class="rs-measurement-value-uncertainty">± 0.005</span><span class="rs-measurement-value-unit">g</span></p><p class="rs-measurement-value-context">Supplied uncertainty</p></div>',
    example: `import { MeasurementValue } from "@noorddev/vlak-react";

<MeasurementValue label="Sample mass" value="1.230" uncertainty={0.005} unit="g" source="Balance record, sample 042" />
<MeasurementValue label="Small reading" value={0.0000123} notation="scientific" unit="A" />
<MeasurementValue label="Next measurement" status="pending" />`,
    usage: { use: ["Scientific observations with application-supplied uncertainty and units.", "Pass a string to preserve significant figures such as 1.230; scientific notation formats numeric inputs without selecting a precision.", "Use uncertaintyLabel to name the supplied uncertainty convention."], avoid: ["Inferring significant figures, a confidence level, a distribution or unit conversions.", "Treating zero as missing, or using a negative uncertainty to express asymmetric bounds."] },
    keyboard: [],
    a11y: ["The reading, plus-minus uncertainty, unit and source remain visible text.", "Pending and unavailable states suppress the numeric reading. Zero is preserved, while empty strings and non-finite values are unavailable.", "Negative or non-finite uncertainty is explicitly unavailable without hiding a valid reading.", "The div ref, native attributes, className and style pass through. No automatic announcements or interactive stops are added."],
    aliases: ["Scientific measurement", "Uncertainty display", "Measured value", "Scientific notation", "Metrology reading"],
  },
  {
    name: "quantity-field", title: "Quantity field", category: "science",
    description: "A 44px Vlak numeric input and styled unit selector with controlled quantity values, form submission and reset support.",
    classes: ["rs-quantity-field", "rs-quantity-field-legend", "rs-quantity-field-row", "rs-quantity-field-label", "rs-quantity-field-control", "rs-quantity-field-description"],
    css: ["components/quantity-field.css"], react: "components/quantity-field.tsx", registryDependencies: ["input", "select", "dropdown-menu"],
    snippet: '<fieldset class="rs-quantity-field"><legend class="rs-quantity-field-legend">Sample volume</legend><div class="rs-quantity-field-row"><label class="rs-quantity-field-label">Amount<input class="rs-input rs-input-full rs-quantity-field-control" name="volume" type="number" step="any" value="250" /></label><div class="rs-quantity-field-label"><span id="quantity-unit-label">Unit</span><div class="rs-select rs-select-fluid"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="quantity-unit-label" aria-expanded="false" aria-haspopup="listbox"><span>µL</span></button></div></div></div></fieldset>',
    example: `import { QuantityField } from "@noorddev/vlak-react";

<QuantityField label="Sample volume" name="volume" units={[{ value: "ul", label: "µL" }, { value: "ml", label: "mL" }]} defaultValue={{ amount: 250, unit: "ul" }} min={0} required description="Enter the amount and its unit" />`,
    usage: { use: ["Dimensioned quantities with explicit unit choices and native numeric constraints.", "name submits the amount and unitName submits the unit, defaulting to name followed by .unit.", "Supply value and onValueChange when the application converts units or persists the result; unit selection alone keeps the supplied amount unchanged.", "null represents a missing amount or unit. Unit option values must be unique and non-empty."], avoid: ["Assuming that choosing a different unit automatically converts the amount.", "Relying on formatting to establish scientific precision or dimensional compatibility."] },
    keyboard: [{ keys: "Tab", does: "Moves between the amount input and unit selector." }, { keys: "Arrow keys", does: "Uses native number stepping or opens and navigates the Vlak unit selector. Enter or Space confirms a unit; Escape closes its menu." }],
    a11y: ["A fieldset and legend name the quantity. Vlak Input and Select have visible labels, descriptions and 44px targets.", "Required, min, max and step use native validation. Invalid supplied numbers and unknown units have explicit text states.", "Native form reset restores uncontrolled defaults and leaves controlled values with the application.", "Read-only quantities preserve the submitted amount and unit while preventing edits. Disabled quantities do not submit.", "The fieldset ref and native attributes pass through; no unit is chosen implicitly."],
    aliases: ["Unit input", "Scientific input", "Dimensioned number", "Amount and unit", "Measurement input"],
  },
  {
    name: "well-plate", title: "Well plate", category: "microbiology",
    description: "A labelled laboratory plate with supplied well states, 44px selection controls and keyboard navigation across up to 1536 wells.",
    classes: ["rs-well-plate", "rs-well-plate-label", "rs-well-plate-description", "rs-well-plate-scroll", "rs-well-plate-table", "rs-well-plate-heading", "rs-well-plate-cell", "rs-well-plate-well", "rs-well-plate-selected", "rs-well-plate-unavailable", "rs-well-plate-static", "rs-well-plate-coordinate"],
    css: ["components/well-plate.css"], react: "components/well-plate.tsx", registryDependencies: [],
    snippet: '<div class="rs-well-plate"><p class="rs-well-plate-label">Plate 042</p><div class="rs-well-plate-scroll"><table class="rs-well-plate-table"><caption>Supplied well records</caption><thead><tr><th class="rs-well-plate-heading" scope="col">Well</th><th class="rs-well-plate-heading" scope="col">1</th></tr></thead><tbody><tr><th class="rs-well-plate-heading" scope="row">A</th><td class="rs-well-plate-cell"><div class="rs-well-plate-well rs-well-plate-static"><span class="rs-well-plate-coordinate">A1</span><span>Loaded</span></div></td></tr></tbody></table></div></div>',
    example: `import { WellPlate } from "@noorddev/vlak-react";

<WellPlate label="Plate 042" rows={["A", "B", "C"]} columns={["1", "2", "3", "4"]} wells={[
  { row: "A", column: "1", status: "Loaded", label: "Control" },
  { row: "A", column: "2", status: "Loaded", label: "Sample 042" },
  { row: "B", column: "1", status: "Reserved", disabled: true },
]} defaultValue={{ row: "A", column: "1" }} />`,
    usage: { use: ["Sample placement and plate inspection with application-supplied rows, columns and well states.", "Unique row and column labels and at most one record per coordinate. Missing records are labelled Unrecorded.", "Use value and onValueChange for application-owned selection; readOnly provides a static plate."], avoid: ["Inferring empty wells, assay outcomes or sample identities from missing records.", "Layouts larger than 1536 wells; the component reports the limit instead of silently truncating a plate."] },
    keyboard: [{ keys: "Tab", does: "Enters the plate at one enabled well and then leaves the grid." }, { keys: "Arrow keys", does: "Moves focus along a row or column, skipping disabled wells without changing selection." }, { keys: "Home, End", does: "Moves to the first or last enabled well in the current row." }, { keys: "Ctrl+Home, Ctrl+End", does: "Moves to the first or last enabled well in the plate." }, { keys: "Enter, Space", does: "Selects the focused well. Controlled selection waits for the caller's updated value." }],
    a11y: ["A named grid uses row and column headers, roving button focus and aria-selected cells. Every well name includes its coordinates and supplied state.", "Selected wells use a full fill and controls retain 44px targets. Large plates scroll inside their own container.", "Arrow navigation respects the document reading direction. Disabled wells are skipped; static and fully disabled plates provide one focusable scroll region.", "Duplicate or unknown coordinates and invalid layouts produce a visible explanation instead of an ambiguous plate.", "The root div forwards its ref and native attributes. Selection does not submit a form."],
    aliases: ["Microplate", "Plate map", "Microtiter plate", "Sample plate", "Assay plate", "Well grid"],
  },
  {
    name: "experiment-run", title: "Experiment run", category: "science",
    description: "Supplied experiment metadata, conditions and ordered protocol steps with explicit statuses and controlled recording actions.",
    classes: ["rs-experiment-run", "rs-experiment-run-head", "rs-experiment-run-title", "rs-experiment-run-context", "rs-experiment-run-conditions", "rs-experiment-run-value", "rs-experiment-run-list", "rs-experiment-run-step", "rs-experiment-run-details", "rs-experiment-run-actions", "rs-experiment-run-action"],
    css: ["components/experiment-run.css"], react: "components/experiment-run.tsx", registryDependencies: ["button"],
    snippet: '<div class="rs-experiment-run" role="group" aria-label="Optical measurement"><div class="rs-experiment-run-head"><p class="rs-experiment-run-title">Optical measurement</p><span class="rs-experiment-run-context">Awaiting review</span></div><p class="rs-experiment-run-context">Run 042</p><ol class="rs-experiment-run-list"><li class="rs-experiment-run-step"><div class="rs-experiment-run-head"><span>Review acquisition</span><span class="rs-experiment-run-context">Not reviewed</span></div></li></ol></div>',
    example: `import { ExperimentRun } from "@noorddev/vlak-react";

<ExperimentRun label="Optical measurement" runId="042" protocol="Protocol revision 3" status="Awaiting review" conditions={[{ id: "temperature", label: "Recorded temperature", value: "21.4 °C" }]} steps={[
  { id: "acquisition", label: "Acquire readings", status: "Recorded", details: "Data file supplied by the instrument" },
  { id: "review", label: "Review acquisition", status: "Not reviewed" },
]} />`,
    usage: { use: ["Lab notebooks, acquisition workspaces and protocol review with supplied run state.", "Pass explicit step actions and onAction to request changes; update supplied statuses after persistence.", "Keep protocol links, conditions and step details with the run they describe."], avoid: ["Inferring completion, experimental validity or the next scientific procedure.", "Treating an action request as proof that an instrument ran or that data was saved."] },
    keyboard: [{ keys: "Tab", does: "Moves between supplied links and enabled step actions." }, { keys: "Enter, Space", does: "Requests the focused step action through onAction." }],
    a11y: ["A named group contains conditions as a description list and steps as an ordered list.", "Action names include their step number and label; the current step status is their accessible description.", "Pending steps keep their recorded state, show pending text and disable actions. No internal success state is invented.", "Zero-valued conditions remain visible and missing conditions are explicitly labelled. Buttons are at least 44px with visible focus rings.", "The root div forwards native attributes and its ref."],
    aliases: ["Protocol run", "Lab notebook run", "Experiment record", "Acquisition workflow", "Scientific workflow"],
  },
  {
    name: "spectrum-plot", title: "Spectrum plot", category: "science",
    description: "A supplied numeric spectrum with labelled axes, caller-provided peak annotations and a complete paginated data table.",
    classes: ["rs-spectrum-plot", "rs-spectrum-plot-label", "rs-spectrum-plot-description", "rs-spectrum-plot-scroll", "rs-spectrum-plot-svg", "rs-spectrum-plot-axis", "rs-spectrum-plot-grid", "rs-spectrum-plot-trace", "rs-spectrum-plot-point", "rs-spectrum-plot-annotation", "rs-spectrum-plot-ticks", "rs-spectrum-plot-x-label", "rs-spectrum-plot-peaks", "rs-spectrum-plot-summary", "rs-spectrum-plot-table", "rs-spectrum-plot-cell", "rs-spectrum-plot-controls", "rs-spectrum-plot-button"],
    css: ["components/spectrum-plot.css"], react: "components/spectrum-plot.tsx", registryDependencies: ["button"],
    snippet: '<figure class="rs-spectrum-plot"><figcaption class="rs-spectrum-plot-label">Supplied spectrum</figcaption><table class="rs-spectrum-plot-table"><caption>Supplied numeric data</caption><thead><tr><th class="rs-spectrum-plot-cell" scope="col">Wavelength (nm)</th><th class="rs-spectrum-plot-cell" scope="col">Signal (counts)</th></tr></thead><tbody><tr><td class="rs-spectrum-plot-cell">400</td><td class="rs-spectrum-plot-cell">1</td></tr><tr><td class="rs-spectrum-plot-cell">500</td><td class="rs-spectrum-plot-cell">15</td></tr></tbody></table></figure>',
    example: `import { SpectrumPlot } from "@noorddev/vlak-react";

<SpectrumPlot label="Supplied spectrum" description="Synthetic example data" xLabel="Wavelength" xUnit="nm" yLabel="Signal" yUnit="counts" points={[{ x: 400, y: 1 }, { x: 440, y: 2 }, { x: 480, y: 9 }, { x: 500, y: 15 }, { x: 520, y: 4 }, { x: 560, y: 2 }, { x: 600, y: 1 }]} peaks={[{ id: "annotation", label: "Marked feature", x: 500, y: 15 }]} />`,
    usage: { use: ["Display supplied x/y spectra in acquisition order without smoothing, peak detection or resampling.", "Supply axis labels and units; optional finite increasing domains must contain every point and annotation.", "Up to 4096 points and 128 annotations; larger inputs receive a visible limit message without partial plotting.", "Use the 50-row data pages to inspect every supplied point at its original numeric precision."], avoid: ["Interpreting a marked feature as an identified substance or validated scientific finding.", "Using rounded axis tick labels as the original data, or relying on this display for signal processing."] },
    keyboard: [{ keys: "Tab", does: "Focuses the plot's scroll region, native data disclosure and enabled pagination controls when open." }, { keys: "Arrow keys", does: "Scrolls the focused plot region when it exceeds the available width." }, { keys: "Enter, Space", does: "Toggles the focused disclosure or activates the focused page button." }],
    a11y: ["A figure caption names the spectrum. The decorative chart is hidden from assistive technology; exact point values remain in a captioned table.", "Every supplied peak has a numbered marker and a visible textual coordinate description; no peaks are inferred.", "Empty, non-finite or out-of-domain data is explicitly reported. Invalid rows remain visible in the table as unavailable values.", "A single point has a visible marker, and constant axes receive display padding without changing the data.", "Pagination bounds table rendering to 50 rows. Controls have 44px targets, visible focus and a polite row-range announcement.", "The figure ref and native attributes pass through; large data is rejected before scanning or rendering it."],
    aliases: ["Spectral plot", "Spectroscopy chart", "Frequency spectrum", "Signal spectrum", "Peak annotations"],
  },
];
