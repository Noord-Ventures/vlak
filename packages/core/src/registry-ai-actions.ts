import type { VlakComponent } from "./schema";

/** Application-owned tool activity and explicit action approval. */
export const aiActions: VlakComponent[] = [
  {
    name: "tool-call",
    title: "Tool call",
    description: "Shows tool input, output, and execution state in a native disclosure with a subtle 1px outline, 4px corners, and a 44px summary.",
    category: "ai",
    classes: ["rs-tool-call", "rs-tool-call-summary", "rs-tool-call-title", "rs-tool-call-state", "rs-tool-call-indicator", "rs-tool-call-body", "rs-tool-call-section", "rs-tool-call-label", "rs-tool-call-value", "rs-tool-call-code", "rs-tool-call-error"],
    css: ["components/tool-call.css"],
    react: "components/tool-call.tsx",
    registryDependencies: [],
    snippet: '<details class="rs-tool-call" open><summary class="rs-tool-call-summary"><span class="rs-tool-call-title">Search documents</span><span class="rs-tool-call-state" role="status">Complete</span><svg class="rs-tool-call-indicator" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg></summary><div class="rs-tool-call-body"><div class="rs-tool-call-section"><p class="rs-tool-call-label">Output</p><pre class="rs-tool-call-code">Three matching documents</pre></div></div></details>',
    example: 'import { ToolCall } from "@noorddev/vlak-react";\n\n<ToolCall title="Search documents" state="complete" input={JSON.stringify({ query: "Renewal terms" }, null, 2)} output="Three matching documents" defaultOpen />',
    usage: {
      use: ["Showing application-supplied tool activity within a conversation.", "Queued, running, complete, or error states with optional input, output, and additional content."],
      avoid: ["Executing a tool or granting permission; the application owns execution and authorization.", "Passing raw objects or booleans as display content; serialize them or use your own renderer."],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the native disclosure summary and any interactive content when expanded." },
      { keys: "Enter, Space", does: "Requests expansion or collapse through the browser's native summary behavior." },
    ],
    a11y: [
      "The native details and summary expose expansion state. The summary has a 44px minimum target and visible focus outline.",
      "The decorative 16px chevron points right when closed and down when open. Forced colors retain a system color outline and readable controls.",
      "State is visible text in a polite status; error text has an alert role. No color is needed to distinguish states.",
      "Strings and numbers are rendered as escaped preformatted text. Empty strings and zero are retained; React nodes remain application-rendered content.",
      "open is authoritative when controlled; onOpenChange reports requested changes. defaultOpen sets the initial uncontrolled state. The ref reaches details and native attributes pass through.",
      "The component displays the supplied execution state and never runs a tool itself.",
    ],
    aliases: ["ToolCall", "AI Elements Tool", "Tool invocation", "Tool result", "Function call"],
  },
  {
    name: "confirmation",
    title: "Confirmation",
    description: "Collects approval or rejection in a surface with a subtle 1px outline and 4px corners, with async recording, error recovery, and 44px actions.",
    category: "ai",
    classes: ["rs-confirmation", "rs-confirmation-title", "rs-confirmation-context", "rs-confirmation-actions", "rs-confirmation-action", "rs-confirmation-status", "rs-confirmation-error"],
    css: ["components/confirmation.css"],
    react: "components/confirmation.tsx",
    registryDependencies: ["button"],
    snippet: '<section class="rs-confirmation" aria-labelledby="approval-title"><p id="approval-title" class="rs-confirmation-title">Include the appendix?</p><div class="rs-confirmation-context">Adds the supplied appendix to the proposed draft.</div><div class="rs-confirmation-actions"><button class="rs-btn-primary rs-confirmation-action" type="button">Confirm</button><button class="rs-btn-ghost rs-confirmation-action" type="button">Reject</button></div><p class="rs-confirmation-status" role="status">Awaiting your decision</p></section>',
    example: "import { Confirmation } from \"@noorddev/vlak-react\";\n\nexport function AppendixApproval({ recordApproval }: {\n  recordApproval: (approved: boolean) => void | Promise<void>;\n}) {\n  return <Confirmation title=\"Include the appendix?\" onConfirm={() => recordApproval(true)} onReject={() => recordApproval(false)}>\n    Adds the supplied appendix to the proposed draft. Review it before continuing.\n  </Confirmation>;\n}",
    usage: {
      use: ["Reviewing a proposed action before the application proceeds.", "Awaiting successful recording of approval or rejection, with a retry when its callback fails."],
      avoid: ["Treating approval recorded as proof that the proposed action has executed.", "Authorizing solely in the browser; application and server code must validate the requested action and its permissions."],
    },
    keyboard: [
      { keys: "Tab", does: "Moves between Confirm and Reject while a decision can be made." },
      { keys: "Enter, Space", does: "Activates the focused decision or retry button without submitting an enclosing form." },
    ],
    a11y: [
      "A native section is named by the visible title. Children supply context for the proposed action.",
      "Pending recording exposes aria-busy, disables both actions, and prevents duplicate callback submissions.",
      "Only a successful callback records accepted or rejected status. A failed callback leaves the proposal pending, reports an alert, and offers Try again for that decision.",
      "status and onStatusChange support application-controlled decisions; defaultStatus sets the uncontrolled initial decision. A changed controlled status invalidates an older pending callback result.",
      "A successfully recorded controlled decision stays locked until status changes. Use a new React key for a new proposal; a pending prop alone cannot resubmit an acknowledged decision.",
      "The status announces Approval recorded or Rejected. This component records a decision; application code owns tool execution. The ref reaches the section, and native attributes pass through.",
    ],
    aliases: ["Confirmation", "AI Elements Confirmation", "Tool approval", "Action approval", "Human in the loop"],
  },
];
