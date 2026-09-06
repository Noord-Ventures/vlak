import type { VlakComponent } from "./schema";

export const healthObservations: VlakComponent[] = [
  {
    name: "health-metric",
    title: "Health metric",
    description: "A supplied health reading, unit, time and source with explicit pending, unavailable and stale states.",
    category: "health",
    classes: ["rs-health-metric", "rs-health-metric-label", "rs-health-metric-reading", "rs-health-metric-value", "rs-health-metric-unit", "rs-health-metric-status", "rs-health-metric-meta", "rs-health-metric-description"],
    css: ["components/health-metric.css"],
    react: "components/health-metric.tsx",
    registryDependencies: [],
    snippet: `<div class="rs-health-metric" data-status="stale">
  <p class="rs-health-metric-label">Resting heart rate</p>
  <p class="rs-health-metric-reading"><span class="rs-health-metric-value">64</span> <span class="rs-health-metric-unit">bpm</span></p>
  <p class="rs-health-metric-status">Last recorded, stale</p>
  <p class="rs-health-metric-meta"><time datetime="2026-09-05T07:20:00+02:00">5 Sep, 07:20 CEST</time><span>Wrist sensor</span></p>
</div>`,
    example: `import { HealthMetric } from "@noorddev/vlak-react";

<HealthMetric
  label="Resting heart rate"
  value={64}
  unit="bpm"
  status="stale"
  dateTime="2026-09-05T07:20:00+02:00"
  timeLabel="5 Sep, 07:20 CEST"
  source="Wrist sensor"
  description="Waiting for the next device sync"
/>
<HealthMetric label="Sleep duration" status="pending" />`,
    usage: {
      use: ["Patient summaries and wellness dashboards with a known source for each reading.", "Pass status from the application's data policy; the component does not infer freshness.", "Pass timeLabel with the relevant timezone when a human-readable time is needed."],
      avoid: ["Deriving a diagnosis, clinical flag or urgency from the number.", "Using zero as a placeholder for missing data; omit value instead."],
    },
    keyboard: [],
    a11y: ["Visible labels, units, status, source and time accompany the reading.", "Zero is preserved; empty strings and non-finite values become unavailable. Pending and unavailable states suppress any supplied reading.", "Stale values remain visible with a textual stale label. No clinical status is calculated.", "A native time element preserves the supplied machine-readable timestamp. Native attributes and the div ref pass through.", "The component adds no live region or tab stop. The application can announce updates in context."],
    aliases: ["Vital sign", "Vital metric", "Health reading", "Patient observation", "Biometric card", "Wellness metric"],
  },
  {
    name: "reference-range",
    title: "Reference range",
    description: "Positions a supplied numeric reading against caller-supplied reference bounds, with a complete text equivalent.",
    category: "health",
    classes: ["rs-reference-range", "rs-reference-range-head", "rs-reference-range-label", "rs-reference-range-value", "rs-reference-range-track", "rs-reference-range-interval", "rs-reference-range-marker", "rs-reference-range-bounds", "rs-reference-range-bound-value", "rs-reference-range-description"],
    css: ["components/reference-range.css"],
    react: "components/reference-range.tsx",
    registryDependencies: [],
    snippet: `<div class="rs-reference-range">
  <p class="rs-reference-range-head"><span class="rs-reference-range-label">Reported measurement</span><span class="rs-reference-range-value">24 units</span></p>
  <div class="rs-reference-range-track" aria-hidden="true"><span class="rs-reference-range-interval"></span><span class="rs-reference-range-marker" style="inset-inline-start:44%"></span></div>
  <p class="rs-reference-range-bounds"><span>Supplied reference interval</span><span class="rs-reference-range-bound-value">20–30 units</span></p>
</div>`,
    example: `import { ReferenceRange } from "@noorddev/vlak-react";

<ReferenceRange
  label="Reported measurement"
  value={24}
  minimum={20}
  maximum={30}
  unit="units"
  rangeLabel="Supplied reference interval"
/>
<ReferenceRange label="One-sided interval" value={8} maximum={10} unit="units" />`,
    usage: {
      use: ["Display numeric bounds supplied by the responsible laboratory or data source.", "Pass valueLabel to format the reading and rangeLabel to identify the source of the interval.", "One-sided intervals are textual; a marker requires two finite, ordered bounds."],
      avoid: ["Hard-coding a universal normal interval across patients, methods or units.", "Using the marker to indicate a diagnosis, treatment decision or calculated clinical status.", "Comparing a value and bounds expressed in different units."],
    },
    keyboard: [],
    a11y: ["The reading, unit and reference interval are visible as text; decorative geometry is aria-hidden.", "The reference band spans 20% to 80% of the track from the reading direction's start. Outlying markers clamp to the track and have a textual above or below description.", "Missing, non-finite, equal and reversed bounds never produce an invalid marker position. Missing results are named explicitly.", "A one-sided interval is rendered as at least or up to without inventing a second bound.", "The marker remains visible in forced colors. There is no animation, interactive control or clinical classification."],
    aliases: ["Reference interval", "Lab range", "Result range", "Observation range", "Biomarker interval"],
  },
  {
    name: "lab-results",
    title: "Lab results",
    description: "A named collection of supplied laboratory results with units, reference intervals, report times and amendment notes.",
    category: "health",
    classes: ["rs-lab-results", "rs-lab-results-item", "rs-lab-results-head", "rs-lab-results-name", "rs-lab-results-status", "rs-lab-results-reading", "rs-lab-results-reading-label", "rs-lab-results-reading-value", "rs-lab-results-unit", "rs-lab-results-note", "rs-lab-results-time"],
    css: ["components/lab-results.css"],
    react: "components/lab-results.tsx",
    registryDependencies: ["reference-range"],
    snippet: `<ul class="rs-lab-results" aria-label="Latest report">
  <li class="rs-lab-results-item" data-status="amended"><div class="rs-lab-results-head"><p class="rs-lab-results-name">Reported measurement</p><p class="rs-lab-results-status">Amended</p></div><p class="rs-lab-results-reading"><span class="rs-lab-results-reading-label">Result</span><span class="rs-lab-results-reading-value">24 <span class="rs-lab-results-unit">units</span></span></p><p class="rs-lab-results-note">Replaces the earlier report</p></li>
  <li class="rs-lab-results-item" data-status="pending"><div class="rs-lab-results-head"><p class="rs-lab-results-name">Additional analysis</p><p class="rs-lab-results-status">Pending</p></div></li>
</ul>`,
    example: `import { LabResults } from "@noorddev/vlak-react";

<LabResults label="Latest report" results={[
  { id: "reported", name: "Reported measurement", value: 24, unit: "units", minimum: 20, maximum: 30, status: "amended", note: "Replaces the earlier report" },
  { id: "analysis", name: "Additional analysis", status: "pending" },
  { id: "sample", name: "Sample analysis", status: "unavailable", note: "The laboratory did not release a result" },
]} />`,
    usage: {
      use: ["Review numeric and qualitative results from an existing report.", "Supply report states and flags from the source; the component never derives them from a reading.", "Attach note to explain an amendment or unavailable result; provide stable result ids."],
      avoid: ["Calculating diagnoses, critical-result alerts or treatment recommendations.", "Implying that final means clinically normal or that an amended value is the original report.", "Using the synthetic example values as clinical reference intervals."],
    },
    keyboard: [],
    a11y: ["The root is a native list named by label, with one item per result and a forwarded list ref.", "Final, pending, unavailable and amended states are explicit text; caller-supplied flags supplement the report state.", "Pending and unavailable results hide any supplied value. Zero and qualitative result strings remain valid readings.", "Numeric reference intervals reuse ReferenceRange, including its visible text equivalent and invalid-bound handling.", "An amended report without a reading explicitly says result unavailable. No live announcements are added automatically."],
    aliases: ["Laboratory report", "Lab panel", "Test results", "Patient results", "Pathology results", "Diagnostic report"],
  },
  {
    name: "symptom-diary",
    title: "Symptom diary",
    description: "A chronological record of supplied symptoms and intensity descriptions, with notes and 44px native detail disclosures.",
    category: "health",
    classes: ["rs-symptom-diary", "rs-symptom-diary-item", "rs-symptom-diary-time", "rs-symptom-diary-content", "rs-symptom-diary-head", "rs-symptom-diary-symptom", "rs-symptom-diary-intensity", "rs-symptom-diary-body", "rs-symptom-diary-summary", "rs-symptom-diary-actions"],
    css: ["components/symptom-diary.css"],
    react: "components/symptom-diary.tsx",
    registryDependencies: [],
    snippet: `<ol class="rs-symptom-diary" aria-label="Recent symptom entries"><li class="rs-symptom-diary-item">
  <time class="rs-symptom-diary-time" datetime="2026-09-06T09:00:00+02:00">6 Sep, 09:00 CEST</time>
  <div class="rs-symptom-diary-content"><div class="rs-symptom-diary-head"><p class="rs-symptom-diary-symptom">Headache</p><p class="rs-symptom-diary-intensity">Mild, self-reported</p></div><p class="rs-symptom-diary-body">Recorded after breakfast</p><details><summary class="rs-symptom-diary-summary" aria-label="Details for Headache, 6 Sep at 09:00 CEST">Details</summary><p class="rs-symptom-diary-body">No additional context recorded</p></details></div>
</li></ol>`,
    example: `import { SymptomDiary } from "@noorddev/vlak-react";

<SymptomDiary aria-label="Recent symptom entries" order="newest" entries={[
  { id: "morning", symptom: "Headache", dateTime: "2026-09-06T09:00:00+02:00", timeLabel: "6 Sep, 09:00 CEST", intensity: "Mild, self-reported", notes: "Recorded after breakfast", details: "No additional context recorded" },
  { id: "evening", symptom: "Fatigue", dateTime: "2026-09-05T18:30:00+02:00", timeLabel: "5 Sep, 18:30 CEST", intensity: "Noticeable, self-reported", notes: "Recorded at the end of the workday" },
]} />`,
    usage: {
      use: ["Read patient-entered symptom history without converting their descriptions into a diagnosis.", "Supply intensity in words or with a named scale; the component does not create severity categories.", "Use actions for application-owned edit or review controls with accessible names and 44px targets."],
      avoid: ["Triage, diagnosis or urgency inferred from diary text.", "Assuming a missing diary entry means that no symptom occurred.", "Passing ambiguous timestamps; use ISO timestamps with an explicit offset and timeLabel for display."],
    },
    keyboard: [{ keys: "Tab", does: "Focuses each detail summary and any supplied actions" }, { keys: "Enter, Space", does: "Opens or closes a focused native detail disclosure" }],
    a11y: ["A native ordered list preserves chronological structure. Order defaults to newest first and never mutates the supplied entries.", "Equal timestamps retain input order; invalid timestamps sort last and have no invalid datetime attribute.", "Each disclosure has a unique default name combining symptom and display time; detailsLabel can supply a more precise name.", "Native details and summary provide keyboard toggling. Summaries have 44px targets and a 2px focus ring.", "Intensity and context remain readable text. There are no inferred clinical flags or automatic announcements."],
    aliases: ["Symptom journal", "Patient diary", "Symptom history", "Pain diary", "Health journal", "Patient-reported outcomes"],
  },
];
