export const careStudies = [
  {
    slug: "identity",
    title: "Identity application",
    voice: "Make each requirement and the next step clear.",
    law: "A resident document application with saved details, sample evidence, and a local receipt.",
    story: "A fictional municipal service that guides an applicant through their details, supporting evidence, and a final review. A quiet progress rail keeps the full process visible while the working screen concentrates on one decision at a time. The resulting receipt belongs to this browser, with no government submission or identity verification.",
    what: "Identity application",
    type: "Applicant form, evidence checklist, review, receipt",
    module: "Grid system",
    ink: "Paper fields, an ink document specimen, and a full-surface current step.",
    use: "Complete the applicant details → attach sample evidence → review → create a local receipt",
    field: "A process rail beside a focused form, with the primary action pinned below its scrolling content.",
    note: "Use the fictional applicant or edit the sample fields. Add and remove sample evidence, return to earlier steps, and create a local receipt. The draft is saved in this browser when local storage is available; no information is sent to a government service.",
    components: ["Application status", "Button", "Card", "Checkbox", "Evidence checklist", "Icon", "Identity document", "Input", "Select"],
    modifications: [
      "Input and Select form the applicant screen. Native validation gates the next step; the same draft survives step changes and reloads when browser storage is available.",
      "Evidence checklist actions attach named fictional records. The application owns their state and permits removal before review; the component never claims upload or verification.",
      "Identity document becomes a clearly marked specimen inside a square review region. Application status records the local receipt and explicitly keeps government submission outside the demo.",
    ],
  },
  {
    slug: "patient",
    title: "Patient dashboard",
    voice: "Keep daily records close to the next conversation.",
    law: "A personal care overview with recorded readings, visit preparation, and local care notes.",
    story: "A fictional patient space that separates the daily overview from detailed readings and care records. Personal activity goals share the overview with the next sample appointment. Visit preparation opens a focused note editor, and care tasks retain their own recorded state without implying a clinical update.",
    what: "Patient dashboard",
    type: "Overview, readings, care, visit preparation",
    module: "Grid system",
    ink: "An editorial welcome, quiet hairlines, and monochrome activity rings.",
    use: "Explore the overview → inspect readings or care → prepare a visit and save a local note",
    field: "A compact navigation rail beside a reading surface, with a focused detail screen for visit preparation.",
    note: "All people, measurements, goals, medication entries, and appointments are fictional. Record a sample dose, complete a care task, or save a visit note and preference locally. No clinical record, appointment booking, or message is sent.",
    components: ["Activity rings", "Appointment card", "Button", "Card", "Care plan", "Health metric", "Icon", "Lab results", "Medication schedule", "Patient banner", "Select", "Textarea"],
    modifications: [
      "Patient banner establishes the fictional record, while Health metric and Activity rings display supplied readings and personal targets without calculating a health score.",
      "Lab results lives on a separate reading screen. Medication schedule and Care plan keep explicit sample record states and pass changes into local application storage.",
      "Appointment card opens a focused preparation form built with Select and Textarea. Saving changes only the local note and contact preference; the appointment's supplied status stays separate.",
    ],
  },
] as const;

export const careMobilePatterns = {
  identity: "At 640px and below, the desktop process rail becomes a compact step indicator. Applicant, evidence, review, and receipt occupy one focused screen with an independently scrolling body and pinned Back and Continue actions. Inputs remain 16px and controls at least 44px at 320px wide.",
  patient: "At 640px and below, Overview, Readings, and Care move into bottom navigation. A selected visit replaces those screens with its own Back header, scrolling note form, and pinned save action. Returning restores the invoking control and keeps local records intact.",
} as const;
