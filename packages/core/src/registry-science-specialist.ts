import type { VlakComponent } from "./schema";

export const scienceSpecialists: VlakComponent[] = [
  {
    "name": "stack-navigator",
    "title": "Stack navigator",
    "description": "Navigates supplied depth, time, channel and stage-position axes while preserving exact physical readings and indexed positions.",
    "category": "science",
    "classes": [
      "rs-stack-navigator",
      "rs-stack-navigator-legend",
      "rs-stack-navigator-axis",
      "rs-stack-navigator-label",
      "rs-stack-navigator-row",
      "rs-stack-navigator-step",
      "rs-stack-navigator-copy"
    ],
    "css": [
      "components/stack-navigator.css"
    ],
    "react": "components/stack-navigator.tsx",
    "registryDependencies": [
      "button",
      "select"
    ],
    "snippet": "<fieldset class=\"rs-stack-navigator\"><legend class=\"rs-stack-navigator-legend\">Image stack</legend><div class=\"rs-stack-navigator-axis\"><p class=\"rs-stack-navigator-label\">Depth</p><p class=\"rs-stack-navigator-copy\">Position 1 of 3; -1 µm</p></div></fieldset>",
    "example": "import { StackNavigator } from \"@noorddev/vlak-react\";\n\n<StackNavigator label=\"Image stack\" name=\"stack\" axes={[\n  { id: \"depth\", label: \"Depth\", unit: \"µm\", positions: [{ value: -1 }, { value: 0 }, { value: 1 }] },\n  { id: \"time\", label: \"Time\", unit: \"s\", positions: [{ value: 0 }, { value: 5 }, { value: 10 }] },\n  { id: \"channel\", label: \"Channel\", positions: [{ value: \"Phase\" }, { value: \"Channel 2\" }] },\n  { id: \"stage\", label: \"Stage position\", unit: \"µm\", positions: [{ value: \"x 12.5, y -1.5\" }] },\n]} defaultValue={{ depth: 1, time: 0, channel: 0, stage: 0 }} />",
    "usage": {
      "use": [
        "Image stacks with explicit axis labels, sampled physical values and known position indexes.",
        "Selection values are zero-based indexes; displayed position counts are one-based. Physical values are never calculated from spacing.",
        "name submits one selected index per axis. Controlled values remain caller-owned; native form reset restores uncontrolled defaults."
      ],
      "avoid": [
        "Calling an instrument, calculating stage motion, or inferring positions from an index.",
        "More than 8 axes or 8192 total positions; the component reports the bound rather than truncating axes."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves between enabled previous, position-select and next controls."
      },
      {
        "keys": "Arrow keys, Home, End, typing",
        "does": "Opens and navigates the position list; disabled positions are skipped."
      },
      {
        "keys": "Enter, Space",
        "does": "Confirms the active list option or activates the focused previous or next button."
      },
      {
        "keys": "Escape",
        "does": "Closes the position list without changing selection."
      }
    ],
    "a11y": [
      "Every axis has a visible select label and a text description containing the exact displayed index and physical value.",
      "Zero and negative physical positions remain visible. Missing or invalid readings are explicitly unavailable.",
      "Each input and button has a 44px target and visible focus; no axis is selected implicitly.",
      "Read-only values remain submitted through hidden fields, while disabled fieldsets do not submit.",
      "The fieldset ref, form association, native attributes, className and style pass through.",
      "The shared Select and Button primitives supply combobox navigation and control styling; native form values remain available through the Select backing control."
    ],
    "aliases": [
      "Image stack controls",
      "Z-stack navigator",
      "Microscopy axes",
      "Multidimensional image navigator",
      "Stage position selector"
    ]
  },
  {
    "name": "acquisition-sequencer",
    "title": "Acquisition sequencer",
    "description": "Edits supplied capture steps, exact exposure, time, depth and channel values, and distinguishes requested actions from recorded run state.",
    "category": "science",
    "classes": [
      "rs-acquisition-sequencer",
      "rs-acquisition-sequencer-legend",
      "rs-acquisition-sequencer-list",
      "rs-acquisition-sequencer-step",
      "rs-acquisition-sequencer-head",
      "rs-acquisition-sequencer-title",
      "rs-acquisition-sequencer-fields",
      "rs-acquisition-sequencer-label",
      "rs-acquisition-sequencer-control",
      "rs-acquisition-sequencer-value",
      "rs-acquisition-sequencer-copy",
      "rs-acquisition-sequencer-actions",
      "rs-acquisition-sequencer-action"
    ],
    "css": [
      "components/acquisition-sequencer.css"
    ],
    "react": "components/acquisition-sequencer.tsx",
    "registryDependencies": [
      "button",
      "input",
      "select"
    ],
    "snippet": "<fieldset class=\"rs-acquisition-sequencer\"><legend class=\"rs-acquisition-sequencer-legend\">Capture plan</legend><ol class=\"rs-acquisition-sequencer-list\"><li class=\"rs-acquisition-sequencer-step\"><div class=\"rs-acquisition-sequencer-head\"><span class=\"rs-acquisition-sequencer-title\">First plane</span><span class=\"rs-acquisition-sequencer-copy\">Not run</span></div><p class=\"rs-acquisition-sequencer-value\">Exposure 10 ms · Time offset 0 s · Depth -1 µm · Phase</p></li></ol></fieldset>",
    "example": "import { useState } from \"react\";\nimport { AcquisitionSequencer } from \"@noorddev/vlak-react\";\nimport type { AcquisitionStep } from \"@noorddev/vlak-react\";\n\nfunction CapturePlan() {\n  const [steps, setSteps] = useState<readonly AcquisitionStep[]>([\n    { id: \"first\", label: \"First plane\", exposure: 10, exposureUnit: \"ms\", time: 0, timeUnit: \"s\", depth: -1, depthUnit: \"µm\", channel: \"phase\", status: \"Not run\" },\n    { id: \"second\", label: \"Second plane\", exposure: 10, exposureUnit: \"ms\", time: 5, timeUnit: \"s\", depth: 0, depthUnit: \"µm\", channel: \"phase\", status: \"Not run\" },\n  ]);\n  return <AcquisitionSequencer label=\"Capture plan\" channels={[{ id: \"phase\", label: \"Phase\" }]} steps={steps} onStepsChange={setSteps} />;\n}",
    "usage": {
      "use": [
        "Editing and reordering an existing capture plan with onStepsChange.",
        "Pass exact values and units from the acquisition application; the component performs no conversions or scheduling.",
        "Use explicit step actions and onAction to request operations. Supply pending and confirmedLabel from actual host state."
      ],
      "avoid": [
        "Treating an edit or action callback as proof that capture ran successfully.",
        "Deriving instrument settings or executing acquisition. The host owns commands, persistence and confirmations.",
        "More than 128 steps or 128 channels."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves through enabled numeric inputs, channel selectors and step actions."
      },
      {
        "keys": "Arrow keys, Home, End, typing",
        "does": "Edits native numeric fields or navigates the opened channel list."
      },
      {
        "keys": "Enter, Space",
        "does": "Confirms the active channel option or requests the focused action or reorder."
      },
      {
        "keys": "Escape",
        "does": "Closes the channel list without changing the supplied selection."
      }
    ],
    "a11y": [
      "Step fields and action names include the step number and label, preventing ambiguity between repeated capture names.",
      "Exposure and time offsets use a native non-negative minimum; signed depth values and all supplied units are preserved.",
      "Pending steps disable editing and actions while their last recorded state remains visible.",
      "Controls have 44px targets. Controlled native inputs retain the supplied plan through form resets.",
      "The fieldset ref and native attributes pass through; no callback is interpreted as an actual run confirmation.",
      "Generic controls compose the shared Input, Select and Button primitives; the native numeric fields and Select backing control preserve form values."
    ],
    "aliases": [
      "Capture sequence",
      "Microscopy acquisition plan",
      "Time-lapse plan",
      "Capture step editor",
      "Instrument run plan"
    ]
  },
  {
    "name": "sequence-alignment",
    "title": "Sequence alignment",
    "description": "Displays a bounded window of already aligned reference and read strings, with supplied genomic positions, gaps and keyboard region selection.",
    "category": "science",
    "classes": [
      "rs-sequence-alignment",
      "rs-sequence-alignment-title",
      "rs-sequence-alignment-copy",
      "rs-sequence-alignment-scroll",
      "rs-sequence-alignment-table",
      "rs-sequence-alignment-heading",
      "rs-sequence-alignment-control",
      "rs-sequence-alignment-actions",
      "rs-sequence-alignment-action",
      "rs-sequence-alignment-column",
      "rs-sequence-alignment-selected",
      "rs-sequence-alignment-base"
    ],
    "css": [
      "components/sequence-alignment.css"
    ],
    "react": "components/sequence-alignment.tsx",
    "registryDependencies": [
      "button"
    ],
    "snippet": "<div class=\"rs-sequence-alignment\"><p class=\"rs-sequence-alignment-title\">Read alignment</p><p class=\"rs-sequence-alignment-copy\">chr7 · 1-based reference positions; aligned columns include gaps</p><div class=\"rs-sequence-alignment-scroll\"><table class=\"rs-sequence-alignment-table\" aria-label=\"Reference and reads\"><thead><tr><th class=\"rs-sequence-alignment-heading\" scope=\"col\">Reference position</th><th class=\"rs-sequence-alignment-column\" scope=\"col\">101</th><th class=\"rs-sequence-alignment-column\" scope=\"col\">102</th></tr></thead><tbody><tr><th class=\"rs-sequence-alignment-heading\" scope=\"row\">Reference</th><td class=\"rs-sequence-alignment-base\">A</td><td class=\"rs-sequence-alignment-base\">C</td></tr></tbody></table></div></div>",
    "example": "import { SequenceAlignment } from \"@noorddev/vlak-react\";\n\n<SequenceAlignment label=\"Read alignment\" contig=\"chr7\" referenceLabel=\"Example reference\" referenceSequence=\"AC-GT\" positions={[101, 102, null, 103, 104]} reads={[\n  { id: \"read-1\", label: \"Read 1\", sequence: \"ACAGT\" },\n  { id: \"read-2\", label: \"Read 2\", sequence: \"AC-GT\" },\n]} defaultValue={{ startColumn: 1, endColumn: 2 }} />",
    "usage": {
      "use": [
        "Inspecting up to 120 pre-aligned columns and 32 reads with explicit reference and read labels.",
        "Supply one one-based genomic position per aligned column; null represents a reference gap.",
        "Selection uses one-based aligned column indexes, which are distinct from genomic positions. Use value and onValueChange for host-owned selection."
      ],
      "avoid": [
        "Running an alignment algorithm or inferring mismatches, insertions, variant calls or genomic positions.",
        "Passing inconsistent sequence lengths or silently clipping longer alignments. Supply the intended window."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Enters the column controls at one focus stop and then reaches the selection actions."
      },
      {
        "keys": "Arrow keys, Home, End",
        "does": "Moves focus between columns in sequence order without changing selection."
      },
      {
        "keys": "Shift+Arrow keys",
        "does": "Extends the selected column region from its anchor."
      },
      {
        "keys": "Enter, Space",
        "does": "Selects the focused base column or activates a selection action."
      }
    ],
    "a11y": [
      "A native table supplies row labels and reference-position column headers; every base and gap remains visible text.",
      "Column buttons have 44px targets and full-column selected fills, with aria-pressed and explicit coordinate names.",
      "Long windows scroll inside their container. Read-only tables provide a focusable scroll region.",
      "The selection summary lists supplied positions, including gaps, without inventing genomic coordinates.",
      "The root div forwards its ref and native attributes; inconsistent or oversized windows have explicit unavailable states.",
      "Selection actions compose the shared Button primitive; the aligned column controls retain their dedicated table interaction."
    ],
    "aliases": [
      "Aligned sequence viewer",
      "Read alignment window",
      "Genomic alignment",
      "Base selection",
      "Sequence window"
    ]
  },
  {
    "name": "coverage-inspector",
    "title": "Coverage inspector",
    "description": "Shows supplied per-locus depth, base and strand counts with an exact position selector, bounded plot and complete depth table.",
    "category": "science",
    "classes": [
      "rs-coverage-inspector",
      "rs-coverage-inspector-title",
      "rs-coverage-inspector-copy",
      "rs-coverage-inspector-plot",
      "rs-coverage-inspector-stem",
      "rs-coverage-inspector-point",
      "rs-coverage-inspector-missing",
      "rs-coverage-inspector-axis",
      "rs-coverage-inspector-label",
      "rs-coverage-inspector-select",
      "rs-coverage-inspector-counts",
      "rs-coverage-inspector-value",
      "rs-coverage-inspector-summary",
      "rs-coverage-inspector-table",
      "rs-coverage-inspector-cell"
    ],
    "css": [
      "components/coverage-inspector.css"
    ],
    "react": "components/coverage-inspector.tsx",
    "registryDependencies": ["select", "dropdown-menu"],
    "snippet": "<figure class=\"rs-coverage-inspector\"><figcaption class=\"rs-coverage-inspector-title\">Coverage window</figcaption><p class=\"rs-coverage-inspector-copy\">chr7 · 1-based positions</p><div class=\"rs-coverage-inspector-label\"><span id=\"coverage-position-label\">Inspect position</span><div class=\"rs-select rs-select-fluid rs-coverage-inspector-select\"><button type=\"button\" class=\"rs-dropdown\" role=\"combobox\" aria-labelledby=\"coverage-position-label\" aria-expanded=\"false\" aria-haspopup=\"listbox\"><span>101 · Depth 0</span></button></div></div><dl class=\"rs-coverage-inspector-counts\"><div><dt>Depth</dt><dd class=\"rs-coverage-inspector-value\">0</dd></div></dl></figure>",
    "example": "import { CoverageInspector } from \"@noorddev/vlak-react\";\n\n<CoverageInspector label=\"Coverage window\" contig=\"chr7\" reference=\"Example reference\" loci={[\n  { position: 101, depth: 0, bases: { A: 0, C: 0 }, forward: 0, reverse: 0 },\n  { position: 102, depth: null },\n  { position: 103, depth: 24, bases: { A: 20, C: 4 }, forward: 12, reverse: 12 },\n]} defaultValue={103} />",
    "usage": {
      "use": [
        "A bounded window of up to 512 unique one-based loci with caller-supplied counts.",
        "Inspect base and strand counts independently; the component does not sum them or reconcile them with depth.",
        "Use null for missing counts. Zero means an explicitly recorded count of zero."
      ],
      "avoid": [
        "Calling variants, assigning significance, or applying coverage thresholds.",
        "Treating absent counts as zero, or supplying fractional and negative counts as valid depth."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Focuses the Vlak position selector and native depth-table disclosure."
      },
      {
        "keys": "Arrow keys, typing",
        "does": "Opens and navigates the Vlak position selector by arrow keys and typeahead. Escape closes its menu."
      },
      {
        "keys": "Enter, Space",
        "does": "Chooses a highlighted locus or opens and closes the focused native depth disclosure."
      }
    ],
    "a11y": [
      "The decorative plot has a complete visible depth table; open markers distinguish unavailable depth from recorded zero.",
      "Vlak Select provides a 44px trigger and listbox for exact supplied genomic positions. Selected depth, base and strand counts use description lists.",
      "Non-finite, negative and non-integer counts are unavailable; missing counts are explicitly not supplied.",
      "At most 16 base symbols are displayed per selected locus. Invalid or oversized locus windows are reported without truncation.",
      "The figure ref and native attributes pass through; selection supports controlled values and native form reset."
    ],
    "aliases": [
      "Read depth inspector",
      "Per-base coverage",
      "Strand count inspector",
      "Locus coverage",
      "Genomic depth plot"
    ]
  },
  {
    "name": "genomic-region-field",
    "title": "Genomic region field",
    "description": "Collects a reference, contig and validated integer interval with an explicit one-based inclusive coordinate convention and native form submission.",
    "category": "science",
    "classes": [
      "rs-genomic-region-field",
      "rs-genomic-region-field-legend",
      "rs-genomic-region-field-fields",
      "rs-genomic-region-field-label",
      "rs-genomic-region-field-control",
      "rs-genomic-region-field-copy"
    ],
    "css": [
      "components/genomic-region-field.css"
    ],
    "react": "components/genomic-region-field.tsx",
    "registryDependencies": ["input", "select", "dropdown-menu"],
    "snippet": "<fieldset class=\"rs-genomic-region-field\"><legend class=\"rs-genomic-region-field-legend\">Region</legend><p class=\"rs-genomic-region-field-copy\">Reference: Example reference</p><p class=\"rs-genomic-region-field-copy\">1-based, inclusive. Both start and end are included.</p><div class=\"rs-genomic-region-field-fields\"><div class=\"rs-genomic-region-field-label\"><span id=\"genomic-contig-label\">Contig</span><div class=\"rs-select rs-select-fluid\"><button type=\"button\" class=\"rs-dropdown\" role=\"combobox\" aria-labelledby=\"genomic-contig-label\" aria-expanded=\"false\" aria-haspopup=\"listbox\"><span>chr7</span></button></div></div><label class=\"rs-genomic-region-field-label\">Start<input class=\"rs-input rs-input-full rs-genomic-region-field-control\" type=\"number\" min=\"1\" step=\"1\" name=\"region.start\" value=\"101\" /></label><label class=\"rs-genomic-region-field-label\">End<input class=\"rs-input rs-input-full rs-genomic-region-field-control\" type=\"number\" min=\"1\" step=\"1\" name=\"region.end\" value=\"105\" /></label></div></fieldset>",
    "example": "import { GenomicRegionField } from \"@noorddev/vlak-react\";\n\n<GenomicRegionField label=\"Region\" reference=\"Example reference\" name=\"region\" contigs={[{ id: \"chr7\", length: 100000 }, { id: \"chr8\", length: 80000 }]} defaultValue={{ contig: \"chr7\", start: 101, end: 105 }} required />",
    "usage": {
      "use": [
        "Integer genomic intervals against a fixed caller-supplied reference and explicit contig lengths.",
        "The field always uses one-based inclusive positions, including both endpoints. A one-position region has equal start and end.",
        "name prefixes submitted reference, coordinates, contig, start and end fields. Native form reset restores uncontrolled defaults.",
        "Changing contig keeps the entered integers and revalidates its bounds; no coordinate conversion occurs."
      ],
      "avoid": [
        "Silently converting zero-based half-open intervals or moving coordinates between genome assemblies.",
        "Using guessed contig lengths or clamping invalid coordinates into a different region."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves through the contig, start and end controls."
      },
      {
        "keys": "Arrow keys, typing",
        "does": "Opens and navigates the Vlak contig selector or edits numeric inputs. Enter or Space confirms a contig; Escape closes its menu."
      }
    ],
    "a11y": [
      "A legend and visible labels name the group. Vlak Select and Input provide 44px controls; the coordinate convention is always visible.",
      "Validation rejects partial regions, non-integers, unsafe integers, positions below 1, reversed endpoints and coordinates beyond the supplied contig.",
      "Errors are linked to the controls and participate in native form validity. Invalid values remain editable without clamping.",
      "Missing reference metadata and invalid contig catalogs are explicit; zero never becomes position 1 automatically.",
      "Read-only fields preserve submitted values, disabled fieldsets do not submit, and controlled values remain application-owned."
    ],
    "aliases": [
      "Genome interval input",
      "Genomic coordinates",
      "Contig region input",
      "One-based interval",
      "Genomic location field"
    ]
  }
];
