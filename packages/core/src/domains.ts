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
    description: "Components for measurements, physical quantities, laboratory plates, experimental procedures, and spectra.",
    groups: [
      { title: "Measurements and quantities", description: "Keep a measured value with its unit, uncertainty, and source. Capture quantities without silently converting them.", components: ["measurement-value", "quantity-field"] },
      { title: "Experimental work", description: "Select a sample position, follow an experimental run, and inspect a spectrum alongside the underlying values.", components: ["well-plate", "experiment-run", "spectrum-plot"] },
    ],
    contracts: [
      { title: "Preserve measurement meaning", description: "Supply the unit, uncertainty label, precision, and provenance that belong to the measurement. A missing value is distinct from zero. The application owns significant-figure rules and scientific interpretation." },
      { title: "Convert explicitly", description: "QuantityField changes the selected unit and amount independently. It does not convert units. Perform validated conversion in the application and update the complete controlled value together." },
      { title: "Keep instrument work outside the view", description: "Plate selections and experiment actions emit intent. The application controls sample records, instrument access, execution, persistence, and confirmed step status." },
      { title: "Show the evidence behind a plot", description: "Supply finite points, axis labels, units, and any peak annotations. SpectrumPlot provides a data table and does not identify substances, fit peaks, or infer scientific conclusions." },
    ],
  },
  {
    name: "creative",
    title: "Creative tools",
    description: "Controls for professional audio, video, and design workspaces.",
    groups: [
      { title: "Audio", description: "Read channel levels, adjust gain and pan, and control a named parameter with native keyboard input.", components: ["audio-meter", "channel-strip", "parameter-knob"] },
      { title: "Video", description: "Enter a timecode, select a clip, seek through a sequence, and manage render jobs.", components: ["timecode-field", "clip-timeline", "render-queue"] },
      { title: "Design", description: "Select, hide, and lock layers; inspect a colour; and edit independent or linked spacing values.", components: ["layer-stack", "color-inspector", "spacing-control"] },
    ],
    contracts: [
      { title: "Connect controls to an engine", description: "Callbacks express edits and requested actions. The host application owns audio processing, playback, timeline editing, undo history, and render execution. Demo controls update local state." },
      { title: "Declare units and time bases", description: "Audio meter levels use the supplied decibel scale. ClipTimeline uses an explicit seconds or frames unit. TimecodeField supports integer non-drop frame rates from 1 to 99; fractional and drop-frame workflows require a different timecode implementation." },
      { title: "Keep missing data visible", description: "Missing meter levels, unknown job progress, unset colours, and empty spacing values remain distinct from zero. Pass confirmed render status back after cancel or retry actions complete." },
      { title: "Support precise keyboard edits", description: "Parameter controls retain native input semantics. Timeline clips have separate accessible selection controls, and layer visibility and locking use named buttons. Geometry and swatches accompany readable values." },
    ],
  },
] as const;
