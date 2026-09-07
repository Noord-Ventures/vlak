import type { VlakComponent } from "./schema";

export const geospatialComponents: VlakComponent[] = [
  {
    name: "coordinate-reference-field", title: "Coordinate reference field", category: "geospatial",
    description: "Two or three numeric coordinate axes with supplied units and a reference selector that preserves entered values when assigning a reference.",
    classes: ["rs-coordinate-reference-field", "rs-coordinate-reference-field-legend", "rs-coordinate-reference-field-axes", "rs-coordinate-reference-field-label", "rs-coordinate-reference-field-control", "rs-coordinate-reference-field-note"],
    css: ["components/coordinate-reference-field.css"], react: "components/coordinate-reference-field.tsx", registryDependencies: ["select", "input", "dropdown-menu"],
    snippet: '<fieldset class="rs-coordinate-reference-field"><legend class="rs-coordinate-reference-field-legend">Survey point</legend><p class="rs-coordinate-reference-field-note">Assigning a reference keeps the entered coordinates.</p><div class="rs-coordinate-reference-field-label"><span id="geo-coordinate-reference-label">Coordinate reference</span><div class="rs-select rs-select-fluid rs-coordinate-reference-field-control"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="geo-coordinate-reference-label" aria-expanded="false" aria-haspopup="listbox">Site grid</button></div></div><div class="rs-coordinate-reference-field-axes"><label class="rs-coordinate-reference-field-label">Easting (m)<input class="rs-input rs-input-full rs-coordinate-reference-field-control" name="point.coordinates.east" type="number" step="any" value="120.5" /></label><label class="rs-coordinate-reference-field-label">Northing (m)<input class="rs-input rs-input-full rs-coordinate-reference-field-control" name="point.coordinates.north" type="number" step="any" value="48.25" /></label></div></fieldset>',
    example: `import { CoordinateReferenceField } from "@noorddev/vlak-react";

<CoordinateReferenceField
  label="Recorded survey point"
  name="point"
  axes={[{ id: "east", label: "Easting", unit: "m" }, { id: "north", label: "Northing", unit: "m" }]}
  references={[{ value: "site", label: "Site grid" }, { value: "project", label: "Project grid" }]}
  defaultValue={{ reference: "site", coordinates: { east: 120.5, north: 48.25 } }}
/>`,
    usage: {
      use: ["Survey points and imported coordinates whose reference, axis order and units are supplied by the application.", "Supply two or three axes in coordinate order with unique, non-empty identifiers; reference values must also be unique and non-empty.", "Use value and onValueChange for application-owned conversion. Changing the reference requests only a new identifier and preserves the numeric coordinates.", "name submits reference as name.reference and each axis as name.coordinates followed by its identifier. null represents a missing coordinate or reference."],
      avoid: ["Inferring a reference from numeric ranges, treating a reference assignment as reprojection or guessing axis units.", "Using a latitude or longitude bound for a projected axis unless the application supplies that constraint."],
    },
    keyboard: [{ keys: "Tab", does: "Moves through the reference selector and coordinate inputs in supplied axis order." }, { keys: "Arrow keys, Home, End", does: "Opens and navigates the Vlak selector. Enter or Space chooses a reference without converting numeric values; Escape closes the menu." }, { keys: "Typing", does: "Edits numeric coordinates using the native number inputs." }],
    a11y: ["The fieldset legend names the coordinate group. Vlak Select and Input provide shared control paint; every numeric input has a visible axis label, supplied unit and 44px target.", "Unknown references, missing coordinates and non-finite numbers have explicit text. Zero is retained. Invalid supplied values participate in native form validation.", "Required and supplied axis bounds use native validation. No geographic constraints are inferred.", "Uncontrolled values follow native form reset, including external forms; controlled values remain with the application.", "Read-only valid values still submit. Disabled fields do not submit. The fieldset ref, native attributes, className and style pass through."],
    aliases: ["Coordinate input", "Reference system selector", "Survey point field", "Projected coordinate", "Latitude longitude field"],
  },
  {
    name: "datum-transform-picker", title: "Datum transform picker", category: "geospatial",
    description: "A Vlak transformation selector with source and destination references, supplied accuracy and area, and visible support-grid availability.",
    classes: ["rs-datum-transform-picker", "rs-datum-transform-picker-legend", "rs-datum-transform-picker-context", "rs-datum-transform-picker-term", "rs-datum-transform-picker-detail", "rs-datum-transform-picker-label", "rs-datum-transform-picker-control", "rs-datum-transform-picker-list", "rs-datum-transform-picker-item", "rs-datum-transform-picker-selected", "rs-datum-transform-picker-title", "rs-datum-transform-picker-note"],
    css: ["components/datum-transform-picker.css"], react: "components/datum-transform-picker.tsx", registryDependencies: ["select", "dropdown-menu"],
    snippet: '<fieldset class="rs-datum-transform-picker"><legend class="rs-datum-transform-picker-legend">Coordinate operation</legend><dl class="rs-datum-transform-picker-context"><div><dt class="rs-datum-transform-picker-term">Source reference</dt><dd class="rs-datum-transform-picker-detail">Site grid</dd></div><div><dt class="rs-datum-transform-picker-term">Destination reference</dt><dd class="rs-datum-transform-picker-detail">Project grid</dd></div></dl><div class="rs-datum-transform-picker-label"><span id="geo-transformation-label">Transformation</span><div class="rs-select rs-select-fluid rs-datum-transform-picker-control"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="geo-transformation-label" aria-expanded="false" aria-haspopup="listbox">Parameter transform</button></div></div><ul class="rs-datum-transform-picker-list"><li class="rs-datum-transform-picker-item rs-datum-transform-picker-selected"><p class="rs-datum-transform-picker-title">Parameter transform · Selected</p><p class="rs-datum-transform-picker-note">Available</p><dl class="rs-datum-transform-picker-context"><div><dt class="rs-datum-transform-picker-term">Reported accuracy</dt><dd class="rs-datum-transform-picker-detail">1.5 m</dd></div><div><dt class="rs-datum-transform-picker-term">Area of use</dt><dd class="rs-datum-transform-picker-detail">Project extent</dd></div></dl><p class="rs-datum-transform-picker-note">Support grids: None required</p></li></ul></fieldset>',
    example: `import { DatumTransformPicker } from "@noorddev/vlak-react";

<DatumTransformPicker
  label="Coordinate operation"
  sourceReference="Site grid"
  destinationReference="Project grid"
  name="operation"
  defaultValue="parameter"
  transformations={[
    { id: "grid", label: "Grid correction", available: true, accuracy: "0.05 m", area: "Site survey extent", grids: [{ id: "site", label: "Site correction grid", available: false }], unavailableReason: "Attach the supplied grid" },
    { id: "parameter", label: "Parameter transform", available: true, accuracy: "1.5 m", area: "Project extent", grids: [] },
  ]}
/>`,
    usage: {
      use: ["Comparing operations supplied by a projection engine or survey provider before the application transforms coordinates.", "Supply unique, non-empty operation identifiers and explicit available values. false or null disables an operation; listed grids must all be available.", "Use an empty grids array to state that no support grids are required. Omit grids when the requirements were not supplied.", "null means no operation selected. Unknown current identifiers stay visible as unavailable. The application owns candidate generation, accuracy, compatibility and persistence."],
      avoid: ["Automatically picking the smallest reported error, assuming an unlisted grid is installed or silently falling back to a different operation.", "Presenting illustrative accuracy or area labels as calculated guarantees."],
    },
    keyboard: [{ keys: "Tab", does: "Focuses the Vlak transformation selector." }, { keys: "Arrow keys, Home, End", does: "Navigates the Vlak selector. Enter or Space chooses an available operation or the no-selection option; Escape closes the menu. Unavailable alternatives are skipped." }],
    a11y: ["Source and destination references have visible labels; null references are explicitly unknown.", "Every candidate retains visible accuracy, area, grid requirements and availability text, including disabled alternatives.", "The selected candidate uses a full-surface fill and a visible Selected label; forced colors retain a distinct border.", "A currently unavailable operation is marked invalid and fails native validation. Required selection uses the native required attribute.", "Vlak Select supplies the 44px trigger, menu, disabled choices and native form value. Read-only valid selections submit through a hidden value; disabled selections do not submit.", "Uncontrolled state follows native form reset, including external forms. Controlled state, native fieldset attributes, ref and consumer styles remain with the caller."],
    aliases: ["Datum transformation", "Coordinate operation", "Projection operation picker", "Support grid selector", "Reprojection choice"],
  },
  {
    name: "raster-band-mixer", title: "Raster band mixer", category: "geospatial",
    description: "A raster configuration editor with source-band mapping, single or three-channel modes, supplied stretch bounds and explicit missing-data metadata.",
    classes: ["rs-raster-band-mixer", "rs-raster-band-mixer-legend", "rs-raster-band-mixer-fields", "rs-raster-band-mixer-channel", "rs-raster-band-mixer-title", "rs-raster-band-mixer-label", "rs-raster-band-mixer-control", "rs-raster-band-mixer-note"],
    css: ["components/raster-band-mixer.css"], react: "components/raster-band-mixer.tsx", registryDependencies: ["select", "input", "dropdown-menu"],
    snippet: '<fieldset class="rs-raster-band-mixer"><legend class="rs-raster-band-mixer-legend">Band mapping</legend><p class="rs-raster-band-mixer-note">The application renders the image from this configuration.</p><div class="rs-raster-band-mixer-fields"><div class="rs-raster-band-mixer-label"><span id="geo-rendering-mode-label">Rendering mode</span><div class="rs-select rs-select-fluid rs-raster-band-mixer-control"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="geo-rendering-mode-label" aria-expanded="false" aria-haspopup="listbox">Single band</button></div></div><div class="rs-raster-band-mixer-label"><span id="geo-range-treatment-label">Range treatment</span><div class="rs-select rs-select-fluid rs-raster-band-mixer-control"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="geo-range-treatment-label" aria-expanded="false" aria-haspopup="listbox">No enhancement</button></div></div></div><div class="rs-raster-band-mixer-channel"><p class="rs-raster-band-mixer-title">Single band</p><div class="rs-raster-band-mixer-label"><span id="geo-single-band-source-label">Single band source</span><div class="rs-select rs-select-fluid rs-raster-band-mixer-control"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="geo-single-band-source-label" aria-expanded="false" aria-haspopup="listbox">Band 1</button></div></div><p class="rs-raster-band-mixer-note">Missing-data value: 0. Unit: counts</p></div></fieldset>',
    example: `import { RasterBandMixer } from "@noorddev/vlak-react";
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
]} />`,
    usage: {
      use: ["Mapping supplied raster bands to red, green and blue display channels or a single band.", "Choose no enhancement, stretch, clipping or both. Each active channel keeps its own supplied minimum and maximum; band changes do not calculate new ranges.", "Use unique, non-empty band identifiers. noDataValue undefined means unknown, null means no sentinel, and zero remains a supplied missing-data value.", "The name prefix submits mode, stretch and active channel fields such as name.red.band and name.red.minimum. Inactive mappings remain in state but do not submit; ranges only submit when enhancement uses them."],
      avoid: ["Treating the component as a raster renderer, deriving a histogram or assuming a missing-data value from the image appearance.", "Reusing display ranges across different bands without application review. No automatic statistics or unit conversion runs here."],
    },
    keyboard: [{ keys: "Tab", does: "Moves through mode, range treatment and active channel controls." }, { keys: "Arrow keys, Home, End", does: "Navigates the focused Vlak selector. Enter or Space commits a choice; Escape closes the menu." }, { keys: "Typing", does: "Edits each active channel's numeric range bounds." }],
    a11y: ["A fieldset legend names the editor. Vlak Select and Input provide shared control paint, with channel labels and 44px targets.", "Missing, unavailable and disabled source bands stay distinct. Missing-data values and units are readable text, with zero preserved.", "Active channels require a band. Enhancement requires finite bounds with minimum less than maximum; invalid configurations fail native form validation.", "Switching modes preserves inactive mappings without submitting them. No enhancement hides and omits range fields without discarding their values.", "Native form reset restores uncontrolled defaults, including external forms; controlled updates remain with the application.", "Read-only valid configuration values submit; disabled fields do not. Native fieldset attributes, ref, className and style pass through."],
    aliases: ["Band composition", "Multiband raster", "Satellite band selector", "Raster stretch", "Single-band renderer settings"],
  },
];
