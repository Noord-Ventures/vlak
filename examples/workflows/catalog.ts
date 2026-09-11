export type WorkflowSourceRole = "domain" | "adapter" | "transport" | "handler" | "ui" | "test" | "documentation" | "recipe";

export interface WorkflowKitManifest {
  schemaVersion: 1;
  id: "record-review" | "action-approval" | "schedule-editing";
  version: string;
  title: string;
  description: string;
  status: "reference" | "recipe";
  components: string[];
  dependencies: { runtime: string[]; development: string[] };
  compatibility: { node: string; react: string; vlakReact: string };
  adapters: Array<{ id: string; label: string; durability: "memory" | "local-file" | "host-owned"; source: string }>;
  ownership: { kitProvides: string[]; hostProvides: string[]; externalValidationBoundary: string };
  states: { initial: string; values: string[]; terminal: string[] };
  install: { directory: string; commands: string[] };
  run: { commands: string[]; urls?: string[] };
  acceptance: string[];
  sources: Array<{ path: string; role: WorkflowSourceRole }>;
  limitations: string[];
}

export const workflowCatalog = [
  {
    schemaVersion: 1,
    id: "record-review",
    version: "0.1.0",
    title: "Record review",
    description: "A runnable list, edit, review, commit, conflict recovery, history, and bounded undo workflow.",
    status: "reference",
    components: ["Alert", "Badge", "Button", "Dialog", "Field", "Input", "Select", "Spinner", "Textarea"],
    dependencies: { runtime: ["@noorddev/vlak-react", "react", "react-dom"], development: ["@types/node", "@types/react", "@types/react-dom", "typescript", "vite"] },
    compatibility: { node: ">=22.6", react: ">=19", vlakReact: ">=0.4 <1" },
    adapters: [
      { id: "memory", label: "Deterministic memory", durability: "memory", source: "examples/workflows/record-review/adapters/memory.ts" },
      { id: "local-file", label: "Single-process local JSON", durability: "local-file", source: "examples/workflows/record-review/adapters/local-file.ts" },
      { id: "organization", label: "Authenticated organization adapter", durability: "host-owned", source: "examples/workflows/record-review/AUTHENTICATED-ADAPTER.md" },
    ],
    ownership: {
      kitProvides: ["Pure transition validation", "Revision and idempotency contract", "Memory and local file adapters", "HTTP handler and client", "Vlak React composition"],
      hostProvides: ["Authentication", "Organization authorization", "Transactional shared storage", "Business eligibility rules", "Retention and audit policy"],
      externalValidationBoundary: "The AuthenticatedOrganizationAdapter derives scope, actor, and decision permission from trusted server state before the workflow adapter runs.",
    },
    states: { initial: "viewing", values: ["viewing", "editing", "validating", "reviewing", "submitting", "confirmed", "conflict", "outcome-unknown"], terminal: ["confirmed"] },
    install: { directory: "examples/workflows", commands: ["pnpm install --ignore-workspace --ignore-scripts"] },
    run: { commands: ["pnpm server", "pnpm ui"], urls: ["http://127.0.0.1:5174", "http://127.0.0.1:3212/api/records"] },
    acceptance: ["Stale revisions return the current record", "A duplicate command commits once", "Lost responses resolve by idempotency key", "Validation preserves the draft", "Conflicts preserve server and draft values", "Undo refuses a competing revision", "History retains at most 20 entries"],
    sources: [
      { path: "examples/workflows/record-review/domain/types.ts", role: "domain" },
      { path: "examples/workflows/record-review/domain/review.ts", role: "domain" },
      { path: "examples/workflows/record-review/adapters/memory.ts", role: "adapter" },
      { path: "examples/workflows/record-review/adapters/local-file.ts", role: "adapter" },
      { path: "examples/workflows/record-review/transports/http/contract.ts", role: "transport" },
      { path: "examples/workflows/record-review/transports/http/client.ts", role: "transport" },
      { path: "examples/workflows/record-review/handlers/reference/handler.ts", role: "handler" },
      { path: "examples/workflows/record-review/server/node-server.ts", role: "handler" },
      { path: "examples/workflows/record-review/ui/src/record-review-app.tsx", role: "ui" },
      { path: "examples/workflows/record-review/tests/memory.test.ts", role: "test" },
      { path: "examples/workflows/record-review/tests/local-file.test.ts", role: "test" },
      { path: "examples/workflows/record-review/README.md", role: "documentation" },
      { path: "examples/workflows/record-review/HTTP.md", role: "documentation" },
      { path: "examples/workflows/record-review/AUTHENTICATED-ADAPTER.md", role: "documentation" },
    ],
    limitations: ["The local file adapter supports one Node.js process", "The reference server has one fixed local owner", "No account, recovery, organization, or deployment authentication is included"],
  },
  {
    schemaVersion: 1,
    id: "action-approval",
    version: "0.1.0",
    title: "Action approval",
    description: "A runnable recipe that binds a decision to one frozen action payload version.",
    status: "recipe",
    components: ["Confirmation", "DiffViewer", "ToolCall"],
    dependencies: { runtime: [], development: [] },
    compatibility: { node: ">=22.6", react: ">=19", vlakReact: ">=0.4 <1" },
    adapters: [{ id: "record-review", label: "Record-review operation contract", durability: "host-owned", source: "examples/workflows/action-approval/recipe.ts" }],
    ownership: {
      kitProvides: ["Canonical payload snapshot", "Version fingerprint check", "Decision command mapping"],
      hostProvides: ["Authenticated approver", "Durable signed approval", "Idempotent action executor", "Action audit and retention"],
      externalValidationBoundary: "The host authorizes the approver and rechecks the frozen payload immediately before executing the action.",
    },
    states: { initial: "pending", values: ["pending", "approved", "rejected", "executed", "failed"], terminal: ["rejected", "executed"] },
    install: { directory: "examples/workflows", commands: [] },
    run: { commands: ["node --experimental-strip-types action-approval/example.ts"] },
    acceptance: ["Payload changes invalidate approval", "A decision targets the reviewed revision", "Execution remains host-owned and idempotent"],
    sources: [
      { path: "examples/workflows/action-approval/recipe.ts", role: "recipe" },
      { path: "examples/workflows/action-approval/example.ts", role: "recipe" },
      { path: "examples/workflows/action-approval/README.md", role: "documentation" },
      { path: "examples/workflows/record-review/tests/recipes.test.ts", role: "test" },
    ],
    limitations: ["The recipe does not execute actions", "The non-cryptographic fixture fingerprint is a version marker, not an approval signature", "Use the assistant's persisted signed approval path for its live task writes"],
  },
  {
    schemaVersion: 1,
    id: "schedule-editing",
    version: "0.1.0",
    title: "Schedule editing",
    description: "A runnable bounded event-edit recipe using the same revision and idempotency contract.",
    status: "recipe",
    components: ["CalendarPopover", "Scheduler", "TimeField"],
    dependencies: { runtime: [], development: [] },
    compatibility: { node: ">=22.6", react: ">=19", vlakReact: ">=0.4 <1" },
    adapters: [{ id: "record-review", label: "Record-review operation contract", durability: "host-owned", source: "examples/workflows/schedule-editing/recipe.ts" }],
    ownership: {
      kitProvides: ["Bounded event validation", "Record projection", "Revision-checked edit command"],
      hostProvides: ["Calendar ownership", "Provider authorization", "Provider conflict mapping", "Recurrence and attendee semantics"],
      externalValidationBoundary: "The host validates calendar ownership and provider-specific eligibility before applying the revision-checked edit.",
    },
    states: { initial: "editing", values: ["editing", "validating", "reviewing", "submitting", "confirmed", "conflict", "outcome-unknown"], terminal: ["confirmed"] },
    install: { directory: "examples/workflows", commands: [] },
    run: { commands: ["node --experimental-strip-types schedule-editing/example.ts"] },
    acceptance: ["End is after start", "Time zone is recognized", "A write carries expected revision and idempotency key", "Provider conflict remains authoritative"],
    sources: [
      { path: "examples/workflows/schedule-editing/recipe.ts", role: "recipe" },
      { path: "examples/workflows/schedule-editing/example.ts", role: "recipe" },
      { path: "examples/workflows/schedule-editing/README.md", role: "documentation" },
      { path: "examples/workflows/record-review/tests/recipes.test.ts", role: "test" },
    ],
    limitations: ["No recurrence or detached instances", "No attendee, reminder, or provider synchronization", "No ICS round-trip guarantee"],
  },
] as const satisfies readonly WorkflowKitManifest[];

export function getWorkflowKit(id: WorkflowKitManifest["id"]): WorkflowKitManifest | undefined {
  return workflowCatalog.find(kit => kit.id === id);
}
