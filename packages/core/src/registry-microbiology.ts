import type { VlakComponent } from "./schema";

export const microbiologyComponents: VlakComponent[] = [
  {
    "name": "colony-plate",
    "title": "Colony plate",
    "category": "microbiology",
    "description": "A bounded plate diagram and keyboard-selectable list of supplied colony markers, with the source count kept separate from annotation totals.",
    "snippet": "<figure class=\"rs-colony-plate\"><figcaption class=\"rs-colony-plate-title\">Colony annotations</figcaption><p class=\"rs-colony-plate-count\">Source count: 12</p><p class=\"rs-colony-plate-copy\">1 marker records supplied; 1 positioned</p><ol class=\"rs-colony-plate-list\" aria-label=\"Supplied marker records\"><li class=\"rs-colony-plate-record\"><div class=\"rs-colony-plate-static\">1. Colony 01</div><p class=\"rs-colony-plate-copy\">x 28%, y 32%</p></li></ol></figure>",
    "example": "import { ColonyPlate } from \"@noorddev/vlak-react\";\n\n<ColonyPlate label=\"Colony annotations\" plateId=\"P-042\" recordedCount={12} source=\"Imported source count and four annotated records\" markers={[\n  { id: \"c1\", label: \"Colony 01\", x: 28, y: 32, description: \"Source annotation: circular outline\" },\n  { id: \"c2\", label: \"Colony 02\", x: 62, y: 26, description: \"Source annotation: raised center\" },\n  { id: \"c3\", label: \"Colony 03\", x: 55, y: 68 },\n  { id: \"c4\", label: \"Colony 04\", x: null, y: null },\n]} defaultValue=\"c2\" />",
    "usage": {
      "use": [
        "Inspect supplied colony annotations and source counts without running an image analysis algorithm.",
        "recordedCount is the original source count. The exact number of supplied marker records and positioned records are labelled separately; neither substitutes for the source count.",
        "Supply unique marker identifiers and normalized x/y percentages from the upper left. The circular plate has center 50, 50 and radius 50.",
        "Select a record using value and onValueChange, or use defaultValue for local selection. Native form reset restores uncontrolled selection. readOnly keeps the same record list without selection controls."
      ],
      "avoid": [
        "Inferring a colony count from marker records, missing annotations or a blank diagram.",
        "Identifying organisms, segmenting images or suggesting culture procedures from these records.",
        "Supplying more than 256 markers; the component reports the bound without showing a partial list."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves through enabled record-selection buttons and the clear-selection button."
      },
      {
        "keys": "Enter, Space",
        "does": "Selects the focused supplied record or clears the selection; controlled selection waits for the host."
      }
    ],
    "a11y": [
      "The figure caption names the plate. The decorative diagram is paired with a complete ordered list of record labels, exact coordinates and supplied descriptions.",
      "Missing, non-finite and out-of-dish positions retain their list records and have explicit availability text. Only positioned markers are drawn; their exact number is shown.",
      "Every control is at least 44px with a visible focus ring. Selected record buttons use a full fill and aria-pressed, including in forced colors.",
      "Source count zero remains zero. Missing source counts and invalid negative or unsafe counts receive separate text; no count is inferred from the diagram.",
      "Duplicate or empty identifiers and oversized inputs produce an explanation. Native attributes, figure ref, className and style pass through. Selection buttons do not submit forms."
    ],
    "aliases": [
      "Colony annotations",
      "Petri dish map",
      "Colony record viewer",
      "Agar plate annotations",
      "Plate colony inspector"
    ],
    "classes": [
      "rs-colony-plate",
      "rs-colony-plate-title",
      "rs-colony-plate-copy",
      "rs-colony-plate-count",
      "rs-colony-plate-body",
      "rs-colony-plate-graphic",
      "rs-colony-plate-dish",
      "rs-colony-plate-list",
      "rs-colony-plate-record",
      "rs-colony-plate-static",
      "rs-colony-plate-details",
      "rs-colony-plate-clear",
      "rs-colony-plate-marker",
      "rs-colony-plate-chosen",
      "rs-colony-plate-control",
      "rs-colony-plate-selected"
    ],
    "css": [
      "components/colony-plate.css"
    ],
    "react": "components/colony-plate.tsx",
    "registryDependencies": ["button"]
  },
  {
    "name": "culture-log",
    "title": "Culture log",
    "category": "microbiology",
    "description": "A culture and sample record with supplied medium, conditions, chronological observations and host-owned recording actions.",
    "snippet": "<div class=\"rs-culture-log\" role=\"group\" aria-label=\"Culture observations\"><div class=\"rs-culture-log-head\"><p class=\"rs-culture-log-title\">Culture observations</p><span class=\"rs-culture-log-copy\">Awaiting record review</span></div><dl class=\"rs-culture-log-metadata\"><div><dt class=\"rs-culture-log-copy\">Culture</dt><dd class=\"rs-culture-log-value\">C-042</dd></div><div><dt class=\"rs-culture-log-copy\">Sample</dt><dd class=\"rs-culture-log-value\">S-042</dd></div><div><dt class=\"rs-culture-log-copy\">Medium</dt><dd class=\"rs-culture-log-value\">Agar medium A</dd></div></dl><ol class=\"rs-culture-log-list\"><li class=\"rs-culture-log-observation\"><time class=\"rs-culture-log-time\" datetime=\"2026-09-07T09:00:00+02:00\">7 September, 09:00</time><div class=\"rs-culture-log-content\"><p class=\"rs-culture-log-observation-label\">Sample record received</p></div></li></ol></div>",
    "example": "import { useState } from \"react\";\nimport { CultureLog } from \"@noorddev/vlak-react\";\n\nfunction CultureRecord() {\n  const [reviewed, setReviewed] = useState(false);\n  return <CultureLog label=\"Culture observations\" cultureId=\"C-042\" sampleId=\"S-042\" medium=\"Agar medium A\" status={reviewed ? \"Record review noted\" : \"Awaiting record review\"} conditions={[{ id: \"batch\", label: \"Medium batch\", value: \"M-17\" }]} observations={[\n    { id: \"received\", label: \"Sample record received\", dateTime: \"2026-09-07T09:00:00+02:00\", timeLabel: \"7 September, 09:00\", status: \"Recorded\" },\n    { id: \"image\", label: \"Plate image attached\", dateTime: \"2026-09-07T10:30:00+02:00\", timeLabel: \"7 September, 10:30\", status: \"Recorded\", notes: \"Image and source annotations attached\" },\n  ]} actions={reviewed ? [] : [{ id: \"review\", label: \"Record review\" }]} onAction={() => setReviewed(true)} />;\n}",
    "usage": {
      "use": [
        "Review culture identity, sample identity, medium and conditions as supplied by the host.",
        "Provide offset-bearing timestamps for chronological ordering. Equal timestamps retain their supplied order; missing and invalid timestamps sort after dated observations.",
        "Supply actions and onAction to request recording changes. Update status or observations only when the host has accepted the change; pending disables actions without changing recorded state.",
        "Use oldest or newest ordering for at most 256 observations, 32 conditions and 16 actions with unique non-empty identifiers."
      ],
      "avoid": [
        "Inferring organism identity, contamination, growth interpretation or culture success from a status or observation.",
        "Generating a culture recipe, an incubation recommendation or a procedure from the displayed conditions.",
        "Treating a requested recording action as confirmation that a laboratory procedure occurred."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves between supplied links and enabled recording actions."
      },
      {
        "keys": "Enter, Space",
        "does": "Requests the focused action through onAction without submitting a surrounding form."
      }
    ],
    "a11y": [
      "A named group contains a description list for metadata and an ordered list of observations. Every valid dated observation has a native time element.",
      "Missing times and malformed dates remain explicitly undated. Dates without an offset and impossible calendar dates are not silently reinterpreted.",
      "Zero-valued conditions remain visible; empty values and non-finite numeric conditions have explicit availability labels. Supplied statuses remain unchanged during pending requests.",
      "Recording actions have 44px targets and visible focus rings. Their names include the culture identity and their descriptions reference the supplied status.",
      "Oversized or ambiguous record collections have a visible explanation instead of a partial timeline. The div ref, native attributes, className and style pass through."
    ],
    "aliases": [
      "Culture notebook",
      "Culture observations",
      "Microbiology log",
      "Culture record",
      "Sample culture history"
    ],
    "classes": [
      "rs-culture-log",
      "rs-culture-log-head",
      "rs-culture-log-title",
      "rs-culture-log-copy",
      "rs-culture-log-metadata",
      "rs-culture-log-value",
      "rs-culture-log-list",
      "rs-culture-log-observation",
      "rs-culture-log-time",
      "rs-culture-log-content",
      "rs-culture-log-observation-label",
      "rs-culture-log-notes",
      "rs-culture-log-actions",
      "rs-culture-log-action"
    ],
    "css": [
      "components/culture-log.css"
    ],
    "react": "components/culture-log.tsx",
    "registryDependencies": ["button"]
  }
];
