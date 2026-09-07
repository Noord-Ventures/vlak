/** Shared guidance for people and agents composing specialised software. */
export const domainCollections = [
  {
    name: "civic",
    title: "Civic",
    description: "Components for public services, identity records, tax summaries, benefits, and applications.",
    groups: [
      { title: "Identity and obligations", description: "Keep the record holder, issuer, reporting period, and supplied status together.", components: ["identity-document", "tax-summary"] },
      { title: "Access to services", description: "Explain a programme, follow an application, and collect the required evidence with explicit submission states.", components: ["benefit-program", "application-status", "evidence-checklist"] },
    ],
    contracts: [
      { title: "Supply policy decisions", description: "The service supplies eligibility assessments, amounts, deadlines, and decisions. Components do not calculate tax or determine entitlement to a subsidy." },
      { title: "Display only the identity detail needed", description: "Pass a display-safe masked identifier. Keep full identity records, document verification, and access rules in the host application." },
      { title: "Separate a request from its result", description: "Evidence actions request work from the application. Show pending while saving, confirmed receipt after success, and an actionable error when it fails." },
      { title: "Preserve the public record", description: "Supply the authority, reference, period, dates, and reasons that belong to the record. Missing, unavailable, and zero amounts retain distinct meanings. Examples use fictional services and records." },
    ],
  },
  {
    name: "science",
    title: "Science",
    description: "Components for measurements, physical quantities, microscopy acquisition, sequence inspection, experimental procedures, and spectra.",
    groups: [
      { title: "Measurements and quantities", description: "Keep a measured value with its unit, uncertainty, and source. Capture quantities without silently converting them.", components: ["measurement-value", "quantity-field"] },
      { title: "Experimental work", description: "Select a sample position, follow an experimental run, and inspect a spectrum alongside the underlying values.", components: ["experiment-run", "spectrum-plot"] },
      { title: "Microscopy", description: "Review named stage positions in an explicit coordinate frame, navigate supplied stacks and edit acquisition sequences with declared units.", components: ["stage-position-list", "stack-navigator", "acquisition-sequencer"] },
      { title: "Genomics", description: "Enter a genomic region, inspect supplied sequence alignments and compare exact coverage counts.", components: ["genomic-region-field", "sequence-alignment", "coverage-inspector"] },
    ],
    contracts: [
      { title: "Keep coordinate conventions explicit", description: "Genomic regions and supplied loci use 1-based inclusive coordinates. Alignment selections use 1-based aligned columns, including supplied gap columns. Stack values are zero-based indexes into supplied positions; the displayed ordinal starts at one. Stage positions retain immutable identifiers, supplied frame identity and per-axis units; missing coordinates are not zero. The host owns coordinate conversion and reference identity." },
      { title: "Preserve measurement meaning", description: "Supply the unit, uncertainty label, precision, and provenance that belong to the measurement. A missing value is distinct from zero. The application owns significant-figure rules and scientific interpretation." },
      { title: "Convert explicitly", description: "QuantityField changes the selected unit and amount independently. It does not convert units. Perform validated conversion in the application and update the complete controlled value together." },
      { title: "Keep instrument work outside the view", description: "Stage selection requires controlled value and onValueChange props. Inclusion, order, removal and experiment actions request changes; the host supplies accepted records. Selection never confirms stage motion or acquired frames. The application controls instrument access, execution, persistence and confirmed step status." },
      { title: "Show the evidence behind a plot", description: "Supply finite points, axis labels, units, and any peak annotations. SpectrumPlot provides a data table and does not identify substances, fit peaks, or infer scientific conclusions." },
    ],
  },
  {
    name: "creative",
    title: "Creative tools",
    description: "Controls for professional audio, video, and design workspaces.",
    groups: [
      { title: "Audio", description: "Read channel levels, adjust gain and pan, and control a named parameter with native keyboard input.", components: ["audio-meter", "channel-strip", "parameter-knob", "patchbay"] },
      { title: "Video", description: "Enter a timecode, select a clip, seek through a sequence, and manage render jobs.", components: ["timecode-field", "clip-timeline", "render-queue"] },
      { title: "Design", description: "Select, hide, and lock layers; inspect a colour; and edit independent or linked spacing values.", components: ["layer-stack", "color-inspector", "spacing-control"] },
      { title: "Typography", description: "Compare supplied baseline kerning with per-pair draft offsets in declared font units.", components: ["kerning-pair-editor"] },
    ],
    contracts: [
      { title: "Respect routing and typography context", description: "Patchbay edits a matrix of compatible supplied source and destination ports; the host supplies additional block reasons and confirmed routing. KerningPairEditor keeps missing baseline values distinct from zero and previews only the supplied glyph pair with an additional offset, without rewriting the font or its shaping tables." },
      { title: "Connect controls to an engine", description: "Callbacks express edits and requested actions. The host application owns audio processing, playback, timeline editing, undo history, and render execution. Demo controls update local state." },
      { title: "Declare units and time bases", description: "Audio meter levels use the supplied decibel scale. ClipTimeline uses an explicit seconds or frames unit. TimecodeField supports integer non-drop frame rates from 1 to 99; fractional and drop-frame workflows require a different timecode implementation." },
      { title: "Keep missing data visible", description: "Missing meter levels, unknown job progress, unset colours, and empty spacing values remain distinct from zero. Pass confirmed render status back after cancel or retry actions complete." },
      { title: "Support precise keyboard edits", description: "Parameter controls retain native input semantics. Timeline clips have separate accessible selection controls, and layer visibility and locking use named buttons. Geometry and swatches accompany readable values." },
    ],
  },
  {
    name: "engineering",
    title: "Industrial",
    description: "Controls for operator alarms and machining coordinate records.",
    groups: [
      { title: "Industrial operations", description: "Review alarm lifecycle fields and prepare fixture offsets alongside actual controller readings.", components: ["alarm-panel", "work-offset-panel"] },
    ],
    contracts: [
      { title: "Preserve independent states", description: "Alarm condition, acknowledgement and shelving are independent. Unknown states remain distinct from inactive states." },
      { title: "Separate drafts from controller readings", description: "WorkOffsetPanel shows host-supplied machine and work coordinates, active system and offset state. Changing a draft does not infer new positions, activate another system or zero suspended offsets. The host supplies offsets for each selected system." },
      { title: "Confirm actions in the host", description: "Callbacks request alarm actions or an offset update. The application owns permissions, controller access, machine interlocks, audit records, persistence and confirmed results. These examples use local state and supplied fictional readings." },
    ],
  },
  {
    name: "geospatial",
    title: "Geospatial",
    description: "Controls for coordinate reference assignment, datum transformation selection and raster band configuration.",
    groups: [
      { title: "Coordinates and transformations", description: "Keep coordinate values, axis order and reference identity together; select a supplied transformation with its accuracy and grid availability.", components: ["coordinate-reference-field", "datum-transform-picker"] },
      { title: "Raster display", description: "Assign source bands to display channels and edit explicit stretch bounds without modifying source pixels.", components: ["raster-band-mixer"] },
    ],
    contracts: [
      { title: "Assignment is distinct from reprojection", description: "Changing the selected reference leaves entered coordinates unchanged. The host owns validated reprojection, axis-order conversion, reference lookup and any transformation grid files." },
      { title: "Explain unavailable transformations", description: "Supply source and destination references, candidate operations, accuracy labels, area-of-use context and grid availability. Missing prerequisites remain visible with reasons rather than silently selecting a fallback." },
      { title: "Keep rendering in the host", description: "RasterBandMixer emits band and stretch configuration. The application loads pixels, handles no-data values, computes statistics and renders the image. Unit changes and displayed limits never imply a conversion of source values." },
    ],
  },
  {
    name: "robotics",
    title: "Robotics",
    description: "Controls for robot joint targets, recorded poses and mission plans.",
    groups: [
      { title: "State and targets", description: "Inspect independently reported poses and joint readings while editing explicit target values.", components: ["joint-panel", "robot-pose"] },
      { title: "Mission planning", description: "Order supplied mission steps and request actions without inventing execution status.", components: ["robot-mission-queue"] },
    ],
    contracts: [
      { title: "Keep coordinate frames explicit", description: "Every pose belongs to a supplied frame, timestamp and orientation representation. Components display exact values and do not transform frames, normalize quaternions or infer an orientation convention." },
      { title: "Keep reported state separate from targets", description: "Joint targets do not update reported positions. The application supplies joint limits, accepts or rejects target requests and returns confirmed state. Missing limits or readings remain visible." },
      { title: "Execute in the controller", description: "The host owns robot connectivity, permissions, motion planning, collision checks, interlocks and mission execution. Reordering a plan or requesting an action is not evidence that a robot moved." },
    ],
  },
  {
    name: "electronics",
    title: "Circuitry",
    description: "Controls for board pad inspection, design-rule results and assembly variants.",
    groups: [
      { title: "Board inspection", description: "Keep pad identity, nets, layers and geometry together; inspect supplied rule violations with their recorded status.", components: ["pad-inspector", "design-rule-results"] },
      { title: "Assembly variants", description: "Inspect population, bill-of-materials inclusion and placement inclusion independently for every reference and variant.", components: ["assembly-variant-matrix"] },
    ],
    contracts: [
      { title: "Preserve independent assembly flags", description: "Population, bill-of-materials inclusion and placement inclusion are separate supplied flags. An unspecified state is not false and no flag silently rewrites another." },
      { title: "Read geometry without inferring connectivity", description: "Pad numbers, net assignments, layer names, shapes and dimensions come from the board model. Missing data remains explicit; these views do not run a netlist, router or geometry engine." },
      { title: "Keep rule results tied to their source", description: "The host provides violation severity, status, location and available resolution actions. A resolve request does not establish that a board passes its rules; return confirmed results after the board model changes and checks rerun." },
    ],
  },
  {
    name: "microbiology",
    title: "Microbiology",
    description: "Components for well plates, supplied colony annotations and culture observation records.",
    groups: [
      { title: "Plates and annotations", description: "Select a supplied well or colony marker while retaining exact recorded sample and source-count context.", components: ["well-plate", "colony-plate"] },
      { title: "Culture observations", description: "Keep sample identity, supplied medium and condition labels, dated observations and recording actions together.", components: ["culture-log"] },
    ],
    contracts: [
      { title: "Distinguish annotations from source counts", description: "A colony marker is an annotation, not a detected organism. The supplied source count remains separate from marker totals. Missing coordinates or counts are not zero, and no segmentation or colony detection runs in the view." },
      { title: "Preserve observation provenance", description: "The host supplies sample and culture identity, observation timestamps, status and conditions. Sorting requires explicit timestamp offsets; unknown times remain explicit. These components do not infer contamination, species or culture outcomes." },
      { title: "Record through the host", description: "Actions request application work. The host owns recording, audit history and confirmed status. Example cultures and conditions are supplied display records, not laboratory procedures or recommendations." },
    ],
  },
] as const;
