type Guide = {
  intro: string;
  starter: { href: string; label: string };
  sections: readonly { title: string; paragraphs: readonly string[]; points?: readonly string[] }[];
  next: readonly { href: string; label: string; description: string }[];
};

/** Task guidance stays separate from the small catalog used by navigation. */
export const useCaseGuides: Record<string, Guide> = {
  "product-prototyping": {
    intro: "Vlak is a React design system for product prototyping. It supplies a consistent type scale, neutral surfaces, controls, and layout rules so you can test what a product does before settling every visual detail. Begin with a task someone needs to complete, then use the smallest set of components that lets them do it.",
    starter: { href: "/starters/#ios", label: "Start a foldable prototype" },
    sections: [
      {
        title: "Choose a question",
        paragraphs: [
          "A useful prototype answers something specific: can a person compare two records, recover a failed action, or continue a task when a phone unfolds? Write that question before choosing the screen. Define the starting state, the action, and the observable result. If the task takes several screens, keep the same records and unfinished input between them.",
          "Use an interface study when its behavior is close to your question. The foldable phone tests continuity between outer and inner screens. Calendar tests date selection and editing. CSV reconciliation tests comparison and exception review. Each is a working browser example with its own stated limits.",
        ],
      },
      {
        title: "Keep the difficult states",
        paragraphs: ["A complete-looking screen is only one case. Put representative data into the prototype before evaluating its layout. These cases should be easy to reproduce during a session:"],
        points: [
          "Empty: explain what belongs here and provide the first useful action.",
          "One record and many records: test selection, scanning, long labels, and a narrow viewport.",
          "Loading and partial data: preserve useful content and distinguish pending work from an empty result.",
          "Failure: keep the draft, explain which action failed, and make retry explicit.",
          "Restricted access: show the permitted task without implying that hidden records do not exist.",
        ],
      },
      {
        title: "Carry the decisions forward",
        paragraphs: [
          "The visual constraints are defaults, not restrictions enforced against your application. You can override the tokens, change a component, or copy its source. Keep a record of intentional exceptions so a second team does not have to guess which decisions still apply.",
          "React prototypes can become application code, but a convincing interaction does not supply a backend. Replace sample data with adapters, enforce permissions in your service, define persistence, and test the resulting keyboard and screen-reader paths. Vlak remains a young library; inspect the component and its tests before relying on it for a critical workflow.",
        ],
      },
    ],
    next: [
      { href: "/starters/#calendar", label: "Calendar starter", description: "Start with an editable schedule." },
      { href: "/docs/agents/", label: "Use with an agent", description: "Give your coding tool the same component and token reference." },
      { href: "/docs/choosing-vlak/", label: "Choosing Vlak", description: "Check the fit before adopting the system." },
    ],
  },
  "data-heavy-software": {
    intro: "Vlak provides React components for data-heavy software: tables, filters, record details, charts, and the controls around them. Start with the decision a person must make from the data. The visible columns, units, sorting, and next action should follow from that decision.",
    starter: { href: "/starters/#reconciliation", label: "Start a record comparison" },
    sections: [
      {
        title: "Build a review loop",
        paragraphs: [
          "A useful working view connects four things: the current scope, the result set, the selected record, and its next action. Keep the scope near the table. Open record details without discarding filters or scroll position. After an edit, preserve selection by a stable record identity rather than its position in the current sort order.",
          "The CSV reconciliation study is a concrete starting point. It compares local files using chosen keys, separates matches from exceptions, and lets a person inspect the difference before exporting a result. Duplicate keys stay ambiguous until reviewed. That behavior is more useful to copy than a dashboard full of sample totals.",
        ],
      },
      {
        title: "Make data states distinct",
        paragraphs: ["A blank cell can mean several different things. Define those meanings in your data model and render them deliberately. Do not let a formatter turn them all into zero or a dash."],
        points: [
          "Zero: a measured or calculated value that is exactly zero, with its unit.",
          "Missing: no value was supplied. Keep it separate from an empty result set.",
          "Stale: a known value with its observation time and refresh state.",
          "Unavailable: the source failed or access was denied. Explain which scope is affected.",
          "Pending: the value is still loading or a requested change has not been confirmed.",
        ],
      },
      {
        title: "Test real density",
        paragraphs: [
          "Test long identifiers, mixed units, repeated names, and the widest plausible values. Decide which columns must remain visible and which belong in an inspector. On a phone, give the chosen record a readable screen and a clear return path instead of shrinking the entire desktop table.",
          "Your application owns fetching, server-side filtering, pagination, and any virtualization required by the dataset. A table component alone does not establish a performance budget for thousands of records. Measure the actual data path, preserve keyboard focus during updates, and expose exact values alongside chart summaries.",
          "Keep edits reversible where the workflow allows it. Show validation beside the affected value, retain the original on failure, and distinguish a submitted request from a confirmed change. For shared systems, resolve concurrent edits in the host application and make conflicts visible to the reviewer.",
        ],
      },
    ],
    next: [
      { href: "/workflows/", label: "Workflow kits", description: "Inspect state and adapter contracts for record review and approval." },
      { href: "/docs/accessibility/", label: "Accessibility", description: "Review naming, focus, keyboard behavior, and test coverage." },
      { href: "/use-cases/enterprise-software/", label: "Enterprise software", description: "Connect record work with teams, schedules, and permissions." },
    ],
  },
  "agent-interfaces": {
    intro: "Vlak provides React components for AI product interfaces, including conversations, structured results, activity, and approval controls. Use them to show what the system is doing and what a person can inspect or change. The interface components do not connect a model or execute tools on their own.",
    starter: { href: "/starters/#line", label: "Start an AI conversation" },
    sections: [
      {
        title: "Show the task, not only the reply",
        paragraphs: [
          "A conversation needs more than a composer and message bubbles when work can continue outside the reply. Keep the current task, its status, and any required decision together. For multiple tasks, use a queue with a focused detail view. The person should be able to leave one task, inspect another, and return without losing a draft or the state of a pending approval.",
          "The AI chat study provides conversations, local response templates, an inspector, and Markdown export. The Agents study explores queues and review. Both use sample or local behavior. Start with one of these interaction patterns, then connect your own provider through an adapter with explicit loading, completion, cancellation, and error states.",
        ],
      },
      {
        title: "Separate proposed work from execution",
        paragraphs: ["The host application must enforce permissions and tool boundaries. A confirmation control makes a decision visible; it is not authorization by itself. Keep each stage inspectable:"],
        points: [
          "Proposed: describe the exact action, target, and relevant inputs before asking for approval.",
          "Awaiting review: keep approve and reject available, and invalidate approval if the action changes.",
          "Running: identify the action in progress and provide cancellation when the host supports it.",
          "Completed: report the result returned by the host, with a link or identifier where available.",
          "Failed or interrupted: preserve context and explain whether retry could repeat an external effect.",
        ],
      },
      {
        title: "Keep output usable",
        paragraphs: [
          "People should be able to select, copy, inspect, and export useful output. Put source identity and update time beside retrieved records. Use a widget for structured content such as a schedule or a comparison, with the same loading, empty, and error behavior used elsewhere in the product.",
          "Streaming text needs a stable reading position and a way to stop. Do not move keyboard focus when new content arrives. Announce meaningful state changes without reading every token aloud. Treat generated markup as untrusted content and choose rendering boundaries in the host application.",
          "Vlak's agent documentation serves a different purpose: it helps a coding agent build with the library. It provides the component reference, tokens, registry, and MCP tools. That does not turn a product prototype into a connected assistant; the application still supplies its models, authentication, tools, and storage.",
        ],
      },
    ],
    next: [
      { href: "/ai/widgets/", label: "Widget patterns", description: "Compose records, provider content, and embedded views." },
      { href: "/ai/", label: "AI components", description: "Inspect the components and their integration boundaries." },
      { href: "/docs/agents/", label: "Build with a coding agent", description: "Connect your coding tool to the Vlak reference." },
    ],
  },
};
