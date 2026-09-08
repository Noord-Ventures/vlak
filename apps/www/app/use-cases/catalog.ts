export const useCases = [
  {
    slug: "agent-interfaces",
    title: "Agent interfaces",
    searchTitle: "React components for AI agent interfaces · Vlak",
    summary: "Compose queues, activity, approvals, prompts, and results without turning the interface into decoration.",
    interfaceSlugs: ["agents", "line"],
    componentNames: ["assistant", "activity-timeline", "command", "progress", "data-table", "textarea", "dialog"],
    principles: [
      "Keep a task, its run state, and the approval that affects it in the same context.",
      "Treat generated output as inspectable content. Preserve selection, copying, provenance, and failure states.",
      "Separate a request from confirmed execution. The host application owns models, tools, permissions, and persistence.",
    ],
  },
  {
    slug: "data-heavy-software",
    title: "Data-heavy software",
    searchTitle: "React components for data-heavy dashboards · Vlak",
    summary: "Build dense working views with tables, filters, status, charts, and record inspectors.",
    interfaceSlugs: ["press", "night", "orbit"],
    componentNames: ["data-table", "filter-bar", "description-list", "badge", "progress", "bar-chart", "drawer"],
    principles: [
      "Keep filters close to the records they change and preserve the selected record when the result set changes.",
      "Expose exact values beside visual summaries. Missing, zero, delayed, and unavailable remain different states.",
      "On narrow screens, move from overview to a focused record instead of compressing every column.",
    ],
  },
  {
    slug: "scientific-software",
    title: "Scientific software",
    searchTitle: "React components for scientific software · Vlak",
    summary: "Represent measurements, coordinates, sequences, experiments, and acquisition plans with explicit units and provenance.",
    interfaceSlugs: ["microscopy", "genome", "protein", "microbiology"],
    componentNames: ["measurement-value", "quantity-field", "experiment-run", "spectrum-plot", "sequence-alignment", "stack-navigator"],
    principles: [
      "Keep units, uncertainty, coordinate frames, timestamps, and source identity attached to the value they qualify.",
      "Do not infer scientific meaning in the view. Display supplied records and send explicit requests back to the host.",
      "Make the evidence behind plots and summaries available as readable values or tables.",
    ],
  },
  {
    slug: "healthcare-software",
    title: "Healthcare software",
    searchTitle: "Accessible React components for healthcare software · Vlak",
    summary: "Compose care plans, appointments, observations, and patient records with legible state and careful data boundaries.",
    interfaceSlugs: ["patient"],
    componentNames: ["appointment-card", "care-plan", "health-metric", "check-in", "medication-schedule", "observation-chart"],
    principles: [
      "Present supplied clinical records without diagnosing, recommending, or silently changing their meaning.",
      "Keep author, time, unit, status, and uncertainty visible where they affect interpretation.",
      "Actions request work from the host application. Confirm completion only after the host returns it.",
    ],
  },
  {
    slug: "industrial-software",
    title: "Industrial software",
    searchTitle: "React components for industrial dashboards · Vlak",
    summary: "Build operator views for alarms, machine coordinates, circuitry, robotics, and controlled actions.",
    interfaceSlugs: ["robotics", "circuitry"],
    componentNames: ["alarm-panel", "work-offset-panel", "joint-panel", "robot-pose", "robot-mission-queue", "design-rule-results"],
    principles: [
      "Separate reported state, edited targets, requested actions, and confirmed outcomes.",
      "Preserve interlocks, permissions, coordinate frames, and audit rules in the host system.",
      "Selection must remain legible without color and every critical state needs readable text.",
    ],
  },
] as const;

export type UseCaseSlug = (typeof useCases)[number]["slug"];

export function findUseCase(slug: string) {
  return useCases.find(useCase => useCase.slug === slug);
}
