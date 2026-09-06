/** Shared composition guidance for the health docs and agent-readable guide. */
export const healthWorkflows = [
  {
    title: "Readings and observations",
    description: "Keep a reading with its unit, source, collection time, and result status. Compare only against the reference interval supplied with that result.",
    components: ["health-metric", "reference-range", "lab-results", "symptom-diary"],
  },
  {
    title: "Daily wellbeing",
    description: "Collect a check-in, record a routine, review a sleep period, and follow a personal activity goal. Keep unrecorded days and gaps visible.",
    components: ["check-in", "habit-tracker", "sleep-timeline", "activity-goal"],
  },
  {
    title: "Care workflows",
    description: "Keep patient identity and recorded context together. Show the supplied medication schedule, appointment details, and care tasks with explicit action states.",
    components: ["patient-banner", "medication-schedule", "appointment-card", "care-plan"],
  },
] as const;

export const healthDataContract = [
  {
    title: "Preserve missing information",
    description: "Zero is a reading. Missing, pending, unavailable, skipped, and not recorded describe different states. Pass the state explicitly and retain the original value.",
  },
  {
    title: "Keep context with a value",
    description: "Supply units, source, collection time, display labels, and the relevant time zone. Format dates in the application so the server and browser show the same appointment or measurement time.",
  },
  {
    title: "Supply clinical meaning",
    description: "The application supplies result flags, reference intervals, medication instructions, and care priorities. These components present that information; they do not calculate diagnoses, recommend doses, or classify a person from a reading.",
  },
  {
    title: "Confirm recorded actions",
    description: "Medication and care-plan callbacks express a requested action. Keep the item pending while saving, show the confirmed state after success, and preserve the prior record when saving fails.",
  },
  {
    title: "Use text as well as geometry",
    description: "Status is written in words. Ranges and timelines include text equivalents. Check-ins use named native choices, and controls retain keyboard access and 44px targets.",
  },
  {
    title: "Connect the product boundary",
    description: "The host application owns identity, access control, persistence, audit history, and any health-record integration. Examples use fictional records and local demonstration state.",
  },
] as const;
